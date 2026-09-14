import {
  useQuery,
} from '@tanstack/react-query';

import {
  getAdminEndorsementTracking,
} from '../services/adminEndorsementService';

export const adminEndorsementTrackingKey = [
  'admin-endorsement-tracking',
];

export function useAdminEndorsementTracking() {
  return useQuery({
    queryKey:
      adminEndorsementTrackingKey,

    queryFn:
      getAdminEndorsementTracking,

    staleTime:
      30 * 1000,

    refetchOnMount:
      'always',
  });
}