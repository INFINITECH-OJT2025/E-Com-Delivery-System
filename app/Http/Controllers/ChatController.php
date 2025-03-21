<?php

namespace App\Http\Controllers;

use App\Events\MyEvent;
use App\Events\NewChatMessage;
use Illuminate\Http\Request;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    /**
     * User starts a chat with support.
     */
    public function startChat()
    {
        $userId = Auth::id();

        // Check if user already has an active chat
        $chat = Chat::where('sender_id', $userId)->first();

        if (!$chat) {
            $chat = Chat::create([
                'sender_id' => $userId,
                'receiver_id' => null, // Now allowed
            ]);
        }

        return response()->json(['success' => true, 'chat_id' => $chat->id]);
    }


    /**
     * Get messages for a chat.
     */
    public function getMessages($chatId)
    {
        $userId = Auth::id();

        $chat = Chat::with(['messages.sender'])->find($chatId);

        if (!$chat || ($chat->sender_id !== $userId && $chat->receiver_id !== $userId && !Auth::user()->isAdmin())) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        Message::where('chat_id', $chatId)
            ->where('is_read', false)
            ->where('sender_id', '!=', $userId)
            ->update(['is_read' => true]);

        return response()->json(['success' => true, 'messages' => $chat->messages]);
    }


    /**
     * User sends a message.
     */
    public function sendMessage(Request $request)
    {
        $request->validate([
            'chat_id' => 'required|exists:chats,id',
            'message' => 'required|string',
        ]);

        $userId = Auth::id();
        $chat = Chat::findOrFail($request->chat_id);

        if ($chat->sender_id !== $userId && $chat->receiver_id !== $userId) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $message = Message::create([
            'chat_id' => $request->chat_id,
            'sender_id' => $userId,
            'message' => $request->message,
            'is_read' => false,
        ]);

        broadcast(new NewChatMessage($message))->toOthers();

        return response()->json(['success' => true, 'message' => $message]);
    }


    /**
     * Admin gets all active user chats.
     */
    public function getActiveChats()
    {
        $chats = Chat::with(['sender', 'messages' => function ($query) {
            $query->latest()->limit(1);
        }])->orderByDesc('updated_at')->get();

        return response()->json(['success' => true, 'chats' => $chats]);
    }



    /**
     * Admin sends a reply to a user.
     */
    public function sendSupportMessage(Request $request)
    {
        $request->validate([
            'chatId' => 'required|exists:chats,id',
            'message' => 'required|string',
        ]);

        $adminId = Auth::id();

        $message = Message::create([
            'chat_id' => $request->chatId,
            'sender_id' => $adminId,
            'message' => $request->message,
            'is_read' => false,
        ]);

        // ✅ Broadcast admin reply
        broadcast(new NewChatMessage($message))->toOthers();

        return response()->json(['success' => true, 'message' => $message]);
    }

    public function testSend(Request $request)
    {
        $request->validate([
            'message' => 'required|string'
        ]);

        // Trigger the event to broadcast to clients
        event(new MyEvent($request->message));

        return response()->json(['success' => true, 'message' => 'Event broadcasted successfully.']);
    }
}
