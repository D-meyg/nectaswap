import { usePageTitle } from "@/layouts/AppLayout";
import { useMemo, useState } from "react";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Tooltip } from "@/components/ui/Tooltip";
import { DataTable } from "@/components/tables/DataTable";
import { SearchInput } from "@/components/forms/SearchInput";
import { useDebounce } from "@/hooks/ui/useDebounce";
import { useTeamList, useRoles } from "@/hooks/queries/useTeam";
import {
  useInviteAdmin,
  useUpdateAdminRole,
  useDeleteAdmin,
} from "@/hooks/mutations/useTeamMutations";
import { formatDate } from "@/lib/date";
import type { ColumnDef } from "@tanstack/react-table";

interface AdminUser {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  role_id: string;
  role_color: string;
  status: "Active" | "Suspended";
  last_login: string;
}

interface RoleOption {
  id: string;
  role_name: string;
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}
function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function normalizeAdmin(value: unknown): AdminUser {
  const item = obj(value);
  const roleRaw = item.role;
  const roleObj = obj(roleRaw);
  const roleName = typeof roleRaw === "string" ? roleRaw : text(roleObj.role_name, "Admin");
  const first = text(item.first_name);
  const last = text(item.last_name);
  const name =
    text(item.username) ||
    `${first} ${last}`.trim() ||
    text(item.name ?? item.full_name, "Admin User");
  return {
    id: text(item.id ?? item.admin_id ?? item.pkid),
    first_name: first,
    last_name: last,
    name,
    email: text(item.email, "N/A"),
    phone: text(item.phone_number ?? item.phone, ""),
    role: roleName,
    role_id: text(item.role_id ?? roleObj.id),
    role_color: roleName.toLowerCase().includes("super")
      ? "text-(--color-brand)"
      : "text-(--color-text-secondary)",
    status: text(item.status, "Active").toLowerCase() === "suspended" ? "Suspended" : "Active",
    last_login: text(item.last_login ?? item.last_seen, ""),
  };
}

function normalizeRole(value: unknown): RoleOption {
  const r = obj(value);
  return { id: text(r.id ?? r.role_id), role_name: text(r.role_name ?? r.name, "Role") };
}

