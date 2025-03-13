<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8f8f8;
            padding: 20px;
        }

        .container {
            background: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }

        .header {
            font-size: 20px;
            font-weight: bold;
            color: #333;
        }

        .order-summary {
            background: #f8f8f8;
            padding: 15px;
            margin-top: 20px;
            border-radius: 5px;
        }

        .button {
            background: #ff3366;
            color: white;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
        }

        .footer {
            font-size: 12px;
            color: #888;
            margin-top: 20px;
        }
    </style>
</head>

<body>
    <div class="container">
        <p class="header">Order Confirmation</p>
        <p>Hi {{ $customer_name }},</p>
        <p>Your order from <strong>{{ $restaurant_name }}</strong> has been confirmed and is now being prepared.</p>

        <div class="order-summary">
            <p><strong>Order Number:</strong> {{ $order_number }}</p>
            <p><strong>Order Date:</strong> {{ $order_date }}</p>
            <p><strong>Delivery Address:</strong> {{ $customer_address }}</p>
        </div>

        <h3>Order Summary</h3>
        <ul>
            @foreach($order_items as $item)
            <li>{{ $item['quantity'] }} x {{ $item['menu']['name'] ?? 'Unknown Item' }} - ₱{{ $item['price'] }}</li>
            @endforeach

        </ul>

        <p><strong>Subtotal:</strong> ₱{{ $subtotal }}</p>
        <p><strong>Delivery Fee:</strong> ₱{{ $delivery_fee }}</p>
        <p><strong>Total:</strong> <span style="color: red; font-weight: bold;">₱{{ $total_price }}</span></p>

        <p><a href="{{ $tracking_url }}" class="button">Track Your Order</a></p>

        <p class="footer">Thank you for ordering with us! - Your App Name</p>
    </div>
</body>

</html>