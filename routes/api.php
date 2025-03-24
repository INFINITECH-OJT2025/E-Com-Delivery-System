<?php

use App\Events\MyEvent;
use App\Http\Controllers\AdminDashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\CustomerAddressController;
use App\Http\Controllers\DeliveryFeeController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\GoogleMapsController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PromoController;
use App\Http\Controllers\RefundController;
use App\Http\Controllers\RestaurantController;
use App\Http\Controllers\RestaurantDashboardController;
use App\Http\Controllers\RiderController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Http;

Route::prefix('google-maps')->group(function () {
    Route::get('/geocode', [GoogleMapsController::class, 'getAddressFromCoords']);
    Route::get('/distance', [GoogleMapsController::class, 'getDistance']);
    Route::get('/autocomplete', [GoogleMapsController::class, 'getAutocompleteResults']);
});

// ✅ Authentication Routes (Sanctum Token-Based)
Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
Route::post('/login', [AuthController::class, 'login'])->name('auth.login');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum')->name('auth.logout');
Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])->name('auth.verify');
Route::post('/resend-verification', [AuthController::class, 'resendVerification'])->name('auth.reverify');
Route::post('/forgot-password', [AuthController::class, 'sendResetLink']);
Route::get('verify-otp', [AuthController::class, 'showVerificationPage'])->name('verify-otp');

// ✅ Check Email (Throttled to prevent abuse)
Route::post('/email-check', [AuthController::class, 'checkEmail'])
    ->middleware('throttle:10,1')
    ->name('auth.email-check');

// ✅ Get Authenticated User (Protected)
Route::middleware('auth:sanctum')->group(function () {
    // ✅ Authenticated User Details (Move to AuthController)
    Route::get('/user', [AuthController::class, 'me'])->name('auth.user');
    // ✅ Update Authenticated User (Change Own Profile)
    Route::put('/user', [AuthController::class, 'update'])->name('auth.user.update');
    // ✅ User Management 
    Route::apiResource('users', UserController::class)->except(['create', 'edit']);
    Route::get('/home', [HomeController::class, 'index'])->name('home.index');
    Route::get('/getCurrentOrder', [HomeController::class, 'getCurrentOrder']);
});


// ✅ Public Routes


// ✅ Restaurant Routes
Route::prefix('restaurants')->group(function () {
    Route::get('/{slug}', [RestaurantController::class, 'show'])->name('restaurants.show');
    Route::get('/{slug}/menu', [RestaurantController::class, 'menu'])->name('restaurants.menu');
    Route::get('/{slug}/reviews', [RestaurantController::class, 'reviews'])->name('restaurants.reviews');
    Route::get('/{restaurantId}/delivery-fee', [DeliveryFeeController::class, 'calculateFee']);
    Route::get('/by-id/{id}', [RestaurantController::class, 'getById']);
});

// ✅ Protected Routes (Require Authentication)
Route::middleware('auth:sanctum')->group(function () {
    // 🛒 Cart API (Refactored to use `apiResource`)
    Route::apiResource('cart', CartController::class)->except(['create', 'edit']);

    Route::post('/checkout', [OrderController::class, 'checkout'])->name('order.checkout');
    Route::apiResource('favorites', FavoriteController::class)->except(['create', 'edit']);
});
Route::middleware('auth:sanctum')->prefix('user')->group(function () {
    Route::apiResource('addresses', CustomerAddressController::class)->except(['create', 'edit']);
    Route::patch('addresses/{id}/set-default', [CustomerAddressController::class, 'setDefault']);
});

// ✅ Public routes (Customers can fetch vouchers)

