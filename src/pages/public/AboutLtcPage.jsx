import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  Church,
  GraduationCap,
  MapPin,
  Users,
} from "lucide-react";

export default function AboutLtcPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-800">
      <PublicHeader />

      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="mb-5 inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900">
                About the Light Training Center
              </div>

              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-blue-950 sm:text-5xl lg:text-6xl">
                Discover your light. Grow wholeness through Christ. Lead the
                way.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                The Light Training Center (LTC), Nigeria is being developed
                as a place where returned missionaries can grow spiritually,
                socially, intellectually, physically, professionally, and
                vocationally as they prepare to lead and serve.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/admission-process"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-950 px-5 py-3 font-semibold text-white transition hover:bg-blue-900"
                >
                  Explore the Admission Process
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/ltc-guidelines"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-900"
                >
                  View LTC Guidelines
                </Link>
              </div>
            </div>

            {/* Future campus image area */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
              <div className="flex aspect-[4/3] flex-col items-center justify-center px-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-950 text-white">
                  <Building2 className="h-8 w-8" />
                </div>

                <p className="mt-5 text-lg font-semibold text-blue-950">
                  LTC Nigeria Campus
                </p>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Campus photographs will be added here as official images
                  become available.
                </p>
              </div>

              <div className="absolute left-0 top-0 h-24 w-24 rounded-br-full bg-amber-400/20" />
              <div className="absolute bottom-0 right-0 h-32 w-32 rounded-tl-full bg-blue-950/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Location strip */}
      <section className="border-b border-slate-200 bg-blue-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <InfoItem
            icon={MapPin}
            label="Location"
            value="Ogun State, Nigeria"
          />

          <InfoItem
            icon={Users}
            label="Potential Applicants"
            value="YSA returned missionaries"
          />

          <InfoItem
            icon={GraduationCap}
            label="Age Range"
            value="20–30 years old"
          />

          <InfoItem
            icon={Building2}
            label="Campus"
            value="Approximately 135 acres"
          />
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-6 py-16 lg:px-8 lg:py-20">
        {/* Mission */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-10">
          <SectionHeading
            eyebrow="Our Mission"
            title="Nurturing light, wholeness, and leadership"
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-2xl bg-blue-50 p-7">
              <Church className="h-8 w-8 text-blue-900" />

              <p className="mt-6 text-2xl font-bold leading-tight text-blue-950">
                Discover your light.
                <br />
                Grow wholeness through Christ.
                <br />
                Lead the way.
              </p>
            </div>

            <div className="space-y-5 text-base leading-8 text-slate-600">
              <p>
                We are all beloved children of God, strengthened through the
                miraculous, all-encompassing, yet deeply personal Atonement of
                Jesus Christ. At the LTC Nigeria Campus, we nurture each
                individual’s God-given light in a Spirit-led environment.
              </p>

              <p>
                Through holistic education covering spiritual, social,
                intellectual, and physical elements, we empower students to
                thrive both spiritually and temporally as they magnify their
                talents, embrace every good gift, and become agents unto
                themselves.
              </p>

              <p>
                With well-tended and sprouting seeds of leadership, we act as
                a springboard for each participant to go forth and fulfil
                their divine purposes as disciples of Christ.
              </p>
            </div>
          </div>
        </section>

        {/* About LTC */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-10">
          <SectionHeading
            eyebrow="About the LTC"
            title="A developing campus in Ogun State"
          />

          <div className="mt-6 max-w-4xl space-y-5 text-base leading-8 text-slate-600">
            <p>
              The Light Training Center (LTC), Nigeria, is founded by Every
              Good Gift (EGG) Foundation, an independent nonprofit
              organization in the United States of America.
            </p>

            <p>
              While EGG is not affiliated with The Church of Jesus Christ of
              Latter-day Saints, the LTC is guided by principles consistent
              with the teachings of The Church.
            </p>

            <p>
              Located on approximately 135 acres in Ogun State, Nigeria, the
              LTC campus is being developed to accommodate up to 500 YSA
              returned missionaries in a future nine-month residential
              program.
            </p>
          </div>
        </section>

        {/* Who it is for */}
        <section className="grid gap-8 lg:grid-cols-2">
          <InfoCard
            icon={Users}
            eyebrow="Who It Is For"
            title="Potential LTC applicants"
          >
            <p>
              The current Pioneer Opportunity is intended for Young Single
              Adults (YSA) who are returned missionaries, reside in Nigeria,
              and are 20–30 years old.
            </p>
          </InfoCard>

          <InfoCard
            icon={GraduationCap}
            eyebrow="Holistic Development"
            title="Preparing students for life and leadership"
          >
            <p>
              The future campus is designed to provide development in
              spiritual, interpersonal, professional, vocational, and
              entrepreneurial skills.
            </p>
          </InfoCard>
        </section>

        {/* Pioneer Opportunity */}
        <section className="overflow-hidden rounded-2xl bg-amber-50 ring-1 ring-amber-200">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            <div className="bg-amber-400 p-8 lg:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-950">
                The Pioneer Opportunity
              </p>

              <h2 className="mt-4 text-3xl font-bold text-amber-950">
                Preparing the way for the larger vision
              </h2>

              <div className="mt-6 inline-flex items-center rounded-full bg-amber-950 px-4 py-2 text-sm font-semibold text-white">
                50 selected returned missionaries
              </div>
            </div>

            <div className="p-8 lg:p-10">
              <p className="text-base leading-8 text-slate-700">
                The two-month Voluntary Service Pioneer Opportunity is the
                beginning of the larger LTC vision, allowing 50 selected
                returned missionaries the opportunity to help prepare the way
                for the full campus launch.
              </p>

              <p className="mt-5 text-base leading-8 text-slate-700">
                The future nine-month program is planned as a scholarship
                covering tuition, free housing, and food.
              </p>
            </div>
          </div>
        </section>

        {/* Campus */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-10">
          <SectionHeading
            eyebrow="The Campus"
            title="A growing physical home for the LTC vision"
          />

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div className="space-y-5 text-base leading-8 text-slate-600">
              <p>
                The LTC campus is located in Ogun State, Nigeria,
                approximately 30 minutes south of Abeokuta.
              </p>

              <p>
                More than 50 buildings have already been completed on site,
                providing the beginnings of a campus designed to support
                residential learning and development.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <CampusFeature label="Dormitories" />
              <CampusFeature label="Classrooms" />
              <CampusFeature label="Training Halls" />
              <CampusFeature label="Chapel" />
              <CampusFeature label="Clinic" />
              <CampusFeature label="Cafeteria" />
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Where We Are"
                title="LTC Nigeria Campus"
              />

              <div className="mt-6 flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
                  <MapPin className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Ogun State, Nigeria
                  </p>
                  <p className="mt-1 text-slate-600">
                    Approximately 30 minutes south of Abeokuta.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-100 p-8 text-center">
              <MapPin className="mx-auto h-8 w-8 text-blue-900" />

              <p className="mt-4 font-semibold text-blue-950">
                Campus location
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Additional campus directions and official location resources
                can be added here as they become available.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-blue-950 px-6 py-10 text-white lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-400">
                Ready to learn more?
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Explore the LTC admission process.
              </h2>

              <p className="mt-2 max-w-2xl text-blue-100">
                Review the steps, requirements, and guidelines before beginning
                your application.
              </p>
            </div>

            <Link
              to="/admission-process"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-blue-950 transition hover:bg-blue-50"
            >
              View Admission Process
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>

      <PublicFooter />
    </main>
  );
}

function SectionHeading({ eyebrow, title }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-bold text-blue-950 lg:text-3xl">
        {title}
      </h2>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
        <Icon className="h-5 w-5 text-amber-400" />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, eyebrow, title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
        <Icon className="h-6 w-6" />
      </div>

      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-bold text-blue-950">{title}</h2>

      <div className="mt-4 text-base leading-7 text-slate-600">{children}</div>
    </section>
  );
}

function CampusFeature({ label }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-center">
      <Building2 className="mx-auto h-5 w-5 text-blue-900" />

      <p className="mt-2 text-sm font-semibold text-slate-700">{label}</p>
    </div>
  );
}

function PublicHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-950 text-sm font-bold text-white">
            LTC
          </div>

          <div>
            <p className="font-bold text-blue-950">Light Training Center</p>
            <p className="text-xs text-slate-500">Admissions</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/admission-process"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-900"
          >
            About the Process
          </Link>

          <Link
            to="/ltc-guidelines"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-900"
          >
            LTC Guidelines
          </Link>

          <Link
            to="/help-support"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-900"
          >
            Help & Support
          </Link>

          <Link
            to="/"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-900"
          >
            Sign In
          </Link>
        </nav>

        <Link
          to="/"
          className="text-sm font-semibold text-blue-900 md:hidden"
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
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p>
          © {new Date().getFullYear()} Light Training Center Nigeria
        </p>

        <div className="flex gap-5">
          <Link
            to="/admission-process"
            className="transition hover:text-blue-900"
          >
            Admission Process
          </Link>

          <Link
            to="/help-support"
            className="transition hover:text-blue-900"
          >
            Help & Support
          </Link>

          <Link to="/" className="transition hover:text-blue-900">
            Sign In
          </Link>
        </div>
      </div>
    </footer>
  );
}