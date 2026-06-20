import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const settingsService = {
  getGeneralSettings: async () => {
    const { data } = await client.get(ENDPOINTS.SETTINGS.GENERAL);
    return data;
  },

  updateFeesAndLimits: async (payload: {
    max_slippage: number;
    min_transaction_fee: number;
    max_transaction_fee: number;
    default_gas_limit: number;
  }) => {
    const { data } = await client.patch(
      ENDPOINTS.SETTINGS.FEES_LIMITS,
      payload,
    );
    return data;
  },

  updateSecurity: async (payload: {
    require_2fa: boolean;
    require_kyc: boolean;
    auto_suspend_suspicious: boolean;
  }) => {
    const { data } = await client.patch(ENDPOINTS.SETTINGS.SECURITY, payload);
    return data;
  },

  updateNotifications: async (payload: {
    push_notifications_enabled: boolean;
    email_alerts_enabled: boolean;
  }) => {
    const { data } = await client.patch(
      ENDPOINTS.SETTINGS.NOTIFICATIONS,
      payload,
    );
    return data;
  },

  updateAdvanced: async (payload: { maintenance_mode: boolean }) => {
    const { data } = await client.patch(ENDPOINTS.SETTINGS.ADVANCED, payload);
    return data;
  },
};
