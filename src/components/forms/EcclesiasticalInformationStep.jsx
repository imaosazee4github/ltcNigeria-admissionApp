import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';

export default function EcclesiasticalInformationStep({
  candidateProfile,
  application,
  saveCandidateProfile,
  updateProgress,
}) {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [units, setUnits] = useState([]);
  const [stateName, setStateName] = useState('');
  const [areaId, setAreaId] = useState('');
  const [areaType, setAreaType] = useState(
    candidateProfile.ecclesiastical_area_type || 'stake'
  );
  const [unitType, setUnitType] = useState(
    candidateProfile.local_unit_type || 'branch'
  );
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    local_unit_id: candidateProfile.local_unit_id || '',
    ecclesiastical_area_name: candidateProfile.ecclesiastical_area_name || '',
    ecclesiastical_area_type: candidateProfile.ecclesiastical_area_type || '',
    local_unit_name: candidateProfile.local_unit_name || '',
    local_unit_type: candidateProfile.local_unit_type || '',
    membership_record_number: candidateProfile.membership_record_number || '',
    local_leader_name: candidateProfile.local_leader_name || '',
    area_leader_name: candidateProfile.area_leader_name || '',
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data, error } = await supabase
        .from('ecclesiastical_areas')
        .select('id, name, area_type, state')
        .eq('status', 'active')
        .order('state')
        .order('name');

      if (!mounted) return;
      setLoadingAreas(false);
      if (error) return setMessage(error.message);

      const rows = data || [];
      setAreas(rows);
      const saved = rows.find(
        (area) => area.name === candidateProfile.ecclesiastical_area_name
      );
      if (saved) {
        setStateName(saved.state || '');
        setAreaId(saved.id);
        setAreaType(saved.area_type || 'stake');
        setUnitType(
          candidateProfile.local_unit_type ||
            (saved.area_type === 'district' ? 'branch' : 'ward')
        );
      }
    }
    load();
    return () => { mounted = false; };
  }, [
    candidateProfile.ecclesiastical_area_name,
    candidateProfile.local_unit_type,
  ]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!areaId) {
        setUnits([]);
        return;
      }
      setLoadingUnits(true);
      const { data, error } = await supabase
        .from('local_units')
        .select('id, name, unit_type')
        .eq('area_id', areaId)
        .eq('status', 'active')
        .order('name');

      if (!mounted) return;
      setLoadingUnits(false);
      if (error) return setMessage(error.message);
      setUnits(data || []);
    }
    load();
    return () => { mounted = false; };
  }, [areaId]);

  const states = useMemo(
    () => [...new Set(areas.map((area) => area.state).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b)),
    [areas]
  );

  const availableAreas = useMemo(
    () => areas.filter(
      (area) =>
        area.state === stateName &&
        area.area_type?.toLowerCase() === areaType
    ),
    [areas, stateName, areaType]
  );

  const availableUnits = useMemo(
    () => units.filter(
      (unit) => unit.unit_type?.toLowerCase() === unitType
    ),
    [units, unitType]
  );

  function selectAreaType(type) {
    setAreaType(type);
    setAreaId('');
    setUnits([]);

    const nextUnitType = type === 'district' ? 'branch' : unitType;
    setUnitType(nextUnitType);

    setFormData((current) => ({
      ...current,
      local_unit_id: '',
      ecclesiastical_area_name: '',
      ecclesiastical_area_type: type,
      local_unit_name: '',
      local_unit_type: nextUnitType,
    }));
    setMessage('');
  }

  function selectUnitType(type) {
    if (areaType === 'district' && type === 'ward') return;

    setUnitType(type);
    setFormData((current) => ({
      ...current,
      local_unit_id: '',
      local_unit_name: '',
      local_unit_type: type,
    }));
    setMessage('');
  }

  function selectState(event) {
    setStateName(event.target.value);
    setAreaId('');
    setUnits([]);
    setFormData((current) => ({
      ...current,
      local_unit_id: '',
      ecclesiastical_area_name: '',
      ecclesiastical_area_type: '',
      local_unit_name: '',
      local_unit_type: unitType,
    }));
    setMessage('');
  }

  function selectArea(event) {
    const id = event.target.value;
    const area = areas.find((item) => item.id === id);
    setAreaId(id);
    setUnits([]);
    setFormData((current) => ({
      ...current,
      local_unit_id: '',
      local_unit_name: '',
      local_unit_type: unitType,
      ecclesiastical_area_name: area?.name || '',
      ecclesiastical_area_type: area?.area_type || '',
    }));
    setMessage('');
  }

  function selectUnit(event) {
    const id = event.target.value;
    const unit = units.find((item) => item.id === id);
    setFormData((current) => ({
      ...current,
      local_unit_id: id,
      local_unit_name: unit?.name || '',
      local_unit_type: unit?.unit_type || '',
    }));
    setMessage('');
  }

  function changeText(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setMessage('');
  }

  async function saveInformation(continueToNextStep) {
    if (!stateName || !areaId || !formData.local_unit_id) {
      return setMessage('Select your State/FCT, Stake/District, and Ward/Branch.');
    }
    if (!formData.local_leader_name.trim() || !formData.area_leader_name.trim()) {
      return setMessage('Enter the names of your local and area leaders.');
    }

    try {
      setSaving(true);
      await saveCandidateProfile({
        candidateProfileId: candidateProfile.id,
        updates: {
          local_unit_id: formData.local_unit_id,
          ecclesiastical_area_name: formData.ecclesiastical_area_name,
          ecclesiastical_area_type: formData.ecclesiastical_area_type,
          local_unit_name: formData.local_unit_name,
          local_unit_type: formData.local_unit_type,
          membership_record_number:
            formData.membership_record_number.trim() || null,
          local_leader_name: formData.local_leader_name.trim(),
          area_leader_name: formData.area_leader_name.trim(),
          church_unit_verification_status: 'pending',
        },
      });

      if (continueToNextStep) {
        await updateProgress({
          applicationId: application.id,
          currentStep: 3,
          completionPercentage: 30,
        });
      }
      navigate('/candidate/dashboard');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  const localLeaderLabel = formData.local_unit_type === 'ward'
    ? 'Bishop’s Full Name'
    : 'Branch President’s Full Name';
  const areaLeaderLabel = formData.ecclesiastical_area_type === 'district'
    ? 'District President’s Full Name'
    : 'Stake President’s Full Name';

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={() => navigate('/candidate/dashboard')}
          className="font-medium text-blue-900">← Return to dashboard</button>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <header className="border-b border-slate-200 pb-6">
            <p className="text-sm font-semibold text-blue-700">Step 2 of 7</p>
            <h1 className="mt-2 text-3xl font-bold text-blue-900">Ecclesiastical Information</h1>
            <p className="mt-2 text-slate-600">
              Select the Church unit where your membership record is located.
            </p>
          </header>

          {message && <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">{message}</div>}

          <form onSubmit={(event) => { event.preventDefault(); saveInformation(true); }}
            className="mt-7 space-y-7">
            <section className="space-y-7">
              <RadioCards
                label="Stake or District"
                value={areaType}
                onChange={selectAreaType}
                options={[
                  { value: 'stake', label: 'Stake' },
                  { value: 'district', label: 'District' },
                ]}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <SelectField label="State or FCT" value={stateName} onChange={selectState}
                  disabled={loadingAreas} placeholder={loadingAreas ? 'Loading...' : 'Select State or FCT'}
                  options={states.map((name) => ({ value: name, label: name }))} />
                <SelectField label={`${areaType === 'district' ? 'District' : 'Stake'} Name`}
                  value={areaId} onChange={selectArea} disabled={!stateName}
                  placeholder={`Select ${areaType === 'district' ? 'District' : 'Stake'}`}
                  options={availableAreas.map((area) => ({ value: area.id, label: area.name }))} />
              </div>

              <RadioCards
                label="Ward or Branch"
                value={unitType}
                onChange={selectUnitType}
                options={[
                  {
                    value: 'ward',
                    label: 'Ward',
                    disabled: areaType === 'district',
                  },
                  { value: 'branch', label: 'Branch' },
                ]}
              />

              <SelectField label={`${unitType === 'ward' ? 'Ward' : 'Branch'} Name`}
                value={formData.local_unit_id} onChange={selectUnit}
                disabled={!areaId || loadingUnits}
                placeholder={loadingUnits ? 'Loading...' : `Select ${unitType === 'ward' ? 'Ward' : 'Branch'}`}
                options={availableUnits.map((unit) => ({ value: unit.id, label: unit.name }))} />
            </section>

            <section className="grid gap-5 border-t border-slate-200 pt-7 md:grid-cols-2">
              <TextField label="Membership Record Number" name="membership_record_number"
                value={formData.membership_record_number} onChange={changeText} placeholder="Optional" />
              <TextField label={localLeaderLabel} name="local_leader_name"
                value={formData.local_leader_name} onChange={changeText} required />
              <TextField label={areaLeaderLabel} name="area_leader_name"
                value={formData.area_leader_name} onChange={changeText} required />
            </section>

            <div className="flex flex-col-reverse justify-between gap-3 border-t pt-6 sm:flex-row">
              <button type="button" disabled={saving} onClick={() => saveInformation(false)}
                className="rounded-md border px-6 py-3 font-semibold">Save and Exit</button>
              <button type="submit" disabled={saving || loadingAreas || loadingUnits}
                className="rounded-md bg-blue-900 px-6 py-3 font-semibold text-white disabled:opacity-60">
                {saving ? 'Saving...' : 'Save and Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function RadioCards({ label, value, onChange, options }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-800">
        {label}<span className="text-red-600"> *</span>
      </legend>
      <div className="mt-3 flex flex-wrap gap-4">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex min-w-36 items-center gap-3 rounded-lg border px-5 py-4 font-semibold transition ${
              option.disabled
                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                : value === option.value
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'cursor-pointer border-slate-200 bg-white text-slate-800 hover:border-blue-300'
            }`}
          >
            <input
              type="radio"
              name={label.toLowerCase().replaceAll(' ', '-')}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              disabled={option.disabled}
              className="h-5 w-5 accent-blue-700"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SelectField({ label, value, onChange, options, placeholder, disabled }) {
  return (
    <label className="block text-sm font-medium text-slate-800">
      {label}<span className="text-red-600"> *</span>
      <select value={value} onChange={onChange} disabled={disabled} required
        className="mt-2 w-full rounded-md border bg-white px-3 py-3 disabled:bg-slate-100">
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function TextField({ label, name, value, onChange, placeholder = '', required = false }) {
  return (
    <label className="block text-sm font-medium text-slate-800">
      {label}{required && <span className="text-red-600"> *</span>}
      <input name={name} value={value} onChange={onChange} placeholder={placeholder}
        required={required} className="mt-2 w-full rounded-md border px-3 py-3" />
    </label>
  );
}