// ── Add / Edit modal ──────────────────────────────────────
function AdminUserModal({
  open,
  mode,
  admin,
  roles,
  onClose,
}: {
  open: boolean;
  mode: "add" | "edit";
  admin?: AdminUser | null;
  roles: RoleOption[];
  onClose: () => void;
}) {
  const invite = useInviteAdmin();
  const updateRole = useUpdateAdminRole();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleId, setRoleId] = useState("");
  const [error, setError] = useState("");

  // Reset when the target changes
  const key = `${mode}-${admin?.id ?? ""}-${open}`;
  const [prevKey, setPrevKey] = useState("");
  if (key !== prevKey) {
    setPrevKey(key);
    setFirstName(admin?.first_name ?? "");
    setLastName(admin?.last_name ?? "");
    setEmail(admin?.email && admin.email !== "N/A" ? admin.email : "");
    setPhone(admin?.phone ?? "");
    setRoleId(admin?.role_id ?? "");
    setError("");
  }

  const busy = invite.isPending || updateRole.isPending;

  const submit = () => {
    if (mode === "add") {
      if (!firstName.trim()) return setError("First name is required.");
      if (!lastName.trim()) return setError("Last name is required.");
      if (!email.trim()) return setError("Email address is required.");
      if (!phone.trim()) return setError("Phone number is required.");
      if (!roleId) return setError("Please select a role.");
      invite.mutate(
        { first_name: firstName, last_name: lastName, email, phone_number: phone, role_id: roleId },
        { onSuccess: onClose },
      );
    } else {
      if (!admin?.id) return setError("Missing admin id.");
      if (!roleId) return setError("Please select a role.");
      updateRole.mutate({ admin_id: admin.id, role_id: roleId }, { onSuccess: onClose });
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="md" className="max-w-[24rem]">
      <Modal.Header
        title={mode === "add" ? "Add Admin User" : "Edit Admin User"}
        onClose={onClose}
        className="border-b-0 px-4 pb-2 pt-4 [&_h4]:text-[1rem]"
      />
      <Modal.Body className="px-4 py-0">
        <Stack gap={3}>
          {error && (
            <Box className="rounded-(--radius-sm) border border-(--color-danger-muted) bg-(--color-danger-subtle) px-3 py-2">
              <Text variant="micro" color="danger">{error}</Text>
            </Box>
          )}

          {mode === "add" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <Text variant="micro" color="secondary" className="mb-1 block">First Name</Text>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-9 w-full rounded-(--radius-sm) border border-(--color-border) px-3 text-[0.8125rem] outline-none focus:border-(--color-brand)" placeholder="Sarah" />
                </label>
                <label className="block">
                  <Text variant="micro" color="secondary" className="mb-1 block">Last Name</Text>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-9 w-full rounded-(--radius-sm) border border-(--color-border) px-3 text-[0.8125rem] outline-none focus:border-(--color-brand)" placeholder="Chen" />
                </label>
              </div>
              <label className="block">
                <Text variant="micro" color="secondary" className="mb-1 block">Email Address</Text>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 w-full rounded-(--radius-sm) border border-(--color-border) px-3 text-[0.8125rem] outline-none focus:border-(--color-brand)" placeholder="sarah.chen@nectaswap.com" />
              </label>
              <label className="block">
                <Text variant="micro" color="secondary" className="mb-1 block">Phone Number</Text>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9 w-full rounded-(--radius-sm) border border-(--color-border) px-3 text-[0.8125rem] outline-none focus:border-(--color-brand)" placeholder="+234 801 234 5678" />
              </label>
            </>
          ) : (
            <Box className="rounded-(--radius-sm) bg-(--color-bg-subtle) px-3 py-2">
              <Text variant="caption" color="primary" weight="semibold" as="p">{admin?.name}</Text>
              <Text variant="micro" color="muted" as="p">{admin?.email}</Text>
            </Box>
          )}

          <label className="block">
            <Text variant="micro" color="secondary" className="mb-1 block">Role</Text>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="h-9 w-full rounded-(--radius-sm) border border-(--color-border) bg-white px-3 text-[0.8125rem] outline-none focus:border-(--color-brand)"
            >
              <option value="">Select a role…</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.role_name}</option>
              ))}
            </select>
          </label>
        </Stack>
      </Modal.Body>
      <Modal.Footer className="grid grid-cols-2 gap-3 border-t-0 bg-white px-4 pb-4 pt-4">
        <Button variant="secondary" size="sm" className="h-9 justify-center" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button size="sm" className="h-9 justify-center" onClick={submit} loading={busy}>
          {mode === "add" ? "Add Admin" : "Save Changes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// ── Delete confirm ────────────────────────────────────────
function DeleteConfirmModal({
  admin,
  onClose,
}: {
  admin: AdminUser | null;
  onClose: () => void;
}) {
  const del = useDeleteAdmin();
  return (
    <Modal open={Boolean(admin)} onClose={onClose} size="sm">
      <Modal.Header title="Remove Admin User" onClose={onClose} />
      <Modal.Body>
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-danger-subtle)">
            <AlertTriangle size={16} className="text-(--color-danger)" />
          </div>
          <Text variant="caption" color="secondary">
            Are you sure you want to permanently remove{" "}
            <span className="font-semibold text-(--color-text-primary)">{admin?.name}</span>? This action cannot be undone.
          </Text>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onClose} disabled={del.isPending}>Cancel</Button>
        <Button variant="danger" size="sm" loading={del.isPending} onClick={() => admin && del.mutate(admin.id, { onSuccess: onClose })}>
          Remove Admin
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function AdminUsersPage() {
  usePageTitle("Admin Users", "Manage admin accounts, roles, and permissions");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const debounced = useDebounce(search, 300);

  const {
    data: teamData = { rows: [], total: 0, page: 1, pages: 1 },
    isLoading,
  } = useTeamList(page, 20, debounced || undefined);
  const { data: rawRoles = [] } = useRoles();
  const roles = useMemo(
    () => (Array.isArray(rawRoles) ? rawRoles.map(normalizeRole) : []),
    [rawRoles],
  );

  const admins = useMemo(
    () => (Array.isArray(teamData.rows) ? teamData.rows.map(normalizeAdmin) : []),
    [teamData.rows],
  );

  const filtered = useMemo(
    () =>
      admins.filter(
        (u) =>
          !debounced ||
          u.name.toLowerCase().includes(debounced.toLowerCase()) ||
          u.email.toLowerCase().includes(debounced.toLowerCase()),
      ),
    [admins, debounced],
  );

  const columns = useMemo<ColumnDef<AdminUser, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Admin",
        enableSorting: false,
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" as="p">{row.original.name}</Text>
            <Text variant="micro" color="muted" as="p">{row.original.email}</Text>
          </Stack>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        enableSorting: false,
        cell: ({ row }) => (
          <Text variant="caption" weight="medium" className={row.original.role_color}>{row.original.role}</Text>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ getValue }) => (
          <Text variant="caption" weight="medium" color={getValue<string>() === "Active" ? "success" : "danger"}>
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "last_login",
        header: "Last Login",
        enableSorting: false,
        cell: ({ getValue }) => (
          <Text variant="caption" color="muted">{formatDate(getValue<string>())}</Text>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <Row gap={1} align="center">
            <Tooltip content="Edit role" side="top">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex items-center justify-center" onClick={() => { setSelectedAdmin(row.original); setModalMode("edit"); }}>
                <Edit size={13} className="text-(--color-text-muted)" />
              </Button>
            </Tooltip>
            <Tooltip content="Remove" side="top">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex items-center justify-center" onClick={() => setDeleteTarget(row.original)}>
                <Trash2 size={13} className="text-(--color-danger)" />
              </Button>
            </Tooltip>
          </Row>
        ),
      },
    ],
    [],
  );

  return (
    <Box p={6}>
      <Card noPadding>
        <Box px={5} py={4} className="border-b border-(--color-border)">
          <Row justify="between" align="center">
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder="Search admin users..."
              className="max-w-80"
            />
            <Button size="sm" onClick={() => { setSelectedAdmin(null); setModalMode("add"); }}>
              <Plus size={13} />
              Add Admin User
            </Button>
          </Row>
        </Box>
        <DataTable
          data={filtered}
          columns={columns}
          total={teamData.total}
          page={page}
          pageSize={20}
          onPageChange={setPage}
          numberedPagination
          loading={isLoading}
          emptyTitle="No admin users"
          emptyMessage="No admin users found"
        />
      </Card>

      <AdminUserModal
        open={Boolean(modalMode)}
        mode={modalMode ?? "add"}
        admin={selectedAdmin}
        roles={roles}
        onClose={() => setModalMode(null)}
      />
      <DeleteConfirmModal admin={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </Box>
  );
}
