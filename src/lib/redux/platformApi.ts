import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { CustomerAccount, CustomerDashboard, CustomerServer } from "@/components/dashboard/dashboard-api";
import { API_BASE_URL } from "@/components/dashboard/dashboard-api";

type SshKey = {
  id: string;
  name: string;
  keyType: string;
  fingerprint: string;
  createdAt: string;
  linkedServers: number;
};
type FirewallRule = {
  id: string;
  direction: string;
  protocol: string;
  port: string;
  source: string;
  action: string;
  description: string | null;
};
type FirewallGroup = {
  id: string;
  name: string;
  description: string | null;
  rules: FirewallRule[];
  _count: { resources: number };
};
type BillingData = {
  currency: string;
  balanceMinor: number;
  paymentsConfigured: boolean;
  payments: Array<{ id: string; status: string; amountMinor: number; currency: string; createdAt: string }>;
  transactions: Array<{ id: string; type: string; amountMinor: number; currency: string; description: string; createdAt: string; paymentStatus: string | null }>;
  orders: Array<{ id: string; status: string; amountMinor: number | null; currency: string | null; plan: string; createdAt: string }>;
};
type ActivityData = {
  events: Array<{
    id: string;
    action: string;
    resourceType: string;
    resourceId: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
  }>;
};
type TicketRecord = {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};
type CustomerMetrics = {
  totalCustomers: number;
  activeAccounts: number;
  unverifiedAccounts: number;
  suspendedAccounts: number;
  totalServers: number;
  runningServers: number;
  stoppedServers: number;
  failedServers: number;
  openTickets: number;
  revenueMinor: number;
  monthlyRevenueMinor: number;
  failedPaymentsThisMonth: number;
};
type AdminDashboardData = {
  metrics: CustomerMetrics;
  monthlyRevenue: Array<{ month: string; amountMinor: number }>;
  regions: Array<{ region: string; count: number }>;
  recentSignups: Array<{ id: string; name: string | null; email: string; createdAt: string; status: string; plan: string }>;
  recentActivity: Array<{
    id: string;
    action: string;
    resourceType: string;
    createdAt: string;
    actor: { name: string | null; email: string } | null;
  }>;
  alerts: { openTickets: number; failedPaymentsThisMonth: number };
  integrations: { vultrConfigured: boolean; stripeConfigured: boolean; telemetryAvailable: boolean };
};
type CustomerRecord = {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  emailVerified: boolean;
  suspended: boolean;
  organization: string;
  activeServers: number;
  plan: string;
};
type ServerRecord = {
  id: string;
  name: string;
  providerResourceId: string | null;
  provider: string;
  region: string;
  ipAddress: string | null;
  operatingSystem: string;
  status: string;
  createdAt: string;
  servicePlan: { name: string; cpuCores: number; memoryMb: number; diskGb: number };
  customer: { name: string | null; email: string } | null;
  organization: string;
};
type PlanRecord = {
  id: string;
  provider: string;
  providerPlanId: string;
  name: string;
  cpuCores: number;
  memoryMb: number;
  diskGb: number;
  priceMinor: number | null;
  customerPriceMinor: number | null;
  currency: string | null;
  isActive: boolean;
  _count: { resources: number };
};
type PaymentRecord = {
  id: string;
  status: string;
  amountMinor: number;
  currency: string;
  createdAt: string;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  customer: { name: string | null; email: string } | null;
  organization: string;
  walletTransaction: { id: string; description: string } | null;
};
type SupportTicketRecord = TicketRecord & {
  user: { id: string; name: string | null; email: string };
  organization: { name: string };
};
type SecurityLogResponse = {
  events: Array<{
    id: string;
    action: string;
    resourceType: string;
    resourceId: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
    actor: { name: string | null; email: string } | null;
  }>;
  metrics: {
    eventsLast24Hours: number;
    activeSessions: number;
    failedLoginAttempts: number | null;
    ipAddressTracking: boolean;
  };
};
type AdminSettingsData = {
  id: string;
  platformName: string;
  supportEmail: string;
  defaultRegion: string;
  defaultCurrency: "USD";
  timezone: string;
  language: "en-US" | "en-GB";
  maintenanceMode: boolean;
  maintenanceNotice: string;
};

