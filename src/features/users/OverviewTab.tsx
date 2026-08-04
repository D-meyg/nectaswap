import { Card }    from '@/components/ui/Card'
import { Text }    from '@/components/ui/Text'
import { Skeleton }from '@/components/ui/Skeleton'
import { Box }     from '@/components/ui/Box'
import { Stack }   from '@/components/ui/Stack'
import { formatNGN } from '@/lib/utils'
import { formatDate, formatDateTime } from '@/lib/date'
import type { UserDetail } from '@/api/types'
import type { ReactNode } from 'react'

interface InfoFieldProps { label: string; value?: string | number | null }

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <Stack gap={0}>
      <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">{label}</Text>
      <Text variant="caption" color="primary" className="text-xs leading-4">{value ?? 'N/A'}</Text>
    </Stack>
  )
}

function BoolField({ label, value }: { label: string; value?: boolean }) {
  return (
    <Stack gap={0}>
      <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">{label}</Text>
      <Text
        variant="caption"
        color={value ? 'success' : 'danger'}
        weight="semibold"
        className="text-xs leading-4"
      >
        {value ? 'Yes' : 'No'}
      </Text>
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
          className="border-b-0 px-4 pb-1 pt-3 [&_h4]:text-xs [&_h4]:leading-4"
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

/** Amounts arrive as plain numbers from the API. */
function money(value: unknown): string {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? formatNGN(n) : 'N/A'
}

export function OverviewTab({ user, loading }: OverviewTabProps) {
  if (loading) {
    return (
      <Stack gap={4}>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
      </Stack>
    )
  }

  // The users detail endpoint returns snake_case fields directly; read through
  // a raw record so we use exactly what the API sends.
  const u = (user ?? {}) as unknown as Record<string, any>
  const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ')

  return (
    <Stack gap={4}>
      <OverviewCard title="Profile Information">
        <Box className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <InfoField label="Full Name"     value={fullName || u.username} />
          <InfoField label="Username"      value={u.username} />
          <InfoField label="Email"         value={u.email} />
          <InfoField label="Phone"         value={u.phone_number ?? u.phone} />
          <InfoField label="Date of Birth" value={u.date_of_birth ? formatDate(u.date_of_birth) : undefined} />
          <InfoField label="Referral Code" value={u.referral_code} />
          <InfoField label="Joined"        value={u.created_at ? formatDate(u.created_at) : undefined} />
          <InfoField label="Last Login"    value={u.last_login ? formatDateTime(u.last_login) : undefined} />
          {/* Not returned by the API: Last IP */}
        </Box>
      </OverviewCard>

      <OverviewCard title="KYC & Account Status">
        <Box className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
          <InfoField label="Account Level" value={u.account_level} />
          <BoolField label="KYC Verified"    value={u.kyc_verified} />
          <BoolField label="Email Verified"  value={u.is_email_verified} />
          <BoolField label="Phone Verified"  value={u.is_phone_number_verified} />
          <BoolField label="Active"          value={u.is_active} />
          <BoolField label="Restricted"      value={u.is_restricted} />
          {/* Not returned by the API: KYC expiry date, risk score */}
        </Box>
      </OverviewCard>

      <OverviewCard title="Balances">
        <Box className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
          <InfoField label="Wallet Balance" value={money(u.wallet_balance)} />
          <InfoField label="Ledger Balance" value={money(u.ledger_balance)} />
          <InfoField label="Bonus Balance"  value={money(u.bonus_balance)} />
        </Box>
      </OverviewCard>

      <OverviewCard title="Cards">
        <Box className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-4">
          <InfoField label="Total Cards" value={u.total_cards} />
          <InfoField label="USD Cards"   value={u.total_usd_cards} />
          <InfoField label="NGN Cards"   value={u.total_ngn_cards} />
          <Stack gap={0}>
            <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">Card Access</Text>
            <Text variant="caption" color="primary" className="text-xs leading-4">
              {[u.can_use_usd_card ? 'USD' : null, u.can_use_ngn_card ? 'NGN' : null]
                .filter(Boolean)
                .join(' • ') || 'None'}
            </Text>
          </Stack>
        </Box>
      </OverviewCard>

      {/* Linked bank accounts / crypto wallet / success rate are not part of
          the users detail response yet — hidden instead of showing "N/A". */}

      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <OverviewCard>
          <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">Total Transfers</Text>
          <Text variant="heading" color="primary" className="mt-1 block text-2xl leading-7">
            {money(u.total_transfers)}
          </Text>
        </OverviewCard>
        <OverviewCard>
          <Text variant="micro" color="muted" className="text-[0.625rem] leading-4">Lifetime Transfers</Text>
          <Text variant="heading" color="primary" className="mt-1 block text-2xl leading-7">
            {money(u.lifetime_transfers)}
          </Text>
        </OverviewCard>
      </Box>
    </Stack>
  )
}
