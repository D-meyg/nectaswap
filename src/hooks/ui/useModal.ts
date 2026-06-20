import { useUIStore } from '@/store/uiStore'

/**
 * Convenience hook for managing a specific named modal.
 * Usage: const { open, close, isOpen, props } = useModal('kyc-review')
 */
export function useModal(id: string) {
  const activeModal = useUIStore((s) => s.activeModal)
  const openModal   = useUIStore((s) => s.openModal)
  const closeModal  = useUIStore((s) => s.closeModal)

  return {
    isOpen: activeModal?.id === id,
    props:  activeModal?.id === id ? activeModal.props : undefined,
    open:   (props?: Record<string, unknown>) => openModal(id, props),
    close:  closeModal,
  }
}
