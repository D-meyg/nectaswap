import client from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type { Note } from '@/api/types'

export const noteService = {
  list:   (userId: string) =>
    client.get<Note[]>(ENDPOINTS.NOTES.LIST(userId)).then(r => r.data),

  add:    (userId: string, content: string) =>
    client.post<Note>(ENDPOINTS.NOTES.ADD(userId), { content }).then(r => r.data),

  pin:    (noteId: string) =>
    client.post(ENDPOINTS.NOTES.PIN(noteId)).then(r => r.data),

  delete: (noteId: string) =>
    client.delete(ENDPOINTS.NOTES.DELETE(noteId)).then(r => r.data),
}
