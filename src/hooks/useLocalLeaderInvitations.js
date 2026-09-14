import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createLocalLeaderInvitation,
  getActiveLocalUnits,
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

export function useLocalLeaderInvitations(areaId) {
  const queryClient = useQueryClient();

  const invitationsQuery = useQuery({
    queryKey: [
      'local-leader-invitations',
    ],

    queryFn:
      getMyLocalLeaderInvitations,

    staleTime: 30 * 1000,
  });

  const localUnitsQuery = useQuery({
    queryKey: [
      'active-local-units',
      areaId,
    ],

    queryFn: () =>
      getActiveLocalUnits(areaId),

    enabled: Boolean(areaId),

    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn:
      createLocalLeaderInvitation,

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

    localUnits:
      localUnitsQuery.data || [],

    localUnitsLoading:
      localUnitsQuery.isLoading,

    localUnitsError:
      localUnitsQuery.error,

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