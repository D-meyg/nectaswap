import { client } from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const noteService = {
  getUserNotes: async (userId: string) => {
    const { data } = await client.get(ENDPOINTS.USERS.NOTES(userId));
    return data;
  },

  createUserNote: async (
    userId: string,
    payload: { note: string; is_pinned: boolean },
  ) => {
    const { data } = await client.post(ENDPOINTS.USERS.NOTES(userId), payload);
    return data;
  },

  deleteUserNote: async (userId: string, noteId: string) => {
    const { data } = await client.delete(
      `${ENDPOINTS.USERS.NOTES(userId)}/${noteId}`,
    );
    return data;
  },
};
