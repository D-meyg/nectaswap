import { useMutation, useQueryClient } from "@tanstack/react-query";
import { noteService } from "@/services/noteService";
import { useToast } from "@/hooks/ui/useToast";

export function useCreateUserNote() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: { note: string; is_pinned: boolean };
    }) => noteService.createUserNote(userId, payload),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["users", variables.userId, "notes"],
      });

      toast.show({
        type: "success",
        title: "Note Added",
        message: "The user note has been successfully saved.",
      });
    },

    onError: (error: Error) => {
      toast.show({
        type: "error",
        title: "Failed to Save Note",
        message: error.message,
      });
    },
  });
}

export function useAddNote(userId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (content: string) =>
      noteService.createUserNote(userId, {
        note: content,
        is_pinned: false,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users", userId, "notes"],
      });

      toast.show({
        type: "success",
        title: "Note Added",
        message: "The note has been added successfully.",
      });
    },

    onError: (error: Error) => {
      toast.show({
        type: "error",
        title: "Failed to Add Note",
        message: error.message,
      });
    },
  });
}

export function useCreateNote(userId: string) {
  return useAddNote(userId);
}

export function useDeleteNote(userId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (noteId: string) => noteService.deleteUserNote(userId, noteId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users", userId, "notes"],
      });

      toast.show({
        type: "success",
        title: "Note Deleted",
        message: "The note has been deleted.",
      });
    },

    onError: (error: Error) => {
      toast.show({
        type: "error",
        title: "Failed to Delete Note",
        message:
          error.message ||
          "The delete note endpoint may not be available on the backend yet.",
      });
    },
  });
}
