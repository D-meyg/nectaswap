import { useState } from 'react'
import { Button } from '@/components/ui/Button'


interface NoteEditorProps {
  onAdd:    (content: string) => void
  loading?: boolean
}

export function NoteEditor({ onAdd, loading }: NoteEditorProps) {
  const [content, setContent] = useState('')

  const handleAdd = () => {
    const trimmed = content.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setContent('')
  }

  return (
    <div className="mb-5">
      <div className="rounded-(--radius-md) border border-(--color-border) bg-white overflow-hidden">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Add internal note about this user…"
          rows={3}
          className={[
            'w-full px-3 py-2.5 text-[13px] text-(--color-text-primary)',
            'placeholder:text-(--color-text-muted) resize-none outline-none',
            'leading-[19.5px]',
          ].join(' ')}
        />
      </div>
      <div className="mt-2">
        <Button
          size="sm"
          onClick={handleAdd}
          loading={loading}
          disabled={!content.trim()}
        >
          Add Note
        </Button>
      </div>
    </div>
  )
}
