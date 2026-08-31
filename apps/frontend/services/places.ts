import { http } from "./http"
import type { ApiResponse, City } from "./profile"

export interface PlaceCategory {
  id: string
  name: string
}

export interface PlaceCreator {
  id: string
  profile: {
    firstName: string | null
    lastName: string | null
    avatarUrl: string | null
  } | null
}

export interface PlaceListItem {
  id: string
  name: string
  description: string | null
  cityId: string | null
  address: string | null
  categoryId: string | null
  imageUrl: string | null
  createdById: string | null
  createdAt: string
  updatedAt: string
  city: City | null
  category: PlaceCategory | null
  createdBy: PlaceCreator | null
}

export type PlaceDetail = PlaceListItem

export interface CreatePlaceInput {
  name: string
  description?: string
  cityId?: string
  address?: string
  categoryId?: string
  imageUrl?: string
}

export interface UpdatePlaceInput {
  name?: string
  description?: string
  cityId?: string
  address?: string
  categoryId?: string
  imageUrl?: string
}

export function getPlaces(params: {
  search?: string
  cityId?: string
  categoryId?: string
  page?: number
  limit?: number
}) {
  const searchParams = new URLSearchParams()
  if (params.search) searchParams.set("search", params.search)
  if (params.cityId) searchParams.set("cityId", params.cityId)
  if (params.categoryId) searchParams.set("categoryId", params.categoryId)
  if (params.page) searchParams.set("page", String(params.page))
  if (params.limit) searchParams.set("limit", String(params.limit))
  const qs = searchParams.toString()
  return http.get<ApiResponse<PlaceListItem[]>>(
    `/places${qs ? `?${qs}` : ""}`,
  )
}

export function getPlace(id: string) {
  return http.get<ApiResponse<PlaceDetail>>(`/places/${id}`)
}

export function getPlaceCategories() {
  return http.get<ApiResponse<PlaceCategory[]>>("/place-categories")
}

export function createPlace(data: CreatePlaceInput) {
  return http.post<ApiResponse<PlaceDetail>>("/places", data)
}

export function updatePlace(id: string, data: UpdatePlaceInput) {
  return http.patch<ApiResponse<PlaceDetail>>(`/places/${id}`, data)
}

export function deletePlace(id: string) {
  return http.delete<ApiResponse<null>>(`/places/${id}`)
}
