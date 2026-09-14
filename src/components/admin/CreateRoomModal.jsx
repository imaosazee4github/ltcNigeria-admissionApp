import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useCreateHostelRoom,
} from '../../hooks/useAdminRooms';

const initialForm = {
  dormitoryId: '',
  roomName: '',
  bunkBedCount: '',
  description: '',
};

export default function CreateRoomModal({
  open,
  onClose,
  dormitories = [],
}) {
  const [formData, setFormData] =
    useState(initialForm);

  const [message, setMessage] =
    useState('');

  const {
    createRoom,
    creating,
    creationError,
    resetCreation,
  } = useCreateHostelRoom();

  const selectedDormitory =
    useMemo(
      () =>
        dormitories.find(
          (dormitory) =>
            dormitory.id ===
            formData.dormitoryId
        ) || null,
      [
        dormitories,
        formData.dormitoryId,
      ]
    );

  const maximumBunkBeds =
    selectedDormitory?.gender === 'male'
      ? 12
      : 10;

  const currentRoomCount =
    selectedDormitory?.total_rooms || 0;

  const remainingRooms = Math.max(
    0,
    4 - currentRoomCount
  );

  const calculatedCapacity =
    Number(formData.bunkBedCount || 0) * 2;

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (
        event.key === 'Escape' &&
        !creating
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
  }, [open, onClose, creating]);

  useEffect(() => {
    if (open) {
      setFormData(initialForm);
      setMessage('');
      resetCreation();
    }
  }, [open, resetCreation]);

  if (!open) return null;

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setMessage('');

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleDormitoryChange(event) {
    setMessage('');

    setFormData((current) => ({
      ...current,
      dormitoryId: event.target.value,
      bunkBedCount: '',
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    if (!selectedDormitory) {
      setMessage(
        'Select a dormitory.'
      );

      return;
    }

    if (currentRoomCount >= 4) {
      setMessage(
        `${selectedDormitory.house_name} already has four rooms.`
      );

      return;
    }

    const bunkBedCount =
      Number(formData.bunkBedCount);

    if (
      !Number.isInteger(bunkBedCount) ||
      bunkBedCount < 1 ||
      bunkBedCount >
        maximumBunkBeds
    ) {
      setMessage(
        `Enter between 1 and ${maximumBunkBeds} double bunk beds.`
      );

      return;
    }

    try {
      await createRoom({
        dormitoryId:
          formData.dormitoryId,

        roomName:
          formData.roomName,

        bunkBedCount,

        description:
          formData.description,
      });

      onClose();
    } catch {
      // The mutation error is shown below.
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !creating
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-room-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Accommodation
            </p>

            <h2
              id="create-room-title"
              className="mt-1 text-2xl font-bold text-blue-900"
            >
              Create Room or Hall
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add a room and generate its
              bed spaces automatically.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            aria-label="Close create room modal"
            className="rounded-lg border border-slate-300 px-3 py-2 text-xl text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            ×
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div>
            <label
              htmlFor="dormitoryId"
              className="text-sm font-semibold text-slate-700"
            >
              Dormitory
            </label>

            <select
              id="dormitoryId"
              name="dormitoryId"
              value={
                formData.dormitoryId
              }
              onChange={
                handleDormitoryChange
              }
              required
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Select a dormitory
              </option>

              {dormitories.map(
                (dormitory) => (
                  <option
                    key={dormitory.id}
                    value={dormitory.id}
                    disabled={
                      dormitory.status !==
                        'active' ||
                      dormitory.total_rooms >=
                        4
                    }
                  >
                    {
                      dormitory.house_name
                    }{' '}
                    —{' '}
                    {
                      dormitory.hostel_label
                    }
                  </option>
                )
              )}
            </select>
          </div>

          {selectedDormitory && (
            <div className="grid gap-3 rounded-xl bg-blue-50 p-4 sm:grid-cols-3">
              <Information
                label="Gender"
                value={
                  selectedDormitory.gender ===
                  'male'
                    ? 'Male'
                    : 'Female'
                }
              />

              <Information
                label="Rooms"
                value={`${currentRoomCount}/4`}
              />

              <Information
                label="Rooms Remaining"
                value={remainingRooms}
              />
            </div>
          )}

          <div>
            <label
              htmlFor="roomName"
              className="text-sm font-semibold text-slate-700"
            >
              Room or hall name
            </label>

            <input
              id="roomName"
              name="roomName"
              type="text"
              value={formData.roomName}
              onChange={handleChange}
              placeholder="Example: Room 01"
              maxLength={100}
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="bunkBedCount"
              className="text-sm font-semibold text-slate-700"
            >
              Number of double bunk beds
            </label>

            <input
              id="bunkBedCount"
              name="bunkBedCount"
              type="number"
              min="1"
              max={maximumBunkBeds}
              value={
                formData.bunkBedCount
              }
              onChange={handleChange}
              disabled={!selectedDormitory}
              placeholder={
                selectedDormitory
                  ? `Maximum ${maximumBunkBeds}`
                  : 'Select a dormitory first'
              }
              required
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            />

            <p className="mt-2 text-xs text-slate-500">
              {selectedDormitory
                ? `${selectedDormitory.house_name} allows a maximum of ${maximumBunkBeds} double bunk beds per room.`
                : 'Male rooms allow 12 bunk beds. Female rooms allow 10.'}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-800">
              Calculated capacity
            </p>

            <p className="mt-1 text-3xl font-bold text-emerald-700">
              {calculatedCapacity}
            </p>

            <p className="mt-1 text-xs text-emerald-700">
              individual bed spaces
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="text-sm font-semibold text-slate-700"
            >
              Description
              <span className="ml-1 font-normal text-slate-400">
                (optional)
              </span>
            </label>

            <textarea
              id="description"
              name="description"
              rows="3"
              value={
                formData.description
              }
              onChange={handleChange}
              placeholder="Additional information about this room"
              className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {(message ||
            creationError) && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {message ||
                creationError?.message}
            </div>
          )}

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                creating ||
                !selectedDormitory ||
                currentRoomCount >= 4
              }
              className="rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating
                ? 'Creating Room...'
                : 'Create Room'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function Information({
  label,
  value,
}) {
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