// ✅ Authenticated routes (Customers must be logged in to apply a voucher)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/vouchers', [PromoController::class, 'index']); // List all available vouchers

    Route::post('/vouchers/apply', [PromoController::class, 'applyPromo']); // Apply a voucher

    // ✅ Admin routes (Manage vouchers)
    Route::middleware(['admin'])->prefix('admin')->group(function () {
        Route::apiResource('vouchers', PromoController::class)->except(['show']);
    });
});
// ✅ Secure API with middleware
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('orders', OrderController::class);

    // ✅ Cancel Order
    Route::post('orders/{order}/cancel', [OrderController::class, 'cancelOrder']);

    // ✅ Request Refund
    Route::post('orders/{order}/refund', [OrderController::class, 'processRefund']);
});
Route::prefix('search')->group(function () {
    Route::get('/', [SearchController::class, 'search'])->middleware('auth:sanctum'); // 🔎 Search Restaurants (With Location & Similar Results)
    Route::get('/recent', [SearchController::class, 'recentSearches'])->middleware('auth:sanctum'); // 🕵️‍♂️ Recent Searches (Auth Required)
    Route::get('/popular', [SearchController::class, 'popularSearches']); // 🔥 Popular Searches
    Route::delete('/recent/{query}', [SearchController::class, 'deleteRecentSearch'])->middleware('auth:sanctum');; // ✅ Deletes specific search
    Route::delete('/recent', [SearchController::class, 'clearAllRecentSearches'])->middleware('auth:sanctum');; // ✅ Clears all searches
});
Route::prefix('categories')->group(function () {
    Route::get('/restaurants', [CategoryController::class, 'getRestaurantCategories']); // ✅ Fetch Restaurant Categories
    Route::get('/menus', [CategoryController::class, 'getMenuCategories']); // ✅ Fetch Menu Categories
    Route::get('/all', [CategoryController::class, 'getAllCategories']); // ✅ Fetch Both Categories
});
// ✅ User Routes (Standard API Resource for Refunds)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::apiResource('refunds', RefundController::class)->only(['index', 'store', 'show']);
});

// ✅ Admin Routes (Separate Endpoint for Admin to Fetch All Refunds)
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('admin/refunds', [RefundController::class, 'adminIndex']); // ✅ Admin can fetch all refunds
    Route::put('admin/refunds/{id}', [RefundController::class, 'update']); // ✅ Admin can update refund status
});

// ✅ Vendor Authentication Routes (Restaurant Owners)
Route::prefix('/vendor/auth')->group(function () {
    Route::post('/register', [AuthController::class, 'registerVendor'])->name('vendor.auth.register'); // Vendor Registration
    Route::post('/login', [AuthController::class, 'vendorLogin'])->name('vendor.auth.login'); // Vendor Login
});
Route::middleware(['auth:sanctum'])->prefix('vendor')->group(function () {
    Route::get('/dashboard/total-orders', [RestaurantDashboardController::class, 'totalOrders']);
    Route::get('/dashboard/pending-orders', [RestaurantDashboardController::class, 'pendingOrders']);
    Route::get('/dashboard/total-revenue', [RestaurantDashboardController::class, 'totalRevenue']);
    Route::get('/dashboard/recent-orders', [RestaurantDashboardController::class, 'recentOrders']);

    // 📊 New Analytics
    Route::get('/dashboard/top-selling-menus', [RestaurantDashboardController::class, 'topSellingMenus']);
    Route::get('/dashboard/most-searched-keywords', [RestaurantDashboardController::class, 'mostSearchedKeywords']);
    Route::get('/dashboard/average-rating', [RestaurantDashboardController::class, 'averageRating']);
    Route::get('/dashboard/order-trends-by-hour', [RestaurantDashboardController::class, 'orderTrendsByHour']);
    Route::get('/dashboard/order-type-distribution', [RestaurantDashboardController::class, 'orderTypeDistribution']);
    Route::get('/dashboard/payment-method-stats', [RestaurantDashboardController::class, 'paymentMethodStats']);
    Route::get('/dashboard/refund-summary', [RestaurantDashboardController::class, 'refundSummary']);
});

