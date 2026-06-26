import { cn } from '@/lib/utils'
import { type LucideIcon, Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?:       LucideIcon
  title:       string
  description?:string
  action?:     React.ReactNode
  className?:  string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-bg-subtle)">
        <Icon className="h-5 w-5 text-(--color-text-muted)" />
      </div>
      <div>
        <p className="text-sm font-medium text-(--color-text-primary)">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs text-(--color-text-tertiary)">{description}</p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
