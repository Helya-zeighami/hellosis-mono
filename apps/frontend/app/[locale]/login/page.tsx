"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { HugeiconsIcon } from "@hugeicons/react";
import { Login03Icon } from "@hugeicons/core-free-icons";

import { Link, useRouter } from "@/i18n/navigation";

import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { HttpError } from "@/services";
import { useLogin } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

function LoginForm() {
  const t = useTranslations("login");

  const router = useRouter();

  const searchParams = useSearchParams();

  const next = searchParams.get("next") || "/dashboard";

  const [step, setStep] = useState<"phone" | "otp">("phone");

  const [phoneNumber, setPhoneNumber] = useState("");

  const [developmentOtp, setDevelopmentOtp] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginMutation = useLogin();

  const setSession = useAuthStore((state) => state.setSession);

  const phoneSchema = z.object({
    phoneNumber: z
      .string()
      .min(1, t("phoneRequired"))
      .regex(/^\+?[1-9]\d{7,14}$/, t("phoneInvalid")),
  });

  const otpSchema = z.object({
    otp: z.string().regex(/^\d{6}$/, t("otpInvalid")),
  });

  const {
    register: registerPhone,
    handleSubmit: handlePhoneSubmit,
    formState: { errors: phoneErrors },
  } = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
  });

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
  } = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
  });

  const sendOtp = (values: z.infer<typeof phoneSchema>) => {
    setErrorMessage(null);

    loginMutation.mutate(
      {
        phoneNumber: values.phoneNumber,
      },

      {
        onSuccess: (res) => {
          setPhoneNumber(values.phoneNumber);

          setDevelopmentOtp(res.data?.developmentOtp ?? null);

          setStep("otp");

          toast.success("OTP sent");
        },

        onError: (error) => {
          const message =
            error instanceof HttpError ? error.message : t("errors.generic");

          setErrorMessage(message);

          toast.error(message);
        },
      },
    );
  };

  const verifyOtp = (values: z.infer<typeof otpSchema>) => {
    setErrorMessage(null);

    loginMutation.mutate(
      {
        phoneNumber,
        otp: values.otp,
      },

      {
        onSuccess: (res) => {
          if (
            !res.data?.accessToken ||
            !res.data?.refreshToken ||
            !res.data?.user
          ) {
            return;
          }

          setSession({
            accessToken: res.data.accessToken,

            refreshToken: res.data.refreshToken,

            user: res.data.user,
          });

          toast.success(t("success"));

          router.replace(next);
        },

        onError: (error) => {
          const message =
            error instanceof HttpError && error.status === 401
              ? t("errors.invalidOtp")
              : t("errors.generic");

          setErrorMessage(message);

          toast.error(message);
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>{t("title")}</CardTitle>

        <CardDescription>
          {step === "phone" ? t("description") : `OTP sent to ${phoneNumber}`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {step === "phone" ? (
          <form
            onSubmit={handlePhoneSubmit(sendOtp)}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="phoneNumber">{t("phoneLabel")}</Label>

              <Input
                id="phoneNumber"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder={t("phonePlaceholder")}
                aria-invalid={!!phoneErrors.phoneNumber}
                {...registerPhone("phoneNumber")}
              />

              {phoneErrors.phoneNumber && (
                <p className="text-xs text-destructive">
                  {phoneErrors.phoneNumber.message}
                </p>
              )}
            </div>

            {errorMessage && (
              <p className="text-xs text-destructive">{errorMessage}</p>
            )}

            <Button type="submit" size="lg" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Sending..." : "Send OTP"}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={handleOtpSubmit(verifyOtp)}
            className="flex flex-col gap-4"
            noValidate
          >
            {developmentOtp && (
              <div className="rounded-xl bg-muted p-3 text-center">
                <p className="text-xs">Development OTP</p>

                <p className="font-mono text-2xl font-bold">{developmentOtp}</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="otp">{t("otpLabel")}</Label>

              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder={t("otpPlaceholder")}
                aria-invalid={!!otpErrors.otp}
                {...registerOtp("otp")}
              />

              {otpErrors.otp && (
                <p className="text-xs text-destructive">
                  {otpErrors.otp.message}
                </p>
              )}
            </div>

            {errorMessage && (
              <p className="text-xs text-destructive">{errorMessage}</p>
            )}

            <Button type="submit" size="lg" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Verifying..." : "Login"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep("phone");
                setDevelopmentOtp(null);
                setErrorMessage(null);
              }}
            >
              Change phone number
            </Button>
          </form>
        )}

       
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  const t = useTranslations("login");

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -end-40 size-[24rem] rounded-full bg-rose-200/50 blur-3xl dark:bg-rose-500/10"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        <Suspense
          fallback={
            <Card className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
              <HugeiconsIcon
                icon={Login03Icon}
                className="size-5 animate-pulse"
              />

              <span className="text-sm">{t("loading")}</span>
            </Card>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
