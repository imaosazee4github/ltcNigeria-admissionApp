import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ContactEmergencyStep({
  profile,
  candidateProfile,
  application,
  saveCandidateProfile,
  updateProgress,
}) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    alternate_phone:
      candidateProfile.alternate_phone || '',

    emergency_contact_name:
      candidateProfile.emergency_contact_name || '',

    emergency_contact_relationship:
      candidateProfile.emergency_contact_relationship || '',

    emergency_contact_phone:
      candidateProfile.emergency_contact_phone || '',

    emergency_contact_address:
      candidateProfile.emergency_contact_address || '',
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] =
    useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage('');
    setMessageType('');
  }

  function validateForm() {
    if (!formData.emergency_contact_name.trim()) {
      return 'Enter your emergency contact’s full name.';
    }

    if (
      !formData.emergency_contact_relationship.trim()
    ) {
      return 'Select your relationship with the emergency contact.';
    }

    if (!formData.emergency_contact_phone.trim()) {
      return 'Enter your emergency contact’s phone number.';
    }

    if (!formData.emergency_contact_address.trim()) {
      return 'Enter your emergency contact’s address.';
    }

    return '';
  }

  function prepareUpdates() {
    return {
      alternate_phone:
        formData.alternate_phone.trim() || null,

      emergency_contact_name:
        formData.emergency_contact_name.trim(),

      emergency_contact_relationship:
        formData.emergency_contact_relationship.trim(),

      emergency_contact_phone:
        formData.emergency_contact_phone.trim(),

      emergency_contact_address:
        formData.emergency_contact_address.trim(),
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
          currentStep: 5,
          completionPercentage: 60,
        });

        navigate('/candidate/dashboard');
        return;
      }

      setMessage(
        'Contact and emergency information saved.'
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
              Step 4 of 7
            </p>

            <h1 className="mt-2 text-3xl font-bold text-blue-900">
              Contact and Emergency Information
            </h1>

            <p className="mt-2 text-slate-600">
              Confirm your contact details and provide someone
              LTC can contact during an emergency.
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
                Candidate Contact Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your primary details come from your verified
                account.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <ReadOnlyField
                  label="Email Address"
                  value={profile?.email || ''}
                />

                <ReadOnlyField
                  label="Primary Phone Number"
                  value={profile?.phone || 'Not provided'}
                />

                <div className="md:col-span-2">
                  <FormField
                    label="Alternative Phone Number"
                    name="alternate_phone"
                    type="tel"
                    value={formData.alternate_phone}
                    onChange={handleChange}
                    placeholder="Optional additional phone number"
                  />
                </div>
              </div>
            </section>

            <section className="border-t border-slate-200 pt-7">
              <h2 className="text-lg font-bold text-blue-900">
                Emergency Contact
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Provide the details of a trusted person LTC can
                contact in an emergency.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <FormField
                  label="Full Name"
                  name="emergency_contact_name"
                  value={
                    formData.emergency_contact_name
                  }
                  onChange={handleChange}
                  placeholder="Enter emergency contact’s name"
                  required
                />

                <div>
                  <label
                    htmlFor="emergency_contact_relationship"
                    className="mb-2 block text-sm font-medium text-slate-800"
                  >
                    Relationship
                    <span className="ml-1 text-red-600">
                      *
                    </span>
                  </label>

                  <select
                    id="emergency_contact_relationship"
                    name="emergency_contact_relationship"
                    value={
                      formData.emergency_contact_relationship
                    }
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select relationship
                    </option>

                    <option value="spouse">
                      Spouse
                    </option>

                    <option value="parent">
                      Parent
                    </option>

                    <option value="sibling">
                      Sibling
                    </option>

                    <option value="guardian">
                      Guardian
                    </option>

                    <option value="relative">
                      Other Relative
                    </option>

                    <option value="friend">
                      Friend
                    </option>
                  </select>
                </div>

                <FormField
                  label="Phone Number"
                  name="emergency_contact_phone"
                  type="tel"
                  value={
                    formData.emergency_contact_phone
                  }
                  onChange={handleChange}
                  placeholder="Enter emergency phone number"
                  required
                />

                <FormField
                  label="Residential Address"
                  name="emergency_contact_address"
                  value={
                    formData.emergency_contact_address
                  }
                  onChange={handleChange}
                  placeholder="Enter emergency contact’s address"
                  required
                />
              </div>
            </section>

            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-900">
              Ensure the emergency contact knows that you have
              provided their information to LTC Nigeria.
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

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-800">
        {label}
      </label>

      <input
        type="text"
        value={value}
        readOnly
        className="w-full cursor-not-allowed rounded-md border border-slate-200 bg-slate-100 px-3 py-3 text-slate-600"
      />
    </div>
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