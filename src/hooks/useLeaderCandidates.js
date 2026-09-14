import { useQuery } from '@tanstack/react-query';

import { getLeaderCandidates } from '../services/leaderCandidateService';

export function useLeaderCandidates(profileId) {
  return useQuery({
    queryKey: [
      'leader-candidates',
      profileId,
    ],
    queryFn: getLeaderCandidates,
    enabled: Boolean(profileId),
    staleTime: 30 * 1000,
    refetchOnMount: 'always',
  });
}