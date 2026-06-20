import { useQuery } from "@tanstack/react-query";
import { settingsService } from "@/services/settingsService";
import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export function useGeneralSettings() {
  return useQuery<unknown>({
    queryKey: ["settings", "general"],
    queryFn: async () => {
      const res = await settingsService.getGeneralSettings();
      return res.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useApiKeys() {
  return useQuery<unknown[]>({
    queryKey: ["settings", "api-keys"],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.API_KEYS.LIST);
      return data.data;
    },
    staleTime: 60_000,
  });
}
