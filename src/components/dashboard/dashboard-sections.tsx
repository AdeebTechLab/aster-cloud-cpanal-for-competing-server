"use client";

import {
  Check,
  CircleHelp,
  LockKeyhole,
  Plus,
  Search,
  Server,
  Shield,
  Ticket,
  Trash2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { formatDate, formatMoney, type CustomerAccount, type CustomerServer } from "./dashboard-api";
import { useAppDispatch } from "@/lib/redux/hooks";
import {
  getApiErrorMessage,
  platformApi,
  useGetCustomerDataQuery,
} from "@/lib/redux/platformApi";
import {
  DashboardHeading,
  DashboardMetric,
  DashboardPanel,
  DashboardPreviewNotice,
  DashboardStatus,
  DashboardTable,
} from "./dashboard-ui";

type DataState<T> = {
  data: T | null;
  loading: boolean;
  error: string;
  reload: () => void;
};

function useCustomerData<T>(path: string): DataState<T> {
  const query = useGetCustomerDataQuery(path);
  return {
    data: (query.data as T | undefined) ?? null,
    loading: query.isLoading || query.isFetching,
    error: query.error ? getApiErrorMessage(query.error, "Unable to load this section.") : "",
    reload: query.refetch,
  };
}

function useCustomerRequest() {
  const dispatch = useAppDispatch();
  return useCallback(
    <T,>(path: string, init: RequestInit = {}) =>
      dispatch(platformApi.endpoints.runCustomerRequest.initiate({
        path,
        method: init.method,
        body: typeof init.body === "string" ? init.body : undefined,
      })).unwrap() as Promise<T>,
    [dispatch],
  );
}

function SectionState({
  loading,
  error,
  onRetry,
}: {
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  if (loading) {
    return <DashboardPanel><p className="text-sm text-[#8290a8]">Loading account data…</p></DashboardPanel>;
  }
  if (error) {
    return (
      <DashboardPanel>
        <p className="text-sm font-semibold text-rose-700">Could not load this section</p>
        <p className="mt-1 text-xs text-[#8290a8]">{error}</p>
        <button className="mt-3 text-xs font-semibold text-blue-600" onClick={onRetry} type="button">Try again</button>
      </DashboardPanel>
    );
  }
  return null;
}

function Notice({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "green" | "amber" | "red" }) {
  const colors = {
    blue: "border-blue-100 bg-blue-50 text-blue-900",
    green: "border-emerald-100 bg-emerald-50 text-emerald-900",
    amber: "border-amber-100 bg-amber-50 text-amber-900",
    red: "border-rose-100 bg-rose-50 text-rose-900",
  };
  return <p className={`rounded-xl border px-4 py-3 text-xs leading-5 ${colors[tone]}`}>{children}</p>;
}

function SubmitButton({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <button
      className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-3.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      type="submit"
    >
      {children}
    </button>
  );
}

function DeployPage() {
  const customerRequest = useCustomerRequest();
  const plansState = useCustomerData<{ plans: Array<{ id: string; name: string; cpuCores: number; memoryMb: number; diskGb: number; priceMinor: number | null; currency: string | null; provider: string }> }>("/plans");
  const optionsState = useCustomerData<{
    regions: Array<{ id: string; city: string; country: string }>;
    operatingSystems: Array<{ id: number; name: string; family: string; arch: string }>;
    defaultRegion: string;
  }>("/provider/options");
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [operatingSystemId, setOperatingSystemId] = useState("");
  const [planId, setPlanId] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      await customerRequest("/servers", {
        method: "POST",
        body: JSON.stringify({ name, region, operatingSystemId, servicePlanId: planId }),
      });
      setMessage("Deployment request submitted.");
      setName("");
      plansState.reload();
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Unable to deploy this server."));
    } finally {
      setSubmitting(false);
    }
  }

  const plans = plansState.data?.plans ?? [];
  const defaultRegion = optionsState.data?.regions.some((item) => item.id === optionsState.data?.defaultRegion)
    ? optionsState.data?.defaultRegion ?? ""
    : "";

  return (
    <>
      <DashboardHeading description="Configure a cloud instance for your workload." eyebrow="Workspace / Services" title="Deploy a New Server" />
      <DashboardPreviewNotice />
      {plansState.error ? <Notice tone="red">{plansState.error}</Notice> : null}
      {optionsState.error ? <div className="mb-4"><Notice tone="amber">{optionsState.error}</Notice></div> : null}
      {message ? <div className="mb-4"><Notice tone={message.includes("unavailable") ? "amber" : "green"}>{message}</Notice></div> : null}
      {!plansState.loading && !plans.length ? (
        <div className="mb-4"><Notice tone="amber">No active server plans are available. Configure a cloud provider and activate its service plans before deployment.</Notice></div>
      ) : null}
      <form className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]" onSubmit={(event) => void submit(event)}>
        <div className="space-y-4">
          <DashboardPanel>
            <h2 className="text-sm font-bold text-[#1d2b48]">1. Choose a server location</h2>
            <p className="mt-1 text-[11px] text-[#8a96aa]">Choose a region available to your configured provider.</p>
            <label className="mt-4 block text-[11px] font-medium text-[#52617b]">Region
              <select className="mt-2 h-10 w-full rounded-xl border border-[#e7ebf3] bg-white px-3 text-xs outline-none focus:border-blue-300" onChange={(event) => setRegion(event.target.value)} required value={region || defaultRegion}>
                <option value="">Select a region</option>
                {(optionsState.data?.regions ?? []).map((item) => <option key={item.id} value={item.id}>{item.city}, {item.country} ({item.id})</option>)}
              </select>
            </label>
          </DashboardPanel>
          <DashboardPanel>
            <h2 className="text-sm font-bold text-[#1d2b48]">2. Operating system</h2>
            <label className="mt-4 block text-[11px] font-medium text-[#52617b]">Image / OS
              <select className="mt-2 h-10 w-full rounded-xl border border-[#e7ebf3] bg-white px-3 text-xs outline-none focus:border-blue-300" onChange={(event) => setOperatingSystemId(event.target.value)} required value={operatingSystemId}>
                <option value="">Select an operating system</option>
                {(optionsState.data?.operatingSystems ?? []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
          </DashboardPanel>
          <DashboardPanel>
            <h2 className="text-sm font-bold text-[#1d2b48]">3. Choose a server plan</h2>
            {plansState.loading ? <p className="mt-3 text-xs text-[#8290a8]">Loading available plans…</p> : null}
            {!plansState.loading && plans.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {plans.map((plan) => (
                  <label className={`cursor-pointer rounded-xl border p-4 ${planId === plan.id ? "border-blue-400 bg-blue-50/50" : "border-[#e8edf5] hover:border-blue-200"}`} key={plan.id}>
                    <input className="sr-only" checked={planId === plan.id} name="plan" onChange={() => setPlanId(plan.id)} required type="radio" value={plan.id} />
                    <span className="block text-xs font-semibold text-[#34425e]">{plan.name}</span>
                    <span className="mt-1 block text-[10px] text-[#8a96aa]">{plan.cpuCores} vCPU · {Math.round(plan.memoryMb / 1024)} GB RAM · {plan.diskGb} GB</span>
                    <span className="mt-3 block text-sm font-bold text-[#172340]">{plan.priceMinor === null ? "Price unavailable" : formatMoney(plan.priceMinor, plan.currency ?? "USD")}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </DashboardPanel>
          <DashboardPanel>
            <h2 className="text-sm font-bold text-[#1d2b48]">4. Identify your server</h2>
            <label className="mt-4 block text-[11px] font-medium text-[#52617b]">Server name
              <input className="mt-2 h-10 w-full rounded-xl border border-[#e7ebf3] px-3 text-xs outline-none focus:border-blue-300" maxLength={80} onChange={(event) => setName(event.target.value)} placeholder="e.g. web-prod-01" required value={name} />
            </label>
          </DashboardPanel>
        </div>
        <DashboardPanel className="xl:sticky xl:top-24">
          <h2 className="text-sm font-bold text-[#1d2b48]">Deployment request</h2>
          <p className="mt-1 text-[11px] text-[#8a96aa]">Requests are accepted only when a provider and plan are active.</p>
          <div className="my-5 border-t border-[#edf0f5] pt-4">
            <p className="text-[10px] text-[#8290a8]">Selected configuration</p>
            <p className="mt-2 text-xs font-semibold text-[#34425e]">{plans.find((plan) => plan.id === planId)?.name ?? "Select an active plan"}</p>
            <p className="mt-1 text-[10px] text-[#8290a8]">{name || "Server name"} · {region || "Region"}</p>
          </div>
          <SubmitButton disabled={submitting || !plans.length || !planId}>
            <Plus size={14} /> {submitting ? "Submitting…" : "Deploy server"}
          </SubmitButton>
          <p className="mt-3 text-[10px] leading-4 text-[#8a96aa]">Provider API integration is required before provisioning can run.</p>
        </DashboardPanel>
      </form>
    </>
  );
}

type SshKey = { id: string; name: string; keyType: string; fingerprint: string; createdAt: string; linkedServers: number };
function SshKeysPage() {
  const customerRequest = useCustomerRequest();
  const state = useCustomerData<{ keys: SshKey[] }>("/ssh-keys");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function createKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await customerRequest("/ssh-keys", {
        method: "POST",
        body: JSON.stringify({ name: form.get("name"), publicKey: form.get("publicKey") }),
      });
      formElement.reset();
      state.reload();
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Unable to add this key."));
    } finally {
      setSaving(false);
    }
  }

  async function revokeKey(key: SshKey) {
    if (!window.confirm(`Revoke SSH key "${key.name}"?`)) return;
    setError("");
    try {
      await customerRequest(`/ssh-keys/${encodeURIComponent(key.id)}`, { method: "DELETE" });
      state.reload();
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Unable to revoke this key."));
    }
  }

  return (
    <>
      <DashboardHeading description="Manage secure SSH authentication keys for your cloud servers." eyebrow="Workspace / Security" title="SSH Keys" />
      <DashboardPreviewNotice />
      <DashboardPanel className="mb-4 border-blue-100 bg-blue-50/70">
        <div className="flex gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700"><LockKeyhole size={17} /></span><div><h2 className="text-xs font-bold text-[#263654]">Secure access to your servers</h2><p className="mt-1 text-[11px] leading-5 text-[#71809a]">Only public SSH keys are stored. Private keys should never be uploaded.</p></div></div>
      </DashboardPanel>
      {error ? <div className="mb-4"><Notice tone="red">{error}</Notice></div> : null}
      <SectionState error={state.error} loading={state.loading} onRetry={state.reload} />
      {!state.loading && !state.error ? (
        <DashboardPanel className="mb-4">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold text-[#1d2b48]">Your SSH keys</h2><span className="text-[10px] text-[#96a1b4]">{state.data?.keys.length ?? 0} keys</span></div>
          {state.data?.keys.length ? <DashboardTable headers={["Key name", "Type", "Fingerprint", "Linked servers", "Created", "Action"]} rows={state.data.keys.map((key) => [<span className="font-semibold" key={`${key.id}-name`}>{key.name}</span>, key.keyType, <span className="font-mono text-[10px]" key={`${key.id}-fingerprint`}>{key.fingerprint}</span>, key.linkedServers, formatDate(key.createdAt), <button aria-label={`Revoke ${key.name}`} className="text-rose-600 hover:text-rose-800" key={`${key.id}-remove`} onClick={() => void revokeKey(key)} type="button"><Trash2 size={14} /></button>])} /> : <p className="py-8 text-center text-xs text-[#8290a8]">No SSH keys have been added.</p>}
        </DashboardPanel>
      ) : null}
      <DashboardPanel>
        <h2 className="text-sm font-bold text-[#1d2b48]">Add a new SSH key</h2>
        <p className="mt-1 text-[11px] text-[#8a96aa]">Register a public key using OpenSSH format.</p>
        <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={(event) => void createKey(event)}>
          <label className="text-[11px] font-medium text-[#52617b]">Key name<input className="mt-2 h-10 w-full rounded-xl border border-[#e7ebf3] px-3 text-xs" maxLength={80} name="name" placeholder="e.g. My Laptop Key" required /></label>
          <label className="text-[11px] font-medium text-[#52617b] sm:col-span-2">Public key<textarea className="mt-2 min-h-24 w-full rounded-xl border border-[#e7ebf3] p-3 font-mono text-xs" maxLength={16384} name="publicKey" placeholder="ssh-ed25519 AAAA… optional-comment" required /></label>
          <div className="sm:col-span-2"><SubmitButton disabled={saving}><Plus size={14} /> {saving ? "Adding…" : "Add public key"}</SubmitButton></div>
        </form>
      </DashboardPanel>
    </>
  );
}

type FirewallRule = { id: string; direction: string; protocol: string; port: string; source: string; action: string; description: string | null };
type FirewallGroup = { id: string; name: string; description: string | null; rules: FirewallRule[]; _count: { resources: number } };
function FirewallPage() {
  const customerRequest = useCustomerRequest();
  const state = useCustomerData<{ groups: FirewallGroup[] }>("/firewall/groups");
  const [error, setError] = useState("");

  async function createGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await customerRequest("/firewall/groups", { method: "POST", body: JSON.stringify({ name: form.get("name"), description: form.get("description") }) });
      formElement.reset();
      state.reload();
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Unable to create the group."));
    }
  }

  async function createRule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const groupId = String(form.get("groupId") ?? "");
    try {
      await customerRequest(`/firewall/groups/${encodeURIComponent(groupId)}/rules`, {
        method: "POST",
        body: JSON.stringify({
          direction: form.get("direction"),
          protocol: form.get("protocol"),
          port: form.get("port"),
          source: form.get("source"),
          action: form.get("action"),
          description: form.get("description"),
        }),
      });
      formElement.reset();
      state.reload();
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Unable to add this rule."));
    }
  }

  async function deleteGroup(group: FirewallGroup) {
    if (!window.confirm(`Delete firewall group "${group.name}"?`)) return;
    try {
      await customerRequest(`/firewall/groups/${encodeURIComponent(group.id)}`, { method: "DELETE" });
      state.reload();
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Unable to delete this group."));
    }
  }

  async function deleteRule(groupId: string, rule: FirewallRule) {
    try {
      await customerRequest(`/firewall/groups/${encodeURIComponent(groupId)}/rules/${encodeURIComponent(rule.id)}`, { method: "DELETE" });
      state.reload();
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Unable to delete this rule."));
    }
  }

  const groups = state.data?.groups ?? [];
  const totalRules = groups.reduce((count, group) => count + group.rules.length, 0);
  return (
    <>
      <DashboardHeading description="Manage firewall policies stored for your workspace." eyebrow="Workspace / Security" title="Firewall" />
      <div className="mb-4"><DashboardPreviewNotice /></div>
      <div className="mb-4"><Notice tone="amber">Firewall policies are stored in your account but are not enforced on servers until a cloud provider integration is connected.</Notice></div>
      {error ? <div className="mb-4"><Notice tone="red">{error}</Notice></div> : null}
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <DashboardMetric detail="Saved in your workspace" icon={<Shield size={17} />} label="Firewall groups" value={String(groups.length)} />
        <DashboardMetric detail="Saved rules" icon={<Check size={17} />} label="Rules" tone="green" value={String(totalRules)} />
        <DashboardMetric detail="Enforcement requires a provider" icon={<Server size={17} />} label="Protected services" tone="amber" value="0" />
      </div>
      <SectionState error={state.error} loading={state.loading} onRetry={state.reload} />
      {!state.loading && !state.error ? (
        <DashboardPanel className="mb-4">
          <div className="mb-4 flex items-center justify-between"><div><h2 className="text-sm font-bold text-[#1d2b48]">Firewall groups</h2><p className="mt-1 text-[11px] text-[#8a96aa]">Create and maintain policy groups.</p></div></div>
          {groups.length ? <div className="grid gap-3 md:grid-cols-3">{groups.map((group) => <div className="rounded-xl border border-[#e8edf5] p-4" key={group.id}><div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold text-[#34425e]">{group.name}</p><button aria-label={`Delete ${group.name}`} className="text-rose-500" onClick={() => void deleteGroup(group)} type="button"><Trash2 size={14} /></button></div><p className="mt-2 text-[10px] text-[#8290a8]">{group.rules.length} rules · {group._count.resources} linked services</p>{group.description ? <p className="mt-2 text-[10px] text-[#8290a8]">{group.description}</p> : null}</div>)}</div> : <p className="py-5 text-center text-xs text-[#8290a8]">No firewall groups created.</p>}
          <form className="mt-5 grid gap-3 border-t border-[#edf0f5] pt-5 sm:grid-cols-[1fr_2fr_auto]" onSubmit={(event) => void createGroup(event)}>
            <input aria-label="Firewall group name" className="h-10 rounded-xl border border-[#e7ebf3] px-3 text-xs" maxLength={80} name="name" placeholder="Group name" required />
            <input aria-label="Firewall group description" className="h-10 rounded-xl border border-[#e7ebf3] px-3 text-xs" maxLength={240} name="description" placeholder="Description (optional)" />
            <SubmitButton><Plus size={13} /> Create group</SubmitButton>
          </form>
        </DashboardPanel>
      ) : null}
      {!state.loading && !state.error && groups.length ? (
        <DashboardPanel>
          <h2 className="text-sm font-bold text-[#1d2b48]">Add firewall rule</h2>
          <form className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" onSubmit={(event) => void createRule(event)}>
            <select aria-label="Firewall group" className="h-10 rounded-xl border border-[#e7ebf3] bg-white px-3 text-xs" name="groupId" required>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select>
            <select aria-label="Direction" className="h-10 rounded-xl border border-[#e7ebf3] bg-white px-3 text-xs" name="direction"><option value="INBOUND">Inbound</option><option value="OUTBOUND">Outbound</option></select>
            <select aria-label="Protocol" className="h-10 rounded-xl border border-[#e7ebf3] bg-white px-3 text-xs" name="protocol"><option>TCP</option><option>UDP</option><option>ICMP</option></select>
            <input aria-label="Port or range" className="h-10 rounded-xl border border-[#e7ebf3] px-3 text-xs" name="port" placeholder="Port or range (e.g. 443)" required />
            <input aria-label="Source CIDR" className="h-10 rounded-xl border border-[#e7ebf3] px-3 text-xs" name="source" placeholder="Source CIDR (e.g. 0.0.0.0/0)" required />
            <select aria-label="Rule action" className="h-10 rounded-xl border border-[#e7ebf3] bg-white px-3 text-xs" name="action"><option value="ALLOW">Allow</option><option value="DENY">Deny</option></select>
            <input aria-label="Rule description" className="h-10 rounded-xl border border-[#e7ebf3] px-3 text-xs sm:col-span-2" name="description" placeholder="Description (optional)" />
            <div><SubmitButton><Plus size={13} /> Save rule</SubmitButton></div>
          </form>
          <div className="mt-5 space-y-4">
            {groups.map((group) => group.rules.length ? <div key={group.id}><h3 className="mb-2 text-xs font-semibold text-[#52617b]">{group.name}</h3><DashboardTable headers={["Direction", "Protocol", "Port", "Source", "Action", "Description", ""]} rows={group.rules.map((rule) => [rule.direction, rule.protocol, rule.port, rule.source, rule.action, rule.description ?? "—", <button aria-label={`Delete ${rule.protocol} ${rule.port} rule`} className="text-rose-600 hover:text-rose-800" key={`${rule.id}-delete`} onClick={() => void deleteRule(group.id, rule)} type="button"><Trash2 size={13} /></button>])} /></div> : null)}
          </div>
        </DashboardPanel>
      ) : null}
    </>
  );
}

type BillingData = {
  currency: string;
  balanceMinor: number;
  paymentsConfigured: boolean;
  payments: Array<{ id: string; status: string; amountMinor: number; currency: string; createdAt: string }>;
  transactions: Array<{ id: string; type: string; amountMinor: number; currency: string; description: string; createdAt: string; paymentStatus: string | null }>;
  orders: Array<{ id: string; status: string; amountMinor: number | null; currency: string | null; plan: string; createdAt: string }>;
};
function BillingPage() {
  const customerRequest = useCustomerRequest();
  const state = useCustomerData<BillingData>("/billing");
  const data = state.data;
  const [topUpAmount, setTopUpAmount] = useState("2500");
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutNotice, setCheckoutNotice] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    const checkout = new URLSearchParams(window.location.search).get("checkout");
    if (checkout === "success") {
      const notice = window.setTimeout(() => {
        setCheckoutNotice("Checkout completed. Your balance will update after Stripe confirms the payment.");
      }, 0);
      const refresh = window.setTimeout(state.reload, 1500);
      window.history.replaceState({}, "", window.location.pathname);
      return () => {
        window.clearTimeout(notice);
        window.clearTimeout(refresh);
      };
    }
    if (checkout === "cancelled") {
      const notice = window.setTimeout(() => setCheckoutNotice("Checkout was cancelled. No payment was made."), 0);
      window.history.replaceState({}, "", window.location.pathname);
      return () => window.clearTimeout(notice);
    }
    return undefined;
  }, [state.reload]);

  async function beginCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCheckoutError("");
    setCheckingOut(true);
    try {
      const result = await customerRequest<{ checkoutUrl: string }>("/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ amountMinor: Number(topUpAmount), currency: "USD" }),
      });
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setCheckoutError(getApiErrorMessage(error, "Unable to start checkout."));
      setCheckingOut(false);
    }
  }

  return (
    <>
      <DashboardHeading description="Review your account balance, invoices, and payment history." eyebrow="Workspace / Account" title="Billing & Payments" />
      <DashboardPreviewNotice />
      <SectionState error={state.error} loading={state.loading} onRetry={state.reload} />
      {data ? (
        <>
          {checkoutNotice ? <div className="mb-4"><Notice tone={checkoutNotice.includes("cancelled") ? "amber" : "green"}>{checkoutNotice}</Notice></div> : null}
          {checkoutError ? <div className="mb-4"><Notice tone="red">{checkoutError}</Notice></div> : null}
          <DashboardPanel className="mb-4 overflow-hidden border-0 bg-[linear-gradient(115deg,#183d7d,#245fd0)] text-white">
            <p className="text-xs text-blue-100">Current wallet ledger balance</p>
            <p className="mt-2 text-3xl font-bold tracking-[-0.04em]">{formatMoney(data.balanceMinor, data.currency)}</p>
            <p className="mt-1 text-[10px] text-blue-100">{data.paymentsConfigured ? "Payment processor configured" : "Payment processing is not configured"}</p>
          </DashboardPanel>
          <DashboardPanel className="mb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div><h2 className="text-sm font-bold text-[#1d2b48]">Add wallet funds</h2><p className="mt-1 text-[11px] text-[#8a96aa]">Secure checkout is handled by Stripe.</p></div>
              {data.paymentsConfigured ? (
                <form className="flex flex-wrap items-end gap-2" onSubmit={(event) => void beginCheckout(event)}>
                  <label className="text-[10px] font-medium text-[#68768e]">Amount<select className="mt-1.5 block h-9 rounded-xl border border-[#e7ebf3] bg-white px-3 text-xs" onChange={(event) => setTopUpAmount(event.target.value)} value={topUpAmount}><option value="1000">$10.00</option><option value="2500">$25.00</option><option value="5000">$50.00</option><option value="10000">$100.00</option></select></label>
                  <SubmitButton disabled={checkingOut}><Plus size={13} /> {checkingOut ? "Opening checkout…" : "Continue to checkout"}</SubmitButton>
                </form>
              ) : <p className="max-w-md text-xs leading-5 text-amber-800">Payments are unavailable until STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are configured.</p>}
            </div>
          </DashboardPanel>
          <DashboardPanel className="mb-4">
            <div className="mb-4"><h2 className="text-sm font-bold text-[#1d2b48]">Wallet transactions</h2><p className="mt-1 text-[11px] text-[#8a96aa]">Posted ledger entries from your account.</p></div>
            {data.transactions.length ? <DashboardTable headers={["Description", "Type", "Date", "Amount", "Payment status"]} rows={data.transactions.map((transaction) => [transaction.description, transaction.type, formatDate(transaction.createdAt), formatMoney(transaction.amountMinor, transaction.currency), transaction.paymentStatus ?? "Ledger entry"])} /> : <p className="py-8 text-center text-xs text-[#8290a8]">No transactions recorded.</p>}
          </DashboardPanel>
          <DashboardPanel>
            <div className="mb-4"><h2 className="text-sm font-bold text-[#1d2b48]">Service orders</h2><p className="mt-1 text-[11px] text-[#8a96aa]">Orders created in your workspace.</p></div>
            {data.orders.length ? <DashboardTable headers={["Order", "Plan", "Created", "Amount", "Status"]} rows={data.orders.map((order) => [order.id, order.plan, formatDate(order.createdAt), order.amountMinor === null ? "Not billed" : formatMoney(order.amountMinor, order.currency ?? data.currency), order.status])} /> : <p className="py-8 text-center text-xs text-[#8290a8]">No service orders recorded.</p>}
          </DashboardPanel>
          {data.payments.length ? <DashboardPanel className="mt-4"><div className="mb-4"><h2 className="text-sm font-bold text-[#1d2b48]">Checkout history</h2><p className="mt-1 text-[11px] text-[#8a96aa]">Payment status is confirmed by signed Stripe webhooks.</p></div><DashboardTable headers={["Checkout", "Created", "Amount", "Status"]} rows={data.payments.map((payment) => [payment.id.slice(-10).toUpperCase(), formatDate(payment.createdAt), formatMoney(payment.amountMinor, payment.currency), <DashboardStatus key={payment.id} tone={payment.status === "SUCCEEDED" ? "green" : payment.status === "PENDING" ? "amber" : "slate"}>{payment.status}</DashboardStatus>])} /></DashboardPanel> : null}
        </>
      ) : null}
    </>
  );
}

type ActivityData = { events: Array<{ id: string; action: string; resourceType: string; resourceId: string | null; metadata: Record<string, unknown> | null; createdAt: string }> };
function ActivityPage() {
  const state = useCustomerData<ActivityData>("/activity?limit=100");
  const [query, setQuery] = useState("");
  const events = useMemo(() => (state.data?.events ?? []).filter((event) => `${event.action} ${event.resourceType} ${event.resourceId ?? ""}`.toLowerCase().includes(query.toLowerCase())), [state.data, query]);
  return (
    <>
      <DashboardHeading description="Track account changes, service events, and security activity." eyebrow="Workspace / Account" title="Activity Log" />
      <DashboardPreviewNotice />
      <SectionState error={state.error} loading={state.loading} onRetry={state.reload} />
      {!state.loading && !state.error ? <DashboardPanel>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-bold text-[#1d2b48]">All activity</h2><p className="mt-1 text-[11px] text-[#8a96aa]">Auditable actions performed in this workspace.</p></div><span className="text-[10px] text-[#96a1b4]">{events.length} events</span></div>
        <label className="mb-4 flex h-10 items-center gap-2 rounded-xl border border-[#e7ebf3] px-3 text-[#94a0b2]"><Search size={14} /><input className="w-full bg-transparent text-xs outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Search activity…" value={query} /></label>
        {events.length ? <DashboardTable headers={["Action", "Category", "Resource", "Date & time"]} rows={events.map((event) => [event.action.toLowerCase().replaceAll("_", " "), event.resourceType, event.resourceId ?? "—", formatDate(event.createdAt)])} /> : <p className="py-8 text-center text-xs text-[#8290a8]">No activity matches your search.</p>}
      </DashboardPanel> : null}
    </>
  );
}

type TicketRecord = { id: string; subject: string; category: string; priority: string; status: string; description: string; createdAt: string; updatedAt: string };
function SupportPage() {
  const customerRequest = useCustomerRequest();
  const state = useCustomerData<{ tickets: TicketRecord[] }>("/support/tickets");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      await customerRequest("/support/tickets", {
        method: "POST",
        body: JSON.stringify({ subject: form.get("subject"), category: form.get("category"), priority: form.get("priority"), description: form.get("description") }),
      });
      formElement.reset();
      state.reload();
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Unable to create this request."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <DashboardHeading description="Create and track support requests for your workspace." eyebrow="Workspace / Help & Support" title="Support Center" />
      <DashboardPreviewNotice />
      {error ? <div className="mb-4"><Notice tone="red">{error}</Notice></div> : null}
      <SectionState error={state.error} loading={state.loading} onRetry={state.reload} />
      {!state.loading && !state.error ? (
        <>
          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            <DashboardMetric detail="Submitted by your workspace" icon={<Ticket size={17} />} label="Total tickets" value={String(state.data?.tickets.length ?? 0)} />
            <DashboardMetric detail="Awaiting resolution" icon={<CircleHelp size={17} />} label="Open tickets" tone="amber" value={String(state.data?.tickets.filter((ticket) => ticket.status === "OPEN" || ticket.status === "IN_PROGRESS").length ?? 0)} />
            <DashboardMetric detail="Successfully resolved" icon={<Check size={17} />} label="Resolved tickets" tone="green" value={String(state.data?.tickets.filter((ticket) => ticket.status === "RESOLVED").length ?? 0)} />
          </div>
          <DashboardPanel className="mb-4">
            <h2 className="text-sm font-bold text-[#1d2b48]">Submit a support request</h2>
            <p className="mt-1 text-[11px] text-[#8a96aa]">Requests are saved to your account for support staff to review.</p>
            <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={(event) => void createTicket(event)}>
              <label className="text-[11px] font-medium text-[#52617b]">Category<select className="mt-2 h-10 w-full rounded-xl border border-[#e7ebf3] bg-white px-3 text-xs" name="category"><option value="TECHNICAL">Technical</option><option value="BILLING">Billing</option><option value="SECURITY">Security</option><option value="GENERAL">General</option></select></label>
              <label className="text-[11px] font-medium text-[#52617b]">Priority<select className="mt-2 h-10 w-full rounded-xl border border-[#e7ebf3] bg-white px-3 text-xs" name="priority"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></label>
              <label className="text-[11px] font-medium text-[#52617b] sm:col-span-2">Subject<input className="mt-2 h-10 w-full rounded-xl border border-[#e7ebf3] px-3 text-xs" maxLength={160} minLength={5} name="subject" required /></label>
              <label className="text-[11px] font-medium text-[#52617b] sm:col-span-2">Description<textarea className="mt-2 min-h-28 w-full rounded-xl border border-[#e7ebf3] p-3 text-xs" maxLength={10000} minLength={10} name="description" required /></label>
              <div className="sm:col-span-2"><SubmitButton disabled={saving}><Plus size={14} /> {saving ? "Submitting…" : "Submit ticket"}</SubmitButton></div>
            </form>
          </DashboardPanel>
          <DashboardPanel>
            <div className="mb-4"><h2 className="text-sm font-bold text-[#1d2b48]">My support tickets</h2><p className="mt-1 text-[11px] text-[#8a96aa]">Current requests in your workspace.</p></div>
            {state.data?.tickets.length ? <DashboardTable headers={["Ticket ID", "Subject", "Category", "Created", "Status", "Priority"]} rows={state.data.tickets.map((ticket) => [ticket.id.slice(-8).toUpperCase(), <span key={ticket.id}><span className="block font-medium">{ticket.subject}</span><span className="mt-1 block max-w-xs truncate text-[9px] text-[#8a96aa]">{ticket.description}</span></span>, ticket.category, formatDate(ticket.createdAt), <DashboardStatus key={`${ticket.id}-status`} tone={ticket.status === "OPEN" ? "amber" : ticket.status === "RESOLVED" ? "green" : "blue"}>{ticket.status.replaceAll("_", " ")}</DashboardStatus>, ticket.priority])} /> : <p className="py-8 text-center text-xs text-[#8290a8]">No support tickets have been submitted.</p>}
          </DashboardPanel>
        </>
      ) : null}
    </>
  );
}

function SettingsPage({
  account,
  updateAccount,
}: {
  account: CustomerAccount;
  updateAccount: (account: CustomerAccount) => void;
}) {
  const customerRequest = useCustomerRequest();
  const [name, setName] = useState(account.name ?? "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      const result = await customerRequest<{ account: CustomerAccount }>("/settings", {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      updateAccount(result.account);
      setName(result.account.name ?? "");
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Unable to save profile."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <DashboardHeading description="Manage your profile and account security." eyebrow="Workspace / Account" title="Account Settings" />
      <DashboardPreviewNotice />
      {message ? <div className="mb-4"><Notice tone={message === "Profile updated." ? "green" : "red"}>{message}</Notice></div> : null}
      <div className="grid items-start gap-4 lg:grid-cols-[190px_minmax(0,1fr)]">
        <DashboardPanel className="p-3">
          <div className="rounded-lg bg-blue-50 px-3 py-2.5 text-xs font-semibold text-blue-700">Profile</div>
          <div className="px-3 py-2.5 text-xs text-[#71809a]">Security</div>
        </DashboardPanel>
        <div className="space-y-4">
          <DashboardPanel>
            <div className="mb-5"><h2 className="text-sm font-bold text-[#1d2b48]">Personal information</h2><p className="mt-1 text-[11px] text-[#8a96aa]">Profile details associated with your account.</p></div>
            <div className="mb-5 flex items-center gap-3 border-b border-[#edf0f5] pb-5"><span className="flex size-11 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">{(account.name || account.email).split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span><div><p className="text-xs font-semibold text-[#34425e]">{account.name || "Account profile"}</p><p className="mt-1 text-[10px] text-[#8a96aa]">{account.email}</p></div></div>
            <form onSubmit={(event) => void saveProfile(event)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-[10px] font-medium text-[#68768e]">Display name<input className="mt-2 h-10 w-full rounded-xl border border-[#e7ebf3] px-3 text-xs" maxLength={120} minLength={1} onChange={(event) => setName(event.target.value)} required value={name} /></label>
                <label className="text-[10px] font-medium text-[#68768e]">Email address<input className="mt-2 h-10 w-full rounded-xl border border-[#e7ebf3] bg-[#fafbfc] px-3 text-xs text-[#52617b]" readOnly value={account.email} /></label>
              </div>
              <div className="mt-4"><SubmitButton disabled={saving}><Check size={14} /> {saving ? "Saving…" : "Save profile"}</SubmitButton></div>
            </form>
          </DashboardPanel>
          <DashboardPanel>
            <h2 className="text-sm font-bold text-[#1d2b48]">Security & authentication</h2>
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#edf0f5] py-3"><div><p className="text-[11px] font-semibold text-[#34425e]">Password</p><p className="mt-1 text-[10px] text-[#8a96aa]">Password is securely hashed by the authentication service.</p></div><span className="text-[10px] text-[#8290a8]">Use sign-in recovery through support</span></div>
            <div className="flex items-center justify-between gap-3 border-t border-[#edf0f5] py-3"><div><p className="text-[11px] font-semibold text-[#34425e]">Active sessions</p><p className="mt-1 text-[10px] text-[#8a96aa]">Sign out from the account menu to end this session.</p></div><span className="text-[10px] text-emerald-600">Session active</span></div>
          </DashboardPanel>
        </div>
      </div>
    </>
  );
}

export type DashboardSection =
  | "servers"
  | "deploy"
  | "ssh-keys"
  | "firewall"
  | "billing"
  | "activity"
  | "support"
  | "settings";

function ServersPageContent({ initialQuery }: { initialQuery: string }) {
  const customerRequest = useCustomerRequest();
  const state = useCustomerData<{ servers: CustomerServer[] }>("/servers");
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState("All statuses");
  const [actionError, setActionError] = useState("");
  const [pendingId, setPendingId] = useState("");
  const servers = useMemo(
    () =>
      (state.data?.servers ?? []).filter((server) => {
        const matchesQuery = `${server.name} ${server.ipAddress ?? ""}`.toLowerCase().includes(query.toLowerCase());
        return matchesQuery && (status === "All statuses" || server.status.toLowerCase() === status.toLowerCase());
      }),
    [query, state.data, status],
  );

  async function runAction(server: CustomerServer, action: "reboot" | "power-on" | "power-off" | "delete") {
    if (action === "delete" && !window.confirm(`Permanently delete server "${server.name}"?`)) return;
    setPendingId(server.id);
    setActionError("");
    try {
      await customerRequest(`/servers/${encodeURIComponent(server.id)}/actions`, {
        method: "POST",
        body: JSON.stringify({ action }),
      });
      state.reload();
    } catch (cause) {
      setActionError(getApiErrorMessage(cause, "The server action failed."));
    } finally {
      setPendingId("");
    }
  }

  return (
    <>
      <DashboardHeading description="Manage and monitor cloud resources registered to your workspace." eyebrow="Workspace / Services" title="My Services" />
      <DashboardPreviewNotice />
      {actionError ? <div className="mb-4"><Notice tone="red">{actionError}</Notice></div> : null}
      <SectionState error={state.error} loading={state.loading} onRetry={state.reload} />
      {!state.loading && !state.error ? (
        <DashboardPanel>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#e7ebf3] px-3 text-[#94a0b2] focus-within:border-blue-300"><Search size={14} /><input aria-label="Search servers by name or IP" className="min-w-0 flex-1 bg-transparent text-xs outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Search by server name or IP…" value={query} /></label>
            <select aria-label="Filter by status" className="h-10 rounded-xl border border-[#e7ebf3] bg-white px-3 text-xs text-[#68768e]" onChange={(event) => setStatus(event.target.value)} value={status}><option>All statuses</option><option>Running</option><option>pending</option><option>provisioning</option><option>failed</option></select>
          </div>
          <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-sm font-bold text-[#1d2b48]">All servers</h2><span className="text-[10px] text-[#96a1b4]">{servers.length} servers</span></div>
          {servers.length ? <DashboardTable headers={["Server", "Region", "IP address", "Plan", "Status", "Actions"]} rows={servers.map((server) => [<span key={`${server.id}-name`}><span className="block font-semibold text-[#34425e]">{server.name}</span><span className="mt-1 block text-[9px] text-[#9aa5b7]">{server.operatingSystem}{server.simulated ? " · simulated" : ""}</span></span>, server.region, server.ipAddress ?? "Not assigned", `${server.plan.cpuCores} vCPU · ${Math.round(server.plan.memoryMb / 1024)} GB`, <DashboardStatus key={`${server.id}-status`} tone={server.status === "Running" ? "green" : server.status === "failed" ? "red" : "amber"}>{server.status}</DashboardStatus>, <div className="flex items-center gap-2" key={`${server.id}-actions`}>{server.status === "Running" ? <button className="text-[10px] font-semibold text-[#52617b] hover:text-blue-600 disabled:opacity-50" disabled={pendingId === server.id} onClick={() => void runAction(server, "power-off")} type="button">Stop</button> : <button className="text-[10px] font-semibold text-[#52617b] hover:text-blue-600 disabled:opacity-50" disabled={pendingId === server.id} onClick={() => void runAction(server, "power-on")} type="button">Start</button>}<button className="text-[10px] font-semibold text-[#52617b] hover:text-blue-600 disabled:opacity-50" disabled={pendingId === server.id} onClick={() => void runAction(server, "reboot")} type="button">Reboot</button><button aria-label={`Delete ${server.name}`} className="text-rose-600 hover:text-rose-800 disabled:opacity-50" disabled={pendingId === server.id} onClick={() => void runAction(server, "delete")} type="button"><Trash2 size={13} /></button></div>])} /> : <div className="py-12 text-center"><Server className="mx-auto text-[#9aa8bf]" size={22} /><p className="mt-3 text-xs text-[#8290a8]">{query ? "No servers match those filters." : "No server resources are registered yet."}</p></div>}
        </DashboardPanel>
      ) : null}
    </>
  );
}

function ServersPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  return <ServersPageContent initialQuery={initialQuery} key={initialQuery} />;
}

export function DashboardSectionContent({
  section,
  account,
  updateAccount,
}: {
  section: DashboardSection;
  account: CustomerAccount;
  updateAccount: (account: CustomerAccount) => void;
}) {
  switch (section) {
    case "servers":
      return <ServersPage />;
    case "deploy":
      return <DeployPage />;
    case "ssh-keys":
      return <SshKeysPage />;
    case "firewall":
      return <FirewallPage />;
    case "billing":
      return <BillingPage />;
    case "activity":
      return <ActivityPage />;
    case "support":
      return <SupportPage />;
    case "settings":
      return <SettingsPage account={account} updateAccount={updateAccount} />;
  }
}
