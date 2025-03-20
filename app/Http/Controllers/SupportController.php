<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SupportController extends Controller
{
    // ✅ 1. Create a Support Ticket (User)
    public function createTicket(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $ticket = Ticket::create([
            'user_id' => Auth::id(),
            'subject' => $request->subject,
            'message' => $request->message,
            'status' => 'Pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Your support ticket has been submitted!',
            'ticket' => $ticket,
        ], 201);
    }

    // ✅ 2. Get User's Tickets
    public function listUserTickets()
    {
        $tickets = Ticket::where('user_id', Auth::id())->latest()->get();
        return response()->json(['tickets' => $tickets]);
    }

    // ✅ 3. Get a Specific Ticket (User)
    public function viewTicket(Ticket $ticket)
    {
        if ($ticket->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json(['ticket' => $ticket]);
    }

    // ✅ 4. Get All Tickets (Admin)
    public function listAllTickets()
    {
        $tickets = Ticket::latest()->get();
        return response()->json(['tickets' => $tickets]);
    }

    // ✅ 5. Update Ticket Status (Admin)
    public function updateTicketStatus(Request $request, Ticket $ticket)
    {
        $request->validate(['status' => 'required|in:Pending,In Progress,Resolved']);

        $ticket->update(['status' => $request->status]);

        return response()->json(['message' => 'Ticket status updated successfully!', 'ticket' => $ticket]);
    }

    // ✅ 6. Delete a Ticket (Admin)
    public function deleteTicket(Ticket $ticket)
    {
        $ticket->delete();
        return response()->json(['message' => 'Ticket deleted successfully.']);
    }
}
