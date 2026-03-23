'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import Button from '@/components/ui/button';

interface ForgotPasswordSubmitPayload {
  email: string;
}

interface ForgotPasswordFormProps {
  onSubmit?: (payload: ForgotPasswordSubmitPayload) => Promise<void> | void;
  signInHref?: string;
  className?: string;
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function ForgotPasswordForm({
  onSubmit,
  signInHref = '/sign-in',
  className = '',
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      email: email.trim(),
    };

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        // Mock submit behavior until backend auth is wired.
        await wait(500);
      }

      setShowSuccessState(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setIsResending(true);

    try {
      // Mock resend behavior until backend auth is wired.
      await wait(500);
    } finally {
      setIsResending(false);
    }
  }

  if (showSuccessState) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-slate-100">
            Check your email
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
            We&apos;ve sent a password reset link if an account exists for this
            email.
          </p>
        </div>

        <div className="space-y-2.5">
          <Link
            href={signInHref}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-linear-to-b from-[#3b4bd4] to-[#2F3FBF] text-sm font-medium text-white shadow-md shadow-[#2F3FBF]/30 transition-all duration-200 hover:from-[#3646cd] hover:to-[#2a39b2] hover:shadow-lg hover:shadow-[#2F3FBF]/32 active:translate-y-px active:shadow-sm active:shadow-[#2F3FBF]/22"
          >
            Back to sign in
          </Link>

          <button
            type="button"
            onClick={handleResend}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-gray-200/90 bg-white/95 px-3 text-sm font-medium text-gray-700 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-gray-300 hover:bg-white hover:shadow-sm active:translate-y-px active:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF]/25 focus-visible:ring-offset-2 dark:border-white/12 dark:bg-slate-950/90 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-slate-900"
            disabled={isResending}
          >
            {isResending ? 'Resending...' : 'Resend email'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-3.5 ${className}`}
      noValidate
    >
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-slate-100">
          Forgot password
        </h1>
        <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
          Enter your email to reset your password.
        </p>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-900 dark:text-slate-100"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@diu.edu.bd"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1.5 h-11 w-full rounded-xl border border-gray-200/95 bg-white px-3 text-sm text-gray-900 outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-gray-400 focus:border-[#2F3FBF]/75 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-300/75 dark:focus:ring-indigo-300/14"
          required
        />
      </div>

      <Button
        type="submit"
        className="h-11 w-full bg-linear-to-b from-[#3b4bd4] to-[#2F3FBF] text-sm font-medium shadow-md shadow-[#2F3FBF]/30 transition-all duration-200 hover:from-[#3646cd] hover:to-[#2a39b2] hover:shadow-lg hover:shadow-[#2F3FBF]/32 active:translate-y-px active:shadow-sm active:shadow-[#2F3FBF]/22"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Sending link...' : 'Send reset link'}
      </Button>

      <p className="pt-0.5 text-center text-xs text-gray-500 dark:text-slate-400">
        Back to{' '}
        <Link
          href={signInHref}
          className="font-semibold text-[#2F3FBF] underline-offset-2 transition-colors hover:text-[#2535a8] hover:underline dark:text-indigo-300 dark:hover:text-indigo-200"
        >
          sign in
        </Link>
      </p>
    </form>
  );
}
