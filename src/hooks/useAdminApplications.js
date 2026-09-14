import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  getAdminApplication,
  getAdminApplicationQueue,
  getAdminDashboardSummary,
  reviewApplication,
} from '../services/adminApplicationService';

export const adminDashboardKey = [
  'admin-dashboard-summary',
];

export const adminApplicationQueueKey = [
  'admin-application-queue',
];

export function useAdminDashboardSummary() {
  return useQuery({
    queryKey: adminDashboardKey,

    queryFn:
      getAdminDashboardSummary,

    staleTime:
      30 * 1000,
  });
}

export function useAdminApplicationQueue() {
  return useQuery({
    queryKey:
      adminApplicationQueueKey,

    queryFn:
      getAdminApplicationQueue,

    staleTime:
      30 * 1000,
  });
}

export function useAdminApplication(
  applicationId
) {
  const queryClient =
    useQueryClient();

  const applicationQuery = useQuery({
    queryKey: [
      'admin-application',
      applicationId,
    ],

    queryFn: () =>
      getAdminApplication(
        applicationId
      ),

    enabled:
      Boolean(applicationId),

    staleTime:
      30 * 1000,
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      decision,
      comments,
    }) =>
      reviewApplication({
        applicationId,
        decision,
        comments,
      }),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            adminDashboardKey,
        }),

        queryClient.invalidateQueries({
          queryKey:
            adminApplicationQueueKey,
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