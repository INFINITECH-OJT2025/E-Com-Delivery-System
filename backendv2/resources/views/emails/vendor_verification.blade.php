<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Verify Your Vendor Account - E-Com Delivery System</title>
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
        }

        .verify-button:hover {
            background: #00592A;
        }
    </style>
</head>

<body>
    <div class="container">
        <h2>Hello, {{ $vendor->name }}!</h2>
        <p>Thank you for signing up as a vendor! Please click the button below to verify your email:</p>

        <!-- Clickable Verify Email Button -->
        <table align="center" cellspacing="0" cellpadding="0">
            <tr>
                <td align="center" bgcolor="#007C3D" style="border-radius: 5px;">
                    <a href="{{ $verificationLink }}" target="_blank" class="verify-button">Verify Email</a>
                </td>
            </tr>
        </table>

        <p>If you did not sign up, please ignore this email.</p>

        <div class="footer">
            <p>&copy; {{ date('Y') }} E-Com Delivery System. All rights reserved.</p>
        </div>
    </div>
</body>

</html>