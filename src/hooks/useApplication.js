import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  initializeCandidateApplication,
  resubmitCorrectedApplication,
  submitApplication,
  updateApplicationProgress,
  updateCandidateProfile,
} from '../services/applicationService';

export function useApplication(profileId) {
  const queryClient = useQueryClient();

  const queryKey = [
    'candidate-application',
    profileId,
  ];

  const applicationQuery = useQuery({
    queryKey,

    queryFn: () =>
      initializeCandidateApplication(
        profileId
      ),

    enabled: Boolean(profileId),

    staleTime: 30 * 1000,

    /*
     * Always refresh when the candidate
     * returns to the dashboard.
     */
    refetchOnMount: 'always',

    refetchOnWindowFocus: 'always',

    /*
     * While the candidate is awaiting a
     * room, check periodically for an
     * assignment made by the admin.
     */
    refetchInterval: (query) => {
      const roomStatus =
        query.state.data
          ?.roomAssignment
          ?.roomStatus;

      if (roomStatus === 'awaiting') {
        return 30 * 1000;
      }

      return false;
    },
  });

  const profileMutation = useMutation({
    mutationFn: ({
      candidateProfileId,
      updates,
    }) => {
      return updateCandidateProfile(
        candidateProfileId,
        updates
      );
    },

    onSuccess: async (
      updatedCandidateProfile
    ) => {
      queryClient.setQueryData(
        queryKey,
        (currentData) => {
          if (!currentData) {
            return currentData;
          }

          return {
            ...currentData,

            candidateProfile:
              updatedCandidateProfile,
          };
        }
      );

      /*
       * Refresh room eligibility if the
       * candidate updated their gender.
       */
      await queryClient.invalidateQueries({
        queryKey,
      });
    },

    onError: (error) => {
      console.error(
        'Candidate profile update failed:',
        error
      );
    },
  });

  const progressMutation = useMutation({
    mutationFn: ({
      applicationId,
      currentStep,
      completionPercentage,
    }) => {
      return updateApplicationProgress(
        applicationId,
        currentStep,
        completionPercentage
      );
    },

    onSuccess: (
      updatedApplication
    ) => {
      queryClient.setQueryData(
        queryKey,
        (currentData) => {
          if (!currentData) {
            return currentData;
          }

          return {
            ...currentData,

            application:
              updatedApplication,
          };
        }
      );
    },

    onError: (error) => {
      console.error(
        'Application progress update failed:',
        error
      );
    },
  });

  const submissionMutation =
    useMutation({
      mutationFn: ({
        applicationId,
        acceptDeclaration,
        acceptPrivacy,
      }) => {
        return submitApplication({
          applicationId,
          acceptDeclaration,
          acceptPrivacy,
        });
      },

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey,
        });
      },

      onError: (error) => {
        console.error(
          'Application submission failed:',
          error
        );
      },
    });

  const resubmissionMutation =
    useMutation({
      mutationFn: ({
        applicationId,
      }) => {
        return resubmitCorrectedApplication(
          applicationId
        );
      },

      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey,
        });
      },

      onError: (error) => {
        console.error(
          'Application resubmission failed:',
          error
        );
      },
    });

  async function refreshApplication() {
    await queryClient.invalidateQueries({
      queryKey,
    });
  }

  async function refreshRoomAssignment() {
    await queryClient.invalidateQueries({
      queryKey,
    });
  }

  const roomAssignment =
    applicationQuery.data
      ?.roomAssignment || null;

  return {
    ...applicationQuery,

    roomAssignment,

    roomStatus:
      roomAssignment?.roomStatus ||
      'not_available',

    assignedRoom:
      roomAssignment?.assignment ||
      null,

    saveCandidateProfile:
      profileMutation.mutateAsync,

    updateProgress:
      progressMutation.mutateAsync,

    submitCandidateApplication:
      submissionMutation.mutateAsync,

    resubmitCandidateApplication:
      resubmissionMutation.mutateAsync,

    refreshApplication,

    refreshRoomAssignment,

    savingProfile:
      profileMutation.isPending,

    savingProgress:
      progressMutation.isPending,

    submittingApplication:
      submissionMutation.isPending,

    resubmittingApplication:
      resubmissionMutation.isPending,

    isSaving:
      profileMutation.isPending ||
      progressMutation.isPending ||
      submissionMutation.isPending ||
      resubmissionMutation.isPending,

    profileSaveError:
      profileMutation.error,

    progressSaveError:
      progressMutation.error,

    submissionError:
      submissionMutation.error,

    resubmissionError:
      resubmissionMutation.error,
  };
}