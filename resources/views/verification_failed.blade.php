<!-- resources/views/verification_failed.blade.php -->
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification Failed</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background-color: #f4f4f4;
        }

        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        h1 {
            color: #dc3545;
        }

        p {
            color: #333;
        }
    </style>
</head>

<body>
    <div class="container">
        <h1>Email Verification Failed</h1>
        <p>Either the link is expired or the OTP is invalid. Please try again or request a new verification email.</p>
    </div>
</body>

</html>