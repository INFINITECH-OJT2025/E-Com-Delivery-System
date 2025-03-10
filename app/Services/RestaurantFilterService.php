<?php

namespace App\Services;

class RestaurantFilterService
{
    /**
     * ✅ Apply filters to the restaurant query
     */
    public static function applyFilters($query, $filters)
    {
        // ✅ Ensure category is an array before filtering
        if (!empty($filters['category']) && is_string($filters['category'])) {
            $filters['category'] = explode(',', $filters['category']);
        }

        if (!empty($filters['category']) && is_array($filters['category'])) {
            $query->whereIn('restaurant_category_id', $filters['category']);
        }

        if (!empty($filters['free_delivery'])) {
            $query->where('free_delivery', true);
        }
        if (!empty($filters['accepts_vouchers'])) {
            $query->where('accepts_vouchers', true);
        }
        if (!empty($filters['deal'])) {
            $query->where('has_special_deal', true);
        }
        if (!empty($filters['rating_4_plus'])) {
            $query->where('rating', '>=', 4.0);
        }
        if (!empty($filters['service_type']) && $filters['service_type'] !== 'all') {
            $query->where('service_type', $filters['service_type']);
        }
    }

    /**
     * ✅ Apply sorting to the restaurant query
     */
    public static function applySorting($query, $sortBy, $searchQuery)
    {
        if ($sortBy === 'relevance') {
            $query->orderByRaw("MATCH(name, description, address) AGAINST(? IN BOOLEAN MODE) DESC", [$searchQuery]);
        } elseif ($sortBy === 'rating') {
            $query->orderByDesc('rating');
        } elseif ($sortBy === 'most_orders') {
            $query->orderByDesc('orders_count');
        } elseif ($sortBy === 'fast_delivery') {
            $query->orderBy('distance', 'asc');
        } else {
            $query->orderBy('distance', 'asc'); // Default: nearest first
        }
    }
}
