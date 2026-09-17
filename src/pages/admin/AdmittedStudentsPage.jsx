import { useMemo, useState } from "react";

import AssignRoomModal from "../../components/admin/AssignRoomModal";
import ReleaseRoomModal from "../../components/admin/ReleaseRoomModal";

import {
  useAdminStudents,
  useAutoAssignCandidateRoom,
} from "../../hooks/useAdminStudents";
import AdminLayout from "../../layouts/AdminLayout";

export default function AdmittedStudentsPage() {
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [studentToRelease, setStudentToRelease] = useState(null);

  const [autoAssigningId, setAutoAssigningId] = useState(null);

  const [notice, setNotice] = useState(null);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminStudents();

  const { autoAssignRoom, autoAssigning } = useAutoAssignCandidateRoom();

  const students = data?.students || [];

  const summary = data?.summary || {};

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          student.candidate_name,
          student.candidate_email,
          student.application_number,
          student.local_unit_name,
          student.area_name,
          student.intake_name,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedSearch),
          );

      const matchesStatus =
        statusFilter === "all" || student.room_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  async function handleAutoAssign(student) {
    setNotice(null);

    const confirmed = window.confirm(
      `Automatically assign an available bed to ${student.candidate_name}?`,
    );

    if (!confirmed) return;

    setAutoAssigningId(student.application_id);

    try {
      const result = await autoAssignRoom({
        applicationId: student.application_id,
      });

      setNotice({
        type: result?.allocated ? "success" : "warning",

        message: result?.message || "Room allocation completed.",
      });
    } catch (allocationError) {
      setNotice({
        type: "error",

        message: allocationError.message,
      });
    } finally {
      setAutoAssigningId(null);
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <PageMessage message="Loading admitted students..." />
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-2xl font-bold text-red-800">
            Admitted students could not be loaded
          </h1>

          <p className="mt-2 text-red-700">{error?.message}</p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 rounded-lg bg-red-700 px-5 py-3 font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-7">
        <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-amber-600">
              Admissions
            </p>

            <h1 className="mt-2 text-3xl font-bold text-blue-900 md:text-4xl">
              Admitted Students
            </h1>

            <p className="mt-2 max-w-3xl text-slate-600">
              View admitted candidates and manage their hostel assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="self-start rounded-lg border border-blue-900 px-5 py-3 font-semibold text-blue-900 hover:bg-blue-50 disabled:opacity-50"
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Admitted Students"
            value={summary.total}
            description="Eligible candidates"
            color="blue"
          />

          <SummaryCard
            label="Awaiting Room"
            value={summary.awaitingRoom}
            description="Ready for allocation"
            color="amber"
          />

          <SummaryCard
            label="Room Allocated"
            value={summary.roomAllocated}
            description="Assigned students"
            color="emerald"
          />

          <SummaryCard
            label="Gender Required"
            value={summary.withoutGender}
            description="Cannot allocate yet"
            color="red"
          />
        </section>

        {notice && (
          <Notice
            type={notice.type}
            message={notice.message}
            onClose={() => setNotice(null)}
          />
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-blue-900">
                Student Directory
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Search students and review room-allocation status.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search student..."
                className="min-w-64 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              />

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-3"
              >
                <option value="all">All room statuses</option>

                <option value="awaiting">Awaiting room</option>

                <option value="allocated">Room allocated</option>

                <option value="gender_required">Gender required</option>
              </select>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-bold text-slate-700">
                No students found
              </h3>

              <p className="mt-2 text-slate-500">
                No admitted students match the selected filter.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full">
                  <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Student</th>

                      <th className="px-6 py-4">Intake</th>

                      <th className="px-6 py-4">Gender</th>

                      <th className="px-6 py-4">Room Assignment</th>

                      <th className="px-6 py-4">Status</th>

                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {filteredStudents.map((student) => (
                      <StudentRow
                        key={student.application_id}
                        student={student}
                        autoAssigning={
                          autoAssigning &&
                          autoAssigningId === student.application_id
                        }
                        onAutoAssign={() => handleAutoAssign(student)}
                        onManualAssign={() => setSelectedStudent(student)}
                        onReleaseRoom={() => setStudentToRelease(student)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 p-4 lg:hidden">
                {filteredStudents.map((student) => (

                  <StudentCard
                    key={student.application_id}
                    student={student}
                    autoAssigning={
                      autoAssigning &&
                      autoAssigningId === student.application_id
                    }
                    onAutoAssign={() => handleAutoAssign(student)}
                    onManualAssign={() => setSelectedStudent(student)}
                    onReleaseRoom={() => setStudentToRelease(student)}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <AssignRoomModal
  open={Boolean(
    selectedStudent
  )}
  student={selectedStudent}
  onClose={() =>
    setSelectedStudent(null)
  }
/>

<ReleaseRoomModal
  open={Boolean(
    studentToRelease
  )}
  applicationId={
    studentToRelease
      ?.application_id
  }
  candidateName={
    studentToRelease
      ?.candidate_name
  }
  roomName={
    studentToRelease
      ?.assignment
      ?.room_name
  }
  onClose={() =>
    setStudentToRelease(null)
  }
  onReleased={(result) => {
    setNotice({
      type: 'success',

      message:
        result?.message ||
        'The room assignment was released successfully.',
    });
  }}
/>
    </AdminLayout>
  );
}

function StudentRow({ student, autoAssigning, onAutoAssign, onManualAssign,onReleaseRoom}) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-5">
        <StudentIdentity student={student} />
      </td>

      <td className="px-6 py-5">
        <p className="font-semibold text-slate-700">
          {student.intake_name || "—"}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {student.preferred_programme || "Programme not provided"}
        </p>
      </td>

      <td className="px-6 py-5 capitalize text-slate-700">
        {student.gender || "Not provided"}
      </td>

      <td className="px-6 py-5">
        <AssignmentDetails assignment={student.assignment} />
      </td>

      <td className="px-6 py-5">
        <RoomStatusBadge status={student.room_status} />
      </td>

      <td className="px-6 py-5">
        <StudentActions
          student={student}
          autoAssigning={autoAssigning}
          onAutoAssign={onAutoAssign}
          onManualAssign={onManualAssign}
            onReleaseRoom={onReleaseRoom}
        />
      </td>
    </tr>
  );
}

function StudentCard({ student, autoAssigning, onAutoAssign, onManualAssign, onReleaseRoom }) {
  return (
    <article className="rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-3">
        <StudentIdentity student={student} />

        <RoomStatusBadge status={student.room_status} />
      </div>

      <div className="mt-5 grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Gender
          </p>

          <p className="mt-1 font-semibold capitalize text-slate-800">
            {student.gender || "Not provided"}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Intake
          </p>

          <p className="mt-1 font-semibold text-slate-800">
            {student.intake_name || "—"}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase text-slate-500">
          Room Assignment
        </p>

        <div className="mt-2">
          <AssignmentDetails assignment={student.assignment} />
        </div>
      </div>

      <div className="mt-5">
        <StudentActions
          student={student}
          autoAssigning={autoAssigning}
          onAutoAssign={onAutoAssign}
          onManualAssign={onManualAssign}
            onReleaseRoom={onReleaseRoom}
        />
      </div>
    </article>
  );
}

function StudentIdentity({ student }) {
  return (
    <div>
      <p className="font-bold text-slate-900">{student.candidate_name}</p>

      <p className="mt-1 text-sm text-slate-500">
        {student.application_number}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {student.candidate_email || "No email provided"}
      </p>
    </div>
  );
}

function AssignmentDetails({ assignment }) {
  if (!assignment) {
    return <p className="text-sm text-slate-400">Not assigned</p>;
  }

  return (
    <div>
      <p className="font-bold text-blue-900">{assignment.house_name}</p>

      <p className="mt-1 text-sm text-slate-600">
        {assignment.room_name}
        {" · "}
        {assignment.bed_label}
      </p>

      <p className="mt-1 text-xs capitalize text-slate-400">
        Assigned by {assignment.assignment_source}
      </p>
    </div>
  );
}

function StudentActions({
  student,
  autoAssigning,
  onAutoAssign,
  onManualAssign,
  onReleaseRoom
}) {
  if (student.room_status === "gender_required") {
    return (
      <div className="text-right">
        <button
          type="button"
          disabled
          title="Gender information is required"
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400"
        >
          Gender Required
        </button>
      </div>
    );
  }

  if (student.room_status === "allocated") {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onManualAssign}
          className="rounded-lg border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50"
        >
          Change Room
        </button>

         <button
        type="button"
        onClick={onReleaseRoom}
        className="rounded-lg border border-red-600 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
      >
        Unassign Room
      </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <button
        type="button"
        onClick={onAutoAssign}
        disabled={autoAssigning}
        className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
      >
        {autoAssigning ? "Assigning..." : "Auto Assign"}
      </button>

      <button
        type="button"
        onClick={onManualAssign}
        disabled={autoAssigning}
        className="rounded-lg border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50 disabled:opacity-50"
      >
        Select Bed
      </button>
    </div>
  );
}

function RoomStatusBadge({ status }) {
  const settings = {
    allocated: {
      label: "Allocated",
      style: "bg-emerald-100 text-emerald-700",
    },

    awaiting: {
      label: "Awaiting Room",
      style: "bg-amber-100 text-amber-700",
    },

    gender_required: {
      label: "Gender Required",
      style: "bg-red-100 text-red-700",
    },
  };

  const setting = settings[status] || settings.awaiting;

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${setting.style}`}
    >
      {setting.label}
    </span>
  );
}

function SummaryCard({ label, value = 0, description, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-900",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="font-semibold text-slate-600">{label}</p>

      <div
        className={`mt-4 inline-flex min-w-16 justify-center rounded-xl px-4 py-3 text-3xl font-bold ${colors[color]}`}
      >
        {value}
      </div>

      <p className="mt-3 text-sm text-slate-500">{description}</p>
    </article>
  );
}

function Notice({ type, message, onClose }) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",

    warning: "border-amber-200 bg-amber-50 text-amber-800",

    error: "border-red-200 bg-red-50 text-red-800",
  };

  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-xl border p-4 ${styles[type]}`}
      role="status"
    >
      <p className="font-semibold">{message}</p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close message"
        className="text-xl"
      >
        ×
      </button>
    </div>
  );
}

function PageMessage({ message }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-lg font-semibold text-slate-600">{message}</p>
    </div>
  );
}
