<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>

<body class="flex items-center justify-center h-screen bg-gray-100">

    <div class="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 class="text-xl font-bold text-center text-gray-800">Reset Your Password</h2>
        <p class="text-gray-500 text-center mb-4">Enter a new password for your account.</p>

        @if (session('error'))
        <p class="text-red-500 text-sm text-center">{{ session('error') }}</p>
        @endif

        @if (session('success'))
        <p class="text-green-500 text-sm text-center">{{ session('success') }}</p>
        @endif

        <form action="{{ url('/reset-password') }}" method="POST">
            @csrf
            <input type="hidden" name="email" value="{{ request('email') }}">
            <input type="hidden" name="token" value="{{ request('token') }}">

            <label class="block text-gray-700 mt-2">New Password</label>
            <input type="password" name="password" required class="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500">

            <label class="block text-gray-700 mt-2">Confirm Password</label>
            <input type="password" name="password_confirmation" required class="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500">

            <button type="submit" class="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                Reset Password
            </button>
        </form>
    </div>

</body>

</html>