type CustomerPlans = {
  plans: Array<{
    id: string;
    name: string;
    cpuCores: number;
    memoryMb: number;
    diskGb: number;
    priceMinor: number | null;
    currency: string | null;
    provider: string;
  }>;
};

type ProviderOptions = {
  regions: Array<{ id: string; city: string; country: string }>;
  operatingSystems: Array<{ id: number; name: string; family: string; arch: string }>;
  defaultRegion: string;
};

type CustomerSettings = {
  account: CustomerAccount & { createdAt: string };
};

type NotificationsResponse = {
  notifications: Array<{
    id: string;
    title: string;
    body: string;
    readAt: string | null;
    createdAt: string;
  }>;
  unreadCount: number;
};

type CustomerTicketResponse = { tickets: TicketRecord[] };
type ApiMessage = { status?: string };
type AdminPage<T> = { page: number; limit: number; total: number; pages: number } & T;
type AdminPlanResponse = { plans: PlanRecord[]; providerConfigured: boolean };
type AdminBillingResponse = AdminPage<{
  payments: PaymentRecord[];
  summary: {
    revenueMinor: number;
    statuses: Array<{ status: string; count: number; amountMinor: number }>;
  };
  stripeConfigured: boolean;
}>;
type AdminSettingsResponse = { settings: AdminSettingsData };
type AdminMeResponse = {
  user: { id: string; name: string | null; email: string; globalRole: "SUPER_ADMIN" };
  platformName: string;
};

export type AdminListParams = {
  q?: string;
  status?: string;
  page?: number;
  limit?: number;
};
type PlatformRequest = {
  path: string;
  method?: string;
  body?: string;
};

function customerTag(path: string) {
  if (path.startsWith("/dashboard")) return "CustomerDashboard" as const;
  if (path.startsWith("/servers")) return "CustomerServers" as const;
  if (path.startsWith("/plans")) return "CustomerPlans" as const;
  if (path.startsWith("/provider/options")) return "CustomerProviderOptions" as const;
  if (path.startsWith("/ssh-keys")) return "SshKeys" as const;
  if (path.startsWith("/firewall")) return "FirewallGroups" as const;
  if (path.startsWith("/billing")) return "CustomerBilling" as const;
  if (path.startsWith("/activity")) return "CustomerActivity" as const;
  if (path.startsWith("/support")) return "CustomerTickets" as const;
  if (path.startsWith("/settings")) return "CustomerSettings" as const;
  if (path.startsWith("/notifications")) return "Notifications" as const;
  return "CustomerDashboard" as const;
}

function adminTag(path: string) {
  if (path.startsWith("/dashboard")) return "AdminDashboard" as const;
  if (path.startsWith("/customers")) return "AdminCustomers" as const;
  if (path.startsWith("/servers")) return "AdminServers" as const;
  if (path.startsWith("/plans")) return "AdminPlans" as const;
  if (path.startsWith("/billing")) return "AdminBilling" as const;
  if (path.startsWith("/support")) return "AdminTickets" as const;
  if (path.startsWith("/security")) return "AdminSecurity" as const;
  if (path.startsWith("/settings")) return "AdminSettings" as const;
  if (path.startsWith("/me")) return "AdminMe" as const;
  return "AdminDashboard" as const;
}

function makeSearchParams(params: AdminListParams) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return search.toString();
}

