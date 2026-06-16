import { AlertTriangle } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Text } from '@/components/ui/Text'
import { useModal } from '@/hooks/ui/useModal'

export const CONFIRM_MODAL_ID = 'confirm'

interface ConfirmModalProps {
  title:        string
  description:  string
  confirmLabel?:string
  variant?:     'danger' | 'primary'
  onConfirm:    () => void
  loading?:     boolean
}

export function ConfirmModal({
  title,
  description,
  confirmLabel = 'Confirm',
  variant = 'danger',
  onConfirm,
  loading,
}: ConfirmModalProps) {
  const { isOpen, close } = useModal(CONFIRM_MODAL_ID)

  return (
    <Modal open={isOpen} onClose={close} size="sm">
      <Modal.Header title={title} onClose={close} />
      <Modal.Body>
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-danger-subtle)]">
            <AlertTriangle size={16} className="text-[var(--color-danger)]" />
          </div>
          <Text variant="caption" color="secondary">{description}</Text>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={close}>Cancel</Button>
        <Button variant={variant} size="sm" loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
