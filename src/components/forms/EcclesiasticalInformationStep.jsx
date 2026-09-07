// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// import {
//   useActiveAreas,
//   useCandidateLocalUnit,
//   useLocalUnits,
// } from '../../hooks/useChurchUnits';

// export default function EcclesiasticalInformationStep({
//   candidateProfile,
//   application,
//   saveCandidateProfile,
//   updateProgress,
// }) {
//   const navigate = useNavigate();

//   const [areaId, setAreaId] = useState('');
//   const [localUnitId, setLocalUnitId] = useState(
//     candidateProfile.local_unit_id || ''
//   );

//   const [message, setMessage] = useState('');
//   const [saving, setSaving] = useState(false);

//   const {
//     data: areas = [],
//     isLoading: areasLoading,
//     error: areasError,
//   } = useActiveAreas();

//   const {
//     data: savedLocalUnit,
//     isLoading: savedUnitLoading,
//   } = useCandidateLocalUnit(candidateProfile.local_unit_id);

//   const {
//     data: localUnits = [],
//     isLoading: unitsLoading,
//     error: unitsError,
//   } = useLocalUnits(areaId);

//   useEffect(() => {
//     if (savedLocalUnit?.area_id) {
//       setAreaId(savedLocalUnit.area_id);
//       setLocalUnitId(savedLocalUnit.id);
//     }
//   }, [savedLocalUnit]);

//   function handleAreaChange(event) {
//     setAreaId(event.target.value);
//     setLocalUnitId('');
//     setMessage('');
//   }

//   async function handleSubmit(event) {
//     event.preventDefault();
//     setMessage('');

//     if (!areaId || !localUnitId) {
//       setMessage(
//         'Select your stake or district and your ward or branch.'
//       );
//       return;
//     }

//     try {
//       setSaving(true);

//       await saveCandidateProfile({
//         candidateProfileId: candidateProfile.id,
//         updates: {
//           local_unit_id: localUnitId,
//         },
//       });

//       await updateProgress({
//         applicationId: application.id,
//         currentStep: 3,
//         completionPercentage: 30,
//       });

//       navigate('/candidate/dashboard');
//     } catch (error) {
//       setMessage(error.message);
//     } finally {
//       setSaving(false);
//     }
//   }

//   if (areasLoading || savedUnitLoading) {
//     return (
//       <ApplicationMessage message="Loading Church units..." />
//     );
//   }

//   if (areasError) {
//     return (
//       <ApplicationMessage
//         error
//         message={areasError.message}
//       />
//     );
//   }

//   return (
//     <main className="min-h-screen bg-slate-50 p-5 md:p-8">
//       <div className="mx-auto max-w-5xl">
//         <button
//           type="button"
//           onClick={() => navigate('/candidate/dashboard')}
//           className="font-medium text-blue-900"
//         >
//           ← Return to dashboard
//         </button>

//         <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
//           <header className="border-b border-slate-200 pb-6">
//             <p className="text-sm font-semibold text-blue-700">
//               Step 2 of 7
//             </p>

//             <h1 className="mt-2 text-3xl font-bold text-blue-900">
//               Ecclesiastical Information
//             </h1>

//             <p className="mt-2 text-slate-600">
//               Select the Church area and local unit where your
//               membership record is located.
//             </p>
//           </header>

//           {message && (
//             <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//               {message}
//             </div>
//           )}

//           <form
//             onSubmit={handleSubmit}
//             className="mt-7 space-y-6"
//           >
//             <div>
//               <label
//                 htmlFor="area"
//                 className="mb-2 block text-sm font-medium"
//               >
//                 Stake or District
//               </label>

//               <select
//                 id="area"
//                 value={areaId}
//                 onChange={handleAreaChange}
//                 required
//                 className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
//               >
//                 <option value="">
//                   Select a stake or district
//                 </option>

//                 {areas.map((area) => (
//                   <option key={area.id} value={area.id}>
//                     {area.name} — {formatType(area.area_type)}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label
//                 htmlFor="localUnit"
//                 className="mb-2 block text-sm font-medium"
//               >
//                 Ward or Branch
//               </label>

//               <select
//                 id="localUnit"
//                 value={localUnitId}
//                 onChange={(event) => {
//                   setLocalUnitId(event.target.value);
//                   setMessage('');
//                 }}
//                 disabled={!areaId || unitsLoading}
//                 required
//                 className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
//               >
//                 <option value="">
//                   {!areaId
//                     ? 'Select a stake or district first'
//                     : unitsLoading
//                       ? 'Loading local units...'
//                       : 'Select a ward or branch'}
//                 </option>

//                 {localUnits.map((unit) => (
//                   <option key={unit.id} value={unit.id}>
//                     {unit.name} — {formatType(unit.unit_type)}
//                   </option>
//                 ))}
//               </select>

