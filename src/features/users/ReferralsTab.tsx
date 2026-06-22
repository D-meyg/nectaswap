import { useMemo } from 'react'
import { Card }        from '@/components/ui/Card'
import { Text }        from '@/components/ui/Text'
import { Row }         from '@/components/ui/Row'
import { Stack }       from '@/components/ui/Stack'
import { Box }         from '@/components/ui/Box'
import { Avatar }      from '@/components/ui/Avatar'
import { CodeBadge }   from '@/components/ui/CodeBadge'
import { DataTable }   from '@/components/tables/DataTable'
import { EmptyState }  from '@/components/ui/EmptyState'
import { formatNGN }   from '@/lib/utils'
import { useUserReferrals } from '@/hooks/queries/useUsers'
import type { ColumnDef } from '@tanstack/react-table'
import { Users } from 'lucide-react'

interface ReferralsTabProps {
  userId: string
}

interface ReferredUser {
  id: string
  name: string
  email: string
  join_date: string
  volume: number
  commission: number
  status: string
}

function ReferralStat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <Box px={3} py={3}>
        <Text variant="micro" color="muted" className="mb-1 block text-[0.625rem] leading-3">{label}</Text>
        <Text variant="title" color="primary" weight="semibold" as="p" className="text-lg leading-6">{value}</Text>
        {sub && <Text variant="micro" color="success" className="mt-0.5 block text-[0.625rem] leading-3">{sub}</Text>}
      </Box>
    </Card>
  )
}

export function ReferralsTab({ userId }: ReferralsTabProps) {
  const { data, isLoading } = useUserReferrals(userId)

  const ref = (data as any)?.referral ?? null
  const referredUsers: ReferredUser[] = (data as any)?.referred_users ?? []

  const columns = useMemo<ColumnDef<ReferredUser, unknown>[]>(() => [
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }) => (
        <Row gap={2} align="center">
          <Avatar name={row.original.name} size="xs" />
          <Stack gap={0}>
            <Text variant="caption" color="primary" weight="medium" className="text-xs leading-4">
              {row.original.name}
            </Text>
            <Text variant="micro" color="muted" className="text-[0.625rem] leading-3">
              {row.original.email}
            </Text>
          </Stack>
        </Row>
      ),
    },
    {
      accessorKey: 'join_date',
      header: 'Joined',
      cell: ({ getValue }) => (
        <Text variant="caption" color="secondary" className="text-xs">
          {getValue<string>()}
        </Text>
      ),
    },
    {
      accessorKey: 'volume',
      header: 'Volume',
      cell: ({ getValue }) => (
        <Text variant="caption" color="primary" weight="semibold" className="text-xs">
          {formatNGN(getValue<number>())}
        </Text>
      ),
    },
    {
      accessorKey: 'commission',
      header: 'Commission',
      cell: ({ getValue }) => (
        <Text variant="caption" color="success" weight="semibold" className="text-xs">
          {formatNGN(getValue<number>())}
        </Text>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => (
        <Text variant="caption"
          color={getValue<string>() === 'Active' ? 'success' : 'muted'}
          weight="medium"
          className="text-xs">
          {getValue<string>()}
        </Text>
      ),
    },
  ], [])

  if (!isLoading && !ref) {
    return (
      <Card>
        <Card.Body>
          <EmptyState icon={Users} title="No referral data" description="This user has no referral activity" />
        </Card.Body>
      </Card>
    )
  }

  return (
    <Stack gap={4}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <Box px={4} py={4}>
            <Text variant="micro" color="muted" className="mb-2 block text-[0.625rem] leading-3">
              Referral Code
            </Text>
            <CodeBadge code={ref?.code ?? '—'} />
          </Box>
        </Card>
        <ReferralStat
          label="Total Referrals"
          value={ref?.total_referrals ?? '—'}
          sub={ref?.active_referrals != null ? `${ref.active_referrals} active` : undefined}
        />
        <ReferralStat label="Total Earnings" value={ref?.total_earnings != null ? formatNGN(ref.total_earnings) : '—'} />
        <ReferralStat label="Pending Payout" value={ref?.pending_payout != null ? formatNGN(ref.pending_payout) : '—'} />
      </div>

      <Card noPadding>
        <Card.Header
          title="Referred Users"
          subtitle="Users who joined using this referral code"
          className="px-4 py-3 [&_h4]:text-xs [&_h4]:leading-4 [&_p]:text-[0.625rem]"
        />
        <DataTable
          data={referredUsers}
          columns={columns}
          loading={isLoading}
          emptyTitle="No referrals yet"
          emptyMessage="This user hasn't referred anyone"
        />
      </Card>

      {referredUsers.length > 0 && (
        <Card>
          <Card.Header title="Recent Commission Earnings" className="px-4 py-3 [&_h4]:text-xs [&_h4]:leading-4" />
          <Card.Body>
            {referredUsers.map((u, i) => (
              <Row
                key={u.id ?? i}
                justify="between"
                align="center"
                className={['py-2.5 px-4', i < referredUsers.length - 1 ? 'border-b border-(--color-border)' : ''].join(' ')}
              >
                <Row gap={3} align="center">
                  <Avatar name={u.name} size="sm" />
                  <Stack gap={0}>
                    <Text variant="caption" color="primary" weight="medium" as="p" className="text-xs leading-4">{u.name}</Text>
                    <Text variant="micro" color="muted" as="p" className="text-[0.625rem] leading-3">Joined {u.join_date}</Text>
                  </Stack>
                </Row>
                <Stack gap={0} className="text-right">
                  <Text variant="caption" color="success" weight="semibold" as="p" className="text-xs leading-4">{formatNGN(u.commission)}</Text>
                  <Text variant="micro" color="muted" as="p" className="text-[0.625rem] leading-3">Commission</Text>
                </Stack>
              </Row>
            ))}
          </Card.Body>
        </Card>
      )}
    </Stack>
  )
}