export const platformApi = createApi({
  reducerPath: "platformApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
    prepareHeaders(headers) {
      headers.set("ngrok-skip-browser-warning", "true");
      return headers;
    },
  }),
  tagTypes: [
    "CustomerDashboard",
    "CustomerServers",
    "CustomerPlans",
    "CustomerProviderOptions",
    "SshKeys",
    "FirewallGroups",
    "CustomerBilling",
    "CustomerActivity",
    "CustomerTickets",
    "CustomerSettings",
    "Notifications",
    "AdminDashboard",
    "AdminCustomers",
    "AdminServers",
    "AdminPlans",
    "AdminBilling",
    "AdminTickets",
    "AdminSecurity",
    "AdminSettings",
    "AdminMe",
  ],
  endpoints: (build) => ({
    getCustomerData: build.query<unknown, string>({
      query: (path) => `/customer${path}`,
      providesTags: (_result, _error, path) => [customerTag(path)],
    }),
    runCustomerRequest: build.mutation<unknown, PlatformRequest>({
      query: ({ path, method = "POST", body }) => ({
        url: `/customer${path}`,
        method,
        body,
        headers: body ? { "Content-Type": "application/json" } : undefined,
      }),
      invalidatesTags: (_result, _error, { path }) => [
        customerTag(path),
        "CustomerDashboard",
        "CustomerActivity",
      ],
    }),
    getAdminData: build.query<unknown, string>({
      query: (path) => `/admin${path}`,
      providesTags: (_result, _error, path) => [adminTag(path)],
    }),
    runAdminRequest: build.mutation<unknown, PlatformRequest>({
      query: ({ path, method = "PATCH", body }) => ({
        url: `/admin${path}`,
        method,
        body,
        headers: body ? { "Content-Type": "application/json" } : undefined,
      }),
      invalidatesTags: (_result, _error, { path }) => [
        adminTag(path),
        "AdminDashboard",
        "AdminSecurity",
        ...(path.startsWith("/plans") ? (["CustomerPlans"] as const) : []),
      ],
    }),
    getCustomerDashboard: build.query<CustomerDashboard, void>({
      query: () => "/customer/dashboard",
      providesTags: ["CustomerDashboard"],
    }),
    getCustomerServers: build.query<{ servers: CustomerServer[] }, void>({
      query: () => "/customer/servers",
      providesTags: ["CustomerServers"],
    }),
    getCustomerPlans: build.query<CustomerPlans, void>({
      query: () => "/customer/plans",
      providesTags: ["CustomerPlans"],
    }),
    getProviderOptions: build.query<ProviderOptions, void>({
      query: () => "/customer/provider/options",
      providesTags: ["CustomerProviderOptions"],
    }),
    deployCustomerServer: build.mutation<ApiMessage, {
      name: string;
      region: string;
      operatingSystemId: number;
      servicePlanId: string;
    }>({
      query: (body) => ({ url: "/customer/servers", method: "POST", body }),
      invalidatesTags: ["CustomerDashboard", "CustomerServers", "CustomerBilling", "CustomerActivity"],
    }),
    runCustomerServerAction: build.mutation<ApiMessage, {
      id: string;
      action: "reboot" | "power-on" | "power-off" | "delete";
    }>({
      query: ({ id, action }) => ({
        url: `/customer/servers/${encodeURIComponent(id)}/actions`,
        method: "POST",
        body: { action },
      }),
      invalidatesTags: ["CustomerDashboard", "CustomerServers", "CustomerActivity"],
    }),
    getSshKeys: build.query<{ keys: SshKey[] }, void>({
      query: () => "/customer/ssh-keys",
      providesTags: ["SshKeys"],
    }),
    createSshKey: build.mutation<ApiMessage, { name: string; publicKey: string }>({
      query: (body) => ({ url: "/customer/ssh-keys", method: "POST", body }),
      invalidatesTags: ["SshKeys", "CustomerDashboard", "CustomerActivity"],
    }),
    revokeSshKey: build.mutation<ApiMessage, string>({
      query: (id) => ({ url: `/customer/ssh-keys/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: ["SshKeys", "CustomerDashboard", "CustomerActivity"],
    }),
    getFirewallGroups: build.query<{ groups: FirewallGroup[] }, void>({
      query: () => "/customer/firewall/groups",
      providesTags: ["FirewallGroups"],
    }),
    createFirewallGroup: build.mutation<ApiMessage, { name: string; description: string }>({
      query: (body) => ({ url: "/customer/firewall/groups", method: "POST", body }),
      invalidatesTags: ["FirewallGroups", "CustomerActivity"],
    }),
    createFirewallRule: build.mutation<ApiMessage, {
      groupId: string;
      direction: string;
      protocol: string;
      port: string;
      source: string;
      action: string;
      description: string;
    }>({
      query: ({ groupId, ...body }) => ({
        url: `/customer/firewall/groups/${encodeURIComponent(groupId)}/rules`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["FirewallGroups", "CustomerActivity"],
    }),
    deleteFirewallGroup: build.mutation<ApiMessage, string>({
      query: (id) => ({ url: `/customer/firewall/groups/${encodeURIComponent(id)}`, method: "DELETE" }),
      invalidatesTags: ["FirewallGroups", "CustomerActivity"],
    }),
    deleteFirewallRule: build.mutation<ApiMessage, { groupId: string; ruleId: string }>({
      query: ({ groupId, ruleId }) => ({
        url: `/customer/firewall/groups/${encodeURIComponent(groupId)}/rules/${encodeURIComponent(ruleId)}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FirewallGroups", "CustomerActivity"],
    }),
    getCustomerBilling: build.query<BillingData, void>({
      query: () => "/customer/billing",
      providesTags: ["CustomerBilling"],
    }),
    createCheckout: build.mutation<{ checkoutUrl: string }, { amountMinor: number; currency: string }>({
      query: (body) => ({ url: "/customer/billing/checkout", method: "POST", body }),
      invalidatesTags: ["CustomerBilling"],
    }),
    getCustomerActivity: build.query<ActivityData, number>({
      query: (limit) => `/customer/activity?limit=${limit}`,
      providesTags: ["CustomerActivity"],
    }),
    getCustomerTickets: build.query<CustomerTicketResponse, void>({
      query: () => "/customer/support/tickets",
      providesTags: ["CustomerTickets"],
    }),
    createCustomerTicket: build.mutation<ApiMessage, {
      subject: string;
      category: string;
      priority: string;
      description: string;
    }>({
      query: (body) => ({ url: "/customer/support/tickets", method: "POST", body }),
      invalidatesTags: ["CustomerTickets", "CustomerDashboard", "CustomerActivity"],
    }),
    getCustomerSettings: build.query<CustomerSettings, void>({
      query: () => "/customer/settings",
      providesTags: ["CustomerSettings"],
    }),
    updateCustomerSettings: build.mutation<
      CustomerSettings,
      { name: string }
    >({
      query: (body) => ({ url: "/customer/settings", method: "PATCH", body }),
      invalidatesTags: ["CustomerSettings", "CustomerDashboard", "CustomerActivity"],
    }),
    getNotifications: build.query<NotificationsResponse, void>({
      query: () => "/customer/notifications",
      providesTags: ["Notifications"],
    }),
    markNotificationRead: build.mutation<ApiMessage, string>({
      query: (id) => ({
        url: `/customer/notifications/${encodeURIComponent(id)}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllNotificationsRead: build.mutation<ApiMessage, void>({
      query: () => ({ url: "/customer/notifications/read-all", method: "PATCH" }),
      invalidatesTags: ["Notifications"],
    }),
    getAdminMe: build.query<AdminMeResponse, void>({
      query: () => "/admin/me",
      providesTags: ["AdminMe"],
    }),
    getAdminDashboard: build.query<AdminDashboardData, void>({
      query: () => "/admin/dashboard",
      providesTags: ["AdminDashboard"],
    }),
    getAdminCustomers: build.query<AdminPage<{ customers: CustomerRecord[] }>, AdminListParams>({
      query: (params) => `/admin/customers?${makeSearchParams(params)}`,
      providesTags: ["AdminCustomers"],
    }),
    updateAdminCustomer: build.mutation<
      unknown,
      { id: string; suspended?: boolean; emailVerified?: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/customers/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminCustomers", "AdminDashboard", "AdminSecurity"],
    }),
    getAdminServers: build.query<
      AdminPage<{ servers: ServerRecord[]; telemetryAvailable: boolean }>,
      AdminListParams
    >({
      query: (params) => `/admin/servers?${makeSearchParams(params)}`,
      providesTags: ["AdminServers"],
    }),
    runAdminServerAction: build.mutation<
      ApiMessage,
      { id: string; action: "reboot" | "power-on" | "power-off" | "delete" }
    >({
      query: ({ id, action }) => ({
        url: `/admin/servers/${encodeURIComponent(id)}/actions`,
        method: "POST",
        body: { action },
      }),
      invalidatesTags: ["AdminServers", "AdminDashboard", "AdminSecurity"],
    }),
    getAdminPlans: build.query<AdminPlanResponse, void>({
      query: () => "/admin/plans",
      providesTags: ["AdminPlans"],
    }),
    updateAdminPlan: build.mutation<
      unknown,
      { id: string; isActive?: boolean; customerPriceMinor?: number | null }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/plans/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminPlans", "CustomerPlans", "AdminSecurity"],
    }),
    getAdminBilling: build.query<AdminBillingResponse, AdminListParams>({
      query: (params) => `/admin/billing?${makeSearchParams(params)}`,
      providesTags: ["AdminBilling"],
    }),
    getAdminTickets: build.query<AdminPage<{ tickets: SupportTicketRecord[] }>, AdminListParams>({
      query: (params) => `/admin/support/tickets?${makeSearchParams(params)}`,
      providesTags: ["AdminTickets"],
    }),
    updateAdminTicket: build.mutation<
      unknown,
      { id: string; status?: string; priority?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/support/tickets/${encodeURIComponent(id)}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminTickets", "AdminDashboard", "AdminSecurity"],
    }),
    getAdminSecurity: build.query<SecurityLogResponse, { q?: string; limit?: number }>({
      query: (params) => `/admin/security/logs?${makeSearchParams(params)}`,
      providesTags: ["AdminSecurity"],
    }),
    getAdminSettings: build.query<AdminSettingsResponse, void>({
      query: () => "/admin/settings",
      providesTags: ["AdminSettings"],
    }),
    saveAdminSettings: build.mutation<AdminSettingsResponse, AdminSettingsData>({
      query: (body) => ({ url: "/admin/settings", method: "PUT", body }),
      invalidatesTags: ["AdminSettings", "AdminMe", "AdminSecurity"],
    }),
    login: build.mutation<
      { user: { id: string; email: string; name: string | null; globalRole: string } },
      { email: string; password: string; name?: string; mode: "login" | "signup" }
    >({
      query: ({ mode, ...body }) => ({ url: `/auth/${mode}`, method: "POST", body }),
      invalidatesTags: [
        "CustomerDashboard",
        "CustomerServers",
        "CustomerPlans",
        "CustomerProviderOptions",
        "SshKeys",
        "FirewallGroups",
        "CustomerBilling",
        "CustomerActivity",
        "CustomerTickets",
        "CustomerSettings",
        "Notifications",
        "AdminDashboard",
        "AdminCustomers",
        "AdminServers",
        "AdminPlans",
        "AdminBilling",
        "AdminTickets",
        "AdminSecurity",
        "AdminSettings",
        "AdminMe",
      ],
    }),
    logout: build.mutation<ApiMessage, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: [
        "CustomerDashboard",
        "CustomerServers",
        "CustomerPlans",
        "CustomerProviderOptions",
        "SshKeys",
        "FirewallGroups",
        "CustomerBilling",
        "CustomerActivity",
        "CustomerTickets",
        "CustomerSettings",
        "Notifications",
        "AdminDashboard",
        "AdminCustomers",
        "AdminServers",
        "AdminPlans",
        "AdminBilling",
        "AdminTickets",
        "AdminSecurity",
        "AdminSettings",
        "AdminMe",
      ],
    }),
  }),
});

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = error.data;
    if (typeof data === "object" && data !== null && "error" in data && typeof data.error === "string") {
      return data.error;
    }
  }
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return fallback;
}

export const {
  useGetCustomerDataQuery,
  useGetAdminDataQuery,
  useGetCustomerDashboardQuery,
  useGetCustomerServersQuery,
  useGetCustomerPlansQuery,
  useGetProviderOptionsQuery,
  useDeployCustomerServerMutation,
  useRunCustomerServerActionMutation,
  useGetSshKeysQuery,
  useCreateSshKeyMutation,
  useRevokeSshKeyMutation,
  useGetFirewallGroupsQuery,
  useCreateFirewallGroupMutation,
  useCreateFirewallRuleMutation,
  useDeleteFirewallGroupMutation,
  useDeleteFirewallRuleMutation,
  useGetCustomerBillingQuery,
  useCreateCheckoutMutation,
  useGetCustomerActivityQuery,
  useGetCustomerTicketsQuery,
  useCreateCustomerTicketMutation,
  useGetCustomerSettingsQuery,
  useUpdateCustomerSettingsMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetAdminMeQuery,
  useGetAdminDashboardQuery,
  useGetAdminCustomersQuery,
  useUpdateAdminCustomerMutation,
  useGetAdminServersQuery,
  useRunAdminServerActionMutation,
  useGetAdminPlansQuery,
  useUpdateAdminPlanMutation,
  useGetAdminBillingQuery,
  useGetAdminTicketsQuery,
  useUpdateAdminTicketMutation,
  useGetAdminSecurityQuery,
  useGetAdminSettingsQuery,
  useSaveAdminSettingsMutation,
  useLoginMutation,
  useLogoutMutation,
} = platformApi;
