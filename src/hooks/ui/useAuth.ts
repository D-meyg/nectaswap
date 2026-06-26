/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { unwrapApiData } from "@/utils/apiData";

export function useAuth() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      const payload = unwrapApiData<any>(response, {});
      const user = payload.user || payload.admin || payload.data?.user;
      const token =
        payload.access_token ||
        payload.token ||
        payload.data?.access_token ||
        payload.data?.token;
      const refreshToken =
        payload.refresh_token ||
        payload.refreshToken ||
        payload.data?.refresh_token ||
        payload.data?.refreshToken ||
        "";

      if (!user || !token) {
        toast.error("Login response missing user or token");
        return;
      }

      setAuth(user, token, refreshToken);
      toast.success(`Welcome back, ${user.name || user.email || "Admin"}`);
    },
    onError: () => toast.error("Invalid email or password"),
  });

  return {
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    logout: clearAuth,
    loginPending: loginMutation.isPending,
  };
}
