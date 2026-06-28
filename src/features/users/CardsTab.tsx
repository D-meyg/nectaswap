import { useNavigate } from "react-router-dom";
import { CardList } from "@/components/cards/CardList";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { useUserCards } from "@/hooks/queries/useUserDetail";
import { useFreezeCard, useUnfreezeCard } from "@/hooks/mutations/useCardMutations";
import type { Card as CardType, CardStatus, CardVariant, CardNetwork } from "@/api/types";

interface CardsTabProps { userId: string }

function normalizeApiCard(item: unknown): CardType {
  const card = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
  const other = card.other_data && typeof card.other_data === "object"
    ? (card.other_data as Record<string, unknown>)
    : {};

  const rawStatus = String(card.status ?? other.status ?? "active").toLowerCase();
  const statusMap: Record<string, CardStatus> = {
    active: "active", frozen: "frozen", pending: "pending", cancelled: "cancelled",
  };
  const status: CardStatus = statusMap[rawStatus] ?? "active";

  const rawType = String(other.type ?? card.card_type ?? "VIRTUAL").toUpperCase();
  const variant: CardVariant = rawType === "PHYSICAL" ? "Physical" : "Virtual";

  return {
    id: String(card.card_id ?? card.id ?? ""),
    masked_number: String(card.masked_pan ?? card.masked_number ?? ""),
    network: String(card.issuer ?? "Mastercard") as CardNetwork,
    variant,
    status,
    balance_ngn: Number(other.balance ?? card.balance ?? 0),
    monthly_spend: Number(card.monthly_spend ?? 0),
    monthly_limit: Number(card.monthly_limit ?? 0),
    user_id: String(card.user_id ?? ""),
  };
}

export function CardsTab({ userId }: CardsTabProps) {
  const navigate = useNavigate();
  const { data: rawCards = [], isLoading } = useUserCards(userId);
  const freeze = useFreezeCard();
  const unfreeze = useUnfreezeCard();

  if (isLoading) return <TableSkeleton rows={4} cols={3} />;

  const cards: CardType[] = Array.isArray(rawCards)
    ? rawCards.map(normalizeApiCard)
    : [];

  return (
    <CardList
      cards={cards}
      onFreeze={id => freeze.mutate(id)}
      onUnfreeze={id => unfreeze.mutate(id)}
      onViewDetails={id => navigate(`/cards/${id}`)}
      freezeLoading={freeze.isPending || unfreeze.isPending}
      onIssueCard={() => {}}
    />
  );
}
