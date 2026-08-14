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
  const prefilledPhone = searchParams.get("phone") ?? "";
  const prefilledOtp = searchParams.get("otp") ?? "";

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const schema = z.object({
    phoneNumber: z
      .string()
      .min(1, t("phoneRequired"))
      .regex(/^\+?[1-9]\d{7,14}$/, t("phoneInvalid")),
    otp: z.string().regex(/^\d{6}$/, t("otpInvalid")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { phoneNumber: prefilledPhone, otp: prefilledOtp },
  });

  const loginMutation = useLogin();
  const setSession = useAuthStore((s) => s.setSession);

  const onSubmit = (values: z.infer<typeof schema>) => {
    loginMutation.mutate(
      { phoneNumber: values.phoneNumber, otp: values.otp },
      {
        onSuccess: (res) => {
          if (!res.data) return;
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
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
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
              aria-invalid={!!errors.phoneNumber}
              {...register("phoneNumber")}
            />
            {errors.phoneNumber ? (
              <p className="text-xs text-destructive">
                {errors.phoneNumber.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="otp">{t("otpLabel")}</Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder={t("otpPlaceholder")}
              aria-invalid={!!errors.otp}
              {...register("otp")}
            />
            {errors.otp ? (
              <p className="text-xs text-destructive">{errors.otp.message}</p>
            ) : null}
          </div>

          {errorMessage ? (
            <p className="text-xs text-destructive">{errorMessage}</p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            className="mt-2 w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? t("submitting") : t("submit")}
          </Button>
        </form>

        <div className="mt-4 flex flex-col items-center gap-1 text-center">
          <p className="text-xs text-muted-foreground">{t("noCodeHint")}</p>
          <Link href="/signup" className="text-xs text-primary hover:underline">
            {t("noCodeLink")}
          </Link>
        </div>
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
