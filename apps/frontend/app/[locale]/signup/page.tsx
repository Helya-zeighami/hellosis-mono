"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { SmartPhone01Icon } from "@hugeicons/core-free-icons";
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
import { HttpError, type SignupData } from "@/services";
import { useSignup } from "@/hooks/use-auth";

export default function SignupPage() {
  const t = useTranslations("signup");
  const router = useRouter();
  const [otp, setOtp] = useState<
    { phoneNumber: string; data: SignupData } | null
  >(null);

  const schema = z.object({
    phoneNumber: z
      .string()
      .min(1, t("phoneRequired"))
      .regex(/^\+?[1-9]\d{7,14}$/, t("phoneInvalid")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { phoneNumber: "" },
  });

  const signupMutation = useSignup();

  const onSubmit = (values: z.infer<typeof schema>) => {
    signupMutation.mutate(values.phoneNumber, {
      onSuccess: (res) => {
        setOtp({ phoneNumber: values.phoneNumber, data: res.data! });
      },
      onError: (error) => {
        if (error instanceof HttpError) {
          if (error.status === 409) {
            toast.error(t("errors.conflict"));
            router.push({
              pathname: "/login",
              query: { phone: values.phoneNumber },
            });
          } else if (error.status === 429) {
            toast.error(t("errors.rateLimit"));
          } else {
            toast.error(t("errors.generic"));
          }
        } else {
          toast.error(t("errors.generic"));
        }
      },
    });
  };

  const continueToLogin = () => {
    if (!otp) return;
    const query: Record<string, string> = { phone: otp.phoneNumber };
    if (otp.data.developmentOtp) {
      query.otp = otp.data.developmentOtp;
    }
    router.push({ pathname: "/login", query });
  };

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

        {otp ? (
          <Card className="text-center">
            <CardHeader className="items-center gap-3 text-center">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-success/10 text-success">
                <HugeiconsIcon icon={SmartPhone01Icon} className="size-6" />
              </span>
              <CardTitle>{t("otpTitle")}</CardTitle>
              <CardDescription>
                {t("otpDescription", { phone: otp.phoneNumber })}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {otp.data.developmentOtp ? (
                <div className="flex flex-col gap-1 rounded-2xl bg-muted px-4 py-3 text-start">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("otpDevLabel")}
                  </span>
                  <span className="font-mono text-2xl font-bold tracking-widest text-foreground">
                    {otp.data.developmentOtp}
                  </span>
                </div>
              ) : null}
              <p className="text-xs text-muted-foreground">{t("otpHint")}</p>
              <Button
                onClick={continueToLogin}
                className="mt-2 w-full"
                size="lg"
              >
                {t("continueToLogin")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setOtp(null)}
                className="w-full"
              >
                {t("back")}
              </Button>
            </CardContent>
          </Card>
        ) : (
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
                <Button
                  type="submit"
                  size="lg"
                  className="mt-2 w-full"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? t("submitting") : t("submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
