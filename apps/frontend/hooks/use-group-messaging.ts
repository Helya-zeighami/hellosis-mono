import { useInfiniteQuery } from "@tanstack/react-query"

import { getGroupMessages, queryKeys, type GroupMessage } from "@/services"

const PAGE_SIZE = 50

export function useGroupMessages(groupId: string) {
  return useInfiniteQuery<GroupMessage[]>({
    queryKey: queryKeys.groupMessages.messages(groupId),
    queryFn: ({ pageParam }) =>
      getGroupMessages(groupId, {
        limit: PAGE_SIZE,
        cursor: pageParam as string | undefined,
      }).then((response) => response.data as GroupMessage[]),
    getNextPageParam: (lastPage) =>
      lastPage.length === PAGE_SIZE
        ? lastPage[lastPage.length - 1]?.id
        : undefined,
    initialPageParam: undefined as string | undefined,
    enabled: groupId.length > 0,
  })
}