"use client";

import { useEffect, useState } from "react";
import { Card, CardBody } from "@heroui/react";
import { FaStar } from "react-icons/fa";
import { DashboardService } from "@/services/dashboardService";

interface Review {
  name: string;
  rating: number;
  date: string;
  order: string | number;
  content: string;
}

export default function RecentReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      const res = await DashboardService.getRecentReviews();
      if (Array.isArray(res)) {
        setReviews(res);
        const avg = res.reduce((sum, r) => sum + r.rating, 0) / res.length;
        setAverageRating(parseFloat(avg.toFixed(1)));
        setTotalReviews(res.length);
      }
      setLoading(false);
    }

    fetchReviews();
  }, []);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`h-3 w-3 ${i < rating ? "text-yellow-500" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="shadow-sm border h-full">
      <CardBody>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Recent Reviews</h3>
          <a href="/reviews" className="text-sm text-primary hover:underline">
            View All →
          </a>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading reviews...</p>
        ) : (
          <div className="space-y-5 text-sm">
            {reviews.slice(0, 4).map((review, i) => (
              <div key={i}>
                <div className="font-semibold text-gray-800">{review.name}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  {renderStars(review.rating)}
                  <span className="text-gray-400">• {review.date}</span>
                </div>
                <p className="text-gray-700">{review.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Order <span className="font-medium">#{review.order}</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="mt-6 border-t pt-4 flex justify-between items-center text-sm">
            <div className="flex items-center gap-1 text-yellow-500 font-bold text-lg">
              <FaStar /> {averageRating}
            </div>
            <p className="text-xs text-gray-400">{totalReviews} reviews</p>
            <a
              href="/reviews"
              className="text-sm px-3 py-1 border rounded text-gray-700 hover:bg-gray-100"
            >
              Manage Reviews
            </a>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