//               {unitsError && (
//                 <p className="mt-2 text-sm text-red-700">
//                   {unitsError.message}
//                 </p>
//               )}

//               {areaId &&
//                 !unitsLoading &&
//                 localUnits.length === 0 && (
//                   <p className="mt-2 text-sm text-amber-700">
//                     No active wards or branches have been added
//                     under this area.
//                   </p>
//                 )}
//             </div>

//             <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-900">
//               Your application will be sent first to the Bishop
//               or Branch President of the selected local unit.
//             </div>

//             <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
//               <button
//                 type="button"
//                 onClick={() =>
//                   navigate('/candidate/dashboard')
//                 }
//                 className="rounded-md border border-slate-300 px-6 py-3 font-semibold text-slate-700"
//               >
//                 Save and Exit
//               </button>

//               <button
//                 type="submit"
//                 disabled={
//                   saving ||
//                   !areaId ||
//                   !localUnitId
//                 }
//                 className="rounded-md bg-blue-900 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
//               >
//                 {saving
//                   ? 'Saving...'
//                   : 'Save and Continue'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </main>
//   );
// }

// function formatType(value) {
//   if (!value) {
//     return '';
//   }

//   return value
//     .split('_')
//     .map((word) => {
//       return word.charAt(0).toUpperCase() + word.slice(1);
//     })
//     .join(' ');
// }

