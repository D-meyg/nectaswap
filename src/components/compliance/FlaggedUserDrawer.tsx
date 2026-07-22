import { useState } from "react";
import { Link } from "react-router-dom";

import { Drawer } from "@/components/ui/Drawer";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { TabsRoot, TabsList, Tab, TabPanel } from "@/components/ui/Tabs";
import { KycLevelPill, RiskPill } from "@/components/compliance/CompliancePills";
import { cn } from "@/lib/utils";
import {
  DUMMY_FLAGGED_USER_DETAILS,
  DUMMY_FLAGGED_USER_DETAIL_DEFAULT,
  type FlaggedUserRow,
} from "@/lib/dummyData";

type DrawerTab = "info" | "transactions" | "notes" | "alerts";

function riskLevel(score: number): "High" | "Medium" | "Low" {
  return score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Row justify="between" align="center" className="border-b border-(--color-border) py-3 last:border-b-0">
      <Text variant="caption" color="tertiary" className="text-[0.75rem]">{label}</Text>
      {typeof value === "string" ? (
        <Text variant="caption" color="primary" weight="semibold" className="text-right text-[0.75rem]">{value}</Text>
      ) : value}
    </Row>
  );
}

export function FlaggedUserDrawer({
  user,
  onClose,
}: {
  user: FlaggedUserRow | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("info");
  const [note, setNote] = useState("");

  const detail = user
    ? DUMMY_FLAGGED_USER_DETAILS[user.id] ?? DUMMY_FLAGGED_USER_DETAIL_DEFAULT
    : DUMMY_FLAGGED_USER_DETAIL_DEFAULT;

  return (
    <Drawer open={Boolean(user)} onClose={onClose} size="md">
      {user && (
        <>
          <Drawer.Header title={user.name} subtitle={user.email} onClose={onClose} />

          <Drawer.Body className="px-0 py-0">
            {/* Risk score */}
            <Box px={5} py={4} className="border-b border-(--color-border)">
              <Row justify="between" align="center" className="mb-2">
                <Text variant="caption" color="secondary" weight="medium" className="text-[0.75rem]">Risk Score</Text>
                <RiskPill level={riskLevel(user.risk_score)} />
              </Row>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-(--color-border)">
                <div
                  className={cn(
                    "h-full rounded-full",
                    user.risk_score >= 70 ? "bg-(--color-danger)" : user.risk_score >= 40 ? "bg-(--color-warning)" : "bg-(--color-success-mid)",
                  )}
                  style={{ width: `${Math.min(100, user.risk_score)}%` }}
                />
              </div>
              <Row justify="between" align="center" className="mt-1">
                <Text variant="micro" color="muted" className="text-[0.625rem]">0</Text>
                <Text variant="micro" color="primary" weight="semibold" className="text-[0.625rem]">{user.risk_score}/100</Text>
                <Text variant="micro" color="muted" className="text-[0.625rem]">100</Text>
              </Row>
            </Box>

            {/* Tabs */}
            <TabsRoot value={tab} onChange={(v) => setTab(v as DrawerTab)}>
              <Box px={5}>
                <TabsList className="gap-6">
                  <Tab value="info">User Info</Tab>
                  <Tab value="transactions">Transactions</Tab>
                  <Tab value="notes">Notes</Tab>
                  <Tab value="alerts">Alerts</Tab>
                </TabsList>
              </Box>

              <Box px={5} py={2}>
                <TabPanel value="info" className="pt-1">
                  <Stack gap={0}>
                    <InfoRow label="Full Name" value={user.name} />
                    <InfoRow label="Email" value={user.email} />
                    <InfoRow label="KYC Level" value={<KycLevelPill level={user.kyc_level} />} />
                    <InfoRow label="Total Volume" value={user.total_volume} />
                    <InfoRow label="Number of Flags" value={String(user.flags)} />
                    <InfoRow label="Status" value={user.status} />
                    <InfoRow label="Assigned Officer" value={user.officer} />
                    <InfoRow label="Last Trigger" value={user.last_trigger} />
                  </Stack>
                </TabPanel>

                <TabPanel value="transactions" className="pt-1">
                  <Stack gap={0}>
                    {detail.transactions.map((tx, index) => (
                      <Row key={index} justify="between" align="start" className="border-b border-(--color-border) py-3 last:border-b-0">
                        <Stack gap={0}>
                          <Text variant="caption" color="primary" weight="semibold" className="text-[0.75rem]" as="p">{tx.description}</Text>
                          <Text variant="micro" color="muted" className="text-[0.625rem]" as="p">{tx.date}</Text>
                        </Stack>
                        <Stack gap={0} className="items-end text-right">
                          <Text variant="caption" weight="semibold" className={cn("text-[0.75rem]", tx.amount.startsWith("-") ? "text-(--color-danger)" : "text-(--color-success-mid)")} as="p">{tx.amount}</Text>
                          <Text variant="micro" className={cn("text-[0.625rem]", tx.status === "Flagged" ? "text-(--color-danger)" : "text-(--color-text-muted)")} as="p">{tx.status}</Text>
                        </Stack>
                      </Row>
                    ))}
                  </Stack>
                </TabPanel>

                <TabPanel value="notes" className="pt-1">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add investigation notes..."
                    rows={4}
                    className="w-full resize-none rounded-(--radius-sm) border border-(--color-border) bg-white px-3 py-2.5 font-geom text-[0.75rem] text-(--color-text-primary) outline-none transition-colors placeholder:text-(--color-text-muted) focus:border-(--color-brand)"
                  />
                  <Button size="sm" className="mt-3 h-8 px-4 text-[0.6875rem]">Save Note</Button>
                </TabPanel>

                <TabPanel value="alerts" className="pt-1">
                  <Stack gap={0}>
                    {detail.alerts.map((alert) => (
                      <Row key={alert.id} justify="between" align="start" className="border-b border-(--color-border) py-3 last:border-b-0">
                        <Stack gap={0}>
                          <Text variant="caption" color="primary" weight="semibold" className="text-[0.75rem]" as="p">{alert.id}</Text>
                          <Text variant="micro" color="secondary" className="text-[0.6875rem]" as="p">{alert.title}</Text>
                          <Text variant="micro" color="muted" className="text-[0.625rem]" as="p">{alert.date}</Text>
                        </Stack>
                        <RiskPill level={alert.severity} />
                      </Row>
                    ))}
                  </Stack>
                </TabPanel>
              </Box>
            </TabsRoot>
          </Drawer.Body>

          <Drawer.Footer className="flex-col items-stretch gap-2">
            <Link to="/users" className="w-full">
              <Button size="sm" className="h-9 w-full justify-center text-xs">View Full Profile</Button>
            </Link>
            <Row gap={2} align="center" className="w-full">
              <Button variant="secondary" size="sm" className="h-9 flex-1 justify-center border-(--color-danger-muted) text-xs text-(--color-danger)">Freeze</Button>
              <Button variant="secondary" size="sm" className="h-9 flex-1 justify-center border-(--color-warning-border) text-xs text-(--color-warning-text)">Escalate</Button>
              <Button variant="secondary" size="sm" className="h-9 flex-1 justify-center text-xs">Docs</Button>
            </Row>
          </Drawer.Footer>
        </>
      )}
    </Drawer>
  );
}
