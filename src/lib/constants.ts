export const APP_NAME = 'NectaSwap Admin'
export const API_BASE_URL = '/api'

export const QUERY_KEYS = {
  DASHBOARD:     ['dashboard'],
  USERS:         ['users'],
  USER:          (id: string) => ['users', id],
  USER_CARDS:    (id: string) => ['users', id, 'cards'],
  USER_ACTIVITY: (id: string) => ['users', id, 'activity'],
  USER_NOTES:    (id: string) => ['users', id, 'notes'],
  TRANSACTIONS:  ['transactions'],
  TRANSACTION:   (id: string) => ['transactions', id],
  WALLETS:       ['wallets'],
  KYC_QUEUE:     ['kyc-queue'],
  KYC_DETAIL:    (id: string) => ['kyc', id],
  KYC_HISTORY:   (userId: string) => ['kyc-history', userId],
  ALERTS:        ['alerts'],
  SYSTEM_HEALTH: ['system-health'],
  ANALYTICS:     ['analytics'],
} as const

export const TRANSACTION_STATUS = {
  COMPLETED: 'completed',
  PENDING:   'pending',
  FAILED:    'failed',
} as const

export const KYC_TIERS = {
  TIER_1: 'Tier 1',
  TIER_2: 'Tier 2',
  TIER_3: 'Tier 3',
} as const

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN:       'admin',
  COMPLIANCE:  'compliance',
  SUPPORT:     'support',
} as const

export const PAGE_SIZE = 20
