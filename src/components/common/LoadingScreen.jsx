export default function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-800" />

        <p className="mt-4 text-sm text-slate-600">
          LTC...
        </p>
      </div>
    </main>
  );
}