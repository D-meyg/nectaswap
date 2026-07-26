import type {
  User,
  UserDetail,
  Transaction,
  KYCSubmission,
  WalletAsset,
  LiveAlert,
  SystemHealth,
  RecentConversion,
  RecentActivityEntry,
  ActivityEvent,
  Note,
  Card as CardType,
} from "@/api/types";

// ── Users ─────────────────────────────────────────────────
export const DUMMY_USERS: User[] = [
  {
    id: "5023",
    name: "Chinedu Okonkwo",
    email: "chinedu.o@email.com",
    kyc_tier: "Tier 2",
    status: "active",
    created_at: "2023-11-01",
  },
  {
    id: "7834",
    name: "Amara Nwosu",
    email: "amara.n@email.com",
    kyc_tier: "Tier 2",
    status: "active",
    created_at: "2023-11-05",
  },
  {
    id: "6612",
    name: "Oluwatobi Adeyemi",
    email: "tobi.a@email.com",
    kyc_tier: "Tier 3",
    status: "active",
    created_at: "2023-10-20",
  },
  {
    id: "4421",
    name: "Blessing Okoro",
    email: "blessing.o@email.com",
    kyc_tier: "Tier 1",
    status: "suspended",
    created_at: "2023-12-01",
  },
  {
    id: "8923",
    name: "Emeka Chibueze",
    email: "emeka.c@email.com",
    kyc_tier: "Tier 2",
    status: "active",
    created_at: "2023-09-15",
  },
  {
    id: "3301",
    name: "Ngozi Mbah",
    email: "ngozi.m@email.com",
    kyc_tier: "Tier 2",
    status: "active",
    created_at: "2024-01-10",
  },
  {
    id: "9102",
    name: "Ifeanyi Okafor",
    email: "ifeanyi.o@email.com",
    kyc_tier: "Tier 1",
    status: "frozen",
    created_at: "2023-08-22",
  },
];

// Extended user data matching image columns exactly
export const DUMMY_USERS_EXTENDED = [
  {
    id: "5023",
    name: "Chinedu Okonkwo",
    email: "chinedu.o@email.com",
    kyc_status: "Verified",
    balance: 12500000,
    total_volume: 245,
    risk_score: 23,
    status: "Active",
    kyc_tier: "Tier 2",
  },
  {
    id: "7834",
    name: "Amara Nwosu",
    email: "amara.n@email.com",
    kyc_status: "Verified",
    balance: 9800000,
    total_volume: 189,
    risk_score: 18,
    status: "Active",
    kyc_tier: "Tier 2",
  },
  {
    id: "6612",
    name: "Oluwatobi Adeyemi",
    email: "tobi.a@email.com",
    kyc_status: "Verified",
    balance: 25600000,
    total_volume: 412,
    risk_score: 12,
    status: "Active",
    kyc_tier: "Tier 3",
  },
  {
    id: "4421",
    name: "Blessing Okoro",
    email: "blessing.o@email.com",
    kyc_status: "Pending",
    balance: 4300000,
    total_volume: 87,
    risk_score: 45,
    status: "Limited",
    kyc_tier: "Tier 1",
  },
  {
    id: "8923",
    name: "Emeka Chibueze",
    email: "emeka.c@email.com",
    kyc_status: "Verified",
    balance: 18700000,
    total_volume: 324,
    risk_score: 78,
    status: "Flagged",
    kyc_tier: "Tier 2",
  },
  {
    id: "3301",
    name: "Ngozi Mbah",
    email: "ngozi.m@email.com",
    kyc_status: "Verified",
    balance: 7200000,
    total_volume: 156,
    risk_score: 31,
    status: "Active",
    kyc_tier: "Tier 2",
  },
  {
    id: "9102",
    name: "Ifeanyi Okafor",
    email: "ifeanyi.o@email.com",
    kyc_status: "Expired",
    balance: 11500000,
    total_volume: 203,
    risk_score: 52,
    status: "Frozen",
    kyc_tier: "Tier 1",
  },
];

// ── User Detail ───────────────────────────────────────────
export const DUMMY_USER_DETAIL: UserDetail = {
  id: "5023",
  name: "Chinedu Okonkwo",
  email: "chinedu.o@email.com",
  phone: "+234 801 234 5678",
  kyc_tier: "Tier 2",
  status: "active",
  created_at: "2023-11-01",
  joined: "2023-11-01",
  last_ip: "197.210.76.143",
  last_active: "2h ago",
  kyc_level: "Tier 2",
  kyc_expiry: "2025-11-01",
  kyc_status: "approved",
  risk_score: 23,
  velocity_check: "Pass",
  aml_screening: "Clear",
  crypto_wallet: "0x742d35Cc6634C0532925a3b8D4C9E3d1a4b5F8e2",
  total_volume: 45200000,
  success_rate: 94,
  conversions: 245,
};

