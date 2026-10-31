import type { ReactNode } from "react";

export function DashboardPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[#e7ebf3] bg-white p-5 shadow-[0_8px_24px_rgba(27,43,78,0.035)] sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

export function DashboardHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#5278e8]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-[26px] font-bold tracking-[-0.045em] text-[#172340] sm:text-[30px]">
          {title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#8290a8]">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function DashboardMetric({
  label,
  value,
  detail,
  icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  detail: string;
  icon: ReactNode;
  tone?: "blue" | "green" | "amber" | "violet";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <DashboardPanel className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[#8290a8]">{label}</p>
          <p className="mt-2 text-[27px] font-bold leading-none tracking-[-0.04em] text-[#172340]">
            {value}
          </p>
        </div>
        <span className={`flex size-9 items-center justify-center rounded-xl ${tones[tone]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-[11px] text-[#8290a8]">{detail}</p>
    </DashboardPanel>
  );
}

export function DashboardStatus({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: "green" | "amber" | "blue" | "slate" | "red";
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
    red: "bg-rose-50 text-rose-700 ring-rose-100",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset ${tones[tone]}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function DashboardProgress({
  label,
  value,
  color = "bg-blue-600",
  description,
}: {
  label: string;
  value: number;
  color?: string;
  description?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-[#52617b]">{label}</span>
        <span className="font-semibold text-[#263654]">{value}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-[#edf1f7]"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      {description ? <p className="mt-1.5 text-[10px] text-[#96a1b4]">{description}</p> : null}
    </div>
  );
}

export function DashboardPreviewNotice() {
  return (
    <div className="mb-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-xs leading-5 text-blue-900">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
        i
      </span>
      <p>
        Account, service, and activity records are live. Cloud provisioning,
        telemetry, and payment processing require their respective providers.
      </p>
    </div>
  );
}

export function DashboardTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[#edf0f5] text-[9px] font-bold uppercase tracking-[0.11em] text-[#97a2b5]">
            {headers.map((header) => (
              <th className="px-3 py-3 first:pl-1" key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0f2f6]">
          {rows.map((row, rowIndex) => (
            <tr className="text-xs text-[#4c5a73]" key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td className="px-3 py-3.5 first:pl-1" key={cellIndex}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
