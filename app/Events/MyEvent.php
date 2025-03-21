<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class MyEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct($message)
    {
        $this->message = $message;
        Log::info('MyEvent created', ['message' => $message]);
    }

    public function broadcastOn()
    {
        $channel = new Channel('my-channel');
        Log::info('Broadcasting on channel', ['channel' => 'my-channel']);
        return $channel;
    }

    public function broadcastAs()
    {
        return 'my-event';
    }
}
