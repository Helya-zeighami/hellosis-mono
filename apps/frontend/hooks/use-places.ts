import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  getPlaces,
  getPlace,
  getPlaceCategories,
  createPlace,
  updatePlace,
  deletePlace,
  queryKeys,
  type PlaceDetail,
  type PlaceListItem,
  type PlaceCategory,
  type CreatePlaceInput,
  type UpdatePlaceInput,
} from "@/services"

export function usePlaces(
  search: string,
  cityId: string | null,
  categoryId: string | null,
) {
  return useInfiniteQuery<PlaceListItem[], Error>({
    queryKey: [
      ...queryKeys.places.all,
      "list",
      search,
      cityId,
      categoryId,
    ] as const,
    queryFn: ({ pageParam }) =>
      getPlaces({
        search: search || undefined,
        cityId: cityId || undefined,
        categoryId: categoryId || undefined,
        page: pageParam as number,
        limit: 20,
      }).then((res) => res.data as PlaceListItem[]),
    getNextPageParam: (lastPage, allPages) =>
      (lastPage?.length ?? 0) === 20 ? allPages.length + 1 : undefined,
    initialPageParam: 1,
  })
}

export function usePlace(id: string) {
  return useQuery<PlaceDetail>({
    queryKey: queryKeys.places.detail(id),
    queryFn: () => getPlace(id).then((res) => res.data as PlaceDetail),
    enabled: id.length > 0,
  })
}

export function usePlaceCategories() {
  return useQuery<PlaceCategory[]>({
    queryKey: queryKeys.places.categories,
    queryFn: () =>
      getPlaceCategories().then(
        (res) => res.data as PlaceCategory[],
      ),
  })
}

export function useCreatePlace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePlaceInput) => createPlace(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.places.all })
    },
  })
}

export function useUpdatePlace(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdatePlaceInput) => updatePlace(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.places.detail(id) })
      qc.invalidateQueries({ queryKey: queryKeys.places.all })
    },
  })
}

export function useDeletePlace() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePlace(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.places.all })
    },
  })
}
