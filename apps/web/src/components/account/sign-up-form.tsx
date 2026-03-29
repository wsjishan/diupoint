'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/button';
import { getApiBaseUrl, isApiRequestError } from '@/lib/api/http';
import { useAuth } from '@/lib/auth/auth-context';
import { getVerificationStatusByEmail } from '@/lib/auth-account';
import { APP_ROUTES, sanitizeReturnTo } from '@/lib/routes';

interface SignUpSubmitPayload {
  fullName: string;
  email: string;
  password: string;
  accountType: 'PERSONAL' | 'STORE';
}

interface SignUpFormProps {
  onSubmit?: (payload: SignUpSubmitPayload) => Promise<void> | void;
  signInHref?: string;
  showSocialDivider?: boolean;
  className?: string;
}

export default function SignUpForm({
  onSubmit,
  signInHref = APP_ROUTES.signIn,
  showSocialDivider = true,
  className = '',
}: SignUpFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [accountType, setAccountType] = useState<'PERSONAL' | 'STORE'>(
    'PERSONAL'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authStatusMessage, setAuthStatusMessage] = useState<string | null>(
    null
  );
  const [authError, setAuthError] = useState<string | null>(null);

  const trimmedEmail = email.trim();
  const hasTypedEmail = trimmedEmail.length > 0;
  const verificationStatus = hasTypedEmail
    ? getVerificationStatusByEmail(trimmedEmail)
    : null;

  function toSignUpErrorMessage(error: unknown): string {
    if (!isApiRequestError(error)) {
      return 'Unable to create account. Please try again.';
    }

    if (error.status === 409) {
      return 'Email already in use. Please sign in or use a different email.';
    }

    if (error.status === 400) {
      return error.message || 'Invalid signup data. Please check your input.';
    }

    if (error.status === 0) {
      return 'Backend is unavailable. Please ensure the API is running.';
    }

    if (error.status === 503 || error.status >= 500) {
      return 'Authentication service is temporarily unavailable. Please try again.';
    }

    return error.message || 'Unable to create account right now.';
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedFullName = fullName.trim();

    if (password !== confirmPassword) {
      setAuthError('Password and confirm password do not match.');
      return;
    }

    if (normalizedFullName.length < 2) {
      setAuthError('Please enter your full name.');
      return;
    }

    const payload = {
      fullName: normalizedFullName,
      email: normalizedEmail,
      password,
      accountType,
    };

    setIsSubmitting(true);
    setAuthError(null);
    setAuthStatusMessage(null);

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        const user = await signUp(payload);
        const signedUpVerificationStatus =
          user.verificationStatus === 'VERIFIED' ? 'verified' : 'unverified';

        setAuthStatusMessage(
          signedUpVerificationStatus === 'verified'
            ? 'Account created with a DIU email. Your account is verified.'
            : 'Account created. You can verify later with a DIU email.'
        );
      }

      const nextPath = sanitizeReturnTo(
        searchParams.get('returnTo'),
        APP_ROUTES.home
      );
      router.replace(nextPath);
    } catch (error) {
      setAuthError(toSignUpErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleSignUp() {
    const nextPath = sanitizeReturnTo(
      searchParams.get('returnTo'),
      APP_ROUTES.home
    );
    const authUrl = `${getApiBaseUrl()}/auth/google?returnTo=${encodeURIComponent(nextPath)}`;

    window.location.assign(authUrl);
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
            htmlFor="full-name"
            className="block text-sm font-medium text-gray-900 dark:text-slate-100"
          >
            Full name
          </label>
          <input
            id="full-name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-gray-200/95 bg-white px-3 text-sm text-gray-900 outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-gray-400 focus:border-[#2F3FBF]/75 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-300/75 dark:focus:ring-indigo-300/14"
            required
          />
        </div>

        <div>
          <label
            htmlFor="account-type"
            className="block text-sm font-medium text-gray-900 dark:text-slate-100"
          >
            Account type
          </label>
          <select
            id="account-type"
            value={accountType}
            onChange={(event) =>
              setAccountType(event.target.value as 'PERSONAL' | 'STORE')
            }
            className="mt-1.5 h-11 w-full rounded-xl border border-gray-200/95 bg-white px-3 text-sm text-gray-900 outline-none transition-[border-color,box-shadow,background-color] duration-200 focus:border-[#2F3FBF]/75 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-300/75 dark:focus:ring-indigo-300/14"
          >
            <option value="PERSONAL">Personal</option>
            <option value="STORE">Store</option>
          </select>
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

          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
            Use your DIU email to get a verified account
          </p>

          {hasTypedEmail ? (
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              {verificationStatus === 'verified'
                ? 'DIU email detected. This account will be verified automatically.'
                : 'Non-DIU email detected. You can verify later with a DIU email.'}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-900 dark:text-slate-100"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-gray-200/95 bg-white px-3 text-sm text-gray-900 outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-gray-400 focus:border-[#2F3FBF]/75 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-300/75 dark:focus:ring-indigo-300/14"
            required
          />
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-gray-900 dark:text-slate-100"
          >
            Confirm password
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-gray-200/95 bg-white px-3 text-sm text-gray-900 outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-gray-400 focus:border-[#2F3FBF]/75 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-300/75 dark:focus:ring-indigo-300/14"
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
          {isSubmitting ? 'Creating account...' : 'Create account'}
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
          onClick={handleGoogleSignUp}
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

        {authError ? (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-300">
            {authError}
          </p>
        ) : null}
      </div>

      <p className="pt-0.5 text-center text-xs text-gray-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          href={signInHref}
          className="font-semibold text-[#2F3FBF] underline-offset-2 transition-colors hover:text-[#2535a8] hover:underline dark:text-indigo-300 dark:hover:text-indigo-200"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
