"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getApiErrorMessage, useLoginMutation } from "@/lib/redux/platformApi";

const chartBars = [
  "h-[28%]",
  "h-[40%]",
  "h-[32%]",
  "h-[55%]",
  "h-[48%]",
  "h-[68%]",
  "h-[62%]",
  "h-[82%]",
  "h-[74%]",
  "h-[78%]",
  "h-[56%]",
  "h-[72%]",
];

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");
  const [login, { isLoading: isSubmitting }] = useLoginMutation();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      ...(mode === "signup" ? { name: String(formData.get("name") ?? "") } : {}),
    };

    try {
      const result = await login({ ...payload, mode }).unwrap();

      router.replace(
        mode === "login" && result.user?.globalRole === "SUPER_ADMIN"
          ? "/admin"
          : "/dashboard",
      );
      router.refresh();
    } catch (error) {
      setNotice(getApiErrorMessage(error, "Unable to complete your request."));
    }
  }

  return (
    <main className="min-h-[100svh] bg-[#f1f3f7] p-1 text-[#172340] sm:p-1">
      <div className="mx-auto grid min-h-[calc(100svh-8px)] w-full max-w-[1500px] overflow-hidden rounded-[20px] border border-[#e4e9f2] bg-white shadow-[0_12px_40px_rgba(27,43,78,0.06)] md:grid-cols-[0.94fr_1fr]">
        <section className="relative flex min-h-[500px] flex-col overflow-hidden bg-[linear-gradient(145deg,#1d3f75_0%,#102647_54%,#08172d_100%)] px-7 py-8 text-white sm:px-9 sm:py-10 md:min-h-[calc(100svh-10px)] md:px-[9.5%] md:py-[7.5%]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-[180px] top-[12%] h-[470px] w-[470px] rounded-full border border-white/[0.08] bg-[radial-gradient(circle,transparent_0%,transparent_43%,rgba(255,255,255,0.035)_44%,transparent_66%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-[115px] top-[16%] h-[355px] w-[355px] rounded-full border border-white/[0.09] bg-[radial-gradient(circle,transparent_0%,transparent_43%,rgba(255,255,255,0.035)_44%,transparent_68%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-[60px] top-[21%] h-[245px] w-[245px] rounded-full border border-white/[0.1] bg-[radial-gradient(circle,transparent_0%,transparent_42%,rgba(255,255,255,0.035)_43%,transparent_68%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[230px] -right-[100px] h-[470px] w-[470px] rounded-full bg-[radial-gradient(circle,rgba(35,91,224,0.65),transparent_68%)]"
          />

          <Link
            href="/"
            aria-label="Northstar Cloud home"
            className="relative z-10 inline-flex w-fit items-center gap-2.5"
          >
            <span className="flex size-[26px] items-center justify-center rounded-[8px] bg-white/10">
              <Sparkles aria-hidden="true" size={15} fill="white" strokeWidth={1.5} />
            </span>
            <span className="text-[13px] font-bold tracking-[-0.02em]">
              northstar cloud
            </span>
          </Link>

          <div className="relative z-10 mt-12 sm:mt-[13%]">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#eef2ff] px-3 py-1.5 text-[9px] font-extrabold tracking-[0.09em] text-[#4564f5]">
              <span className="size-1.5 rounded-full bg-[#735dff] shadow-[0_0_0_3px_rgba(115,93,255,0.12)]" />
              YOUR CLOUD, YOUR WAY
            </div>
            <h1 className="mt-2 max-w-[410px] text-[clamp(2rem,4vw,3.55rem)] leading-[0.98] font-extrabold tracking-[-0.065em]">
              Build something
              <span className="block bg-gradient-to-r from-[#c9d2ff] to-[#8f9cff] bg-clip-text text-transparent">
                brilliant.
              </span>
            </h1>
            <p className="mt-4 max-w-[430px] text-[13px] leading-[1.8] text-[#bfcee5]">
              Deploy in minutes, scale with confidence, and keep your projects
              moving with infrastructure that works as hard as you do.
            </p>
          </div>

          <div className="relative z-10 mt-7 max-w-[480px] rounded-[15px] border border-white/[0.12] bg-white/[0.075] p-3.5 shadow-[0_15px_45px_rgba(3,12,30,0.14)] backdrop-blur-sm sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] text-[#d3def0]">
                Workspace overview
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#d9f8ed] px-2 py-1 text-[8px] font-semibold text-[#138765]">
                <span className="size-1 rounded-full bg-[#20b981]" />
                All systems normal
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {[
                { value: "99.9%", label: "Uptime target*" },
                { value: "12ms", label: "Avg. response*" },
                { value: "3", label: "Active servers" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[10px] bg-white/[0.07] px-2.5 py-2.5 sm:px-3"
                >
                  <p className="text-[15px] font-bold tracking-[-0.03em] text-white sm:text-[17px]">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[8px] text-[#c2cde0] sm:text-[9px]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
            <div
              aria-label="Workspace activity trend"
              role="img"
              className="mt-3 flex h-7 items-end gap-1"
            >
              {chartBars.map((height, index) => (
                <span
                  key={index}
                  className={`flex-1 rounded-t-[3px] bg-gradient-to-t from-[#697de3] to-[#8d9af3] ${height}`}
                />
              ))}
            </div>
          </div>

          <ul className="relative z-10 mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-8 text-[9px] text-[#c3d0e5]">
            <li>✓ Simple setup</li>
            <li>✓ Flexible scaling</li>
            <li>✓ Developer-first tools</li>
          </ul>
        </section>

        <section className="flex items-center justify-center bg-white px-7 py-10 sm:px-12 md:px-[12%] md:py-8">
          <div className="w-full max-w-[410px]">
            <p className="text-[9px] font-medium tracking-[0.03em] text-[#8b98b3]">
              {mode === "signup" ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}
            </p>
            <h2 className="mt-2 text-[clamp(1.55rem,2.7vw,2.15rem)] leading-tight font-extrabold tracking-[-0.055em] text-[#192542]">
              {mode === "signup" ? (
                <>
                  Get started for{" "}
                  <span className="bg-gradient-to-r from-[#5e6af4] to-[#7158f6] bg-clip-text text-transparent">
                    free.
                  </span>
                </>
              ) : (
                <>
                  Log in to your{" "}
                  <span className="bg-gradient-to-r from-[#5e6af4] to-[#7158f6] bg-clip-text text-transparent">
                    account.
                  </span>
                </>
              )}
            </h2>
            <p className="mt-1 text-[10px] leading-5 tracking-[-0.01em] text-[#8491ac]">
              {mode === "signup"
                ? "Create your Northstar Cloud account and launch your first project."
                : "Welcome back. Sign in to continue to your Northstar Cloud account."}
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-5 space-y-2.5"
            >
              {mode === "signup" && (
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold text-[#23304d]">
                    Full name
                  </span>
                  <input
                    autoComplete="name"
                    name="name"
                    placeholder="e.g. Alex Morgan"
                    required
                    className="h-9 w-full rounded-[9px] border border-[#dfe5f0] bg-white px-3 text-[10px] text-[#26324d] outline-none transition placeholder:text-[#a2aec4] focus:border-[#536df4] focus:ring-2 focus:ring-[#536df4]/10"
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-1 block text-[9px] font-bold text-[#23304d]">
                  Work email
                </span>
                <input
                  autoComplete="email"
                  name="email"
                  placeholder="you@company.com"
                  required
                  type="email"
                  className="h-9 w-full rounded-[9px] border border-[#dfe5f0] bg-white px-3 text-[10px] text-[#26324d] outline-none transition placeholder:text-[#a2aec4] focus:border-[#536df4] focus:ring-2 focus:ring-[#536df4]/10"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-[9px] font-bold text-[#23304d]">
                  {mode === "signup" ? "Create password" : "Password"}
                </span>
                <span className="relative block">
                  <input
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    minLength={mode === "signup" ? 8 : undefined}
                    name="password"
                    placeholder={
                      mode === "signup" ? "At least 8 characters" : "Your password"
                    }
                    required
                    type={showPassword ? "text" : "password"}
                    className="h-9 w-full rounded-[9px] border border-[#dfe5f0] bg-white px-3 pr-10 text-[10px] text-[#26324d] outline-none transition placeholder:text-[#a2aec4] focus:border-[#536df4] focus:ring-2 focus:ring-[#536df4]/10"
                  />
                  <button
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-[#8b98b3] transition hover:text-[#4555a5]"
                    onClick={() => setShowPassword((visible) => !visible)}
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" size={14} />
                    ) : (
                      <Eye aria-hidden="true" size={14} />
                    )}
                  </button>
                </span>
              </label>

              {mode === "signup" && (
                <label className="flex items-start gap-2 pt-0.5 text-[9px] leading-4 text-[#7b88a2]">
                  <input
                    className="mt-0.5 size-[11px] shrink-0 accent-[#4e67f4]"
                    name="terms"
                    required
                    type="checkbox"
                  />
                  <span>
                    I agree to the{" "}
                    <a
                      className="font-semibold text-[#4c62ed] hover:underline"
                      href="/terms"
                    >
                      <span>Terms of Service</span>
                    </a>{" "}
                    and{" "}
                    <a
                      className="font-semibold text-[#4c62ed] hover:underline"
                      href="/privacy"
                    >
                      <span>Privacy Policy</span>
                    </a>
                    .
                  </span>
                </label>
              )}

              <button
                disabled={isSubmitting}
                className="flex h-[38px] w-full items-center justify-center gap-2 rounded-[9px] bg-[#4565f5] shadow-[0_7px_15px_rgba(69,101,245,0.24)] transition hover:bg-[#3858e9] hover:shadow-[0_9px_20px_rgba(69,101,245,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4565f5]"
                type="submit"
              >
                <span className="text-[10px] font-bold text-white">
                  {isSubmitting
                    ? mode === "signup"
                      ? "Creating account..."
                      : "Signing in..."
                    : mode === "signup"
                      ? "Create account"
                      : "Log in"}
                </span>
                <ArrowRight aria-hidden="true" className="text-white" size={13} />
              </button>
            </form>

            {notice && (
              <p
                aria-live="polite"
                className="mt-2 text-center text-[10px] text-[#b42318]"
              >
                {notice}
              </p>
            )}

            <div className="my-3 flex items-center gap-2.5">
              <span className="h-px flex-1 bg-[#edf0f5]" />
              <span className="text-[8px] font-medium text-[#99a4b9]">
                OR CONTINUE WITH
              </span>
              <span className="h-px flex-1 bg-[#edf0f5]" />
            </div>

            <button
              aria-disabled="true"
              className="flex h-[34px] w-full cursor-not-allowed items-center justify-center gap-2 rounded-[9px] border border-[#dfe5f0] bg-white opacity-70"
              disabled
              title="Google sign-in has not been configured."
              type="button"
            >
              <svg
                aria-hidden="true"
                className="size-[13px]"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#4285F4"
                  d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
                />
                <path
                  fill="#34A853"
                  d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
                />
                <path
                  fill="#FBBC05"
                  d="M12.6 27.7a12 12 0 0 1 0-7.4V15H5.8a20 20 0 0 0 0 18Z"
                />
                <path
                  fill="#EA4335"
                  d="M24 11.9c3 0 5.7 1 7.8 3.1l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.8 15l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4Z"
                />
              </svg>
              <span className="text-[9px] font-bold text-[#25314d]">
                Google sign-in unavailable
              </span>
            </button>

            <p className="mt-3 text-center text-[9px] text-[#8793ab]">
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <Link
                    className="font-bold text-[#4c62ed] hover:underline"
                    href="/login"
                  >
                    Log in
                  </Link>
                </>
              ) : (
                <>
                  New to Northstar Cloud?{" "}
                  <Link
                    className="font-bold text-[#4c62ed] hover:underline"
                    href="/signup"
                  >
                    Create an account
                  </Link>
                </>
              )}
            </p>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-[8px] text-[#a0abc0]">
              <LockKeyhole aria-hidden="true" size={9} />
              Your data is encrypted and protected
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