// Vendor Routes for Restaurant Management
Route::middleware(['auth:sanctum'])->prefix('vendor')->group(function () {
    // Restaurant Management Routes
    Route::get('/restaurant/details', [RestaurantController::class, 'getDetails']);
    Route::post('/restaurant/details', [RestaurantController::class, 'updateDetails']);
    Route::get('/restaurant/categories', [RestaurantController::class, 'getCategories']);

    // Menu Management Routes
    Route::get('/menu', [MenuController::class, 'getMenu']); // ✅ Fetch menu items
    Route::post('/menu', [MenuController::class, 'createMenu']); // ✅ Create new menu item
    Route::post('/menu/{id}', [MenuController::class, 'updateMenu']); // ✅ Update menu item
    Route::delete('/menu/{id}', [MenuController::class, 'deleteMenu']); // ✅ Delete menu item

    // ✅ Fetch all vendor orders
    Route::get('/orders', [OrderController::class, 'getOrders']);

    // ✅ Fetch specific order details
    Route::get('/orders/{id}', [OrderController::class, 'getOrderDetails']);

    // ✅ Update order status (e.g., Confirm, Cancel, Deliver)
    Route::put('/orders/{id}/status', [OrderController::class, 'updateOrderStatus']);
    // Refund Management Routes
    Route::get('/refunds', [RefundController::class, 'getRefunds']);
    Route::put('/refunds/{id}/status', [RefundController::class, 'updateRefundStatus']);
});
Route::post('/riders/register', [AuthController::class, 'registerRider']);
Route::post('/riders/register', [AuthController::class, 'registerRider']);
Route::post('/riders/login', [AuthController::class, 'riderLogin']);
Route::prefix('riders')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/profile', [RiderController::class, 'getProfile']); // ✅ Fetch Rider Profile
    Route::get('/orders', [RiderController::class, 'getAssignedOrders']); // ✅ Fetch Assigned Orders
    Route::get('/orders/{orderId}', [RiderController::class, 'getOrderDetails']);

    Route::post('/orders/accept', [RiderController::class, 'acceptOrder']); // ✅ Accept Order
    Route::post('/orders/update', [RiderController::class, 'updateOrderStatus']); // ✅ Update Order Status
    Route::get('/earnings', [RiderController::class, 'getEarnings']); // ✅ Fetch Earnings
    Route::get('/notifications', [RiderController::class, 'getNotifications']); // ✅ Fetch Notifications
    Route::get('/nearby-orders', [RiderController::class, 'getNearbyOrders']); // ✅ Fetch Notifications
    Route::post('/deliveries/upload-proof', [RiderController::class, 'uploadProofOfDelivery']);
    Route::post('/location', [RiderController::class, 'updateRiderLocation']);
});
Route::post('/admin/login', [AuthController::class, 'adminlogin']);
Route::get('/admin/google-auth', [AuthController::class, 'googleAuth']);
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/admin/dashboard/stats', [AdminDashboardController::class, 'getStats']);
    Route::get('/admin/dashboard/recent-orders', [AdminDashboardController::class, 'getRecentOrders']);
    Route::get('/admin/dashboard/recent-registrations', [AdminDashboardController::class, 'getRecentRegistrations']);
});
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    Route::apiResource('users', UserController::class)->only(['index', 'destroy']);
    Route::put('/users/{id}/update-status', [UserController::class, 'updateStatus']); // ✅ Custom status update route
});
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    Route::get('/riders', [RiderController::class, 'getAllRidersWithEarnings']); // ✅ Fetch all riders with earnings
});
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    Route::post('/riders/{id}/status', [RiderController::class, 'updateStatus']);
});

Route::middleware('auth:sanctum')->group(function () {

    // 🔹 USER ROUTES
    Route::post('/chat/start', [ChatController::class, 'startChat']); // Start a support chat
    Route::get('/chat/messages/{chatId}', [ChatController::class, 'getMessages']); // Fetch messages
    Route::post('/chat/send', [ChatController::class, 'sendMessage']); // Send message (User)

    // 🔹 ADMIN ROUTES
    Route::get('/chat/active-chats', [ChatController::class, 'getActiveChats']); // List all user chats
    Route::post('admin/chat/send', [ChatController::class, 'sendSupportMessage']); // Admin sends message
});
Route::middleware(['auth:sanctum'])->group(function () {
    // 🚀 User Routes
    Route::post('/support/tickets', [SupportController::class, 'createTicket']); // Submit Ticket
    Route::get('/support/tickets', [SupportController::class, 'listUserTickets']); // User's Tickets
    Route::get('/support/tickets/{ticket}', [SupportController::class, 'viewTicket']); // View Specific Ticket

    // 🚀 Admin Routes
    Route::get('/admin/support/tickets', [SupportController::class, 'listAllTickets']); // All Tickets
    Route::patch('/admin/support/tickets/{ticket}/update', [SupportController::class, 'updateTicketStatus']); // Update Ticket Status
    Route::delete('/admin/support/tickets/{ticket}/delete', [SupportController::class, 'deleteTicket']); // Delete Ticket
    Route::get('/admin/tickets/pending', [SupportController::class, 'getPendingTickets']);
});
Route::get('/test-event', function () {
    event(new MyEvent('Hello world!'));
    return "Event broadcasted!";
});
Route::middleware('auth:sanctum')->post('/chat/test', [ChatController::class, 'testSend']);
