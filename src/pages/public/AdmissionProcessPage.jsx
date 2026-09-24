import {
  Link,
} from 'react-router-dom';

const admissionSteps = [
  {
    number: '01',
    title: 'Create your account',
    description:
      'Register with a valid email address, verify your account and sign in to begin your LTC application.',
  },
  {
    number: '02',
    title: 'Complete your application',
    description:
      'Provide your personal, educational, missionary, ecclesiastical and emergency-contact information. Upload every required document before submitting.',
  },
  {
    number: '03',
    title: 'LTC administrative review',
    description:
      'The LTC Admissions Team reviews your application and supporting documents. Your application may proceed or be returned to you for corrections.',
  },
  {
    number: '04',
    title: 'Local leader endorsement',
    description:
      'Your Bishop or Branch President interviews you, reviews the LTC standards with you and submits an endorsement decision.',
  },
  {
    number: '05',
    title: 'Final endorsement',
    description:
      'Your Stake or District President reviews the application and local leader endorsement before submitting the final ecclesiastical recommendation.',
  },
  {
    number: '06',
    title: 'Admission decision',
    description:
      'After all requirements are successfully completed, the LTC Admissions Team confirms your admission into the LTC Pioneer Phase.',
  },
  {
    number: '07',
    title: 'Room allocation',
    description:
      'Eligible admitted students receive accommodation according to gender and available bed spaces. Assignment details appear on the student dashboard.',
  },
];

export default function AdmissionProcessPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-800">
      <PublicHeader />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
            LTC Admissions
          </p>

          <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold leading-tight text-blue-900 sm:text-5xl lg:text-6xl">
            Your LTC admission journey,
            clearly explained.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            The Light Training Center
            admission process helps you
            complete your application,
            receive the required
            ecclesiastical endorsements and
            prepare for admission into the
            LTC Pioneer Phase.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="rounded-xl bg-blue-900 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Begin Application
            </Link>

            <Link
              to="/ltc-guidelines"
              className="rounded-xl border border-blue-900 px-6 py-3 font-semibold text-blue-900 transition hover:bg-blue-50"
            >
              Review LTC Guidelines
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
            Application journey
          </p>

          <h2 className="mt-3 text-3xl font-bold text-blue-900">
            Seven stages from application
            to accommodation
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            You can monitor your progress
            and view the next required
            action from your candidate
            dashboard.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {admissionSteps.map((step) => (
            <article
              key={step.number}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-900">
                  {step.number}
                </span>

                <div>
                  <h3 className="text-xl font-bold text-blue-900">
                    {step.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-bold text-amber-900">
            Important admission notice
          </h2>

          <p className="mt-2 leading-7 text-amber-800">
            Submitting an application does
            not automatically guarantee
            admission. Every application is
            subject to document
            verification, ecclesiastical
            endorsement, available capacity
            and final LTC approval.
          </p>
        </div>
      </section>

      <section className="bg-blue-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 text-white lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="text-2xl font-bold">
              Ready to begin?
            </h2>

            <p className="mt-2 text-blue-100">
              Create your account and follow
              each stage from your
              application dashboard.
            </p>
          </div>

          <Link
            to="/signup"
            className="self-start rounded-xl bg-amber-500 px-6 py-3 font-bold text-blue-950 transition hover:bg-amber-400"
          >
            Create Candidate Account
          </Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function PublicHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-5 px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-900 font-bold text-white">
            LTC
          </span>

          <span>
            <span className="block font-serif text-2xl font-bold leading-none text-blue-900">
              Light Training Center
            </span>

            <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-amber-600">
              Admissions
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            to="/admission-process"
            className="font-semibold text-blue-900"
          >
            About the Process
          </Link>

          <Link
            to="/ltc-guidelines"
            className="text-slate-700 hover:text-blue-900"
          >
            LTC Guidelines
          </Link>

          <Link
            to="/"
            className="rounded-lg border border-blue-900 px-4 py-2 font-semibold text-blue-900 hover:bg-blue-50"
          >
            Sign In
          </Link>
        </nav>

        <Link
          to="/"
          className="rounded-lg border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 md:hidden"
        >
          Home
        </Link>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>
          © {new Date().getFullYear()}{' '}
          Light Training Center Nigeria
        </p>

        <div className="flex gap-5">
          <Link
            to="/ltc-guidelines"
            className="hover:text-blue-900"
          >
            LTC Guidelines
          </Link>

          <Link
            to="/"
            className="hover:text-blue-900"
          >
            Sign In
          </Link>
        </div>
      </div>
    </footer>
  );
}