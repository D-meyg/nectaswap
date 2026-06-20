

import { cn } from '@/lib/utils'

type CryptoSymbol = 'BTC' | 'ETH' | 'USDT' | string

interface CryptoBadgeProps {
  symbol:     CryptoSymbol
  className?: string
  size?:      'sm' | 'md'
}

// Colors matching image 1 exactly
const cryptoConfig: Record<string, { bg: string; color: string }> = {
  BTC:  { bg: 'bg-[#F7931A]/15', color: 'text-[#F7931A]' },
  ETH:  { bg: 'bg-[#627EEA]/15', color: 'text-[#627EEA]' },
  USDT: { bg: 'bg-[#26A17B]/15', color: 'text-[#26A17B]' },
}

/**
 * CryptoBadge — colored crypto symbol pill.
 * Matches the BTC/ETH/USDT indicators in trans1.PNG.
 *
 * Usage:
 *   <CryptoBadge symbol="BTC" />   — orange
 *   <CryptoBadge symbol="ETH" />   — blue
 *   <CryptoBadge symbol="USDT" />  — green
 */
export function CryptoBadge({ symbol, className, size = 'sm' }: CryptoBadgeProps) {
  const config = cryptoConfig[symbol] ?? { bg: 'bg-(--color-bg-subtle)', color: 'text-(--color-text-secondary)' }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-[13px]',
      config.bg,
      config.color,
      className
    )}>
      {/* Colored circle dot */}
      <span className={cn('h-1.5 w-1.5 rounded-full bg-current shrink-0')} />
      {symbol}
    </span>
  )
}

/**
 * CryptoLabel — inline label for detail pages (BTC 0.06 style from trans2.PNG)
 * Shows the pill next to a large amount value.
 */
export function CryptoLabel({ symbol, className }: { symbol: CryptoSymbol; className?: string }) {
  const config = cryptoConfig[symbol] ?? { bg: 'bg-(--color-bg-subtle)', color: 'text-(--color-text-secondary)' }

  return (
    <span className={cn(
      'inline-flex items-center rounded-(--radius-sm) px-2 py-0.5',
      'text-[11px] font-semibold',
      config.bg, config.color,
      className
    )}>
      {symbol}
    </span>
  )
}