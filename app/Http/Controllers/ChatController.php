<?php

namespace App\Http\Controllers;

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
        $chat = Chat::with(['messages.sender'])->find($chatId);

        if (!$chat) {
            return response()->json(['success' => false, 'message' => 'Chat not found'], 404);
        }

        // Mark all unread messages as read
        Message::where('chat_id', $chatId)
            ->where('is_read', false)
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

        $message = Message::create([
            'chat_id' => $request->chat_id,
            'sender_id' => $userId,
            'message' => $request->message,
            'is_read' => false
        ]);

        // Broadcast the new message
        broadcast(new NewChatMessage($message))->toOthers();

        return response()->json(['success' => true, 'message' => $message]);
    }

    /**
     * Admin gets all active user chats.
     */
    public function getActiveChats()
    {
        $chats = Chat::with(['sender', 'messages' => function ($query) {
            $query->latest(); // Get latest message per chat
        }])->get();

        return response()->json(['success' => true, 'chats' => $chats]);
    }

    /**
     * Admin sends a reply to a user.
     */
    public function sendSupportMessage(Request $request)
    {
        $request->validate([
            'chat_id' => 'required|exists:chats,id',
            'message' => 'required|string',
        ]);

        $adminId = Auth::id(); // Admin sending the message

        $message = Message::create([
            'chat_id' => $request->chat_id,
            'sender_id' => $adminId, // Admin's ID
            'message' => $request->message,
            'is_read' => false
        ]);

        return response()->json(['success' => true, 'message' => $message]);
    }
}
