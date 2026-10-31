"use client";

import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleDollarSign,
  CircleHelp,
  CreditCard,
  LoaderCircle,
  RefreshCw,
  Server,
  Tags,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, type FormEvent, type ReactNode } from "react";
import { exportCsv, formatAdminDate, formatAdminMoney } from "./admin-api";
import { useAppDispatch } from "@/lib/redux/hooks";
import {
  getApiErrorMessage,
  platformApi,
  useGetAdminDataQuery,
} from "@/lib/redux/platformApi";

export type AdminSection =
  | "overview"
  | "customers"
  | "servers"
  | "plans"
  | "billing"
  | "support"
  | "security"
  | "settings";

type DashboardPayload = {
  metrics: {
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
  monthlyRevenue: Array<{ month: string; amountMinor: number }>;
  regions: Array<{ region: string; count: number }>;
  recentSignups: Array<{
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
    status: string;
    plan: string;
  }>;
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

type Page<T> = { page: number; limit: number; total: number; pages: number; [key: string]: unknown } & T;

function useAdminData<T>(path: string) {
  const query = useGetAdminDataQuery(path);
  return {
    data: (query.data as T | undefined) ?? null,
    error: query.error ? getApiErrorMessage(query.error, "Unable to load platform data.") : "",
    loading: query.isLoading || query.isFetching,
    refresh: query.refetch,
  };
}

function useAdminRequest() {
  const dispatch = useAppDispatch();
  return useCallback(
    <T,>(path: string, init: RequestInit = {}) =>
      dispatch(platformApi.endpoints.runAdminRequest.initiate({
        path,
        method: init.method,
        body: typeof init.body === "string" ? init.body : undefined,
      })).unwrap() as Promise<T>,
    [dispatch],
  );
}

const buttonClass = "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#e1e7f0] bg-white px-3 text-[10px] font-semibold text-[#52617b] transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50";
const primaryButtonClass = "inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-[#2865e9] px-3 text-[10px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";
const inputClass = "h-8 rounded-md border border-[#e1e7f0] bg-white px-3 text-[10px] text-[#34425e] outline-none placeholder:text-[#97a3b6] focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-[#e6ebf3] bg-white shadow-[0_3px_12px_rgba(27,43,78,0.025)] ${className}`}>{children}</section>;
}

function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[22px] font-bold tracking-[-0.045em] text-[#192742] sm:text-[24px]">{title}</h1>
        <p className="mt-1 text-[10px] leading-5 text-[#8492a9]">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone = "blue",
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "blue" | "green" | "amber" | "red";
  icon?: ReactNode;
}) {
  const toneClass = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    red: "text-rose-600 bg-rose-50",
  }[tone];
  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[9px] font-medium text-[#8794aa]">{label}</p>
        {icon ? <span className={`flex size-7 items-center justify-center rounded-md ${toneClass}`}>{icon}</span> : null}
      </div>
      <p className="mt-2 text-[21px] font-bold leading-none tracking-[-0.04em] text-[#1d2b48]">{value}</p>
      <p className={`mt-2 text-[9px] ${tone === "red" ? "text-rose-600" : tone === "green" ? "text-emerald-600" : tone === "amber" ? "text-amber-600" : "text-[#8996ab]"}`}>{detail}</p>
    </Panel>
  );
}

