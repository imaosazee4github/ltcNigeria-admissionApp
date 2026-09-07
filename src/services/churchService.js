import { supabase } from '../utils/supabase';

export async function getActiveAreas() {
  const { data, error } = await supabase
    .from('ecclesiastical_areas')
    .select(`
      id,
      name,
      area_type,
      city,
      state
    `)
    .eq('status', 'active')
    .order('name');

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getLocalUnitsByArea(areaId) {
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

  return data;
}

export async function getCandidateLocalUnit(localUnitId) {
  if (!localUnitId) {
    return null;
  }

  const { data, error } = await supabase
    .from('local_units')
    .select(`
      id,
      name,
      unit_type,
      area_id,
      ecclesiastical_areas (
        id,
        name,
        area_type
      )
    `)
    .eq('id', localUnitId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}