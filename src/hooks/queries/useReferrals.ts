import { useQuery } from "@tanstack/react-query";
import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { unwrapApiList, unwrapApiObject } from "@/utils/apiData";

export function useReferralStats() {
  return useQuery<unknown>({
    queryKey: ["referrals", "stats"],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.REFERRALS.STATS);
      return unwrapApiObject(data, {});
    },
    staleTime: 60_000,
  });
}

export function useReferrers() {
  return useQuery<unknown[]>({
    queryKey: ["referrals", "referrers"],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.REFERRALS.REFERRERS);
      return unwrapApiList(data, ["referrers"]);
    },
    staleTime: 60_000,
  });
}

export function useReferredUsers() {
  return useQuery<unknown[]>({
    queryKey: ["referrals", "referred-users"],
    queryFn: async () => {
      const { data } = await client.get(ENDPOINTS.REFERRALS.REFERRED_USERS);
      return unwrapApiList(data, ["referred_users", "users"]);
    },
    staleTime: 60_000,
  });
}
