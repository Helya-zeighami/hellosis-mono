"use client"

import { useTranslations } from "next-intl"

import { HttpError } from "@/services"

export function useApiErrorMessage() {
  const t = useTranslations("common.errors")

  return (error: unknown): string => {
    if (error instanceof HttpError) {
      if (error.status === 401) return t("unauthorized")
      if (error.status === 429) return t("rateLimited")
      if (error.status >= 500) return t("server")
    }
    return t("generic")
  }
}
