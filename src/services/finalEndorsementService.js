import { supabase } from '../utils/supabase';

export async function getFinalEndorsementQueue() {
  const { data, error } = await supabase.rpc(
    'get_final_endorsement_queue'
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

    areaType:
      data?.area_type || null,

    applications:
      data?.applications || [],

    total:
      data?.total || 0,
  };
}

export async function getFinalEndorsementApplication(
  applicationId
) {
  if (!applicationId) {
    throw new Error(
      'The application ID is required.'
    );
  }

  /*
   * The database queue is already restricted to the
   * signed-in president's assigned Stake or District.
   */
  const queue =
    await getFinalEndorsementQueue();

  const application =
    queue.applications.find(
      (item) => item.id === applicationId
    );

  if (!application) {
    throw new Error(
      'Application not found or you do not have permission to review it.'
    );
  }

  return {
    ...application,

    leaderRole:
      queue.leaderRole,

    areaId:
      queue.areaId,

    areaName:
      queue.areaName,

    areaType:
      queue.areaType,
  };
}

export async function submitFinalEndorsement({
  applicationId,
  decision,
  comments,
  responses,
}) {
  if (!applicationId) {
    throw new Error(
      'The application ID is required.'
    );
  }

  if (!decision) {
    throw new Error(
      'Select a final endorsement decision.'
    );
  }

  if (
    !responses ||
    typeof responses !== 'object' ||
    Array.isArray(responses)
  ) {
    throw new Error(
      'Complete the final endorsement questions.'
    );
  }

  if (
    ['correction_required', 'rejected'].includes(
      decision
    ) &&
    !comments?.trim()
  ) {
    throw new Error(
      'Comments are required when returning or rejecting an application.'
    );
  }

  const { data, error } = await supabase.rpc(
    'submit_final_endorsement',
    {
      p_application_id:
        applicationId,

      p_decision:
        decision,

      p_responses:
        responses,

      p_comments:
        comments?.trim() || null,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}