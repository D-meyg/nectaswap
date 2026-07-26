/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/forms/Input";
import { authService } from "@/services/authService";
import { unwrapApiData } from "@/utils/apiData";
import { cn } from "@/lib/utils";
import { NectaLogo } from "@/assets/icons/NectaLogo";

// ── Banners ───────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-(--radius-md) border border-(--color-danger-muted) bg-(--color-danger-subtle) p-3 mb-6">
      <svg width="16" height="16" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
        <path d="M7 1L13 12H1L7 1Z" stroke="#E7000B" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M7 5.5V7.5M7 9.5V9.6" stroke="#E7000B" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <Text variant="caption" color="danger" className="leading-snug">{message}</Text>
    </div>
  );
}

function InfoBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-subtle) p-3 mb-6">
      <Mail size={16} className="shrink-0 mt-0.5 text-(--color-brand)" />
      <Text variant="caption" color="secondary" className="leading-snug">{message}</Text>
    </div>
  );
}

function AuthPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-(--color-bg-page) px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-105 flex flex-col">{children}</div>
    </div>
  );
}

function Footer() {
  return (
    <div className="mt-8 flex items-center justify-center">
      <Text variant="micro" color="muted">© 2026 NectaSwap. All rights reserved.</Text>
    </div>
  );
}

type Step = "request" | "reset" | "done";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [vId, setVId] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const handleRequested = (v_id: string, message: string) => {
    setVId(v_id);
    setInfoMessage(message);
    setStep("reset");
  };

  return (
    <AuthPage>
      {step === "request" && (
        <RequestStep
          email={email}
          setEmail={setEmail}
          onSuccess={handleRequested}
          onBackToLogin={() => navigate("/login")}
        />
      )}
      {step === "reset" && (
        <ResetStep
          email={email}
          vId={vId}
          infoMessage={infoMessage}
          onBack={() => setStep("request")}
          onSuccess={() => setStep("done")}
        />
      )}
      {step === "done" && <DoneStep onDone={() => navigate("/login")} />}
    </AuthPage>
  );
}

