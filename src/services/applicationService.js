import { supabase } from "../utils/supabase";

export async function getOpenIntake() {
  const currentTime = new Date().toISOString();

  const { data, error } = await supabase
    .from("admission_intakes")
    .select(
      `
      id,
      name,
      application_opens_at,
      application_closes_at,
      programme_starts_at,
      capacity,
      status
    `,
    )
    .eq("status", "open")
    .lte("application_opens_at", currentTime)
    .gte("application_closes_at", currentTime)
    .order("application_opens_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getOrCreateCandidateProfile(profileId) {
  const { data: existingProfile, error: selectError } = await supabase
    .from("candidate_profiles")
    .select(
      `id,
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

      created_at,
      updated_at
`,
    )
    .eq("profile_id", profileId)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (existingProfile) {
    return existingProfile;
  }

  const { data: newProfile, error: insertError } = await supabase
    .from("candidate_profiles")
    .insert({
      profile_id: profileId,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return newProfile;
}

export async function getOrCreateApplication(candidateId, intakeId) {
  const { data: existingApplication, error: selectError } = await supabase
    .from("applications")
    .select(
      `
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
        updated_at
      `,
    )
    .eq("candidate_id", candidateId)
    .eq("intake_id", intakeId)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (existingApplication) {
    return existingApplication;
  }

  const { data: newApplication, error: insertError } = await supabase
    .from("applications")
    .insert({
      candidate_id: candidateId,
      intake_id: intakeId,
      status: "draft",
      current_step: 1,
      completion_percentage: 0,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return newApplication;
}

// NEW: Gets the candidate's latest Admin review
export async function getLatestApplicationReview(
  applicationId
) {
  const { data, error } = await supabase
    .from('application_reviews')
    .select(`
      id,
      application_id,
      decision,
      comments,
      reviewed_at
    `)
    .eq('application_id', applicationId)
    .order('reviewed_at', {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}


export async function getCandidateRoomAssignment() {
  const { data, error } = await supabase.rpc(
    'get_candidate_room_assignment'
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    application:
      data?.application || null,

    roomStatus:
      data?.room_status ||
      'not_available',

    assignment:
      data?.assignment || null,
  };
}

export async function initializeCandidateApplication(
  profileId
) {
  if (!profileId) {
    throw new Error(
      'The profile ID is required.'
    );
  }

  const [
    intake,
    roomAssignment,
  ] = await Promise.all([
    getOpenIntake(),
    getCandidateRoomAssignment(),
  ]);

  /*
   * Room information is independent of
   * whether an intake is currently open.
   *
   * This allows admitted candidates to
   * continue seeing their assigned room
   * after applications have closed.
   */
  if (!intake) {
    return {
      intake: null,
      candidateProfile: null,
      application:
        roomAssignment?.application ||
        null,
      latestReview: null,
      roomAssignment,
    };
  }

  const candidateProfile =
    await getOrCreateCandidateProfile(
      profileId
    );

  const application =
    await getOrCreateApplication(
      candidateProfile.id,
      intake.id
    );

  let latestReview = null;

  if (application) {
    latestReview =
      await getLatestApplicationReview(
        application.id
      );
  }

  return {
    intake,
    candidateProfile,
    application,
    latestReview,
    roomAssignment,
  };
}

// export async function initializeCandidateApplication(
//   profileId
// ) {
//   const intake = await getOpenIntake();

//   if (!intake) {
//     return {
//       intake: null,
//       candidateProfile: null,
//       application: null,
//       latestReview: null,
//     };
//   }

//   const candidateProfile =
//     await getOrCreateCandidateProfile(profileId);

//   const application =
//     await getOrCreateApplication(
//       candidateProfile.id,
//       intake.id
//     );

//   let latestReview = null;

//   if (application) {
//     latestReview =
//       await getLatestApplicationReview(
//         application.id
//       );
//   }

//   return {
//     intake,
//     candidateProfile,
//     application,
//     latestReview,
//   };
// }


// NEW: Resubmits an application after corrections
export async function resubmitCorrectedApplication(
  applicationId
) {
  const { data, error } = await supabase.rpc(
    'resubmit_corrected_application',
    {
      p_application_id: applicationId,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateCandidateProfile(candidateProfileId, updates) {
  const { data, error } = await supabase
    .from("candidate_profiles")
    .update(updates)
    .eq("id", candidateProfileId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateApplicationProgress(
  applicationId,
  currentStep,
  completionPercentage,
) {
  const { data, error } = await supabase
    .from("applications")
    .update({
      current_step: currentStep,
      completion_percentage: completionPercentage,
    })
    .eq("id", applicationId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function submitApplication({
  applicationId,
  acceptDeclaration,
  acceptPrivacy,
}) {
  const { data, error } = await supabase.rpc(
    'submit_candidate_application',
    {
      target_application_id: applicationId,
      accept_declaration: acceptDeclaration,
      accept_privacy: acceptPrivacy,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getCandidateProfileDetails(
  profileId
) {
  if (!profileId) {
    throw new Error(
      'The profile ID is required.'
    );
  }

  const { data, error } = await supabase
    .from('candidate_profiles')
    .select(`
      id,
      profile_id,
      mission_name,
      mission_country,
      mission_start_date,
      mission_end_date,
      missionary_status,
      ecclesiastical_area_type,
      ecclesiastical_area_name,
      local_unit_type,
      local_unit_name,
      membership_record_number
    `)
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateAccountProfile({
  profileId,
  fullName,
  phone,
}) {
  if (!profileId) {
    throw new Error(
      'The profile ID is required.'
    );
  }

  if (!fullName?.trim()) {
    throw new Error(
      'Enter your full name.'
    );
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName.trim(),
      phone: phone?.trim() || null,
    })
    .eq('id', profileId)
    .select(`
      id,
      full_name,
      email,
      phone,
      account_status
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function changeAccountPassword(
  newPassword
) {
  if (!newPassword) {
    throw new Error(
      'Enter your new password.'
    );
  }

  if (newPassword.length < 8) {
    throw new Error(
      'Your password must contain at least 8 characters.'
    );
  }

  const { data, error } =
    await supabase.auth.updateUser({
      password: newPassword,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}