function StatusPill({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "amber" | "red" | "blue" | "slate" }) {
  const colors = {
    green: "bg-[#e6f7f0] text-[#16835e]",
    amber: "bg-[#fff3dd] text-[#ac6a0a]",
    red: "bg-[#ffeded] text-[#c44747]",
    blue: "bg-[#eaf0ff] text-[#3665cf]",
    slate: "bg-[#eef1f5] text-[#65738a]",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-semibold ${colors[tone]}`}>{children}</span>;
}

function Table({
  headers,
  children,
  minWidth = 720,
}: {
  headers: string[];
  children: ReactNode;
  minWidth?: number;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left" style={{ minWidth }}>
        <thead className="bg-[#f8f9fc]">
          <tr className="border-y border-[#eef1f5] text-[8px] font-bold uppercase tracking-[0.07em] text-[#8996ab]">
            {headers.map((header) => <th className="px-3 py-3" key={header}>{header}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0f2f6] text-[10px] text-[#53617a]">{children}</tbody>
      </table>
    </div>
  );
}

function LoadingPanel({ label = "Loading live platform data…" }: { label?: string }) {
  return <Panel className="flex min-h-40 items-center justify-center gap-2 p-6 text-[10px] text-[#8794aa]"><LoaderCircle className="animate-spin text-blue-600" size={15} />{label}</Panel>;
}

function InlineError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div role="alert" className="flex flex-col gap-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-[10px] text-rose-800 sm:flex-row sm:items-center sm:justify-between">
      <span>{message}</span>
      <button className="w-fit rounded border border-rose-200 px-2.5 py-1.5 font-semibold hover:bg-white" onClick={retry} type="button">Retry</button>
    </div>
  );
}

function Notice({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "amber" | "red" }) {
  const colors = {
    blue: "border-[#dfe8ff] bg-[#f0f4ff] text-[#526b9a]",
    amber: "border-[#f3dfb7] bg-[#fff9eb] text-[#876326]",
    red: "border-[#f3caca] bg-[#fff2f2] text-[#9c4a4a]",
  };
  return <div className={`rounded-md border px-3 py-2.5 text-[9px] leading-4 ${colors[tone]}`}>{children}</div>;
}

function Pagination({
  page,
  pages,
  total,
  limit,
  onChange,
}: {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eef1f5] px-3 py-3">
      <p className="text-[9px] text-[#91a0b7]">Showing {total ? (page - 1) * limit + 1 : 0}–{Math.min(page * limit, total)} of {total}</p>
      <div className="flex items-center gap-1">
        <button aria-label="Previous page" className={`${buttonClass} size-7 px-0`} disabled={page <= 1} onClick={() => onChange(page - 1)} type="button">‹</button>
        <span className="px-1 text-[9px] text-[#52617b]">Page {page} of {pages}</span>
        <button aria-label="Next page" className={`${buttonClass} size-7 px-0`} disabled={page >= pages} onClick={() => onChange(page + 1)} type="button">›</button>
      </div>
    </div>
  );
}

function Modal({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#101c33]/45 p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget) close();
    }}>
      <section aria-labelledby="admin-modal-title" aria-modal="true" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[#e6ebf3] bg-white shadow-[0_24px_70px_rgba(14,30,58,0.24)]" role="dialog">
        <header className="flex items-center justify-between border-b border-[#edf0f5] px-5 py-4">
          <h2 className="text-sm font-bold text-[#1d2b48]" id="admin-modal-title">{title}</h2>
          <button aria-label="Close dialog" className="rounded-md p-1.5 text-[#7d8aa0] hover:bg-[#f2f4f8]" onClick={close} type="button"><X size={15} /></button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}

function useAdminDashboard() {
  return useAdminData<DashboardPayload>("/dashboard");
}

function AdminOverview() {
  const { data, error, loading, refresh } = useAdminDashboard();
  const metrics = data?.metrics;
  const maxRevenue = Math.max(...(data?.monthlyRevenue.map((item) => item.amountMinor) ?? [0]), 1);
  return (
    <>
      <SectionHeading
        title="Admin Overview"
        description="Monitor your platform, customers, and infrastructure."
        action={<Link className={primaryButtonClass} href="/admin/servers"><Server size={12} /> Provision Server</Link>}
      />
      {error ? <InlineError message={error} retry={refresh} /> : null}
      {loading ? <LoadingPanel /> : null}
      {metrics && data ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Total Customers" value={metrics.totalCustomers.toLocaleString()} detail={`${metrics.unverifiedAccounts.toLocaleString()} accounts unverified`} icon={<Users size={14} />} />
            <MetricCard label="Active Accounts" value={metrics.activeAccounts.toLocaleString()} detail={`${metrics.totalCustomers ? Math.round(metrics.activeAccounts / metrics.totalCustomers * 100) : 0}% of customer accounts`} tone="green" icon={<Check size={14} />} />
            <MetricCard label="Monthly Revenue" value={formatAdminMoney(metrics.monthlyRevenueMinor)} detail="Successful payments this month" icon={<CircleDollarSign size={14} />} />
            <MetricCard label="Open Tickets" value={metrics.openTickets.toLocaleString()} detail={metrics.openTickets ? "Needs support review" : "No open tickets"} tone={metrics.openTickets ? "amber" : "green"} icon={<CircleHelp size={14} />} />
          </div>
          <div className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
            <Panel className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div><h2 className="text-[11px] font-bold text-[#263654]">Revenue Overview</h2><p className="mt-1 text-[9px] text-[#91a0b7]">Monthly successful payments received</p></div>
                <span className="rounded border border-[#edf0f5] px-2 py-1 text-[8px] text-[#8290a8]">Last 7 months</span>
              </div>
              <div className="mt-5 flex h-32 items-end gap-3 border-b border-[#eef1f5] px-1 sm:gap-5">
                {data.monthlyRevenue.map((entry) => {
                  const height = entry.amountMinor ? Math.max(8, entry.amountMinor / maxRevenue * 100) : 2;
                  return (
                    <div className="flex h-full flex-1 flex-col items-center justify-end gap-1" key={entry.month} title={formatAdminMoney(entry.amountMinor)}>
                      <div className={`w-full max-w-7 rounded-t-[3px] ${entry.month === data.monthlyRevenue.at(-1)?.month ? "bg-[#2865e9]" : "bg-[#a8c4ff]"}`} style={{ height: `${height}%` }} />
                      <span className="mb-[-16px] text-[8px] text-[#91a0b7]">{new Intl.DateTimeFormat(undefined, { month: "short" }).format(new Date(`${entry.month}-01T00:00:00`))}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-[8px] text-[#8290a8]"><span className="size-1.5 rounded-sm bg-blue-600" /> Payments in USD equivalent</div>
            </Panel>
            <Panel className="p-4 sm:p-5">
              <h2 className="text-[11px] font-bold text-[#263654]">Infrastructure Status</h2>
              <p className="mt-1 text-[9px] text-[#91a0b7]">Live resource counts by region</p>
              <div className="mt-5 space-y-4">
                {data.regions.length ? data.regions.map(({ region, count }) => (
                  <div key={region}>
                    <div className="mb-1.5 flex justify-between text-[9px]"><span className="font-medium text-[#52617b]">{region}</span><span className="text-[#8290a8]">{count.toLocaleString()} servers</span></div>
                    <div className="h-1.5 rounded-full bg-[#edf1f7]"><div className="h-1.5 rounded-full bg-[#2865e9]" style={{ width: `${Math.min(100, count / Math.max(1, metrics.totalServers) * 100)}%` }} /></div>
                  </div>
                )) : <p className="py-4 text-[9px] text-[#91a0b7]">No cloud resources have been recorded.</p>}
                <div className="border-t border-[#eef1f5] pt-3 text-[9px] text-[#8290a8]">
                  <span className="font-semibold text-[#263654]">{metrics.runningServers.toLocaleString()}</span> running ·{" "}
                  <span className="font-semibold text-[#263654]">{metrics.stoppedServers.toLocaleString()}</span> stopped
                </div>
              </div>
            </Panel>
          </div>
          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div><h2 className="text-[11px] font-bold text-[#263654]">Recent Customer Signups</h2><p className="mt-1 text-[9px] text-[#91a0b7]">Latest customer accounts created on the platform</p></div>
              <Link className="text-[9px] font-semibold text-blue-600 hover:text-blue-800" href="/admin/customers">View all customers <ArrowRight className="inline" size={11} /></Link>
            </div>
            <Table headers={["Customer", "Email", "Plan", "Joined", "Status"]} minWidth={650}>
              {data.recentSignups.length ? data.recentSignups.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-3 py-3 font-semibold text-[#263654]">{customer.name || "Unnamed customer"}</td>
                  <td className="px-3 py-3">{customer.email}</td>
                  <td className="px-3 py-3">{customer.plan}</td>
                  <td className="px-3 py-3">{formatAdminDate(customer.createdAt)}</td>
                  <td className="px-3 py-3"><StatusPill tone={customer.status === "Active" ? "green" : "red"}>{customer.status}</StatusPill></td>
                </tr>
              )) : <tr><td className="px-3 py-8 text-center text-[#91a0b7]" colSpan={5}>No customer accounts yet.</td></tr>}
            </Table>
          </Panel>
          <div className="grid gap-4 xl:grid-cols-2">
            <Panel className="p-4 sm:p-5">
              <h2 className="text-[11px] font-bold text-[#263654]">Recent System Activity</h2>
              <p className="mt-1 text-[9px] text-[#91a0b7]">Latest recorded platform changes</p>
              <div className="mt-3 divide-y divide-[#f0f2f6]">
                {data.recentActivity.length ? data.recentActivity.map((event) => (
                  <div className="flex gap-2.5 py-3" key={event.id}>
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-[#edf3ff] text-blue-600"><ActivityIcon action={event.action} /></span>
                    <div className="min-w-0 flex-1"><p className="text-[9px] font-semibold text-[#34425e]">{event.action.replaceAll("_", " ").toLowerCase()}</p><p className="mt-1 truncate text-[8px] text-[#91a0b7]">{event.actor?.name || event.actor?.email || "System"} · {event.resourceType}</p></div>
                    <time className="shrink-0 text-[8px] text-[#a2adbd]">{formatAdminDate(event.createdAt)}</time>
                  </div>
                )) : <p className="py-5 text-[9px] text-[#91a0b7]">No audit activity has been recorded.</p>}
              </div>
            </Panel>
            <Panel className="p-4 sm:p-5">
              <h2 className="text-[11px] font-bold text-[#263654]">System Alerts</h2>
              <p className="mt-1 text-[9px] text-[#91a0b7]">Items based on current platform records</p>
              <div className="mt-3 space-y-2">
                {metrics.openTickets > 0 ? <Link className="block rounded-md border border-[#f4e3bf] bg-[#fff9ec] p-3" href="/admin/support"><p className="text-[9px] font-bold text-[#9a6a18]">Support tickets awaiting review</p><p className="mt-1 text-[8px] text-[#9a8053]">{metrics.openTickets} ticket(s) are open or in progress.</p></Link> : null}
                {metrics.failedPaymentsThisMonth > 0 ? <Link className="block rounded-md border border-[#f4e3bf] bg-[#fff9ec] p-3" href="/admin/billing"><p className="text-[9px] font-bold text-[#9a6a18]">Failed payments this month</p><p className="mt-1 text-[8px] text-[#9a8053]">{metrics.failedPaymentsThisMonth} payment(s) need review.</p></Link> : null}
                {!metrics.openTickets && !metrics.failedPaymentsThisMonth ? <Notice>No open support tickets or failed payments were found in the current data.</Notice> : null}
                <Notice tone="amber">CPU, RAM utilization, uptime, and regional capacity telemetry are not connected, so health alerts are unavailable.</Notice>
              </div>
            </Panel>
          </div>
          <Notice>Integrations: Vultr {data.integrations.vultrConfigured ? "connected" : "not configured"} · Stripe {data.integrations.stripeConfigured ? "connected" : "not configured"}. Dashboard metrics come from saved platform records.</Notice>
        </div>
      ) : null}
    </>
  );
}

function ActivityIcon({ action }: { action: string }) {
  if (action.includes("PAYMENT") || action.includes("WALLET")) return <CreditCard size={12} />;
  if (action.includes("SERVER")) return <Server size={12} />;
  if (action.includes("CUSTOMER") || action.includes("USER")) return <Users size={12} />;
  return <Activity size={12} />;
}

type Customer = {
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

function CustomersSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [mutationError, setMutationError] = useState("");
  const params = new URLSearchParams({ page: String(page), limit: "10", status });
  if (query.trim()) params.set("q", query.trim());
  const customersState = useAdminData<Page<{ customers: Customer[] }>>(`/customers?${params}`);
  const dashboardState = useAdminData<DashboardPayload>("/dashboard");
  const data = customersState.data;
  const metrics = dashboardState.data?.metrics ?? null;
  const error = customersState.error || dashboardState.error;
  const loading = customersState.loading || dashboardState.loading;
  const refresh = () => {
    void customersState.refresh();
    void dashboardState.refresh();
  };
  const adminRequest = useAdminRequest();

  async function updateCustomer(customer: Customer, change: { suspended?: boolean; emailVerified?: boolean }) {
    setBusy(true);
    setMutationError("");
    try {
      await adminRequest(`/customers/${encodeURIComponent(customer.id)}`, {
        method: "PATCH",
        body: JSON.stringify(change),
      });
      setNotice("Customer account updated.");
      setSelected(null);
    } catch (reason) {
      setMutationError(getApiErrorMessage(reason, "Unable to update this customer."));
    } finally {
      setBusy(false);
    }
  }

  const customers = data?.customers ?? [];
  return (
    <>
      <SectionHeading title="Customers" description="Manage customer accounts, workspaces, and access." action={<button className={buttonClass} onClick={refresh} type="button"><RefreshCw size={11} /> Refresh list</button>} />
      {notice ? <p aria-live="polite" className="mb-3 text-[10px] font-medium text-emerald-700">{notice}</p> : null}
      {error || mutationError ? <InlineError message={error || mutationError} retry={refresh} /> : null}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Customers" value={metrics?.totalCustomers.toLocaleString() ?? "—"} detail="Registered customer accounts" icon={<Users size={14} />} />
        <MetricCard label="Active Accounts" value={metrics?.activeAccounts.toLocaleString() ?? "—"} detail="Not currently suspended" tone="green" />
        <MetricCard label="Unverified Accounts" value={metrics?.unverifiedAccounts.toLocaleString() ?? "—"} detail="Email verification is not configured" tone="amber" />
        <MetricCard label="Suspended Accounts" value={metrics?.suspendedAccounts.toLocaleString() ?? "—"} detail="Access restrictions applied" tone="red" />
      </div>
      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-[11px] font-bold text-[#263654]">All Customers</h2><p className="mt-1 text-[9px] text-[#91a0b7]">{loading ? "Loading accounts…" : `Showing ${customers.length} of ${data?.total.toLocaleString() ?? 0} customers`}</p></div>
          <div className="flex flex-wrap gap-2">
            <input aria-label="Search by name or email" className={`${inputClass} w-full sm:w-52`} onChange={(event) => { const value = event.target.value; setPage(1); router.replace(value ? `/admin/customers?q=${encodeURIComponent(value)}` : "/admin/customers"); }} placeholder="Search by name or email" value={query} />
            <select aria-label="Filter customer status" className={inputClass} onChange={(event) => { setStatus(event.target.value); setPage(1); }} value={status}>
              <option value="all">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option><option value="unverified">Unverified</option>
            </select>
            <button className={buttonClass} disabled={!customers.length} onClick={() => exportCsv("northstar-customers.csv", [["Name", "Email", "Workspace", "Plan", "Active servers", "Joined", "Status"], ...customers.map((customer) => [customer.name ?? "", customer.email, customer.organization, customer.plan, customer.activeServers, customer.createdAt, customer.suspended ? "Suspended" : "Active"])])} type="button"><ArrowDownToLine size={11} /> Export CSV</button>
          </div>
        </div>
        {loading ? <LoadingPanel label="Loading customer accounts…" /> : (
          <Table headers={["Customer", "Plan", "Active servers", "Joined date", "Status", "Action"]} minWidth={760}>
            {customers.length ? customers.map((customer) => {
              const label = customer.name || customer.email;
              const initials = label.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
              return (
                <tr key={customer.id}>
                  <td className="px-3 py-3"><div className="flex items-center gap-2"><span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#eaf0ff] text-[8px] font-bold text-blue-600">{initials}</span><span className="min-w-0"><span className="block font-semibold text-[#263654]">{customer.name || "Unnamed customer"}</span><span className="mt-0.5 block text-[8px] text-[#91a0b7]">{customer.email}</span></span></div></td>
                  <td className="px-3 py-3">{customer.plan}</td>
                  <td className="px-3 py-3">{customer.activeServers}</td>
                  <td className="px-3 py-3">{formatAdminDate(customer.createdAt)}</td>
                  <td className="px-3 py-3"><StatusPill tone={customer.suspended ? "red" : "green"}>{customer.suspended ? "Suspended" : "Active"}</StatusPill></td>
                  <td className="px-3 py-3"><button className={buttonClass} onClick={() => setSelected(customer)} type="button">View details <ArrowUpRight size={10} /></button></td>
                </tr>
              );
            }) : <tr><td className="px-3 py-10 text-center text-[#91a0b7]" colSpan={6}>No customers match these filters.</td></tr>}
          </Table>
        )}
        {data ? <Pagination page={data.page} pages={data.pages} total={data.total} limit={data.limit} onChange={setPage} /> : null}
      </Panel>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel className="p-4"><h2 className="text-[11px] font-bold text-[#263654]">Account Management</h2><p className="mt-1 text-[9px] text-[#91a0b7]">Review account activity and customer access.</p><div className="mt-3"><Notice>New accounts are created through the public sign-up flow. Email verification and automated invitations are not configured.</Notice></div></Panel>
        <Panel className="p-4"><h2 className="text-[11px] font-bold text-[#263654]">Access controls</h2><p className="mt-1 text-[9px] text-[#91a0b7]">Suspension immediately blocks the selected customer&apos;s authenticated sessions.</p><div className="mt-3"><Notice tone="amber">Unverified email status reflects the stored account record. There is no email verification delivery service configured.</Notice></div></Panel>
      </div>
      {selected ? (
        <Modal title="Customer account" close={() => setSelected(null)}>
          <div className="space-y-3 text-[10px]">
            <div><p className="text-[8px] font-semibold uppercase text-[#91a0b7]">Customer</p><p className="mt-1 font-semibold text-[#263654]">{selected.name || "Unnamed customer"}</p><p className="text-[#8290a8]">{selected.email}</p></div>
            <div className="grid grid-cols-2 gap-3"><div><p className="text-[8px] font-semibold uppercase text-[#91a0b7]">Workspace</p><p className="mt-1 text-[#34425e]">{selected.organization}</p></div><div><p className="text-[8px] font-semibold uppercase text-[#91a0b7]">Active servers</p><p className="mt-1 text-[#34425e]">{selected.activeServers}</p></div><div><p className="text-[8px] font-semibold uppercase text-[#91a0b7]">Plan</p><p className="mt-1 text-[#34425e]">{selected.plan}</p></div><div><p className="text-[8px] font-semibold uppercase text-[#91a0b7]">Joined</p><p className="mt-1 text-[#34425e]">{formatAdminDate(selected.createdAt)}</p></div></div>
            <div className="flex flex-wrap gap-2 border-t border-[#edf0f5] pt-4">
              <button className={buttonClass} disabled={busy} onClick={() => void updateCustomer(selected, { emailVerified: !selected.emailVerified })} type="button">{selected.emailVerified ? "Mark unverified" : "Mark email verified"}</button>
              <button className={`${selected.suspended ? primaryButtonClass : "inline-flex h-8 items-center justify-center rounded-md border border-rose-200 bg-white px-3 text-[10px] font-semibold text-rose-600 hover:bg-rose-50"} disabled:opacity-50`} disabled={busy} onClick={() => {
                const action = selected.suspended ? "restore access to" : "suspend";
                if (window.confirm(`Are you sure you want to ${action} ${selected.email}?`)) {
                  void updateCustomer(selected, { suspended: !selected.suspended });
                }
              }} type="button">{busy ? "Saving…" : selected.suspended ? "Restore access" : "Suspend account"}</button>
            </div>
            <p className="text-[8px] text-[#91a0b7]">Email verification status is an administrative record only; no verification email is sent.</p>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

type ServerRow = {
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

function ServersSection() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [actionId, setActionId] = useState("");
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const params = new URLSearchParams({ page: String(page), limit: "10", status });
  if (query.trim()) params.set("q", query.trim());
  const serversState = useAdminData<Page<{ servers: ServerRow[]; telemetryAvailable: boolean }>>(`/servers?${params}`);
  const dashboardState = useAdminData<DashboardPayload>("/dashboard");
  const data = serversState.data;
  const metrics = dashboardState.data?.metrics ?? null;
  const regions = dashboardState.data?.regions ?? [];
  const error = serversState.error || dashboardState.error || actionError;
  const loading = serversState.loading || dashboardState.loading;
  const refresh = () => {
    void serversState.refresh();
    void dashboardState.refresh();
  };
  const adminRequest = useAdminRequest();

  async function performAction(server: ServerRow, action: string) {
    if (!window.confirm(`${action === "delete" ? "Permanently delete" : `${action} the`} server "${server.name}"?`)) return;
    setActionId(server.id); setActionError(""); setNotice("");
    try {
      await adminRequest(`/servers/${encodeURIComponent(server.id)}/actions`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      setNotice(`Server ${action} request completed.`);
    } catch (reason) {
      setActionError(getApiErrorMessage(reason, "Unable to update this server."));
    } finally { setActionId(""); }
  }
  const servers = data?.servers ?? [];
  return (
    <>
      <SectionHeading title="Servers & Infrastructure" description="Monitor server records and manage supported cloud operations." action={<Link className={primaryButtonClass} href="/dashboard/deploy"><Server size={12} /> Provision Server</Link>} />
      {notice ? <p aria-live="polite" className="mb-3 text-[10px] text-emerald-700">{notice}</p> : null}
      {error ? <InlineError message={error} retry={refresh} /> : null}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Servers" value={metrics?.totalServers.toLocaleString() ?? "—"} detail="Saved cloud resources" icon={<Server size={14} />} />
        <MetricCard label="Running" value={metrics?.runningServers.toLocaleString() ?? "—"} detail="Reported active by provider" tone="green" />
        <MetricCard label="Stopped" value={metrics?.stoppedServers.toLocaleString() ?? "—"} detail="Reported stopped by provider" tone="amber" />
        <MetricCard label="Needs attention" value={metrics?.failedServers.toLocaleString() ?? "—"} detail="Failed server records" tone="red" />
      </div>
      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-[11px] font-bold text-[#263654]">All Servers</h2><p className="mt-1 text-[9px] text-[#91a0b7]">Manage server instances across customer workspaces.</p></div><div className="flex flex-wrap gap-2"><input aria-label="Search servers" className={`${inputClass} w-full sm:w-52`} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search server or customer" value={query} /><select aria-label="Filter server status" className={inputClass} onChange={(event) => { setStatus(event.target.value); setPage(1); }} value={status}><option value="all">All statuses</option><option value="ACTIVE">Running</option><option value="STOPPED">Stopped</option><option value="PROVISIONING">Provisioning</option><option value="FAILED">Failed</option></select><button aria-label="Refresh servers" className={buttonClass} onClick={refresh} type="button"><RefreshCw size={11} /> Refresh</button></div></div>
        {loading ? <LoadingPanel label="Loading server records…" /> : <Table headers={["Server", "Customer", "Region", "Plan", "Status", "Action"]} minWidth={830}>
          {servers.length ? servers.map((server) => (
            <tr key={server.id}>
              <td className="px-3 py-3"><p className="font-semibold text-[#263654]">{server.name}</p><p className="mt-0.5 text-[8px] text-[#91a0b7]">{server.providerResourceId || server.ipAddress || server.operatingSystem}</p></td>
              <td className="px-3 py-3"><p className="text-[#34425e]">{server.customer?.name || server.customer?.email || "Unknown customer"}</p><p className="text-[8px] text-[#91a0b7]">{server.organization}</p></td>
              <td className="px-3 py-3">{server.region}</td><td className="px-3 py-3">{server.servicePlan.name}</td>
              <td className="px-3 py-3"><StatusPill tone={server.status === "ACTIVE" ? "green" : server.status === "STOPPED" ? "slate" : server.status === "FAILED" ? "red" : "amber"}>{server.status}</StatusPill></td>
              <td className="px-3 py-3"><div className="flex items-center gap-1"><select aria-label={`Action for ${server.name}`} className={`${inputClass} h-7 px-2`} id={`action-${server.id}`} defaultValue=""><option disabled value="">Action</option><option value="reboot">Reboot</option><option value={server.status === "STOPPED" ? "power-on" : "power-off"}>{server.status === "STOPPED" ? "Start" : "Stop"}</option><option value="delete">Delete</option></select><button className={`${buttonClass} h-7 px-2`} disabled={actionId === server.id} onClick={() => {
                const select = document.getElementById(`action-${server.id}`) as HTMLSelectElement | null;
                if (select?.value) void performAction(server, select.value);
              }} type="button">{actionId === server.id ? "…" : "Run"}</button></div></td>
            </tr>
          )) : <tr><td className="px-3 py-8 text-center text-[#91a0b7]" colSpan={6}>No server records match these filters.</td></tr>}
        </Table>}
        {data ? <Pagination page={data.page} pages={data.pages} total={data.total} limit={data.limit} onChange={setPage} /> : null}
      </Panel>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel className="p-4 sm:p-5"><h2 className="text-[11px] font-bold text-[#263654]">Infrastructure Summary</h2><p className="mt-1 text-[9px] text-[#91a0b7]">Distribution of persisted resources by location</p><div className="mt-4 space-y-3">{regions.length ? regions.map(({ region, count }) => <div key={region}><div className="mb-1 flex justify-between text-[9px] text-[#52617b]"><span>{region}</span><span>{count} server{count === 1 ? "" : "s"}</span></div><div className="h-1.5 rounded-full bg-[#edf1f7]"><div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${Math.max(1, count / Math.max(1, metrics?.totalServers ?? 0) * 100)}%` }} /></div></div>) : <p className="text-[9px] text-[#91a0b7]">No cloud resources have been recorded.</p>}</div></Panel>
        <Panel className="p-4 sm:p-5"><h2 className="text-[11px] font-bold text-[#263654]">Infrastructure Alerts</h2><p className="mt-1 text-[9px] text-[#91a0b7]">Data availability</p><div className="mt-4 space-y-2"><Notice tone={data?.telemetryAvailable ? "blue" : "amber"}>{data?.telemetryAvailable ? "Provider telemetry is connected." : "CPU, RAM, bandwidth, uptime, and capacity telemetry are not available. Resource health is not inferred from placeholder values."}</Notice><Notice tone={metrics?.stoppedServers ? "amber" : "blue"}>{metrics?.stoppedServers ? `${metrics.stoppedServers} server(s) are stopped according to saved provider status.` : "No stopped servers are currently recorded."}</Notice></div></Panel>
      </div>
    </>
  );
}

