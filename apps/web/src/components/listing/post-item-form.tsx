'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/button';
import { CATEGORIES } from '@/data/mock-listings';
import { createListing } from '@/lib/api/listings';
import { useAuth } from '@/lib/auth/auth-context';

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

  if (values.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters.';
  }

  if (!values.category.trim()) {
    errors.category = 'Please choose a category.';
  }

  if (!values.condition) {
    errors.condition = 'Please choose an item condition.';
  }

  if (values.location.trim().length < 2) {
    errors.location = 'Location must be at least 2 characters.';
  }

  if (values.description.trim().length < 8) {
    errors.description = 'Description must be at least 8 characters.';
  }

  if (!values.price.trim()) {
    errors.price = 'Price is required.';
  } else if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    errors.price = 'Price must be a valid number greater than 0.';
  }

  return errors;
}

export default function PostItemForm() {
  const router = useRouter();
  const { isAuthenticated, isLoading, currentUser, accountType } = useAuth();

  const [values, setValues] = useState<FormValues>({
    title: '',
    price: '',
    category: '',
    condition: 'USED',
    location: '',
    description: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const accountSummary = useMemo(() => {
    if (!currentUser) return null;

    return accountType === 'STORE'
      ? `Posting as store: ${currentUser.storeProfile?.storeName ?? 'Store account'}`
      : `Posting as personal account: ${currentUser.fullName}`;
  }, [accountType, currentUser]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmissionError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!isAuthenticated || !currentUser) {
      setSubmissionError('Please sign in to post an item.');
      return;
    }

    if (accountType === 'STORE' && !currentUser.storeProfile?.id) {
      setSubmissionError('Your store account is missing a store profile.');
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await createListing({
        sellerType: accountType === 'STORE' ? 'STORE' : 'PERSONAL',
        storeProfileId:
          accountType === 'STORE'
            ? (currentUser.storeProfile?.id ?? undefined)
            : undefined,
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category,
        condition: values.condition,
        price: Number(values.price),
        location: values.location.trim(),
        status: 'PUBLISHED',
      });

      router.push(`/listing/${created.slug}`);
    } catch {
      setSubmissionError(
        'We could not publish your listing right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 sm:p-6">
        Loading your account...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900 sm:p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
          Sign in to post an item
        </h2>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
          You need an account before creating a listing.
        </p>
        <Link
          href="/sign-in?returnTo=%2Fpost-item"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#2F3FBF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2535a8]"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900 sm:p-6"
      noValidate
    >
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100 sm:text-xl">
          Listing details
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Fill in the basics so buyers can quickly understand your item.
        </p>
        {accountSummary ? (
          <p className="mt-2 inline-flex rounded-full border border-[#2F3FBF]/30 bg-[#2F3FBF]/7 px-2.5 py-1 text-xs font-semibold text-[#2F3FBF] dark:border-indigo-300/35 dark:bg-indigo-500/12 dark:text-indigo-200">
            {accountSummary}
          </p>
        ) : null}
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
            placeholder="Example: iPhone 12 Pro 128GB"
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
            placeholder="3500"
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
          {errors.condition ? (
            <span className="text-xs font-medium text-rose-600 dark:text-rose-300">
              {errors.condition}
            </span>
          ) : null}
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
            placeholder="Example: Dhanmondi, Dhaka"
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
            placeholder="Describe condition, usage history, and any defects."
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-[#2F3FBF]/65 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          {errors.description ? (
            <span className="text-xs font-medium text-rose-600 dark:text-rose-300">
              {errors.description}
            </span>
          ) : null}
        </label>

        <div className="sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Images
          </p>
          <label className="mt-1.5 block cursor-pointer rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600 transition-colors hover:border-[#2F3FBF]/45 hover:bg-[#2F3FBF]/4 dark:border-white/15 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-indigo-300/45 dark:hover:bg-indigo-500/10">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                setSelectedImages(files);
              }}
            />
            <span className="font-medium text-gray-900 dark:text-slate-100">
              Upload listing photos
            </span>
            <span className="mt-1 block text-xs text-gray-500 dark:text-slate-400">
              Upload UI is ready. Images are not sent to backend yet.
            </span>
          </label>

          {selectedImages.length > 0 ? (
            <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3 text-xs text-gray-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300">
              <p className="font-semibold text-gray-900 dark:text-slate-100">
                {selectedImages.length} image
                {selectedImages.length === 1 ? '' : 's'} selected
              </p>
              <ul className="mt-1.5 space-y-1">
                {selectedImages.slice(0, 4).map((file) => (
                  <li key={file.name}>{file.name}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      {submissionError ? (
        <p className="mt-4 text-sm font-medium text-rose-600 dark:text-rose-300">
          {submissionError}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
        >
          Cancel
        </Link>
        <Button
          type="submit"
          className="h-10 px-5"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Publishing...' : 'Publish Listing'}
        </Button>
      </div>
    </form>
  );
}
