import { usePageTitle } from "@/layouts/AppLayout";
import { useMemo, useState } from "react";
import { Plus, Edit, RotateCcw, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Tooltip } from "@/components/ui/Tooltip";
import { DataTable } from "@/components/tables/DataTable";
import { SearchInput } from "@/components/forms/SearchInput";
import { useDebounce } from "@/hooks/ui/useDebounce";
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

const ADMIN_USERS: AdminUser[] = [
  {
    name: "Sarah Chen",
    email: "sarah.chen@nectaswap.com",
    role: "Super Admin",
    role_color: "text-[#8B5CF6]",
    permissions: "View (1)",
    status: "Active",
    last_login: "2 hours ago",
  },
  {
    name: "James Wilson",
    email: "james.wilson@nectaswap.com",
    role: "Admin",
    role_color: "text-[var(--color-brand)]",
    permissions: "View (3)",
    status: "Active",
    last_login: "5 hours ago",
  },
  {
    name: "Maria Garcia",
    email: "maria.garcia@nectaswap.com",
    role: "Compliance Officer",
    role_color: "text-[var(--color-warning-dark)]",
    permissions: "View (3)",
    status: "Active",
    last_login: "1 day ago",
  },
  {
    name: "David Park",
    email: "david.park@nectaswap.com",
    role: "Support Agent",
    role_color: "text-[var(--color-success-mid)]",
    permissions: "View (3)",
    status: "Active",
    last_login: "3 hours ago",
  },
  {
    name: "Lisa Anderson",
    email: "lisa.anderson@nectaswap.com",
    role: "Finance Manager",
    role_color: "text-[var(--color-text-secondary)]",
    permissions: "View (3)",
    status: "Suspended",
    last_login: "1 week ago",
  },
];

export default function AdminUsersPage() {
  usePageTitle("Admin Users", "Manage admin accounts, roles, and permissions");

  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 300);

  const filtered = useMemo(
    () =>
      ADMIN_USERS.filter(
        (u) =>
          !debounced ||
          u.name.toLowerCase().includes(debounced.toLowerCase()) ||
          u.email.toLowerCase().includes(debounced.toLowerCase()),
      ),
    [debounced],
  );

  const columns = useMemo<ColumnDef<AdminUser, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Admin",
        cell: ({ row }) => (
          <Row gap={3} align="center">
            <Avatar name={row.original.name} size="sm" />
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
        cell: () => (
          <Row gap={1} align="center">
            <Tooltip content="Edit" side="top">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 flex items-center justify-center"
              >
                <Edit size={13} className="text-[var(--color-text-muted)]" />
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
                  className="text-[var(--color-text-muted)]"
                />
              </Button>
            </Tooltip>
            <Tooltip content="Delete" side="top">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 flex items-center justify-center"
              >
                <Trash2 size={13} className="text-[var(--color-danger)]" />
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
        <Box px={5} py={4} className="border-b border-[var(--color-border)]">
          <Row justify="between" align="center">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search admin users..."
              className="max-w-[320px]"
            />
            <Button size="sm">
              <Plus size={13} />
              Add Admin User
            </Button>
          </Row>
        </Box>
        <DataTable
          data={filtered}
          columns={columns}
          emptyTitle="No admin users"
          emptyMessage="No admin users found"
        />
      </Card>
    </Box>
  );
}
