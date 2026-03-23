import Footer from '@/components/layout/footer';
import Navbar from '@/components/layout/navbar';
import PostItemForm from '@/components/listing/post-item-form';
import Container from '@/components/ui/container';

export default function PostItemPage() {
  return (
    <div className="min-h-screen bg-gray-50 transition-colors duration-200 dark:bg-slate-950">
      <Navbar />

      <main>
        <Container className="py-6 sm:py-8 lg:py-10">
          <section className="mx-auto w-full max-w-3xl">
            <div className="mb-4 sm:mb-5">
              <h1 className="text-2xl font-black tracking-tight text-gray-950 dark:text-slate-100 sm:text-3xl">
                Post an Item
              </h1>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                Create a listing for DIUPoint buyers using your current account.
              </p>
            </div>

            <PostItemForm />
          </section>
        </Container>
      </main>

      <div className="bg-white dark:bg-slate-900">
        <Footer />
      </div>
    </div>
  );
}
