import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import type { LoginPayload, AcceptInvitePayload } from "@/api/types";

export const authService = {
  login: async (payload: LoginPayload) => {
    const { data } = await client.post(ENDPOINTS.AUTH.LOGIN, payload);
    return data;
  },

  verifyOtp: async (payload: { v_id: string; otp: string }) => {
    const { data } = await client.post(ENDPOINTS.AUTH.VERIFY_OTP, payload);
    return data;
  },

  acceptInvitation: async (payload: AcceptInvitePayload) => {
    const { data } = await client.post(
      ENDPOINTS.AUTH.ACCEPT_INVITATION,
      payload,
    );
    return data;
  },

  forgotPassword: async (payload: { email: string }) => {
    const { data } = await client.post(ENDPOINTS.AUTH.PASSWORD_FORGOT, payload);
    return data;
  },

  resetPassword: async (payload: {
    v_id: string;
    otp: string;
    new_password: string;
  }) => {
    const { data } = await client.post(ENDPOINTS.AUTH.PASSWORD_RESET, payload);
    return data;
  },

  refresh: async (refreshToken: string) => {
    const { data } = await client.post(
      ENDPOINTS.AUTH.REFRESH,
      {},
      { headers: { "refresh-token": refreshToken } },
    );
    return data;
  },
};
