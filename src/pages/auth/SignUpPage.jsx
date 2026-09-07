import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function SignUpPage() {
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('The passwords do not match.');
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMessage('You must accept the terms to continue.');
      return;
    }

    setSubmitting(true);

    const { error } = await signUp({
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });

    if (error) {
      setErrorMessage(error.message);
      setSubmitting(false);
      return;
    }

    setSuccessMessage(
      'Registration successful. Check your email to confirm your account.'
    );

    setSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <Link
          to="/"
          className="text-sm font-semibold text-blue-900"
        >
          ← Back to login
        </Link>

        <h1 className="mt-6 font-serif text-3xl font-bold text-blue-900">
          Create Your Candidate Account
        </h1>

        <p className="mt-2 text-slate-600">
          Register to begin your LTC Nigeria admission application.
        </p>

        {errorMessage && (
          <div className="mt-5 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mt-5 rounded-md bg-green-50 p-4 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-7 grid gap-5 md:grid-cols-2"
        >
          <FormField
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            autoComplete="name"
          />

          <FormField
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            autoComplete="tel"
          />

          <div className="md:col-span-2">
            <FormField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <FormField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
          />

          <FormField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />

          <label className="flex items-start gap-3 text-sm text-slate-600 md:col-span-2">
            <input
              name="agreeTerms"
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mt-1"
            />

            <span>
              I agree to the privacy policy and terms of use.
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-900 px-5 py-3 font-semibold text-white disabled:opacity-60 md:col-span-2"
          >
            {submitting
              ? 'Creating account...'
              : 'Create Candidate Account'}
          </button>
        </form>
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
  autoComplete,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
        className="w-full rounded-md border border-slate-300 px-3 py-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}