// ── Transactions (user-level, matching image 6) ──────────
export const DUMMY_USER_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-8234",
    user: "Chinedu Okonkwo",
    crypto: "BTC",
    amount_ngn: 2500000,
    status: "completed",
    time: "2024-01-29 14:23",
  },
  {
    id: "TXN-8211",
    user: "Chinedu Okonkwo",
    crypto: "ETH",
    amount_ngn: 1800000,
    status: "completed",
    time: "2024-01-29 10:15",
  },
  {
    id: "TXN-8190",
    user: "Chinedu Okonkwo",
    crypto: "USDT",
    amount_ngn: 950000,
    status: "completed",
    time: "2024-01-28 16:42",
  },
  {
    id: "TXN-8156",
    user: "Chinedu Okonkwo",
    crypto: "BTC",
    amount_ngn: 3200000,
    status: "failed",
    time: "2024-01-28 12:30",
  },
];

// ── Notes ─────────────────────────────────────────────────
export const DUMMY_NOTES: Note[] = [
  {
    id: "1",
    author: "James Wilson",
    pinned: true,
    created_at: "2024-01-25 11:20",
    content:
      "User contacted support about failed transaction. Issue resolved - bank timeout.",
  },
  {
    id: "2",
    author: "Sarah Chen",
    pinned: false,
    created_at: "2024-01-20 15:45",
    content: "KYC documents verified. All checks passed.",
  },
];

// ── Cards ─────────────────────────────────────────────────
export const DUMMY_CARDS: CardType[] = [
  {
    id: "c1",
    masked_number: "**** **** **** 4521",
    network: "Mastercard",
    variant: "Virtual",
    status: "active",
    balance_ngn: 125400,
    monthly_spend: 320500,
    monthly_limit: 5000000,
    user_id: "5023",
  },
  {
    id: "c2",
    masked_number: "**** **** **** 7832",
    network: "Visa",
    variant: "Physical",
    status: "active",
    balance_ngn: 450000,
    monthly_spend: 1850200,
    monthly_limit: 10000000,
    user_id: "5023",
  },
  {
    id: "c3",
    masked_number: "**** **** **** 9876",
    network: "Mastercard",
    variant: "Virtual",
    status: "active",
    balance_ngn: 280000,
    monthly_spend: 890000,
    monthly_limit: 5000000,
    user_id: "5023",
  },
  {
    id: "c4",
    masked_number: "**** **** **** 3344",
    network: "Visa",
    variant: "Physical",
    status: "frozen",
    balance_ngn: 95000,
    monthly_spend: 145000,
    monthly_limit: 10000000,
    user_id: "5023",
  },
  {
    id: "c5",
    masked_number: "**** **** **** 5566",
    network: "Mastercard",
    variant: "Virtual",
    status: "pending",
    balance_ngn: 0,
    monthly_spend: 0,
    monthly_limit: 5000000,
    user_id: "5023",
  },
];

// ── Activity ──────────────────────────────────────────────
export const DUMMY_ACTIVITY: ActivityEvent[] = [
  {
    id: "a1",
    type: "transaction",
    title: "Transaction completed",
    description: "TXN-8234 - BTC → NGN",
    txn_id: "TXN-8234",
    ip: "197.210.76.143",
    device: "Chrome on Windows",
    created_at: "2024-01-29 14:23:15",
  },
  {
    id: "a2",
    type: "login",
    title: "Login",
    description: "Successful authentication",
    ip: "197.210.76.143",
    device: "Chrome on Windows",
    created_at: "2024-01-29 14:20:00",
  },
  {
    id: "a3",
    type: "transaction",
    title: "Transaction completed",
    description: "TXN-8211 - ETH → NGN",
    txn_id: "TXN-8211",
    ip: "197.210.76.143",
    device: "Chrome on Windows",
    created_at: "2024-01-29 10:15:42",
  },
  {
    id: "a4",
    type: "logout",
    title: "Logout",
    description: "Session ended",
    ip: "197.210.76.141",
    device: "Safari on iOS",
    created_at: "2024-01-28 18:30:00",
  },
];

// ── KYC Queue ─────────────────────────────────────────────
export const DUMMY_KYC_QUEUE: KYCSubmission[] = [
  {
    id: "k1",
    user_id: "7854",
    user_name: "Adewale Johnson",
    user_email: "adewale.j@email.com",
    tier: "Tier 2",
    submitted_at: "2024-01-29 10:23",
    documents: 3,
    total_docs: 3,
    priority: "normal",
    status: "pending",
  },
  {
    id: "k2",
    user_id: "8923",
    user_name: "Chiamaka Nnomdi",
    user_email: "chiamaka.n@email.com",
    tier: "Tier 3",
    submitted_at: "2024-01-29 09:15",
    documents: 3,
    total_docs: 3,
    priority: "high",
    status: "pending",
  },
  {
    id: "k3",
    user_id: "5621",
    user_name: "Yusuf Ibrahim",
    user_email: "yusuf.i@email.com",
    tier: "Tier 1",
    submitted_at: "2024-01-29 08:42",
    documents: 1,
    total_docs: 3,
    priority: "normal",
    status: "pending",
  },
];

