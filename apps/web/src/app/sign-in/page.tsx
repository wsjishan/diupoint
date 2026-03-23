import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import SignInForm from '@/components/account/sign-in-form';
import Container from '@/components/ui/container';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white transition-colors duration-200 dark:bg-slate-950">
      <Navbar />

      <main className="relative isolate overflow-hidden py-12 sm:py-14">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-[#fcfdff] via-[#f5f8ff] to-[#edf2ff] dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(47,63,191,0.08),transparent_46%),radial-gradient(circle_at_bottom,rgba(56,189,248,0.06),transparent_42%)] dark:bg-[radial-gradient(circle_at_50%_25%,rgba(99,102,241,0.18),transparent_42%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.08),transparent_40%)]" />

        <Container className="relative">
          <section className="mx-auto w-full max-w-md rounded-3xl border border-white/85 bg-white/90 p-5 shadow-[0_26px_70px_-28px_rgba(15,23,42,0.4),0_10px_30px_-20px_rgba(15,23,42,0.25)] backdrop-blur-sm dark:border-white/12 dark:bg-slate-900/82 dark:shadow-[0_30px_72px_-24px_rgba(2,6,23,0.86),0_12px_32px_-22px_rgba(15,23,42,0.62)] sm:p-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-slate-100">
                Sign in to DIUPoint
              </h1>
            </div>

            <div className="mt-4">
              <SignInForm />
            </div>
          </section>
        </Container>
      </main>

      <div className="bg-gray-50 dark:bg-slate-900">
        <Footer />
      </div>
    </div>
  );
}
