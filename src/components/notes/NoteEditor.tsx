import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface NoteEditorProps {
  onAdd: (content: string) => void;
  loading?: boolean;
}

export function NoteEditor({ onAdd, loading }: NoteEditorProps) {
  const [content, setContent] = useState("");

  const handleAdd = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setContent("");
  };

  return (
    <Card className="mb-4">
      <Card.Header
        title="Add Note"
        className="border-b-0 px-4 pb-2 pt-3 [&_h4]:text-xs [&_h4]:leading-4"
      />
      <Card.Body className="px-4 pb-3 pt-0">
        <div className="overflow-hidden rounded-(--radius-sm) border border-(--color-border) bg-white">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Add internal note about this user..."
            rows={3}
            className="w-full resize-none px-3 py-2.5 font-geom text-[0.6875rem] leading-4 text-(--color-text-primary) outline-none placeholder:text-(--color-text-muted)"
          />
        </div>
        <div className="mt-2">
          <Button
            size="sm"
            onClick={handleAdd}
            loading={loading}
            disabled={!content.trim()}
            className="h-[1.875rem] px-3 text-[0.6875rem]"
          >
            Add Note
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
