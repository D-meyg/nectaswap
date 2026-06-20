/* eslint-disable @typescript-eslint/no-explicit-any */
export function unwrapApiData<T = any>(response: any, fallback?: T): T {
  const payload = response?.data?.data ?? response?.data ?? response;
  return (payload ?? fallback) as T;
}

export function unwrapApiList<T = any>(response: any, keys: string[] = []): T[] {
  const payload = unwrapApiData<any>(response, []);

  if (Array.isArray(payload)) return payload as T[];

  const listKeys = [
    ...keys,
    "items",
    "results",
    "rows",
    "records",
    "data",
    "users",
    "admins",
    "transactions",
    "cards",
    "applications",
    "flags",
    "rules",
    "logs",
    "referrers",
    "referred_users",
    "exchange_rates",
    "fee_tiers",
    "api_keys",
    "notifications",
  ];

  for (const key of listKeys) {
    const value = payload?.[key];
    if (Array.isArray(value)) return value as T[];
  }

  return [];
}

export function unwrapApiObject<T = any>(response: any, fallback: T): T {
  const payload = unwrapApiData<any>(response, fallback);
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return payload as T;
  }
  return fallback;
}

export function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function formatNaira(value: unknown) {
  return `₦${toNumber(value).toLocaleString()}`;
}

export function fullName(item: any) {
  return (
    item?.name ||
    item?.full_name ||
    [item?.first_name, item?.last_name].filter(Boolean).join(" ") ||
    item?.username ||
    item?.email ||
    "Unknown"
  );
}
