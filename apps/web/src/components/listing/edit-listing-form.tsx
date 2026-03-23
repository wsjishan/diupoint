'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import { CATEGORIES } from '@/data/mock-listings';
import { updateListing } from '@/lib/api/listings';
import type { ApiListing } from '@/lib/api/types';

interface FormValues {
  title: string;
  price: string;
  category: string;
  condition: 'NEW' | 'USED';
  location: string;
  description: string;
}

interface FormErrors {
  title?: string;
  price?: string;
  category?: string;
  condition?: string;
  location?: string;
  description?: string;
}

const CATEGORY_OPTIONS = CATEGORIES.filter((category) => category.id !== 'all');

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const numericPrice = Number(values.price);

  if (values.title.trim().length < 3)
    errors.title = 'Title must be at least 3 characters.';
  if (!values.category.trim()) errors.category = 'Please choose a category.';
  if (values.location.trim().length < 2)
    errors.location = 'Location must be at least 2 characters.';
  if (values.description.trim().length < 8)
    errors.description = 'Description must be at least 8 characters.';

  if (!values.price.trim()) {
    errors.price = 'Price is required.';
  } else if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    errors.price = 'Price must be a valid number greater than 0.';
  }

  return errors;
}

export default function EditListingForm({ listing }: { listing: ApiListing }) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({
    title: listing.title,
    price: String(
      typeof listing.price === 'number' ? listing.price : Number(listing.price)
    ),
    category: listing.category,
    condition: listing.condition,
    location: listing.location,
    description: listing.description,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const isSold = listing.status === 'SOLD';
  const isArchived = listing.status === 'ARCHIVED';

  const headerText = useMemo(() => {
    if (isArchived) return 'Archived listing';
    if (isSold) return 'Sold listing';
    return 'Edit listing';
  }, [isArchived, isSold]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmissionError(null);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      await updateListing(listing.id, {
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category,
        condition: values.condition,
        price: Number(values.price),
        location: values.location.trim(),
      });

      router.push('/my-listings?updated=1');
    } catch {
      setSubmissionError(
        'Unable to update listing right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900 sm:p-6"
      noValidate
    >
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 sm:text-xl">
          {headerText}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Update your listing details and keep your post accurate for buyers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm text-gray-700 dark:text-slate-200 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Title
          </span>
          <input
            type="text"
            value={values.title}
            onChange={(event) =>
              setValues((previous) => ({
                ...previous,
                title: event.target.value,
              }))
            }
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#2F3FBF]/65 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          {errors.title ? (
            <span className="text-xs font-medium text-rose-600 dark:text-rose-300">
              {errors.title}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-gray-700 dark:text-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Price (BDT)
          </span>
          <input
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={values.price}
            onChange={(event) =>
              setValues((previous) => ({
                ...previous,
                price: event.target.value,
              }))
            }
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#2F3FBF]/65 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          {errors.price ? (
            <span className="text-xs font-medium text-rose-600 dark:text-rose-300">
              {errors.price}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-gray-700 dark:text-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Condition
          </span>
          <select
            value={values.condition}
            onChange={(event) =>
              setValues((previous) => ({
                ...previous,
                condition: event.target.value as 'NEW' | 'USED',
              }))
            }
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-[#2F3FBF]/65 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="USED">Used</option>
            <option value="NEW">New</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-gray-700 dark:text-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Category
          </span>
          <select
            value={values.category}
            onChange={(event) =>
              setValues((previous) => ({
                ...previous,
                category: event.target.value,
              }))
            }
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-[#2F3FBF]/65 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
          >
            <option value="">Select category</option>
            {CATEGORY_OPTIONS.map((category) => (
              <option
                key={category.id}
                value={category.label}
              >
                {category.label}
              </option>
            ))}
          </select>
          {errors.category ? (
            <span className="text-xs font-medium text-rose-600 dark:text-rose-300">
              {errors.category}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-gray-700 dark:text-slate-200 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Location
          </span>
          <input
            type="text"
            value={values.location}
            onChange={(event) =>
              setValues((previous) => ({
                ...previous,
                location: event.target.value,
              }))
            }
            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#2F3FBF]/65 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          {errors.location ? (
            <span className="text-xs font-medium text-rose-600 dark:text-rose-300">
              {errors.location}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1.5 text-sm text-gray-700 dark:text-slate-200 sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Description
          </span>
          <textarea
            value={values.description}
            onChange={(event) =>
              setValues((previous) => ({
                ...previous,
                description: event.target.value,
              }))
            }
            rows={6}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#2F3FBF]/65 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          {errors.description ? (
            <span className="text-xs font-medium text-rose-600 dark:text-rose-300">
              {errors.description}
            </span>
          ) : null}
        </label>
      </div>

      {submissionError ? (
        <p className="mt-4 text-sm font-medium text-rose-600 dark:text-rose-300">
          {submissionError}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
        <Link
          href="/my-listings"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
        >
          Cancel
        </Link>
        <Button
          type="submit"
          className="h-10 px-5"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
