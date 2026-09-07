import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  getAdminApplication,
  getAdminApplicationQueue,
  reviewApplication,
} from '../services/adminApplicationService';

export function useAdminApplicationQueue() {
  return useQuery({
    queryKey: ['admin-application-queue'],
    queryFn: getAdminApplicationQueue,
    staleTime: 30 * 1000,
  });
}

export function useAdminApplication(applicationId) {
  const queryClient = useQueryClient();

  const applicationQuery = useQuery({
    queryKey: [
      'admin-application',
      applicationId,
    ],

    queryFn: () =>
      getAdminApplication(applicationId),

    enabled: Boolean(applicationId),

    staleTime: 30 * 1000,
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      decision,
      comments,
    }) => {
      return reviewApplication({
        applicationId,
        decision,
        comments,
      });
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [
            'admin-application',
            applicationId,
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'admin-application-queue',
          ],
        }),
      ]);
    },

    onError: (reviewError) => {
      console.error(
        'Application review failed:',
        reviewError
      );
    },
  });

  return {
    ...applicationQuery,

    submitReview:
      reviewMutation.mutateAsync,

    reviewing:
      reviewMutation.isPending,

    reviewError:
      reviewMutation.error,
  };
}