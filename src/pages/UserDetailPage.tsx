import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
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
} from "@/hooks/mutations/useUserMutations";
import { DUMMY_USER_DETAIL, DUMMY_CARDS } from "@/lib/dummyData";

type TabValue =
  | "overview"
  | "kyc"
  | "cards"
  | "transactions"
  | "referrals"
  | "activity"
  | "notes"
  | "audit";

export default function UserDetailPage() {
  const { id = "" } = useParams<{ id: string }>();

  usePageTitle(
    "User Detail",
    "Complete user profile, KYC status, cards, and transaction history",
  );

  const [activeTab, setActiveTab] = useState<TabValue>("overview");

  const { data: apiUser, isLoading } = useUserDetail(id);
  const { data: apiCards = [] } = useUserCards(id);

  const user = apiUser ?? DUMMY_USER_DETAIL;
  const cards = apiCards.length ? apiCards : DUMMY_CARDS;

  const freezeMutation = useFreezeAccount();
  const unfreezeMutation = useUnfreezeAccount();

  const handleFreezeToggle = useCallback(() => {
    if (!user) return;

    if (user.status === "frozen") {
      unfreezeMutation.mutate(id);
    } else {
      freezeMutation.mutate(id);
    }
  }, [user, id, freezeMutation, unfreezeMutation]);

  const freezeLoading = freezeMutation.isPending || unfreezeMutation.isPending;

  return (
    <Box p={6} className="mx-auto w-full max-w-[1600px] lg:p-8">
      <BackLink label="Back to Users" to="/users" className="mb-4" />

      {isLoading && !apiUser ? (
        <Stack gap={3} className="mb-8">
          <Skeleton className="h-[34px] w-64 rounded-(--radius-md)" />
          <Skeleton className="h-5 w-80 rounded-(--radius-sm)" />
        </Stack>
      ) : (
        <UserHeader
          user={user}
          onFreeze={handleFreezeToggle}
          freezeLoading={freezeLoading}
        />
      )}

      <TabsRoot
        value={activeTab}
        onChange={(value) => setActiveTab(value as TabValue)}
      >
        <TabsList>
          <Tab value="overview" icon={<User size={16} />}>
            Overview
          </Tab>
          <Tab value="kyc" icon={<ShieldCheck size={16} />}>
            KYC
          </Tab>
          <Tab
            value="cards"
            icon={<CreditCard size={16} />}
            count={cards.length}
          >
            Cards
          </Tab>
          <Tab value="transactions" icon={<ArrowLeftRight size={16} />}>
            Transactions
          </Tab>
          <Tab value="referrals" icon={<Users size={16} />}>
            Referrals
          </Tab>
          <Tab value="activity" icon={<Activity size={16} />}>
            Activity
          </Tab>
          <Tab value="notes" icon={<MessageSquare size={16} />}>
            Notes
          </Tab>
          <Tab value="audit" icon={<ClipboardList size={16} />}>
            Audit Log
          </Tab>
        </TabsList>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] items-start gap-6">
          <div className="min-w-0">
            <TabPanel value="overview" className="pt-0">
              <OverviewTab user={user} loading={isLoading && !apiUser} />
            </TabPanel>

            <TabPanel value="kyc" className="pt-0">
              <KYCTab userId={id} />
            </TabPanel>

            <TabPanel value="cards" className="pt-0">
              <CardsTab userId={id} />
            </TabPanel>

            <TabPanel value="transactions" className="pt-0">
              <TransactionsTab userId={id} />
            </TabPanel>

            <TabPanel value="referrals" className="pt-0">
              <ReferralsTab userId={id} />
            </TabPanel>

            <TabPanel value="activity" className="pt-0">
              <ActivityTab userId={id} />
            </TabPanel>

            <TabPanel value="notes" className="pt-0">
              <NotesTab userId={id} />
            </TabPanel>

            <TabPanel value="audit" className="pt-0">
              <AuditLogTab />
            </TabPanel>
          </div>

          <Stack gap={5} className="hidden lg:flex">
            <QuickActionsPanel />
            <RiskIndicatorsPanel
              velocityCheck={user?.velocity_check}
              amlScreening={user?.aml_screening}
            />
          </Stack>
        </div>
      </TabsRoot>
    </Box>
  );
}
