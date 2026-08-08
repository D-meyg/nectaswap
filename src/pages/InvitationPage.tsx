/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ShieldCheck, UserPlus } from "lucide-react";

import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/forms/Input";
import { authService } from "@/services/authService";
import { unwrapApiData } from "@/utils/apiData";
import { NectaLogo } from "@/assets/icons/NectaLogo";

const MIN_PASSWORD_LENGTH = 8;

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

/**
 * Public route: /invitation/:token
 *
 * An invited admin lands here from their email link. The token comes from the
 * URL, so the only thing they supply is a password. Activation sets the
 * password but does not start a session, so on success we hand them to the
 * login page to sign in normally (including 2FA).
 */
export default function InvitationPage() {
  const navigate = useNavigate();

  // Support both /invitation/:token and /invitation?token=…
  const { token: pathToken } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const token = (pathToken ?? searchParams.get("token") ?? "").trim();

  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token) {
      setError(
        "This invitation link is missing its token. Please use the link from your email.",
      );
      return;
    }
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await authService.acceptInvitation({ token, password });
      const authData = unwrapApiData<any>(response, {}) ?? {};

      // Activation only sets the password — it does not start a session, and
      // sign-in still requires the 2FA step. Send them to login to sign in
      // with the credentials they just created.
      navigate("/login", {
        replace: true,
        state: {
          notice:
            "Your account is now active. Sign in with your email and new password.",
          email: authData.email ?? "",
        },
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "This invitation link is invalid or has expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-(--color-bg-page) px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-105 flex flex-col">
        <div className="w-full animation-fade-in">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <NectaLogo height={36} className="max-w-none" />
            </div>
            <Text
              variant="heading"
              color="primary"
              as="h1"
              className="text-[1.625rem]"
            >
              Accept Your Invitation
            </Text>
            <Text variant="body" color="tertiary" className="mt-2 block">
              Choose a password to activate your admin account
            </Text>
          </div>

          <Card className="shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-(--color-border)">
            <Card.Body className="p-6 sm:p-8">
              {error && <ErrorBanner message={error} />}

              <div className="space-y-5">
                <Input
                  label="Password"
                  type={showPass ? "text" : "password"}
                  placeholder="Create your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  leftIcon={<Lock size={16} />}
                  className="h-11 text-sm"
                  autoFocus
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

                <Text
                  variant="micro"
                  color="tertiary"
                  className="block leading-[1.4]"
                >
                  Must be at least {MIN_PASSWORD_LENGTH} characters.
                </Text>
              </div>

              <Button
                variant="primary"
                size="lg"
                loading={loading}
                onClick={handleSubmit}
                className="mt-7 w-full justify-center h-11 text-sm shadow-sm"
              >
                {!loading && <UserPlus size={16} />}
                Set Password & Continue
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
                This invitation link is single-use and tied to your email
                address. Never share it with anyone.
              </Text>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center">
            <Text variant="micro" color="muted">
              © 2026 NectaSwap. All rights reserved.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
