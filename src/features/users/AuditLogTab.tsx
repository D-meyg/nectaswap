import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClipboardList } from "lucide-react";

// Audit entry structure — matches image 10 exactly:
// Action title (bold) + timestamp top row
// "by Admin" second line
// Description third line
// IP bottom line muted
export interface AuditEntry {
  id: string;
  action: string; // "Manual credit", "KYC approved", "Account created"
  by: string; // "James Wilson", "Sarah Chen", "System"
  description: string; // "₦ 50,000 credited - compensation for failed txn"
  ip: string; // "102.89.2.45"
  created_at: string; // "2024-01-25 11:25"
}

// Dummy audit entries matching image 10
const DUMMY_AUDIT: AuditEntry[] = [
  {
    id: "au1",
    action: "Manual credit",
    by: "James Wilson",
    description: "₦ 50,000 credited - compensation for failed txn",
    ip: "102.89.2.45",
    created_at: "2024-01-25 11:25",
  },
  {
    id: "au2",
    action: "KYC approved",
    by: "Sarah Chen",
    description: "Tier 2 verification approved",
    ip: "102.89.2.41",
    created_at: "2024-01-20 15:50",
  },
  {
    id: "au3",
    action: "Account created",
    by: "System",
    description: "User registration completed",
    ip: "N/A",
    created_at: "2024-01-15 10:30",
  },
];

interface AuditEntryRowProps {
  entry: AuditEntry;
  isLast: boolean;
}

// Single audit entry — feed style, no table, matches image 10
function AuditEntryRow({ entry, isLast }: AuditEntryRowProps) {
  return (
    <div
      className={[
        "px-5 py-4",
        !isLast ? "border-b border-(--color-border)" : "",
      ].join(" ")}
    >
      {/* Top row: action title + timestamp */}
      <Row justify="between" align="start" gap={4}>
        <Text variant="caption" color="primary" weight="semibold">
          {entry.action}
        </Text>
        <Text variant="micro" color="muted" className="shrink-0">
          {entry.created_at}
        </Text>
      </Row>

      {/* "by Admin/System" */}
      <Text variant="micro" color="muted" className="mt-0.5 block">
        by {entry.by}
      </Text>

      {/* Description */}
      <Text variant="caption" color="secondary" className="mt-1 block">
        {entry.description}
      </Text>

      {/* IP */}
      <Text variant="micro" color="muted" className="mt-1 block">
        IP: {entry.ip}
      </Text>
    </div>
  );
}

interface AuditLogTabProps {
  entries?: AuditEntry[];
}

export function AuditLogTab({ entries }: AuditLogTabProps) {
  // Use passed entries or fall back to dummy data
  const data = entries && entries.length > 0 ? entries : DUMMY_AUDIT;

  if (!data.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No audit entries"
        description="Admin actions on this account will appear here"
      />
    );
  }

  return (
    <Card noPadding>
      {data.map((entry, i) => (
        <AuditEntryRow
          key={entry.id}
          entry={entry}
          isLast={i === data.length - 1}
        />
      ))}
    </Card>
  );
}
