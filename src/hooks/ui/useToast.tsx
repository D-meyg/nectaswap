import { toast } from 'sonner'

export function useToast() {
  return {
    success: (title: string, description?: string) =>
      toast.success(title, { description }),

    error: (title: string, description?: string) =>
      toast.error(title, { description }),

    info: (title: string, description?: string) =>
      toast(title, { description }),

    warning: (title: string, description?: string) =>
      toast.warning(title, { description }),

    loading: (message: string) =>
      toast.loading(message),

    dismiss: (id?: string | number) =>
      toast.dismiss(id),

    promise: <T,>(
      fn: Promise<T>,
      msgs: { loading: string; success: string; error: string }
    ) => toast.promise(fn, msgs),

    show: ({ type, title, message }: { type: 'success' | 'error' | 'info' | 'warning'; title: string; message: string }) => {
      if (type === 'success') return toast.success(title, { description: message });
      if (type === 'error') return toast.error(title, { description: message });
      if (type === 'warning') return toast.warning(title, { description: message });
      return toast(title, { description: message });
    }
  }
}