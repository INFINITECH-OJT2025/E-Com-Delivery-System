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

            $verificationLink = url('/auth/verify/' . base64_encode($user->email));
            $otp = $user->otp_code;

            // ✅ Directly use an HTML string instead of `view()`
            $mail->Body = "
                <html>
                <head>
                    <title>Verify Your Email</title>
                </head>
                <body style='font-family: Arial, sans-serif;'>
                    <h2>Hello, {$user->name}!</h2>
                    <p>Thank you for signing up! Use the OTP below to verify your email:</p>
                    <h3 style='background: #007C3D; color: white; padding: 10px; display: inline-block;'>{$otp}</h3>
                    <p>Or click the button below to verify your email:</p>
                    <p>
                        <a href='{$verificationLink}' style='padding: 12px; background: #007C3D; color: white; text-decoration: none; border-radius: 5px;'>Verify Email</a>
                    </p>
                    <p>If you did not sign up, please ignore this email.</p>
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
}
