/* eslint-disable @typescript-eslint/no-explicit-any */
import { usePageTitle } from "@/layouts/AppLayout";
import { useState } from "react";
import { Settings, DollarSign, Shield, Bell, Zap, Save } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { TabsRoot, TabsList, Tab } from "@/components/ui/Tabs";
import { useGeneralSettings } from "@/hooks/queries/useSettings";
import {
  useUpdateAdvancedSettings,
  useUpdateFeesAndLimits,
  useUpdateNotificationSettings,
  useUpdateSecuritySettings,
} from "@/hooks/mutations/useSettingsMutations";

type SettingsTab =
  | "general"
  | "fees"
  | "security"
  | "notifications"
  | "advanced";

type SettingsDraft = {
  platformName?: string;
  platformEmail?: string;
  supportEmail?: string;
  maxSlippage?: string;
  minFee?: string;
  maxFee?: string;
  gasLimit?: string;
  twoFA?: boolean;
  requireKYC?: boolean;
  autoSuspend?: boolean;
  pushEnabled?: boolean;
  emailAlerts?: boolean;
  maintenanceMode?: boolean;
};

function SettingsField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Stack gap={1}>
      <Text variant="micro" color="secondary">
        {label}
      </Text>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-(--radius-sm) border border-(--color-border) bg-white px-3 py-2.5 text-[0.8125rem] text-(--color-text-primary) outline-none transition-colors focus:border-(--color-brand)"
      />
    </Stack>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Row
      justify="between"
      align="center"
      className="border-b border-(--color-border) py-4 last:border-0"
    >
      <Stack gap={0}>
        <Text variant="caption" color="primary" weight="medium">
          {label}
        </Text>
        <Text variant="micro" color="muted">
          {description}
        </Text>
      </Stack>
      <Toggle checked={checked} onChange={onChange} />
    </Row>
  );
}

function TabFooter({
  onCancel,
  onSave,
  saving,
}: {
  onCancel: () => void;
  onSave: () => void;
  saving?: boolean;
}) {
  return (
    <Row justify="end" gap={2} className="mt-6">
      <Button variant="secondary" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      <Button size="sm" onClick={onSave} disabled={saving}>
        <Save size={13} />
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </Row>
  );
}

