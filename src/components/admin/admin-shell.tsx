"use client";

import {
  Bell,
  CircleHelp,
  CreditCard,
  LayoutDashboard,
  Menu,
  Search,
  Server,
  Settings,
  Shield,
  Sparkles,
  Tags,
  Users,
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
import type { AdminUser } from "./admin-api";
import {
  getApiErrorMessage,
  useGetAdminMeQuery,
  useLogoutMutation,
} from "@/lib/redux/platformApi";

const navigation = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Servers & Infrastructure", href: "/admin/servers", icon: Server },
  { label: "Plans & Pricing", href: "/admin/plans", icon: Tags },
  { label: "Billing", href: "/admin/billing", icon: CreditCard },
  { label: "Support Tickets", href: "/admin/support", icon: CircleHelp },
  { label: "Security & Logs", href: "/admin/security", icon: Shield },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

type AdminContextValue = { user: AdminUser };
const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdminUser() {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdminUser must be used inside AdminShell.");
  return value.user;
}

function getDisplayName(user: AdminUser) {
  return user.name?.trim() || user.email.split("@")[0] || "Admin User";
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const identity = useGetAdminMeQuery();
  const user: AdminUser | null = identity.data
    ? { ...identity.data.user, platformName: identity.data.platformName }
    : null;
  const loading = identity.isLoading;
  const queryError = identity.error
    ? getApiErrorMessage(identity.error, "Unable to load administrator access.")
    : "";
  const isUnauthorized = typeof identity.error === "object" && identity.error !== null
    && "status" in identity.error && identity.error.status === 401;
  const [logoutError, setLogoutError] = useState("");
  const error = logoutError || queryError;
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutRequest, { isLoading: loggingOut }] = useLogoutMutation();
  useEffect(() => {
    if (isUnauthorized) router.replace("/login");
  }, [isUnauthorized, router]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), [setSidebarOpen]);
  const currentLabel = navigation.find((item) =>
    item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href),
  )?.label ?? "Overview";

  function searchCustomers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/admin/customers?q=${encodeURIComponent(value)}` : "/admin/customers");
  }

  async function logout() {
    try {
      await logoutRequest().unwrap();
      router.replace("/login");
      router.refresh();
    } catch (reason) {
      setLogoutError(getApiErrorMessage(reason, "Unable to sign out."));
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f6fa]">
        <div className="text-center">
          <span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Sparkles size={20} />
          </span>
          <p className="mt-4 text-sm text-[#66748c]">Verifying administrator access…</p>
        </div>
      </main>
    );
  }

  if (error || !user) {
    const denied = error.includes("Administrator access is required");
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f6fa] px-5">
        <section className="w-full max-w-md rounded-2xl border border-[#e7ebf3] bg-white p-8 text-center shadow-sm">
          <Shield className={`mx-auto ${denied ? "text-amber-500" : "text-blue-600"}`} size={28} />
          <h1 className="mt-4 text-lg font-bold text-[#172340]">
            {denied ? "Administrator access required" : "Admin console unavailable"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#8290a8]">
            {denied
              ? "This account does not have the SUPER_ADMIN role. Sign in with an administrator account."
              : error || "Your administrator session could not be loaded."}
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button
              className="rounded-lg border border-[#e4e9f1] px-4 py-2 text-xs font-semibold text-[#52617b] hover:bg-[#f7f8fb]"
              onClick={() => router.replace("/dashboard")}
              type="button"
            >
              Customer dashboard
            </button>
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              onClick={() => {
                setLogoutError("");
                void identity.refetch();
              }}
              type="button"
            >
              Try again
            </button>
          </div>
        </section>
      </main>
    );
  }

  const name = getDisplayName(user);
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <AdminContext.Provider value={{ user }}>
      <div className="min-h-screen bg-[#f4f6fa] text-[#172340]">
        {sidebarOpen ? (
          <button
            aria-label="Close navigation"
            className="fixed inset-0 z-30 bg-[#09152b]/50 lg:hidden"
            onClick={closeSidebar}
            type="button"
          />
        ) : null}
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-[220px] flex-col bg-[#101c33] px-3 py-5 text-white transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between px-2">
            <Link className="text-[16px] font-bold tracking-[-0.04em]" href="/admin">
              {user.platformName.split(" ").slice(0, -1).join(" ") || user.platformName}{" "}
              <span className="text-blue-400">{user.platformName.split(" ").at(-1)}</span>
            </Link>
            <button
              aria-label="Close navigation"
              className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
              onClick={closeSidebar}
              type="button"
            >
              <X size={17} />
            </button>
          </div>
          <p className="mb-3 mt-7 px-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">Admin Console</p>
          <nav aria-label="Administrator dashboard" className="flex-1 space-y-1 overflow-y-auto">
            {navigation.map(({ label, href, icon: Icon }) => {
              const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[11px] font-medium transition ${active ? "bg-[#2865e9] text-white shadow-sm" : "text-slate-300 hover:bg-white/[0.07] hover:text-white"}`}
                  href={href}
                  key={href}
                  onClick={closeSidebar}
                >
                  <Icon aria-hidden="true" size={14} strokeWidth={1.8} />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 border-t border-white/[0.1] px-2 pt-4">
            <p className="text-[10px] font-semibold text-white">{user.platformName}</p>
            <p className="mt-1 text-[9px] leading-4 text-slate-400">Admin access · v1.0</p>
            <div className="mt-4 flex items-center gap-2 border-t border-white/[0.1] pt-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#dce8ff] text-[10px] font-bold text-blue-700">{initials}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-semibold">{name}</p>
                <p className="truncate text-[9px] text-slate-400">Super Admin</p>
              </div>
              <button
                aria-label="Sign out"
                className="rounded-md px-2 py-1 text-[10px] text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
                disabled={loggingOut}
                onClick={() => void logout()}
                title="Sign out"
                type="button"
              >
                {loggingOut ? "…" : "↗"}
              </button>
            </div>
          </div>
        </aside>

        <div className="min-h-screen lg:pl-[220px]">
          <header className="sticky top-0 z-20 flex h-[62px] items-center gap-3 border-b border-[#e9edf4] bg-white/95 px-4 backdrop-blur sm:px-7">
            <button
              aria-label="Open navigation"
              className="flex size-8 items-center justify-center rounded-lg border border-[#e8edf5] text-[#52617b] lg:hidden"
              onClick={() => setSidebarOpen(true)}
              type="button"
            >
              <Menu size={16} />
            </button>
            <div className="hidden items-center gap-2 text-[10px] text-[#8a96aa] sm:flex">
              <span>Admin Console</span><span aria-hidden="true">/</span>
              <span className="font-semibold text-[#34425e]">{currentLabel}</span>
            </div>
            <form onSubmit={searchCustomers} className="ml-auto flex h-8 w-full max-w-[330px] items-center gap-2 rounded-md border border-[#e8edf5] bg-[#f6f8fb] px-3 text-[#8996ab] focus-within:border-blue-300">
              <Search aria-hidden="true" size={12} />
              <input
                aria-label="Search customers"
                className="min-w-0 flex-1 bg-transparent text-[10px] text-[#34425e] outline-none placeholder:text-[#8996ab]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search customers, servers..."
                type="search"
                value={query}
              />
            </form>
            <span aria-label="Administrator notifications are not configured" className="hidden size-8 items-center justify-center text-[#8794aa] sm:flex" title="Admin notifications are not configured">
              <Bell size={13} />
            </span>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#e6edff] text-[9px] font-bold text-blue-700">{initials}</span>
            <div className="hidden sm:block">
              <p className="text-[10px] font-semibold text-[#263654]">{name}</p>
              <p className="text-[8px] text-[#91a0b7]">Super Admin</p>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-7">
            {children}
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
