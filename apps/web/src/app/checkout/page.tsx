'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import Container from '@/components/ui/container';
import { createOrder } from '@/lib/api/orders';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/cart/cart-context';

function toPrice(value: number | string): number {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

interface CheckoutFieldErrors {
  contactName?: string;
  contactPhone?: string;
  deliveryNote?: string;
  paymentMethod?: string;
}

function isValidBdPhone(value: string): boolean {
  const normalized = value.trim();
  return /^(?:\+?88)?01[3-9]\d{8}$/.test(normalized);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { items, isLoading, subtotal, refreshCart } = useCart();

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/sign-in?returnTo=%2Fcheckout');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    void refreshCart();
  }, [isAuthenticated, isAuthLoading, refreshCart]);

  const summary = useMemo(() => {
    return {
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      total: subtotal,
    };
  }, [items, subtotal]);

  async function handlePlaceOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setFieldErrors({});

    const nextFieldErrors: CheckoutFieldErrors = {};

    if (!contactName.trim()) {
      nextFieldErrors.contactName = 'Full name is required.';
    }

    if (!contactPhone.trim()) {
      nextFieldErrors.contactPhone = 'Phone number is required.';
    } else if (!isValidBdPhone(contactPhone)) {
      nextFieldErrors.contactPhone = 'Enter a valid phone number.';
    }

    if (!deliveryNote.trim()) {
      nextFieldErrors.deliveryNote =
        'Campus address, hall, or pickup note is required.';
    }

    if (!paymentMethod) {
      nextFieldErrors.paymentMethod = 'Please select a payment method.';
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setError('Please fix the highlighted fields.');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (paymentMethod !== 'COD' && paymentMethod !== 'BKASH') {
      setError('Please select a payment method.');
      return;
    }

    const selectedPaymentMethod: 'COD' | 'BKASH' = paymentMethod;

    setIsSubmitting(true);

    try {
      const response = await createOrder({
        paymentMethod: selectedPaymentMethod,
      });
      await refreshCart();
      setSuccessMessage(
        `${response.message} ${response.summary.orderCount} order${response.summary.orderCount === 1 ? '' : 's'} created.`
      );
    } catch {
      setError('Unable to place order right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200 dark:bg-slate-950">
      <Navbar />

      <main>
        <Container className="py-6 sm:py-8 lg:py-10">
          <section className="mx-auto w-full max-w-6xl">
            <div className="mb-5">
              <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-slate-100 sm:text-3xl">
                Checkout
              </h1>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                Confirm your order and place it.
              </p>
            </div>

            {successMessage ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm shadow-emerald-900/5 dark:border-emerald-400/35 dark:bg-emerald-500/10 sm:p-8">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200 bg-white text-emerald-700 dark:border-emerald-400/35 dark:bg-slate-900 dark:text-emerald-300">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h2 className="mt-4 text-lg font-bold text-emerald-800 dark:text-emerald-300">
                  Order placed successfully
                </h2>
                <p className="mt-1.5 text-sm text-emerald-700 dark:text-emerald-300">
                  {successMessage}
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <Link
                    href="/search"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-[#2F3FBF] px-4 text-sm font-semibold text-white shadow-sm shadow-[#2F3FBF]/25 transition-colors hover:bg-[#2535a8]"
                  >
                    Continue Shopping
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-emerald-200 bg-white px-4 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-400/35 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                  >
                    Go Home
                  </Link>
                </div>
              </div>
            ) : isAuthLoading || isLoading ? (
              <div className="rounded-3xl border border-gray-200/80 bg-white p-5 text-sm text-gray-600 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 sm:p-6">
                Loading checkout...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-3xl border border-gray-200/80 bg-white p-7 text-center shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 sm:p-9">
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  Your cart is empty
                </h2>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                  Add store items to your cart before checkout.
                </p>
                <Link
                  href="/search"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-[#2F3FBF] px-4 text-sm font-semibold text-white shadow-sm shadow-[#2F3FBF]/25 transition-colors hover:bg-[#2535a8]"
                >
                  Browse Listings
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)] lg:items-start">
                <form
                  id="checkout-form"
                  onSubmit={handlePlaceOrder}
                  className="space-y-4"
                  noValidate
                >
                  <section className="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 sm:p-6">
                    <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-slate-100">
                      Contact and Delivery
                    </h2>

                    <div className="mt-4 grid grid-cols-1 gap-3">
                      <label className="flex flex-col gap-1.5 text-sm text-gray-700 dark:text-slate-200">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                          Full Name
                        </span>
                        <input
                          type="text"
                          value={contactName}
                          onChange={(event) =>
                            setContactName(event.target.value)
                          }
                          className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-[#2F3FBF]/65 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:bg-slate-950 dark:text-slate-100 ${
                            fieldErrors.contactName
                              ? 'border-rose-300 dark:border-rose-400/40'
                              : 'border-gray-200 dark:border-white/10'
                          }`}
                        />
                        {fieldErrors.contactName ? (
                          <span className="text-xs font-medium text-rose-600 dark:text-rose-300">
                            {fieldErrors.contactName}
                          </span>
                        ) : null}
                      </label>

                      <label className="flex flex-col gap-1.5 text-sm text-gray-700 dark:text-slate-200">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                          Phone Number
                        </span>
                        <input
                          type="tel"
                          value={contactPhone}
                          onChange={(event) =>
                            setContactPhone(event.target.value)
                          }
                          placeholder="01XXXXXXXXX"
                          className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-[#2F3FBF]/65 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:bg-slate-950 dark:text-slate-100 ${
                            fieldErrors.contactPhone
                              ? 'border-rose-300 dark:border-rose-400/40'
                              : 'border-gray-200 dark:border-white/10'
                          }`}
                        />
                        {fieldErrors.contactPhone ? (
                          <span className="text-xs font-medium text-rose-600 dark:text-rose-300">
                            {fieldErrors.contactPhone}
                          </span>
                        ) : null}
                      </label>

                      <label className="flex flex-col gap-1.5 text-sm text-gray-700 dark:text-slate-200">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                          Campus Address / Hall / Pickup Note
                        </span>
                        <textarea
                          value={deliveryNote}
                          onChange={(event) =>
                            setDeliveryNote(event.target.value)
                          }
                          rows={4}
                          placeholder="Example: Fazlul Huq Hall gate, after 4:30 PM"
                          className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#2F3FBF]/65 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:bg-slate-950 dark:text-slate-100 ${
                            fieldErrors.deliveryNote
                              ? 'border-rose-300 dark:border-rose-400/40'
                              : 'border-gray-200 dark:border-white/10'
                          }`}
                        />
                        {fieldErrors.deliveryNote ? (
                          <span className="text-xs font-medium text-rose-600 dark:text-rose-300">
                            {fieldErrors.deliveryNote}
                          </span>
                        ) : null}
                      </label>
                    </div>
                  </section>

                  <section className="rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 sm:p-6">
                    <h3 className="text-base font-bold tracking-tight text-gray-900 dark:text-slate-100">
                      Payment Method
                    </h3>
                    <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      <label
                        className={`flex cursor-pointer items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-sm transition-colors ${
                          paymentMethod === 'COD'
                            ? 'border-[#2F3FBF]/55 bg-[#2F3FBF]/5 text-gray-900 dark:text-slate-100'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#2F3FBF]/35 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="COD"
                          checked={paymentMethod === 'COD'}
                          onChange={() => setPaymentMethod('COD')}
                          className="mt-0.5"
                        />
                        <span>
                          <span className="block font-semibold">
                            Cash on Delivery
                          </span>
                          <span className="mt-0.5 block text-xs text-gray-500 dark:text-slate-400">
                            Pay when you receive the order
                          </span>
                        </span>
                      </label>

                      <label
                        className={`flex cursor-pointer items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-sm transition-colors ${
                          paymentMethod === 'BKASH'
                            ? 'border-[#2F3FBF]/55 bg-[#2F3FBF]/5 text-gray-900 dark:text-slate-100'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-[#2F3FBF]/35 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="BKASH"
                          checked={paymentMethod === 'BKASH'}
                          onChange={() => setPaymentMethod('BKASH')}
                          className="mt-0.5"
                        />
                        <span>
                          <span className="block font-semibold">bKash</span>
                          <span className="mt-0.5 block text-xs text-gray-500 dark:text-slate-400">
                            Complete payment via bKash
                          </span>
                        </span>
                      </label>
                    </div>

                    {fieldErrors.paymentMethod ? (
                      <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-300">
                        {fieldErrors.paymentMethod}
                      </p>
                    ) : null}
                  </section>

                  {error ? (
                    <p className="text-sm font-medium text-rose-600 dark:text-rose-300">
                      {error}
                    </p>
                  ) : null}
                </form>

                <aside className="h-fit rounded-3xl border border-gray-200/80 bg-white p-5 shadow-md shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900 sm:p-6 lg:sticky lg:top-24">
                  <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-slate-100">
                    Order Summary
                  </h2>
                  <div className="mt-3 max-h-56 space-y-2 overflow-auto pr-1">
                    {items.map((item) => {
                      const unitPrice = toPrice(item.unitPrice);
                      const itemTotal = unitPrice * item.quantity;
                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-gray-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-950"
                        >
                          <p className="line-clamp-1 text-sm font-medium text-gray-900 dark:text-slate-100">
                            {item.listing.title}
                          </p>
                          <div className="mt-1 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                            <span>
                              {item.quantity} x ৳ {unitPrice.toLocaleString()}
                            </span>
                            <span className="font-semibold text-gray-700 dark:text-slate-200">
                              ৳ {itemTotal.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 space-y-2.5 text-sm text-gray-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>Items</span>
                      <span>{summary.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span>৳ {summary.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="my-2 h-px bg-gray-100 dark:bg-white/10" />
                    <div className="flex items-center justify-between text-[15px]">
                      <span>Total</span>
                      <span className="font-semibold text-gray-900 dark:text-slate-100">
                        ৳ {summary.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={isSubmitting}
                    className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#2F3FBF] px-4 text-sm font-semibold text-white shadow-sm shadow-[#2F3FBF]/30 transition-colors hover:bg-[#2535a8] disabled:opacity-50"
                  >
                    {isSubmitting ? 'Placing Order...' : 'Place Order'}
                  </button>

                  <p className="mt-3 text-xs text-gray-500 dark:text-slate-400">
                    By placing your order, you agree to coordinate delivery with
                    the store.
                  </p>
                </aside>
              </div>
            )}
          </section>
        </Container>
      </main>

      <div className="bg-white dark:bg-slate-900">
        <Footer />
      </div>
    </div>
  );
}
