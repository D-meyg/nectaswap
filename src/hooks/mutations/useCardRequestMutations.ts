import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cardRequestService } from "@/services/cardRequestService";
import { useToast } from "@/hooks/ui/useToast";

function useInvalidateCardRequests() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["card-requests"] });
}

export function useApproveCardRequest() {
  const invalidate = useInvalidateCardRequests();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => cardRequestService.approve(id),
    onSuccess: () => {
      invalidate();
      toast.show({ type: "success", title: "Request Approved", message: "The card request has been approved." });
    },
    onError: (error: Error) => {
      toast.show({ type: "error", title: "Approve Failed", message: error.message || "Could not approve the request." });
    },
  });
}

export function useRejectCardRequest() {
  const invalidate = useInvalidateCardRequests();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => cardRequestService.reject(id),
    onSuccess: () => {
      invalidate();
      toast.show({ type: "success", title: "Request Rejected", message: "The card request has been rejected." });
    },
    onError: (error: Error) => {
      toast.show({ type: "error", title: "Reject Failed", message: error.message || "Could not reject the request." });
    },
  });
}

export function useAssignCardRequest() {
  const invalidate = useInvalidateCardRequests();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: Record<string, unknown> }) =>
      cardRequestService.assign(id, payload),
    onSuccess: () => {
      invalidate();
      toast.show({ type: "success", title: "Request Assigned", message: "The card request has been assigned." });
    },
    onError: (error: Error) => {
      toast.show({ type: "error", title: "Assign Failed", message: error.message || "Could not assign the request." });
    },
  });
}

export function useRequestMoreInfo() {
  const invalidate = useInvalidateCardRequests();
  const toast = useToast();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: Record<string, unknown> }) =>
      cardRequestService.requestInfo(id, payload),
    onSuccess: () => {
      invalidate();
      toast.show({ type: "info", title: "Info Requested", message: "A request for more information has been sent." });
    },
    onError: (error: Error) => {
      toast.show({ type: "error", title: "Request Failed", message: error.message || "Could not send the request." });
    },
  });
}
