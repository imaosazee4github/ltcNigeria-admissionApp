import { supabase } from '../utils/supabase';

export const ADMIN_APPLICATION_STATUSES = [
  'pending_ltc_review',
  'correction_required',
  'pending_local_endorsement',
  'pending_final_endorsement',
  'admission_completed',
  'awaiting_room',
  'room_allocated',
  'rejected',
  'withdrawn',
];

export async function getAdminDashboardSummary() {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      application_number,
      status,
      submitted_at,
      completed_at,
      created_at,
      candidate_profiles (
        profiles (
          full_name,
          email
        )
      ),
      admission_intakes (
        id,
        name
      )
    `)
    .in(
      'status',
      ADMIN_APPLICATION_STATUSES
    )
    .order('submitted_at', {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const applications = data || [];

  function countStatus(status) {
    return applications.filter(
      (application) =>
        application.status === status
    ).length;
  }

  const admittedStatuses = [
    'admission_completed',
    'awaiting_room',
    'room_allocated',
  ];

  return {
    total: applications.length,

    pendingLtcReview:
      countStatus(
        'pending_ltc_review'
      ),

    correctionRequired:
      countStatus(
        'correction_required'
      ),

    pendingLocalEndorsement:
      countStatus(
        'pending_local_endorsement'
      ),

    pendingFinalEndorsement:
      countStatus(
        'pending_final_endorsement'
      ),

    admissionCompleted:
      countStatus(
        'admission_completed'
      ),

    awaitingRoom:
      countStatus(
        'awaiting_room'
      ),

    roomAllocated:
      countStatus(
        'room_allocated'
      ),

    rejected:
      countStatus('rejected'),

    admittedStudents:
      applications.filter(
        (application) =>
          admittedStatuses.includes(
            application.status
          )
      ).length,

    recentApplications:
      applications.slice(0, 5),
  };
}

export async function getAdminApplicationQueue() {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      application_number,
      status,
      completion_percentage,
      current_step,
      submitted_at,
      completed_at,
      created_at,

      candidate_profiles (
        id,
        gender,
        ecclesiastical_area_name,
        local_unit_name,

        profiles (
          id,
          full_name,
          email,
          phone
        )
      ),

      admission_intakes (
        id,
        name
      )
    `)
    .in(
      'status',
      ADMIN_APPLICATION_STATUSES
    )
    .order('submitted_at', {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getAdminApplication(
  applicationId
) {
  if (!applicationId) {
    throw new Error(
      'The application ID is required.'
    );
  }

  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      application_number,
      candidate_id,
      intake_id,
      status,
      completion_percentage,
      current_step,
      submitted_at,
      completed_at,
      declaration_accepted_at,
      privacy_consent_at,
      created_at,
      updated_at,

      candidate_profiles (
        id,
        profile_id,
        local_unit_id,
        date_of_birth,
        gender,
        marital_status,
        residential_address,
        city,
        state,
        country,

        ecclesiastical_area_type,
        ecclesiastical_area_name,
        local_unit_type,
        local_unit_name,
        membership_record_number,
        local_leader_name,
        area_leader_name,
        church_unit_verification_status,

        mission_name,
        mission_country,
        mission_start_date,
        mission_end_date,
        missionary_status,

        alternate_phone,
        emergency_contact_name,
        emergency_contact_relationship,
        emergency_contact_phone,
        emergency_contact_address,

        highest_qualification,
        institution_name,
        field_of_study,
        graduation_year,
        skills_experience,
        preferred_programme,

        profiles (
          id,
          full_name,
          email,
          phone
        )
      ),

      admission_intakes (
        id,
        name,
        programme_starts_at
      ),

      application_documents (
        id,
        document_type_id,
        document_subtype,
        original_filename,
        storage_path,
        verification_status,
        uploaded_at,

        document_types (
          id,
          code,
          name
        )
      ),

      application_reviews (
        id,
        decision,
        comments,
        reviewed_at,
        reviewer_id
      ),

      application_endorsements (
        id,
        endorsement_stage,
        decision,
        endorser_id,
        comments,
        created_at
      )
    `)
    .eq('id', applicationId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createDocumentSignedUrl(
  storagePath
) {
  if (!storagePath) {
    throw new Error(
      'The document storage path is required.'
    );
  }

  const { data, error } =
    await supabase.storage
      .from('candidate-documents')
      .createSignedUrl(
        storagePath,
        60 * 5
      );

  if (error) {
    throw new Error(error.message);
  }

  return data.signedUrl;
}

export async function reviewApplication({
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
      'Select an application decision.'
    );
  }

  const { data, error } =
    await supabase.rpc(
      'review_application',
      {
        p_application_id:
          applicationId,

        p_decision:
          decision,

        p_comments:
          comments?.trim() || null,
      }
    );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}