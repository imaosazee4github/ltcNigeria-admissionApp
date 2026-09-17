import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createHostelRoom,
  getAdminRooms,
  removeHostelRoom,
  setHostelRoomStatus,
  updateHostelRoom,
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

export function useUpdateHostelRoom() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateHostelRoom,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminRoomsQueryKey,
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

        queryClient.invalidateQueries({
          queryKey: [
            'candidate-room-assignment',
          ],
        }),
      ]);
    },

    onError: (error) => {
      console.error(
        'Room update failed:',
        error
      );
    },
  });

  return {
    updateRoom:
      mutation.mutateAsync,

    updating:
      mutation.isPending,

    updateError:
      mutation.error,

    updatedRoom:
      mutation.data,

    resetUpdate:
      mutation.reset,
  };
}

export function useSetHostelRoomStatus() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: setHostelRoomStatus,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminRoomsQueryKey,
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

        queryClient.invalidateQueries({
          queryKey: [
            'candidate-room-assignment',
          ],
        }),
      ]);
    },

    onError: (error) => {
      console.error(
        'Room status update failed:',
        error
      );
    },
  });

  return {
    setRoomStatus:
      mutation.mutateAsync,

    changingStatus:
      mutation.isPending,

    statusError:
      mutation.error,

    statusResult:
      mutation.data,

    resetStatus:
      mutation.reset,
  };
}

export function useRemoveHostelRoom() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: removeHostelRoom,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminRoomsQueryKey,
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
        'Room removal failed:',
        error
      );
    },
  });

  return {
    removeRoom:
      mutation.mutateAsync,

    removing:
      mutation.isPending,

    removalError:
      mutation.error,

    removalResult:
      mutation.data,

    resetRemoval:
      mutation.reset,
  };
}