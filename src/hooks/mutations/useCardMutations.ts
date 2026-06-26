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
  });
}
