/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { complianceService } from "@/services/complianceService";
import { useToast } from "@/hooks/ui/useToast";

export function useUpdateFlaggedUser() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: complianceService.updateFlaggedUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["compliance", "flagged-users"],
      });
      toast.show({
        type: "success",
        title: "Status Updated",
        message: "User compliance flag updated.",
      });
    },
  });
}

export function useUpdateRiskRule() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      complianceService.updateRiskRule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance", "risk-rules"] });
      toast.show({
        type: "success",
        title: "Rule Updated",
        message: "Risk threshold modified successfully.",
      });
    },
  });
}