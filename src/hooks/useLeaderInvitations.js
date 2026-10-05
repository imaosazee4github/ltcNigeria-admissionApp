import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createAreaLeaderInvitation,
  deleteAreaLeaderInvitation,
  getActiveInvitationAreas,
  getAreaLeaderInvitations,
  renewAreaLeaderInvitation,
  revokeAreaLeaderInvitation,
} from '../services/invitationService';

const areaLeaderInvitationsQueryKey = [
  'area-leader-invitations',
];

export function useAreaLeaderInvitations() {
  const queryClient = useQueryClient();

  const invitationsQuery = useQuery({
    queryKey:
      areaLeaderInvitationsQueryKey,

    queryFn:
      getAreaLeaderInvitations,

    staleTime:
      30 * 1000,
  });

  const areasQuery = useQuery({
    queryKey: [
      'active-invitation-areas',
    ],

    queryFn:
      getActiveInvitationAreas,

    staleTime:
      5 * 60 * 1000,
  });

  async function refreshInvitations() {
    await queryClient.invalidateQueries({
      queryKey:
        areaLeaderInvitationsQueryKey,
    });
  }

  const createMutation = useMutation({
    mutationFn:
      createAreaLeaderInvitation,

    onSuccess:
      refreshInvitations,

    onError: (error) => {
      console.error(
        'Invitation creation failed:',
        error
      );
    },
  });

  const renewMutation = useMutation({
    mutationFn:
      renewAreaLeaderInvitation,

    onSuccess:
      refreshInvitations,

    onError: (error) => {
      console.error(
        'Invitation renewal failed:',
        error
      );
    },
  });

  const revokeMutation = useMutation({
    mutationFn:
      revokeAreaLeaderInvitation,

    onSuccess:
      refreshInvitations,

    onError: (error) => {
      console.error(
        'Invitation revocation failed:',
        error
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn:
      deleteAreaLeaderInvitation,

    onSuccess:
      refreshInvitations,

    onError: (error) => {
      console.error(
        'Invitation deletion failed:',
        error
      );
    },
  });

  return {
    ...invitationsQuery,

    areas:
      areasQuery.data || [],

    areasLoading:
      areasQuery.isLoading,

    areasError:
      areasQuery.error,

    createInvitation:
      createMutation.mutateAsync,

    creatingInvitation:
      createMutation.isPending,

    creationError:
      createMutation.error,

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