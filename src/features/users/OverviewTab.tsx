import { Card }    from '@/components/ui/Card'
import { Text }    from '@/components/ui/Text'
import { Badge }   from '@/components/ui/Badge'
import { Skeleton }from '@/components/ui/Skeleton'
import { formatNGN } from '@/lib/utils'
import type { UserDetail } from '@/api/types'

interface InfoFieldProps { label: string; value?: string | number | null }

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div>
      <Text variant="micro" color="muted" uppercase className="mb-0.5">{label}</Text>
      <Text variant="caption" color="primary">{value ?? 'N/A'}</Text>
    </div>
  )
}

interface OverviewTabProps {
  user:     UserDetail
  loading?: boolean
}

export function OverviewTab({ user, loading }: OverviewTabProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    )
  }

  const kycStatusVariant =
    user.kyc_status === 'approved' ? 'success' :
    user.kyc_status === 'rejected' ? 'danger'  : 'warning'

  return (
    <div className="space-y-4">
      {/* Profile Information */}
      <Card>
        <Card.Header title="Profile Information" />
        <Card.Body padded>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-1">
            <InfoField label="Email"   value={user.email} />
            <InfoField label="Phone"   value={user.phone} />
            <InfoField label="Joined"  value={user.joined} />
            <InfoField label="Last IP" value={user.last_ip} />
          </div>
        </Card.Body>
      </Card>

      {/* KYC & Risk */}
      <Card>
        <Card.Header title="KYC & Risk" />
        <Card.Body padded>
          <div className="grid grid-cols-3 gap-x-8 gap-y-4 pt-1">
            <div>
              <Text variant="micro" color="muted" uppercase className="mb-0.5">KYC Level</Text>
              <Text variant="caption" color="primary">{user.kyc_level ?? 'N/A'}</Text>
              {user.kyc_status && (
                <div className="mt-1">
                  <Badge variant={kycStatusVariant} label={user.kyc_status} />
                </div>
              )}
            </div>
            <InfoField label="Expiry Date"  value={user.kyc_expiry} />
            <div>
              <Text variant="micro" color="muted" uppercase className="mb-0.5">Risk Score</Text>
              <Text
                variant="caption"
                color={
                  (user.risk_score ?? 0) > 70 ? 'danger' :
                  (user.risk_score ?? 0) > 40 ? 'warning' : 'success'
                }
                weight="semibold"
              >
                {user.risk_score ?? 0}
              </Text>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Linked Bank Accounts */}
      <Card>
        <Card.Header title="Linked Bank Accounts" />
        <Card.Body padded>
          <Text variant="caption" color="muted" className="py-4 block text-center">
            No bank accounts linked
          </Text>
        </Card.Body>
      </Card>

      {/* Crypto Wallet */}
      <Card>
        <Card.Header title="Crypto Wallet" />
        <Card.Body padded>
          <Text variant="caption" color={user.crypto_wallet ? 'primary' : 'muted'}>
            {user.crypto_wallet ?? 'N/A'}
          </Text>
        </Card.Body>
      </Card>

      {/* Volume Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <Card.Body padded>
            <Text variant="micro" color="muted" uppercase>Total Volume (Crypto → Naira)</Text>
            <Text variant="heading" color="primary" className="mt-1 block">
              {user.total_volume ? formatNGN(user.total_volume) : 'N/A'}
            </Text>
            <Text variant="micro" color="muted">{user.conversions ?? 0} conversions</Text>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body padded>
            <Text variant="micro" color="muted" uppercase>Success Rate</Text>
            <Text
              variant="heading"
              color={user.success_rate ? 'success' : 'muted'}
              className="mt-1 block"
            >
              {user.success_rate ? `${user.success_rate}%` : 'N/A'}
            </Text>
            <Text variant="micro" color="muted">
              Avg. {user.success_rate ? `${user.success_rate}%` : 'N/A'}
            </Text>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}
