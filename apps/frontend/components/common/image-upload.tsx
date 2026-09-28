"use client"

import { useId, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, ImageUploadIcon, Loading03Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { uploadImage } from "@/services/uploads"

interface ImageUploadProps { value?: string; onChange: (url: string | undefined) => void; label: string; helpText: string; disabled?: boolean; shape?: "square" | "round" }

export function ImageUpload({ value, onChange, label, helpText, disabled, shape = "square" }: ImageUploadProps) {
  const inputId = useId()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const handleFile = async (file?: File) => {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setError("Choose a JPG, PNG, or WebP image under 5 MB."); return }
    setError(""); setIsUploading(true)
    try { onChange(await uploadImage(file)) } catch { setError("Image upload failed. Please try again.") } finally { setIsUploading(false) }
  }
  return <div className="flex flex-col gap-2"><div className="flex items-center gap-3"><div className={`grid size-20 shrink-0 place-items-center overflow-hidden border border-dashed border-border bg-muted ${shape === "round" ? "rounded-full" : "rounded-2xl"}`}>{value ? <img src={value} alt="" className="size-full object-cover" /> : <HugeiconsIcon icon={ImageUploadIcon} className="size-6 text-muted-foreground" />}</div><div className="flex flex-col items-start gap-1.5"><input id={inputId} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={disabled || isUploading} onChange={(event) => void handleFile(event.target.files?.[0])} /><Button type="button" variant="outline" size="sm" disabled={disabled || isUploading} onClick={() => document.getElementById(inputId)?.click()}><HugeiconsIcon icon={isUploading ? Loading03Icon : ImageUploadIcon} className={isUploading ? "animate-spin" : ""} />{isUploading ? "Uploading…" : label}</Button>{value && <Button type="button" variant="ghost" size="sm" className="h-7 px-1.5 text-muted-foreground" disabled={disabled || isUploading} onClick={() => onChange(undefined)}><HugeiconsIcon icon={Cancel01Icon} /> Remove</Button>}</div></div><p className="text-xs text-muted-foreground">{helpText}</p>{error && <p className="text-xs text-destructive">{error}</p>}</div>
}
