import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleLike,
  toggleDislike,
  getEventComments,
  createEventComment,
  deleteEventComment,
  queryKeys,
  type EventDetail,
  type EventListItem,
  type EventComment,
  type CreateEventInput,
  type UpdateEventInput,
} from "@/services"

export function useEvents(search: string, cityId: string | null) {
  return useInfiniteQuery<EventListItem[], Error>({
    queryKey: [...queryKeys.events.all, "list", search, cityId] as const,
    queryFn: ({ pageParam }) =>
      getEvents({
        search: search || undefined,
        cityId: cityId || undefined,
        page: pageParam as number,
        limit: 20,
      }).then((res) => res.data as EventListItem[]),
    getNextPageParam: (lastPage, allPages) =>
      (lastPage?.length ?? 0) === 20 ? allPages.length + 1 : undefined,
    initialPageParam: 1,
  })
}

export function useEvent(id: string) {
  return useQuery<EventDetail>({
    queryKey: queryKeys.events.detail(id),
    queryFn: () => getEvent(id).then((res) => res.data as EventDetail),
    enabled: id.length > 0,
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateEventInput) => createEvent(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.events.all })
    },
  })
}

export function useUpdateEvent(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateEventInput) => updateEvent(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.events.detail(id) })
      qc.invalidateQueries({ queryKey: queryKeys.events.all })
    },
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.events.all })
    },
  })
}

export function useToggleLike(eventId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => toggleLike(eventId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) })
    },
  })
}

export function useToggleDislike(eventId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => toggleDislike(eventId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) })
    },
  })
}

export function useEventComments(eventId: string) {
  return useQuery<EventComment[]>({
    queryKey: [...queryKeys.events.detail(eventId), "comments"],
    queryFn: () =>
      getEventComments(eventId).then((res) => res.data as EventComment[]),
    enabled: eventId.length > 0,
  })
}

export function useCreateEventComment(eventId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => createEventComment(eventId, content),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [...queryKeys.events.detail(eventId), "comments"],
      })
      qc.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) })
    },
  })
}

export function useDeleteEventComment(eventId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) =>
      deleteEventComment(eventId, commentId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: [...queryKeys.events.detail(eventId), "comments"],
      })
      qc.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) })
    },
  })
}
