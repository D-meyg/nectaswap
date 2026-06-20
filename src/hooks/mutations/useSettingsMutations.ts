/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/settingsService";
import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { useToast } from "@/hooks/ui/useToast";

export function useUpdateFeesAndLimits() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: settingsService.updateFeesAndLimits,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.show({
        type: "success",
        title: "Settings Saved",
        message: "Global fees and limits updated.",
      });
    },
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await client.post(ENDPOINTS.API_KEYS.CREATE, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "api-keys"] });
      toast.show({
        type: "success",
        title: "API Key Created",
        message: "New API key generated successfully.",
      });
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await client.patch(ENDPOINTS.API_KEYS.REVOKE(id));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "api-keys"] });
      toast.show({
        type: "success",
        title: "Key Revoked",
        message: "API access revoked for this key.",
      });
    },
  });
}

export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: settingsService.updateSecurity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.show({
        type: "success",
        title: "Security Saved",
        message: "Security settings updated.",
      });
    },
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: settingsService.updateNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.show({
        type: "success",
        title: "Notifications Saved",
        message: "Notification settings updated.",
      });
    },
  });
}

export function useUpdateAdvancedSettings() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: settingsService.updateAdvanced,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.show({
        type: "success",
        title: "Advanced Saved",
        message: "Advanced settings updated.",
      });
    },
  });
}
