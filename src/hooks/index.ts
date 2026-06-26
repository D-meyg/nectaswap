// UI hooks
export { useModal }     from './ui/useModal'
export { useDebounce }  from './ui/useDebounce'
export { useClipboard } from './ui/useClipboard'
export { useAuth }      from './ui/useAuth'

// Query hooks
export { useDashboardStats, useDashboardAlerts as useLiveAlerts, useSystemHealth } from './queries/useDashboard'
export { useUsers, useUser }                                  from './queries/useUsers'
export { useTransactions }                                    from './queries/useTransactions'
export { useKYCQueue }                                        from './queries/useKYC'
export {
  useUserDetail,
  useUserCards,
  useUserActivity,
  useUserNotes,
  useKYCHistory,
} from './queries/useUserDetail'
export { useKYCDetail } from './queries/useKYC'

// Mutation hooks
export { useFreezeAccount, useUnfreezeAccount } from './mutations/useUserMutations'
export { useApproveKYC, useRejectKYC, useRequestResubmission } from './mutations/useKYCMutations'
export { useFreezeCard, useUnfreezeCard, useIssueCard }  from './mutations/useCardMutations'
export { useAddNote, useDeleteNote }                     from './mutations/useNoteMutations'
