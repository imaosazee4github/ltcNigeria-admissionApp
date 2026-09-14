import { supabase } from '../utils/supabase';

export async function getAdminEndorsementTracking() {
  const { data, error } = await supabase.rpc(
    'get_admin_endorsement_tracking'
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    applications:
      data?.applications || [],

    total:
      Number(data?.total) || 0,

    pendingLocal:
      Number(data?.pending_local) || 0,

    pendingFinal:
      Number(data?.pending_final) || 0,

    completed:
      Number(data?.completed) || 0,

    warnings:
      Number(data?.warnings) || 0,
  };
}