// ── Wallet snapshot ───────────────────────────────────────
export const DUMMY_WALLETS: WalletAsset[] = [
  {
    asset: "BTC",
    balance: 245.32,
    usd_value: 10345200,
    threshold: 85,
    health: "HEALTHY",
  },
  {
    asset: "ETH",
    balance: 3420.18,
    usd_value: 6823400,
    threshold: 92,
    health: "HEALTHY",
  },
  {
    asset: "USDT",
    balance: 8234567,
    usd_value: 8234567,
    threshold: 75,
    health: "HEALTHY",
  },
  {
    asset: "NGN",
    balance: 245800000,
    usd_value: 164533,
    threshold: 48,
    health: "LOW",
  },
];

// ── Live alerts ───────────────────────────────────────────
export const DUMMY_ALERTS: LiveAlert[] = [
  {
    id: "al1",
    type: "warning",
    title: "Low NGN liquidity detected",
    message: "Balance below 50% threshold",
    created_at: "2m ago",
  },
  {
    id: "al2",
    type: "info",
    title: "Large transaction pending",
    message: "₦6.3M conversion awaiting approval",
    created_at: "5m ago",
  },
  {
    id: "al3",
    type: "danger",
    title: "Bank transfer failed",
    message: "GTBank API timeout - User ID: 2047",
    created_at: "12m ago",
  },
  {
    id: "al4",
    type: "danger",
    title: "AML flag triggered",
    message: "User ID: 5023 - velocity breach",
    created_at: "1hr ago",
  },
];

// ── System health ─────────────────────────────────────────
export const DUMMY_HEALTH: SystemHealth[] = [
  { service: "Payment Gateway", status: "operational", uptime: 99.95 },
  { service: "Blockchain Nodes", status: "operational", uptime: 99.92 },
  { service: "Bank APIs", status: "degraded", uptime: 98.5 },
  { service: "KYC Service", status: "operational", uptime: 99.99 },
];

// ── Recent conversions ────────────────────────────────────
export const DUMMY_CONVERSIONS: RecentConversion[] = [
  {
    id: "r1",
    user: "John Doe",
    crypto: "BTC",
    amount_ngn: 500000,
    status: "completed",
    time: "14:23:15",
  },
  {
    id: "r2",
    user: "Jane Smith",
    crypto: "ETH",
    amount_ngn: 200000,
    status: "pending",
    time: "14:20:42",
  },
  {
    id: "r3",
    user: "Alice Johnson",
    crypto: "USDT",
    amount_ngn: 150000,
    status: "completed",
    time: "14:18:33",
  },
  {
    id: "r4",
    user: "Bob Brown",
    crypto: "BTC",
    amount_ngn: 300000,
    status: "failed",
    time: "14:15:38",
  },
  {
    id: "r5",
    user: "Charlie Davis",
    crypto: "ETH",
    amount_ngn: 100000,
    status: "completed",
    time: "14:12:19",
  },
  {
    id: "r6",
    user: "Diana Wilson",
    crypto: "USDT",
    amount_ngn: 75000,
    status: "pending",
    time: "14:09:15",
  },
  {
    id: "r7",
    user: "Ethan Lee",
    crypto: "BTC",
    amount_ngn: 400000,
    status: "completed",
    time: "14:06:42",
  },
  {
    id: "r8",
    user: "Fiona Green",
    crypto: "ETH",
    amount_ngn: 250000,
    status: "pending",
    time: "14:03:53",
  },
];

// ── Recent activity entries ───────────────────────────────
export const DUMMY_RECENT_ACTIVITY: RecentActivityEntry[] = [
  {
    time: "14:23:15",
    admin: "Sarah Chen",
    action: "Approved",
    target: "User #7034",
  },
  {
    time: "14:20:42",
    admin: "James Wilson",
    action: "Manual credit",
    target: "User #4521",
  },
  {
    time: "14:18:33",
    admin: "Maria Garcia",
    action: "Froze account",
    target: "User #5029",
  },
  {
    time: "14:15:28",
    admin: "System",
    action: "Rate update",
    target: "BTC/NGN",
  },
  {
    time: "14:12:19",
    admin: "David Park",
    action: "Recalled dispute",
    target: "Ticket #9821",
  },
];

// ── Referral data (image 7) ───────────────────────────────
export interface ReferredUser {
  name: string;
  email: string;
  join_date: string;
  total_volume: number;
  commission: number;
  status: "Active" | "Inactive";
}

export const DUMMY_REFERRAL = {
  code: "CHINEDU2024",
  total_referrals: 12,
  active_referrals: 10,
  total_earnings: 245000,
  pending_payout: 15000,
};

