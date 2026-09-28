import {
  useState,
} from 'react';

import {
  Link,
} from 'react-router-dom';

const SUPPORT_EMAIL =
  'admission@nigerialtc.org';

const WHATSAPP_NUMBER =
  '2349025845066';

const WHATSAPP_URL =
  `https://wa.me/${WHATSAPP_NUMBER}`;

const supportCategories = [
  'Application',
  'Documents',
  'Account / Sign In',
  'Admission Process',
  'Technical Issue',
  'Other',
];

const initialFormData = {
  name: '',
  email: '',
  category: '',
  subject: '',
  message: '',
};

export default function HelpSupportPage() {
  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    formData,
    setFormData,
  ] = useState(initialFormData);

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (submitted) {
      setSubmitted(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const {
      name,
      email,
      category,
      subject,
      message,
    } = formData;

    const emailSubject =
      `[LTC Support] ${subject}`;

    const emailBody = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Support Category: ${category}`,
      '',
      'Message:',
      message,
      '',
      '---',
      'Sent from the Light Training Center Nigeria support page.',
    ].join('\n');

    const mailtoUrl =
      `mailto:${SUPPORT_EMAIL}` +
      `?subject=${encodeURIComponent(emailSubject)}` +
      `&body=${encodeURIComponent(emailBody)}`;

    window.location.href = mailtoUrl;

    setSubmitted(true);

    setFormData(initialFormData);
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-slate-800">
      <PublicHeader />

      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
            Help & Support
          </p>

          <h1 className="mt-4 max-w-4xl font-serif text-4xl font-bold leading-tight text-blue-900 sm:text-5xl lg:text-6xl">
            How can we help you?
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            If you have questions about the LTC Pioneer Phase
            admissions process, your application, required
            documents or your account, send us a support request
            and the LTC Admissions Team will assist you.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
          {/* Support information */}
          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl font-bold text-blue-900">
                ?
              </div>

              <h2 className="mt-5 text-2xl font-bold text-blue-900">
                Need assistance?
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Use the support form to tell us what you need help
                with. Please provide as much detail as possible so
                the Admissions Team can understand and respond to
                your request.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <h2 className="text-xl font-bold text-blue-900">
                Before contacting support
              </h2>

              <ul className="mt-5 space-y-4">
                <SupportTip>
                  Check the LTC Guidelines for application and
                  student requirements.
                </SupportTip>

                <SupportTip>
                  Review the Admission Process for information
                  about each stage of admission.
                </SupportTip>

                <SupportTip>
                  Make sure your email address is correct so the
                  Admissions Team can respond to you.
                </SupportTip>

                <SupportTip>
                  If your question concerns an application,
                  include the relevant details in your message.
                </SupportTip>
              </ul>
            </section>

            <section className="rounded-2xl bg-blue-950 p-6 text-white shadow-sm lg:p-8">
              <h2 className="text-xl font-bold">
                Useful resources
              </h2>

              <div className="mt-5 flex flex-col gap-3">
                <Link
                  to="/admission-process"
                  className="rounded-xl border border-blue-700 bg-blue-900 px-4 py-3 font-semibold transition hover:bg-blue-800"
                >
                  View Admission Process
                </Link>

                <Link
                  to="/ltc-guidelines"
                  className="rounded-xl border border-blue-700 bg-blue-900 px-4 py-3 font-semibold transition hover:bg-blue-800"
                >
                  View LTC Guidelines
                </Link>
              </div>
            </section>
          </aside>

          {/* Support form */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-600">
                Contact the Admissions Team
              </p>

              <h2 className="mt-2 text-2xl font-bold text-blue-900 sm:text-3xl">
                Submit a support request
              </h2>

              <p className="mt-3 leading-7 text-slate-600">
                Complete the form below with your question or
                concern. Your email application will be addressed
                to the LTC Admissions Team.
              </p>
            </div>

            {submitted && (
              <div
                className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4"
                role="status"
              >
                <h3 className="font-bold text-green-900">
                  Support request prepared
                </h3>

                <p className="mt-1 text-sm leading-6 text-green-800">
                  Your email application has been prepared for
                  admission@nigerialtc.org. Please complete the
                  send action in your email application if prompted.
                </p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  label="Full name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />

                <FormField
                  label="Email address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-slate-700"
                >
                  What do you need help with?
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select a support category
                  </option>

                  {supportCategories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <FormField
                label="Subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Briefly describe your issue"
                required
              />

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help..."
                  rows={7}
                  required
                  className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm leading-6 text-amber-900">
                  Please do not include passwords, banking
                  information or other sensitive account credentials
                  in your message.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  All fields marked with * are required.
                </p>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-900 px-7 py-3 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
                >
                  Email Admissions Team
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      {/* CTA */}
      <section className="bg-blue-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 text-white lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="text-2xl font-bold">
              Looking for admission information?
            </h2>

            <p className="mt-2 text-blue-100">
              Review the admission process and LTC guidelines
              before submitting your application.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admission-process"
              className="rounded-xl border border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-blue-950"
            >
              Admission Process
            </Link>

            <Link
              to="/ltc-guidelines"
              className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-blue-950 transition hover:bg-amber-400"
            >
              LTC Guidelines
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />

      {/* Floating contact buttons */}
      <FloatingContactButtons />
    </main>
  );
}

function FormField({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-900 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function SupportTip({
  children,
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500" />

      <span className="text-sm leading-6 text-slate-600">
        {children}
      </span>
    </li>
  );
}

function FloatingContactButtons() {
  const emailUrl =
    `mailto:${SUPPORT_EMAIL}` +
    `?subject=${encodeURIComponent(
      'LTC Admissions Support'
    )}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Email */}
      <a
        href={emailUrl}
        aria-label="Email LTC Admissions"
        title="Email LTC Admissions"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-900 text-white shadow-lg ring-1 ring-blue-950/10 transition hover:-translate-y-1 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
      >
        <MailIcon />
      </a>

      {/* WhatsApp */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with LTC Admissions on WhatsApp"
        title="Chat with LTC Admissions on WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-1 ring-black/5 transition hover:-translate-y-1 hover:bg-[#20bd5a] focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
      >
        <WhatsAppIcon />
      </a>
    </div>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 17.25V6.75Z"
      />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m4 6 8 6 8-6"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path d="M20.52 3.48A11.87 11.87 0 0 0 12.06 0C5.49 0 .15 5.34.15 11.91c0 2.1.55 4.15 1.6 5.96L.05 24l6.27-1.64a11.9 11.9 0 0 0 5.73 1.46h.01c6.56 0 11.9-5.34 11.9-11.91 0-3.18-1.24-6.17-3.44-8.43ZM12.06 21.82h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.97.99-3.63-.23-.37a9.88 9.88 0 0 1-1.51-5.29C2.18 6.44 6.61 2 12.06 2a9.88 9.88 0 0 1 7.02 2.92 9.88 9.88 0 0 1 2.9 7.03c0 5.45-4.43 9.87-9.92 9.87Zm5.42-7.4c-.3-.15-1.77-.87-2.05-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.96 1.17-.18.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.74-1.64-2.03-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.68-1.64-.93-2.25-.25-.6-.5-.52-.68-.53h-.58c-.2 0-.52.07-.8.37-.28.3-1.05 1.03-1.05 2.51s1.08 2.91 1.23 3.11c.15.2 2.12 3.24 5.13 4.54.72.31 1.28.5 1.72.64.72.23 1.37.2 1.88.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
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
              Pioneer Phase Admissions
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <Link
            to="/admission-process"
            className="text-slate-700 transition hover:text-blue-900"
          >
            About the Process
          </Link>

          <Link
            to="/ltc-guidelines"
            className="text-slate-700 transition hover:text-blue-900"
          >
            LTC Guidelines
          </Link>

          <Link
            to="/help-support"
            className="font-semibold text-blue-900"
          >
            Help & Support
          </Link>

          <Link
            to="/"
            className="rounded-lg border border-blue-900 px-4 py-2 font-semibold text-blue-900 transition hover:bg-blue-50"
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

        <div className="flex flex-wrap gap-5">
          <Link
            to="/admission-process"
            className="transition hover:text-blue-900"
          >
            Admission Process
          </Link>

          <Link
            to="/ltc-guidelines"
            className="transition hover:text-blue-900"
          >
            LTC Guidelines
          </Link>

          <Link
            to="/help-support"
            className="transition hover:text-blue-900"
          >
            Help & Support
          </Link>

          <Link
            to="/"
            className="transition hover:text-blue-900"
          >
            Sign In
          </Link>
        </div>
      </div>
    </footer>
  );
}