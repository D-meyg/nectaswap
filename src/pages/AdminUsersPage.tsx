import { usePageTitle } from "@/layouts/AppLayout";
import { useMemo, useState } from "react";
import { Plus, Edit, RotateCcw, Trash2 } from "lucide-react";

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
import { useAdmins } from "@/hooks/queries/useAdmins";
import type { ColumnDef } from "@tanstack/react-table";

interface AdminUser {
  name: string;
  email: string;
  role: string;
  role_color: string;
  permissions: string;
  status: "Active" | "Suspended";
  last_login: string;
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function normalizeAdmin(value: unknown): AdminUser {
  const item =
    value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const role =
    item.role && typeof item.role === "object"
      ? (item.role as Record<string, unknown>)
      : item.role;
  const roleName =
    typeof role === "string" ? role : text((role as Record<string, unknown>)?.role_name, "Admin");

  return {
    name: text(item.name ?? item.full_name, "Admin User"),
    email: text(item.email, "N/A"),
    role: roleName,
    role_color: roleName.toLowerCase().includes("super")
      ? "text-(--color-brand)"
      : "text-(--color-text-secondary)",
    permissions: text(item.permissions, "View"),
    status: text(item.status, "Active") === "Suspended" ? "Suspended" : "Active",
    last_login: text(item.last_login ?? item.lastLogin, "N/A"),
  };
}

function AdminUserModal({
  open,
  mode,
  admin,
  onClose,
}: {
  open: boolean;
  mode: "add" | "edit";
  admin?: AdminUser | null;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} size="md" className="max-w-[22.5rem]">
      <Modal.Header
        title={mode === "add" ? "Add Admin User" : "Edit Admin User"}
        onClose={onClose}
        className="border-b-0 px-4 pb-2 pt-4 [&_h4]:text-[1rem]"
      />
      <Modal.Body className="px-4 py-0">
        <Stack gap={3}>
          <label className="block">
            <Text variant="micro" color="secondary" className="mb-1 block">Full Name</Text>
            <input className="h-9 w-full rounded-(--radius-sm) border border-(--color-border) px-3 text-[0.8125rem] outline-none focus:border-(--color-brand)" defaultValue={admin?.name ?? ""} placeholder="Sarah Chen" />
          </label>
          <label className="block">
            <Text variant="micro" color="secondary" className="mb-1 block">Email Address</Text>
            <input className="h-9 w-full rounded-(--radius-sm) border border-(--color-border) px-3 text-[0.8125rem] outline-none focus:border-(--color-brand)" defaultValue={admin?.email ?? ""} placeholder="sarah.chen@nectaswap.com" />
          </label>
          <label className="block">
            <Text variant="micro" color="secondary" className="mb-1 block">Role</Text>
            <input className="h-9 w-full rounded-(--radius-sm) border border-(--color-border) px-3 text-[0.8125rem] outline-none focus:border-(--color-brand)" defaultValue={admin?.role ?? ""} />
          </label>
          {mode === "add" && (
            <Box className="rounded-(--radius-sm) bg-[#EFF6FF] px-3 py-2">
              <Text variant="micro" color="brand" weight="semibold">Permissions for Super Admin:</Text>
              <Text variant="micro" color="primary" className="block">All Permissions</Text>
            </Box>
          )}
        </Stack>
      </Modal.Body>
      <Modal.Footer className="grid grid-cols-2 gap-3 border-t-0 bg-white px-4 pb-4 pt-4">
        <Button variant="secondary" size="sm" className="h-9 justify-center" onClick={onClose}>Cancel</Button>
        <Button size="sm" className="h-9 justify-center" onClick={onClose}>
          {mode === "add" ? "Add Admin" : "Save Changes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function AdminUsersPage() {
  usePageTitle("Admin Users", "Manage admin accounts, roles, and permissions");

  const [search, setSearch] = useState("");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const debounced = useDebounce(search, 300);
  const { data: apiAdmins = [], isLoading } = useAdmins();
  const admins = useMemo(
    () => (Array.isArray(apiAdmins) ? apiAdmins.map(normalizeAdmin) : []),
    [apiAdmins],
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
        cell: ({ row }) => (
          <Row gap={3} align="center">
            <Stack gap={0}>
              <Text variant="caption" color="primary" weight="semibold" as="p">
                {row.original.name}
              </Text>
              <Text variant="micro" color="muted" as="p">
                {row.original.email}
              </Text>
            </Stack>
          </Row>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Text
            variant="caption"
            weight="medium"
            className={row.original.role_color}
          >
            {row.original.role}
          </Text>
        ),
      },
      {
        accessorKey: "permissions",
        header: "Permissions",
        cell: ({ getValue }) => (
          <Text variant="caption" color="secondary">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <Text
            variant="caption"
            weight="medium"
            color={getValue<string>() === "Active" ? "success" : "danger"}
          >
            {getValue<string>()}
          </Text>
        ),
      },
      {
        accessorKey: "last_login",
        header: "Last Login",
        cell: ({ getValue }) => (
          <Text variant="caption" color="muted">
            {getValue<string>()}
          </Text>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Row gap={1} align="center">
            <Tooltip content="Edit" side="top">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 flex items-center justify-center"
                onClick={() => {
                  setSelectedAdmin(row.original);
                  setModalMode("edit");
                }}
              >
                <Edit size={13} className="text-(--color-text-muted)" />
              </Button>
            </Tooltip>
            <Tooltip content="Reset password" side="top">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 flex items-center justify-center"
              >
                <RotateCcw
                  size={13}
                  className="text-(--color-text-muted)"
                />
              </Button>
            </Tooltip>
            <Tooltip content="Delete" side="top">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 flex items-center justify-center"
              >
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
              onChange={setSearch}
              placeholder="Search admin users..."
              className="max-w-80"
            />
            <Button
              size="sm"
              onClick={() => {
                setSelectedAdmin(null);
                setModalMode("add");
              }}
            >
              <Plus size={13} />
              Add Admin User
            </Button>
          </Row>
        </Box>
        <DataTable
          data={filtered}
          columns={columns}
          loading={isLoading}
          emptyTitle="No admin users"
          emptyMessage="No admin users found"
        />
      </Card>
      <AdminUserModal
        open={Boolean(modalMode)}
        mode={modalMode ?? "add"}
        admin={selectedAdmin}
        onClose={() => setModalMode(null)}
      />
    </Box>
  );
}
