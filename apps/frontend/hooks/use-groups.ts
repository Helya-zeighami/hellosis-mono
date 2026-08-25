import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  queryKeys,
  type GroupDetail,
  type GroupListItem,
  type CreateGroupInput,
  type UpdateGroupInput,
} from "@/services"

export function useGroups(search: string, cityId: string | null) {
  return useInfiniteQuery<GroupListItem[], Error>({
    queryKey: [...queryKeys.groups.all, "list", search, cityId] as const,
    queryFn: ({ pageParam }) =>
      getGroups({
        search: search || undefined,
        cityId: cityId || undefined,
        page: pageParam as number,
        limit: 20,
      }).then((res) => res.data as GroupListItem[]),
    getNextPageParam: (lastPage, allPages) =>
      (lastPage?.length ?? 0) === 20 ? allPages.length + 1 : undefined,
    initialPageParam: 1,
  })
}

export function useGroup(id: string) {
  return useQuery<GroupDetail>({
    queryKey: queryKeys.groups.detail(id),
    queryFn: () => getGroup(id).then((res) => res.data as GroupDetail),
    enabled: id.length > 0,
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateGroupInput) => createGroup(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.groups.all })
    },
  })
}

export function useUpdateGroup(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateGroupInput) => updateGroup(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.groups.detail(id) })
      qc.invalidateQueries({ queryKey: queryKeys.groups.all })
    },
  })
}

export function useDeleteGroup(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => deleteGroup(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.groups.all })
    },
  })
}

export function useJoinGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (groupId: string) => joinGroup(groupId),
    onSuccess: (_, groupId) => {
      qc.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) })
      qc.invalidateQueries({ queryKey: queryKeys.groups.all })
    },
  })
}

export function useLeaveGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (groupId: string) => leaveGroup(groupId),
    onSuccess: (_, groupId) => {
      qc.invalidateQueries({ queryKey: queryKeys.groups.detail(groupId) })
      qc.invalidateQueries({ queryKey: queryKeys.groups.all })
    },
  })
}
