import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getAdminEvents,
  approveEvent,
  rejectEvent,
  getAdminPlaces,
  approvePlace,
  rejectPlace,
  getAdminUsers,
  updateUserRole,
  queryKeys,
  type AdminEventListItem,
  type AdminPlaceListItem,
  type AdminUser,
  type ApprovalStatus,
  type UserRole,
} from "@/services"

export function useAdminEvents(status: ApprovalStatus = "PENDING") {
  return useQuery<AdminEventListItem[], Error>({
    queryKey: [...queryKeys.admin.events, status] as const,
    queryFn: () =>
      getAdminEvents({ status }).then((res) => res.data as AdminEventListItem[]),
  })
}

export function useAdminPlaces(status: ApprovalStatus = "PENDING") {
  return useQuery<AdminPlaceListItem[], Error>({
    queryKey: [...queryKeys.admin.places, status] as const,
    queryFn: () =>
      getAdminPlaces({ status }).then((res) => res.data as AdminPlaceListItem[]),
  })
}

export function useApproveEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => approveEvent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.events })
      qc.invalidateQueries({ queryKey: queryKeys.events.all })
    },
  })
}

export function useRejectEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rejectEvent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.events })
    },
  })
}

export function useApprovePlace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => approvePlace(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.places })
      qc.invalidateQueries({ queryKey: queryKeys.places.all })
    },
  })
}

export function useRejectPlace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => rejectPlace(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.places })
    },
  })
}

export function useAdminUsers() {
  return useQuery<AdminUser[], Error>({
    queryKey: queryKeys.admin.users,
    queryFn: () =>
      getAdminUsers({ limit: 50 }).then((res) => res.data as AdminUser[]),
  })
}

export function useUpdateUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      updateUserRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.admin.users })
    },
  })
}