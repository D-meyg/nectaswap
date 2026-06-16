export const ENDPOINTS = {
  AUTH: {
    LOGIN:   '/auth/login',
    LOGOUT:  '/auth/logout',
    ME:      '/auth/me',
    REFRESH: '/auth/refresh',
  },
  DASHBOARD: {
    STATS:    '/dashboard/stats',
    ALERTS:   '/dashboard/alerts',
    HEALTH:   '/dashboard/health',
    ACTIVITY: '/dashboard/activity',
  },
  RECENT: {
    CONVERSIONS: '/dashboard/recent-conversions',
    ACTIVITY:    '/dashboard/recent-activity',
  },
  USERS: {
    LIST:     '/users',
    DETAIL:   (id: string) => `/users/${id}`,
    FREEZE:   (id: string) => `/users/${id}/freeze`,
    UNFREEZE: (id: string) => `/users/${id}/unfreeze`,
  },
  TRANSACTIONS: {
    LIST:   '/transactions',
    DETAIL: (id: string) => `/transactions/${id}`,
    EXPORT: '/transactions/export',
  },
  WALLETS: {
    LIST:     '/wallets',
    SNAPSHOT: '/wallets/snapshot',
  },
  KYC: {
    QUEUE:    '/kyc/queue',
    DETAIL:   (id: string) => `/kyc/${id}`,
    APPROVE:  (id: string) => `/kyc/${id}/approve`,
    REJECT:   (id: string) => `/kyc/${id}/reject`,
    RESUBMIT: (id: string) => `/kyc/${id}/resubmit`,
    HISTORY:  (userId: string) => `/kyc/history/${userId}`,
  },
  CARDS: {
    LIST:     (userId: string) => `/users/${userId}/cards`,
    DETAIL:   (cardId: string) => `/cards/${cardId}`,
    FREEZE:   (cardId: string) => `/cards/${cardId}/freeze`,
    UNFREEZE: (cardId: string) => `/cards/${cardId}/unfreeze`,
    ISSUE:    (userId: string) => `/users/${userId}/cards`,
  },
  ACTIVITY: {
    LIST: (userId: string) => `/users/${userId}/activity`,
  },
  NOTES: {
    LIST:   (userId: string) => `/users/${userId}/notes`,
    ADD:    (userId: string) => `/users/${userId}/notes`,
    PIN:    (noteId: string) => `/notes/${noteId}/pin`,
    DELETE: (noteId: string) => `/notes/${noteId}`,
  },
  COMPLIANCE: {
    AML_FLAGS: '/compliance/aml-flags',
    FLAG:      (id: string) => `/compliance/flag/${id}`,
  },
  ANALYTICS: {
    CONVERSIONS: '/analytics/conversions',
    VOLUME:      '/analytics/volume',
    USERS:       '/analytics/users',
  },
} as const
