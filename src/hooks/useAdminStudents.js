import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  assignCandidateRoom,
  autoAssignCandidateRoom,
  getAdminAdmittedStudents,
  getAvailableBedSpaces,
  releaseCandidateRoom,
} from '../services/adminStudentService';

export const adminStudentsQueryKey = [
  'admin-admitted-students',
];

export function useAdminStudents() {
  return useQuery({
    queryKey:
      adminStudentsQueryKey,

    queryFn:
      getAdminAdmittedStudents,

    staleTime: 30 * 1000,
  });
}

export function useAvailableBedSpaces(
  applicationId,
  enabled = true
) {
  return useQuery({
    queryKey: [
      'available-bed-spaces',
      applicationId,
    ],

    queryFn: () =>
      getAvailableBedSpaces(
        applicationId
      ),

    enabled:
      Boolean(applicationId) &&
      enabled,

    staleTime: 15 * 1000,
  });
}

function invalidateRoomQueries(
  queryClient,
  applicationId
) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey:
        adminStudentsQueryKey,
    }),

    queryClient.invalidateQueries({
      queryKey: [
        'available-bed-spaces',
        applicationId,
      ],
    }),

    queryClient.invalidateQueries({
      queryKey: [
        'admin-rooms',
      ],
    }),

    queryClient.invalidateQueries({
      queryKey: [
        'admin-application-queue',
      ],
    }),

    queryClient.invalidateQueries({
      queryKey: [
        'admin-dashboard-summary',
      ],
    }),

    queryClient.invalidateQueries({
      queryKey: [
        'admin-application',
        applicationId,
      ],
    }),

    queryClient.invalidateQueries({
      queryKey: [
        'candidate-application',
      ],
    }),
  ]);
}

export function useAssignCandidateRoom(
  applicationId
) {
  const queryClient =
    useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      bedSpaceId,
      notes,
    }) =>
      assignCandidateRoom({
        applicationId,
        bedSpaceId,
        notes,
      }),

    onSuccess: async () => {
      await invalidateRoomQueries(
        queryClient,
        applicationId
      );
    },

    onError: (error) => {
      console.error(
        'Manual room assignment failed:',
        error
      );
    },
  });

  return {
    assignRoom:
      mutation.mutateAsync,

    assigning:
      mutation.isPending,

    assignmentError:
      mutation.error,

    assignmentResult:
      mutation.data,

    resetAssignment:
      mutation.reset,
  };
}

export function useAutoAssignCandidateRoom() {
  const queryClient =
    useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      applicationId,
    }) =>
      autoAssignCandidateRoom(
        applicationId
      ),

    onSuccess: async (
      _result,
      variables
    ) => {
      await invalidateRoomQueries(
        queryClient,
        variables.applicationId
      );
    },

    onError: (error) => {
      console.error(
        'Automatic room allocation failed:',
        error
      );
    },
  });

  return {
    autoAssignRoom:
      mutation.mutateAsync,

    autoAssigning:
      mutation.isPending,

    autoAssignmentError:
      mutation.error,

    autoAssignmentResult:
      mutation.data,

    resetAutoAssignment:
      mutation.reset,
  };
}

export function useReleaseCandidateRoom() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: releaseCandidateRoom,

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            'admin-admitted-students',
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'admin-rooms',
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

        queryClient.invalidateQueries({
          queryKey: [
            'candidate-application',
          ],
        }),
      ]);
    },

    onError: (error) => {
      console.error(
        'Room release failed:',
        error
      );
    },
  });

  return {
    releaseRoom:
      mutation.mutateAsync,

    releasing:
      mutation.isPending,

    releaseError:
      mutation.error,

    releaseResult:
      mutation.data,

    resetRelease:
      mutation.reset,
  };
}