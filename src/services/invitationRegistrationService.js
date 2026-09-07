import { supabase } from '../utils/supabase';

const PENDING_INVITATION_KEY =
  'pending_leader_invitation_token';

export async function validateLeaderInvitation(
  token
) {
  if (!token) {
    throw new Error(
      'The invitation token is missing.'
    );
  }

  const { data, error } = await supabase.rpc(
    'validate_leader_invitation',
    {
      p_token: token,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function registerInvitedLeader({
  token,
  email,
  fullName,
  phone,
  password,
}) {
  if (!token) {
    throw new Error(
      'The invitation token is missing.'
    );
  }

  localStorage.setItem(
    PENDING_INVITATION_KEY,
    token
  );

  const emailRedirectTo =
    `${window.location.origin}/invitation/${token}`;

  const { data, error } =
    await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,

      options: {
        emailRedirectTo,

        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          registration_source:
            'leader_invitation',
        },
      },
    });

  if (error) {
    localStorage.removeItem(
      PENDING_INVITATION_KEY
    );

    throw new Error(error.message);
  }

  return data;
}

export async function resendLeaderConfirmation({
  token,
  email,
}) {
  if (!token) {
    throw new Error(
      'The invitation token is missing.'
    );
  }

  if (!email) {
    throw new Error(
      'The invited email address is missing.'
    );
  }

  localStorage.setItem(
    PENDING_INVITATION_KEY,
    token
  );

  const emailRedirectTo =
    `${window.location.origin}/invitation/${token}`;

  const { data, error } =
    await supabase.auth.resend({
      type: 'signup',

      email:
        email.trim().toLowerCase(),

      options: {
        emailRedirectTo,
      },
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function acceptLeaderInvitation(
  token
) {
  const invitationToken =
    token ||
    localStorage.getItem(
      PENDING_INVITATION_KEY
    );

  if (!invitationToken) {
    throw new Error(
      'The pending invitation token was not found.'
    );
  }

  const { data, error } = await supabase.rpc(
    'accept_leader_invitation',
    {
      p_token: invitationToken,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  localStorage.removeItem(
    PENDING_INVITATION_KEY
  );

  return data;
}

export function getPendingInvitationToken() {
  return localStorage.getItem(
    PENDING_INVITATION_KEY
  );
}

export function clearPendingInvitationToken() {
  localStorage.removeItem(
    PENDING_INVITATION_KEY
  );
}