export const DUMMY_REFERRED_USERS: ReferredUser[] = [
  {
    name: "Adeeze Eze",
    email: "adeeze.e@email.com",
    join_date: "2024-01-16",
    total_volume: 850000,
    commission: 18000,
    status: "Active",
  },
  {
    name: "Emeka Nwankwo",
    email: "emeka.n@email.com",
    join_date: "2024-01-17",
    total_volume: 1200000,
    commission: 22500,
    status: "Active",
  },
  {
    name: "Funmi Adeleke",
    email: "funmi.a@email.com",
    join_date: "2024-01-18",
    total_volume: 680000,
    commission: 15000,
    status: "Active",
  },
];

// ── Extended transaction data matching trans1.PNG exactly ──
export interface TransactionRow {
  id: string; // TX-001234
  time: string; // 14:23:15
  user_name: string;
  user_id: string;
  crypto: "BTC" | "ETH" | "USDT";
  crypto_amount: string; // "0.025 BTC"
  crypto_rate: string; // "₦42,100,000/BTC"
  ngn_amount: string; // "₦1,052,500"
  fee: string; // "Fee: ₦5,262.50"
  status: "completed" | "pending" | "failed";
  date: string; // "2024-01-29"
}

export const DUMMY_TRANSACTIONS: TransactionRow[] = [
  {
    id: "TX-001234",
    time: "14:23:15",
    user_name: "Adewale Johnson",
    user_id: "4521",
    crypto: "BTC",
    crypto_amount: "0.025 BTC",
    crypto_rate: "₦42,100,000/BTC",
    ngn_amount: "₦1,052,500",
    fee: "Fee: ₦5,262.50",
    status: "completed",
    date: "2024-01-29",
  },
  {
    id: "TX-001233",
    time: "14:20:42",
    user_name: "Chiamaka Nnamdi",
    user_id: "3892",
    crypto: "ETH",
    crypto_amount: "0.85 ETH",
    crypto_rate: "₦1,000,000/ETH",
    ngn_amount: "₦850,000",
    fee: "Fee: ₦4,250",
    status: "completed",
    date: "2024-01-29",
  },
  {
    id: "TX-001232",
    time: "14:18:33",
    user_name: "Yusuf Ibrahim",
    user_id: "5621",
    crypto: "USDT",
    crypto_amount: "500 USDT",
    crypto_rate: "₦1,500/USDT",
    ngn_amount: "₦750,000",
    fee: "Fee: ₦3,750",
    status: "pending",
    date: "2024-01-29",
  },
  {
    id: "TX-001231",
    time: "14:15:28",
    user_name: "Funke Olawale",
    user_id: "7234",
    crypto: "BTC",
    crypto_amount: "0.012 BTC",
    crypto_rate: "₦42,100,000/BTC",
    ngn_amount: "₦505,200",
    fee: "Fee: ₦2,526",
    status: "completed",
    date: "2024-01-29",
  },
  {
    id: "TX-001230",
    time: "14:12:19",
    user_name: "Chukwuma Eze",
    user_id: "2934",
    crypto: "ETH",
    crypto_amount: "0.50 ETH",
    crypto_rate: "₦1,000,000/ETH",
    ngn_amount: "₦500,000",
    fee: "Fee: ₦2,500",
    status: "failed",
    date: "2024-01-29",
  },
  {
    id: "TX-001229",
    time: "14:10:05",
    user_name: "Blessing Okafor",
    user_id: "8923",
    crypto: "USDT",
    crypto_amount: "1,200 USDT",
    crypto_rate: "₦1,500/USDT",
    ngn_amount: "₦1,800,000",
    fee: "Fee: ₦9,000",
    status: "completed",
    date: "2024-01-29",
  },
  {
    id: "TX-001228",
    time: "14:05:22",
    user_name: "Ngozi Achebe",
    user_id: "6712",
    crypto: "BTC",
    crypto_amount: "0.005 BTC",
    crypto_rate: "₦42,100,000/BTC",
    ngn_amount: "₦210,500",
    fee: "Fee: ₦1,052.50",
    status: "pending",
    date: "2024-01-29",
  },
  {
    id: "TX-001227",
    time: "18:45:12",
    user_name: "Adewale Johnson",
    user_id: "4521",
    crypto: "ETH",
    crypto_amount: "1.25 ETH",
    crypto_rate: "₦1,000,000/ETH",
    ngn_amount: "₦1,250,000",
    fee: "Fee: ₦6,250",
    status: "completed",
    date: "2024-01-28",
  },
];

