/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  Smartphone,
} from "lucide-react";

import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/forms/Input";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { unwrapApiData } from "@/utils/apiData";
import { cn } from "@/lib/utils";
import { NectaLogo } from "@/assets/icons/NectaLogo";

// ── Error banner ──────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-(--radius-md) border border-(--color-danger-muted) bg-(--color-danger-subtle) p-3 mb-6">
      <svg
        width="16"
        height="16"
        viewBox="0 0 14 14"
        fill="none"
        className="shrink-0 mt-0.5"
      >
        <path
          d="M7 1L13 12H1L7 1Z"
          stroke="#E7000B"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M7 5.5V7.5M7 9.5V9.6"
          stroke="#E7000B"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <Text variant="caption" color="danger" className="leading-snug">
        {message}
      </Text>
    </div>
  );
}

// ── Page wrapper ──────────────────────────────────────────
function AuthPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-(--color-bg-page) px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-[420px] flex flex-col">{children}</div>
    </div>
  );
}

type Step = "login" | "2fa";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState<Step>("login");
  const [userEmail, setUserEmail] = useState("");

  const handleLoginSuccess = (email: string, authPayload?: any) => {
    setUserEmail(email);

    if (authPayload) {
      const user = authPayload.user || authPayload.admin || authPayload.data?.user;
      const token = authPayload.access_token || authPayload.token || authPayload.data?.access_token || authPayload.data?.token;
      const refreshToken = authPayload.refresh_token || authPayload.refreshToken || authPayload.data?.refresh_token || authPayload.data?.refreshToken || "";

      if (user && token) {
        setAuth(user, token, refreshToken);
        navigate("/");
        return;
      }
    }

    setStep("2fa");
  };

  const handleVerified = () => {
    setAuth(
      { id: "1", name: "Super Admin", email: userEmail, role: "super_admin" },
      "demo-token",
      "demo-refresh-token",
    );
    navigate("/");
  };

  const handleSkip = () => {
    setAuth(
      {
        id: "1",
        name: "Super Admin",
        email: "admin@nectaswap.io",
        role: "super_admin",
      },
      "demo-token",
      "demo-refresh-token",
    );
    navigate("/");
  };

  return (
    <AuthPage>
      {step === "login" ? (
        <LoginStep onSuccess={handleLoginSuccess} onSkip={handleSkip} />
      ) : (
        <TwoFAStep
          userEmail={userEmail}
          onVerified={handleVerified}
          onBack={() => setStep("login")}
        />
      )}
    </AuthPage>
  );
}

// ────────────────────────────────────────────────────────────
// LOGIN STEP
// ────────────────────────────────────────────────────────────
interface LoginStepProps {
  onSuccess: (email: string, authPayload?: any) => void;
  onSkip: () => void;
}

