import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teamService, type InviteAdminPayload } from "@/services/teamService";
import { useToast } from "@/hooks/ui/useToast";

export function useInviteAdmin() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (payload: InviteAdminPayload) => teamService.inviteAdmin(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", "list"] });
      toast.show({ type: "success", title: "Admin Invited", message: "An invitation has been sent." });
    },
    onError: (error: Error) => {
      toast.show({ type: "error", title: "Invite Failed", message: error.message || "Could not invite the admin." });
    },
  });
}

export function useUpdateAdminRole() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (payload: { admin_id: string; role_id: string }) => teamService.updateAdminRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", "list"] });
      toast.show({ type: "success", title: "Role Updated", message: "The admin's role has been updated." });
    },
    onError: (error: Error) => {
      toast.show({ type: "error", title: "Update Failed", message: error.message || "Could not update the role." });
    },
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation({
    mutationFn: (id: string) => teamService.deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", "list"] });
      toast.show({ type: "success", title: "Admin Removed", message: "The admin account has been deleted." });
    },
    onError: (error: Error) => {
      toast.show({ type: "error", title: "Delete Failed", message: error.message || "Could not delete the admin." });
    },
  });
}
