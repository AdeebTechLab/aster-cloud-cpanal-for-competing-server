"use client";

import {
  Activity,
  Bell,
  Boxes,
  CreditCard,
  HelpCircle,
  KeyRound,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  Settings,
  Shield,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import type { CustomerAccount, CustomerDashboard } from "./dashboard-api";
import { useAppDispatch } from "@/lib/redux/hooks";
import {
  getApiErrorMessage,
  platformApi,
  useGetCustomerDashboardQuery,
  useGetNotificationsQuery,
  useLogoutMutation,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/lib/redux/platformApi";

const navigationGroups = [
  {
    label: "Workspace",
    links: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Services", href: "/dashboard/servers", icon: Boxes },
      { label: "Deploy Server", href: "/dashboard/deploy", icon: Plus },
    ],
  },
  {
    label: "Manage",
    links: [
      { label: "SSH Keys", href: "/dashboard/ssh-keys", icon: KeyRound },
      { label: "Firewall", href: "/dashboard/firewall", icon: Shield },
      { label: "Billing & Payments", href: "/dashboard/billing", icon: CreditCard },
      { label: "Activity", href: "/dashboard/activity", icon: Activity },
      { label: "Support", href: "/dashboard/support", icon: HelpCircle },
    ],
  },
  {
    label: "Preferences",
    links: [{ label: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

type DashboardContextValue = {
  account: CustomerAccount;
  dashboard: CustomerDashboard;
  updateAccount: (account: CustomerAccount) => void;
};
const DashboardAccountContext = createContext<DashboardContextValue | null>(null);

export function useDashboardData() {
  const value = useContext(DashboardAccountContext);
  if (!value) throw new Error("useDashboardData must be used inside DashboardShell.");
  return value;
}

function getDisplayName(account: CustomerAccount) {
  return account.name?.trim() || account.email.split("@")[0] || "Customer";
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    data: dashboard,
    isLoading,
    error: dashboardError,
    refetch: retryDashboard,
  } = useGetCustomerDashboardQuery();
  const isUnauthorized = typeof dashboardError === "object" && dashboardError !== null
    && "status" in dashboardError && dashboardError.status === 401;
  useEffect(() => {
    if (isUnauthorized) router.replace("/login");
  }, [isUnauthorized, router]);
  const [loadError, setLoadError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [searchValue, setSearchValue] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const {
    data: notificationData,
    error: notificationQueryError,
  } = useGetNotificationsQuery(undefined, { skip: !notificationsOpen });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const notifications = notificationData?.notifications ?? [];
  const unreadCount = notificationData?.unreadCount ?? 0;
  const [notificationError, setNotificationError] = useState("");

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  const loadErrorFromQuery = dashboardError
    ? getApiErrorMessage(dashboardError, "Unable to load your account.")
    : "";
  const loadErrorMessage = loadError || loadErrorFromQuery;
  const notificationLoadError = notificationQueryError
    ? getApiErrorMessage(notificationQueryError, "Unable to load notifications.")
    : "";

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchValue.trim();
    router.push(query ? `/dashboard/servers?q=${encodeURIComponent(query)}` : "/dashboard/servers");
  }

  async function markNotificationRead(id: string) {
    try {
      await markRead(id).unwrap();
      setNotificationError("");
    } catch (error) {
      setNotificationError(getApiErrorMessage(error, "Unable to update notification."));
    }
  }

  async function markAllNotificationsRead() {
    try {
      await markAllRead().unwrap();
      setNotificationError("");
    } catch (error) {
      setNotificationError(getApiErrorMessage(error, "Unable to update notifications."));
    }
  }

  async function handleLogout() {
    try {
      await logout().unwrap();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      setLoadError(getApiErrorMessage(error, "Unable to sign out right now. Please try again."));
    }
  }

  const currentLabel =
    navigationGroups.flatMap((group) => group.links).find((link) =>
      link.href === "/dashboard" ? pathname === link.href : pathname.startsWith(link.href),
    )?.label ?? "Overview";

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f6fa] px-5">
        <div className="text-center">
          <span className="mx-auto flex size-11 animate-pulse items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Sparkles size={20} />
          </span>
          <p className="mt-4 text-sm font-medium text-[#53617a]">Loading your workspace…</p>
        </div>
      </main>
    );
  }

  if (loadErrorMessage || !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f6fa] px-5">
        <div className="w-full max-w-md rounded-2xl border border-[#e7ebf3] bg-white p-7 text-center shadow-sm">
          <p className="text-lg font-bold text-[#172340]">Workspace unavailable</p>
          <p className="mt-2 text-sm leading-6 text-[#8290a8]">
            {loadErrorMessage || "Your account could not be loaded."}
          </p>
          <button
            className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={() => void retryDashboard()}
            type="button"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const account = dashboard.account;
  const displayName = getDisplayName(account);
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#172340]">
      {isSidebarOpen ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-[#09152b]/50 lg:hidden"
          onClick={closeSidebar}
          type="button"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-[#101c33] px-4 py-5 text-white transition-transform duration-200 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <Link className="flex items-center gap-2.5" href="/dashboard" onClick={closeSidebar}>
            <span className="flex size-8 items-center justify-center rounded-[10px] bg-blue-600 shadow-[0_6px_18px_rgba(37,99,235,0.35)]">
              <Sparkles aria-hidden="true" size={16} />
            </span>
            <span className="text-[15px] font-bold tracking-[-0.04em]">
              Northstar <span className="text-blue-400">Cloud</span>
            </span>
          </Link>
          <button
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
            onClick={closeSidebar}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-8 rounded-xl border border-white/[0.08] bg-white/[0.045] px-3 py-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-slate-500">Workspace</p>
          <div className="mt-1.5 flex items-center justify-between text-xs font-semibold text-slate-100">
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Customer Console
            </span>
            <span className="text-slate-500">⌄</span>
          </div>
        </div>

        <nav aria-label="Customer dashboard" className="mt-6 flex-1 space-y-6 overflow-y-auto">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.links.map(({ label, href, icon: Icon }) => {
                  const isActive =
                    href === "/dashboard" ? pathname === href : pathname.startsWith(href);
                  return (
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                        isActive
                          ? "bg-[#233c67] text-white shadow-[inset_2px_0_0_#4d83ff]"
                          : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                      }`}
                      href={href}
                      key={href}
                      onClick={closeSidebar}
                    >
                      <Icon aria-hidden="true" size={15} strokeWidth={1.8} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.045] p-3">
          <p className="text-xs font-semibold text-white">Need a hand?</p>
          <p className="mt-1 text-[10px] leading-4 text-slate-400">
            Visit the support center to find help with your workspace.
          </p>
          <Link
            className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-blue-300 hover:text-blue-200"
            href="/dashboard/support"
            onClick={closeSidebar}
          >
            Open support <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-4 flex items-center gap-2.5 border-t border-white/[0.08] px-1 pt-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#dce8ff] text-[10px] font-bold text-blue-700">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-white">{displayName}</p>
            <p className="truncate text-[9px] text-slate-400">{account.email}</p>
          </div>
          <button
            aria-label="Sign out"
            className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
            disabled={isLoggingOut}
            onClick={() => void handleLogout()}
            title="Sign out"
            type="button"
          >
            {isLoggingOut ? "…" : "↗"}
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[260px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center gap-3 border-b border-[#e9edf4] bg-white/95 px-4 backdrop-blur sm:px-7 lg:px-9">
          <button
            aria-label="Open navigation"
            className="flex size-9 items-center justify-center rounded-xl border border-[#e8edf5] text-[#52617b] hover:bg-[#f5f7fb] lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
            type="button"
          >
            <Menu size={18} />
          </button>
          <div className="hidden items-center gap-2 text-[11px] text-[#8a96aa] sm:flex">
            <span>Customer Console</span>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-[#34425e]">{currentLabel}</span>
          </div>
          <form onSubmit={handleSearch} className="ml-auto flex h-9 w-full max-w-[330px] items-center gap-2 rounded-xl border border-[#e8edf5] bg-[#fafbfc] px-3 text-[#9aa5b7] focus-within:border-blue-300">
            <Search aria-hidden="true" size={14} />
            <input
              aria-label="Search dashboard"
              className="min-w-0 flex-1 bg-transparent text-xs text-[#34425e] outline-none placeholder:text-[#9aa5b7]"
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search servers, invoices…"
              type="search"
              value={searchValue}
            />
            <kbd className="hidden rounded border border-[#e4e9f1] px-1.5 py-0.5 text-[9px] text-[#9aa5b7] sm:inline">
              /
            </kbd>
          </form>
          <div className="relative">
            <button
              aria-expanded={notificationsOpen}
              aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
              className="relative flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#e8edf5] text-[#66748c] hover:bg-[#f5f7fb]"
              onClick={() => setNotificationsOpen((open) => !open)}
              type="button"
            >
              <Bell size={15} />
              {unreadCount > 0 ? <span className="absolute right-2 top-2 size-1.5 rounded-full bg-blue-600 ring-2 ring-white" /> : null}
            </button>
            {notificationsOpen ? (
              <div className="absolute right-0 top-11 z-50 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-[#e7ebf3] bg-white p-3 shadow-[0_16px_45px_rgba(27,43,78,0.16)]">
                <div className="flex items-center justify-between gap-2 border-b border-[#edf0f5] px-2 pb-3">
                  <p className="text-xs font-bold text-[#1d2b48]">Notifications</p>
                  {unreadCount ? <button className="text-[10px] font-semibold text-blue-600" onClick={() => void markAllNotificationsRead()} type="button">Mark all read</button> : null}
                </div>
                {notificationError || notificationLoadError ? <p className="px-2 py-3 text-[10px] text-rose-700">{notificationError || notificationLoadError}</p> : null}
                {notifications.length ? (
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <button className="block w-full rounded-xl px-2 py-3 text-left hover:bg-[#f7f9fc]" key={notification.id} onClick={() => notification.readAt ? undefined : void markNotificationRead(notification.id)} type="button">
                        <span className="flex items-start gap-2">
                          <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${notification.readAt ? "bg-transparent" : "bg-blue-600"}`} />
                          <span><span className="block text-[11px] font-semibold text-[#34425e]">{notification.title}</span><span className="mt-1 block text-[10px] leading-4 text-[#8290a8]">{notification.body}</span></span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : !notificationError && !notificationLoadError ? <p className="px-2 py-6 text-center text-[10px] text-[#8290a8]">No notifications.</p> : null}
              </div>
            ) : null}
          </div>
          <div className="hidden items-center gap-2.5 border-l border-[#edf0f5] pl-3 sm:flex">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#e7efff] text-[10px] font-bold text-blue-700">
              {initials}
            </span>
            <div className="hidden md:block">
              <p className="max-w-32 truncate text-[11px] font-semibold text-[#263654]">{displayName}</p>
              <p className="text-[9px] text-[#8a96aa]">Workspace owner</p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1580px] px-4 py-7 sm:px-7 lg:px-9 lg:py-8">
          {loadError ? (
            <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs text-rose-800">
              <span>{loadErrorMessage}</span>
              <button
                className="font-semibold underline"
                onClick={() => {
                  setLoadError("");
                  void retryDashboard();
                }}
                type="button"
              >
                Dismiss
              </button>
            </div>
          ) : null}
          <DashboardAccountContext.Provider
            value={{
              account,
              dashboard,
              updateAccount: (updatedAccount) => {
                dispatch(platformApi.util.updateQueryData("getCustomerDashboard", undefined, (current) => {
                  current.account = updatedAccount;
                }));
              },
            }}
          >
            {children}
          </DashboardAccountContext.Provider>
        </main>
      </div>
    </div>
  );
}
