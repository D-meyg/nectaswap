import { memo } from 'react'
import { Pin, Trash2 } from 'lucide-react'
import { cn }           from '@/lib/utils'
import { Text }         from '@/components/ui/Text'
import { formatDateTime }from '@/lib/utils'
import type { Note }    from '@/api/types'

interface NoteItemProps {
  note:      Note
  onDelete?: (id: string) => void
}

export const NoteItem = memo(function NoteItem({ note, onDelete }: NoteItemProps) {
  return (
    <div className={cn(
      'rounded-(--radius-md) border p-3 mb-3 last:mb-0',
      note.pinned
        ? 'border-(--color-warning-border) bg-(--color-warning-yellow-bg)'
        : 'border-(--color-border) bg-white'
    )}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Text variant="label" color="primary" weight="medium" className="text-[11px] leading-4">{note.author}</Text>
          {note.pinned && (
            <span className="inline-flex items-center gap-1 rounded-(--radius-sm) bg-(--color-warning) px-1.5 py-0.5">
              <Pin size={9} className="text-white" />
              <Text variant="micro" color="white" as="span" className="text-[9px] leading-3">Pinned</Text>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Text variant="micro" color="muted" className="text-[10px] leading-4">{formatDateTime(note.created_at)}</Text>
          {onDelete && (
            <button
              onClick={() => onDelete(note.id)}
              className="text-(--color-text-muted) hover:text-(--color-danger) transition-colors"
              aria-label="Delete note"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
      <Text variant="caption" color="secondary" className="text-[11px] leading-4">{note.content}</Text>
    </div>
  )
})
