import { usePageTitle } from "@/layouts/AppLayout";
import { useState, useMemo, useCallback } from "react";
import { Clock, CheckCircle, XCircle, FileText, Eye } from "lucide-react";

import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Card } from "@/components/ui/Card";
import { DataTable } from "@/components/tables/DataTable";
import { TabsRoot, TabsList, Tab } from "@/components/ui/Tabs";
import {
  KYCReviewModal,
  KYC_REVIEW_MODAL_ID,
} from "@/components/modals/KYCReviewModal";

import { useKYCQueue } from "@/hooks/queries/useKYC";
import { useModal } from "@/hooks/ui/useModal";
import type { ColumnDef } from "@tanstack/react-table";
import type { KYCSubmission } from "@/api/types";

type FilterTab = "all" | "pending" | "approved" | "rejected";

// Document icons row — matches image 2
function DocIcons({ count, total }: { count: number; total: number }) {
  return (
    <Row gap={1} align="center">
      {/* File, person, shield icons */}
      {["📄", "👤", "🛡"].map((icon, i) => (
        <span
          key={i}
          className={cn(
            "text-[0.8125rem]",
            i < count ? "opacity-100" : "opacity-30",
          )}
        >
          {icon}
        </span>
      ))}
      <Text variant="micro" color="secondary" className="ml-1">
        {count}/{total}
      </Text>
    </Row>
  );
}

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function KYCPage() {
  usePageTitle("KYC Management", "Identity verification and compliance review");

  const [filter, setFilter] = useState<FilterTab>("pending");
  const { data: apiQueue, isLoading } = useKYCQueue();
  const reviewModal = useModal(KYC_REVIEW_MODAL_ID);

  const queue = apiQueue ?? [];

  const filtered = useMemo(
    () => (filter === "all" ? queue : queue.filter((k) => k.status === filter)),
    [queue, filter],
  );

  const pending = queue.filter((k) => k.status === "pending").length;
  const approved = queue.filter((k) => k.status === "approved").length;
  const rejected = queue.filter((k) => k.status === "rejected").length;

  const handleReview = useCallback(
    (kycId: string) => {
      reviewModal.open({ kycId });
    },
    [reviewModal],
  );

  const columns = useMemo<ColumnDef<KYCSubmission, unknown>[]>(
    () => [
      {
        accessorKey: "user_name",
        header: "User",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="semibold" as="p">
              {row.original.user_name}
            </Text>
            <Text variant="micro" color="muted" as="p">
              {row.original.user_email}
            </Text>
            <Text variant="micro" color="muted" as="p">
              ID: {row.original.user_id}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: "submitted_at",
        header: "Submitted",
        cell: ({ row }) => (
          <Stack gap={0}>
            <Text variant="caption" color="primary" as="p">
              {row.original.submitted_at.split(" ")[1] ||
                row.original.submitted_at}
            </Text>
            <Text variant="micro" color="muted" as="p">
              {row.original.submitted_at.split(" ")[0] || ""}
            </Text>
          </Stack>
        ),
      },
      {
        accessorKey: "tier",
        header: "Tier",
        cell: ({ getValue }) => {
          const tier = getValue<string>();
          const color =
            tier === "Tier 3"
              ? "text-(--color-danger)"
              : tier === "Tier 2"
                ? "text-(--color-brand)"
                : "text-(--color-success-mid)";
          return (
            <Text variant="caption" weight="medium" className={color} as="span">
              {tier}
            </Text>
          );
        },
      },
      {
        accessorKey: "documents",
        header: "Documents",
        cell: ({ row }) => (
          <DocIcons
            count={row.original.documents}
            total={row.original.total_docs}
          />
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ getValue }) => {
          const v = getValue<string>();
          return (
            <Text
              variant="caption"
              weight="medium"
              color={v === "high" ? "danger" : "secondary"}
              as="span"
            >
              {v}
            </Text>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const v = getValue<string>();
          // Matches image 2: "pending" in orange pill
          const style =
            v === "approved"
              ? "bg-(--color-success-bg) text-(--color-success-mid)"
              : v === "rejected"
                ? "bg-(--color-danger-subtle) text-(--color-danger)"
                : "bg-(--color-warning-subtle) text-(--color-warning-dark)";
          return (
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                style,
              )}
            >
              {v}
            </span>
          );
        },
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <Button size="sm" onClick={() => handleReview(row.original.id)}>
            <Eye size={13} />
            Review
          </Button>
        ),
      },
    ],
    [handleReview],
  );

  return (
    <Box p={6} className="space-y-5">
      {/* 4 stat cards — matches image 2 exactly */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Pending Review"
          value={pending}
          icon={<Clock size={16} className="text-(--color-warning)" />}
          loading={isLoading}
        />
        <StatCard
          label="Approved Today"
          value={approved}
          icon={
            <CheckCircle
              size={16}
              className="text-(--color-success-mid)"
            />
          }
          loading={isLoading}
        />
        <StatCard
          label="Rejected Today"
          value={rejected}
          icon={<XCircle size={16} className="text-(--color-danger)" />}
          loading={isLoading}
        />
        <StatCard
          label="Avg Review Time"
          value="24m"
          icon={
            <FileText size={16} className="text-(--color-text-muted)" />
          }
          loading={isLoading}
        />
      </div>

      {/*
        Table card — tabs are INSIDE the card header row,
        matching image 2: "All Applications | Pending | Approved | Rejected"
        as plain underline tabs directly above the table.
      */}
      <Card noPadding>
        {/* Tab bar as card header — no border-b on the card header */}
        <Box px={5} className="border-b border-(--color-border)">
          <TabsRoot value={filter} onChange={(v) => setFilter(v as FilterTab)}>
            <TabsList className="border-b-0 gap-6">
              {(["all", "pending", "approved", "rejected"] as FilterTab[]).map(
                (t) => (
                  <Tab key={t} value={t}>
                    {t === "all"
                      ? "All Applications"
                      : t.charAt(0).toUpperCase() + t.slice(1)}
                  </Tab>
                ),
              )}
            </TabsList>
          </TabsRoot>
        </Box>

        <DataTable
          data={filtered}
          columns={columns}
          loading={isLoading}
          emptyTitle="No applications"
          emptyMessage={`No ${filter === "all" ? "" : filter} KYC applications`}
          stickyHeader
        />
      </Card>

      <KYCReviewModal />
    </Box>
  );
}
