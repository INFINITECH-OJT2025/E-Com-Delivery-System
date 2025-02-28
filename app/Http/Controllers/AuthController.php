<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use App\Models\User;
use App\Helpers\ResponseHelper;
use Illuminate\Support\Facades\Log;

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
            'password' => 'required|min:6|confirmed' // ✅ Requires password confirmation
        ]);

        if ($validator->fails()) {
            return ResponseHelper::error("Validation error", 422, $validator->errors());
        }

        $existingUser = User::where('email', $request->email)->first();

        if ($existingUser && $existingUser->email_verified_at) {
            return ResponseHelper::error("Email already verified", 400);
        }

        $user = User::updateOrCreate(
            ['email' => $request->email],
            [
                'name' => $request->name,
                'password' => Hash::make($request->password),
                'phone_number' => null,
                'role' => 'customer'
            ]
        );

        // Send verification email
        $this->sendVerificationEmail($user);

        return ResponseHelper::success("User registered successfully. Please verify your email.");
    }

    // ✅ Login and return API token
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return ResponseHelper::error("Validation error", 422, $validator->errors());
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return ResponseHelper::error("Invalid credentials", 401);
        }

        $user = Auth::user();
        if (!$user->email_verified_at) {
            return ResponseHelper::error("Email not verified", 403);
        }

        $token = $user->createToken("API Token")->plainTextToken;

        return ResponseHelper::success("Login successful", ['token' => $token, 'user' => $user]);
    }

    // ✅ Logout and revoke token
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return ResponseHelper::success("Logged out successfully.");
    }

    // ✅ Get Authenticated User
    public function me(Request $request)
    {
        return ResponseHelper::success("User data retrieved", ['user' => $request->user()]);
    }

    // ✅ Verify Email
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

        $user->email_verified_at = now();
        $user->save();

        return ResponseHelper::success("Email verified successfully.");
    }

    // ✅ Resend Verification Email
    public function resendVerificationEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return ResponseHelper::error("Email not found", 404);
        }

        if ($user->email_verified_at) {
            return ResponseHelper::error("Email already verified", 400);
        }

        $this->sendVerificationEmail($user);

        return ResponseHelper::success("Verification email resent.");
    }

    // ✅ Send Email using PHPMailer
    private function sendVerificationEmail($user)
    {
        try {
            $verificationLink = url('/auth/verify/' . base64_encode($user->email));

            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = env('MAIL_HOST');
            $mail->SMTPAuth = true;
            $mail->Username = env('MAIL_USERNAME');
            $mail->Password = env('MAIL_PASSWORD');
            $mail->SMTPSecure = env('MAIL_ENCRYPTION');
            $mail->Port = env('MAIL_PORT');

            $mail->setFrom(env('MAIL_FROM_ADDRESS'), env('MAIL_FROM_NAME'));
            $mail->addAddress($user->email);
            $mail->isHTML(true);
            $mail->Subject = "Verify Your Email";
            $mail->Body = "<p>Click <a href='{$verificationLink}'>here</a> to verify your email.</p>";

            $mail->send();
        } catch (Exception $e) {
            Log::error("Email sending failed: " . $mail->ErrorInfo);
        }
    }
}
