'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import Button from '@/components/ui/button';
import {
  getVerificationStatusByEmail,
  saveAuthFromEmail,
} from '@/lib/auth-account';

interface SignInSubmitPayload {
  email: string;
  password: string;
}

interface SignInFormProps {
  onSubmit?: (payload: SignInSubmitPayload) => Promise<void> | void;
  forgotPasswordHref?: string;
  createAccountHref?: string;
  showSocialDivider?: boolean;
  className?: string;
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function SignInForm({
  onSubmit,
  forgotPasswordHref = '/forgot-password',
  createAccountHref = '/sign-up',
  showSocialDivider = true,
  className = '',
}: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authStatusMessage, setAuthStatusMessage] = useState<string | null>(
    null
  );

  const trimmedEmail = email.trim();
  const hasTypedEmail = trimmedEmail.length > 0;
  const verificationStatus = hasTypedEmail
    ? getVerificationStatusByEmail(trimmedEmail)
    : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      email: email.trim(),
      password,
    };

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        // Mock submit behavior until backend auth is wired.
        await wait(500);
      }

      const account = saveAuthFromEmail(payload.email, 'password');
      setAuthStatusMessage(
        account.verificationStatus === 'verified'
          ? 'Signed in with a DIU email. Your account is verified.'
          : 'Signed in successfully. You can verify later with a DIU email.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    const providerEmail = trimmedEmail || 'user@gmail.com';
    const account = saveAuthFromEmail(providerEmail, 'google');

    setAuthStatusMessage(
      account.verificationStatus === 'verified'
        ? 'Google sign-in detected a DIU email. Your account is verified.'
        : 'Google sign-in completed. You can verify later with a DIU email.'
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-3.5 ${className}`}
      noValidate
    >
      <div className="space-y-3">
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

          {hasTypedEmail ? (
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              {verificationStatus === 'verified'
                ? 'DIU email detected. This account will be verified automatically.'
                : 'Non-DIU email detected. You can verify later with a DIU email.'}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900 dark:text-slate-100"
            >
              Password
            </label>
            <Link
              href={forgotPasswordHref}
              className="text-xs font-medium text-[#2F3FBF] underline-offset-2 transition-colors hover:text-[#2535a8] hover:underline dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 w-full rounded-xl border border-gray-200/95 bg-white px-3 text-sm text-gray-900 outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-gray-400 focus:border-[#2F3FBF]/75 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-300/75 dark:focus:ring-indigo-300/14"
            required
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <Button
          type="submit"
          className="h-11 w-full bg-linear-to-b from-[#3b4bd4] to-[#2F3FBF] text-sm font-medium shadow-md shadow-[#2F3FBF]/30 transition-all duration-200 hover:from-[#3646cd] hover:to-[#2a39b2] hover:shadow-lg hover:shadow-[#2F3FBF]/32 active:translate-y-px active:shadow-sm active:shadow-[#2F3FBF]/22"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>

        {showSocialDivider ? (
          <div className="relative py-0">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300/80 dark:border-white/20" />
            </div>
            <p className="relative mx-auto w-fit bg-white px-2 text-xs lowercase text-gray-500 dark:bg-slate-900 dark:text-slate-400">
              or
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200/90 bg-white/95 px-3 text-sm font-medium text-gray-700 shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-gray-300 hover:bg-white hover:shadow-sm active:translate-y-px active:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F3FBF]/25 focus-visible:ring-offset-2 dark:border-white/12 dark:bg-slate-950/90 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-slate-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            aria-hidden
          >
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.4c-.2 1.2-1.4 3.6-5.4 3.6-3.2 0-5.8-2.7-5.8-5.9 0-3.3 2.6-5.9 5.8-5.9 1.8 0 3 0.8 3.7 1.5l2.5-2.4C16.6 3.4 14.5 2.5 12 2.5A9.5 9.5 0 0 0 2.5 12c0 5.2 4.2 9.5 9.5 9.5 5.5 0 9.2-3.9 9.2-9.3 0-.6-.1-1.1-.2-1.5H12Z"
            />
            <path
              fill="#34A853"
              d="M3.1 7.6 6.3 10c.9-2.7 3.1-4.1 5.7-4.1 1.8 0 3 0.8 3.7 1.5l2.5-2.4C16.6 3.4 14.5 2.5 12 2.5 8.4 2.5 5.2 4.5 3.1 7.6Z"
            />
            <path
              fill="#4A90E2"
              d="M12 21.5c2.4 0 4.5-.8 6-2.3l-2.8-2.3c-.8.6-1.8 1-3.2 1-2.6 0-4.8-1.7-5.6-4l-3.3 2.6c2.1 3.1 5.4 5 8.9 5Z"
            />
            <path
              fill="#FBBC05"
              d="M3.1 16.5 6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2L3.1 7.6A9.7 9.7 0 0 0 2.5 12c0 1.6.4 3.1.6 4.5Z"
            />
          </svg>
          Continue with Google
        </button>

        {authStatusMessage ? (
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {authStatusMessage}
          </p>
        ) : null}
      </div>

      <p className="pt-0.5 text-center text-xs text-gray-500 dark:text-slate-400">
        New to DIUPoint?{' '}
        <Link
          href={createAccountHref}
          className="font-semibold text-[#2F3FBF] underline-offset-2 transition-colors hover:text-[#2535a8] hover:underline dark:text-indigo-300 dark:hover:text-indigo-200"
        >
          Create account
        </Link>
      </p>
    </form>
  );
}
