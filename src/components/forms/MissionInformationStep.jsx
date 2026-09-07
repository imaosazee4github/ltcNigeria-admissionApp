import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MissionInformationStep({
  candidateProfile,
  application,
  saveCandidateProfile,
  updateProgress,
}) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    missionary_status:
      candidateProfile.missionary_status || '',

    mission_name:
      candidateProfile.mission_name || '',

    mission_country:
      candidateProfile.mission_country || '',

    mission_start_date:
      candidateProfile.mission_start_date || '',

    mission_end_date:
      candidateProfile.mission_end_date || '',
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] =
    useState('');
  const [saving, setSaving] = useState(false);

  const servedMission =
    formData.missionary_status ===
      'returned_missionary' ||
    formData.missionary_status ===
      'currently_serving';

  const isReturnedMissionary =
    formData.missionary_status ===
    'returned_missionary';

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => {
      const updatedForm = {
        ...current,
        [name]: value,
      };

      if (
        name === 'missionary_status' &&
        ![
          'returned_missionary',
          'currently_serving',
        ].includes(value)
      ) {
        updatedForm.mission_name = '';
        updatedForm.mission_country = '';
        updatedForm.mission_start_date = '';
        updatedForm.mission_end_date = '';
      }

      return updatedForm;
    });

    setMessage('');
    setMessageType('');
  }

  function validateForm() {
    if (!formData.missionary_status) {
      return 'Select your missionary status.';
    }

    if (!servedMission) {
      return '';
    }

    if (!formData.mission_name.trim()) {
      return 'Enter the name of your mission.';
    }

    if (!formData.mission_country.trim()) {
      return 'Enter the country where you served.';
    }

    if (!formData.mission_start_date) {
      return 'Enter your mission start date.';
    }

    if (
      isReturnedMissionary &&
      !formData.mission_end_date
    ) {
      return 'Enter your mission completion date.';
    }

    if (
      formData.mission_start_date &&
      formData.mission_end_date &&
      formData.mission_end_date <
        formData.mission_start_date
    ) {
      return 'Mission completion date cannot be before the start date.';
    }

    return '';
  }

  function prepareUpdates() {
    if (!servedMission) {
      return {
        missionary_status:
          formData.missionary_status,

        mission_name: null,
        mission_country: null,
        mission_start_date: null,
        mission_end_date: null,
      };
    }

    return {
      missionary_status:
        formData.missionary_status,

      mission_name:
        formData.mission_name.trim(),

      mission_country:
        formData.mission_country.trim(),

      mission_start_date:
        formData.mission_start_date || null,

      mission_end_date:
        formData.mission_end_date || null,
    };
  }

  async function saveInformation(
    continueToNextStep
  ) {
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
        candidateProfileId:
          candidateProfile.id,

        updates: prepareUpdates(),
      });

      if (continueToNextStep) {
        await updateProgress({
          applicationId: application.id,
          currentStep: 4,
          completionPercentage: 45,
        });

        navigate('/candidate/dashboard');
        return;
      }

      setMessage(
        'Mission information saved successfully.'
      );

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

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() =>
            navigate('/candidate/dashboard')
          }
          className="font-medium text-blue-900"
        >
          ← Return to dashboard
        </button>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <header className="border-b border-slate-200 pb-6">
            <p className="text-sm font-semibold text-blue-700">
              Step 3 of 7
            </p>

            <h1 className="mt-2 text-3xl font-bold text-blue-900">
              Mission Information
            </h1>

            <p className="mt-2 text-slate-600">
              Tell us about your missionary service.
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
            className="mt-7 space-y-7"
          >
            <div>
              <label
                htmlFor="missionary_status"
                className="mb-2 block text-sm font-medium text-slate-800"
              >
                Missionary Status
                <span className="ml-1 text-red-600">
                  *
                </span>
              </label>

              <select
                id="missionary_status"
                name="missionary_status"
                value={formData.missionary_status}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select missionary status
                </option>

                <option value="returned_missionary">
                  Returned Missionary
                </option>

                <option value="currently_serving">
                  Currently Serving
                </option>

                <option value="did_not_serve">
                  Did Not Serve
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </div>

            {servedMission && (
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FormField
                    label="Mission Name"
                    name="mission_name"
                    value={formData.mission_name}
                    onChange={handleChange}
                    placeholder="Example: Nigeria Benin City Mission"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <FormField
                    label="Mission Country"
                    name="mission_country"
                    value={formData.mission_country}
                    onChange={handleChange}
                    placeholder="Enter the country where you served"
                    required
                  />
                </div>

                <FormField
                  label="Mission Start Date"
                  name="mission_start_date"
                  type="date"
                  value={
                    formData.mission_start_date
                  }
                  onChange={handleChange}
                  required
                />

                <FormField
                  label={
                    isReturnedMissionary
                      ? 'Mission Completion Date'
                      : 'Expected Completion Date'
                  }
                  name="mission_end_date"
                  type="date"
                  value={formData.mission_end_date}
                  onChange={handleChange}
                  required={isReturnedMissionary}
                />
              </div>
            )}

            {formData.missionary_status ===
              'did_not_serve' && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                You can continue without entering mission
                service details.
              </div>
            )}

            {formData.missionary_status ===
              'other' && (
              <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                LTC Admin may contact you for additional
                information about your missionary status.
              </div>
            )}

            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-900">
              You will upload your mission completion or
              release certificate during Step 6.
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

function FormField({
  label,
  name,
  type = 'text',
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
          <span className="ml-1 text-red-600">
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}