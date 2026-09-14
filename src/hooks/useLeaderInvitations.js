import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createAreaLeaderInvitation,
  getActiveInvitationAreas,
  getAreaLeaderInvitations,
} from '../services/invitationService';

export function useAreaLeaderInvitations() {
  const queryClient = useQueryClient();

  const invitationsQuery = useQuery({
    queryKey: ['area-leader-invitations'],
    queryFn: getAreaLeaderInvitations,
    staleTime: 30 * 1000,
  });

  const areasQuery = useQuery({
    queryKey: ['active-invitation-areas'],
    queryFn: getActiveInvitationAreas,
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: createAreaLeaderInvitation,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['area-leader-invitations'],
      });
    },

    onError: (error) => {
      console.error(
        'Invitation creation failed:',
        error
      );
    },
  });

  return {
    ...invitationsQuery,

    areas: areasQuery.data || [],
    areasLoading: areasQuery.isLoading,
    areasError: areasQuery.error,

    createInvitation: createMutation.mutateAsync,
    creatingInvitation: createMutation.isPending,
    creationError: createMutation.error,
  };
}