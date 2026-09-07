import {
  useEffect,
  useState,
} from 'react';

import { Link } from 'react-router-dom';

import ReviewSubmissionStep from '../../components/forms/ReviewSubmissionStep';
import DocumentUploadStep from '../../components/forms/DocumentUploadStep';
import ContactEmergencyStep from '../../components/forms/ContactEmergencyStep';
import EducationProgrammeStep from '../../components/forms/EducationProgrammeStep';
import MissionInformationStep from '../../components/forms/MissionInformationStep';
import EcclesiasticalInformationStep from '../../components/forms/EcclesiasticalInformationStep';

import { useApplication } from '../../hooks/useApplication';
import { useAuth } from '../../hooks/useAuth';

export default function ApplicationPage() {
  const { profile, user } = useAuth();

  const {
    data,
    isLoading,
    error,
    saveCandidateProfile,
    updateProgress,
    submitCandidateApplication,
    submittingApplication,
    resubmitCandidateApplication,
    resubmittingApplication,
    savingProfile,
  } = useApplication(profile?.id);

  const [formData, setFormData] = useState({
    date_of_birth: '',
    gender: '',
    marital_status: '',
    residential_address: '',
    city: '',
    state: '',
    country: 'Nigeria',
  });

  const [message, setMessage] = useState('');

  const [
    correctionStep,
    setCorrectionStep,
  ] = useState(null);

  useEffect(() => {
    if (!data?.candidateProfile) {
      return;
    }

    const candidate = data.candidateProfile;

    setFormData({
      date_of_birth:
        candidate.date_of_birth || '',

      gender:
        candidate.gender || '',

      marital_status:
        candidate.marital_status || '',

      residential_address:
        candidate.residential_address || '',

      city:
        candidate.city || '',

      state:
        candidate.state || '',

      country:
        candidate.country || 'Nigeria',
    });
  }, [data?.candidateProfile]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    if (
      !data?.candidateProfile ||
      !data?.application
    ) {
      setMessage(
        'Candidate application information is missing.'
      );

      return;
    }

    try {
      await saveCandidateProfile({
        candidateProfileId:
          data.candidateProfile.id,

        updates: formData,
      });

      /*
       * During a correction, save the information
       * without changing the application progress.
       */
      if (
        data.application.status ===
        'correction_required'
      ) {
        setCorrectionStep(null);
        return;
      }

      await updateProgress({
        applicationId: data.application.id,
        currentStep: 2,
        completionPercentage: 15,
      });
    } catch (saveError) {
      setMessage(saveError.message);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">
          Loading application...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
          {error.message}
        </div>
      </main>
    );
  }

  if (
    !data?.application ||
    !data?.candidateProfile
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-800">
          There is no open candidate application.
        </div>
      </main>
    );
  }

  const application = data.application;

  const isCorrection =
    application.status ===
    'correction_required';

  const activeStep =
    correctionStep ??
    application.current_step;

  /*
   * Show the correction section menu before
   * displaying an individual form.
   */
  if (
    isCorrection &&
    correctionStep === null
  ) {
    return (
      <CorrectionSectionSelector
        comments={data.latestReview?.comments}
        onSelectStep={setCorrectionStep}
      />
    );
  }

  if (activeStep === 2) {
    return (
      <EcclesiasticalInformationStep
        candidateProfile={
          data.candidateProfile
        }
        application={application}
        saveCandidateProfile={
          saveCandidateProfile
        }
        updateProgress={updateProgress}
      />
    );
  }

  if (activeStep === 3) {
    return (
      <MissionInformationStep
        candidateProfile={
          data.candidateProfile
        }
        application={application}
        saveCandidateProfile={
          saveCandidateProfile
        }
        updateProgress={updateProgress}
      />
    );
  }

  if (activeStep === 4) {
    return (
      <ContactEmergencyStep
        profile={profile}
        candidateProfile={
          data.candidateProfile
        }
        application={application}
        saveCandidateProfile={
          saveCandidateProfile
        }
        updateProgress={updateProgress}
      />
    );
  }

  if (activeStep === 5) {
    return (
      <EducationProgrammeStep
        candidateProfile={
          data.candidateProfile
        }
        application={application}
        saveCandidateProfile={
          saveCandidateProfile
        }
        updateProgress={updateProgress}
      />
    );
  }

  if (activeStep === 6) {
    return (
      <DocumentUploadStep
        user={user}
        candidateProfile={
          data.candidateProfile
        }
        application={application}
        updateProgress={updateProgress}
      />
    );
  }

  if (activeStep === 7) {
    return (
      <ReviewSubmissionStep
        profile={profile}
        candidateProfile={
          data.candidateProfile
        }
        application={application}
        latestReview={data.latestReview}
        isCorrection={isCorrection}
        submitCandidateApplication={
          submitCandidateApplication
        }
        submittingApplication={
          submittingApplication
        }
        resubmitCandidateApplication={
          resubmitCandidateApplication
        }
        resubmittingApplication={
          resubmittingApplication
        }
      />
    );
  }

  if (activeStep > 7) {
    return (
      <ApplicationStepPlaceholder
        step={activeStep}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/candidate/dashboard"
          className="font-medium text-blue-900"
        >
          ← Return to dashboard
        </Link>

        {isCorrection && (
          <button
            type="button"
            onClick={() =>
              setCorrectionStep(null)
            }
            className="ml-5 font-medium text-amber-700"
          >
            Return to correction sections
          </button>
        )}

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <header className="border-b border-slate-200 pb-6">
            <p className="text-sm font-semibold text-blue-700">
              Step 1 of 7
            </p>

            <h1 className="mt-2 text-3xl font-bold text-blue-900">
              Personal Information
            </h1>

            <p className="mt-2 text-slate-600">
              Enter your personal and residential
              information.
            </p>

            {isCorrection && (
              <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                Make the requested correction and save
                this section.
              </p>
            )}
          </header>

          {message && (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-7 grid gap-5 md:grid-cols-2"
          >
            <FormField
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleChange}
            />

            <SelectField
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                {
                  value: 'male',
                  label: 'Male',
                },
                {
                  value: 'female',
                  label: 'Female',
                },
              ]}
            />

            <SelectField
              label="Marital Status"
              name="marital_status"
              value={formData.marital_status}
              onChange={handleChange}
              options={[
                {
                  value: 'single',
                  label: 'Single',
                },
                {
                  value: 'married',
                  label: 'Married',
                },
              ]}
            />

            <FormField
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
            />

            <div className="md:col-span-2">
              <FormField
                label="Residential Address"
                name="residential_address"
                value={
                  formData.residential_address
                }
                onChange={handleChange}
              />
            </div>

            <FormField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
            />

            <FormField
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />

            <div className="flex justify-end md:col-span-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-md bg-blue-900 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingProfile
                  ? 'Saving...'
                  : isCorrection
                    ? 'Save Correction'
                    : 'Save and Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function CorrectionSectionSelector({
  comments,
  onSelectStep,
}) {
  const sections = [
    {
      step: 1,
      name: 'Personal Information',
    },
    {
      step: 2,
      name: 'Ecclesiastical Information',
    },
    {
      step: 3,
      name: 'Mission Information',
    },
    {
      step: 4,
      name: 'Contact and Emergency Information',
    },
    {
      step: 5,
      name: 'Education and Programme',
    },
    {
      step: 6,
      name: 'Uploaded Documents',
    },
    {
      step: 7,
      name: 'Review and Resubmit',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/candidate/dashboard"
          className="font-medium text-blue-900"
        >
          ← Return to dashboard
        </Link>

        <section className="mt-6 rounded-xl border border-amber-300 bg-white p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold text-amber-700">
            Correction Required
          </p>

          <h1 className="mt-2 text-3xl font-bold text-blue-900">
            Update Your Application
          </h1>

          <p className="mt-3 text-slate-600">
            Review the LTC Admin’s comment and select
            the section you need to correct.
          </p>

          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              LTC Admin comment
            </p>

            <p className="mt-2 whitespace-pre-wrap text-amber-900">
              {comments ||
                'Please review and correct your application.'}
            </p>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {sections.map((section) => (
              <button
                key={section.step}
                type="button"
                onClick={() =>
                  onSelectStep(section.step)
                }
                className={
                  section.step === 7
                    ? 'rounded-md bg-blue-900 px-5 py-4 text-left font-semibold text-white'
                    : 'rounded-md border border-slate-300 bg-white px-5 py-4 text-left font-semibold text-slate-800 hover:border-blue-700 hover:bg-blue-50'
                }
              >
                <span className="mr-2 text-sm opacity-70">
                  Step {section.step}
                </span>

                {section.name}
              </button>
            ))}
          </div>

          <p className="mt-6 text-sm text-slate-600">
            Save the corrected section, return here,
            then select “Review and Resubmit.”
          </p>
        </section>
      </div>
    </main>
  );
}

function ApplicationStepPlaceholder({ step }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-blue-700">
          Step {step} of 7
        </p>

        <h1 className="mt-2 text-3xl font-bold text-blue-900">
          Application Section
        </h1>

        <p className="mt-3 text-slate-600">
          This application section has not been
          created yet.
        </p>

        <Link
          to="/candidate/dashboard"
          className="mt-6 inline-block rounded-md bg-blue-900 px-6 py-3 font-semibold text-white"
        >
          Return to Dashboard
        </Link>
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
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-800"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-800"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">
          Select an option
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}