type PlanRow = {
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

function PlansSection() {
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [mutationError, setMutationError] = useState("");
  const [notice, setNotice] = useState("");
  const state = useAdminData<{ plans: PlanRow[]; providerConfigured: boolean }>("/plans");
  const plans = state.data?.plans ?? [];
  const configured = state.data?.providerConfigured ?? false;
  const loading = state.loading;
  const error = state.error || mutationError;
  const refresh = state.refresh;
  const adminRequest = useAdminRequest();
  async function updatePlan(plan: PlanRow, update: { isActive?: boolean; customerPriceMinor?: number | null }) {
    setMutationError(""); setNotice("");
    try {
      await adminRequest(`/plans/${encodeURIComponent(plan.id)}`, { method: "PATCH", body: JSON.stringify(update) });
      setNotice(`${plan.name} was updated.`);
      if (update.customerPriceMinor !== undefined) {
        const priceMinor = update.customerPriceMinor;
        setPrices((current) => ({
          ...current,
          [plan.id]: priceMinor === null ? "" : (priceMinor / 100).toFixed(2),
        }));
      }
    } catch (reason) { setMutationError(getApiErrorMessage(reason, "Unable to update plan.")); }
  }
  const activePlans = plans.filter((plan) => plan.isActive).length;
  const average = plans.filter((plan) => plan.isActive).map((plan) => plan.customerPriceMinor ?? plan.priceMinor ?? 0);
  const averagePrice = average.length ? average.reduce((sum, value) => sum + value, 0) / average.length : 0;
  return (
    <>
      <SectionHeading title="Plans & Pricing" description="Manage plan availability and customer-facing prices for cloud plans." action={<button className={buttonClass} onClick={refresh} type="button"><RefreshCw size={11} /> Refresh plans</button>} />
      {notice ? <p aria-live="polite" className="mb-3 text-[10px] text-emerald-700">{notice}</p> : null}
      {error ? <InlineError message={error} retry={refresh} /> : null}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Plans" value={plans.length.toLocaleString()} detail="Provider plans synced to platform" icon={<Tags size={14} />} />
        <MetricCard label="Active Plans" value={activePlans.toLocaleString()} detail="Available for new deployments" tone="green" />
        <MetricCard label="Linked Servers" value={plans.reduce((sum, plan) => sum + plan._count.resources, 0).toLocaleString()} detail="Existing provisioned resources" />
        <MetricCard label="Average Monthly Price" value={formatAdminMoney(averagePrice)} detail="Across active plans" tone="blue" />
      </div>
      {!configured ? <div className="mb-4"><Notice tone="amber">Vultr is not configured. Existing database plans are shown, but new provider plans cannot be synchronized or deployed until VULTR_API_KEY is set.</Notice></div> : null}
      {loading ? <LoadingPanel label="Loading provider plans…" /> : (
        <Panel className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3.5"><div><h2 className="text-[11px] font-bold text-[#263654]">All Pricing Plans</h2><p className="mt-1 text-[9px] text-[#91a0b7]">Update customer prices or make plans unavailable for new deployments.</p></div></div>
          <Table headers={["Plan", "CPU / RAM", "Storage", "Provider price", "Customer price / month", "Linked servers", "Status", "Action"]} minWidth={960}>
            {plans.length ? plans.map((plan) => (
              <tr key={plan.id}>
                <td className="px-3 py-3"><p className="font-semibold text-[#263654]">{plan.name}</p><p className="mt-0.5 text-[8px] text-[#91a0b7]">{plan.provider} · {plan.providerPlanId}</p></td>
                <td className="px-3 py-3">{plan.cpuCores} vCPU / {(plan.memoryMb / 1024).toLocaleString(undefined, { maximumFractionDigits: 1 })} GB</td>
                <td className="px-3 py-3">{plan.diskGb} GB</td>
                <td className="px-3 py-3">{formatAdminMoney(plan.priceMinor ?? 0, plan.currency ?? "USD")}</td>
                <td className="px-3 py-3"><label className="flex items-center gap-1"><span className="sr-only">Customer monthly price for {plan.name}</span><span className="text-[#91a0b7]">$</span><input aria-label={`Customer price for ${plan.name}`} className={`${inputClass} h-7 w-24 px-2`} inputMode="decimal" onChange={(event) => setPrices((current) => ({ ...current, [plan.id]: event.target.value }))} placeholder={plan.priceMinor === null ? "—" : (plan.priceMinor / 100).toFixed(2)} value={prices[plan.id] ?? (plan.customerPriceMinor === null ? "" : (plan.customerPriceMinor / 100).toFixed(2))} /></label></td>
                <td className="px-3 py-3">{plan._count.resources}</td>
                <td className="px-3 py-3"><StatusPill tone={plan.isActive ? "green" : "slate"}>{plan.isActive ? "Active" : "Disabled"}</StatusPill></td>
                <td className="px-3 py-3"><div className="flex gap-1"><button className={buttonClass} onClick={() => {
                  const value = prices[plan.id]?.trim();
                  if (value && !/^\d+(\.\d{1,2})?$/.test(value)) { setMutationError("Enter a valid price with at most two decimal places."); return; }
                  void updatePlan(plan, { customerPriceMinor: value ? Math.round(Number(value) * 100) : null });
                }} type="button">Save price</button><button className={buttonClass} onClick={() => void updatePlan(plan, { isActive: !plan.isActive })} type="button">{plan.isActive ? "Disable" : "Enable"}</button></div></td>
              </tr>
            )) : <tr><td className="px-3 py-10 text-center text-[#91a0b7]" colSpan={8}>{configured ? "No valid provider plans are available." : "No plans are in the database yet."}</td></tr>}
          </Table>
        </Panel>
      )}
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel className="p-4"><h2 className="text-[11px] font-bold text-[#263654]">Pricing Configuration</h2><p className="mt-1 text-[9px] text-[#91a0b7]">Customer price overrides</p><div className="mt-3 space-y-2 text-[9px] text-[#52617b]"><div className="flex justify-between border-b border-[#f0f2f6] py-2"><span>Billing display</span><strong>Monthly</strong></div><div className="flex justify-between border-b border-[#f0f2f6] py-2"><span>Base provider price</span><strong>Synced from provider</strong></div><div className="flex justify-between py-2"><span>Override</span><strong>Optional per plan</strong></div></div></Panel>
        <Panel className="p-4"><h2 className="text-[11px] font-bold text-[#263654]">Plan Management Guidelines</h2><p className="mt-1 text-[9px] text-[#91a0b7]">Availability affects future deployments</p><div className="mt-3"><Notice tone="amber">Disabling a plan removes it from the customer deployment catalog. Existing servers are not changed. Customer price overrides are recorded on new service orders.</Notice></div></Panel>
      </div>
    </>
  );
}

type PaymentRow = {
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

function BillingSection() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ page: String(page), limit: "10", status });
  if (query.trim()) params.set("q", query.trim());
  const state = useAdminData<Page<{
    payments: PaymentRow[];
    summary: { revenueMinor: number; statuses: Array<{ status: string; count: number; amountMinor: number }> };
    stripeConfigured: boolean;
  }>>(`/billing?${params}`);
  const data = state.data;
  const error = state.error;
  const loading = state.loading;
  const refresh = state.refresh;
  const statusCount = (value: string) => data?.summary.statuses.find((item) => item.status === value)?.count ?? 0;
  const payments = data?.payments ?? [];
  return (
    <>
      <SectionHeading title="Billing & Payments" description="Review recorded customer payments and wallet transactions." action={<button className={buttonClass} onClick={refresh} type="button"><RefreshCw size={11} /> Refresh</button>} />
      {error ? <InlineError message={error} retry={refresh} /> : null}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Revenue" value={formatAdminMoney(data?.summary.revenueMinor ?? 0)} detail="Successful payments recorded" icon={<CircleDollarSign size={14} />} />
        <MetricCard label="Successful Payments" value={statusCount("SUCCEEDED").toLocaleString()} detail="Payment status succeeded" tone="green" />
        <MetricCard label="Pending Payments" value={statusCount("PENDING").toLocaleString()} detail="Awaiting provider confirmation" tone="amber" />
        <MetricCard label="Failed Payments" value={statusCount("FAILED").toLocaleString()} detail="Review payment provider status" tone="red" />
      </div>
      {!data?.stripeConfigured ? <div className="mb-4"><Notice tone="amber">Stripe is not fully configured. This console shows existing payment records; new checkout sessions and signed webhook processing require Stripe credentials.</Notice></div> : null}
      <div className="mb-3 flex flex-wrap gap-2">
        <input aria-label="Search payments" className={`${inputClass} w-full sm:w-60`} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search customer or payment ID" value={query} />
        <select aria-label="Filter payment status" className={inputClass} onChange={(event) => { setStatus(event.target.value); setPage(1); }} value={status}><option value="all">All statuses</option><option value="SUCCEEDED">Succeeded</option><option value="PENDING">Pending</option><option value="FAILED">Failed</option><option value="CANCELLED">Cancelled</option></select>
        <button className={`${buttonClass} ml-auto`} disabled={!payments.length} onClick={() => exportCsv("northstar-payments.csv", [["Payment", "Customer", "Workspace", "Date", "Amount", "Currency", "Status", "Checkout session", "Payment intent"], ...payments.map((payment) => [payment.id, payment.customer?.email ?? "", payment.organization, payment.createdAt, payment.amountMinor, payment.currency, payment.status, payment.stripeCheckoutSessionId ?? "", payment.stripePaymentIntentId ?? ""])])} type="button"><ArrowDownToLine size={11} /> Export CSV</button>
      </div>
      <Panel className="overflow-hidden">
        <div className="px-4 py-3.5"><h2 className="text-[11px] font-bold text-[#263654]">Recent Transactions</h2><p className="mt-1 text-[9px] text-[#91a0b7]">Payment history from the application database</p></div>
        {loading ? <LoadingPanel label="Loading payment records…" /> : <Table headers={["Payment", "Customer", "Date", "Method", "Amount", "Status"]} minWidth={820}>
          {payments.length ? payments.map((payment) => (
            <tr key={payment.id}>
              <td className="px-3 py-3"><p className="font-semibold text-[#263654]">{payment.id.slice(0, 12)}</p><p className="mt-0.5 text-[8px] text-[#91a0b7]">{payment.walletTransaction?.description ?? payment.organization}</p></td>
              <td className="px-3 py-3"><p>{payment.customer?.name || "Customer"}</p><p className="mt-0.5 text-[8px] text-[#91a0b7]">{payment.customer?.email ?? "Unknown"}</p></td>
              <td className="px-3 py-3">{formatAdminDate(payment.createdAt)}</td>
              <td className="px-3 py-3">{payment.stripePaymentIntentId ? `Stripe · ${payment.stripePaymentIntentId.slice(0, 10)}` : payment.stripeCheckoutSessionId ? "Stripe Checkout" : "Not recorded"}</td>
              <td className="px-3 py-3 font-semibold text-[#263654]">{formatAdminMoney(payment.amountMinor, payment.currency)}</td>
              <td className="px-3 py-3"><StatusPill tone={payment.status === "SUCCEEDED" ? "green" : payment.status === "FAILED" ? "red" : payment.status === "PENDING" ? "amber" : "slate"}>{payment.status}</StatusPill></td>
            </tr>
          )) : <tr><td className="px-3 py-9 text-center text-[#91a0b7]" colSpan={6}>No payment records match these filters.</td></tr>}
        </Table>}
        {data ? <Pagination page={data.page} pages={data.pages} total={data.total} limit={data.limit} onChange={setPage} /> : null}
      </Panel>
      <Panel className="mt-4 p-4">
        <h2 className="text-[11px] font-bold text-[#263654]">Billing & Refund Notes</h2>
        <div className="mt-3"><Notice tone="amber">Refunds, invoices, payment methods, and retry actions are not implemented. This view is read-only and never reports a refund or card detail that the application does not store.</Notice></div>
      </Panel>
    </>
  );
}

