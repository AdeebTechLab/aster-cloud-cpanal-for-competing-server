export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "/api"
).replace(/\/$/, "");

export type CustomerAccount = {
  id: string;
  email: string;
  name: string | null;
};

export type CustomerDashboard = {
  account: CustomerAccount;
  organization: { id: string; name: string };
  metrics: {
    totalServers: number;
    activeServers: number;
    stoppedServers: number;
    monthlySpendMinor: number;
    currency: string;
    balanceMinor: number;
    supportOpen: number;
    sshKeys: number;
  };
  servers: CustomerServer[];
  recentActivity: CustomerActivity[];
  recentTransactions: CustomerTransaction[];
};

export type CustomerServer = {
  id: string;
  name: string;
  region: string;
  ipAddress: string | null;
  operatingSystem: string;
  status: string;
  simulated: boolean;
  createdAt: string;
  plan: {
    cpuCores: number;
    memoryMb: number;
    diskGb: number;
    priceMinor: number | null;
    currency: string | null;
  };
};

export type CustomerActivity = {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  metadata: Record<string, string> | null;
  createdAt: string;
};

export type CustomerTransaction = {
  id: string;
  type: string;
  amountMinor: number;
  currency: string;
  description: string;
  createdAt: string;
};

export function formatMoney(amountMinor: number, currency = "USD") {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amountMinor / 100);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}
