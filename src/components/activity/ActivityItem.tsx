import { memo } from 'react'
import { ArrowLeftRight, LogIn, LogOut, ShieldCheck, CreditCard, Settings } from 'lucide-react'
import { cn }          from '@/lib/utils'
import { Text }        from '@/components/ui/Text'
import { formatDateTime } from '@/lib/utils'
import type { ActivityEvent, ActivityEventType } from '@/api/types'

const iconMap: Record<ActivityEventType, React.ElementType> = {
  transaction: ArrowLeftRight,
  login:       LogIn,
  logout:      LogOut,
  kyc:         ShieldCheck,
  card:        CreditCard,
  settings:    Settings,
}

const iconColor: Record<ActivityEventType, string> = {
  transaction: 'bg-[var(--color-brand)]/10 text-[var(--color-brand)]',
  login:       'bg-[var(--color-success-subtle)] text-[var(--color-success-dark)]',
  logout:      'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]',
  kyc:         'bg-[var(--color-warning-subtle)] text-[var(--color-warning-dark)]',
  card:        'bg-[var(--color-danger-subtle)] text-[var(--color-danger-dark)]',
  settings:    'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)]',
}

interface ActivityItemProps {
  event:      ActivityEvent
  isLast?:    boolean
}

export const ActivityItem = memo(function ActivityItem({ event, isLast }: ActivityItemProps) {
  const Icon = iconMap[event.type]

  return (
    <div className={cn(
      'flex gap-3 p-4',
      !isLast && 'border-b border-[var(--color-border)]'
    )}>
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full mt-0.5',
        iconColor[event.type]
      )}>
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Text variant="caption" color="primary" weight="medium">{event.title}</Text>
          <Text variant="micro" color="muted" className="shrink-0">
            {formatDateTime(event.created_at)}
          </Text>
        </div>
        <Text variant="micro" color="secondary" className="mt-0.5">{event.description}</Text>
        {event.txn_id && (
          <Text variant="micro" color="muted" className="mt-0.5 font-mono">{event.txn_id}</Text>
        )}
        <div className="flex items-center gap-2 mt-1">
          <Text variant="micro" color="muted">{event.ip}</Text>
          <span className="text-[var(--color-border)]">•</span>
          <Text variant="micro" color="muted">{event.device}</Text>
        </div>
      </div>
    </div>
  )
})