type TicketRow = {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string | null; email: string };
  organization: { name: string };
};

function SupportSection() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<TicketRow | null>(null);
  const [busyId, setBusyId] = useState("");
  const [mutationError, setMutationError] = useState("");
  const params = new URLSearchParams({ page: String(page), limit: "10", status });
  if (query.trim()) params.set("q", query.trim());
  const state = useAdminData<Page<{ tickets: TicketRow[] }>>(`/support/tickets?${params}`);
  const data = state.data;
  const error = state.error || mutationError;
  const loading = state.loading;
  const refresh = state.refresh;
  const adminRequest = useAdminRequest();
  async function updateTicket(ticket: TicketRow, change: { status?: string; priority?: string }) {
    setBusyId(ticket.id); setMutationError("");
    try {
      await adminRequest(`/support/tickets/${encodeURIComponent(ticket.id)}`, { method: "PATCH", body: JSON.stringify(change) });
      if (selected?.id === ticket.id) setSelected({ ...selected, ...change });
    } catch (reason) { setMutationError(getApiErrorMessage(reason, "Unable to update the ticket.")); }
    finally { setBusyId(""); }
  }
  const tickets = data?.tickets ?? [];
  return (
    <>
      <SectionHeading title="Support Tickets" description="Review customer issues and update ticket status and priority." action={<button className={buttonClass} onClick={refresh} type="button"><RefreshCw size={11} /> Refresh</button>} />
      {error ? <InlineError message={error} retry={refresh} /> : null}
      <div className="mb-3 flex flex-wrap gap-2">
        <input aria-label="Search support tickets" className={`${inputClass} w-full sm:w-60`} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search ticket or customer" value={query} />
        <select aria-label="Filter ticket status" className={inputClass} onChange={(event) => { setStatus(event.target.value); setPage(1); }} value={status}><option value="all">All statuses</option><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></select>
      </div>
      <Panel className="overflow-hidden">
        <div className="px-4 py-3.5"><h2 className="text-[11px] font-bold text-[#263654]">All Support Requests</h2><p className="mt-1 text-[9px] text-[#91a0b7]">Status and priority updates are recorded on the ticket.</p></div>
        {loading ? <LoadingPanel label="Loading support tickets…" /> : <Table headers={["Ticket", "Customer", "Category", "Priority", "Created", "Status", "Action"]} minWidth={900}>
          {tickets.length ? tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td className="px-3 py-3"><p className="max-w-56 truncate font-semibold text-[#263654]">{ticket.subject}</p><p className="mt-0.5 text-[8px] text-[#91a0b7]">#{ticket.id.slice(-8)}</p></td>
              <td className="px-3 py-3"><p>{ticket.user.name || "Customer"}</p><p className="text-[8px] text-[#91a0b7]">{ticket.user.email}</p></td>
              <td className="px-3 py-3">{ticket.category}</td>
              <td className="px-3 py-3"><select aria-label={`Priority for ${ticket.subject}`} className={`${inputClass} h-7 px-2`} disabled={busyId === ticket.id} onChange={(event) => void updateTicket(ticket, { priority: event.target.value })} value={ticket.priority}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></td>
              <td className="px-3 py-3">{formatAdminDate(ticket.createdAt)}</td>
              <td className="px-3 py-3"><select aria-label={`Status for ${ticket.subject}`} className={`${inputClass} h-7 px-2`} disabled={busyId === ticket.id} onChange={(event) => void updateTicket(ticket, { status: event.target.value })} value={ticket.status}><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></select></td>
              <td className="px-3 py-3"><button className={buttonClass} onClick={() => setSelected(ticket)} type="button">Details</button></td>
            </tr>
          )) : <tr><td className="px-3 py-9 text-center text-[#91a0b7]" colSpan={7}>No support tickets match these filters.</td></tr>}
        </Table>}
        {data ? <Pagination page={data.page} pages={data.pages} total={data.total} limit={data.limit} onChange={setPage} /> : null}
      </Panel>
      <div className="mt-4"><Notice tone="amber">Ticket replies and email notifications are not configured. Status updates are saved, but customers will not receive a reply from this console.</Notice></div>
      {selected ? <Modal title="Support ticket details" close={() => setSelected(null)}><div className="space-y-3 text-[10px]"><div><p className="text-[8px] font-semibold uppercase text-[#91a0b7]">Subject</p><p className="mt-1 font-semibold text-[#263654]">{selected.subject}</p></div><div className="grid grid-cols-2 gap-3"><div><p className="text-[8px] font-semibold uppercase text-[#91a0b7]">Customer</p><p className="mt-1">{selected.user.name || "Customer"}</p><p className="text-[#8290a8]">{selected.user.email}</p></div><div><p className="text-[8px] font-semibold uppercase text-[#91a0b7]">Workspace</p><p className="mt-1">{selected.organization.name}</p></div><div><p className="text-[8px] font-semibold uppercase text-[#91a0b7]">Category / priority</p><p className="mt-1">{selected.category} · {selected.priority}</p></div><div><p className="text-[8px] font-semibold uppercase text-[#91a0b7]">Status</p><p className="mt-1">{selected.status.replaceAll("_", " ")}</p></div></div><div className="border-t border-[#edf0f5] pt-3"><p className="text-[8px] font-semibold uppercase text-[#91a0b7]">Description</p><p className="mt-2 whitespace-pre-wrap leading-5 text-[#52617b]">{selected.description}</p></div></div></Modal> : null}
    </>
  );
}

