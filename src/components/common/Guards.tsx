import { Navigate, Outlet } from "react-router-dom";
import { Suspense } from "react";
import { useAuthStore } from "@/store/authStore";
import { TableSkeleton } from "@/components/ui/Skeleton";

export function PageLoader() {
  return (
    <div className="p-8">
      <TableSkeleton />
    </div>
  );
}

export function AuthGuard() {
  const isAuthed = useAuthStore((s) => s.isAuthed);
  if (!isAuthed) return <Navigate to="/login" replace />;
  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
}

export function GuestGuard() {
  const isAuthed = useAuthStore((s) => s.isAuthed);
  if (isAuthed) return <Navigate to="/" replace />;
  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
}