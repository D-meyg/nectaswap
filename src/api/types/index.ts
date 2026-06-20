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
  device_name?: string;
  ip_address?: string;
  location?: string;
  user_agent?: string;
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
