import {
  useEffect,
  useState,
} from 'react';

import {
  useUpdateHostelRoom,
} from '../../hooks/useAdminRooms';

const emptyForm = {
  roomName: '',
  bunkBedCount: '',
  description: '',
};

export default function EditRoomModal({
  open,
  onClose,
  room,
  dormitory,
}) {
  const [formData, setFormData] =
    useState(emptyForm);

  const [message, setMessage] =
    useState('');

  const {
    updateRoom,
    updating,
    updateError,
    resetUpdate,
  } = useUpdateHostelRoom();

  const maximumBunkBeds =
    dormitory?.gender === 'male'
      ? 12
      : 10;

  const calculatedCapacity =
    Number(formData.bunkBedCount || 0) * 2;

  useEffect(() => {
    if (!open || !room) return;

    setFormData({
      roomName: room.room_name || '',
      bunkBedCount:
        room.bunk_bed_count || '',
      description:
        room.description || '',
    });

    setMessage('');
    resetUpdate();
  }, [open, room, resetUpdate]);

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (
        event.key === 'Escape' &&
        !updating
      ) {
        onClose();
      }
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      'hidden';

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [open, onClose, updating]);

  if (!open || !room) return null;

  function handleChange(event) {
    const { name, value } = event.target;

    setMessage('');

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    const bunkBedCount =
      Number(formData.bunkBedCount);

    if (!formData.roomName.trim()) {
      setMessage(
        'Enter a room or hall name.'
      );
      return;
    }

    if (
      !Number.isInteger(bunkBedCount) ||
      bunkBedCount < 1 ||
      bunkBedCount > maximumBunkBeds
    ) {
      setMessage(
        `Enter between 1 and ${maximumBunkBeds} double bunk beds.`
      );
      return;
    }

    try {
      await updateRoom({
        roomId: room.id,
        roomName: formData.roomName,
        bunkBedCount,
        description: formData.description,
      });

      onClose();
    } catch {
      // The mutation error is displayed below.
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !updating
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-room-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Accommodation
            </p>

            <h2
              id="edit-room-title"
              className="mt-1 text-2xl font-bold text-blue-900"
            >
              Edit Room
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update room information and usable
              bed capacity.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            aria-label="Close edit room modal"
            className="rounded-lg border border-slate-300 px-3 py-2 text-xl text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            ×
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div className="grid gap-3 rounded-xl bg-blue-50 p-4 sm:grid-cols-3">
            <Information
              label="Dormitory"
              value={
                dormitory?.house_name ||
                'Not available'
              }
            />

            <Information
              label="Room Code"
              value={
                room.room_code ||
                'Not available'
              }
            />

            <Information
              label="Status"
              value={formatStatus(room.status)}
            />
          </div>

          <div>
            <label
              htmlFor="editRoomName"
              className="text-sm font-semibold text-slate-700"
            >
              Room or hall name
            </label>

            <input
              id="editRoomName"
              name="roomName"
              type="text"
              value={formData.roomName}
              onChange={handleChange}
              maxLength={100}
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="editBunkBedCount"
              className="text-sm font-semibold text-slate-700"
            >
              Number of double bunk beds
            </label>

            <input
              id="editBunkBedCount"
              name="bunkBedCount"
              type="number"
              min="1"
              max={maximumBunkBeds}
              value={formData.bunkBedCount}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-2 text-xs text-slate-500">
              {dormitory?.gender === 'male'
                ? 'Male rooms allow a maximum of 12 double bunk beds.'
                : 'Female rooms allow a maximum of 10 double bunk beds.'}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">
              Updated capacity
            </p>

            <p className="mt-1 text-3xl font-bold text-emerald-700">
              {calculatedCapacity}
            </p>

            <p className="mt-1 text-xs text-emerald-700">
              individual bed spaces
            </p>
          </div>

          {Number(formData.bunkBedCount) <
            Number(room.bunk_bed_count) && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Reducing capacity will deactivate the
              removed bed spaces. The change will be
              rejected if any affected bed is occupied.
            </div>
          )}

          <div>
            <label
              htmlFor="editDescription"
              className="text-sm font-semibold text-slate-700"
            >
              Description
              <span className="ml-1 font-normal text-slate-400">
                (optional)
              </span>
            </label>

            <textarea
              id="editDescription"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Additional information about this room"
              className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {(message || updateError) && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {message || updateError?.message}
            </div>
          )}

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={updating}
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updating}
              className="rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updating
                ? 'Saving Changes...'
                : 'Save Changes'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function Information({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-blue-900">
        {value}
      </p>
    </div>
  );
}

function formatStatus(value) {
  if (!value) return 'Not available';

  return value
    .split('_')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(' ');
}
