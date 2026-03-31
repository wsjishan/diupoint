'use client';

import { useCallback, useEffect, useState } from 'react';
import StarRating from '@/components/ui/star-rating';
import { useAuth } from '@/lib/auth/auth-context';
import { fetchListingRatings, fetchMyRating, submitRating } from '@/lib/api/ratings';
import type { ApiRating } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { createSignInHref } from '@/lib/routes';

interface RatingSectionProps {
  listingId: string;
  initialAverage?: number | null;
  initialCount?: number;
}

function formatRatingDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default function RatingSection({
  listingId,
  initialAverage = null,
  initialCount = 0,
}: RatingSectionProps) {
  const { isAuthenticated, currentUser } = useAuth();
  const [average, setAverage] = useState<number | null>(initialAverage);
  const [count, setCount] = useState(initialCount);
  const [ratings, setRatings] = useState<ApiRating[]>([]);
  const [selectedValue, setSelectedValue] = useState(0);
  const [hoverValue, setHoverValue] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadData = useCallback(async () => {
    const [summary, myRating] = await Promise.all([
      fetchListingRatings(listingId),
      isAuthenticated ? fetchMyRating(listingId) : Promise.resolve(null),
    ]);

    setRatings(summary.ratings);
    setAverage(summary.average);
    setCount(summary.count);

    if (myRating) {
      setSelectedValue(myRating.value);
      setComment(myRating.comment ?? '');
    }

    setHasLoaded(true);
  }, [listingId, isAuthenticated]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSubmit = async () => {
    if (selectedValue < 1 || selectedValue > 5) return;

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      await submitRating(listingId, selectedValue, comment.trim() || undefined);
      setSubmitMessage('Rating submitted!');
      await loadData();
      setTimeout(() => setSubmitMessage(null), 3000);
    } catch {
      setSubmitMessage('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeHover = hoverValue || selectedValue;

  return (
    <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 sm:mt-6 sm:p-5">
      <p className="text-sm font-bold tracking-tight text-gray-900 dark:text-slate-100">
        Ratings
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
        {count > 0
          ? `${count} rating${count === 1 ? '' : 's'}`
          : 'No ratings yet'}
      </p>

      {/* Average summary */}
      <div className="mt-3 flex items-center gap-3">
        {average !== null ? (
          <>
            <span className="text-3xl font-black tracking-tight text-gray-950 dark:text-slate-50">
              {average.toFixed(1)}
            </span>
            <div className="flex flex-col gap-0.5">
              <StarRating
                rating={average}
                size="md"
              />
              <span className="text-xs text-gray-500 dark:text-slate-400">
                {count} review{count === 1 ? '' : 's'}
              </span>
            </div>
          </>
        ) : (
          <span className="text-sm text-gray-500 dark:text-slate-400">
            This listing has not been rated yet.
          </span>
        )}
      </div>

      {/* Rate this listing */}
      <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-3.5 dark:border-white/10 dark:bg-slate-800/70">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
          Rate this listing
        </p>

        {isAuthenticated ? (
          <div className="mt-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => {
                const starValue = i + 1;
                return (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHoverValue(starValue)}
                    onMouseLeave={() => setHoverValue(0)}
                    onClick={() => setSelectedValue(starValue)}
                    className="rounded-sm p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF]/40"
                    aria-label={`Rate ${starValue} star${starValue === 1 ? '' : 's'}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={activeHover >= starValue ? '#fbbf24' : 'currentColor'}
                      className={cn(
                        'h-7 w-7 transition-colors',
                        activeHover >= starValue
                          ? 'text-amber-400'
                          : 'text-gray-300 dark:text-slate-600'
                      )}
                    >
                      <path d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" />
                    </svg>
                  </button>
                );
              })}
              {selectedValue > 0 ? (
                <span className="ml-2 text-sm font-medium text-gray-600 dark:text-slate-300">
                  {selectedValue}/5
                </span>
              ) : null}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a short comment (optional)"
              maxLength={500}
              rows={2}
              className="mt-2.5 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#2F3FBF] focus:outline-none focus:ring-1 focus:ring-[#2F3FBF]/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/30"
            />

            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                disabled={selectedValue < 1 || isSubmitting}
                onClick={handleSubmit}
                className="inline-flex items-center rounded-full bg-[#2F3FBF] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2535a8] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
              </button>
              {submitMessage ? (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {submitMessage}
                </span>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            <Link
              href={createSignInHref(`/listing/${listingId}`)}
              className="font-semibold text-[#2F3FBF] hover:underline dark:text-indigo-300"
            >
              Sign in
            </Link>{' '}
            to rate this listing.
          </p>
        )}
      </div>

      {/* Ratings list */}
      {hasLoaded && ratings.length > 0 ? (
        <div className="mt-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Recent ratings
          </p>
          {ratings.map((rating) => (
            <div
              key={rating.id}
              className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 dark:border-white/5 dark:bg-slate-800/40"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {rating.user?.fullName ?? 'Anonymous'}
                  </span>
                  {currentUser?.id === rating.userId ? (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-[#2F3FBF] dark:bg-indigo-500/15 dark:text-indigo-300">
                      You
                    </span>
                  ) : null}
                </div>
                <StarRating
                  rating={rating.value}
                  size="sm"
                />
              </div>
              {rating.comment ? (
                <p className="mt-1.5 text-sm text-gray-600 dark:text-slate-300">
                  {rating.comment}
                </p>
              ) : null}
              <p className="mt-1 text-[11px] text-gray-400 dark:text-slate-500">
                {formatRatingDate(rating.createdAt)}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
