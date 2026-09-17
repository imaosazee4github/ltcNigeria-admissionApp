import { supabase } from '../utils/supabase';

export async function getAdminRooms() {
  const { data, error } = await supabase.rpc(
    'get_admin_rooms'
  );

  if (error) {
    throw new Error(error.message);
  }

  return {
    summary: {
      totalDormitories:
        data?.summary?.total_dormitories || 0,

      totalRooms:
        data?.summary?.total_rooms || 0,

      totalCapacity:
        data?.summary?.total_capacity || 0,

      occupiedSpaces:
        data?.summary?.occupied_spaces || 0,

      availableSpaces:
        data?.summary?.available_spaces || 0,

      unavailableSpaces:
        data?.summary?.unavailable_spaces || 0,
    },

    male: {
      capacity:
        data?.male?.capacity || 0,

      occupied:
        data?.male?.occupied || 0,

      available:
        data?.male?.available || 0,
    },

    female: {
      capacity:
        data?.female?.capacity || 0,

      occupied:
        data?.female?.occupied || 0,

      available:
        data?.female?.available || 0,
    },

    dormitories:
      data?.dormitories || [],
  };
}

export async function createHostelRoom({
  dormitoryId,
  roomName,
  bunkBedCount,
  description,
}) {
  if (!dormitoryId) {
    throw new Error(
      'Select a dormitory.'
    );
  }

  if (!roomName?.trim()) {
    throw new Error(
      'Enter a room or hall name.'
    );
  }

  const parsedBunkBedCount =
    Number(bunkBedCount);

  if (
    !Number.isInteger(parsedBunkBedCount) ||
    parsedBunkBedCount < 1
  ) {
    throw new Error(
      'Enter a valid number of bunk beds.'
    );
  }

  const { data, error } = await supabase.rpc(
    'create_hostel_room',
    {
      p_dormitory_id: dormitoryId,

      p_room_name:
        roomName.trim(),

      p_bunk_bed_count:
        parsedBunkBedCount,

      p_description:
        description?.trim() || null,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}


export async function updateHostelRoom({
  roomId,
  roomName,
  bunkBedCount,
  description,
}) {
  if (!roomId) {
    throw new Error(
      'The room ID is required.'
    );
  }

  if (!roomName?.trim()) {
    throw new Error(
      'Enter a room or hall name.'
    );
  }

  const parsedBunkBedCount =
    Number(bunkBedCount);

  if (
    !Number.isInteger(parsedBunkBedCount) ||
    parsedBunkBedCount < 1
  ) {
    throw new Error(
      'Enter a valid number of bunk beds.'
    );
  }

  const { data, error } = await supabase.rpc(
    'update_hostel_room',
    {
      p_room_id: roomId,

      p_room_name:
        roomName.trim(),

      p_bunk_bed_count:
        parsedBunkBedCount,

      p_description:
        description?.trim() || null,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function setHostelRoomStatus({
  roomId,
  status,
}) {
  if (!roomId) {
    throw new Error(
      'The room ID is required.'
    );
  }

  const allowedStatuses = [
    'available',
    'maintenance',
    'inactive',
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error(
      'Select a valid room status.'
    );
  }

  const { data, error } = await supabase.rpc(
    'set_hostel_room_status',
    {
      p_room_id: roomId,
      p_status: status,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function removeHostelRoom(
  roomId
) {
  if (!roomId) {
    throw new Error(
      'The room ID is required.'
    );
  }

  const { data, error } = await supabase.rpc(
    'remove_hostel_room',
    {
      p_room_id: roomId,
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}