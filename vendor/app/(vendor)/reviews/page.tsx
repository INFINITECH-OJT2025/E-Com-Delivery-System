"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardBody, Button, Spinner } from "@heroui/react";
import { Star, Users } from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import Sentiment from "sentiment";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const customWords = {
  "dont": -2,
  "don't": -2,
  "dislike": -3,
  "hate": -4,
  "love": 3,
  "awesome": 3,
  "bad": -2,
  "great": 3,
};

const sentiment = new Sentiment({ extras: customWords });
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user?: {
    name: string;
  };
  sentimentLabel?: string; // We'll store the AI label here
}

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [summary, setSummary] = useState("");
  const [sentimentCounts, setSentimentCounts] = useState({
    positive: 0,
    neutral: 0,
    negative: 0,
  });
  const [insightsLoading, setInsightsLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 3; // how many reviews per page

  useEffect(() => {
    fetchReviews();
    fetchInsights();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("vendorToken");
      const res = await axios.get(`${API_URL}/api/vendor/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedReviews = res.data.data.reviews || [];

      // Assign AI sentiment label per review
      const augmented = fetchedReviews.map((r: Review) => {
        const result = sentiment.analyze(r.comment);
        let label = "Neutral";
        if (result.score > 1) label = "Positive";
        else if (result.score < -1) label = "Negative";
        return { ...r, sentimentLabel: label };
      });

      setReviews(augmented);
      computeSentiment(augmented);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem("vendorToken");
      const res = await axios.get(`${API_URL}/api/vendor/review-insights`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data;
      setAverageRating(data.average || 0);
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setInsightsLoading(false);
    }
  };

  /**
   * Compute overall sentiment counts & AI summary from the array of reviews
   */
  const computeSentiment = (reviewsData: Review[]) => {
    if (reviewsData.length === 0) return;

    // Recompute average rating from reviews
    const totalRating = reviewsData.reduce((sum, r) => sum + r.rating, 0);
    const avg = totalRating / reviewsData.length;
    setAverageRating(avg);

    let positive = 0,
      negative = 0,
      neutral = 0;
    const summarySentences: string[] = [];

    reviewsData.forEach((r) => {
      // We already have r.sentimentLabel if we want to rely on that
      // But let's recalc for the combined summary
      const result = sentiment.analyze(r.comment);
      if (result.score > 1) positive++;
      else if (result.score < -1) negative++;
      else neutral++;

      summarySentences.push(r.comment);
    });

    setSentimentCounts({ positive, neutral, negative });

    // Build an AI summary from the first 5 comments
    const combined = summarySentences.slice(0, 5).join(". ");
    const combinedResult = sentiment.analyze(combined);
    if (combinedResult.score > 1) setSummary("Overall positive feedback.");
    else if (combinedResult.score < -1) setSummary("Customers are dissatisfied.");
    else setSummary("Mixed or neutral reviews.");
  };

  // Chart data from reviews
  const reviewTrendsData = {
    labels: ["1⭐", "2⭐", "3⭐", "4⭐", "5⭐"],
    datasets: [
      {
        label: "Review Count",
        data: reviews.reduce((acc, r) => {
          acc[r.rating - 1] = (acc[r.rating - 1] || 0) + 1;
          return acc;
        }, [0, 0, 0, 0, 0]),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  // Pagination
  const totalPages = Math.ceil(reviews.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedReviews = reviews.slice(startIndex, startIndex + pageSize);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };
  

  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Vendor Reviews & Insights</h1>

      {insightsLoading ? (
  <div className="flex justify-center items-center w-full h-64">
  <Spinner size="lg" />
</div>      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardBody className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-gray-500">Average Rating</p>
                  <p className="text-3xl font-bold">{averageRating.toFixed(1)} ⭐</p>
                </div>
                <Star className="text-yellow-400 w-8 h-8" />
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm text-gray-500">Total Reviews</p>
                  <p className="text-3xl font-bold">{reviews.length}</p>
                </div>
                <Users className="text-blue-500 w-8 h-8" />
              </CardBody>
            </Card>

            <Card>
              <CardBody className="p-4">
                <Bar
                  data={reviewTrendsData}
                  options={{ plugins: { legend: { display: false } } }}
                />
              </CardBody>
            </Card>
          </div>

          <div className="mt-4 p-4 border rounded-xl bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 transition-all">
  <p className="text-base font-semibold text-gray-800 dark:text-white">
    AI Summary: {summary}
  </p>
  <div className="flex gap-4 text-sm mt-2 text-gray-700 dark:text-gray-300">
    <span>😊 Positive: {sentimentCounts.positive}</span>
    <span>😐 Neutral: {sentimentCounts.neutral}</span>
    <span>😞 Negative: {sentimentCounts.negative}</span>
  </div>
</div>

        </>
      )}

      {reviews.length === 0 && !insightsLoading && (
        <p className="text-center text-gray-500 mt-10">No reviews yet.</p>
      )}

      {/* Scrollable container for reviews */}
      <div className="max-h-96 overflow-y-auto space-y-4 border rounded-md p-4">
        {paginatedReviews.map((review) => (
          <Card key={review.id}>
            <CardBody className="p-4 space-y-1">
              <div className="flex justify-between items-center">
                <p className="font-semibold">{review.user?.name || "Anonymous"}</p>
                <p className="text-yellow-500 font-medium">{review.rating} ⭐</p>
              </div>
              <p className="text-xs text-gray-500">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
              <p className="text-gray-700 text-sm">{review.comment}</p>



              {/* AI Sentiment label */}
              <p className="text-sm font-semibold">
                AI Sentiment:{" "}
                <span
                  className={
                    review.sentimentLabel === "Positive"
                      ? "text-green-600"
                      : review.sentimentLabel === "Negative"
                      ? "text-red-600"
                      : "text-gray-600"
                  }
                >
                  {review.sentimentLabel}
                </span>
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Pagination controls if more than pageSize */}
      {reviews.length > pageSize && (
        <div className="flex items-center gap-2">
          <Button variant="bordered" onPress={handlePrevPage} disabled={currentPage === 1}>
            Previous
          </Button>
          <p>
            Page {currentPage} of {totalPages}
          </p>
          <Button
            variant="bordered"
            onPress={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
