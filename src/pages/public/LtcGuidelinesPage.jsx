import {
  useState,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import HonorCodeModal from '../../components/common/HonorCodeModal';

const requiredDocuments = [
  'Passport photograph',
  'NIN document or international passport',
  'Mission certificate',
  'Educational certificate',
  'Any additional document requested by LTC Admissions',
];

const coreValues = [
  {
    title: 'Service',
    description:
      'Actively support others and contribute to the LTC community.',
  },
  {
    title: 'Discipleship',
    description:
      'Live according to the teachings and example of Jesus Christ.',
  },
  {
    title: 'Accountability',
    description:
      'Accept responsibility for your conduct, choices and development.',
  },
  {
    title: 'Enthusiasm',
    description:
      'Participate positively and approach learning with commitment.',
  },
  {
    title: 'Respect',
    description:
      'Treat yourself, other students, leaders and LTC property with care.',
  },
  {
    title: 'Integrity',
    description:
      'Be honest and consistent in your words, documents and actions.',
  },
];

const accommodationRules = [
  'Male and female students are assigned to separate dormitories.',
  'Students must use only their assigned room and bed space.',
  'Room changes require approval from an authorized LTC administrator.',
  'Students are responsible for maintaining cleanliness and order.',
  'Students must protect LTC property and report damage promptly.',
  'Dormitory and room leaders support communication, welfare and accountability.',
];

export default function LtcGuidelinesPage() {
  const [
    honorCodeOpen,
    setHonorCodeOpen,
  ] = useState(false);

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-800">
      <PublicHeader />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
            Applicant information
          </p>

          <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold leading-tight text-blue-900 sm:text-5xl lg:text-6xl">
            Preparing for the LTC Pioneer
            Phase
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            LTC students are expected to
            demonstrate discipleship,
            integrity, accountability and
            respect. Review these guidelines
            carefully before submitting your
            application.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="rounded-xl bg-blue-900 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Begin Application
            </Link>

            <Link
              to="/admission-process"
              className="rounded-xl border border-blue-900 px-6 py-3 font-semibold text-blue-900 transition hover:bg-blue-50"
            >
              View Admission Process
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-16 lg:px-8 lg:py-20">
        <GuidelineSection
          number="01"
          title="Eligibility and application"
          description="Every applicant is responsible for providing accurate and complete information."
        >
          <GuidelineList
            items={[
              'Use a personal and accessible email address.',
              'Provide complete and truthful application information.',
              'Submit authentic, readable and current documents.',
              'Respond promptly when the LTC Admissions Team requests corrections.',
              'Complete every required ecclesiastical interview and endorsement.',
              'Monitor your candidate dashboard for application updates.',
            ]}
          />
        </GuidelineSection>

        <GuidelineSection
          number="02"
          title="Required documents"
          description="Documents must be clear, authentic and uploaded in the accepted format."
        >
          <GuidelineList
            items={requiredDocuments}
          />

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Providing altered, misleading
            or fraudulent documents may
            result in rejection or withdrawal
            of admission.
          </div>
        </GuidelineSection>

        <GuidelineSection
          number="03"
          title="Ecclesiastical endorsement"
          description="Ecclesiastical endorsement is an essential part of the LTC admission process."
        >
          <p className="leading-7 text-slate-600">
            Applicants must be interviewed
            by their Bishop or Branch
            President and receive final
            endorsement from their Stake or
            District President. The
            endorsement should confirm the
            applicant’s readiness to observe
            LTC standards and participate
            responsibly in the Pioneer Phase.
          </p>
        </GuidelineSection>

        <GuidelineSection
          number="04"
          title="LTC Student Honor Code"
          description="Students commit to conduct consistent with a faith-centered learning environment."
        >
          <p className="leading-7 text-slate-600">
            Students of the Light Training
            Center commit to living honest,
            chaste and virtuous lives;
            obeying the law; and showing
            respect for themselves and
            others.
          </p>

          <button
            type="button"
            onClick={() =>
              setHonorCodeOpen(true)
            }
            className="mt-6 rounded-xl bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            Read the Complete Honor Code
          </button>
        </GuidelineSection>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-900">
              05
            </span>

            <div>
              <h2 className="text-2xl font-bold text-blue-900">
                LTC core values
              </h2>

              <p className="mt-2 leading-7 text-slate-600">
                These values guide student
                learning, conduct and
                community participation.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coreValues.map((value) => (
              <article
                key={value.title}
                className="rounded-xl bg-slate-50 p-5"
              >
                <h3 className="font-bold text-blue-900">
                  {value.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <GuidelineSection
          number="06"
          title="Dress and grooming"
          description="Students should maintain modest, clean and professional personal presentation."
        >
          <p className="leading-7 text-slate-600">
            Dress and grooming should be
            appropriate for a faith-centered
            learning and residential
            environment. Students are
            expected to follow all published
            LTC dress and grooming standards
            throughout the Pioneer Phase.
          </p>
        </GuidelineSection>

        <GuidelineSection
          number="07"
          title="Accommodation guidelines"
          description="Accommodation is provided according to eligibility, gender and available bed spaces."
        >
          <GuidelineList
            items={accommodationRules}
          />
        </GuidelineSection>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-xl font-bold text-red-900">
            Important notice
          </h2>

          <p className="mt-3 leading-7 text-red-800">
            False information, altered
            documents, misleading
            ecclesiastical details or serious
            misconduct may result in
            application rejection,
            withdrawal of admission or
            further administrative review.
          </p>
        </div>
      </div>

      <section className="bg-blue-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 text-white lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="text-2xl font-bold">
              Have you reviewed the
              guidelines?
            </h2>

            <p className="mt-2 text-blue-100">
              You can now create your account
              and begin the LTC admission
              process.
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

      <HonorCodeModal
        open={honorCodeOpen}
        onClose={() =>
          setHonorCodeOpen(false)
        }
      />
    </main>
  );
}

function GuidelineSection({
  number,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-900">
          {number}
        </span>

        <div>
          <h2 className="text-2xl font-bold text-blue-900">
            {title}
          </h2>

          <p className="mt-2 leading-7 text-slate-600">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-6 lg:pl-15">
        {children}
      </div>
    </section>
  );
}

function GuidelineList({
  items,
}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 leading-7 text-slate-600"
        >
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" />

          <span>{item}</span>
        </li>
      ))}
    </ul>
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
            className="text-slate-700 hover:text-blue-900"
          >
            About the Process
          </Link>

          <Link
            to="/ltc-guidelines"
            className="font-semibold text-blue-900"
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
            to="/admission-process"
            className="hover:text-blue-900"
          >
            Admission Process
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