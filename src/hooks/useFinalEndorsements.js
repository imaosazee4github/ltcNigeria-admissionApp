import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  getFinalEndorsementApplication,
  getFinalEndorsementQueue,
  submitFinalEndorsement,
} from '../services/finalEndorsementService';

export const finalEndorsementQueueKey = [
  'final-endorsement-queue',
];



export function useFinalEndorsementQueue() {
  return useQuery({
    queryKey:
      finalEndorsementQueueKey,

    queryFn:
      getFinalEndorsementQueue,

    staleTime:
      30 * 1000,
  });
}

export function useFinalEndorsementApplication(
  applicationId
) {
  return useQuery({
    queryKey: [
      'final-endorsement-application',
      applicationId,
    ],

    queryFn: () =>
      getFinalEndorsementApplication(
        applicationId
      ),

    enabled:
      Boolean(applicationId),

    staleTime:
      30 * 1000,
  });
}

export function useSubmitFinalEndorsement(
  applicationId
) {
  const queryClient =
    useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      decision,
      comments,
      responses,
    }) =>
      submitFinalEndorsement({
        applicationId,
        decision,
        comments,
        responses,
      }),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            finalEndorsementQueueKey,
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'final-endorsement-application',
            applicationId,
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'candidate-application',
          ],
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'president-dashboard',
          ],
        }),
      ]);
    },

    onError: (error) => {
      console.error(
        'Final endorsement failed:',
        error
      );
    },
  });

  return {
    submitFinalEndorsement:
      mutation.mutateAsync,

    submitting:
      mutation.isPending,

    submissionError:
      mutation.error,

    submissionResult:
      mutation.data,

    resetSubmission:
      mutation.reset,
  };
}