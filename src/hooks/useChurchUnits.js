import { useQuery } from '@tanstack/react-query';

import {
  getActiveAreas,
  getCandidateLocalUnit,
  getLocalUnitsByArea,
} from '../services/churchService';

export function useActiveAreas() {
  return useQuery({
    queryKey: ['ecclesiastical-areas'],
    queryFn: getActiveAreas,
  });
}

export function useLocalUnits(areaId) {
  return useQuery({
    queryKey: ['local-units', areaId],
    queryFn: () => getLocalUnitsByArea(areaId),
    enabled: Boolean(areaId),
  });
}

export function useCandidateLocalUnit(localUnitId) {
  return useQuery({
    queryKey: ['candidate-local-unit', localUnitId],
    queryFn: () => getCandidateLocalUnit(localUnitId),
    enabled: Boolean(localUnitId),
  });
}