/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

// ── Notification history ──────────────────────────────────

export function useNotifications(page = 1, limit = 20) {
  return useQuery<unknown[]>({
    queryKey: ["notifications", page, limit],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.NOTIFICATIONS.LIST, {
        params: { page, limit },
      });
      // API returns { data: { data: [...], ... } } — unwrap inner list
      return data?.data?.data ?? data?.data ?? data ?? [];
    },
    staleTime: 60_000,
  });
}

// ── Send / create notification ────────────────────────────

export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await client.post(
        ENDPOINTS.NOTIFICATIONS.CREATE,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
