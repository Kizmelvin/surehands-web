"use client";

import { useState } from "react";

export function ReviewForm({
  rateeName,
  onSubmitted,
}: {
  rateeName: string;
  onSubmitted?: (stars: number, comment: string) => void;
}) {
  const [stars, setStars] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (submitted) {
    return (
      <div className="card border-brand-200 bg-brand-50 text-center">
        <p className="text-3xl">✓</p>
        <p className="mt-2 font-semibold text-brand-800">Thanks for the review.</p>
        <p className="mt-1 text-sm text-brand-700">
          Your rating helps future clients decide who to hire.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (stars < 1) return;
        onSubmitted?.(stars, comment);
        setSubmitted(true);
      }}
      className="card"
    >
      <h2 className="text-base font-semibold text-gray-900">Rate {rateeName}</h2>
      <p className="mt-1 text-sm text-gray-600">
        Recent ratings count more — your review will weigh heavily for the next 90 days.
      </p>

      <div
        className="mt-4 flex items-center gap-1"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const active = (hover || stars) >= n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => setStars(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              className={`text-3xl leading-none transition ${
                active ? "text-amber-500" : "text-gray-300 hover:text-amber-400"
              }`}
            >
              ★
            </button>
          );
        })}
        <span className="ml-3 text-sm text-gray-600">
          {stars > 0 ? `${stars} / 5` : "Pick a rating"}
        </span>
      </div>

      <div className="mt-4">
        <label className="label" htmlFor="review-comment">
          Comment (optional)
        </label>
        <textarea
          id="review-comment"
          className="input resize-y"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What stood out — on time, well-priced, polite, brought their own tools, etc."
        />
      </div>

      <div className="mt-4 flex justify-end">
        <button type="submit" className="btn-primary" disabled={stars < 1}>
          Submit review
        </button>
      </div>
    </form>
  );
}
