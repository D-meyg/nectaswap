// UI hooks
export { useModal }     from './ui/useModal'
export { useDebounce }  from './ui/useDebounce'
export { useClipboard } from './ui/useClipboard'
export { useAuth }      from './ui/useAuth'

// Query hooks
export { useDashboardStats, useLiveAlerts, useSystemHealth } from './queries/useDashboard'
export { useUsers, useUser }                                  from './queries/useUsers'
export { useTransactions }                                    from './queries/useTransactions'
export { useKYCQueue }                                        from './queries/useKYC'
export {
  useUserDetail,
  useUserCards,
  useUserActivity,
  useUserNotes,
  useKYCHistory,
  useKYCDetail,
} from './queries/useUserDetail'

// Mutation hooks
export { useFreezeAccount, useUnfreezeAccount } from './mutations/useUserMutations'
export { useApproveKYC, useRejectKYC, useRequestResubmission } from './mutations/useKYCMutations'
export { useFreezeCard, useUnfreezeCard, useIssueCard }  from './mutations/useCardMutations'
export { useAddNote, useDeleteNote }                     from './mutations/useNoteMutations'