// function ApplicationMessage({ message, error = false }) {
//   return (
//     <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
//       <div
//         className={
//           error
//             ? 'rounded-lg bg-red-50 p-5 text-red-700'
//             : 'rounded-lg bg-white p-5 text-slate-600 shadow'
//         }
//       >
//         {message}
//       </div>
//     </main>
//   );
// }

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EcclesiasticalInformationStep({
  candidateProfile,
  application,
  saveCandidateProfile,
  updateProgress,
}) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ecclesiastical_area_type:
      candidateProfile.ecclesiastical_area_type || 'stake',

    ecclesiastical_area_name:
      candidateProfile.ecclesiastical_area_name || '',

    local_unit_type:
      candidateProfile.local_unit_type || 'ward',

    local_unit_name:
      candidateProfile.local_unit_name || '',

    membership_record_number:
      candidateProfile.membership_record_number || '',

    local_leader_name:
      candidateProfile.local_leader_name || '',

    area_leader_name:
      candidateProfile.area_leader_name || '',
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => {
      const updatedData = {
        ...current,
        [name]: value,
      };

      if (
        name === 'ecclesiastical_area_type' &&
        value === 'district'
      ) {
        updatedData.local_unit_type = 'branch';
      }

      return updatedData;
    });

    setMessage('');
    setMessageType('');
  }

  function validateForm() {
    if (!formData.ecclesiastical_area_type) {
      return 'Select whether your area is a stake or district.';
    }

    if (!formData.ecclesiastical_area_name.trim()) {
      return 'Enter the name of your stake or district.';
    }

    if (!formData.local_unit_type) {
      return 'Select whether your local unit is a ward or branch.';
    }

    if (!formData.local_unit_name.trim()) {
      return 'Enter the name of your ward or branch.';
    }

    if (
      formData.ecclesiastical_area_type === 'district' &&
      formData.local_unit_type === 'ward'
    ) {
      return 'A ward cannot belong to a district. Select Branch.';
    }

    if (!formData.local_leader_name.trim()) {
      return 'Enter the name of your Bishop or Branch President.';
    }

    if (!formData.area_leader_name.trim()) {
      return 'Enter the name of your Stake or District President.';
    }

    return '';
  }

  function prepareUpdates() {
    return {
      ecclesiastical_area_type:
        formData.ecclesiastical_area_type,

      ecclesiastical_area_name:
        formData.ecclesiastical_area_name.trim(),

      local_unit_type:
        formData.local_unit_type,

      local_unit_name:
        formData.local_unit_name.trim(),

      membership_record_number:
        formData.membership_record_number.trim() || null,

      local_leader_name:
        formData.local_leader_name.trim(),

      area_leader_name:
        formData.area_leader_name.trim(),

      church_unit_verification_status: 'pending',

      // The Admin will match the typed unit later.
      local_unit_id: null,
    };
  }

  async function saveInformation(continueToNextStep) {
    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      setMessageType('error');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      setMessageType('');

      await saveCandidateProfile({
        candidateProfileId: candidateProfile.id,
        updates: prepareUpdates(),
      });

      if (continueToNextStep) {
        await updateProgress({
          applicationId: application.id,
          currentStep: 3,
          completionPercentage: 30,
        });

        navigate('/candidate/dashboard');
        return;
      }

      setMessage('Ecclesiastical information saved.');
      setMessageType('success');

      navigate('/candidate/dashboard');
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await saveInformation(true);
  }

  async function handleSaveAndExit() {
    await saveInformation(false);
  }

  const isDistrict =
    formData.ecclesiastical_area_type === 'district';

  const localLeaderLabel =
    formData.local_unit_type === 'ward'
      ? 'Bishop’s Full Name'
      : 'Branch President’s Full Name';

  const areaLeaderLabel =
    formData.ecclesiastical_area_type === 'stake'
      ? 'Stake President’s Full Name'
      : 'District President’s Full Name';

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate('/candidate/dashboard')}
          className="font-medium text-blue-900"
        >
          ← Return to dashboard
        </button>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <header className="border-b border-slate-200 pb-6">
            <p className="text-sm font-semibold text-blue-700">
              Step 2 of 7
            </p>

            <h1 className="mt-2 text-3xl font-bold text-blue-900">
              Ecclesiastical Information
            </h1>

            <p className="mt-2 text-slate-600">
              Enter the Church area and local unit where your
              membership record is located.
            </p>
          </header>

          {message && (
            <div
              className={
                messageType === 'success'
                  ? 'mt-6 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700'
                  : 'mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700'
              }
            >
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-8"
          >
            <section>
              <h2 className="text-lg font-bold text-blue-900">
                Stake or District
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select the type of Church area you belong to.
              </p>

              <div className="mt-4 flex flex-wrap gap-5">
                <RadioField
                  name="ecclesiastical_area_type"
                  value="stake"
                  checked={
                    formData.ecclesiastical_area_type ===
                    'stake'
                  }
                  onChange={handleChange}
                  label="Stake"
                />

                <RadioField
                  name="ecclesiastical_area_type"
                  value="district"
                  checked={
                    formData.ecclesiastical_area_type ===
                    'district'
                  }
                  onChange={handleChange}
                  label="District"
                />
              </div>

              <div className="mt-5">
                <TextField
                  label={
                    isDistrict
                      ? 'District Name'
                      : 'Stake Name'
                  }
                  name="ecclesiastical_area_name"
                  value={formData.ecclesiastical_area_name}
                  onChange={handleChange}
                  placeholder={
                    isDistrict
                      ? 'Enter your district name'
                      : 'Enter your stake name'
                  }
                  required
                />
              </div>
            </section>

            <section className="border-t border-slate-200 pt-7">
              <h2 className="text-lg font-bold text-blue-900">
                Ward or Branch
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select and enter the name of your local unit.
              </p>

              <div className="mt-4 flex flex-wrap gap-5">
                {!isDistrict && (
                  <RadioField
                    name="local_unit_type"
                    value="ward"
                    checked={
                      formData.local_unit_type === 'ward'
                    }
                    onChange={handleChange}
                    label="Ward"
                  />
                )}

                <RadioField
                  name="local_unit_type"
                  value="branch"
                  checked={
                    formData.local_unit_type === 'branch'
                  }
                  onChange={handleChange}
                  label="Branch"
                />
              </div>

              {isDistrict && (
                <p className="mt-3 text-sm text-blue-700">
                  Districts contain branches, so Branch has been
                  selected automatically.
                </p>
              )}

              <div className="mt-5">
                <TextField
                  label={
                    formData.local_unit_type === 'ward'
                      ? 'Ward Name'
                      : 'Branch Name'
                  }
                  name="local_unit_name"
                  value={formData.local_unit_name}
                  onChange={handleChange}
                  placeholder={
                    formData.local_unit_type === 'ward'
                      ? 'Enter your ward name'
                      : 'Enter your branch name'
                  }
                  required
                />
              </div>
            </section>

            <section className="grid gap-5 border-t border-slate-200 pt-7 md:grid-cols-2">
              <TextField
                label="Membership Record Number"
                name="membership_record_number"
                value={formData.membership_record_number}
                onChange={handleChange}
                placeholder="Optional"
              />

              <TextField
                label={localLeaderLabel}
                name="local_leader_name"
                value={formData.local_leader_name}
                onChange={handleChange}
                placeholder={`Enter ${localLeaderLabel.toLowerCase()}`}
                required
              />

              <div className="md:col-span-2">
                <TextField
                  label={areaLeaderLabel}
                  name="area_leader_name"
                  value={formData.area_leader_name}
                  onChange={handleChange}
                  placeholder={`Enter ${areaLeaderLabel.toLowerCase()}`}
                  required
                />
              </div>
            </section>

            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-900">
              LTC Admin will verify this information before the
              application is sent for priesthood endorsement.
            </div>

            <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
              <button
                type="button"
                onClick={handleSaveAndExit}
                disabled={saving}
                className="rounded-md border border-slate-300 px-6 py-3 font-semibold text-slate-700 disabled:opacity-60"
              >
                Save and Exit
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-blue-900 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? 'Saving...'
                  : 'Save and Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-800"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-600">*</span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function RadioField({
  name,
  value,
  checked,
  onChange,
  label,
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-4 py-3">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4"
      />

      <span className="font-medium text-slate-700">
        {label}
      </span>
    </label>
  );
}