// ── Step 1: request a reset code ──────────────────────────
function RequestStep({
  email,
  setEmail,
  onSuccess,
  onBackToLogin,
}: {
  email: string;
  setEmail: (v: string) => void;
  onSuccess: (vId: string, message: string) => void;
  onBackToLogin: () => void;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await authService.forgotPassword({ email });
      const payload = unwrapApiData<any>(response, {});
      const v_id = payload?.v_id ?? "";
      const message =
        response?.message ??
        "If an account exists with that email, a password reset code has been sent.";
      onSuccess(v_id, message);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not send a reset code. Please try again.");
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
        <Text variant="heading" color="primary" as="h1" className="text-[1.625rem]">
          Forgot Password
        </Text>
        <Text variant="body" color="tertiary" className="mt-2 block">
          Enter your admin email and we'll send you a reset code
        </Text>
      </div>

      <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-(--color-border)">
        <Card.Body className="p-6 sm:p-8">
          {error && <ErrorBanner message={error} />}

          <Input
            label="Email Address"
            type="email"
            placeholder="admin@nectaswap.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            leftIcon={<Mail size={16} />}
            className="h-11 text-sm"
          />

          <Button
            variant="primary"
            size="lg"
            loading={loading}
            onClick={handleSubmit}
            className="w-full justify-center h-11 text-sm shadow-sm mt-6"
          >
            {!loading && <KeyRound size={16} />}
            Send Reset Code
          </Button>

          <div className="mt-6 text-center">
            <button
              onClick={onBackToLogin}
              className="inline-flex items-center gap-1.5 text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors focus:outline-none rounded"
            >
              <ArrowLeft size={14} />
              <Text variant="caption" color="inherit" weight="medium" as="span">
                Back to sign in
              </Text>
            </button>
          </div>
        </Card.Body>
      </Card>

      <div className="mt-6 flex items-start gap-3.5 rounded-(--radius-md) bg-white border border-(--color-border) p-4 shadow-sm">
        <ShieldCheck size={20} className="text-(--color-brand) shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <Text variant="caption" color="primary" weight="semibold">
            Protected Account Recovery
          </Text>
          <Text variant="micro" color="tertiary" className="leading-[1.4]">
            For your security, we never reveal whether an email is registered. If your account
            exists, a reset code will arrive shortly.
          </Text>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ── Step 2: enter code + new password ─────────────────────
function ResetStep({
  email,
  vId,
  infoMessage,
  onBack,
  onSuccess,
}: {
  email: string;
  vId: string;
  infoMessage: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError("");
    if (digit && index < 5) document.getElementById(`fp-otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`fp-otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = ["", "", "", "", "", ""];
    digits.split("").forEach((d, i) => { next[i] = d; });
    setOtp(next);
    document.getElementById(`fp-otp-${Math.min(digits.length, 5)}`)?.focus();
  };

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length < 6) return setError("Please enter all 6 digits of the code");
    if (newPassword.length < 8) return setError("Password must be at least 8 characters");
    if (newPassword !== confirm) return setError("Passwords do not match");

    setError("");
    setLoading(true);
    try {
      await authService.resetPassword({ v_id: vId, otp: code, new_password: newPassword });
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Could not reset your password. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("fp-otp-0")?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animation-fade-in relative">
      <button
        onClick={onBack}
        className="absolute -top-2 lg:-top-6 left-0 flex items-center gap-1.5 hover:text-(--color-text-primary) text-(--color-text-secondary) transition-colors p-2 -ml-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-brand)/20"
      >
        <ArrowLeft size={16} />
        <Text variant="caption" color="inherit" weight="medium" as="span">Back</Text>
      </button>

      <div className="text-center mb-8 mt-10 lg:mt-6">
        <div className="flex justify-center mb-5">
          <NectaLogo height={36} className="max-w-none" />
        </div>
        <Text variant="heading" color="primary" as="h1" className="text-2xl">Reset Password</Text>
        <Text variant="body" color="tertiary" className="mt-2 block px-4">
          Enter the code sent to {email || "your email"} and choose a new password
        </Text>
      </div>

      <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-(--color-border)">
        <Card.Body className="p-6 sm:p-8">
          {infoMessage && <InfoBanner message={infoMessage} />}
          {error && <ErrorBanner message={error} />}

          <Text variant="caption" color="secondary" weight="medium" className="block text-center mb-4">
            Reset Code
          </Text>
          <div className="flex items-center justify-between gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`fp-otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className={cn(
                  "h-12 sm:h-14 flex-1 min-w-0 max-w-13 rounded-(--radius-md) border text-center",
                  "text-2xl font-geom font-semibold text-(--color-text-primary)",
                  "bg-white outline-none transition-all shadow-sm",
                  digit ? "border-(--color-brand) ring-1 ring-(--color-brand)/20" : "border-(--color-border-02)",
                  "focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/30 focus:shadow-[0_0_0_4px_rgba(78,43,204,0.1)]",
                )}
              />
            ))}
          </div>

          <div className="space-y-5">
            <Input
              label="New Password"
              type={showPass ? "text" : "password"}
              placeholder="Enter a new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              className="h-11 text-sm"
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
            <Input
              label="Confirm New Password"
              type={showPass ? "text" : "password"}
              placeholder="Re-enter the new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              leftIcon={<Lock size={16} />}
              className="h-11 text-sm"
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            loading={loading}
            onClick={handleSubmit}
            className="w-full justify-center h-11 text-sm shadow-sm mt-6"
          >
            {!loading && <KeyRound size={16} />}
            Reset Password
          </Button>
        </Card.Body>
      </Card>

      <Footer />
    </div>
  );
}

// ── Step 3: success ───────────────────────────────────────
function DoneStep({ onDone }: { onDone: () => void }) {
  return (
    <div className="w-full animation-fade-in">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-5">
          <NectaLogo height={36} className="max-w-none" />
        </div>
        <div className="flex justify-center mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--color-success-subtle)">
            <CheckCircle2 size={28} className="text-(--color-success-mid)" />
          </div>
        </div>
        <Text variant="heading" color="primary" as="h1" className="text-2xl">
          Password Reset
        </Text>
        <Text variant="body" color="tertiary" className="mt-2 block px-4">
          Your password was reset successfully. You can now sign in with your new password.
        </Text>
      </div>

      <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-(--color-border)">
        <Card.Body className="p-6 sm:p-8">
          <Button
            variant="primary"
            size="lg"
            onClick={onDone}
            className="w-full justify-center h-11 text-sm shadow-sm"
          >
            Back to Sign In
          </Button>
        </Card.Body>
      </Card>

      <Footer />
    </div>
  );
}
