import { cn } from '@/lib/utils'
import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { Text } from './Text'

// ── Modal Root ────────────────────────────────────────────
type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface ModalProps {
  open:        boolean
  onClose:     () => void
  size?:       ModalSize
  className?:  string
  children:    ReactNode
  closeable?:  boolean   // whether backdrop click closes
}

const sizeMap: Record<ModalSize, string> = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  full: 'max-w-5xl',
}

function ModalRoot({ open, onClose, size = 'md', className, children, closeable = true }: ModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Escape key closes modal
  useEffect(() => {
    if (!open || !closeable) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, closeable, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 'var(--z-modal)' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[0.125rem]"
        onClick={closeable ? onClose : undefined}
      />
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'card relative w-full flex flex-col max-h-[90vh]',
          sizeMap[size],
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

// ── Modal.Header ──────────────────────────────────────────
interface ModalHeaderProps {
  title:      string
  subtitle?:  string
  onClose?:   () => void
  className?: string
}

function ModalHeader({ title, subtitle, onClose, className }: ModalHeaderProps) {
  return (
    <div className={cn(
      'flex items-start justify-between gap-4 px-5 py-4',
      'border-b border-(--color-border) shrink-0',
      className
    )}>
      <div>
        <Text variant="subtitle" color="primary">{title}</Text>
        {subtitle && <Text variant="micro" color="tertiary" className="mt-0.5">{subtitle}</Text>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-(--radius-sm) text-(--color-text-tertiary) hover:bg-(--color-bg-subtle) hover:text-(--color-text-primary) transition-colors"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

// ── Modal.Body ────────────────────────────────────────────
interface ModalBodyProps {
  className?: string
  children:   ReactNode
  scrollable?:boolean
}

function ModalBody({ className, children, scrollable = true }: ModalBodyProps) {
  return (
    <div className={cn('px-5 py-4 flex-1', scrollable && 'overflow-y-auto', className)}>
      {children}
    </div>
  )
}

// ── Modal.Footer ──────────────────────────────────────────
interface ModalFooterProps {
  className?: string
  children:   ReactNode
}

function ModalFooter({ className, children }: ModalFooterProps) {
  return (
    <div className={cn(
      'flex items-center justify-end gap-2 px-5 py-4',
      'border-t border-(--color-border) bg-(--color-bg-subtle) shrink-0',
      className
    )}>
      {children}
    </div>
  )
}

// ── Composed export ───────────────────────────────────────
export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Body:   ModalBody,
  Footer: ModalFooter,
})
