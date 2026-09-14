import { supabase } from '../utils/supabase';

export async function getLeaderCandidates() {
  const { data, error } = await supabase.rpc(
    'get_leader_candidates'
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    leaderRole: data?.leader_role || null,
    areaId: data?.area_id || null,
    areaName: data?.area_name || null,
    localUnitId: data?.local_unit_id || null,
    localUnitName: data?.local_unit_name || null,
    applications: data?.applications || [],
    total: data?.total || 0,
  };
}