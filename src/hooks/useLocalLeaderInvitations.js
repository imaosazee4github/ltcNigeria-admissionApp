import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createLocalLeaderInvitation,
  deleteLocalLeaderInvitation,
  getActiveLocalUnits,
  getMyLeaderAssignment,
  getMyLocalLeaderInvitations,
  renewLocalLeaderInvitation,
  revokeLocalLeaderInvitation,
} from '../services/localLeaderInvitationService';

const localLeaderInvitationsQueryKey = [
  'local-leader-invitations',
];

export function useLeaderAssignment(
  profileId
) {
  return useQuery({
    queryKey: [
      'leader-assignment',
      profileId,
    ],

    queryFn: () =>
      getMyLeaderAssignment(profileId),

    enabled:
      Boolean(profileId),

    staleTime:
      5 * 60 * 1000,
  });
}

export function useLocalLeaderInvitations(
  areaId
) {
  const queryClient =
    useQueryClient();

  const invitationsQuery = useQuery({
    queryKey:
      localLeaderInvitationsQueryKey,

    queryFn:
      getMyLocalLeaderInvitations,

    staleTime:
      30 * 1000,
  });

  const localUnitsQuery = useQuery({
    queryKey: [
      'active-local-units',
      areaId,
    ],

    queryFn: () =>
      getActiveLocalUnits(areaId),

    enabled:
      Boolean(areaId),

    staleTime:
      5 * 60 * 1000,
  });

  async function refreshInvitations() {
    await queryClient.invalidateQueries({
      queryKey:
        localLeaderInvitationsQueryKey,
    });
  }

  const createMutation = useMutation({
    mutationFn:
      createLocalLeaderInvitation,

    onSuccess:
      refreshInvitations,

    onError: (error) => {
      console.error(
        'Local leader invitation failed:',
        error
      );
    },
  });

  const renewMutation = useMutation({
    mutationFn:
      renewLocalLeaderInvitation,

    onSuccess:
      refreshInvitations,

    onError: (error) => {
      console.error(
        'Local invitation renewal failed:',
        error
      );
    },
  });

  const revokeMutation = useMutation({
    mutationFn:
      revokeLocalLeaderInvitation,

    onSuccess:
      refreshInvitations,

    onError: (error) => {
      console.error(
        'Local invitation revocation failed:',
        error
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn:
      deleteLocalLeaderInvitation,

    onSuccess:
      refreshInvitations,

    onError: (error) => {
      console.error(
        'Local invitation deletion failed:',
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

    renewInvitation:
      renewMutation.mutateAsync,

    renewingInvitation:
      renewMutation.isPending,

    renewalError:
      renewMutation.error,

    renewedInvitation:
      renewMutation.data,

    resetRenewal:
      renewMutation.reset,

    revokeInvitation:
      revokeMutation.mutateAsync,

    revokingInvitation:
      revokeMutation.isPending,

    revocationError:
      revokeMutation.error,

    deleteInvitation:
      deleteMutation.mutateAsync,

    deletingInvitation:
      deleteMutation.isPending,

    deletionError:
      deleteMutation.error,
  };
}