import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div suppressHydrationWarning className="min-h-screen bg-white transition-colors duration-200 dark:bg-slate-950">
      <Navbar />
      {children}
      <div className="border-t border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-slate-900">
        <Footer />
      </div>
    </div>
  );
}
