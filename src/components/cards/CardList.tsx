import { Card }      from '@/components/ui/Card'
import { Button }    from '@/components/ui/Button'
import { EmptyState }from '@/components/ui/EmptyState'
import { CardItem }  from './CardItem'
import { CreditCard } from 'lucide-react'
import type { Card as CardType } from '@/api/types'

interface CardListProps {
  cards:          CardType[]
  onFreeze?:      (id: string) => void
  onUnfreeze?:    (id: string) => void
  onViewDetails?: (id: string) => void
  onIssueCard?:   () => void
  freezeLoading?: boolean
}

export function CardList({
  cards, onFreeze, onUnfreeze, onViewDetails, onIssueCard, freezeLoading,
}: CardListProps) {
  return (
    <Card>
      <Card.Header
        title={`User Cards (${cards.length})`}
        action={
          <Button size="sm" onClick={onIssueCard}>
            Issue New Card
          </Button>
        }
      />
      <Card.Body padded>
        {cards.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No Cards Issued"
            description="This user doesn't have any Naira cards yet"
            action={
              <Button size="sm" onClick={onIssueCard}>
                Issue First Card
              </Button>
            }
          />
        ) : (
          cards.map(card => (
            <CardItem
              key={card.id}
              card={card}
              onFreeze={onFreeze}
              onUnfreeze={onUnfreeze}
              onViewDetails={onViewDetails}
              freezeLoading={freezeLoading}
            />
          ))
        )}
      </Card.Body>
    </Card>
  )
}
