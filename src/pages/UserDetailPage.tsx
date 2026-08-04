import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  User,
  ShieldCheck,
  CreditCard,
  ArrowLeftRight,
  Activity,
  MessageSquare,
  ClipboardList,
  Users,
} from "lucide-react";

import { usePageTitle } from "@/layouts/AppLayout";
import { BackLink } from "@/components/common/BackLink";
import { UserHeader } from "@/components/common/UserHeader";
import { QuickActionsPanel } from "@/components/common/QuickActionsPanel";
import { ReferralActionsPanel } from "@/components/common/ReferralActionsPanel";
import { RiskIndicatorsPanel } from "@/components/common/RiskIndicatorsPanel";
import { TabsRoot, TabsList, Tab, TabPanel } from "@/components/ui/Tabs";
import { Stack } from "@/components/ui/Stack";
import { Box } from "@/components/ui/Box";
import { Skeleton } from "@/components/ui/Skeleton";

import { OverviewTab } from "@/features/users/OverviewTab";
import { KYCTab } from "@/features/users/KYCTab";
import { CardsTab } from "@/features/users/CardsTab";
import { TransactionsTab } from "@/features/users/TransactionsTab";
import { ReferralsTab } from "@/features/users/ReferralsTab";
import { ActivityTab } from "@/features/users/ActivityTab";
import { NotesTab } from "@/features/users/NotesTab";
import { AuditLogTab } from "@/features/users/AuditLogTab";

import { useUserDetail, useUserCards } from "@/hooks/queries/useUserDetail";
import {
  useFreezeAccount,
  useUnfreezeAccount,
  useFreezeAllCards,
} from "@/hooks/mutations/useUserMutations";
import { DUMMY_USER_DETAIL } from "@/lib/dummyData";
import { useModal } from "@/hooks/ui/useModal";
import {
  SendMessageModal,
  SEND_MESSAGE_MODAL_ID,
} from "@/components/modals/SendMessageModal";
import type { UserDetail } from "@/api/types";

type TabValue =
  | "overview"
  | "kyc"
  | "cards"
  | "transactions"
  | "referrals"
  | "activity"
  | "notes"
  | "audit";

const userDetailTabClassName =
  "h-[2.375rem] gap-1.5 px-1 text-xs [&_p]:text-xs [&_p]:leading-4";

