import { cn } from '@/lib/utils'
import { useClipboard } from '@/hooks/ui/useClipboard'
import { Copy, Check } from 'lucide-react'
import { Text } from './Text'

interface CodeBadgeProps {
  code:       string
  className?: string
}

/**
 * CodeBadge — styled code display with copy-to-clipboard.
 * Matches the referral code box "CHINEDU2024" in image 7.
 *
 * Usage:
 *   <CodeBadge code="CHINEDU2024" />
 *   <CodeBadge code="0x742d35Cc..." /> — wallet address
 */
export function CodeBadge({ code, className }: CodeBadgeProps) {
  const { copy, copied } = useClipboard()

  return (
    <div className={cn(
      'inline-flex items-center gap-2',
      'rounded-[var(--radius-sm)] border border-[var(--color-brand)]/30',
      'bg-[rgba(78,43,204,0.06)] px-3 py-2',
      className
    )}>
      <Text
        variant="label"
        color="brand"
        weight="semibold"
        className="font-mono tracking-wider"
        as="span"
      >
        {code}
      </Text>
      <button
        onClick={() => copy(code)}
        className="text-[var(--color-brand)] hover:opacity-70 transition-opacity"
        aria-label="Copy code"
      >
        {copied
          ? <Check size={12} />
          : <Copy size={12} />
        }
      </button>
    </div>
  )
}
