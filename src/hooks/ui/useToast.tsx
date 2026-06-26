

import { toast } from 'sonner'

/**
 * useToast — central wrapper around sonner.
 * Why: no component should import sonner directly.
 * If we ever swap toast libraries, we change ONE file.
 *
 * Usage:
 *   const toast = useToast()
 *   toast.success('Account frozen')
 *   toast.error('Something went wrong')
 *   toast.info('Processing...')
 *   toast.warning('Balance below threshold')
 *   toast.loading('Uploading document...')
 *   toast.dismiss()        — dismiss all
 *   toast.promise(fn, {
 *     loading: 'Saving...',
 *     success: 'Saved!',
 *     error:   'Failed to save',
 *   })
 */
export function useToast() {
  return {
    success: (message: string, description?: string) =>
      toast.success(message, { description }),

    error: (message: string, description?: string) =>
      toast.error(message, { description }),

    info: (message: string, description?: string) =>
      toast(message, { description }),

    warning: (message: string, description?: string) =>
      toast.warning(message, { description }),

    loading: (message: string) =>
      toast.loading(message),

    dismiss: (id?: string | number) =>
      toast.dismiss(id),

    promise: <T>(
      fn: Promise<T>,
      msgs: { loading: string; success: string; error: string }
    ) => toast.promise(fn, msgs),
  }
}