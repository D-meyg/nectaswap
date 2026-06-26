import { useMemo } from 'react'
import { Card }        from '@/components/ui/Card'
import { Text }        from '@/components/ui/Text'
import { Row }         from '@/components/ui/Row'
import { Stack }       from '@/components/ui/Stack'
import { Box }         from '@/components/ui/Box'

import { Avatar }      from '@/components/ui/Avatar'
import { CodeBadge }   from '@/components/ui/CodeBadge'
import { DataTable }   from '@/components/tables/DataTable'
import { formatNGN }   from '@/lib/utils'
import { DUMMY_REFERRAL, DUMMY_REFERRED_USERS } from '@/lib/dummyData'
import type { ColumnDef } from '@tanstack/react-table'
import type { ReferredUser } from '@/lib/dummyData'

interface ReferralsTabProps {
  userId: string
}

// ── Stat card mini ────────────────────────────────────────
function ReferralStat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <Box px={4} py={4}>
        <Text variant="micro" color="muted" uppercase className="mb-1 block">{label}</Text>
        <Text variant="title" color="primary" weight="semibold" as="p">{value}</Text>
        {sub && <Text variant="micro" color="muted" className="mt-0.5 block">{sub}</Text>}
      </Box>
    </Card>
  )
}

export function ReferralsTab({ userId: _ }: ReferralsTabProps) {
  const ref = DUMMY_REFERRAL

  const columns = useMemo<ColumnDef<ReferredUser, unknown>[]>(() => [
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }) => (
        <Stack gap={0}>
          <Text variant="caption" color="primary" weight="medium" as="p">
            {row.original.name}
          </Text>
          <Text variant="micro" color="muted" as="p">{row.original.email}</Text>
        </Stack>
      ),
    },
    {
      accessorKey: 'join_date',
      header: 'Join Date',
      cell: ({ getValue }) => (
        <Text variant="caption" color="secondary">{getValue<string>()}</Text>
      ),
    },
    {
      accessorKey: 'total_volume',
      header: 'Total Volume',
      cell: ({ getValue }) => (
        <Text variant="caption" color="primary" weight="medium">
          {formatNGN(getValue<number>())}
        </Text>
      ),
    },
    {
      accessorKey: 'commission',
      header: 'Commission',
      cell: ({ getValue }) => (
        <Text variant="caption" color="success" weight="medium">
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
          weight="medium">
          {getValue<string>()}
        </Text>
      ),
    },
  ], [])

  return (
    <Stack gap={4}>
      {/* ── 4 stat cards ───────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Referral Code — special CodeBadge display */}
        <Card>
          <Box px={4} py={4}>
            <Text variant="micro" color="muted" uppercase className="mb-2 block">
              Referral Code
            </Text>
            <CodeBadge code={ref.code} />
          </Box>
        </Card>
        <ReferralStat
          label="Total Referrals"
          value={ref.total_referrals}
          sub={`${ref.active_referrals} active`}
        />
        <ReferralStat
          label="Total Earnings"
          value={formatNGN(ref.total_earnings)}
        />
        <ReferralStat
          label="Pending Payout"
          value={formatNGN(ref.pending_payout)}
        />
      </div>

      {/* ── Referred users table ────────────────────── */}
      <Card noPadding>
        <Card.Header
          title="Referred Users"
          subtitle="Users who joined using this referral code"
        />
        <DataTable
          data={DUMMY_REFERRED_USERS}
          columns={columns}
          emptyTitle="No referrals yet"
          emptyMessage="This user hasn't referred anyone"
        />
      </Card>

      {/* ── Recent Commission Earnings list ─────────── */}
      <Card>
        <Card.Header title="Recent Commission Earnings" />
        <Card.Body>
          {DUMMY_REFERRED_USERS.map((u, i) => (
            <Row
              key={i}
              justify="between"
              align="center"
              className={[
                'py-3 px-4',
                i < DUMMY_REFERRED_USERS.length - 1
                  ? 'border-b border-[var(--color-border)]'
                  : '',
              ].join(' ')}
            >
              <Row gap={3} align="center">
                <Avatar name={u.name} size="sm" />
                <Stack gap={0}>
                  <Text variant="caption" color="primary" weight="medium" as="p">
                    {u.name}
                  </Text>
                  <Text variant="micro" color="muted" as="p">Joined {u.join_date}</Text>
                </Stack>
              </Row>
              <Stack gap={0} className="text-right">
                <Text variant="caption" color="success" weight="semibold" as="p">
                  {formatNGN(u.commission)}
                </Text>
                <Text variant="micro" color="muted" as="p">Commission</Text>
              </Stack>
            </Row>
          ))}
        </Card.Body>
      </Card>
    </Stack>
  )
}
