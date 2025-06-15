<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use App\Models\User;
use App\Helpers\ResponseHelper;
use App\Models\Restaurant;
use Illuminate\Cache\RateLimiter;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Str;
use Google\Client as Google_Client;

class AuthController extends Controller
{

    // ✅ Check if email exists and is verified
    public function checkEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email'
        ]);

        if ($validator->fails()) {
            return ResponseHelper::error("Validation error", 422, $validator->errors());
        }

        $user = User::where('email', $request->email)->first();

        return ResponseHelper::success("Email checked", [
            'exists' => (bool) $user,
            'verified' => $user ? !is_null($user->email_verified_at) : false
        ]);
    }

    // ✅ Register a new user
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone_number' => 'required|digits_between:10,15|unique:users,phone_number',
            'password' => 'required|min:6|confirmed', // ✅ Requires password_confirmation field
        ]);

        if ($validator->fails()) {
            return ResponseHelper::error("Validation error", 422, $validator->errors());
        }

        try {
            DB::beginTransaction();

            $otp = rand(100000, 999999);
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone_number' => $request->phone_number,
                'password' => Hash::make($request->password),
                'role' => 'customer',
                'otp_code' => $otp,
                'otp_expires_at' => now()->addMinutes(10),
            ]);

            $this->sendEmail($user);
            DB::commit();

            return ResponseHelper::success("Verification email and OTP sent successfully. Please verify your email.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Registration Error: " . $e->getMessage());
            return ResponseHelper::error("Something went wrong. Please try again later.", 500);
        }
    }

    // ✅ Verify OTP
    public function verifyOtp(Request $request)
    {
        // ✅ Check if email is nested and extract it
        $data = $request->all();
        if (isset($data['email']) && is_array($data['email'])) {
            $data = $data['email']; // Extract the actual values
        }

        $validator = Validator::make($data, [
            'email' => 'required|email',
            'otp' => 'required|digits:6',
        ]);

        if ($validator->fails()) {
            return ResponseHelper::error("Validation error", 422, $validator->errors());
        }

        $user = User::where('email', $data['email'])->first();

        if (!$user || $user->otp_code !== $data['otp']) {
            return ResponseHelper::error("Invalid OTP", 400);
        }

        if (now()->greaterThan($user->otp_expires_at)) {
            return ResponseHelper::error("OTP expired. Please request a new one.", 400);
        }

        $user->update([
            'email_verified_at' => now(),
            'otp_code' => null,
            'otp_expires_at' => null,
        ]);

        return ResponseHelper::success("Email verified successfully.");
    }

    // ✅ Display verification success page
    public function showVerificationPage(Request $request)
    {
        // Decode the email from the query string
        $decodedEmail = base64_decode($request->email);

        // Fetch the user by the decoded email
        $user = User::where('email', $decodedEmail)->first();

        // If the user doesn't exist, show an error page
        if (!$user) {
            return view('verification_failed');
        }

        // Check if email is already verified
        if ($user->email_verified_at) {
            return view('verification_success'); // Or show a page informing the user the email is already verified
        }

        // Mark email as verified
        $user->update([
            'email_verified_at' => now(),
        ]);

        // Show the success page after successful verification
        return view('verification_success');
    }

    // ✅ Resend OTP
    public function resendVerification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return ResponseHelper::error("Validation error", 422, $validator->errors());
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || $user->email_verified_at) {
            return ResponseHelper::error("Email already verified", 400);
        }

        try {
            DB::beginTransaction();
            $user->update([
                'otp_code' => rand(100000, 999999),
                'otp_expires_at' => now()->addMinutes(10),
            ]);

            $this->sendEmail($user);
            DB::commit();

            return ResponseHelper::success("Verification email and OTP have been resent successfully.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Resend Verification Error: " . $e->getMessage());
            return ResponseHelper::error("Failed to resend verification. Please try again.", 500);
        }
    }

    // ✅ Login with Rate Limiting
    public function login(Request $request, RateLimiter $limiter)
    {
        $key = 'login:' . Str::lower($request->email) . '|' . $request->ip();

        if ($limiter->tooManyAttempts($key, 5)) {
            return ResponseHelper::error("Too many login attempts. Try again in " . $limiter->availableIn($key) . " seconds.", 429);
        }

        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            $limiter->hit($key, 60);
            return ResponseHelper::error("Invalid credentials", 401);
        }

        if (!$user->email_verified_at) {
            return ResponseHelper::error("Email not verified. Please verify via OTP or email link.", 403);
        }

        $token = $user->createToken("auth_token")->plainTextToken;

        return ResponseHelper::success("Login successful", [
            'access_token' => $token,
            'user' => $user->only(['id', 'name', 'email', 'phone_number', 'role', 'email_verified_at']),
        ]);
    }

    // ✅ Logout
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return ResponseHelper::success("Logout successful.");
    }
    // ✅ Send Email (OTP & Verification Link)
    private function sendEmail($user)
    {
        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = env('MAIL_HOST');
            $mail->SMTPAuth = true;
            $mail->Username = env('MAIL_USERNAME');
            $mail->Password = env('MAIL_PASSWORD');
            $mail->SMTPSecure = env('MAIL_ENCRYPTION');
            $mail->Port = env('MAIL_PORT');

            $mail->setFrom(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));
            $mail->addAddress($user->email, $user->name);
            $mail->isHTML(true);
            $mail->Subject = "Verify Your Account - E-Com Delivery System";

            // ✅ Generate secure verification link
            $verificationLink = route('auth.verify', ['email' => base64_encode($user->email)]);

            // ✅ OTP Code
            $otp = $user->otp_code;

            // ✅ Email Body with better HTML structure
            $mail->Body = "
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <meta name='viewport' content='width=device-width, initial-scale=1'>
                <title>Verify Your Email</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        background-color: #f4f4f4;
                        padding: 20px;
                        text-align: center;
                    }
                    .container {
                        background: white;
                        max-width: 500px;
                        margin: auto;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h2 {
                        color: #333;
                    }
                    .otp {
                        background: #007C3D;
                        color: white;
                        font-size: 24px;
                        padding: 10px;
                        border-radius: 5px;
                        display: inline-block;
                        margin: 10px 0;
                    }
                    .verify-button {
                        display: inline-block;
                        background: #007C3D;
                        color: white;
                        padding: 12px 20px;
                        text-decoration: none;
                        font-size: 16px;
                        border-radius: 5px;
                        margin-top: 20px;
                    }
                    .verify-button:hover {
                        background: #00592A;
                    }
                    .footer {
                        margin-top: 20px;
                        font-size: 12px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class='container'>
                    <h2>Hello, {$user->name}!</h2>
                    <p>Thank you for signing up! Use the OTP below to verify your email:</p>
                    <p class='otp'>{$otp}</p>
                    <p>Or click the button below to verify your email:</p>
                    
                    <!-- ✅ Fix for clickable button in email clients -->
                    <table align='center' cellspacing='0' cellpadding='0'>
                        <tr>
                            <td align='center' bgcolor='#007C3D' style='border-radius: 5px;'>
                                <a href='{$verificationLink}' target='_blank' class='verify-button'>Verify Email</a>
                            </td>
                        </tr>
                    </table>

                    <p>If you did not sign up, please ignore this email.</p>

                    <div class='footer'>
                        <p>&copy; " . date('Y') . " E-Com Delivery System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        ";

            $mail->send();
        } catch (Exception $e) {
            Log::error("Email sending failed: " . $mail->ErrorInfo);
        }
    }


    /**
     * ✅ Get Authenticated User Details
     */
    public function me(Request $request)
    {
        $user = $request->user()->load('addresses'); // ✅ Ensure addresses are included
        return ResponseHelper::success("User retrieved", $user);
    }

    public function update(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user->update(['name' => $validated['name']]);

        return ResponseHelper::success('Name updated successfully', $user);
    }
    public function broadcastAuth(Request $request)
    {
        try {
            if (!auth()->check()) {
                Log::error("❌ WebSocket Auth Failed: User not authenticated.");
                return response()->json(["message" => "Unauthorized"], 403);
            }

            $authResponse = Broadcast::auth($request);

            // ✅ Log the successful response
            Log::info("✅ WebSocket Auth Response:", (array) $authResponse);

            return response()->json($authResponse);
        } catch (\Exception $e) {
            // 🚨 Catch any errors and log them
            Log::error("❌ WebSocket Auth Exception: " . $e->getMessage());
            return response()->json(["error" => "Internal Server Error"], 500);
        }
    }

    /**
     * ✅ Send Password Reset Link
     */
    public function sendResetLink(Request $request)
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        // ✅ Generate a secure token
        $token = Str::random(64);

        // ✅ Delete any existing reset request for this email
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // ✅ Insert new token into the database
        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => $token,
            'created_at' => now(),
        ]);

        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = env('MAIL_HOST'); // Example: smtp.gmail.com
            $mail->SMTPAuth = true;
            $mail->Username = env('MAIL_USERNAME');
            $mail->Password = env('MAIL_PASSWORD');
            $mail->SMTPSecure = env('MAIL_ENCRYPTION', 'tls');
            $mail->Port = env('MAIL_PORT', 587);

            $mail->setFrom(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));
            $mail->addAddress($request->email);
            $mail->isHTML(true);
            $mail->Subject = "Reset Your Password";

            $resetLink = url("/reset-password?token=$token&email={$request->email}");
            $mail->Body = "
                <html>
                <body>
                    <h2>Password Reset Request</h2>
                    <p>Click the button below to reset your password:</p>
                    <p>
                        <a href='{$resetLink}' style='padding: 12px; background: #007BFF; color: white; text-decoration: none; border-radius: 5px;'>Reset Password</a>
                    </p>
                    <p>If you did not request this, please ignore this email.</p>
                </body>
                </html>
            ";

            $mail->send();

            return response()->json(['message' => 'Password reset link sent successfully.']);
        } catch (Exception $e) {
            return response()->json(['message' => 'Failed to send email. ' . $mail->ErrorInfo], 500);
        }
    }


    public function showResetForm(Request $request)
    {
        // ✅ Check if token exists in DB
        $tokenExists = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->exists();

        if (!$tokenExists) {
            return redirect()->route('password.reset.form')->with('error', 'Invalid or expired token.');
        }

        return view('auth.reset_password');
    }

    public function resetPassword(Request $request)
    {
        // ✅ Validate input
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'token' => 'required',
            'password' => 'required|min:8|confirmed'
        ]);

        if ($validator->fails()) {
            return redirect()->back()->with('error', 'Password validation failed.');
        }

        // ✅ Check if token exists
        $resetRequest = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$resetRequest) {
            return redirect()->back()->with('error', 'Invalid or expired token.');
        }

        // ✅ Reset password
        $user = User::where('email', $request->email)->first();
        $user->password = Hash::make($request->password);
        $user->save();

        // ✅ Delete used reset token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return redirect()->back()->with('success', 'Password reset successfully! You can now log in.');
    }
    public function registerVendor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone_number' => 'required|digits_between:10,15|unique:users,phone_number',
            'password' => 'required|min:6|confirmed',
            'restaurant_name' => 'required|string|max:255',
            'restaurant_address' => 'required|string',
            'restaurant_phone' => 'required|digits_between:10,15',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'restaurant_category_id' => 'required|exists:restaurant_categories,id',
        ], [
            'restaurant_category_id.exists' => 'The selected restaurant category does not exist.',
            'email.unique' => 'This email is already registered.',
            'phone_number.unique' => 'This phone number is already registered.',
        ]);

        if ($validator->fails()) {
            return ResponseHelper::error("Validation error", 422, $validator->errors());
        }

        try {
            DB::beginTransaction();

            // ✅ Generate OTP for Verification
            $otp = rand(100000, 999999);

            // ✅ Create User (Vendor)
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone_number' => $request->phone_number,
                'password' => Hash::make($request->password),
                'role' => 'restaurant_owner',
                'otp_code' => $otp,
                'otp_expires_at' => now()->addMinutes(10),
            ]);

            if (!$user) {
                throw new \Exception("User creation failed.");
            }

            Log::info('User created successfully', ['user_id' => $user->id]);

            // ✅ Create Restaurant entry
            $restaurant = Restaurant::create([
                'owner_id' => $user->id,
                'name' => $request->restaurant_name,
                'address' => $request->restaurant_address,
                'phone_number' => $request->restaurant_phone,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'restaurant_category_id' => $request->restaurant_category_id,
                'status' => 'closed',
            ]);

            if (!$restaurant) {
                throw new \Exception("Restaurant creation failed.");
            }

            Log::info('Restaurant created successfully', ['restaurant_id' => $restaurant->id]);

            // ✅ Send Email Verification
            $this->sendVendorEmail($user);

            DB::commit();

            return ResponseHelper::success("Vendor account created. Please verify your email.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Vendor Registration Error", ['error' => $e->getMessage()]);
            return ResponseHelper::error("Something went wrong. Please try again later.", 500);
        }
    }


    // ✅ Send Email (OTP & Verification Link) for Vendor
    // ✅ Send Email for Vendor Verification
    private function sendVendorEmail($user)
    {
        try {
            // Create a new instance of PHPMailer
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = env('MAIL_HOST');  // Ensure these variables are set in your .env file
            $mail->SMTPAuth = true;
            $mail->Username = env('MAIL_USERNAME');
            $mail->Password = env('MAIL_PASSWORD');
            $mail->SMTPSecure = env('MAIL_ENCRYPTION');
            $mail->Port = env('MAIL_PORT');

            $mail->setFrom(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));
            $mail->addAddress($user->email, $user->name);
            $mail->isHTML(true);
            $mail->Subject = "Verify Your Vendor Account - E-Com Delivery System";

            // ✅ Generate the secure verification link (No OTP)
            $verificationLink = route('auth.verify', ['email' => base64_encode($user->email)]);

            // HTML email content with the verification button (no OTP)
            $mail->Body = "
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1'>
            <title>Verify Your Vendor Account</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    background-color: #f4f4f4;
                    padding: 20px;
                    text-align: center;
                }
                .container {
                    background: white;
                    max-width: 500px;
                    margin: auto;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                h2 {
                    color: #333;
                }
                .verify-button {
                    display: inline-block;
                    background: #007C3D;
                    color: white;
                    padding: 12px 20px;
                    text-decoration: none;
                    font-size: 16px;
                    border-radius: 5px;
                    margin-top: 20px;
                    cursor: pointer;
                }
                .verify-button:hover {
                    background: #00592A;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class='container'>
                <h2>Hello, {$user->name}!</h2>
                <p>Thank you for registering as a vendor with E-Com Delivery System. To complete your registration, please verify your email by clicking the button below:</p>
                
                <!-- Verify Email Button -->
                <a href='{$verificationLink}' target='_blank' class='verify-button'>
                    Verify Email
                </a>

                <p>If you did not sign up, please ignore this email.</p>

                <div class='footer'>
                    <p>&copy; " . date('Y') . " E-Com Delivery System. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";

            // Send the email
            $mail->send();
        } catch (Exception $e) {
            Log::error("Email sending failed: " . $mail->ErrorInfo);
        }
    }


    public function vendorLogin(Request $request, RateLimiter $limiter)
    {
        $key = 'vendor_login:' . Str::lower($request->email) . '|' . $request->ip();

        if ($limiter->tooManyAttempts($key, 5)) {
            return ResponseHelper::error("Too many login attempts. Try again in " . $limiter->availableIn($key) . " seconds.", 429);
        }

        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            $limiter->hit($key, 60);
            return ResponseHelper::error("Invalid credentials", 401);
        }

        if (!$user->email_verified_at) {
            return ResponseHelper::error("Email not verified. Please verify via OTP or email link.", 403);
        }
        // ✅ Ensure approved
        if (!$user->status == "approved") {
            return ResponseHelper::error("Email not approved.", 403);
        }
        // ✅ Ensure only vendors (restaurant_owners) can log in
        if ($user->role !== 'restaurant_owner') {
            return ResponseHelper::error("Access denied. This login is for restaurant owners only.", 403);
        }

        // Create the token for the vendor
        $token = $user->createToken("vendor_auth_token")->plainTextToken;

        return ResponseHelper::success("Vendor login successful", [
            'access_token' => $token,
            'user' => $user->only(['id', 'name', 'email', 'phone_number', 'role', 'email_verified_at']),
        ]);
    }
    /**
     * 🚀 Rider Registration API
     */
    public function registerRider(Request $request)
    {
        Log::info("🚀 Rider registration initiated", ['email' => $request->email]);

        // ✅ Validate Request
        $validator = Validator::make($request->all(), [
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
            'phone_number'  => 'required|digits_between:10,15|unique:users,phone_number',
            'password'      => 'required|min:6|confirmed',
            'vehicle_type'  => 'required|string|max:50',
            'plate_number'  => 'nullable|string|max:20',
            'profile_image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'license_image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            Log::warning("❌ Rider registration validation failed", ['errors' => $validator->errors()]);
            return ResponseHelper::error("Validation error", 422, $validator->errors());
        }

        try {
            DB::beginTransaction();

            // ✅ Generate Unique Rider ID
            do {
                $riderId = 'RDR-' . now()->format('Y') . rand(1000, 9999);
            } while (User::where('rider_id', $riderId)->exists());

            Log::info("✅ Rider ID generated successfully", ['rider_id' => $riderId]);

            // ✅ Handle Profile Image Upload
            $profileImagePath = $request->hasFile('profile_image')
                ? $request->file('profile_image')->store('uploads/riders', 'public')
                : null;

            Log::info("✅ Profile image uploaded", ['path' => $profileImagePath]);

            // ✅ Handle License Image Upload
            $licenseImagePath = $request->hasFile('license_image')
                ? $request->file('license_image')->store('uploads/riders', 'public')
                : null;

            Log::info("✅ License image uploaded", ['path' => $licenseImagePath]);

            // ✅ Generate OTP for Verification
            $otp = rand(100000, 999999);
            Log::info("✅ OTP generated", ['otp' => $otp]);

            // ✅ Create Rider User
            Log::info("🔄 Creating new rider user...");
            $rider = User::create([
                'name'          => $request->name,
                'email'         => $request->email,
                'phone_number'  => $request->phone_number,
                'password'      => Hash::make($request->password),
                'role'          => 'rider',
                'rider_id'      => $riderId,
                'vehicle_type'  => $request->vehicle_type,
                'plate_number'  => $request->plate_number ?? null,
                'rider_status'  => 'pending', // Default status is pending
                'profile_image' => $profileImagePath,
                'license_image' => $licenseImagePath,
                'otp_code'      => $otp,
                'otp_expires_at' => now()->addMinutes(10),
            ]);

            if (!$rider) {
                DB::rollBack();
                Log::error("❌ Rider creation failed.");
                return ResponseHelper::error("Failed to create rider account.", 500);
            }

            Log::info("✅ Rider registered successfully", ['rider_id' => $rider->id]);

            // ✅ Send Email Verification
            $this->sendRiderEmail($rider);

            DB::commit();

            return ResponseHelper::success("Rider account created. Please verify your email.", [
                'rider_id'      => $rider->rider_id,
                'name'          => $rider->name,
                'email'         => $rider->email,
                'phone_number'  => $rider->phone_number,
                'vehicle_type'  => $rider->vehicle_type,
                'plate_number'  => $rider->plate_number,
                'rider_status'  => $rider->rider_status,
                'profile_image' => $profileImagePath ? asset('storage/' . $profileImagePath) : null,
                'license_image' => $licenseImagePath ? asset('storage/' . $licenseImagePath) : null,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("❌ Rider Registration Error", ['error' => $e->getMessage()]);
            return ResponseHelper::error("Something went wrong. Please try again later.", 500);
        }
    }

    /**
     * ✅ Send Verification Email to Rider
     */
    private function sendRiderEmail($user)
    {
        try {
            Log::info("📧 Sending verification email to rider", ['email' => $user->email]);

            // Create a new instance of PHPMailer
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = env('MAIL_HOST');
            $mail->SMTPAuth = true;
            $mail->Username = env('MAIL_USERNAME');
            $mail->Password = env('MAIL_PASSWORD');
            $mail->SMTPSecure = env('MAIL_ENCRYPTION');
            $mail->Port = env('MAIL_PORT');

            $mail->setFrom(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));
            $mail->addAddress($user->email, $user->name);
            $mail->isHTML(true);
            $mail->Subject = "Verify Your Rider Account - E-Com Delivery System";

            // ✅ Generate Verification Link
            $verificationLink = route('auth.verify', ['email' => base64_encode($user->email)]);

            // Email Body
            $mail->Body = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background: #f4f4f4; text-align: center; padding: 20px; }
                .container { background: white; max-width: 500px; margin: auto; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
                .verify-button { background: #007C3D; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                .verify-button:hover { background: #00592A; }
            </style>
        </head>
        <body>
            <div class='container'>
                <h2>Hello, {$user->name}!</h2>
                <p>To complete your registration as a rider, please verify your email by clicking the button below:</p>
                <a href='{$verificationLink}' target='_blank' class='verify-button'>Verify Email</a>
                <p>If you did not sign up, please ignore this email.</p>
            </div>
        </body>
        </html>";

            // Send the email
            $mail->send();
            Log::info("✅ Verification email sent successfully", ['email' => $user->email]);
        } catch (Exception $e) {
            Log::error("❌ Email sending failed: " . $mail->ErrorInfo);
        }
    }

    public function riderLogin(Request $request, RateLimiter $limiter)
    {
        $key = 'rider_login:' . Str::lower($request->email) . '|' . $request->ip();

        // ✅ Rate limiting (Max 5 attempts per minute)
        if ($limiter->tooManyAttempts($key, 5)) {
            return ResponseHelper::error("Too many login attempts. Try again in " . $limiter->availableIn($key) . " seconds.", 429);
        }

        // ✅ Validate request
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // ✅ Find the user
        $user = User::where('email', $request->email)->first();

        // ✅ Check if user exists & password is correct
        if (!$user || !Hash::check($request->password, $user->password)) {
            $limiter->hit($key, 60);
            return ResponseHelper::error("Invalid credentials", 401);
        }

        // ✅ Ensure email verification
        if (!$user->email_verified_at) {
            return ResponseHelper::error("Email not verified. Please verify via email link.", 403);
        }
        // ✅ Ensure approved
        if ($user->status !== "approved") {
            return ResponseHelper::error("Email not approved by admin.", 403);
        }
        // ✅ Ensure only riders can log in
        if ($user->role !== 'rider') {
            return ResponseHelper::error("Access denied. This login is for riders only.", 403);
        }

        // ✅ Generate authentication token for the rider
        $token = $user->createToken("rider_auth_token")->plainTextToken;

        return ResponseHelper::success("Rider login successful", [
            'access_token' => $token,
            'user' => $user->only(['id', 'name', 'email', 'phone_number', 'role', 'email_verified_at']),
        ]);
    }

    public function adminLogin(Request $request, RateLimiter $limiter)
    {
        $key = 'admin_login:' . Str::lower($request->email) . '|' . $request->ip();

        // ✅ Rate limiting (Max 5 attempts per minute)
        if ($limiter->tooManyAttempts($key, 5)) {
            return ResponseHelper::error("Too many login attempts. Try again in " . $limiter->availableIn($key) . " seconds.", 429);
        }

        // ✅ Validate request
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // ✅ Find the admin user
        $admin = User::where('email', $request->email)->first();

        // ✅ Check if admin exists & password is correct
        if (!$admin || !Hash::check($request->password, $admin->password)) {
            $limiter->hit($key, 60);
            return ResponseHelper::error("Invalid credentials", 401);
        }

        // ✅ Ensure email verification
        if (!$admin->email_verified_at) {
            return ResponseHelper::error("Email not verified. Please verify via email link.", 403);
        }

        // ✅ Ensure only super admins can log in
        if ($admin->role !== 'admin') {
            return ResponseHelper::error("Access denied. This login is for super admins only.", 403);
        }

        // ✅ Generate authentication token for the admin
        $token = $admin->createToken("admin_auth_token")->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Admin login successful',
            'access_token' => $token,
            'admin' => $admin->only(['id', 'name', 'email', 'role', 'email_verified_at']),
        ], 200);
    }

    public function loginWithGoogle(Request $request)
    {
        // ✅ Validate basic user info from frontend
        $request->validate([
            'email' => 'required|email',
            'name' => 'required|string',
        ]);

        $email = $request->email;
        $name = $request->name;

        $user = User::where('email', $email)->first();

        // ✅ Register user if not existing
        if (!$user) {
            try {
                DB::beginTransaction();

                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'phone_number' => '',
                    'password' => Hash::make(Str::random(16)), // Random password (not used)
                    'role' => 'customer',
                    'email_verified_at' => now(),
                ]);

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                return ResponseHelper::error("Error creating user: " . $e->getMessage(), 500);
            }
        }

        // ✅ Issue Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        return ResponseHelper::success("Login successful", [
            'access_token' => $token,
            'user' => $user->only(['id', 'name', 'email', 'phone_number', 'role', 'email_verified_at']),
        ]);
    }

    public function riderLoginWithGoogle(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'name' => 'required|string',
        ]);

        $email = $request->email;
        $name = $request->name;

        $user = User::where('email', $email)->first();

        if (!$user) {
            try {
                DB::beginTransaction();

                // Generate Unique Rider ID
                do {
                    $riderId = 'RDR-' . now()->format('Y') . rand(1000, 9999);
                } while (User::where('rider_id', $riderId)->exists());

                $user = User::create([
                    'name'             => $name,
                    'email'            => $email,
                    'phone_number'     => '',
                    'password'         => Hash::make(Str::random(16)), // Google auth: no manual password
                    'role'             => 'rider',
                    'rider_id'         => $riderId,
                    'vehicle_type'     => null,
                    'plate_number'     => null,
                    'rider_status'     => 'pending',
                    'email_verified_at' => now(),
                ]);

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                return ResponseHelper::error("Error creating rider: " . $e->getMessage(), 500);
            }
        }

        // Check if rider role
        if ($user->role !== 'rider') {
            return ResponseHelper::error("This login is for riders only.", 403);
        }

        // Check if approved
        if ($user->status !== 'approved') {
            return ResponseHelper::error("Your account has not been approved yet.", 403);
        }

        // Issue token
        $token = $user->createToken("rider_auth_token")->plainTextToken;

        return ResponseHelper::success("Rider Google login successful", [
            'access_token' => $token,
            'user' => $user->only(['id', 'name', 'email', 'phone_number', 'role', 'email_verified_at']),
        ]);
    }
    public function changePassword(Request $request)
    {
        $user = Auth::user();

        // Validate input
        $validatedData = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        // Check if current password matches
        if (!Hash::check($validatedData['current_password'], $user->password)) {
            return response()->json(['status' => 'error', 'message' => 'Current password is incorrect.'], 400);
        }

        // Update the password
        $user->password = Hash::make($validatedData['new_password']);
        $user->save();

        return response()->json(['status' => 'success', 'message' => 'Password updated successfully.']);
    }
}
