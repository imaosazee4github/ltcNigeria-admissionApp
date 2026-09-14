import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createHostelRoom,
  getAdminRooms,
} from '../services/adminRoomService';

export const adminRoomsQueryKey = [
  'admin-rooms',
];

export function useAdminRooms() {
  return useQuery({
    queryKey: adminRoomsQueryKey,

    queryFn: getAdminRooms,

    staleTime: 30 * 1000,
  });
}

export function useCreateHostelRoom() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createHostelRoom,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            adminRoomsQueryKey,
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'admin-admitted-students',
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'admin-dashboard-summary',
          ],
        }),
      ]);
    },

    onError: (error) => {
      console.error(
        'Room creation failed:',
        error
      );
    },
  });

  return {
    createRoom:
      mutation.mutateAsync,

    creating:
      mutation.isPending,

    creationError:
      mutation.error,

    createdRoom:
      mutation.data,

    resetCreation:
      mutation.reset,
  };
}