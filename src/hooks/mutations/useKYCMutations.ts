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
