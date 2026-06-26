import { useMutation, useQueryClient } from "@tanstack/react-query";
import { kycService } from "@/services/kycService";
import { useToast } from "@/hooks/ui/useToast";

export function useReviewKYCApplication() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      id,
      action,
      rejection_reason,
    }: {
      id: string;
      action: "approve" | "reject";
      rejection_reason?: string;
    }) => kycService.reviewApplication(id, { action, rejection_reason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["kyc"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "kyc-queue"] });

      toast.show({
        type: "success",
        title: "Application Reviewed",
        message: `The KYC application was successfully ${variables.action}ed.`,
      });
    },
    onError: (error: Error) => {
      toast.show({
        type: "error",
        title: "Review Failed",
        message: error.message || "Failed to process the KYC review.",
      });
    },
  });
}

export function useApproveKYC() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) =>
      kycService.reviewApplication(id, { action: "approve" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "kyc-queue"] });
      toast.show({ type: "success", title: "KYC Approved", message: "Application has been approved." });
    },
    onError: (error: Error) => {
      toast.show({ type: "error", title: "Approval Failed", message: error.message || "Failed to approve application." });
    },
  });
}

export function useRejectKYC() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      kycService.reviewApplication(id, { action: "reject", rejection_reason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "kyc-queue"] });
      toast.show({ type: "success", title: "KYC Rejected", message: "Application has been rejected." });
    },
    onError: (error: Error) => {
      toast.show({ type: "error", title: "Rejection Failed", message: error.message || "Failed to reject application." });
    },
  });
}

export function useRequestResubmission() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      kycService.requestResubmission(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kyc"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.show({ type: "success", title: "Resubmission Requested", message: "User has been asked to resubmit their KYC." });
    },
    onError: (error: Error) => {
      toast.show({ type: "error", title: "Request Failed", message: error.message || "Failed to request resubmission." });
    },
  });
}
