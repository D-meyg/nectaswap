import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { formatDate } from "@/lib/date";
import {
  Mail,
  Phone,
  Shield,
  Clock,
  CalendarDays,
  BadgeCheck,
  KeyRound,
  Wallet,
  Activity,
  Fingerprint,
  Gauge,
} from "lucide-react";

import { usePageTitle } from "@/layouts/AppLayout";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTeamMe, useAdminDetail } from "@/hooks/queries/useAdmins";
import { useUserDetail } from "@/hooks/queries/useUserDetail";
import type { ReactNode } from "react";

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}
function num(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}
function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}
function get(o: Record<string, unknown>, keys: string[]): unknown {
  for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k];
  return undefined;
}

// ── Admin / team-member profile ───────────────────────────
interface AdminProfile {
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

function normalizeAdmin(raw: unknown): AdminProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  const roleObj = obj(m.role);
  const perms = get(m, ["permissions", "scopes"]);
  // The API returns permissions as { resource, action } pairs; also accept
  // plain strings or { name } / { code } objects from other shapes.
  const permList = Array.isArray(perms)
    ? perms
        .map((p) => {
          if (typeof p === "string") return p;
          const o = obj(p);
          const resource = str(o.resource);
          const action = str(o.action);
          if (resource) {
            const label = resource.replace(/_/g, " ");
            return action ? `${label}: ${action}` : label;
          }
          return str(o.name ?? o.code);
        })
        .filter(Boolean)
    : [];
  const fullName = [str(m.first_name), str(m.last_name)]
    .filter(Boolean)
    .join(" ")
    .trim();
  return {
    name: fullName || str(get(m, ["name", "full_name", "admin_name", "username"]), "Admin"),
    email: str(get(m, ["email"]), "—"),
    phone: str(get(m, ["phone", "phone_number"]), "—"),
    role: str(
      get(roleObj, ["role_name", "name"]) ?? get(m, ["role_name", "role"]),
      "—",
    ),
    status: str(
      get(m, ["status", "account_status"]),
      m.is_restricted === true
        ? "Restricted"
        : m.is_active === false
          ? "Inactive"
          : "Active",
    ),
    id: str(get(m, ["id", "admin_id", "user_id"]), "—"),
    joined: str(get(m, ["created_at", "joined", "date_joined"]), "—"),
    last_active: str(get(m, ["last_login", "last_active", "last_seen"]), "—"),
    permissions: permList,
  };
}

// ── End-user profile ──────────────────────────────────────
interface UserProfile {
  name: string;
  email: string;
  phone: string;
  status: string;
  id: string;
  joined: string;
  last_active: string;
  last_ip: string;
  kyc: string;
  risk_score: number | null;
  crypto_wallet: string;
  total_volume: number | null;
  aml: string;
}

