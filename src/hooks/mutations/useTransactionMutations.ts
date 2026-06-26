import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "@/services/transactionService";
import { useToast } from "@/hooks/ui/useToast";

export function useApproveTransactionFlag() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ flagId, notes }: { flagId: string; notes?: string }) =>
      transactionService.approveFlag(flagId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions", "pending-approvals"],
      });
      toast.show({
        type: "success",
        title: "Approved",
        message: "Transaction flag approved.",
      });
    },
  });
}

export function useRejectTransactionFlag() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ flagId, notes }: { flagId: string; notes?: string }) =>
      transactionService.rejectFlag(flagId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions", "pending-approvals"],
      });
      toast.show({
        type: "success",
        title: "Rejected",
        message: "Transaction flag rejected.",
      });
    },
  });
}

export function useRetryFailedTransaction() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: transactionService.retryFailed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", "failed"] });
      toast.show({
        type: "success",
        title: "Retrying",
        message: "Transaction retry initiated.",
      });
    },
  });
}

export function useResolveFailedTransaction() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: transactionService.resolveFailed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", "failed"] });
      toast.show({
        type: "success",
        title: "Resolved",
        message: "Transaction marked as resolved.",
      });
    },
  });
}