function LoginStep({ onSuccess, onSkip }: LoginStepProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      const payload = unwrapApiData<any>(response, {});
      onSuccess(email, payload);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animation-fade-in">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <NectaLogo height={36} className="max-w-none" />
        </div>
        <Text variant="heading" color="primary" as="h1" className="text-[26px]">
          Admin Dashboard
        </Text>
        <Text variant="body" color="tertiary" className="mt-2 block">
          Sign in to access the admin control panel
        </Text>
      </div>

      <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-(--color-border)">
        <Card.Body className="p-6 sm:p-8">
          {error && <ErrorBanner message={error} />}

          <div className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@nectaswap.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              leftIcon={<Mail size={16} />}
              className="h-[44px] text-[14px]"
            />

            <Input
              label="Password"
              type={showPass ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              leftIcon={<Lock size={16} />}
              className="h-[44px] text-[14px]"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="text-(--color-text-muted) hover:text-(--color-text-primary) transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </div>

          <div className="flex items-center justify-between mt-5 mb-7">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative flex items-center justify-center w-[16px] h-[16px]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="peer appearance-none w-full h-full border border-(--color-border-02) rounded-[3px] bg-white checked:bg-(--color-brand) checked:border-(--color-brand) transition-colors cursor-pointer"
                />
                <svg
                  className="absolute w-2.5 h-2.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M3 7.5L5.5 10L11 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <Text
                variant="caption"
                color="secondary"
                as="span"
                className="group-hover:text-(--color-text-primary) transition-colors select-none"
              >
                Remember me
              </Text>
            </label>
            <button className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-brand) rounded">
              <Text variant="caption" color="brand" weight="medium" as="span">
                Forgot password?
              </Text>
            </button>
          </div>

          <Button
            variant="primary"
            size="lg"
            loading={loading}
            onClick={handleSubmit}
            className="w-full justify-center h-[44px] text-[14px] shadow-sm"
          >
            {!loading && <LogIn size={16} />}
            Sign In
          </Button>
        </Card.Body>
      </Card>

      <div className="mt-6 flex items-start gap-3.5 rounded-(--radius-md) bg-white border border-(--color-border) p-4 shadow-sm">
        <ShieldCheck
          size={20}
          className="text-(--color-brand) shrink-0 mt-0.5"
        />
        <div className="flex flex-col gap-1">
          <Text variant="caption" color="primary" weight="semibold">
            Secure Admin Access
          </Text>
          <Text variant="micro" color="tertiary" className="leading-[1.4]">
            This is a protected admin portal. All login attempts are logged and
            monitored. Two-factor authentication is required.
          </Text>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-2">
        <Text variant="micro" color="muted">
          © 2026 NectaSwap. All rights reserved.
        </Text>
        <button
          onClick={onSkip}
          className="hover:underline text-(--color-brand) opacity-80 hover:opacity-100 transition-opacity"
        >
          <Text variant="micro" color="inherit" as="span">
            Demo: Skip to Dashboard →
          </Text>
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// TWO-FACTOR AUTH STEP
// ────────────────────────────────────────────────────────────
interface TwoFAStepProps {
  userEmail: string;
  onVerified: () => void;
  onBack: () => void;
}

function TwoFAStep({ userEmail, onVerified, onBack }: TwoFAStepProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const initial = userEmail.charAt(0).toUpperCase() || "A";

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError("");
    if (digit && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const next = ["", "", "", "", "", ""];
    digits.split("").forEach((d, i) => {
      next[i] = d;
    });
    setOtp(next);
    document.getElementById(`otp-${Math.min(digits.length, 5)}`)?.focus();
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (code === "123456") {
        onVerified();
      } else {
        setError("Invalid verification code. Please try again.");
        setOtp(["", "", "", "", "", ""]);
        document.getElementById("otp-0")?.focus();
      }
    }, 800);
  };

  return (
    <div className="w-full animation-fade-in relative">
      <button
        onClick={onBack}
        className="absolute -top-2 lg:-top-6 left-0 flex items-center gap-1.5 hover:text-(--color-text-primary) text-(--color-text-secondary) transition-colors p-2 -ml-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-brand)/20"
      >
        <ArrowLeft size={16} />
        <Text variant="caption" color="inherit" weight="medium" as="span">
          Back
        </Text>
      </button>

      <div className="text-center mb-8 mt-10 lg:mt-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-(--color-brand)/10 mb-5">
          <Smartphone className="h-7 w-7 text-(--color-brand)" />
        </div>
        <Text variant="heading" color="primary" as="h1" className="text-[24px]">
          Two-Factor Authentication
        </Text>
        <Text variant="body" color="tertiary" className="mt-2 block px-4">
          Enter the 6-digit code from your authenticator app
        </Text>
      </div>

      <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-(--color-border)">
        <Card.Body className="p-6 sm:p-8">
          <div className="flex items-center gap-3.5 rounded-(--radius-md) bg-(--color-bg-subtle) border border-(--color-border) px-4 py-3 mb-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-(--color-brand) to-[#8200DB] shadow-sm">
              <Text variant="caption" color="white" weight="semibold" as="span">
                {initial}
              </Text>
            </div>
            <div className="flex flex-col">
              <Text variant="micro" color="muted" className="mb-0.5">
                Signing in as
              </Text>
              <Text variant="caption" color="primary" weight="medium">
                {userEmail}
              </Text>
            </div>
          </div>

          {error && <ErrorBanner message={error} />}

          <div className="mb-8">
            <Text
              variant="caption"
              color="secondary"
              weight="medium"
              className="block text-center mb-4"
            >
              Authentication Code
            </Text>
            <div
              className="flex items-center justify-between gap-2 sm:gap-3"
              onPaste={handlePaste}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={cn(
                    "h-[52px] w-[46px] sm:h-[56px] sm:w-[52px] rounded-(--radius-md) border text-center",
                    "text-[24px] font-geom font-semibold text-(--color-text-primary)",
                    "bg-white outline-none transition-all shadow-sm",
                    digit
                      ? "border-(--color-brand) ring-1 ring-(--color-brand)/20"
                      : "border-(--color-border-02)",
                    "focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/30 focus:shadow-[0_0_0_4px_rgba(78,43,204,0.1)]",
                  )}
                />
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            loading={loading}
            disabled={otp.join("").length < 6}
            onClick={handleVerify}
            className="w-full justify-center h-[44px] text-[14px] shadow-sm mb-5"
          >
            {!loading && (
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="white" strokeWidth="1.5" />
                <path
                  d="M4.5 7L6.5 9L9.5 5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            Verify & Continue
          </Button>

          <div className="text-center">
            <button className="inline-flex items-center gap-2 text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors focus-visible:outline-none rounded">
              <RefreshCw size={14} />
              <Text variant="caption" color="inherit" weight="medium" as="span">
                Resend code
              </Text>
            </button>
          </div>
        </Card.Body>
      </Card>

      <div className="mt-8 text-center">
        <Text variant="micro" color="tertiary" className="block">
          Demo: Use code{" "}
          <Text variant="micro" color="primary" weight="bold" as="span">
            123456
          </Text>{" "}
          to proceed
        </Text>
      </div>
    </div>
  );
}
