import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { useToast } from "@/hooks/ui/useToast";

export function useInviteAdmin() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: adminService.inviteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.show({
        type: "success",
        title: "Invite Sent",
        message: "Admin invitation dispatched.",
      });
    },
  });
}

export function useUpdateAdminRole() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: adminService.updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.show({
        type: "success",
        title: "Role Updated",
        message: "Admin permissions modified.",
      });
    },
  });
}

export function useSuspendAdmin() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: adminService.suspendAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      toast.show({
        type: "success",
        title: "Admin Suspended",
        message: "Admin access has been revoked.",
      });
    },
  });
}