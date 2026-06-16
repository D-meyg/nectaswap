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

type SettingsTab =
  | "general"
  | "fees"
  | "security"
  | "notifications"
  | "advanced";

// Reusable form field for settings
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
        className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 py-2.5 text-[13px] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-brand)] transition-colors"
      />
    </Stack>
  );
}

// Reusable toggle row
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
      className="py-4 border-b border-[var(--color-border)] last:border-0"
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

// Footer actions — reused across all tabs
function TabFooter({ onCancel }: { onCancel: () => void }) {
  return (
    <Row justify="end" gap={2} className="mt-6">
      <Button variant="secondary" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      <Button size="sm">
        <Save size={13} />
        Save Changes
      </Button>
    </Row>
  );
}

export default function SettingsPage() {
  usePageTitle("Settings", "Platform configuration and admin governance");

  const [tab, setTab] = useState<SettingsTab>("general");

  // General
  const [platformName, setPlatformName] = useState("NectaSwap");
  const [platformEmail, setPlatformEmail] = useState("admin@nectaswap.io");
  const [supportEmail, setSupportEmail] = useState("support@nectaswap.io");

  // Fees
  const [maxSlippage, setMaxSlippage] = useState("0.5");
  const [minFee, setMinFee] = useState("0.3");
  const [maxFee, setMaxFee] = useState("1.0");
  const [gasLimit, setGasLimit] = useState("300000");

  // Security
  const [twoFA, setTwoFA] = useState(true);
  const [requireKYC, setRequireKYC] = useState(true);
  const [autoSuspend, setAutoSuspend] = useState(false);

  // Notification settings
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  return (
    <Box p={6}>
      <Card noPadding>
        {/* Tab bar inside card header */}
        <Box px={5} className="border-b border-[var(--color-border)]">
          <TabsRoot value={tab} onChange={(v) => setTab(v as SettingsTab)}>
            <TabsList className="border-b-0 gap-5">
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
          {/* General Settings */}
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
              <SettingsField
                label="Platform Name"
                value={platformName}
                onChange={setPlatformName}
              />
              <SettingsField
                label="Platform Email"
                value={platformEmail}
                onChange={setPlatformEmail}
              />
              <SettingsField
                label="Support Email"
                value={supportEmail}
                onChange={setSupportEmail}
              />
              <Box className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-brand)]/20 bg-[rgba(78,43,204,0.04)] px-4 py-3">
                <Text variant="caption" color="brand" weight="semibold">
                  Information
                </Text>
                <Text variant="micro" color="secondary">
                  Changes to general settings will be reflected across the
                  entire platform immediately.
                </Text>
              </Box>
              <TabFooter onCancel={() => {}} />
            </Stack>
          )}

          {/* Fees & Limits */}
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
              <SettingsField
                label="Maximum Slippage (%)"
                value={maxSlippage}
                onChange={setMaxSlippage}
              />
              <Row gap={4}>
                <Box className="flex-1">
                  <SettingsField
                    label="Minimum Transaction Fee (%)"
                    value={minFee}
                    onChange={setMinFee}
                  />
                </Box>
                <Box className="flex-1">
                  <SettingsField
                    label="Maximum Transaction Fee (%)"
                    value={maxFee}
                    onChange={setMaxFee}
                  />
                </Box>
              </Row>
              <SettingsField
                label="Default Gas Limit"
                value={gasLimit}
                onChange={setGasLimit}
              />
              <Box className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-warning-border)] bg-[var(--color-warning-subtle)] px-4 py-3">
                <Text
                  variant="caption"
                  className="text-[var(--color-warning-dark)]"
                  weight="semibold"
                >
                  Warning
                </Text>
                <Text variant="micro" color="secondary">
                  Changing fee structures will affect all new transactions.
                  Existing pending transactions will maintain their original fee
                  rates.
                </Text>
              </Box>
              <TabFooter onCancel={() => {}} />
            </Stack>
          )}

          {/* Security */}
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
              <ToggleRow
                label="Two-Factor Authentication"
                description="Require 2FA for admin access"
                checked={twoFA}
                onChange={setTwoFA}
              />
              <ToggleRow
                label="Require KYC"
                description="Require identity verification for all users"
                checked={requireKYC}
                onChange={setRequireKYC}
              />
              <ToggleRow
                label="Auto-Suspend Suspicious Users"
                description="Automatically suspend accounts with suspicious activity"
                checked={autoSuspend}
                onChange={setAutoSuspend}
              />
              <TabFooter onCancel={() => {}} />
            </Stack>
          )}

          {/* Notification Settings */}
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
              <ToggleRow
                label="Push Notifications"
                description="Receive browser notifications for critical events"
                checked={pushEnabled}
                onChange={setPushEnabled}
              />
              <ToggleRow
                label="Email Alerts"
                description="Receive email alerts for important updates"
                checked={emailAlerts}
                onChange={setEmailAlerts}
              />
              <TabFooter onCancel={() => {}} />
            </Stack>
          )}

          {/* Advanced */}
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
              <Text variant="caption" color="muted">
                Advanced settings coming soon.
              </Text>
              <TabFooter onCancel={() => {}} />
            </Stack>
          )}
        </Box>
      </Card>
    </Box>
  );
}
