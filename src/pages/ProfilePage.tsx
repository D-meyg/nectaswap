import { useMemo } from "react";
import { Mail, Phone, Shield, Clock, CalendarDays, BadgeCheck, KeyRound } from "lucide-react";

import { usePageTitle } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTeamMe } from "@/hooks/queries/useTeam";
import type { ReactNode } from "react";

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}
function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}
function get(o: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k];
  return undefined;
}

interface Me {
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  id: string;
  joined: string;
  last_active: string;
  permissions: string[];
}

function normalizeMe(raw: unknown): Me | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  const roleObj = obj(m.role);
  const perms = get(m, ["permissions", "scopes"]);
  const permList = Array.isArray(perms)
    ? perms.map((p) => (typeof p === "string" ? p : str((obj(p)).name ?? (obj(p)).code))).filter(Boolean)
    : [];
  return {
    name: str(get(m, ["name", "full_name", "admin_name"]), "Admin"),
    email: str(get(m, ["email"]), "—"),
    phone: str(get(m, ["phone", "phone_number"]), "—"),
    role: str(get(m, ["role_name", "role"]) ?? get(roleObj, ["name"]), "—"),
    status: str(get(m, ["status", "account_status"]), "Active"),
    id: str(get(m, ["id", "admin_id", "user_id"]), "—"),
    joined: str(get(m, ["created_at", "joined", "date_joined"]), "—"),
    last_active: str(get(m, ["last_login", "last_active", "last_seen"]), "—"),
    permissions: permList,
  };
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <Row justify="between" align="center" className="border-b border-(--color-border) py-3 last:border-b-0">
      <Row gap={2} align="center" className="min-w-0">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-(--color-bg-subtle) text-(--color-text-secondary)">{icon}</span>
        <Text variant="caption" color="tertiary" className="text-[0.75rem]">{label}</Text>
      </Row>
      {typeof value === "string" ? (
        <Text variant="caption" color="primary" weight="semibold" className="text-right text-[0.75rem]">{value}</Text>
      ) : value}
    </Row>
  );
}

export default function ProfilePage() {
  usePageTitle("Profile", "Your account, role and access information");

  const { data: raw, isLoading } = useTeamMe();
  const me = useMemo(() => normalizeMe(raw), [raw]);

  if (isLoading) {
    return (
      <Box p={6} className="space-y-5">
        <Skeleton className="h-32 rounded-lg" />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-lg lg:col-span-2" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </Box>
    );
  }

  if (!me) {
    return (
      <Box p={6}>
        <EmptyState icon={Shield} title="Profile unavailable" description="We couldn't load your profile information right now." />
      </Box>
    );
  }

  const statusOk = me.status.toLowerCase().includes("active");

  return (
    <Box p={6} className="space-y-5">
      {/* Header card */}
      <Card>
        <Box px={6} py={5}>
          <Row gap={4} align="center" className="flex-wrap">
            <Avatar name={me.name} size="lg" />
            <Stack gap={1} className="min-w-0">
              <Text variant="heading" color="primary" weight="semibold" as="h2" className="text-[1.375rem] leading-7">{me.name}</Text>
              <Row gap={2} align="center" className="flex-wrap">
                <Text variant="caption" color="muted" className="text-[0.75rem]">{me.email}</Text>
                <span className="inline-flex rounded px-2 py-0.5 text-[0.625rem] font-semibold text-(--color-brand) bg-[rgba(78,43,204,0.1)]">{me.role}</span>
                <span className={`inline-flex rounded px-2 py-0.5 text-[0.625rem] font-semibold ${statusOk ? "text-(--color-success-mid) bg-(--color-success-subtle)" : "text-(--color-danger) bg-(--color-danger-subtle)"}`}>{me.status}</span>
              </Row>
            </Stack>
          </Row>
        </Box>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Account details */}
        <Card className="lg:col-span-2 self-start">
          <Card.Header title="Account Information" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
          <Card.Body className="px-5 pb-4 pt-1">
            <Stack gap={0}>
              <InfoRow icon={<Mail size={13} />} label="Email" value={me.email} />
              <InfoRow icon={<Phone size={13} />} label="Phone" value={me.phone} />
              <InfoRow icon={<Shield size={13} />} label="Role" value={me.role} />
              <InfoRow icon={<BadgeCheck size={13} />} label="Status" value={me.status} />
              <InfoRow icon={<KeyRound size={13} />} label="Admin ID" value={<Text variant="caption" color="primary" weight="semibold" className="font-mono text-[0.75rem]">{me.id}</Text>} />
              <InfoRow icon={<CalendarDays size={13} />} label="Joined" value={me.joined} />
              <InfoRow icon={<Clock size={13} />} label="Last Active" value={me.last_active} />
            </Stack>
          </Card.Body>
        </Card>

        {/* Permissions */}
        <Card className="self-start">
          <Card.Header title="Permissions" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
          <Card.Body className="px-5 pb-5 pt-2">
            {me.permissions.length === 0 ? (
              <EmptyState icon={KeyRound} title="No permissions listed" description="Your role's permissions will appear here." />
            ) : (
              <div className="flex flex-wrap gap-2">
                {me.permissions.map((perm) => (
                  <span key={perm} className="inline-flex rounded-md border border-(--color-border) bg-(--color-bg-subtle) px-2.5 py-1 font-geom text-[0.6875rem] font-medium text-(--color-text-secondary)">
                    {perm}
                  </span>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </Box>
  );
}
