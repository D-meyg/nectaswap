import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { noteService } from '@/services/noteService'
import { QUERY_KEYS }  from '@/lib/constants'

export function useAddNote(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => noteService.add(userId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.USER_NOTES(userId) })
      toast.success('Note added')
    },
    onError: () => toast.error('Failed to add note'),
  })
}

export function useDeleteNote(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (noteId: string) => noteService.delete(noteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.USER_NOTES(userId) })
      toast.success('Note deleted')
    },
    onError: () => toast.error('Failed to delete note'),
  })
}
