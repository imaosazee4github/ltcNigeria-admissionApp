// import {
//   useMutation,
//   useQuery,
//   useQueryClient,
// } from '@tanstack/react-query';

// import {
//   initializeCandidateApplication,
//   submitApplication,
//   updateApplicationProgress,
//   updateCandidateProfile,
// } from '../services/applicationService';

// export function useApplication(profileId) {
//   const queryClient = useQueryClient();

//   const queryKey = [
//     'candidate-application',
//     profileId,
//   ];

//   const applicationQuery = useQuery({
//     queryKey,

//     queryFn: () =>
//       initializeCandidateApplication(profileId),

//     enabled: Boolean(profileId),

//     staleTime: 30 * 1000,
//   });

//   const profileMutation = useMutation({
//     mutationFn: ({
//       candidateProfileId,
//       updates,
//     }) => {
//       return updateCandidateProfile(
//         candidateProfileId,
//         updates
//       );
//     },

//     onSuccess: (updatedCandidateProfile) => {
//       queryClient.setQueryData(
//         queryKey,
//         (currentData) => {
//           if (!currentData) {
//             return currentData;
//           }

//           return {
//             ...currentData,
//             candidateProfile:
//               updatedCandidateProfile,
//           };
//         }
//       );
//     },

//     onError: (error) => {
//       console.error(
//         'Candidate profile update failed:',
//         error
//       );
//     },
//   });

//   const progressMutation = useMutation({
//     mutationFn: ({
//       applicationId,
//       currentStep,
//       completionPercentage,
//     }) => {
//       return updateApplicationProgress(
//         applicationId,
//         currentStep,
//         completionPercentage
//       );
//     },

//     onSuccess: (updatedApplication) => {
//       queryClient.setQueryData(
//         queryKey,
//         (currentData) => {
//           if (!currentData) {
//             return currentData;
//           }

//           return {
//             ...currentData,
//             application: updatedApplication,
//           };
//         }
//       );
//     },

//     onError: (error) => {
//       console.error(
//         'Application progress update failed:',
//         error
//       );
//     },
//   });

//   const submissionMutation = useMutation({
//     mutationFn: ({
//       applicationId,
//       acceptDeclaration,
//       acceptPrivacy,
//     }) => {
//       return submitApplication({
//         applicationId,
//         acceptDeclaration,
//         acceptPrivacy,
//       });
//     },

//     onSuccess: (submittedApplication) => {
//       queryClient.setQueryData(
//         queryKey,
//         (currentData) => {
//           if (!currentData) {
//             return currentData;
//           }

//           return {
//             ...currentData,
//             application: submittedApplication,
//           };
//         }
//       );
//     },

//     onError: (error) => {
//       console.error(
//         'Application submission failed:',
//         error
//       );
//     },
//   });

//   async function refreshApplication() {
//     await queryClient.invalidateQueries({
//       queryKey,
//     });
//   }

//   return {
//     ...applicationQuery,

//     saveCandidateProfile:
//       profileMutation.mutateAsync,

//     updateProgress:
//       progressMutation.mutateAsync,

//     submitCandidateApplication:
//       submissionMutation.mutateAsync,

//     refreshApplication,

//     savingProfile:
//       profileMutation.isPending,

//     savingProgress:
//       progressMutation.isPending,

//     submittingApplication:
//       submissionMutation.isPending,

//     isSaving:
//       profileMutation.isPending ||
//       progressMutation.isPending ||
//       submissionMutation.isPending,

//     profileSaveError:
//       profileMutation.error,

//     progressSaveError:
//       progressMutation.error,

//     submissionError:
//       submissionMutation.error,
//   };
// }

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
      initializeCandidateApplication(profileId),

    enabled: Boolean(profileId),

    staleTime: 30 * 1000,
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

    onSuccess: (updatedCandidateProfile) => {
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

    onSuccess: (updatedApplication) => {
      queryClient.setQueryData(
        queryKey,
        (currentData) => {
          if (!currentData) {
            return currentData;
          }

          return {
            ...currentData,
            application: updatedApplication,
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

  const submissionMutation = useMutation({
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

  // NEW: Candidate resubmission mutation
  const resubmissionMutation = useMutation({
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

  return {
    ...applicationQuery,

    saveCandidateProfile:
      profileMutation.mutateAsync,

    updateProgress:
      progressMutation.mutateAsync,

    submitCandidateApplication:
      submissionMutation.mutateAsync,

    // NEW
    resubmitCandidateApplication:
      resubmissionMutation.mutateAsync,

    refreshApplication,

    savingProfile:
      profileMutation.isPending,

    savingProgress:
      progressMutation.isPending,

    submittingApplication:
      submissionMutation.isPending,

    // NEW
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

    // NEW
    resubmissionError:
      resubmissionMutation.error,
  };
}