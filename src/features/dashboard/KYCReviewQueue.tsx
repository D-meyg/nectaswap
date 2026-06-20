/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { Box } from "@/components/ui/Box";
import { Row } from "@/components/ui/Row";
import { Stack } from "@/components/ui/Stack";
import { useModal } from "@/hooks/ui/useModal";
import { KYC_REVIEW_MODAL_ID } from "@/components/modals/KYCReviewModal";

export function KYCReviewQueue({ items }: { items: any[] }) {
  const reviewModal = useModal(KYC_REVIEW_MODAL_ID);

  return (
    <Card noPadding>
      <Box
        px={5}
        py={4}
        className="border-b border-(--color-border-02) bg-(--color-bg-subtle)"
      >
        <Text variant="subtitle" color="primary" weight="semibold" as="h3">
          KYC Review Queue
        </Text>
      </Box>

      <Stack gap={3} className="p-5">
        {items.map((item, index) => (
          <Row
            key={item.id || index}
            justify="between"
            align="center"
            gap={4}
            className="min-h-14.5 rounded-md shadow-(--shadow-card) bg-(--color-bg-subtle) px-4 py-3"
          >
            <Stack gap={0} className="min-w-0">
              <Text
                variant="caption"
                color="primary"
                weight="semibold"
                truncate
                as="p"
              >
                {item.user_name}
              </Text>

              <Text variant="micro" color="secondary" as="p">
                {item.tier} • Submitted {item.submitted_at}
              </Text>
            </Stack>

            <Button
              size="sm"
              onClick={() => reviewModal.open({ kycId: item.id })}
              className="h-[28px] shrink-0 rounded-sm px-3 text-[11px]"
            >
              Review
            </Button>
          </Row>
        ))}

        {!items.length && (
          <Box className="rounded-md border border-border bg-bg-card px-4 py-8 text-center">
            <Text variant="caption" color="secondary">
              No KYC reviews in queue.
            </Text>
          </Box>
        )}
      </Stack>
    </Card>
  );
}
