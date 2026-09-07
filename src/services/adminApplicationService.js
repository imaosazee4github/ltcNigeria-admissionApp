import { supabase } from '../utils/supabase';

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
      created_at,
      candidate_profiles (
        id,
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

    .in('status', [
  'pending_ltc_review',
  'correction_required',
  'pending_local_endorsement',
  'pending_area_endorsement',
  'approved',
  'admitted',
  'rejected'
])
    // .in('status', [
    //   'pending_ltc_review',
    //   'correction_required'
    // ])
    .order('submitted_at', {
      ascending: true,
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
      declaration_accepted_at,
      privacy_consent_at,
      created_at,
      updated_at,

      candidate_profiles (
        id,
        profile_id,
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
  const { data, error } = await supabase.storage
    .from('candidate-documents')
    .createSignedUrl(storagePath, 60 * 5);

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
  const { data, error } = await supabase.rpc(
    'review_application',
    {
      p_application_id: applicationId,
      p_decision: decision,
      p_comments: comments?.trim() || null,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}