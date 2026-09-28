"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Link, useRouter } from "@/i18n/navigation"
import { Logo } from "@/components/common/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HttpError, login, signup } from "@/services"
import { useAuthStore } from "@/stores/auth-store"

export default function SignupPage() {
  const t = useTranslations("signup")
  const router = useRouter()
  const setSession = useAuthStore((state) => state.setSession)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [developmentOtp, setDevelopmentOtp] = useState<string | null>(null)

  const signupSchema = z.object({
    firstName: z.string().trim().min(1, t("firstNameRequired")).max(80),
    lastName: z.string().trim().min(1, t("lastNameRequired")).max(80),
    phoneNumber: z.string().regex(/^\+?[1-9]\d{7,14}$/, t("phoneInvalid")),
  })
  const otpSchema = z.object({ otp: z.string().regex(/^\d{6}$/, t("otpInvalid")) })
  const form = useForm<z.infer<typeof signupSchema>>({ resolver: zodResolver(signupSchema) })
  const otpForm = useForm<z.infer<typeof otpSchema>>({ resolver: zodResolver(otpSchema) })

  const requestCode = async (values: z.infer<typeof signupSchema>) => {
    try {
      const response = await signup(values.phoneNumber, values.firstName, values.lastName)
      setPhoneNumber(values.phoneNumber)
      setDevelopmentOtp(response.data?.developmentOtp ?? null)
      toast.success(t("submit"))
    } catch (error) {
      toast.error(error instanceof HttpError && error.status === 409 ? t("errors.conflict") : t("errors.generic"))
    }
  }

  const verifyCode = async (values: z.infer<typeof otpSchema>) => {
    try {
      const response = await login(phoneNumber, values.otp)
      if (!response.data?.accessToken || !response.data.refreshToken || !response.data.user) throw new Error()
      setSession({ accessToken: response.data.accessToken, refreshToken: response.data.refreshToken, user: response.data.user })
      router.replace("/dashboard")
    } catch {
      toast.error(t("errors.generic"))
    }
  }

  const isAwaitingCode = Boolean(phoneNumber)
  return <div className="relative flex min-h-full items-center justify-center overflow-hidden bg-background px-4 py-12"><div className="relative w-full max-w-sm"><div className="mb-8 flex justify-center"><Link href="/"><Logo /></Link></div><Card><CardHeader className="text-center"><CardTitle>{isAwaitingCode ? t("otpTitle") : t("title")}</CardTitle><CardDescription>{isAwaitingCode ? t("otpDescription", { phone: phoneNumber }) : t("description")}</CardDescription></CardHeader><CardContent>{!isAwaitingCode ? <form className="flex flex-col gap-4" noValidate onSubmit={form.handleSubmit(requestCode)}><div className="grid grid-cols-2 gap-3"><div className="flex flex-col gap-2"><Label htmlFor="firstName">{t("firstName")}</Label><Input id="firstName" autoComplete="given-name" {...form.register("firstName")} />{form.formState.errors.firstName && <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>}</div><div className="flex flex-col gap-2"><Label htmlFor="lastName">{t("lastName")}</Label><Input id="lastName" autoComplete="family-name" {...form.register("lastName")} />{form.formState.errors.lastName && <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>}</div></div><div className="flex flex-col gap-2"><Label htmlFor="phoneNumber">{t("phoneLabel")}</Label><Input id="phoneNumber" type="tel" inputMode="tel" autoComplete="tel" placeholder={t("phonePlaceholder")} {...form.register("phoneNumber")} />{form.formState.errors.phoneNumber && <p className="text-xs text-destructive">{form.formState.errors.phoneNumber.message}</p>}</div><Button type="submit">{t("submit")}</Button></form> : <form className="flex flex-col gap-4" noValidate onSubmit={otpForm.handleSubmit(verifyCode)}>{developmentOtp && <div className="rounded-xl bg-muted p-3 text-center"><p className="text-xs">{t("otpDevLabel")}</p><p className="font-mono text-2xl font-bold">{developmentOtp}</p></div>}<div className="flex flex-col gap-2"><Label htmlFor="otp">{t("otpLabel")}</Label><Input id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder={t("otpPlaceholder")} {...otpForm.register("otp")} />{otpForm.formState.errors.otp && <p className="text-xs text-destructive">{otpForm.formState.errors.otp.message}</p>}</div><Button type="submit">{t("submit")}</Button><Button type="button" variant="outline" onClick={() => setPhoneNumber("")}>{t("back")}</Button></form>}</CardContent></Card></div></div>
}
