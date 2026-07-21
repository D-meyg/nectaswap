import { useMemo, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, CreditCard } from "lucide-react";

import { usePageActions, usePageTitle } from "@/layouts/AppLayout";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  CardTypePill,
  KYCStatusPill,
  ApprovalStatusPill,
} from "@/components/cards/CardRequestPills";
import {
  DUMMY_CARD_REQUEST_DETAILS,
  type CardRequestDetail,
} from "@/lib/dummyData";

const QUICK_LINKS: Array<{ label: string; to: string; brand?: boolean }> = [
  { label: "View User Profile", to: "/users", brand: true },
  { label: "Check Flagged Users", to: "/compliance/flagged" },
  { label: "AML Reports", to: "/compliance/aml" },
  { label: "Card Limits & Controls", to: "/cards/limits" },
];

function InfoPair({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Row justify="between" align="center" gap={3} className="min-w-0">
      <Text
        variant="caption"
        color="tertiary"
        className="shrink-0 text-[0.6875rem]"
      >
        {label}
      </Text>
      {typeof value === "string" ? (
        <Text
          variant="caption"
          color="primary"
          weight="semibold"
          className="text-right text-[0.75rem]"
        >
          {value}
        </Text>
      ) : (
        value
      )}
    </Row>
  );
}

function ApplicantDetailsCard({ request }: { request: CardRequestDetail }) {
  return (
    <Card>
      <Card.Header
        title="Applicant Details"
        className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5"
      />
      <Card.Body className="px-5 pb-5 pt-2">
        <Row gap={3} align="center" className="mb-5">
          <Avatar name={request.user_name} size="lg" />
          <Stack gap={0} className="min-w-0">
            <Text variant="subtitle" color="primary" weight="semibold" as="p">
              {request.user_name}
            </Text>
            <Text variant="micro" color="muted" as="p">
              {request.user_email}
            </Text>
          </Stack>
        </Row>

        <div className="grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
          <InfoPair label="Phone" value={request.phone} />
          <InfoPair
            label="Card Type"
            value={<CardTypePill type={request.card_type} />}
          />
          <InfoPair label="Currency" value={request.currency} />
          <InfoPair label="Requested On" value={request.requested_on} />
          <InfoPair
            label="KYC Status"
            value={<KYCStatusPill status={request.kyc_status} />}
          />
          <InfoPair
            label="Current Status"
            value={<ApprovalStatusPill status={request.approval_status} />}
          />
          <InfoPair label="Assigned Admin" value={request.assigned_admin} />
        </div>
      </Card.Body>
    </Card>
  );
}

function QuickLinksCard() {
  return (
    <Card>
      <Card.Header
        title="QUICK LINKS"
        className="border-b-0 px-4 pb-1 pt-3 [&_h4]:text-[0.625rem] [&_h4]:uppercase [&_h4]:tracking-[0.06em] [&_h4]:text-(--color-text-tertiary)"
      />
      <Card.Body className="px-4 pb-2 pt-0">
        <Stack gap={0}>
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="group flex items-center justify-between border-b border-(--color-border) py-2.5 transition-colors last:border-b-0 hover:bg-(--color-bg-subtle)"
            >
              <Text
                variant="caption"
                color={link.brand ? "brand" : "primary"}
                weight={link.brand ? "semibold" : "medium"}
                className="text-[0.75rem]"
              >
                {link.label}
              </Text>
              <ChevronRight
                size={13}
                className="shrink-0 text-(--color-text-muted) transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ))}
        </Stack>
      </Card.Body>
    </Card>
  );
}

function ReviewActionsCard() {
  return (
    <Card>
      <Card.Header
        title="REVIEW ACTIONS"
        className="border-b-0 px-4 pb-1 pt-3 [&_h4]:text-[0.625rem] [&_h4]:uppercase [&_h4]:tracking-[0.06em] [&_h4]:text-(--color-text-tertiary)"
      />
      <Card.Body className="px-4 pb-4 pt-1">
        <Stack gap={2}>
          <Button
            size="sm"
            className="h-9 w-full justify-center border-(--color-success-mid) bg-(--color-success-mid) text-xs text-white hover:opacity-90"
          >
            Approve Request
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="h-9 w-full justify-center text-xs"
          >
            Reject Request
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="h-9 w-full justify-center text-xs"
          >
            Request More Info
          </Button>
        </Stack>
      </Card.Body>
    </Card>
  );
}

export default function CardRequestDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const request = DUMMY_CARD_REQUEST_DETAILS[id];

  usePageTitle(
    request ? request.id : "Card Request",
    request
      ? `${request.user_name} · ${request.card_type} Card · ${request.currency}`
      : "Card request details",
  );

  usePageActions(
    useMemo(
      () =>
        request ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 px-3 text-[0.6875rem]"
              onClick={() => navigate("/cards/requests")}
            >
              <ArrowLeft size={13} />
              Back
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="h-8 px-3 text-[0.6875rem]"
            >
              Reject
            </Button>
            <Button
              size="sm"
              className="h-8 border-(--color-success-mid) bg-(--color-success-mid) px-3 text-[0.6875rem] text-white hover:opacity-90"
            >
              Approve
            </Button>
          </>
        ) : null,
      [navigate, request],
    ),
  );

  if (!request) {
    return (
      <Box p={6}>
        <EmptyState
          icon={CreditCard}
          title="Card request not found"
          description="This request does not exist or may have been removed."
        />
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Cards", to: "/cards" },
          { label: "Card Requests", to: "/cards/requests" },
          { label: request.id },
        ]}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left column */}
        <Stack gap={5} className="lg:col-span-2">
          <ApplicantDetailsCard request={request} />

          <Card>
            <Card.Header
              title="Reason for Card"
              className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5"
            />
            <Card.Body className="px-5 pb-5 pt-1">
              <Text
                variant="caption"
                color="secondary"
                className="text-[0.75rem] leading-5"
              >
                {request.reason}
              </Text>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header
              title="Transaction Activity (30d)"
              className="border-b-0 px-5 pb-1 pt-4 [&_h4]:text-[0.8125rem] [&_h4]:leading-5"
            />
            <Card.Body className="px-5 pb-5 pt-2">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Stack gap={1}>
                  <Text variant="micro" color="tertiary" as="p">
                    Monthly Volume
                  </Text>
                  <Text
                    variant="title"
                    color="primary"
                    weight="semibold"
                    as="p"
                    className="text-[1.125rem] leading-6"
                  >
                    ₦ {request.monthly_volume.toLocaleString()}
                  </Text>
                </Stack>
                <Stack gap={1}>
                  <Text variant="micro" color="tertiary" as="p">
                    Transactions
                  </Text>
                  <Text
                    variant="title"
                    color="primary"
                    weight="semibold"
                    as="p"
                    className="text-[1.125rem] leading-6"
                  >
                    {request.transactions_30d}
                  </Text>
                </Stack>
              </div>
            </Card.Body>
          </Card>
        </Stack>

        {/* Right column */}
        <Stack gap={5}>
          <QuickLinksCard />
          <ReviewActionsCard />
        </Stack>
      </div>
    </Box>
  );
}
