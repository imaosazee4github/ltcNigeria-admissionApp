import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  getLocalEndorsementQueue,
  submitLocalEndorsement,
} from '../services/localEndorsementService';

const localEndorsementQueueKey = [
  'local-endorsement-queue',
];

export function useLocalEndorsementQueue() {
  return useQuery({
    queryKey: localEndorsementQueueKey,

    queryFn:
      getLocalEndorsementQueue,

    staleTime: 30 * 1000,
  });
}

export function useSubmitLocalEndorsement(
  applicationId
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      decision,
      comments,
    }) =>
      submitLocalEndorsement({
        applicationId,
        decision,
        comments,
      }),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            localEndorsementQueueKey,
        }),

        queryClient.invalidateQueries({
          queryKey: [
            'local-endorsement-application',
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

    onError: (error) => {
      console.error(
        'Local endorsement failed:',
        error
      );
    },
  });

  return {
    submitEndorsement:
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