export default function UserDetailPage() {
  const { id = "" } = useParams<{ id: string }>();

  usePageTitle(
    "User Detail",
    "Complete user profile, KYC status, cards, and transaction history",
  );

  const [activeTab, setActiveTab] = useState<TabValue>("overview");

  const { data: apiUser, isLoading } = useUserDetail(id);
  const rawApiUser = apiUser as unknown as Record<string, unknown> | undefined;
  const userId = rawApiUser?.user_id ? String(rawApiUser.user_id) : id;
  const { data: apiCards = [] } = useUserCards(userId);

  const user = (apiUser ?? DUMMY_USER_DETAIL) as UserDetail;
  const cards = Array.isArray(apiCards) ? apiCards : [];

  const navigate = useNavigate();
  const freezeCardsMutation = useFreezeAllCards();
  const hasCard = Number((apiUser as Record<string, unknown> | undefined)?.total_cards ?? 0) > 0;
  const freezeMutation = useFreezeAccount();
  const unfreezeMutation = useUnfreezeAccount();

  // The API exposes restriction state as `is_restricted`; fall back to the
  // legacy `status` field for dummy data.
  const isRestricted =
    rawApiUser?.is_restricted === true ||
    (user as { status?: string })?.status === "frozen";

  const handleFreezeToggle = useCallback(() => {
    if (!userId) return;

    if (isRestricted) {
      unfreezeMutation.mutate(userId);
    } else {
      freezeMutation.mutate(userId);
    }
  }, [isRestricted, userId, freezeMutation, unfreezeMutation]);

  const sendMessageModal = useModal(SEND_MESSAGE_MODAL_ID);
  const recipientName =
    [rawApiUser?.first_name, rawApiUser?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    String(rawApiUser?.username ?? "") ||
    "this user";

  const freezeLoading = freezeMutation.isPending || unfreezeMutation.isPending;

  return (
    <Box className="min-h-full w-full px-4 py-4 lg:px-5 xl:px-6">
      <BackLink label="Back to Users" to="/users" className="mb-3 text-[0.6875rem]" />

      {isLoading && !apiUser ? (
        <Stack gap={3} className="mb-8">
          <Skeleton className="h-[2.125rem] w-64 rounded-(--radius-md)" />
          <Skeleton className="h-5 w-80 rounded-(--radius-sm)" />
        </Stack>
      ) : (
        <UserHeader
          user={{ ...(rawApiUser as object), ...user }}
          onFreeze={handleFreezeToggle}
          freezeLoading={freezeLoading}
          onSendMessage={() =>
            sendMessageModal.open({ userId, userName: recipientName })
          }
        />
      )}

      <SendMessageModal />

      <TabsRoot
        value={activeTab}
        onChange={(value) => setActiveTab(value as TabValue)}
      >
        <TabsList className="min-h-[2.375rem] gap-5">
          <Tab
            value="overview"
            icon={<User size={14} />}
            className={userDetailTabClassName}
          >
            Overview
          </Tab>
          <Tab
            value="kyc"
            icon={<ShieldCheck size={14} />}
            className={userDetailTabClassName}
          >
            KYC
          </Tab>
          <Tab
            value="cards"
            icon={<CreditCard size={14} />}
            count={cards.length}
            className={userDetailTabClassName}
          >
            Cards
          </Tab>
          <Tab
            value="transactions"
            icon={<ArrowLeftRight size={14} />}
            className={userDetailTabClassName}
          >
            Transactions
          </Tab>
          <Tab
            value="referrals"
            icon={<Users size={14} />}
            className={userDetailTabClassName}
          >
            Referrals
          </Tab>
          <Tab
            value="activity"
            icon={<Activity size={14} />}
            className={userDetailTabClassName}
          >
            Activity
          </Tab>
          <Tab
            value="notes"
            icon={<MessageSquare size={14} />}
            className={userDetailTabClassName}
          >
            Notes
          </Tab>
          <Tab
            value="audit"
            icon={<ClipboardList size={14} />}
            className={userDetailTabClassName}
          >
            Audit Log
          </Tab>
        </TabsList>

        <Box className="mt-4 grid w-full grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
          <Box className="min-w-0">
            <TabPanel value="overview" className="pt-0">
              <OverviewTab user={user} loading={isLoading && !apiUser} />
            </TabPanel>

            <TabPanel value="kyc" className="pt-0">
              <KYCTab userId={userId} />
            </TabPanel>

            <TabPanel value="cards" className="pt-0">
              <CardsTab userId={userId} />
            </TabPanel>

            <TabPanel value="transactions" className="pt-0">
              <TransactionsTab userId={userId} />
            </TabPanel>

            <TabPanel value="referrals" className="pt-0">
              <ReferralsTab userId={userId} />
            </TabPanel>

            <TabPanel value="activity" className="pt-0">
              <ActivityTab userId={userId} />
            </TabPanel>

            <TabPanel value="notes" className="pt-0">
              <NotesTab userId={userId} />
            </TabPanel>

            <TabPanel value="audit" className="pt-0">
              <AuditLogTab userId={userId} />
            </TabPanel>
          </Box>

          <Stack gap={4} className="hidden lg:flex">
            <QuickActionsPanel
              disabled={!hasCard}
              onAdjustLimits={() => navigate("/cards/limits")}
              onFreezeCards={() => freezeCardsMutation.mutate(userId)}
            />
            <RiskIndicatorsPanel
              velocityCheck={user?.velocity_check}
              amlScreening={user?.aml_screening}
            />
            {activeTab === "referrals" && <ReferralActionsPanel />}
          </Stack>
        </Box>
      </TabsRoot>
    </Box>
  );
}
