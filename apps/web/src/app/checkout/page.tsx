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

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { items, isLoading, subtotal, refreshCart } = useCart();

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

    if (!contactName.trim()) {
      setError('Contact name is required.');
      return;
    }

    if (!contactPhone.trim()) {
      setError('Contact phone is required.');
      return;
    }

    if (!deliveryNote.trim()) {
      setError('Please add a delivery or pickup note.');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createOrder({ paymentMethod });
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
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-400/35 dark:bg-emerald-500/10 sm:p-6">
                <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                  Order placed successfully
                </h2>
                <p className="mt-1.5 text-sm text-emerald-700 dark:text-emerald-300">
                  {successMessage}
                </p>
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <Link
                    href="/search"
                    className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2F3FBF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2535a8]"
                  >
                    Continue Shopping
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-emerald-200 bg-white px-4 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-400/35 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                  >
                    Go Home
                  </Link>
                </div>
              </div>
            ) : isAuthLoading || isLoading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 sm:p-6">
                Loading checkout...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center dark:border-white/10 dark:bg-slate-900 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                  Your cart is empty.
                </h2>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                  Add store items to your cart before checkout.
                </p>
                <Link
                  href="/search"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#2F3FBF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2535a8]"
                >
                  Browse Listings
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
                <form
                  onSubmit={handlePlaceOrder}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 sm:p-5"
                  noValidate
                >
                  <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
                    Contact and Delivery
                  </h2>

                  <div className="mt-3 space-y-3">
                    <label className="flex flex-col gap-1.5 text-sm text-gray-700 dark:text-slate-200">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Contact Name
                      </span>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(event) => setContactName(event.target.value)}
                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-[#2F3FBF]/65 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </label>

                    <label className="flex flex-col gap-1.5 text-sm text-gray-700 dark:text-slate-200">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Contact Phone
                      </span>
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(event) =>
                          setContactPhone(event.target.value)
                        }
                        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors focus:border-[#2F3FBF]/65 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </label>

                    <label className="flex flex-col gap-1.5 text-sm text-gray-700 dark:text-slate-200">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        Delivery / Pickup Note
                      </span>
                      <textarea
                        value={deliveryNote}
                        onChange={(event) =>
                          setDeliveryNote(event.target.value)
                        }
                        rows={4}
                        placeholder="Example: Pickup from campus gate after 3pm"
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-[#2F3FBF]/65 focus:ring-2 focus:ring-[#2F3FBF]/12 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
                      />
                    </label>
                  </div>

                  <h3 className="mt-5 text-sm font-bold text-gray-900 dark:text-slate-100">
                    Payment Method
                  </h3>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 transition-colors hover:border-[#2F3FBF]/45 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                      />
                      Cash on Delivery
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 transition-colors hover:border-[#2F3FBF]/45 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="BKASH"
                        checked={paymentMethod === 'BKASH'}
                        onChange={() => setPaymentMethod('BKASH')}
                      />
                      bKash
                    </label>
                  </div>

                  {error ? (
                    <p className="mt-4 text-sm font-medium text-rose-600 dark:text-rose-300">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#2F3FBF] px-4 text-sm font-medium text-white transition-colors hover:bg-[#2535a8] disabled:opacity-50"
                  >
                    {isSubmitting ? 'Placing Order...' : 'Place Order'}
                  </button>
                </form>

                <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900 sm:p-5">
                  <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
                    Order Summary
                  </h2>
                  <div className="mt-3 space-y-2">
                    {items.map((item) => {
                      const unitPrice = toPrice(item.unitPrice);
                      return (
                        <div
                          key={item.id}
                          className="rounded-lg border border-gray-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-950"
                        >
                          <p className="line-clamp-1 text-sm font-medium text-gray-900 dark:text-slate-100">
                            {item.listing.title}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
                            {item.quantity} x ৳ {unitPrice.toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>Items</span>
                      <span>{summary.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span>৳ {summary.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total</span>
                      <span className="font-semibold text-gray-900 dark:text-slate-100">
                        ৳ {summary.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
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
