// ── Shared ───────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
  status: number;
}

// ── Auth ─────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
  device_name: string;
  ip_address: string;
  location: string;
  user_agent: string;
}

export interface AcceptInvitePayload {
  token: string;
  password: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "compliance" | "support" | string;
  avatar?: string;
}

// ── Dashboard ────────────────────────────────────────────
export interface DashboardStats {
  volume_24h: number;
  active_users: number;
  pending_transactions: number;
  success_rate: number;
  volume_change: number;
  users_change: number;
}

export interface LiveAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
}

export interface SystemHealth {
  service: string;
  status: string;
  uptime: number;
}

// ── Users ────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  kyc_tier: string;
  status: "active" | "frozen" | "suspended" | string;
  created_at: string;
}

export interface UserDetail extends User {
  phone?: string;
  joined?: string;
  last_ip?: string;
  last_active?: string;
  kyc_level?: string;
  kyc_expiry?: string;
  risk_score?: number;
  kyc_status?: string;
  velocity_check?: "Pass" | "Fail" | string;
  aml_screening?: "Clear" | "Flagged" | string;
  crypto_wallet?: string;
  total_volume?: number;
  success_rate?: number;
  conversions?: number;
}

// ── Transactions ─────────────────────────────────────────
export interface Transaction {
  id: string;
  user: string;
  crypto: string;
  amount_ngn: number;
  status: string;
  time: string;
}

// ── Wallets ──────────────────────────────────────────────
export interface WalletAsset {
  asset: string;
  balance: number;
  usd_value: number;
  threshold: number;
  health: string;
}

// ── KYC ──────────────────────────────────────────────────
export interface KYCSubmission {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  tier: string;
  submitted_at: string;
  documents: number;
  total_docs: number;
  priority: string;
  status: string;
}

export interface KYCDocument {
  id: string;
  type: string;
  status: "approved" | "pending" | "rejected";
  reviewed_by: string;
  reviewed_at: string;
  url?: string;
}

export interface KYCDetail {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  occupation: string;
  tier_requested: string;
  submitted_date: string;
  priority: string;
  id_type: string;
  id_number: string;
  residential_address: string;
  proof_type: string;
  documents: {
    id_document?: string;
    selfie?: string;
    address_proof?: string;
  };
}

export interface KYCHistoryEvent {
  id: string;
  event: string;
  date: string;
  by: string;
  description: string;
}

// ── Cards ────────────────────────────────────────────────
export type CardNetwork = "Mastercard" | "Visa";
export type CardVariant = "Virtual" | "Physical";
export type CardStatus = "active" | "frozen" | "pending" | "cancelled";

export interface Card {
  id: string;
  masked_number: string; // e.g. "**** **** **** 4521"
  network: CardNetwork;
  variant: CardVariant;
  status: CardStatus;
  balance_ngn: number;
  monthly_spend: number;
  monthly_limit: number;
  user_id: string;
}

// ── Activity ─────────────────────────────────────────────
export type ActivityEventType =
  | "transaction"
  | "login"
  | "logout"
  | "kyc"
  | "card"
  | "settings"
  | string;

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  txn_id?: string;
  ip: string;
  device: string;
  created_at: string;
}

// ── Notes ────────────────────────────────────────────────
export interface Note {
  id: string;
  author: string;
  content: string;
  pinned: boolean;
  created_at: string;
}

// ── Dashboard extras ─────────────────────────────────────
export interface RecentConversion {
  id: string;
  user: string;
  crypto: string;
  amount_ngn: number;
  status: string;
  time: string;
}

export interface RecentActivityEntry {
  time: string;
  admin: string;
  action: string;
  target: string;
  status?: string;
}

export interface PriorityAlert {
  id: string;
  message: string;
  type: "danger" | "warning";
}

export interface DashboardSummary {
  stats: DashboardStats;
  priority_alerts: PriorityAlert[];
  liquidity_snapshot: WalletAsset[];
  recent_conversions: RecentConversion[];
  recent_activity: RecentActivityEntry[];
  live_alerts: LiveAlert[];
  kyc_queue: KYCSubmission[];
  system_health: SystemHealth[];
}

// ── Team / Current Admin ──────────────────────────────────
export interface AdminPermission {
  resource: string;
  action: string;
}

export interface AdminRole {
  id: string;
  role_name: string;
}

export interface TeamMeData {
  id: string;
  created_at: string;
  updated_at: string;
  pkid: number;
  admin_id: string;
  username: string | null;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
  last_login: string;
  is_active: boolean;
  is_deleted: boolean;
  is_restricted: boolean;
  invitation_accepted: boolean;
  role_id: string;
  role: AdminRole;
  permissions: AdminPermission[];
}

