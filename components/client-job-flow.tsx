"use client";

import { useState } from "react";
import { BookingStatusTracker } from "./booking-status-tracker";
import { ReviewForm } from "./review-form";

/**
 * Combines the booking lifecycle tracker with a review form that appears
 * once the worker marks the job complete. Used on the client's job-detail page.
 *
 * State is local for now — once `migrations/001_bookings_and_reviews.sql` is
 * applied, swap setStatus/onSubmitted for real Supabase upserts on `bookings`
 * and inserts on `reviews`.
 */
export function ClientJobFlow({ workerFullName }: { workerFullName: string }) {
  const [showReview, setShowReview] = useState(false);

  return (
    <div className="space-y-4">
      <BookingStatusTracker
        role="client"
        initialStatus="requested"
        onCompleted={() => setShowReview(true)}
      />
      {showReview && <ReviewForm rateeName={workerFullName} />}
    </div>
  );
}
