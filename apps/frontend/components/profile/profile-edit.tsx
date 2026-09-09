"use client"

import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, UserCircleIcon } from "@hugeicons/core-free-icons"
import { useFormatter, useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"

import { InterestSelector } from "@/components/profile/interest-selector"
import { CityCombobox } from "@/components/profile/city-combobox"
import {
  useProfile,
  useUpdateProfile,
  useAddProfileInterest,
  useRemoveProfileInterest,
} from "@/hooks/use-profile"
import type { City, UpdateProfileInput } from "@/services"

function EditProfileSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 pb-24">
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-9 w-full rounded-4xl" />
            <Skeleton className="h-9 w-full rounded-4xl" />
          </div>
          <Skeleton className="h-9 w-full rounded-4xl" />
          <Skeleton className="h-9 w-full rounded-4xl" />
          <Skeleton className="h-24 w-full rounded-4xl" />
          <Skeleton className="h-9 w-full rounded-4xl" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-20 rounded-4xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getInitials(firstName?: string | null, lastName?: string | null) {
  const first = firstName?.trim().charAt(0) ?? ""
  const last = lastName?.trim().charAt(0) ?? ""
  return (first + last).toUpperCase() || null
}

export default function EditProfilePage() {
  const t = useTranslations("profile.edit")
  const format = useFormatter()

  const { data: profile, isLoading, isError, refetch } = useProfile()

  const updateProfileMutation = useUpdateProfile()
  const addInterestMutation = useAddProfileInterest()
  const removeInterestMutation = useRemoveProfileInterest()

  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [pendingInterestIds, setPendingInterestIds] = useState<string[]>([])
  const initializedRef = useRef(false)

  const schema = z.object({
    bio: z.string().max(500, t("bioTooLong")),
    avatarUrl: z.union([z.string().url(t("avatarInvalid")), z.literal("")]),
  })

  type FormValues = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { bio: "", avatarUrl: "" },
  })

  const [previewAvatarUrl, setPreviewAvatarUrl] = useState("")

  useEffect(() => {
    if (initializedRef.current || !profile) return

    initializedRef.current = true
    reset({
      bio: profile.bio ?? "",
      avatarUrl: profile.avatarUrl ?? "",
    })
    setPreviewAvatarUrl(profile.avatarUrl ?? "")
    setSelectedCity(profile.city)
    setSelectedInterests(profile.interests.map((interest) => interest.id))
  }, [profile, reset])

  if (isLoading) {
    return <EditProfileSkeleton />
  }

  if (isError || !profile) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-3 px-6 pb-24">
        <div className="flex w-full flex-col items-start gap-3 rounded-2xl bg-destructive/10 p-6 text-sm text-destructive">
          <p>{t("errors.load")}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            {t("retry")}
          </Button>
        </div>
      </div>
    )
  }

  const initials = getInitials(profile.firstName, profile.lastName)
  const birthDate = profile.birthDate
    ? format.dateTime(new Date(profile.birthDate), { dateStyle: "long" })
    : null

  const onSubmit = (values: FormValues) => {
    const payload: UpdateProfileInput = {
      bio: values.bio,
      avatarUrl: values.avatarUrl ? values.avatarUrl : undefined,
      cityId: selectedCity?.id ?? undefined,
    }

    updateProfileMutation.mutate(payload, {
      onSuccess: () => toast.success(t("toasts.updated")),
      onError: () => toast.error(t("errors.update")),
    })
  }

  const handleInterestsChange = (nextIds: string[]) => {
    const previous = selectedInterests
    setSelectedInterests(nextIds)

    const added = nextIds.filter((id) => !previous.includes(id))
    const removed = previous.filter((id) => !nextIds.includes(id))

    added.forEach((id) => {
      setPendingInterestIds((current) => [...current, id])
      addInterestMutation.mutate(id, {
        onSuccess: () => toast.success(t("toasts.interestAdded")),
        onError: () => {
          setSelectedInterests((current) => current.filter((interestId) => interestId !== id))
          toast.error(t("errors.addInterest"))
        },
        onSettled: () => {
          setPendingInterestIds((current) => current.filter((interestId) => interestId !== id))
        },
      })
    })

    removed.forEach((id) => {
      setPendingInterestIds((current) => [...current, id])
      removeInterestMutation.mutate(id, {
        onSuccess: () => toast.success(t("toasts.interestRemoved")),
        onError: () => {
          setSelectedInterests((current) => [...current, id])
          toast.error(t("errors.removeInterest"))
        },
        onSettled: () => {
          setPendingInterestIds((current) => current.filter((interestId) => interestId !== id))
        },
      })
    })
  }

  const interestsPending =
    addInterestMutation.isPending || removeInterestMutation.isPending

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 pb-24">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
            <section className="flex flex-col gap-4">
              <h2 className="font-heading text-sm font-medium text-muted-foreground">
                {t("sections.personal")}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="firstName">{t("fields.firstName")}</Label>
                  <Input id="firstName" value={profile.firstName ?? "—"} readOnly />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="lastName">{t("fields.lastName")}</Label>
                  <Input id="lastName" value={profile.lastName ?? "—"} readOnly />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="birthDate">{t("fields.birthDate")}</Label>
                <Input id="birthDate" value={birthDate ?? "—"} readOnly />
              </div>
              <p className="text-xs text-muted-foreground">{t("identityNote")}</p>
            </section>

            <Separator />

            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-sm font-medium text-muted-foreground">
                {t("sections.avatar")}
              </h2>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <Avatar className="size-16 shrink-0">
                    {previewAvatarUrl && <AvatarImage src={previewAvatarUrl} alt="Avatar" />}
                    <AvatarFallback className="bg-rose-100 text-rose-700">
                      {initials ? (
                        initials
                      ) : (
                        <HugeiconsIcon icon={UserCircleIcon} className="size-8" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <Input
                    type="url"
                    placeholder={t("avatarPlaceholder")}
                    aria-invalid={errors.avatarUrl ? "true" : undefined}
                    {...register("avatarUrl", {
                      onChange: (event) => setPreviewAvatarUrl(event.target.value),
                    })}
                  />
                </div>
                {errors.avatarUrl && (
                  <p className="text-xs text-destructive">{errors.avatarUrl.message}</p>
                )}
              </div>
            </section>

            <Separator />

            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-sm font-medium text-muted-foreground">
                {t("sections.about")}
              </h2>
              <div className="flex flex-col gap-2">
                <Label htmlFor="bio">{t("fields.bio")}</Label>
                <Textarea
                  id="bio"
                  rows={4}
                  placeholder={t("bioPlaceholder")}
                  aria-invalid={errors.bio ? "true" : undefined}
                  {...register("bio")}
                />
                {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
              </div>
            </section>

            <Separator />

            <section className="flex flex-col gap-3">
              <h2 className="font-heading text-sm font-medium text-muted-foreground">
                {t("sections.location")}
              </h2>
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">{t("fields.city")}</Label>
                <CityCombobox
                  selectedCity={selectedCity}
                  onChange={setSelectedCity}
                  placeholder={t("cityPlaceholder")}
                  searchPlaceholder={t("citySearchPlaceholder")}
                  noCityLabel={t("noCity")}
                  noResultsLabel={t("cityNoResults")}
                  typeToSearchLabel={t("cityTypeToSearch")}
                  searchErrorLabel={t("citySearchError")}
                  retryLabel={t("cityRetry")}
                />
              </div>
            </section>

            <Separator />

            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-sm font-medium text-muted-foreground">
                  {t("sections.interests")}
                </h2>
                {interestsPending && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <HugeiconsIcon icon={Loading03Icon} className="size-3 animate-spin" />
                    {t("savingInterests")}
                  </span>
                )}
              </div>
              <InterestSelector
                selectedIds={selectedInterests}
                pendingIds={pendingInterestIds}
                onChange={handleInterestsChange}
                disabled={interestsPending}
              />
            </section>

            <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Link href="/dashboard/profile" className={buttonVariants({ variant: "outline" })}>
                {t("cancel")}
              </Link>
              <Button type="submit" size="lg" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending && (
                  <HugeiconsIcon icon={Loading03Icon} className="animate-spin" />
                )}
                {updateProfileMutation.isPending ? t("saving") : t("save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
