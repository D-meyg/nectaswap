import { Card }    from '@/components/ui/Card'
import { Text }    from '@/components/ui/Text'
import { Skeleton }from '@/components/ui/Skeleton'
import { Box }     from '@/components/ui/Box'
import { Stack }   from '@/components/ui/Stack'
import { formatNGN } from '@/lib/utils'
import type { UserDetail } from '@/api/types'
import type { ReactNode } from 'react'

interface InfoFieldProps { label: string; value?: string | number | null }

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <Stack gap={0}>
      <Text variant="micro" color="muted" className="text-[10px] leading-4">{label}</Text>
      <Text variant="caption" color="primary" className="text-[12px] leading-4">{value ?? 'N/A'}</Text>
    </Stack>
  )
}

function OverviewCard({
  title,
  children,
  className,
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      {title && (
        <Card.Header
          title={title}
          className="border-b-0 px-4 pb-1 pt-3 [&_h4]:text-[12px] [&_h4]:leading-4"
        />
      )}
      <Card.Body className="px-4 pb-4 pt-1">{children}</Card.Body>
    </Card>
  )
}

interface OverviewTabProps {
  user:     UserDetail
  loading?: boolean
}

export function OverviewTab({ user, loading }: OverviewTabProps) {
  if (loading) {
    return (
      <Stack gap={4}>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
      </Stack>
    )
  }

  return (
    <Stack gap={4}>
      <OverviewCard title="Profile Information">
        <Box className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <InfoField label="Email"   value={user.email} />
          <InfoField label="Phone"   value={user.phone} />
          <InfoField label="Joined"  value={user.joined} />
          <InfoField label="Last IP" value={user.last_ip} />
        </Box>
      </OverviewCard>

      <OverviewCard title="KYC & Risk">
        <Box className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
          <Stack gap={0}>
            <Text variant="micro" color="muted" className="text-[10px] leading-4">KYC Level</Text>
            <Text variant="caption" color="primary" className="text-[12px] leading-4">{user.kyc_level ?? 'N/A'}</Text>
            {user.kyc_status && (
              <Text
                variant="micro"
                color={user.kyc_status === 'rejected' ? 'danger' : 'success'}
                weight="semibold"
                className="mt-0.5 text-[10px] capitalize leading-4"
              >
                {user.kyc_status}
              </Text>
            )}
          </Stack>
          <InfoField label="Expiry Date"  value={user.kyc_expiry} />
          <Stack gap={0}>
            <Text variant="micro" color="muted" className="text-[10px] leading-4">Risk Score</Text>
            <Text
              variant="caption"
              color={
                (user.risk_score ?? 0) > 70 ? 'danger' :
                (user.risk_score ?? 0) > 40 ? 'warning' : 'success'
              }
              weight="semibold"
              className="text-[12px] leading-4"
            >
              {user.risk_score ?? 0}
            </Text>
          </Stack>
        </Box>
      </OverviewCard>

      <OverviewCard title="Linked Bank Accounts">
        <Text variant="caption" color="primary" className="text-[12px] leading-4">
          N/A
        </Text>
      </OverviewCard>

      <OverviewCard title="Crypto Wallet">
        <Text
          variant="caption"
          color={user.crypto_wallet ? 'primary' : 'muted'}
          className="text-[12px] leading-4"
        >
          {user.crypto_wallet ?? 'N/A'}
        </Text>
      </OverviewCard>

      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <OverviewCard>
          <Text variant="micro" color="muted" className="text-[10px] leading-4">Total Volume (Crypto → Naira)</Text>
          <Text variant="heading" color="primary" className="mt-1 block text-[24px] leading-7">
            {user.total_volume ? formatNGN(user.total_volume) : 'N/A'}
          </Text>
          <Text variant="micro" color="muted" className="text-[10px] leading-4">{user.conversions ?? 0} conversions</Text>
        </OverviewCard>
        <OverviewCard>
          <Text variant="micro" color="muted" className="text-[10px] leading-4">Success Rate</Text>
          <Text
            variant="heading"
            color={user.success_rate ? 'success' : 'muted'}
            className="mt-1 block text-[24px] leading-7"
          >
            {user.success_rate ? `${user.success_rate}%` : 'N/A'}
          </Text>
          <Text variant="micro" color="muted" className="text-[10px] leading-4">
            Avg. {user.success_rate ? `${user.success_rate}%` : 'N/A'}
          </Text>
        </OverviewCard>
      </Box>
    </Stack>
  )
}
