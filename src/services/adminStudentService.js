import { supabase } from '../utils/supabase';

export async function getAdminAdmittedStudents() {
  const { data, error } = await supabase.rpc(
    'get_admin_admitted_students'
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    summary: {
      total:
        data?.summary?.total || 0,

      withoutGender:
        data?.summary?.without_gender || 0,

      awaitingRoom:
        data?.summary?.awaiting_room || 0,

      roomAllocated:
        data?.summary?.room_allocated || 0,
    },

    students:
      data?.students || [],
  };
}

export async function getAvailableBedSpaces(
  applicationId
) {
  if (!applicationId) {
    throw new Error(
      'The application ID is required.'
    );
  }

  const { data, error } = await supabase.rpc(
    'get_available_bed_spaces',
    {
      p_application_id: applicationId,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    candidate:
      data?.candidate || null,

    currentAssignment:
      data?.current_assignment || null,

    availableCount:
      data?.available_count || 0,

    dormitories:
      data?.dormitories || [],
  };
}

export async function assignCandidateRoom({
  applicationId,
  bedSpaceId,
  notes,
}) {
  if (!applicationId) {
    throw new Error(
      'The application ID is required.'
    );
  }

  if (!bedSpaceId) {
    throw new Error(
      'Select a bed space.'
    );
  }

  const { data, error } = await supabase.rpc(
    'assign_candidate_room',
    {
      p_application_id:
        applicationId,

      p_bed_space_id:
        bedSpaceId,

      p_notes:
        notes?.trim() || null,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function autoAssignCandidateRoom(
  applicationId
) {
  if (!applicationId) {
    throw new Error(
      'The application ID is required.'
    );
  }

  const { data, error } = await supabase.rpc(
    'auto_assign_candidate_room',
    {
      p_application_id:
        applicationId,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function releaseCandidateRoom({
  applicationId,
  reason,
}) {
  if (!applicationId) {
    throw new Error(
      'The application ID is required.'
    );
  }

  if (!reason?.trim()) {
    throw new Error(
      'Enter a reason for releasing this room assignment.'
    );
  }

  const { data, error } = await supabase.rpc(
    'release_candidate_room',
    {
      p_application_id:
        applicationId,

      p_reason:
        reason.trim(),
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}