import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EducationProgrammeStep({
  candidateProfile,
  application,
  saveCandidateProfile,
  updateProgress,
}) {
  const navigate = useNavigate();

  const [skillsExperience, setSkillsExperience] = useState(
    candidateProfile?.skills_experience || "",
  );

  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveInformation(continueToNextStep) {
    setSaving(true);
    setErrorMessage("");

    try {
      await saveCandidateProfile({
        candidateProfileId: candidateProfile.id,
        updates: {
          skills_experience: skillsExperience.trim() || null,
        },
      });

      if (continueToNextStep) {
        await updateProgress({
          applicationId: application.id,
          currentStep: 6,
          completionPercentage: 75,
        });
      }

      navigate("/candidate/dashboard");
    } catch (error) {
      setErrorMessage(
        error.message || "Unable to save your information. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await saveInformation(true);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 md:p-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/candidate/dashboard")}
          disabled={saving}
          className="font-medium text-blue-900 disabled:opacity-60"
        >
          ← Return to dashboard
        </button>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <header className="border-b border-slate-200 pb-6">
            <p className="text-sm font-semibold text-blue-700">Step 5 of 7</p>

            <h1 className="mt-2 text-3xl font-bold text-blue-900">
              Previous Training and Skills
            </h1>

            <p className="mt-2 text-slate-600">
              Have you attended any vocational training or learned a practical
              skill before applying to LTC Nigeria? You can mention it below.
              This section is optional, and you can continue without previous
              training.
            </p>

            
          </header>

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-8">
            <div>
              <label
                htmlFor="skills_experience"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Previous Training or Practical Skills
                <span className="ml-2 text-xs font-normal text-slate-500">
                  Optional
                </span>
              </label>

              <textarea
                id="skills_experience"
                name="skills_experience"
                value={skillsExperience}
                onChange={(event) => {
                  setSkillsExperience(event.target.value);
                  setErrorMessage("");
                }}
                disabled={saving}
                rows={4}
                aria-describedby="skills_experience_help"
                placeholder="For example: tailoring, catering, electrical installation, carpentry, or computer skills."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
              />

              <p
                id="skills_experience_help"
                className="mt-2 text-sm text-slate-500"
              >
                Leave this blank if you have no previous training or practical
                skills. You can still continue with your application.
              </p>
            </div>

            <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
              <button
                type="button"
                onClick={() => saveInformation(false)}
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
