<?php

namespace App\Observers;

use App\Models\Menu;

//weer enot goona use this.. since were going to use  models mutators only 
class MenuObserver
{
    /**
     * Handle the Menu "created" event.
     */
    public function created(Menu $menu): void
    {
        //
    }

    /**
     * Handle the Menu "updated" event.
     */
    public function updated(Menu $menu): void
    {
        //
    }

    /**
     * Handle the Menu "deleted" event.
     */
    public function deleted(Menu $menu): void
    {
        //
    }

    /**
     * Handle the Menu "restored" event.
     */
    public function restored(Menu $menu): void
    {
        //
    }

    /**
     * Handle the Menu "force deleted" event.
     */
    public function forceDeleted(Menu $menu): void
    {
        //
    }
    /**
     * Handle the Menu "updating" event.
     */
    public function updating(Menu $menu)
    {
        // ✅ Auto-update availability before saving to database
        $menu->availability = ($menu->stock > 0) ? 'in_stock' : 'out_of_stock';
    }
}
