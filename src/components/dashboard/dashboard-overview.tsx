import { CircleDollarSign, HardDrive, Network, Server } from "lucide-react";
import Link from "next/link";
import {
  formatDate,
  formatMoney,
  type CustomerDashboard,
} from "./dashboard-api";
import {
  DashboardHeading,
  DashboardMetric,
  DashboardPanel,
  DashboardPreviewNotice,
  DashboardStatus,
  DashboardTable,
} from "./dashboard-ui";

function describeEvent(action: string) {
  return action
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function DashboardOverview({
  dashboard,
}: {
  dashboard: CustomerDashboard;
}) {
  const firstName =
    dashboard.account.name?.trim().split(/\s+/)[0] ||
    dashboard.account.email.split("@")[0] ||
    "there";
  const totalStorageGb = dashboard.servers.reduce(
    (total, server) => total + server.plan.diskGb,
    0,
  );
  const activeTransactions = dashboard.recentTransactions.filter(
    (transaction) => transaction.amountMinor < 0,
  );

  return (
    <>
      <DashboardHeading
        description={`Here’s what’s happening across ${dashboard.organization.name}.`}
        eyebrow="Northstar Cloud / Workspace"
        title={`Good morning, ${firstName} 👋`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex h-10 items-center rounded-xl border border-[#e4e9f1] bg-white px-4 text-xs font-semibold text-[#52617b] hover:bg-[#f8faff]"
              href="/dashboard/servers"
            >
              View services
            </Link>
            <Link
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.2)] hover:bg-blue-700"
              href="/dashboard/deploy"
            >
              <span aria-hidden="true">+</span> Deploy new server
            </Link>
          </div>
        }
      />

      <DashboardPreviewNotice />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetric
          detail={`${dashboard.metrics.activeServers} currently running`}
          icon={<Server size={17} />}
          label="Active servers"
          tone="blue"
          value={String(dashboard.metrics.activeServers)}
        />
        <DashboardMetric
          detail="Recorded wallet charges"
          icon={<CircleDollarSign size={17} />}
          label="Total spending"
          tone="green"
          value={formatMoney(
            dashboard.metrics.monthlySpendMinor,
            dashboard.metrics.currency,
          )}
        />
        <DashboardMetric
          detail="Usage telemetry is not configured"
          icon={<Network size={17} />}
          label="Bandwidth"
          tone="violet"
          value="Unavailable"
        />
        <DashboardMetric
          detail="Current wallet ledger balance"
          icon={<CircleDollarSign size={17} />}
          label="Account balance"
          tone="amber"
          value={formatMoney(
            dashboard.metrics.balanceMinor,
            dashboard.metrics.currency,
          )}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.65fr_1fr]">
        <DashboardPanel>
          <div className="mb-4">
            <h2 className="text-sm font-bold text-[#1d2b48]">
              Resource utilization
            </h2>
            <p className="mt-1 text-[11px] text-[#8a96aa]">
              Live CPU and memory telemetry from your cloud provider
            </p>
          </div>
          <div className="flex min-h-[170px] flex-col items-center justify-center rounded-xl border border-dashed border-[#dfe6f1] bg-[#fafbfe] px-5 text-center">
            <Network className="text-[#9aa8bf]" size={22} />
            <p className="mt-3 text-xs font-semibold text-[#52617b]">
              Telemetry is not connected
            </p>
            <p className="mt-1 max-w-sm text-[10px] leading-5 text-[#8a96aa]">
              Resource charts will appear when a cloud provider supplies
              monitoring data. No sample values are shown.
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-[#8794aa]">
            <Server size={12} />
            {dashboard.metrics.totalServers} server
            {dashboard.metrics.totalServers === 1 ? "" : "s"} registered
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <div className="mb-5">
            <h2 className="text-sm font-bold text-[#1d2b48]">
              Storage allocation
            </h2>
            <p className="mt-1 text-[11px] text-[#8a96aa]">
              Configured storage across your current services
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex size-[76px] shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <HardDrive size={24} />
            </span>
            <div>
              <p className="text-lg font-bold tracking-[-0.03em] text-[#172340]">
                {totalStorageGb} GB
              </p>
              <p className="mt-0.5 text-[10px] text-[#8a96aa]">
                Allocated to listed services
              </p>
              <p className="mt-1.5 text-[10px] font-medium text-[#71809a]">
                Used storage unavailable
              </p>
            </div>
          </div>
          <p className="mt-5 rounded-xl bg-[#f7f9fc] px-3 py-2.5 text-[10px] leading-5 text-[#8290a8]">
            Actual disk utilization requires telemetry from an active cloud
            provider.
          </p>
        </DashboardPanel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_1fr_0.95fr]">
        <DashboardPanel>
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#1d2b48]">
                Recent activity
              </h2>
              <p className="mt-1 text-[11px] text-[#8a96aa]">
                Latest account changes
              </p>
            </div>
            <Link
              className="text-[10px] font-semibold text-blue-600 hover:text-blue-700"
              href="/dashboard/activity"
            >
              View all
            </Link>
          </div>
          {dashboard.recentActivity.length ? (
            <div className="space-y-4">
              {dashboard.recentActivity.slice(0, 4).map((activity) => (
                <div className="flex items-center gap-3" key={activity.id}>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#f2f6ff] text-blue-600">
                    <span className="size-2 rounded-full bg-current" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#35435d]">
                      {describeEvent(activity.action)}
                    </p>
                    <p className="mt-1 truncate text-[10px] text-[#8a96aa]">
                      {activity.resourceType}
                      {activity.resourceId ? ` · ${activity.resourceId}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-[9px] text-[#9aa5b7]">
                    {formatDate(activity.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-[#8a96aa]">
              No account activity has been recorded yet.
            </p>
          )}
        </DashboardPanel>

        <DashboardPanel>
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-[#1d2b48]">
                Recent transactions
              </h2>
              <p className="mt-1 text-[11px] text-[#8a96aa]">
                Wallet ledger entries
              </p>
            </div>
            <Link
              className="text-[10px] font-semibold text-blue-600 hover:text-blue-700"
              href="/dashboard/billing"
            >
              Billing
            </Link>
          </div>
          {dashboard.recentTransactions.length ? (
            <div className="space-y-3.5">
              {dashboard.recentTransactions.slice(0, 4).map((transaction) => (
                <div className="flex items-center gap-3" key={transaction.id}>
                  <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-600">
                    $
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-semibold text-[#35435d]">
                      {transaction.description}
                    </p>
                    <p className="mt-1 text-[9px] text-[#8a96aa]">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  <p className="text-[10px] font-semibold text-[#35435d]">
                    {formatMoney(transaction.amountMinor, transaction.currency)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-[#8a96aa]">
              No wallet transactions are available.
            </p>
          )}
        </DashboardPanel>

        <DashboardPanel>
          <div className="mb-4">
            <h2 className="text-sm font-bold text-[#1d2b48]">
              Workspace status
            </h2>
            <p className="mt-1 text-[11px] text-[#8a96aa]">
              Live account records
            </p>
          </div>
          <div className="space-y-3 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#8290a8]">Registered services</span>
              <strong className="text-[#35435d]">
                {dashboard.metrics.totalServers}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8290a8]">SSH keys</span>
              <strong className="text-[#35435d]">
                {dashboard.metrics.sshKeys}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8290a8]">Open support tickets</span>
              <strong className="text-[#35435d]">
                {dashboard.metrics.supportOpen}
              </strong>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5">
            <p className="text-[10px] font-semibold text-blue-800">
              {dashboard.metrics.activeServers
                ? "Server status from your account"
                : "No cloud services configured"}
            </p>
            <p className="mt-1 text-[9px] leading-4 text-blue-800/80">
              {dashboard.metrics.activeServers
                ? "Status reflects the last saved provider state."
                : "Connect a cloud provider before deploying a server."}
            </p>
          </div>
        </DashboardPanel>
      </div>

      <DashboardPanel className="mt-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-[#1d2b48]">Your services</h2>
            <p className="mt-1 text-[11px] text-[#8a96aa]">
              Cloud resources saved to your workspace
            </p>
          </div>
          <Link
            className="text-[10px] font-semibold text-blue-600 hover:text-blue-700"
            href="/dashboard/servers"
          >
            Manage services →
          </Link>
        </div>
        {dashboard.servers.length ? (
          <DashboardTable
            headers={["Server name", "Region", "IP address", "Plan", "Status"]}
            rows={dashboard.servers.map((server) => [
              <span
                className="font-semibold text-[#34425e]"
                key={`${server.id}-name`}
              >
                {server.name}
                {server.simulated ? (
                  <span className="ml-2 text-[9px] font-normal text-amber-700">
                    Simulated
                  </span>
                ) : null}
              </span>,
              server.region,
              server.ipAddress ?? "Not assigned",
              `${server.plan.cpuCores} vCPU / ${Math.round(server.plan.memoryMb / 1024)} GB`,
              <DashboardStatus
                key={`${server.id}-status`}
                tone={server.status === "Running" ? "green" : "slate"}
              >
                {server.status}
              </DashboardStatus>,
            ])}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-[#dfe6f1] py-10 text-center">
            <Server className="mx-auto text-[#9aa8bf]" size={22} />
            <p className="mt-3 text-xs font-semibold text-[#52617b]">
              No services yet
            </p>
            <p className="mt-1 text-[10px] text-[#8a96aa]">
              Service records will appear here after provider provisioning is
              enabled.
            </p>
          </div>
        )}
      </DashboardPanel>

      <div className="mt-3 flex items-center justify-end gap-3 text-[10px] text-[#9aa5b7]">
        <span>
          Spending shown above:{" "}
          {formatMoney(
            activeTransactions.reduce(
              (total, transaction) => total + Math.abs(transaction.amountMinor),
              0,
            ),
            dashboard.metrics.currency,
          )}{" "}
          in recent recorded charges
        </span>
      </div>
    </>
  );
}