function normalizeUser(raw: unknown): UserProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const u = raw as Record<string, unknown>;
  return {
    name: str(get(u, ["name", "full_name", "username"]), "User"),
    email: str(get(u, ["email"]), "—"),
    phone: str(get(u, ["phone", "phone_number"]), "—"),
    status: str(get(u, ["status", "account_status"]), "active"),
    id: str(get(u, ["user_id", "id"]), "—"),
    joined: str(get(u, ["created_at", "joined", "date_joined"]), "—"),
    last_active: str(get(u, ["last_active", "last_login", "last_seen"]), "—"),
    last_ip: str(get(u, ["last_ip", "ip_address"]), "—"),
    kyc: str(get(u, ["kyc_status", "kyc_level", "kyc_tier"]), "—"),
    risk_score: num(get(u, ["risk_score"])),
    crypto_wallet: str(get(u, ["crypto_wallet", "wallet_address"]), "—"),
    total_volume: num(get(u, ["total_volume", "total_value"])),
    aml: str(get(u, ["aml_screening", "aml"]), "—"),
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

function LoadingState() {
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

function Unavailable() {
  return (
    <Box p={6}>
      <EmptyState icon={Shield} title="Profile unavailable" description="We couldn't load this profile right now." />
    </Box>
  );
}

// ── Admin view ────────────────────────────────────────────
function AdminProfileView({ me }: { me: AdminProfile }) {
  const statusOk = me.status.toLowerCase().includes("active");
  return (
    <Box p={6} className="space-y-5">
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
        <Card className="lg:col-span-2 self-start">
          <Card.Header title="Account Information" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
          <Card.Body className="px-5 pb-4 pt-1">
            <Stack gap={0}>
              <InfoRow icon={<Mail size={13} />} label="Email" value={me.email} />
              <InfoRow icon={<Phone size={13} />} label="Phone" value={me.phone} />
              <InfoRow icon={<Shield size={13} />} label="Role" value={me.role} />
              <InfoRow icon={<BadgeCheck size={13} />} label="Status" value={me.status} />
              <InfoRow icon={<KeyRound size={13} />} label="Admin ID" value={<Text variant="caption" color="primary" weight="semibold" className="font-mono text-[0.75rem]">{me.id}</Text>} />
              <InfoRow icon={<CalendarDays size={13} />} label="Joined" value={formatDate(me.joined)} />
              <InfoRow icon={<Clock size={13} />} label="Last Active" value={formatDate(me.last_active)} />
            </Stack>
          </Card.Body>
        </Card>

        <Card className="self-start">
          <Card.Header title="Permissions" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
          <Card.Body className="px-5 pb-5 pt-2">
            {me.permissions.length === 0 ? (
              <EmptyState icon={KeyRound} title="No permissions listed" description="This role's permissions will appear here." />
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

// ── End-user view ─────────────────────────────────────────
function UserProfileView({ user }: { user: UserProfile }) {
  const statusOk = user.status.toLowerCase().includes("active");
  const volume = user.total_volume != null ? `₦ ${user.total_volume.toLocaleString()}` : "—";
  const risk = user.risk_score != null ? String(user.risk_score) : "—";
  return (
    <Box p={6} className="space-y-5">
      <Card>
        <Box px={6} py={5}>
          <Row gap={4} align="center" className="flex-wrap">
            <Avatar name={user.name} size="lg" />
            <Stack gap={1} className="min-w-0">
              <Text variant="heading" color="primary" weight="semibold" as="h2" className="text-[1.375rem] leading-7">{user.name}</Text>
              <Row gap={2} align="center" className="flex-wrap">
                <Text variant="caption" color="muted" className="text-[0.75rem]">{user.email}</Text>
                {user.kyc !== "—" && (
                  <span className="inline-flex rounded px-2 py-0.5 text-[0.625rem] font-semibold text-(--color-brand) bg-[rgba(78,43,204,0.1)]">KYC: {user.kyc}</span>
                )}
                <span className={`inline-flex rounded px-2 py-0.5 text-[0.625rem] font-semibold ${statusOk ? "text-(--color-success-mid) bg-(--color-success-subtle)" : "text-(--color-danger) bg-(--color-danger-subtle)"}`}>{user.status}</span>
              </Row>
            </Stack>
          </Row>
        </Box>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2 self-start">
          <Card.Header title="Account Information" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
          <Card.Body className="px-5 pb-4 pt-1">
            <Stack gap={0}>
              <InfoRow icon={<Mail size={13} />} label="Email" value={user.email} />
              <InfoRow icon={<Phone size={13} />} label="Phone" value={user.phone} />
              <InfoRow icon={<BadgeCheck size={13} />} label="Status" value={user.status} />
              <InfoRow icon={<KeyRound size={13} />} label="User ID" value={<Text variant="caption" color="primary" weight="semibold" className="font-mono text-[0.75rem]">{user.id}</Text>} />
              <InfoRow icon={<Shield size={13} />} label="KYC" value={user.kyc} />
              <InfoRow icon={<CalendarDays size={13} />} label="Joined" value={formatDate(user.joined)} />
              <InfoRow icon={<Clock size={13} />} label="Last Active" value={formatDate(user.last_active)} />
            </Stack>
          </Card.Body>
        </Card>

        <Card className="self-start">
          <Card.Header title="Activity & Risk" className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5" />
          <Card.Body className="px-5 pb-4 pt-1">
            <Stack gap={0}>
              <InfoRow icon={<Wallet size={13} />} label="Total Volume" value={volume} />
              <InfoRow icon={<Gauge size={13} />} label="Risk Score" value={risk} />
              <InfoRow icon={<Activity size={13} />} label="AML Screening" value={user.aml} />
              <InfoRow icon={<Fingerprint size={13} />} label="Last IP" value={<Text variant="caption" color="primary" weight="semibold" className="font-mono text-[0.75rem]">{user.last_ip}</Text>} />
              <InfoRow icon={<Wallet size={13} />} label="Crypto Wallet" value={<Text variant="caption" color="primary" weight="semibold" className="font-mono text-[0.75rem] max-w-[10rem] truncate">{user.crypto_wallet}</Text>} />
            </Stack>
          </Card.Body>
        </Card>
      </div>
    </Box>
  );
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const type = params.get("type");
  const mode: "me" | "admin" | "user" = !id ? "me" : type === "admin" ? "admin" : "user";

  usePageTitle(
    mode === "me" ? "Profile" : "User Profile",
    mode === "me"
      ? "Your account, role and access information"
      : "Account, activity and risk information",
  );

  // Hooks must run unconditionally; each id-based query is gated by `enabled: !!id`.
  const meQuery = useTeamMe();
  const adminQuery = useAdminDetail(mode === "admin" ? id ?? "" : "");
  const userQuery = useUserDetail(mode === "user" ? id ?? "" : "");

  const isLoading =
    mode === "me"
      ? meQuery.isLoading
      : mode === "admin"
        ? adminQuery.isLoading
        : userQuery.isLoading;

  const admin = useMemo(
    () => normalizeAdmin(mode === "me" ? meQuery.data : adminQuery.data),
    [mode, meQuery.data, adminQuery.data],
  );
  const user = useMemo(
    () => normalizeUser(userQuery.data),
    [userQuery.data],
  );

  if (isLoading) return <LoadingState />;

  if (mode === "user") {
    return user ? <UserProfileView user={user} /> : <Unavailable />;
  }
  return admin ? <AdminProfileView me={admin} /> : <Unavailable />;
}