// ── Transaction detail data matching trans2-5.PNG ──────────
export interface TransactionDetail {
  id: string;
  title: string;
  status: "completed" | "pending" | "failed";
  user_name: string;
  date: string;
  processing_time: string;
  // Overview
  from_crypto: string;
  from_amount: string;
  from_ngn_equiv: string;
  to_ngn: string;
  exchange_rate: string;
  tx_fee: string;
  // User info
  user_email: string;
  user_id: string;
  ip_address: string;
  // Bank details
  bank_name: string;
  account_number: string;
  account_name: string;
  bank_reference: string;
  settlement_status: string;
  // Technical
  tx_hash: string;
  network: string;
  confirmations: string;
  from_wallet: string;
  // Status sidebar
  blockchain: string;
  settlement: string;
  // Timing
  started: string;
  completed: string;
  total_time: string;
  // Ledger entries
  ledger_entries: Array<{
    account: string;
    operation: "Debit" | "Credit";
    amount: string;
    balance_after: string;
  }>;
  // Timeline
  timeline: Array<{
    event: string;
    description: string;
    timestamp: string;
  }>;
}

export const DUMMY_TX_DETAIL: TransactionDetail = {
  id: "TXN-8234",
  title: "Crypto to Naira Conversion",
  status: "completed",
  user_name: "Chinedu Okonkwo",
  date: "2024-01-29 14:20:15",
  processing_time: "8m 27s",
  from_crypto: "BTC",
  from_amount: "0.06",
  from_ngn_equiv: "₦ 2,526,000",
  to_ngn: "₦ 2,500,000",
  exchange_rate: "₦ 42,100 / BTC",
  tx_fee: "₦ 25,260 (1.0%)",
  user_email: "chinedu.o@email.com",
  user_id: "#5023",
  ip_address: "197.210.76.143",
  bank_name: "GTBank",
  account_number: "*****4521",
  account_name: "Chinedu Okonkwo",
  bank_reference: "GTB-2024-01-29-8234",
  settlement_status: "Settled",
  tx_hash: "0x1a2b3c4d5e6f7g8h9l0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z",
  network: "Bitcoin",
  confirmations: "6 / 6",
  from_wallet: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  blockchain: "Confirmed",
  settlement: "Settled",
  started: "14:20:15",
  completed: "14:28:42",
  total_time: "8m 27s",
  ledger_entries: [
    {
      account: "User Crypto Balance",
      operation: "Debit",
      amount: "0.06 BTC",
      balance_after: "0.14 BTC",
    },
    {
      account: "Platform Hot Wallet",
      operation: "Credit",
      amount: "0.06 BTC",
      balance_after: "245.38 BTC",
    },
    {
      account: "Platform NGN Reserve",
      operation: "Debit",
      amount: "₦ 2,500,000",
      balance_after: "₦ 243,300,000",
    },
    {
      account: "User NGN Balance",
      operation: "Credit",
      amount: "₦ 2,500,000",
      balance_after: "₦ 3,200,000",
    },
    {
      account: "Fee Revenue",
      operation: "Credit",
      amount: "₦ 25,260",
      balance_after: "₦ 2,425,260",
    },
  ],
  timeline: [
    {
      event: "Initiated",
      description: "User initiated conversion",
      timestamp: "2024-01-29 14:20:15",
    },
    {
      event: "Crypto Received",
      description: "BTC received in platform wallet",
      timestamp: "2024-01-29 14:20:45",
    },
    {
      event: "Blockchain Confirmed",
      description: "6 confirmations received",
      timestamp: "2024-01-29 14:25:30",
    },
    {
      event: "Rate Locked",
      description: "Exchange rate: ₦ 42,100 / BTC",
      timestamp: "2024-01-29 14:25:35",
    },
    {
      event: "Fiat Transfer Initiated",
      description: "Bank transfer initiated",
      timestamp: "2024-01-29 14:26:00",
    },
    {
      event: "Transfer Completed",
      description: "Funds credited to user account",
      timestamp: "2024-01-29 14:28:42",
    },
  ],
};

// ── Card Management data matching cd1.PNG ─────────────────
export interface CardRow {
  id: string;
  masked: string; // "**** **** **** 4521"
  expiry: string; // "2027-01-15"
  user_name: string;
  user_email: string;
  type: "Virtual" | "Physical";
  balance: number;
  spend_30d: number;
  status: "Active" | "Frozen" | "Pending" | "Blocked";
}

