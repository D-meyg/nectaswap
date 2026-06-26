import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import type { UserDetail, ActivityEvent, Note, KYCHistoryEvent, Card } from "@/api/types";

export function useUserDetail(userId: string) {
  return useQuery<UserDetail>({
    queryKey: ["users", userId, "detail"],
    queryFn: async () => {
      const res = await userService.getUserDetail(userId);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useUserCards(userId: string) {
  return useQuery<Card[]>({
    queryKey: ["users", userId, "cards"],
    queryFn: async () => {
      const res = await userService.getUserCards(userId);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useKYCHistory(userId: string) {
  return useQuery<KYCHistoryEvent[]>({
    queryKey: ["users", userId, "kyc"],
    queryFn: async () => {
      const res = await userService.getUserKYC(userId);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useUserActivity(userId: string) {
  return useQuery<ActivityEvent[]>({
    queryKey: ["users", userId, "activity"],
    queryFn: async () => {
      const res = await userService.getUserActivity(userId);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useUserNotes(userId: string) {
  return useQuery<Note[]>({
    queryKey: ["users", userId, "notes"],
    queryFn: async () => {
      const res = await userService.getUserNotes(userId);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useUserAuditLog(userId: string) {
  return useQuery<unknown[]>({
    queryKey: ["users", userId, "audit-log"],
    queryFn: async () => {
      const res = await userService.getUserAuditLog(userId);
      return res.data;
    },
    enabled: !!userId,
  });
}
