import AuthRouteGuard from './auth-route-guard';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthRouteGuard>
      <div className="min-h-screen bg-white transition-colors duration-200 dark:bg-slate-950">
        {children}
      </div>
    </AuthRouteGuard>
  );
}
