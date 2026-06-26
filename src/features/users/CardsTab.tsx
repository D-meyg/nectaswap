import { CardList }      from '@/components/cards/CardList'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { useUserCards }  from '@/hooks/queries/useUserDetail'
import { useFreezeCard, useUnfreezeCard } from '@/hooks/mutations/useCardMutations'

interface CardsTabProps { userId: string }

export function CardsTab({ userId }: CardsTabProps) {
  const { data: cards = [], isLoading } = useUserCards(userId)
  const freeze   = useFreezeCard(userId)
  const unfreeze = useUnfreezeCard(userId)

  if (isLoading) return <TableSkeleton rows={4} cols={3} />

  return (
    <CardList
      cards={cards}
      onFreeze={id  => freeze.mutate(id)}
      onUnfreeze={id => unfreeze.mutate(id)}
      freezeLoading={freeze.isPending || unfreeze.isPending}
      onIssueCard={() => {/* open IssueCardModal */}}
    />
  )
}
