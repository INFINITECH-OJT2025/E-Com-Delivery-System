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
use Illuminate\Cache\RateLimiter;
use Illuminate\Support\Str;

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

        if (!$user) {
            return ResponseHelper::success("Email not found", ['exists' => false]);
        }

        return ResponseHelper::success("Email checked", [
            'exists' => true,
            'verified' => !is_null($user->email_verified_at)
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

            // Generate a 6-digit OTP and expiration time
            $otp = rand(100000, 999999);
            $otpExpiresAt = now()->addMinutes(10); // OTP expires in 10 minutes

            // Create user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone_number' => $request->phone_number,
                'password' => Hash::make($request->password),
                'role' => 'customer',
                'otp_code' => $otp,
                'otp_expires_at' => $otpExpiresAt,
                'email_verified_at' => null,
            ]);

            // Send OTP & Email Verification in One Email
            $this->sendEmail($user);

            DB::commit();
            return ResponseHelper::success("Verification email and OTP sent successfully. Please verify your email.");
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseHelper::error("Something went wrong. Please try again later.", 500);
        }
    }

    // ✅ Verify Email Link
    public function verifyEmail($token)
    {
        $email = base64_decode($token);
        $user = User::where('email', $email)->first();

        if (!$user) {
            return ResponseHelper::error("Invalid token", 400);
        }

        if ($user->email_verified_at) {
            return ResponseHelper::error("Email already verified", 400);
        }

        $user->update([
            'email_verified_at' => now(),
            'otp_code' => null,
            'otp_expires_at' => null,
        ]);

        return ResponseHelper::success("Email verified successfully.");
    }
    // ✅ Verify OTP & Ensure Email Verification Status
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|digits:6',
        ]);

        if ($validator->fails()) {
            return ResponseHelper::error("Validation error", 422, $validator->errors());
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return ResponseHelper::error("User not found", 404);
        }

        // ✅ Check if email is already verified
        if ($user->email_verified_at) {
            return ResponseHelper::success("Your email is already verified.");
        }

        // ✅ Check if OTP matches
        if ($user->otp_code !== $request->otp) {
            return ResponseHelper::error("Invalid OTP", 400);
        }

        // ✅ Check if OTP is expired
        if (now()->greaterThan($user->otp_expires_at)) {
            return ResponseHelper::error("OTP expired. Please request a new one.", 400);
        }

        // ✅ Update email_verified_at & clear OTP fields
        $user->update([
            'email_verified_at' => now(),
            'otp_code' => null,
            'otp_expires_at' => null,
        ]);

        return ResponseHelper::success("Email verified successfully.");
    }


    // ✅ Send Email (Handles Both OTP & Verification Link)
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

            $verificationLink = url('/auth/verify/' . base64_encode($user->email));
            $otp = $user->otp_code;

            // ✅ Combined OTP & Verification Email
            $mail->Body = "
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center; }
                    .container { max-width: 600px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                    h2 { color: #007C3D; }
                    p { font-size: 16px; color: #555; }
                    .otp { font-size: 24px; font-weight: bold; background: #007C3D; color: #ffffff; padding: 10px; display: inline-block; border-radius: 5px; }
                    .btn {
                        display: inline-block;
                        background-color: #007C3D;
                        color: #ffffff;
                        padding: 12px 20px;
                        text-decoration: none;
                        font-weight: bold;
                        border-radius: 5px;
                        margin-top: 20px;
                    }
                    .footer { font-size: 14px; color: #888; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <h2>Verify Your Account</h2>
                    <p>Hello <strong>{$user->name}</strong>,</p>
                    <p>You can verify your account using either of these methods:</p>
                    <p><strong>Option 1: Enter this OTP in the app:</strong></p>
                    <p class='otp'>{$otp}</p>
                    <p>(This OTP is valid for 10 minutes)</p>
                    <p><strong>Option 2: Click the button below to verify via link:</strong></p>
                    <p>
                        <a href='{$verificationLink}' class='btn'>Verify Email</a>
                    </p>
                    <div class='footer'>© " . date('Y') . " E-Com Delivery System. All Rights Reserved.</div>
                </div>
            </body>
            </html>";

            $mail->send();
        } catch (Exception $e) {
            Log::error("Email sending failed: " . $mail->ErrorInfo);
        }
    }
    public function resendVerification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return ResponseHelper::error("Validation error", 422, $validator->errors());
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return ResponseHelper::error("User not found", 404);
        }

        if ($user->email_verified_at) {
            return ResponseHelper::error("Email is already verified", 400);
        }

        try {
            DB::beginTransaction();

            // ✅ Generate new OTP and expiration time
            $otp = rand(100000, 999999);
            $user->otp_code = $otp;
            $user->otp_expires_at = now()->addMinutes(10); // OTP valid for 10 minutes
            $user->save();

            // ✅ Send both Email Verification Link & OTP together
            $this->sendEmail($user);

            DB::commit();
            return ResponseHelper::success("Verification email and OTP have been resent successfully.");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error resending verification: " . $e->getMessage());
            return ResponseHelper::error("Failed to resend verification. Please try again.", 500);
        }
    }


    // ✅ Login and return API token with Rate Limiting
    public function login(Request $request, RateLimiter $limiter)
    {
        // ✅ Rate limiting key based on user's IP
        $key = 'login:' . Str::lower($request->email) . '|' . $request->ip();

        if ($limiter->tooManyAttempts($key, 5)) {
            return ResponseHelper::error("Too many login attempts. Please try again in " . $limiter->availableIn($key) . " seconds.", 429);
        }

        // ✅ Validate email & password
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return ResponseHelper::error("Validation error", 422, $validator->errors());
        }

        // ✅ Attempt login
        if (!Auth::attempt($request->only('email', 'password'))) {
            $limiter->hit($key, 60); // Increase failed attempt count, resets after 1 minute
            return ResponseHelper::error("Invalid credentials", 401);
        }

        // ✅ Retrieve user
        $user = Auth::user();

        // ✅ Ensure email is verified
        if (!$user->email_verified_at) {
            return ResponseHelper::error("Email not verified. Please verify via OTP or email link.", 403);
        }

        // ✅ Clear failed login attempts after successful login
        $limiter->clear($key);

        // ✅ Generate secure API token
        $token = $user->createToken("API Token")->plainTextToken;

        return ResponseHelper::success("Login successful", [
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'role' => $user->role,
                'email_verified_at' => $user->email_verified_at,
            ],
        ]);
    }
}