export const DUMMY_ALL_CARDS: CardRow[] = [
  {
    id: "1",
    masked: "**** **** **** 4521",
    expiry: "2027-01-15",
    user_name: "Chinedu Okonkwo",
    user_email: "chinedu.o@email.com",
    type: "Virtual",
    balance: 125400,
    spend_30d: 320500,
    status: "Active",
  },
  {
    id: "2",
    masked: "**** **** **** 7832",
    expiry: "2027-01-20",
    user_name: "Chinedu Okonkwo",
    user_email: "chinedu.o@email.com",
    type: "Physical",
    balance: 450000,
    spend_30d: 1850200,
    status: "Active",
  },
  {
    id: "3",
    masked: "**** **** **** 2109",
    expiry: "2027-01-18",
    user_name: "Amara Nwosu",
    user_email: "amara.n@email.com",
    type: "Virtual",
    balance: 75800,
    spend_30d: 425300,
    status: "Active",
  },
  {
    id: "4",
    masked: "**** **** **** 8934",
    expiry: "2027-01-22",
    user_name: "Unknown",
    user_email: "N/A",
    type: "Physical",
    balance: 0,
    spend_30d: 0,
    status: "Frozen",
  },
  {
    id: "5",
    masked: "**** **** **** 5612",
    expiry: "2027-01-29",
    user_name: "Unknown",
    user_email: "N/A",
    type: "Virtual",
    balance: 0,
    spend_30d: 0,
    status: "Pending",
  },
  {
    id: "6",
    masked: "**** **** **** 3298",
    expiry: "2027-01-10",
    user_name: "Unknown",
    user_email: "N/A",
    type: "Physical",
    balance: 15200,
    spend_30d: 0,
    status: "Blocked",
  },
  {
    id: "7",
    masked: "**** **** **** 9876",
    expiry: "2027-01-25",
    user_name: "Chinedu Okonkwo",
    user_email: "chinedu.o@email.com",
    type: "Virtual",
    balance: 280000,
    spend_30d: 890000,
    status: "Active",
  },
  {
    id: "8",
    masked: "**** **** **** 3344",
    expiry: "2027-01-12",
    user_name: "Chinedu Okonkwo",
    user_email: "chinedu.o@email.com",
    type: "Physical",
    balance: 95000,
    spend_30d: 145000,
    status: "Frozen",
  },
  {
    id: "9",
    masked: "**** **** **** 5566",
    expiry: "2027-01-30",
    user_name: "Chinedu Okonkwo",
    user_email: "chinedu.o@email.com",
    type: "Virtual",
    balance: 0,
    spend_30d: 0,
    status: "Pending",
  },
];

// Card detail data matching cd2-5.PNG
export interface CardDetail {
  id: string;
  masked: string;
  type: "Virtual" | "Physical";
  status: "Active" | "Frozen" | "Pending" | "Blocked";
  user_name: string;
  network: string;
  variant: string;
  issued: string;
  balance: number;
  cardholder: string;
  daily_spend: number;
  daily_limit: number;
  monthly_spend: number;
  monthly_limit: number;
  expiry: string;
  features: {
    online_payments: boolean;
    atm_withdrawals: boolean;
    international: boolean;
    contactless: boolean;
  };
  transactions: Array<{
    date: string;
    merchant: string;
    merchant_sub: string;
    category: string;
    amount: number;
    status: "Completed" | "Failed";
  }>;
  activity_log: Array<{
    title: string;
    description: string;
    timestamp: string;
    ip: string;
    location: string;
    is_admin?: boolean;
  }>;
}

export const DUMMY_CARD_DETAIL: CardDetail = {
  id: "1",
  masked: "**** **** **** 4521",
  type: "Virtual",
  status: "Active",
  user_name: "Chinedu Okonkwo",
  network: "Mastercard",
  variant: "Debit",
  issued: "2024-01-15",
  balance: 125400,
  cardholder: "CHINEDU OKONKWO",
  daily_spend: 85200,
  daily_limit: 500000,
  monthly_spend: 320500,
  monthly_limit: 5000000,
  expiry: "27-01-15",
  features: {
    online_payments: true,
    atm_withdrawals: false,
    international: true,
    contactless: false,
  },
  transactions: [
    {
      date: "2024-01-29 14:23",
      merchant: "Amazon.com",
      merchant_sub: "Online Purchase",
      category: "Shopping",
      amount: 45200,
      status: "Completed",
    },
    {
      date: "2024-01-29 10:15",
      merchant: "Netflix",
      merchant_sub: "Subscription",
      category: "Entertainment",
      amount: 5500,
      status: "Completed",
    },
    {
      date: "2024-01-28 16:42",
      merchant: "Uber",
      merchant_sub: "Ride Fare",
      category: "Transportation",
      amount: 3200,
      status: "Completed",
    },
    {
      date: "2024-01-28 12:30",
      merchant: "Jumia",
      merchant_sub: "Online Purchase",
      category: "Shopping",
      amount: 31300,
      status: "Completed",
    },
    {
      date: "2024-01-27 18:45",
      merchant: "Shoprite",
      merchant_sub: "POS Purchase",
      category: "Groceries",
      amount: 15800,
      status: "Failed",
    },
  ],
  activity_log: [
    {
      title: "Transaction approved",
      description: "Amazon.com - ₦ 45,200",
      timestamp: "2024-01-29 14:23:15",
      ip: "197.210.76.143",
      location: "Lagos, Nigeria",
    },
    {
      title: "Transaction approved",
      description: "Netflix - ₦ 5,500",
      timestamp: "2024-01-29 10:05:42",
      ip: "197.210.76.143",
      location: "Lagos, Nigeria",
    },
    {
      title: "Transaction declined",
      description: "Shoprite - insufficient balance",
      timestamp: "2024-01-28 18:50:00",
      ip: "197.210.76.141",
      location: "Lagos, Nigeria",
    },
    {
      title: "Card limit updated",
      description: "Daily limit increased to ₦ 500,000",
      timestamp: "2024-01-25 11:30:00",
      ip: "122.89.2.45",
      location: "",
      is_admin: true,
    },
  ],
};

