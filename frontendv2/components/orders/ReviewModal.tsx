"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, Button } from "@heroui/react";
import { Star } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  openAlert: (alert: any) => void;
  onSubmitted?: () => void; // Optional callback after review
}

export default function ReviewModal({ isOpen, onClose, order, openAlert, onSubmitted }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submitReview = async () => {
    const payload = {
      restaurant_id: order.restaurant.id,
      rating,
      comment,
    };

    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        openAlert({ isOpen: true, title: "Review Submitted", message: "Thank you for your feedback!" });
        setRating(5);
        setComment("");
        onClose();
        onSubmitted?.();
      } else {
        openAlert({ isOpen: true, title: "Error", message: data.message || "Failed to submit review." });
      }
    } catch (err) {
      console.error("Review error:", err);
      openAlert({ isOpen: true, title: "Error", message: "Something went wrong." });
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Leave a Review
        </ModalHeader>
        <ModalBody className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
          <Input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          />

          <label className="block text-sm font-medium text-gray-700">Comment</label>
          <Textarea
            placeholder="Tell us about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>Cancel</Button>
          <Button color="primary" onPress={submitReview}>Submit</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
