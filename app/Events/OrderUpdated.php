<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Order $order;
    public int $userId;

    /**
     * Create a new event instance.
     */
    public function __construct(Order $order, int $userId)
    {
        $this->userId = $userId;
        $this->order = $order; // Keep it as an Order model
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('orders.' . $this->userId);
    }

    /**
     * Event name (optional override)
     */
    public function broadcastAs(): string
    {
        return 'order-updated';
    }

    /**
     * Data sent to frontend
     */
    public function broadcastWith(): array
    {
        return $this->order->only(['id', 'order_status', 'total_price']); // Filter attributes here
    }
}
