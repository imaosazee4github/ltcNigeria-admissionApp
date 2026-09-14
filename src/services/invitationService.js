import { supabase } from '../utils/supabase';

export async function getActiveInvitationAreas() {
  const { data, error } = await supabase
    .from('ecclesiastical_areas')
    .select(`
      id,
      name,
      area_type,
      state
    `)
    .eq('status', 'active')
    .in('area_type', [
      'stake',
      'district',
    ])
    .order('state')
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getAreaLeaderInvitations() {
  const { data, error } = await supabase
    .from('leader_invitations')
    .select(`
      id,
      invited_full_name,
      invited_email,
      intended_role,
      area_id,
      expires_at,
      accepted_at,
      revoked_at,
      created_at,
      ecclesiastical_areas (
        id,
        name,
        area_type,
        state
      )
    `)
    .in('intended_role', [
      'stake_president',
      'district_president',
    ])
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function createAreaLeaderInvitation({
  fullName,
  email,
  intendedRole,
  areaName,
}) {
  if (
    !fullName?.trim() ||
    !email?.trim() ||
    !intendedRole ||
    !areaName?.trim()
  ) {
    throw new Error(
      'Complete all invitation fields.'
    );
  }

  const { data, error } = await supabase.rpc(
    'create_area_leader_invitation',
    {
      p_invited_full_name:
        fullName.trim(),

      p_invited_email:
        email.trim().toLowerCase(),

      p_intended_role:
        intendedRole,

      p_area_name:
        areaName.trim(),
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.token) {
    throw new Error(
      'Supabase did not return the secure invitation token.'
    );
  }

  return data;
}