// ── Analytics Overview ────────────────────────────────────
export interface AnalyticsOverviewKPIs {
  total_volume_ngn: number;
  total_volume_ngn_change: number;
  total_volume_usd: number;
  total_transactions: number;
  total_transactions_change: number;
  active_users: number;
  active_users_change: number;
  active_cards: number;
  active_cards_change: number;
}

export interface VolumeTrend {
  month: string;
  volume_ngn: number;
  volume_usd: number;
  transactions: number;
}

export interface TransactionByCrypto {
  name: string;
  count: number;
  volume_ngn: number;
  coin: string;
}

export interface HourlyActivity {
  hour: string;
  count: number;
  volume_ngn: number;
}

export interface CardStatusDistribution {
  card_type: string;
  status: string;
  count: number;
}

export interface AnalyticsOverviewBottomStats {
  avg_transaction_ngn: number;
  avg_transaction_usd: number;
  new_users: number;
  cards_issued: number;
  success_rate: number;
}

export interface AnalyticsOverview {
  kpis: AnalyticsOverviewKPIs;
  volume_transaction_trends: VolumeTrend[];
  transactions_by_crypto: TransactionByCrypto[];
  hourly_transaction_activity: HourlyActivity[];
  card_status_distribution: CardStatusDistribution[];
  bottom_stats: AnalyticsOverviewBottomStats;
}

// ── Analytics Revenue ─────────────────────────────────────
export interface AnalyticsRevenueKPIs {
  total_volume_ngn: number;
  total_volume_ngn_change: number;
  total_volume_usd: number;
  total_volume_usd_change: number;
  total_transactions: number;
  total_transactions_change: number;
  total_fees_collected: number;
  fees_change: number;
  platform_ngn_balance: number;
  avg_volume_per_day: number;
  success_rate: number;
}

export interface RevenueVolumeOverTime {
  month: string;
  volume_ngn: number;
  volume_usd: number;
  fees: number;
  transaction_count: number;
}

export interface RevenueCoinBreakdown {
  coin: string;
  name: string;
  transaction_count: number;
  volume_ngn: number;
  volume_usd: number;
  fees_ngn: number;
  percentage: number;
}

export interface RevenueCryptoVolume {
  cumulative_volume_ngn: number;
  cumulative_volume_usd: number;
  by_coin: RevenueCoinBreakdown[];
}

export interface RevenueCardStats {
  total_volume: number;
  total_fees: number;
  total_transactions: number;
}

export interface DailyVolume {
  date: string;
  volume_ngn: number;
  transaction_count: number;
}

export interface AnalyticsRevenue {
  kpis: AnalyticsRevenueKPIs;
  volume_over_time: RevenueVolumeOverTime[];
  crypto_volume: RevenueCryptoVolume;
  card_stats: RevenueCardStats;
  daily_volume_last_30: DailyVolume[];
}

// ── Analytics User Growth ─────────────────────────────────
export interface UserGrowthKPIs {
  total_users: number;
  total_users_change: number;
  new_users: number;
  new_users_change: number;
  active_users: number;
  active_users_change: number;
  churn_rate: number;
}

export interface UserGrowthTrend {
  month: string;
  total_users: number;
  new_users: number;
  active_users: number;
}

export interface UsersByRegion {
  region: string;
  count: number;
  percentage: number;
}

export interface KYCLevelDistribution {
  level: string;
  count: number;
  percentage: number;
}

export interface WeeklyUserActivity {
  day: string;
  active: number;
  inactive: number;
}

export interface UserAcquisitionChannel {
  channel: string;
  count: number;
  percentage: number;
  cac: number;
}

export interface CohortRetention {
  cohort: string;
  cohort_size: number;
  month_0: number;
  month_1: number | null;
  month_2: number | null;
  month_3: number | null;
  month_4: number | null;
  [key: string]: string | number | null;
}

export interface UserGrowthBottomStats {
  avg_lifetime_value: number;
  avg_cac: number;
  mobile_users_pct: number;
  retention_30d: number;
}

export interface AnalyticsUserGrowth {
  kpis: UserGrowthKPIs;
  user_growth_trends: UserGrowthTrend[];
  users_by_region: UsersByRegion[];
  kyc_level_distribution: KYCLevelDistribution[];
  weekly_user_activity: WeeklyUserActivity[];
  user_acquisition_channels: UserAcquisitionChannel[];
  cohort_retention: CohortRetention[];
  bottom_stats: UserGrowthBottomStats;
}
