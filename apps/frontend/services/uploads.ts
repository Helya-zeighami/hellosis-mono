import { http } from "./http"

interface UploadResponse {
  success: boolean
  data: { url: string } | null
}

export async function uploadImage(file: File) {
  const formData = new FormData()
  formData.append("file", file)
  const response = await http.upload<UploadResponse>("/uploads/image", formData)
  if (!response.data?.url) throw new Error("The image upload did not return a URL")
  return response.data.url
}
