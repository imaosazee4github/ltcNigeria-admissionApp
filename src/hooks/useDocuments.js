import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  deleteApplicationDocument,
  getActiveDocumentTypes,
  getApplicationDocuments,
  uploadApplicationDocument,
} from '../services/documentService';

export function useDocuments(applicationId) {
  const queryClient = useQueryClient();

  const documentsKey = [
    'application-documents',
    applicationId,
  ];

  const documentTypesQuery = useQuery({
    queryKey: ['document-types'],
    queryFn: getActiveDocumentTypes,
  });

  const documentsQuery = useQuery({
    queryKey: documentsKey,
    queryFn: () =>
      getApplicationDocuments(applicationId),
    enabled: Boolean(applicationId),
  });

  const uploadMutation = useMutation({
    mutationFn: uploadApplicationDocument,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: documentsKey,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApplicationDocument,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: documentsKey,
      });
    },
  });

  return {
    documentTypes:
      documentTypesQuery.data || [],

    documents:
      documentsQuery.data || [],

    loading:
      documentTypesQuery.isLoading ||
      documentsQuery.isLoading,

    error:
      documentTypesQuery.error ||
      documentsQuery.error,

    uploadDocument:
      uploadMutation.mutateAsync,

    deleteDocument:
      deleteMutation.mutateAsync,

    uploading:
      uploadMutation.isPending,

    deleting:
      deleteMutation.isPending,
  };
}