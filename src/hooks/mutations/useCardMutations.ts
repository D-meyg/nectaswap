import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cardService } from "@/services/cardService";
import { useToast } from "@/hooks/ui/useToast";

export function useFreezeCard() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: cardService.freezeCard,
    onSuccess: (_, cardId) => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["cards", cardId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });

      toast.show({
        type: "success",
        title: "Card Frozen",
        message: "The card has been temporarily locked.",
      });
    },
  });
}

export function useUnfreezeCard() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: cardService.unfreezeCard,
    onSuccess: (_, cardId) => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["cards", cardId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });

      toast.show({
        type: "success",
        title: "Card Unfrozen",
        message: "The card has been unlocked successfully.",
      });
    },
  });
}

export function useIssueCard() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: cardService.issueCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.show({ type: "success", title: "Card Issued", message: "A new card has been issued successfully." });
    },
    onError: (error: Error) => {
      toast.show({ type: "error", title: "Issue Failed", message: error.message || "Failed to issue card." });
    },
  });
}

export function useUpdateCardLimits() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: cardService.updateLimits,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({
        queryKey: ["cards", variables.card_id],
      });

      toast.show({
        type: "success",
        title: "Limits Updated",
        message: "Card spending limits have been adjusted.",
      });
    },
    onError: (error: any) => {
      toast.show({
        type: "error",
        title: "Update Failed",
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Could not update the card limits.",
      });
    },
  });
}

export function useResetCardPin() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: cardService.resetPin,
    onSuccess: (_, cardId) => {
      queryClient.invalidateQueries({ queryKey: ["cards", cardId] });
      toast.show({ type: "success", title: "PIN Reset", message: "A card PIN reset has been initiated." });
    },
    onError: (error: Error) => {
      toast.show({ type: "error", title: "Reset Failed", message: error.message || "Could not reset the card PIN." });
    },
  });
}

export function useReplaceCard() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: cardService.replaceCard,
    onSuccess: (_, cardId) => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["cards", cardId] });
      toast.show({ type: "success", title: "Replacement Issued", message: "A replacement card has been issued." });
    },
    onError: (error: Error) => {
      toast.show({ type: "error", title: "Replace Failed", message: error.message || "Could not issue a replacement card." });
    },
  });
}

export function useTerminateCard() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: cardService.terminateCard,
    onSuccess: (_, cardId) => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["cards", cardId] });
      toast.show({ type: "success", title: "Card Terminated", message: "The card has been permanently terminated." });
    },
    onError: (error: Error) => {
      toast.show({ type: "error", title: "Terminate Failed", message: error.message || "Could not terminate the card." });
    },
  });
}
