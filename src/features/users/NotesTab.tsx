import { NoteEditor } from "@/components/notes/NoteEditor";
import { NoteItem } from "@/components/notes/NoteItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useUserNotes } from "@/hooks/queries/useUserDetail";
import { useAddNote, useDeleteNote } from "@/hooks/mutations/useNoteMutations";
import { MessageSquare } from "lucide-react";

interface NotesTabProps {
  userId: string;
}

export function NotesTab({ userId }: NotesTabProps) {
  const { data: notes = [], isLoading } = useUserNotes(userId);
  const addNote = useAddNote(userId);
  const deleteNote = useDeleteNote(userId);

  return (
    <div>
      <NoteEditor
        onAdd={(content) => addNote.mutate(content)}
        loading={addNote.isPending}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No notes yet"
          description="Internal notes about this user will appear here"
        />
      ) : (
        // Pinned first, then by date
        [...notes]
          .sort(
            (a, b) =>
              (b.pinned ? 1 : 0) -
              (a.pinned ? 1 : 0),
          )
          .map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onDelete={(id) => deleteNote.mutate(id)}
            />
          ))
      )}
    </div>
  );
}
