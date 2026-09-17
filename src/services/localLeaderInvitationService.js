import { supabase } from '../utils/supabase';

export async function getMyLeaderAssignment(
  profileId
) {
  if (!profileId) {
    return null;
  }

  const { data, error } = await supabase
    .from('leader_assignments')
    .select(`
      id,
      profile_id,
      leader_role,
      status,
      area_id,
      local_unit_id,
      created_at,

      ecclesiastical_areas (
        id,
        name,
        area_type,
        city,
        state
      ),

      local_units (
        id,
        name,
        unit_type
      )
    `)
    .eq('profile_id', profileId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getActiveLocalUnits(
  areaId
) {
  if (!areaId) {
    return [];
  }

  const { data, error } = await supabase
    .from('local_units')
    .select(`
      id,
      area_id,
      name,
      unit_type
    `)
    .eq('area_id', areaId)
    .eq('status', 'active')
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getMyLocalLeaderInvitations() {
  const { data, error } = await supabase
    .from('leader_invitations')
    .select(`
      id,
      invited_full_name,
      invited_email,
      intended_role,
      area_id,
      local_unit_id,
      expires_at,
      accepted_at,
      revoked_at,
      created_at,

      ecclesiastical_areas (
        id,
        name,
        area_type
      ),

      local_units (
        id,
        name,
        unit_type
      )
    `)
    .in('intended_role', [
      'bishop',
      'branch_president',
    ])
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function createLocalLeaderInvitation({
  fullName,
  email,
  intendedRole,
  localUnitName,
}) {
  if (
    !fullName?.trim() ||
    !email?.trim() ||
    !intendedRole ||
    !localUnitName?.trim()
  ) {
    throw new Error(
      'Complete all invitation fields.'
    );
  }

  const { data, error } = await supabase.rpc(
    'create_local_leader_invitation',
    {
      p_invited_full_name:
        fullName.trim(),

      p_invited_email:
        email.trim().toLowerCase(),

      p_intended_role:
        intendedRole,

      p_local_unit_name:
        localUnitName.trim(),
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}