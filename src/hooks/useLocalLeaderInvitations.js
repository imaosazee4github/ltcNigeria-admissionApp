import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createLocalLeaderInvitation,
  getMyLeaderAssignment,
  getMyLocalLeaderInvitations,
} from '../services/localLeaderInvitationService';

export function useLeaderAssignment(profileId) {
  return useQuery({
    queryKey: [
      'leader-assignment',
      profileId,
    ],

    queryFn: () =>
      getMyLeaderAssignment(profileId),

    enabled: Boolean(profileId),

    staleTime: 5 * 60 * 1000,
  });
}

export function useLocalLeaderInvitations() {
  const queryClient = useQueryClient();

  const invitationsQuery = useQuery({
    queryKey: [
      'local-leader-invitations',
    ],

    queryFn: getMyLocalLeaderInvitations,

    staleTime: 30 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: createLocalLeaderInvitation,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [
          'local-leader-invitations',
        ],
      });
    },

    onError: (error) => {
      console.error(
        'Local leader invitation failed:',
        error
      );
    },
  });

  return {
    ...invitationsQuery,

    createInvitation:
      createMutation.mutateAsync,

    creatingInvitation:
      createMutation.isPending,

    creationError:
      createMutation.error,

    invitationResult:
      createMutation.data,

    resetInvitation:
      createMutation.reset,
  };
}