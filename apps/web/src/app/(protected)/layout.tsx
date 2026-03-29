import ProtectedRouteGuard from './protected-route-guard';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRouteGuard>
      <div className="min-h-screen bg-gray-50 transition-colors duration-200 dark:bg-slate-950">
        {children}
      </div>
    </ProtectedRouteGuard>
  );
}
