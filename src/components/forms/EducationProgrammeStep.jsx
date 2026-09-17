import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EducationProgrammeStep({
  candidateProfile,
  application,
  saveCandidateProfile,
  updateProgress,
}) {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    highest_qualification: candidateProfile.highest_qualification || "",

    institution_name: candidateProfile.institution_name || "",

    field_of_study: candidateProfile.field_of_study || "",

    graduation_year: candidateProfile.graduation_year || "",

    skills_experience: candidateProfile.skills_experience || "",

    preferred_programme: candidateProfile.preferred_programme || "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
    setMessageType("");
  }

  function validateForm() {
    if (!formData.highest_qualification) {
      return "Select your highest educational qualification.";
    }

    if (formData.graduation_year) {
      const graduationYear = Number(formData.graduation_year);

      if (graduationYear < 1950 || graduationYear > currentYear) {
        return `Graduation year must be between 1950 and ${currentYear}.`;
      }
    }

    return "";
  }

  function prepareUpdates() {
    return {
      highest_qualification: formData.highest_qualification,

      institution_name: formData.institution_name.trim() || null,

      field_of_study: formData.field_of_study.trim() || null,

      graduation_year: formData.graduation_year
        ? Number(formData.graduation_year)
        : null,

      skills_experience: formData.skills_experience.trim() || null,

      preferred_programme: formData.preferred_programme.trim() || null,
    };
  }

  async function saveInformation(continueToNextStep) {
    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setMessageType("");

      await saveCandidateProfile({
        candidateProfileId: candidateProfile.id,

        updates: prepareUpdates(),
      });

      if (continueToNextStep) {
        await updateProgress({
          applicationId: application.id,
          currentStep: 6,
          completionPercentage: 75,
        });

        navigate("/candidate/dashboard");
        return;
      }

      navigate("/candidate/dashboard");
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
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
          onClick={() => navigate("/candidate/dashboard")}
          className="font-medium text-blue-900"
        >
          ← Return to dashboard
        </button>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <header className="border-b border-slate-200 pb-6">
            <p className="text-sm font-semibold text-blue-700">Step 5 of 7</p>

            <h1 className="mt-2 text-3xl font-bold text-blue-900">
              Education and Programme Information
            </h1>

            <p className="mt-2 text-slate-600">
              Tell us about your educational background, skills and programme
              interests.
            </p>
          </header>

          {message && (
            <div
              className={
                messageType === "success"
                  ? "mt-6 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700"
                  : "mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              }
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-8">
            <section>
              <h2 className="text-lg font-bold text-blue-900">
                Educational Background
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Only your highest qualification is required. Institution details
                are optional.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <SelectField
                  label="Highest Qualification"
                  name="highest_qualification"
                  value={formData.highest_qualification}
                  onChange={handleChange}
                  options={[
                    {
                      value: "ssce_waec_neco",
                      label:
                        "Senior Secondary School Certificate (SSCE/WAEC/NECO)",
                    },
                    {
                      value: "national_diploma",
                      label: "National Diploma (ND)",
                    },
                    {
                      value: "higher_national_diploma",
                      label: "Higher National Diploma (HND)",
                    },
                    {
                      value: "nce",
                      label: "NCE (National Certificate in Education)",
                    },
                    {
                      value: "vocational_technical_certificate",
                      label: "Vocational/Technical Certificate",
                    },
                    {
                      value: "other",
                      label: "Other",
                    },
                  ]}
                />

                <FormField
                  label="Institution Name"
                  name="institution_name"
                  value={formData.institution_name}
                  onChange={handleChange}
                  placeholder="Optional"
                />

                <FormField
                  label="Field of Study"
                  name="field_of_study"
                  value={formData.field_of_study}
                  onChange={handleChange}
                  placeholder="Optional"
                />

                <FormField
                  label="Graduation Year"
                  name="graduation_year"
                  type="number"
                  value={formData.graduation_year}
                  onChange={handleChange}
                  placeholder="Optional"
                  min="1950"
                  max={currentYear}
                />
              </div>
            </section>

            <section className="border-t border-slate-200 pt-7">
              <h2 className="text-lg font-bold text-blue-900">
                Skills and Programme Interest
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                The information in this section is optional.
              </p>

              <div className="mt-5 grid gap-5">
                <FormField
                  label="Preferred LTC Programme"
                  name="preferred_programme"
                  value={formData.preferred_programme}
                  onChange={handleChange}
                  placeholder="Optional"
                />

                <div>
                  <label
                    htmlFor="skills_experience"
                    className="mb-2 block text-sm font-medium text-slate-800"
                  >
                    Skills and Experience
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      Optional
                    </span>
                  </label>

                  <textarea
                    id="skills_experience"
                    name="skills_experience"
                    value={formData.skills_experience}
                    onChange={handleChange}
                    rows="5"
                    placeholder="Describe any skills, employment, volunteer work or practical experience"
                    className="w-full resize-y rounded-md border border-slate-300 px-3 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </section>

            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-900">
              Candidates who have not attended a higher institution can leave
              the institution, field of study and graduation year fields empty.
            </div>

            <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
              <button
                type="button"
                onClick={handleSaveAndExit}
                disabled={saving}
                className="rounded-md border border-slate-300 px-6 py-3 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save and Exit
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-blue-900 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save and Continue"}
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
  type = "text",
  value,
  onChange,
  placeholder,
  min,
  max,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-800"
      >
        {label}

        <span className="ml-2 text-xs font-normal text-slate-500">
          Optional
        </span>
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-800"
      >
        {label}

        <span className="ml-1 text-red-600">*</span>
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">Select your highest qualification</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