type SecurityEvent = {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: { name: string | null; email: string } | null;
};

type SecurityLogResponse = {
  events: SecurityEvent[];
  metrics: {
    eventsLast24Hours: number;
    activeSessions: number;
    failedLoginAttempts: number | null;
    ipAddressTracking: boolean;
  };
};

function SecuritySection() {
  const [query, setQuery] = useState("");
  const params = new URLSearchParams({ limit: "50" });
  if (query.trim()) params.set("q", query.trim());
  const state = useAdminData<SecurityLogResponse>(`/security/logs?${params}`);
  const data = state.data;
  const loading = state.loading;
  const error = state.error;
  const refresh = state.refresh;
  const events = data?.events ?? [];
  return (
    <>
      <SectionHeading title="Security & Logs" description="Review recorded audit activity and current account sessions." action={<button className={buttonClass} onClick={refresh} type="button"><RefreshCw size={11} /> Refresh</button>} />
      {error ? <InlineError message={error} retry={refresh} /> : null}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Audit Events · 24h" value={data?.metrics.eventsLast24Hours.toLocaleString() ?? "—"} detail="Recorded changes across platform" icon={<Activity size={14} />} />
        <MetricCard label="Failed Login Attempts" value={data ? "Not collected" : "—"} detail="Authentication failures are not logged" tone="amber" />
        <MetricCard label="Active Sessions" value={data?.metrics.activeSessions.toLocaleString() ?? "—"} detail="Unexpired sessions for active accounts" tone="green" />
        <MetricCard label="IP Tracking" value={data ? "Unavailable" : "—"} detail="Client IP is not stored in audit records" tone="amber" />
      </div>
      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-[11px] font-bold text-[#263654]">Security Event Log</h2><p className="mt-1 text-[9px] text-[#91a0b7]">Recorded audit events. This is not a failed-login or intrusion-monitoring feed.</p></div><div className="flex flex-wrap gap-2"><input aria-label="Search audit events" className={`${inputClass} w-full sm:w-64`} onChange={(event) => setQuery(event.target.value)} placeholder="Search event, user, or resource" value={query} /><button className={buttonClass} disabled={!events.length} onClick={() => exportCsv("northstar-audit-log.csv", [["Event", "Actor", "Resource", "Resource ID", "Date"], ...events.map((event) => [event.action, event.actor?.email ?? "System", event.resourceType, event.resourceId ?? "", event.createdAt])])} type="button"><ArrowDownToLine size={11} /> Export logs</button></div></div>
        {loading ? <LoadingPanel label="Loading audit events…" /> : <Table headers={["Event", "User / Actor", "Resource", "Time", "Status"]} minWidth={740}>
          {events.length ? events.map((event) => (
            <tr key={event.id}><td className="px-3 py-3"><p className="font-semibold text-[#263654]">{event.action.replaceAll("_", " ")}</p><p className="mt-0.5 text-[8px] text-[#91a0b7]">{event.id}</p></td><td className="px-3 py-3">{event.actor?.email ?? "System"}</td><td className="px-3 py-3">{event.resourceType}{event.resourceId ? ` · ${event.resourceId.slice(0, 8)}` : ""}</td><td className="px-3 py-3">{new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(event.createdAt))}</td><td className="px-3 py-3"><StatusPill tone="blue">Recorded</StatusPill></td></tr>
          )) : <tr><td className="px-3 py-9 text-center text-[#91a0b7]" colSpan={5}>No audit events have been recorded.</td></tr>}
        </Table>}
        <div className="border-t border-[#eef1f5] px-3 py-3 text-[9px] text-[#91a0b7]">Showing up to {events.length} matching audit events.</div>
      </Panel>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel className="p-4 sm:p-5"><h2 className="text-[11px] font-bold text-[#263654]">Event Breakdown</h2><p className="mt-1 text-[9px] text-[#91a0b7]">Categories in the current result set</p><div className="mt-4 space-y-3">{Object.entries(events.reduce<Record<string, number>>((groups, event) => { groups[event.resourceType] = (groups[event.resourceType] ?? 0) + 1; return groups; }, {})).slice(0, 5).map(([category, count]) => <div key={category}><div className="mb-1 flex justify-between text-[9px] text-[#52617b]"><span>{category}</span><span>{count}</span></div><div className="h-1.5 rounded-full bg-[#edf1f7]"><div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${count / Math.max(1, events.length) * 100}%` }} /></div></div>)}</div></Panel>
        <Panel className="p-4 sm:p-5"><h2 className="text-[11px] font-bold text-[#263654]">Monitoring Coverage</h2><p className="mt-1 text-[9px] text-[#91a0b7]">Data currently persisted by the application</p><div className="mt-3 space-y-2"><Notice>Audit actions and actor IDs are stored and searchable.</Notice><Notice tone="amber">Authentication failures, IP addresses, device fingerprints, and automated threat detection are not collected.</Notice></div></Panel>
      </div>
    </>
  );
}

type SettingsData = {
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

function SettingsSection() {
  const [draft, setDraft] = useState<SettingsData | null>(null);
  const [saving, setSaving] = useState(false);
  const [mutationError, setMutationError] = useState("");
  const [notice, setNotice] = useState("");
  const state = useAdminData<{ settings: SettingsData }>("/settings");
  const settings = draft ?? state.data?.settings ?? null;
  const loading = state.loading;
  const error = state.error || mutationError;
  const refresh = state.refresh;
  const adminRequest = useAdminRequest();

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings) return;
    setSaving(true); setMutationError(""); setNotice("");
    try {
      const { settings: updated } = await adminRequest<{ settings: SettingsData }>("/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      setDraft(updated);
      setNotice("Platform settings saved.");
    } catch (reason) { setMutationError(getApiErrorMessage(reason, "Unable to save platform settings.")); }
    finally { setSaving(false); }
  }
  function setValue<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    if (settings) setDraft({ ...settings, [key]: value });
  }
  function discardChanges() {
    setDraft(null);
    void refresh();
  }
  if (loading) return <><SectionHeading title="Settings" description="Manage platform identity, defaults, and maintenance mode." /><LoadingPanel label="Loading platform settings…" /></>;
  if (!settings) return <><SectionHeading title="Settings" description="Manage platform identity, defaults, and maintenance mode." />{error ? <InlineError message={error} retry={refresh} /> : null}</>;
  const labelClass = "mb-1.5 block text-[9px] font-semibold text-[#52617b]";
  return (
    <>
      <SectionHeading title="Settings" description="Manage platform identity, defaults, and maintenance mode." />
      {error ? <div className="mb-3"><InlineError message={error} retry={refresh} /></div> : null}
      {notice ? <p aria-live="polite" className="mb-3 text-[10px] font-medium text-emerald-700">{notice}</p> : null}
      <form className="space-y-4" onSubmit={(event) => void save(event)}>
        <Panel className="overflow-hidden">
          <header className="border-b border-[#edf0f5] px-4 py-3.5"><h2 className="text-[11px] font-bold text-[#263654]">General Settings</h2><p className="mt-1 text-[9px] text-[#91a0b7]">Manage platform identity and default preferences.</p></header>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <label><span className={labelClass}>Platform Name</span><input className={`${inputClass} w-full`} maxLength={100} onChange={(event) => setValue("platformName", event.target.value)} required value={settings.platformName} /></label>
            <label><span className={labelClass}>Support Email</span><input className={`${inputClass} w-full`} onChange={(event) => setValue("supportEmail", event.target.value)} type="email" value={settings.supportEmail} /></label>
            <label><span className={labelClass}>Default Region</span><input className={`${inputClass} w-full`} maxLength={80} onChange={(event) => setValue("defaultRegion", event.target.value)} placeholder="e.g. ewr" value={settings.defaultRegion} /></label>
            <label><span className={labelClass}>Default Currency</span><input aria-label="Default currency" className={`${inputClass} w-full bg-[#f8f9fc]`} readOnly value={`${settings.defaultCurrency} — US Dollar (only supported currency)`} /></label>
            <label><span className={labelClass}>Timezone</span><input className={`${inputClass} w-full`} maxLength={80} onChange={(event) => setValue("timezone", event.target.value)} required value={settings.timezone} /></label>
            <label><span className={labelClass}>Language</span><select className={`${inputClass} w-full`} onChange={(event) => setValue("language", event.target.value as SettingsData["language"])} value={settings.language}><option value="en-US">English (United States)</option><option value="en-GB">English (United Kingdom)</option></select></label>
          </div>
        </Panel>
        <Panel className="overflow-hidden">
          <header className="border-b border-[#edf0f5] px-4 py-3.5"><h2 className="text-[11px] font-bold text-[#263654]">Maintenance</h2><p className="mt-1 text-[9px] text-[#91a0b7]">Temporarily restrict customer portal access during planned work.</p></header>
          <div className="space-y-4 p-4">
            <label className="flex items-start justify-between gap-4"><span><span className="block text-[9px] font-semibold text-[#34425e]">Maintenance Mode</span><span className="mt-1 block text-[8px] text-[#91a0b7]">Blocks authenticated customer API access. Admin console remains available.</span></span><input aria-label="Enable maintenance mode" checked={settings.maintenanceMode} className="mt-0.5 size-4 accent-blue-600" onChange={(event) => setValue("maintenanceMode", event.target.checked)} type="checkbox" /></label>
            <label className="block"><span className={labelClass}>Maintenance Notice</span><textarea className={`${inputClass} h-20 w-full resize-y py-2`} maxLength={500} onChange={(event) => setValue("maintenanceNotice", event.target.value)} placeholder="We are performing scheduled maintenance. Please try again later." value={settings.maintenanceNotice} /></label>
            <Notice tone={settings.maintenanceMode ? "amber" : "blue"}>{settings.maintenanceMode ? "Maintenance mode is enabled. Customer API requests will receive HTTP 503." : "Maintenance mode is currently disabled."} Settings changes are persisted to the platform database.</Notice>
          </div>
          <footer className="flex justify-end gap-2 border-t border-[#edf0f5] px-4 py-3"><button className={buttonClass} onClick={discardChanges} type="button">Discard</button><button className={primaryButtonClass} disabled={saving} type="submit">{saving ? "Saving…" : "Save Settings"}</button></footer>
        </Panel>
      </form>
      <Panel className="mt-4 overflow-hidden border-rose-200">
        <header className="border-b border-rose-100 px-4 py-3.5"><h2 className="text-[11px] font-bold text-rose-600">Integrations & Security</h2><p className="mt-1 text-[9px] text-[#91a0b7]">These capabilities must be configured on the backend.</p></header>
        <div className="grid gap-3 p-4 sm:grid-cols-2">
          <Notice tone="amber">Email delivery, password recovery, email verification, and support replies require SMTP integration; SMTP credentials are intentionally not collected here.</Notice>
          <Notice tone="amber">Two-factor authentication and login-alert emails are not implemented. No security setting in this section claims to enable them.</Notice>
        </div>
      </Panel>
    </>
  );
}

export function AdminSectionContent({ section }: { section: AdminSection }) {
  switch (section) {
    case "overview": return <AdminOverview />;
    case "customers": return <CustomersSection />;
    case "servers": return <ServersSection />;
    case "plans": return <PlansSection />;
    case "billing": return <BillingSection />;
    case "support": return <SupportSection />;
    case "security": return <SecuritySection />;
    case "settings": return <SettingsSection />;
  }
}
