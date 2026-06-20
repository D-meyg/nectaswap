/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { useToast } from "@/hooks/ui/useToast";

export function useFreezeAccount() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (userId: string) =>
      userService.restrictUser({ user_id: userId, status: true }),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });

      toast.show({
        type: "success",
        title: "Account Frozen",
        message: "The user has been successfully restricted.",
      });
    },
    onError: (error: any) => {
      toast.show({
        type: "error",
        title: "Action Failed",
        message: error.response?.data?.message || "Failed to freeze account.",
      });
    },
  });
}

export function useUnfreezeAccount() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (userId: string) =>
      userService.restrictUser({ user_id: userId, status: false }),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });

      toast.show({
        type: "success",
        title: "Account Unfrozen",
        message: "The user's restrictions have been lifted.",
      });
    },
  });
}

export function useExecuteWalletAction() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: userService.executeWalletAction,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users", variables.user_id] });

      toast.show({
        type: "success",
        title: "Wallet Updated",
        message: `Successfully executed ${variables.action}.`,
      });
    },
  });
}
