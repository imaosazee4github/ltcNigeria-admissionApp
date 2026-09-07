import { supabase } from '../utils/supabase';

export async function getLocalEndorsementQueue() {
  const { data, error } = await supabase.rpc(
    'get_local_endorsement_queue'
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    leaderRole:
      data?.leader_role || null,

    areaId:
      data?.area_id || null,

    areaName:
      data?.area_name || null,

    localUnitId:
      data?.local_unit_id || null,

    localUnitName:
      data?.local_unit_name || null,

    localUnitType:
      data?.local_unit_type || null,

    applications:
      data?.applications || [],

    total:
      data?.total || 0,
  };
}

export async function submitLocalEndorsement({
  applicationId,
  decision,
  comments,
}) {
  if (!applicationId) {
    throw new Error(
      'The application ID is required.'
    );
  }

  if (!decision) {
    throw new Error(
      'Select an endorsement decision.'
    );
  }

  const { data, error } = await supabase.rpc(
    'submit_local_endorsement',
    {
      p_application_id: applicationId,
      p_decision: decision,
      p_comments:
        comments?.trim() || null,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}