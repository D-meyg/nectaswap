import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-border)]', className)}
    />
  )
}

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-[var(--color-border)] px-4 py-3">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className={cn('h-4', j === 0 ? 'w-32' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="card p-4">
      <Skeleton className="mb-2 h-3 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  )
}