// ── Wallet data matching w1.PNG ───────────────────────────
export interface WalletRow {
  type: "Hot Wallet" | "Cold Wallet" | "Fiat Reserve";
  network: string;
  asset: "BTC" | "ETH" | "USDT" | "NGN";
  address: string;
  balance: string;
  unit: string;
  usd_value: string;
  threshold: number;
  status: "healthy" | "secure" | "low";
}

export const DUMMY_WALLETS_V2: WalletRow[] = [
  {
    type: "Hot Wallet",
    network: "Bitcoin",
    asset: "BTC",
    address: "1A1zP1eP5QGe...DivfNa",
    balance: "245.32",
    unit: "BTC",
    usd_value: "$10,345,200",
    threshold: 85,
    status: "healthy",
  },
  {
    type: "Hot Wallet",
    network: "Ethereum",
    asset: "ETH",
    address: "0x742d35Cc6e6...5f0bEb",
    balance: "3,420.18",
    unit: "ETH",
    usd_value: "$5,823,400",
    threshold: 92,
    status: "healthy",
  },
  {
    type: "Hot Wallet",
    network: "Ethereum",
    asset: "USDT",
    address: "0x1f9840a85d...01F984",
    balance: "8,234,567",
    unit: "USDT",
    usd_value: "$8,234,567",
    threshold: 78,
    status: "healthy",
  },
  {
    type: "Cold Wallet",
    network: "Bitcoin",
    asset: "BTC",
    address: "3FZbgi29cpjq...tktZc5",
    balance: "892.45",
    unit: "BTC",
    usd_value: "$37,623,450",
    threshold: 100,
    status: "secure",
  },
  {
    type: "Fiat Reserve",
    network: "Bank",
    asset: "NGN",
    address: "GTBank - Acc...**4521",
    balance: "245,800,000",
    unit: "NGN",
    usd_value: "$164,532",
    threshold: 45,
    status: "low",
  },
];

export interface RebalanceEntry {
  date: string;
  from: string;
  to: string;
  amount: string;
  reason: string;
  initiated_by: string;
}

export const DUMMY_REBALANCE_HISTORY: RebalanceEntry[] = [
  {
    date: "2024-01-29 12:00",
    from: "Hot BTC",
    to: "Cold BTC",
    amount: "50 BTC",
    reason: "Security threshold",
    initiated_by: "Sarah Chen",
  },
  {
    date: "2024-01-28 18:30",
    from: "Cold ETH",
    to: "Hot ETH",
    amount: "500 ETH",
    reason: "Liquidity demand",
    initiated_by: "James Wilson",
  },
  {
    date: "2024-01-27 09:15",
    from: "Hot USDT",
    to: "Bank NGN",
    amount: "$2M",
    reason: "Fiat conversion",
    initiated_by: "System",
  },
];

// ── Compliance & Risk data ────────────────────────────────
export const DUMMY_FLAGGED_USERS = [
  {
    id: "5023",
    name: "Adebayo Ogunleye",
    reason: "Velocity breach",
    risk_score: 89,
    flagged: "2024-01-29 10:15",
    severity: "high",
    status: "under review",
  },
  {
    id: "3421",
    name: "Chioma Eze",
    reason: "Suspicious pattern",
    risk_score: 72,
    flagged: "2024-01-29 08:30",
    severity: "medium",
    status: "investigating",
  },
  {
    id: "7234",
    name: "Ibrahim Musa",
    reason: "Large transaction",
    risk_score: 45,
    flagged: "2024-01-28 16:45",
    severity: "low",
    status: "resolved",
  },
  {
    id: "8912",
    name: "Ngozi Okafor",
    reason: "Multiple accounts",
    risk_score: 91,
    flagged: "2024-01-28 14:20",
    severity: "high",
    status: "escalated",
  },
];

export const DUMMY_FLAGGED_TRANSACTIONS = [
  {
    id: "TXN-8234",
    user: "Adebayo Ogunleye",
    type: "BTC → NGN",
    amount: "₦ 15.2M",
    reason: "Exceeds daily limit",
    severity: "high",
    status: "pending",
  },
  {
    id: "TXN-7821",
    user: "Chioma Eze",
    type: "ETH → NGN",
    amount: "₦ 8.5M",
    reason: "Rapid succession",
    severity: "medium",
    status: "reviewing",
  },
  {
    id: "TXN-6543",
    user: "Yusuf Abdullahi",
    type: "USDT → NGN",
    amount: "₦ 3.2M",
    reason: "New user, large amount",
    severity: "low",
    status: "cleared",
  },
];

