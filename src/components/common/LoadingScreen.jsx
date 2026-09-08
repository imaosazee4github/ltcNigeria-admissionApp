export default function LoadingScreen({
  message = 'Loading LTC...',
}) {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-slate-50"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <div
          aria-hidden="true"
          className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-800"
        />

        <p className="mt-4 text-sm font-medium text-slate-600">
          {message}
        </p>
      </div>
    </main>
  );
}