import {
  useEffect,
  useState,
} from 'react';

import {
  useReleaseCandidateRoom,
} from '../../hooks/useAdminStudents';

export default function ReleaseRoomModal({
  open,
  onClose,
  applicationId,
  candidateName,
  roomName,
  onReleased,
}) {
  const [reason, setReason] =
    useState('');

  const [message, setMessage] =
    useState('');

  const {
    releaseRoom,
    releasing,
    releaseError,
    resetRelease,
  } = useReleaseCandidateRoom();

  useEffect(() => {
    if (open) {
      setReason('');
      setMessage('');
      resetRelease();
    }
  }, [open, resetRelease]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage('');

    try {
      const result =
        await releaseRoom({
          applicationId,
          reason,
        });

      setMessage(
        result?.message ||
          'The room assignment was released successfully.'
      );

      if (onReleased) {
        await onReleased(result);
      }

      window.setTimeout(() => {
        onClose();
      }, 800);
    } catch {
      // The mutation error is displayed below.
    }
  }

  function handleClose() {
    if (releasing) {
      return;
    }

    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="release-room-title"
    >
      <button
        type="button"
        aria-label="Close release room modal"
        onClick={handleClose}
        className="absolute inset-0"
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="release-room-title"
                className="text-xl font-bold text-blue-900"
              >
                Release Room Assignment
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                This will make the assigned bed
                available again.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={releasing}
              aria-label="Close modal"
              className="text-2xl leading-none text-slate-400 hover:text-slate-700 disabled:cursor-not-allowed"
            >
              ×
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Candidate
            </p>

            <p className="font-semibold text-slate-900">
              {candidateName || 'Candidate'}
            </p>

            {roomName && (
              <>
                <p className="mt-3 text-sm text-slate-500">
                  Current room
                </p>

                <p className="font-semibold text-slate-900">
                  {roomName}
                </p>
              </>
            )}
          </div>

          <div>
            <label
              htmlFor="release-reason"
              className="block text-sm font-semibold text-slate-700"
            >
              Reason for release
              <span className="ml-1 text-red-600">
                *
              </span>
            </label>

            <textarea
              id="release-reason"
              value={reason}
              onChange={(event) =>
                setReason(event.target.value)
              }
              rows={4}
              maxLength={500}
              required
              disabled={releasing}
              placeholder="For example: Test candidate removed before production."
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {reason.length}/500
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            The assignment history will be
            preserved. The candidate’s bed will
            become available and the application
            will return to Awaiting Room.
          </div>

          {releaseError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
            >
              {releaseError.message}
            </div>
          )}

          {message && (
            <div
              role="status"
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"
            >
              {message}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={releasing}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                releasing ||
                !applicationId ||
                !reason.trim()
              }
              className="rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {releasing
                ? 'Releasing...'
                : 'Release Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}