export const DUMMY_RISK_RULES = [
  {
    name: "Daily transaction limit",
    threshold: "₦ 10M",
    violations: 12,
    status: "active",
  },
  {
    name: "Velocity check (24h)",
    threshold: "5 transactions",
    violations: 8,
    status: "active",
  },
  {
    name: "New user limit",
    threshold: "₦ 2M",
    violations: 3,
    status: "active",
  },
  {
    name: "Suspicious pattern detection",
    threshold: "ML Model",
    violations: 15,
    status: "active",
  },
  {
    name: "Multiple device check",
    threshold: "3 devices/day",
    violations: 5,
    status: "active",
  },
];

// ── Rates & Fees data ─────────────────────────────────────
export const DUMMY_EXCHANGE_RATES = [
  {
    pair: "BTC/NGN",
    rate: "₦ 42,100",
    change: "+2.4%",
    positive: true,
    spread: "0.5%",
    source: "Binance Oracle",
    last_update: "30s ago",
  },
  {
    pair: "ETH/NGN",
    rate: "₦ 1,702",
    change: "+1.8%",
    positive: true,
    spread: "0.4%",
    source: "Coinbase Oracle",
    last_update: "1m ago",
  },
  {
    pair: "USDT/NGN",
    rate: "₦ 1,000",
    change: "+0.3%",
    positive: true,
    spread: "0.2%",
    source: "Manual",
    last_update: "5m ago",
  },
  {
    pair: "USDC/NGN",
    rate: "₦ 1,001",
    change: "+0.2%",
    positive: true,
    spread: "0.2%",
    source: "Coinbase Oracle",
    last_update: "2m ago",
  },
];

export const DUMMY_FEE_TIERS = [
  {
    tier: "Tier 1",
    withdrawal: "1.5%",
    conversion: "1.0%",
    min: "₦ 0",
    max: "₦ 2M",
  },
  {
    tier: "Tier 2",
    withdrawal: "1.0%",
    conversion: "0.75%",
    min: "₦ 0",
    max: "₦ 10M",
  },
  {
    tier: "Tier 3",
    withdrawal: "0.75%",
    conversion: "0.5%",
    min: "₦ 0",
    max: "Unlimited",
  },
  {
    tier: "VIP",
    withdrawal: "0.5%",
    conversion: "0.3%",
    min: "₦ 0",
    max: "Unlimited",
  },
];

// ── Referral Program data ─────────────────────────────────
export const DUMMY_REFERRERS = [
  {
    name: "Chinedu Okonkwo",
    email: "chinedu.o@email.com",
    code: "CHINEDU2024",
    total: 12,
    active: 10,
    earnings: 245000,
    pending: 15000,
    status: "Active",
  },
  {
    name: "Amara Nwosu",
    email: "amara.n@email.com",
    code: "AMARA2024",
    total: 8,
    active: 7,
    earnings: 180500,
    pending: 22000,
    status: "Active",
  },
  {
    name: "Oluwatobi Adeyemi",
    email: "tobi.a@email.com",
    code: "TOBI2024",
    total: 25,
    active: 23,
    earnings: 520000,
    pending: 45000,
    status: "Active",
  },
  {
    name: "Ngozi Okafor",
    email: "ngozi.o@email.com",
    code: "NGOZI2024",
    total: 3,
    active: 2,
    earnings: 45000,
    pending: 8500,
    status: "Active",
  },
  {
    name: "Ibrahim Musa",
    email: "ibrahim.m@email.com",
    code: "IBRAHIM2024",
    total: 6,
    active: 5,
    earnings: 115000,
    pending: 12000,
    status: "Suspended",
  },
];

export const DUMMY_REFERRED_USERS_FULL = [
  {
    name: "Adaeze Eze",
    email: "adaeze.e@email.com",
    referred_by: "Chinedu Okonkwo",
    ref_code: "CHINEDU2024",
    commission: 18000,
    volume: 850000,
    first_tx: "2024-01-16",
    status: "Active",
  },
  {
    name: "Emeka Nwankwo",
    email: "emeka.n@email.com",
    referred_by: "Chinedu Okonkwo",
    ref_code: "CHINEDU2024",
    commission: 22500,
    volume: 1200000,
    first_tx: "2024-01-17",
    status: "Active",
  },
  {
    name: "Funmi Adeleke",
    email: "funmi.a@email.com",
    referred_by: "Chinedu Okonkwo",
    ref_code: "CHINEDU2024",
    commission: 15000,
    volume: 680000,
    first_tx: "2024-01-18",
    status: "Active",
  },
  {
    name: "Tunde Bakare",
    email: "tunde.b@email.com",
    referred_by: "Amara Nwosu",
    ref_code: "AMARA2024",
    commission: 25000,
    volume: 1450000,
    first_tx: "2024-01-11",
    status: "Active",
  },
  {
    name: "Blessing Ojo",
    email: "blessing.o@email.com",
    referred_by: "Oluwatobi Adeyemi",
    ref_code: "TOBI2024",
    commission: 20000,
    volume: 950000,
    first_tx: "2024-01-06",
    status: "Active",
  },
];
