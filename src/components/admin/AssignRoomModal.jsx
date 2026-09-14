import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useAssignCandidateRoom,
  useAvailableBedSpaces,
} from '../../hooks/useAdminStudents';

export default function AssignRoomModal({
  open,
  student,
  onClose,
}) {
  const applicationId =
    student?.application_id || null;

  const [selectedDormitoryId, setSelectedDormitoryId] =
    useState('');

  const [selectedRoomId, setSelectedRoomId] =
    useState('');

  const [selectedBedSpaceId, setSelectedBedSpaceId] =
    useState('');

  const [notes, setNotes] =
    useState('');

  const [validationError, setValidationError] =
    useState('');

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useAvailableBedSpaces(
    applicationId,
    open
  );

  const {
    assignRoom,
    assigning,
    assignmentError,
    resetAssignment,
  } = useAssignCandidateRoom(
    applicationId
  );

  const dormitories =
    data?.dormitories || [];

  const selectedDormitory =
    useMemo(
      () =>
        dormitories.find(
          (dormitory) =>
            dormitory.id ===
            selectedDormitoryId
        ) || null,
      [
        dormitories,
        selectedDormitoryId,
      ]
    );

  const rooms =
    selectedDormitory?.rooms || [];

  const selectedRoom =
    useMemo(
      () =>
        rooms.find(
          (room) =>
            room.id === selectedRoomId
        ) || null,
      [
        rooms,
        selectedRoomId,
      ]
    );

  const bedSpaces =
    selectedRoom?.bed_spaces || [];

  const selectedBed =
    useMemo(
      () =>
        bedSpaces.find(
          (bed) =>
            bed.id ===
            selectedBedSpaceId
        ) || null,
      [
        bedSpaces,
        selectedBedSpaceId,
      ]
    );

  useEffect(() => {
    if (!open) return;

    setSelectedDormitoryId('');
    setSelectedRoomId('');
    setSelectedBedSpaceId('');
    setNotes('');
    setValidationError('');
    resetAssignment();
  }, [
    open,
    applicationId,
    resetAssignment,
  ]);

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (
        event.key === 'Escape' &&
        !assigning
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
  }, [
    open,
    assigning,
    onClose,
  ]);

  if (!open || !student) {
    return null;
  }

  function handleDormitoryChange(event) {
    setSelectedDormitoryId(
      event.target.value
    );

    setSelectedRoomId('');
    setSelectedBedSpaceId('');
    setValidationError('');
  }

  function handleRoomChange(event) {
    setSelectedRoomId(
      event.target.value
    );

    setSelectedBedSpaceId('');
    setValidationError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setValidationError('');

    if (!selectedBedSpaceId) {
      setValidationError(
        'Select a bed space.'
      );

      return;
    }

    try {
      await assignRoom({
        bedSpaceId:
          selectedBedSpaceId,

        notes,
      });

      onClose();
    } catch {
      // Mutation error is displayed below.
    }
  }

  const currentAssignment =
    data?.currentAssignment ||
    student?.assignment ||
    null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !assigning
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-room-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Accommodation
            </p>

            <h2
              id="assign-room-title"
              className="mt-1 text-2xl font-bold text-blue-900"
            >
              {currentAssignment
                ? 'Change Room Assignment'
                : 'Assign Room'}
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              {student.candidate_name}
              {' · '}
              {student.application_number}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={assigning}
            aria-label="Close room assignment"
            className="rounded-lg border border-slate-300 px-3 py-2 text-xl text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            ×
          </button>
        </header>

        <div className="p-6">
          <div className="grid gap-3 rounded-xl bg-blue-50 p-4 sm:grid-cols-3">
            <Information
              label="Candidate"
              value={
                student.candidate_name
              }
            />

            <Information
              label="Gender"
              value={
                formatGender(
                  student.gender
                )
              }
            />

            <Information
              label="Available Beds"
              value={
                data?.availableCount || 0
              }
            />
          </div>

          {currentAssignment && (
            <section className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Current Assignment
              </p>

              <p className="mt-2 font-bold text-slate-900">
                {
                  currentAssignment.house_name
                }
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {
                  currentAssignment.room_name
                }
                {' · '}
                {
                  currentAssignment.bed_label
                }
              </p>

              <p className="mt-2 text-xs text-amber-700">
                Selecting a new bed will
                release the current bed
                automatically.
              </p>
            </section>
          )}

          {isLoading && (
            <PageMessage message="Loading available bed spaces..." />
          )}

          {isError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="font-semibold text-red-800">
                Bed spaces could not be
                loaded
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error?.message}
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white"
              >
                Try Again
              </button>
            </div>
          )}

          {!isLoading &&
            !isError &&
            data?.availableCount === 0 && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                No compatible bed space is
                currently available for
                this candidate.
              </div>
            )}

          {!isLoading &&
            !isError &&
            data?.availableCount > 0 && (
              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-5"
              >
                <div>
                  <label
                    htmlFor="assignmentDormitory"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Dormitory
                  </label>

                  <select
                    id="assignmentDormitory"
                    value={
                      selectedDormitoryId
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
                          key={
                            dormitory.id
                          }
                          value={
                            dormitory.id
                          }
                        >
                          {
                            dormitory.house_name
                          }
                          {' — '}
                          {
                            dormitory.available_spaces
                          }{' '}
                          available
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="assignmentRoom"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Room
                  </label>

                  <select
                    id="assignmentRoom"
                    value={
                      selectedRoomId
                    }
                    onChange={
                      handleRoomChange
                    }
                    disabled={
                      !selectedDormitory
                    }
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">
                      Select a room
                    </option>

                    {rooms.map((room) => (
                      <option
                        key={room.id}
                        value={room.id}
                      >
                        {room.room_name}
                        {' — '}
                        {
                          room.available_spaces
                        }{' '}
                        available
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="assignmentBed"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Bed space
                  </label>

                  <select
                    id="assignmentBed"
                    value={
                      selectedBedSpaceId
                    }
                    onChange={(event) => {
                      setSelectedBedSpaceId(
                        event.target.value
                      );

                      setValidationError('');
                    }}
                    disabled={!selectedRoom}
                    required
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">
                      Select a bed space
                    </option>

                    {bedSpaces.map(
                      (bed) => (
                        <option
                          key={bed.id}
                          value={bed.id}
                        >
                          {bed.bed_label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {selectedBed && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      New Assignment
                    </p>

                    <p className="mt-2 font-bold text-emerald-900">
                      {
                        selectedDormitory.house_name
                      }
                    </p>

                    <p className="mt-1 text-sm text-emerald-800">
                      {
                        selectedRoom.room_name
                      }
                      {' · '}
                      {
                        selectedBed.bed_label
                      }
                    </p>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="assignmentNotes"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Admin notes
                    <span className="ml-1 font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    id="assignmentNotes"
                    rows="3"
                    value={notes}
                    onChange={(event) =>
                      setNotes(
                        event.target.value
                      )
                    }
                    placeholder="Reason for manual assignment or room change"
                    className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {(validationError ||
                  assignmentError) && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    {validationError ||
                      assignmentError?.message}
                  </div>
                )}

                <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={assigning}
                    className="rounded-lg border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      assigning ||
                      !selectedBedSpaceId
                    }
                    className="rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {assigning
                      ? 'Saving Assignment...'
                      : currentAssignment
                        ? 'Change Assignment'
                        : 'Assign Selected Bed'}
                  </button>
                </footer>
              </form>
            )}
        </div>
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

      <p className="mt-1 font-bold capitalize text-blue-900">
        {value ?? '—'}
      </p>
    </div>
  );
}

function PageMessage({ message }) {
  return (
    <div className="mt-5 rounded-xl bg-slate-50 p-6 text-center text-sm font-semibold text-slate-600">
      {message}
    </div>
  );
}

function formatGender(gender) {
  if (!gender) {
    return 'Not provided';
  }

  return gender.charAt(0).toUpperCase() +
    gender.slice(1);
}