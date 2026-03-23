'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Button from '@/components/ui/button';
import { isDiuEmailDomain } from '@/lib/auth-account';
import {
  confirmVerificationOtp,
  requestVerificationOtp,
} from '@/lib/api/verification';

type VerificationStep = 'email' | 'otp' | 'success';

interface AccountVerificationFlowProps {
  onVerified?: (verifiedEmail: string) => void | Promise<void>;
  onCancel?: () => void;
  autoCompleteOnSuccess?: boolean;
  autoCompleteDelayMs?: number;
  className?: string;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    const jsonStartIndex = error.message.indexOf('{');

    if (jsonStartIndex >= 0) {
      const jsonText = error.message.slice(jsonStartIndex);

      try {
        const parsed = JSON.parse(jsonText) as { message?: string | string[] };
        if (Array.isArray(parsed.message) && parsed.message.length > 0) {
          return parsed.message[0];
        }

        if (typeof parsed.message === 'string' && parsed.message.length > 0) {
          return parsed.message;
        }
      } catch {
        return fallback;
      }
    }
  }

  return fallback;
}

export default function AccountVerificationFlow({
  onVerified,
  onCancel,
  autoCompleteOnSuccess = true,
  autoCompleteDelayMs = 1000,
  className = '',
}: AccountVerificationFlowProps) {
  const [step, setStep] = useState<VerificationStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const completionTimerRef = useRef<number | null>(null);

  const trimmedEmail = useMemo(() => email.trim(), [email]);

  useEffect(() => {
    return () => {
      if (completionTimerRef.current) {
        window.clearTimeout(completionTimerRef.current);
      }
    };
  }, []);

  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedEmail || !isDiuEmailDomain(trimmedEmail)) {
      setError('Please use a valid DIU email address.');
      return;
    }

    setError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      const response = await requestVerificationOtp({
        verificationEmail: trimmedEmail,
      });

      setInfoMessage(`OTP sent to ${response.verificationEmail}.`);
      setStep('otp');
    } catch (requestError) {
      setError(
        extractErrorMessage(
          requestError,
          'Unable to send OTP right now. Please try again.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Enter the 6-digit OTP sent to your DIU email.');
      return;
    }

    setError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      await confirmVerificationOtp({
        verificationEmail: trimmedEmail,
        otp: otp.trim(),
      });

      setIsSubmitting(false);
      setStep('success');

      if (autoCompleteOnSuccess && onVerified) {
        completionTimerRef.current = window.setTimeout(() => {
          void onVerified(trimmedEmail);
        }, autoCompleteDelayMs);
      }
    } catch (verifyError) {
      setError(
        extractErrorMessage(
          verifyError,
          'Verification failed. Please check OTP and try again.'
        )
      );
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    setError(null);
    setInfoMessage(null);

    if (!trimmedEmail || !isDiuEmailDomain(trimmedEmail)) {
      setError('Please provide a valid DIU email first.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await requestVerificationOtp({
        verificationEmail: trimmedEmail,
      });

      setOtp('');
      setInfoMessage(`A new OTP was sent to ${response.verificationEmail}.`);
    } catch (requestError) {
      setError(
        extractErrorMessage(
          requestError,
          'Unable to resend OTP right now. Please try again.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const stepIndex = step === 'email' ? 1 : step === 'otp' ? 2 : 3;

  function stepClasses(targetStep: number): string {
    if (stepIndex === targetStep) {
      return 'border-[#2F3FBF]/40 bg-[#2F3FBF]/10 text-[#2F3FBF] dark:border-indigo-300/45 dark:bg-indigo-400/15 dark:text-indigo-200';
    }

    if (stepIndex > targetStep) {
      return 'border-emerald-300/60 bg-emerald-50 text-emerald-700 dark:border-emerald-400/45 dark:bg-emerald-500/15 dark:text-emerald-200';
    }

    return 'border-gray-200 bg-white text-gray-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300';
  }

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:p-5 ${className}`}
    >
      <div className="mb-4">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${stepClasses(1)}`}
          >
            Step 1
          </span>
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${stepClasses(2)}`}
          >
            Step 2
          </span>
          <span
            className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${stepClasses(3)}`}
          >
            Step 3
          </span>
        </div>
      </div>

      {step === 'email' ? (
        <form
          onSubmit={handleSendOtp}
          className="space-y-4"
          noValidate
        >
          <div>
            <label
              htmlFor="diu-email"
              className="block text-sm font-semibold text-gray-900 dark:text-slate-100"
            >
              DIU email address
            </label>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              Use your university email to verify your account.
            </p>
            <input
              id="diu-email"
              type="email"
              autoComplete="email"
              placeholder="yourname@diu.edu.bd"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none ring-0 transition-colors placeholder:text-gray-400 focus:border-[#2F3FBF] dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-300"
            />
          </div>

          {error ? (
            <p className="text-xs font-medium text-rose-600 dark:text-rose-300">
              {error}
            </p>
          ) : null}

          {infoMessage ? (
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              {infoMessage}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-2.5">
            {onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
              >
                Cancel
              </button>
            ) : null}
            <Button
              type="submit"
              className="h-10 px-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send OTP'}
            </Button>
          </div>
        </form>
      ) : null}

      {step === 'otp' ? (
        <form
          onSubmit={handleVerify}
          className="space-y-4"
          noValidate
        >
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
              Enter verification code
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
              We sent an OTP to {trimmedEmail}.
            </p>
            <input
              id="diu-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter OTP"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none ring-0 transition-colors placeholder:text-gray-400 focus:border-[#2F3FBF] dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-300"
            />
          </div>

          {error ? (
            <p className="text-xs font-medium text-rose-600 dark:text-rose-300">
              {error}
            </p>
          ) : null}

          {infoMessage ? (
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              {infoMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isSubmitting}
              className="text-xs font-semibold text-[#2F3FBF] underline-offset-2 transition-colors hover:text-[#2535a8] hover:underline dark:text-indigo-300 dark:hover:text-indigo-200"
            >
              Resend code
            </button>
            <Button
              type="submit"
              className="h-10 px-5"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying...' : 'Verify'}
            </Button>
          </div>
        </form>
      ) : null}

      {step === 'success' ? (
        <div className="space-y-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
            You’re verified. You can now contact sellers on DIUPoint.
          </p>

          {!autoCompleteOnSuccess && onVerified ? (
            <div className="pt-1">
              <Button
                type="button"
                onClick={() => void onVerified(trimmedEmail)}
                className="h-10 px-4"
              >
                Continue
              </Button>
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Taking you back now...
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
