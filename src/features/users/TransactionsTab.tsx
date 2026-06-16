import { useMemo } from 'react'
import { DataTable }     from '@/components/tables/DataTable'
import { Badge }         from '@/components/ui/Badge'
import { Text }          from '@/components/ui/Text'
import { useTransactions }from '@/hooks/queries/useTransactions'
import { formatNGN, formatDateTime } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import type { Transaction } from '@/api/types'

interface TransactionsTabProps { userId: string }

export function TransactionsTab({ userId }: TransactionsTabProps) {
  const { data, isLoading } = useTransactions({ search: userId })

  const columns = useMemo<ColumnDef<Transaction, unknown>[]>(() => [
    {
      accessorKey: 'id',
      header: 'TXN ID',
      cell: ({ getValue }) => (
        <Text variant="caption" color="brand" className="font-mono">{getValue<string>()}</Text>
      ),
    },
    { accessorKey: 'crypto', header: 'Crypto' },
    {
      accessorKey: 'amount_ngn',
      header: 'Amount (NGN)',
      cell: ({ getValue }) => (
        <Text variant="caption" color="primary" weight="medium">
          {formatNGN(getValue<number>())}
        </Text>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const v = getValue<string>()
        const variant =
          v === 'completed' ? 'success' :
          v === 'pending'   ? 'warning' : 'danger'
        return <Badge variant={variant} label={v} />
      },
    },
    {
      accessorKey: 'time',
      header: 'Time',
      cell: ({ getValue }) => (
        <Text variant="caption" color="muted">{formatDateTime(getValue<string>())}</Text>
      ),
    },
  ], [])

  return (
    <DataTable
      data={data?.data ?? []}
      columns={columns}
      loading={isLoading}
      total={data?.total}
      emptyTitle="No transactions"
      emptyMessage="This user has no transactions yet"
    />
  )
}
