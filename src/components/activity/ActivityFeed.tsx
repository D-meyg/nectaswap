import { Card }        from '@/components/ui/Card'
import { EmptyState }  from '@/components/ui/EmptyState'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { ActivityItem }from './ActivityItem'
import { Activity }    from 'lucide-react'
import type { ActivityEvent } from '@/api/types'

interface ActivityFeedProps {
  events:    ActivityEvent[]
  loading?:  boolean
}

export function ActivityFeed({ events, loading }: ActivityFeedProps) {
  if (loading) return <TableSkeleton rows={5} cols={1} />

  if (events.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No activity yet"
        description="User actions will appear here"
      />
    )
  }

  return (
    <Card>
      <Card.Body>
        {events.map((event, i) => (
          <ActivityItem
            key={event.id}
            event={event}
            isLast={i === events.length - 1}
          />
        ))}
      </Card.Body>
    </Card>
  )
}