export default function SettingsPage() {
  usePageTitle("Settings", "Platform configuration and admin governance");

  const [tab, setTab] = useState<SettingsTab>("general");
  const [draft, setDraft] = useState<SettingsDraft>({});

  const { data: settings = {} } = useGeneralSettings();
  const feesMutation = useUpdateFeesAndLimits();
  const securityMutation = useUpdateSecuritySettings();
  const notificationsMutation = useUpdateNotificationSettings();
  const advancedMutation = useUpdateAdvancedSettings();

  const data = settings as Record<string, any>;

  const platformName = draft.platformName ?? data.platform_name ?? data.platformName ?? "NectaSwap";
  const platformEmail = draft.platformEmail ?? data.platform_email ?? data.platformEmail ?? "admin@nectaswap.io";
  const supportEmail = draft.supportEmail ?? data.support_email ?? data.supportEmail ?? "support@nectaswap.io";
  const maxSlippage = draft.maxSlippage ?? String(data.max_slippage ?? "0.5");
  const minFee = draft.minFee ?? String(data.min_transaction_fee ?? "0.3");
  const maxFee = draft.maxFee ?? String(data.max_transaction_fee ?? "1.0");
  const gasLimit = draft.gasLimit ?? String(data.default_gas_limit ?? "300000");
  const twoFA = draft.twoFA ?? Boolean(data.require_2fa ?? true);
  const requireKYC = draft.requireKYC ?? Boolean(data.require_kyc ?? true);
  const autoSuspend = draft.autoSuspend ?? Boolean(data.auto_suspend_suspicious ?? false);
  const pushEnabled = draft.pushEnabled ?? Boolean(data.push_notifications_enabled ?? true);
  const emailAlerts = draft.emailAlerts ?? Boolean(data.email_alerts_enabled ?? true);
  const maintenanceMode = draft.maintenanceMode ?? Boolean(data.maintenance_mode ?? false);

  const updateDraft = <K extends keyof SettingsDraft>(key: K, value: SettingsDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const clearDraft = () => setDraft({});

  const saveFees = () =>
    feesMutation.mutate({
      max_slippage: Number(maxSlippage),
      min_transaction_fee: Number(minFee),
      max_transaction_fee: Number(maxFee),
      default_gas_limit: Number(gasLimit),
    });

  const saveSecurity = () =>
    securityMutation.mutate({
      require_2fa: twoFA,
      require_kyc: requireKYC,
      auto_suspend_suspicious: autoSuspend,
    });

  const saveNotifications = () =>
    notificationsMutation.mutate({
      push_notifications_enabled: pushEnabled,
      email_alerts_enabled: emailAlerts,
    });

  const saveAdvanced = () =>
    advancedMutation.mutate({ maintenance_mode: maintenanceMode });

  return (
    <Box p={6}>
      <Card noPadding>
        <Box px={5} className="border-b border-(--color-border)">
          <TabsRoot value={tab} onChange={(v) => setTab(v as SettingsTab)}>
            <TabsList className="gap-5 border-b-0">
              <Tab value="general" icon={<Settings size={13} />}>
                General
              </Tab>
              <Tab value="fees" icon={<DollarSign size={13} />}>
                Fees & Limits
              </Tab>
              <Tab value="security" icon={<Shield size={13} />}>
                Security
              </Tab>
              <Tab value="notifications" icon={<Bell size={13} />}>
                Notifications
              </Tab>
              <Tab value="advanced" icon={<Zap size={13} />}>
                Advanced
              </Tab>
            </TabsList>
          </TabsRoot>
        </Box>

        <Box px={6} py={5}>
          {tab === "general" && (
            <Stack gap={4}>
              <Box>
                <Text variant="subtitle" color="primary" weight="semibold">
                  General Settings
                </Text>
                <Text variant="micro" color="muted">
                  Configure basic platform settings and information
                </Text>
              </Box>
              <SettingsField label="Platform Name" value={platformName} onChange={(v) => updateDraft("platformName", v)} />
              <SettingsField label="Platform Email" value={platformEmail} onChange={(v) => updateDraft("platformEmail", v)} />
              <SettingsField label="Support Email" value={supportEmail} onChange={(v) => updateDraft("supportEmail", v)} />
              <Box className="flex items-start gap-3 rounded-(--radius-md) border border-(--color-brand)/20 bg-[rgba(78,43,204,0.04)] px-4 py-3">
                <Text variant="caption" color="brand" weight="semibold">
                  Information
                </Text>
                <Text variant="micro" color="secondary">
                  General settings are loaded from the settings endpoint. Update endpoint support for general settings can be added when the backend provides it.
                </Text>
              </Box>
              <TabFooter onCancel={clearDraft} onSave={() => {}} />
            </Stack>
          )}

          {tab === "fees" && (
            <Stack gap={4}>
              <Box>
                <Text variant="subtitle" color="primary" weight="semibold">
                  Fees & Limits Configuration
                </Text>
                <Text variant="micro" color="muted">
                  Set transaction fees and platform limits
                </Text>
              </Box>
              <SettingsField label="Maximum Slippage (%)" value={maxSlippage} onChange={(v) => updateDraft("maxSlippage", v)} />
              <Row gap={4}>
                <Box className="flex-1">
                  <SettingsField label="Minimum Transaction Fee (%)" value={minFee} onChange={(v) => updateDraft("minFee", v)} />
                </Box>
                <Box className="flex-1">
                  <SettingsField label="Maximum Transaction Fee (%)" value={maxFee} onChange={(v) => updateDraft("maxFee", v)} />
                </Box>
              </Row>
              <SettingsField label="Default Gas Limit" value={gasLimit} onChange={(v) => updateDraft("gasLimit", v)} />
              <Box className="flex items-start gap-3 rounded-(--radius-md) border border-(--color-warning-border) bg-(--color-warning-subtle) px-4 py-3">
                <Text variant="caption" className="text-(--color-warning-dark)" weight="semibold">
                  Warning
                </Text>
                <Text variant="micro" color="secondary">
                  Changing fee structures will affect all new transactions.
                </Text>
              </Box>
              <TabFooter onCancel={clearDraft} onSave={saveFees} saving={feesMutation.isPending} />
            </Stack>
          )}

          {tab === "security" && (
            <Stack gap={2}>
              <Box className="mb-2">
                <Text variant="subtitle" color="primary" weight="semibold">
                  Security Settings
                </Text>
                <Text variant="micro" color="muted">
                  Configure security and compliance features
                </Text>
              </Box>
              <ToggleRow label="Two-Factor Authentication" description="Require 2FA for admin access" checked={twoFA} onChange={(v) => updateDraft("twoFA", v)} />
              <ToggleRow label="Require KYC" description="Require identity verification for all users" checked={requireKYC} onChange={(v) => updateDraft("requireKYC", v)} />
              <ToggleRow label="Auto-Suspend Suspicious Users" description="Automatically suspend accounts with suspicious activity" checked={autoSuspend} onChange={(v) => updateDraft("autoSuspend", v)} />
              <TabFooter onCancel={clearDraft} onSave={saveSecurity} saving={securityMutation.isPending} />
            </Stack>
          )}

          {tab === "notifications" && (
            <Stack gap={2}>
              <Box className="mb-2">
                <Text variant="subtitle" color="primary" weight="semibold">
                  Notification Settings
                </Text>
                <Text variant="micro" color="muted">
                  Manage notification preferences for admin alerts
                </Text>
              </Box>
              <ToggleRow label="Push Notifications" description="Receive browser notifications for critical events" checked={pushEnabled} onChange={(v) => updateDraft("pushEnabled", v)} />
              <ToggleRow label="Email Alerts" description="Receive email alerts for important updates" checked={emailAlerts} onChange={(v) => updateDraft("emailAlerts", v)} />
              <TabFooter onCancel={clearDraft} onSave={saveNotifications} saving={notificationsMutation.isPending} />
            </Stack>
          )}

          {tab === "advanced" && (
            <Stack gap={4}>
              <Box>
                <Text variant="subtitle" color="primary" weight="semibold">
                  Advanced Settings
                </Text>
                <Text variant="micro" color="muted">
                  Advanced platform configuration options
                </Text>
              </Box>
              <ToggleRow label="Maintenance Mode" description="Temporarily disable selected platform operations" checked={maintenanceMode} onChange={(v) => updateDraft("maintenanceMode", v)} />
              <TabFooter onCancel={clearDraft} onSave={saveAdvanced} saving={advancedMutation.isPending} />
            </Stack>
          )}
        </Box>
      </Card>
    </Box>
  );
}
