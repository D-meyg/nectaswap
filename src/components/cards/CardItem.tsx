import { memo } from 'react'
import { CreditCard } from 'lucide-react'
import { cn }          from '@/lib/utils'
import { Text }        from '@/components/ui/Text'
import { Badge }       from '@/components/ui/Badge'
import { Button }      from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatNGN }   from '@/lib/utils'
import type { Card, CardStatus } from '@/api/types'

interface CardItemProps {
  card:         Card
  onFreeze?:    (id: string) => void
  onUnfreeze?:  (id: string) => void
  onViewDetails?:(id: string) => void
  freezeLoading?: boolean
}

const statusVariant: Record<CardStatus, 'success' | 'info' | 'warning' | 'neutral'> = {
  active:    'success',
  frozen:    'info',
  pending:   'warning',
  cancelled: 'neutral',
}

const networkColor: Record<string, string> = {
  Mastercard: 'bg-[var(--color-danger-subtle)]   text-[var(--color-danger)]',
  Visa:       'bg-[var(--color-brand)]/10          text-[var(--color-brand)]',
}

export const CardItem = memo(function CardItem({
  card, onFreeze, onUnfreeze, onViewDetails, freezeLoading,
}: CardItemProps) {
  return (
    <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 mb-3 last:mb-0">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)]',
            networkColor[card.network] ?? 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]'
          )}>
            <CreditCard size={15} />
          </div>
          <div>
            <Text variant="caption" color="primary" weight="medium">{card.masked_number}</Text>
            <Text variant="micro" color="muted">{card.network} · {card.variant}</Text>
          </div>
        </div>
        <Badge variant={statusVariant[card.status]} label={card.status} />
      </div>

      {/* Balance + spend */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <Text variant="micro" color="muted" uppercase>Balance (NGN)</Text>
          <Text variant="subtitle" color="primary" weight="semibold">
            {formatNGN(card.balance_ngn)}
          </Text>
        </div>
        <div>
          <Text variant="micro" color="muted" uppercase>Monthly Spend</Text>
          <Text variant="subtitle" color="primary" weight="semibold">
            {formatNGN(card.monthly_spend)}
          </Text>
          <Text variant="micro" color="muted">of {formatNGN(card.monthly_limit)}</Text>
        </div>
      </div>

      {/* Spend progress */}
      <ProgressBar
        value={card.monthly_spend}
        max={card.monthly_limit}
        className="mb-3"
      />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 justify-center"
          onClick={() => onViewDetails?.(card.id)}
        >
          View Details
        </Button>
        {card.status === 'frozen' ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onUnfreeze?.(card.id)}
            loading={freezeLoading}
          >
            Unfreeze
          </Button>
        ) : card.status === 'active' ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onFreeze?.(card.id)}
            loading={freezeLoading}
          >
            Freeze
          </Button>
        ) : null}
      </div>
    </div>
  )
})
