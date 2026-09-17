import { useMemo, useState } from "react";

import {
  useAdminRooms,
  useRemoveHostelRoom,
  useSetHostelRoomStatus,
} from "../../hooks/useAdminRooms";
import AdminLayout from "../../layouts/AdminLayout";
import CreateRoomModal from "../../components/admin/CreateRoomModal";
import EditRoomModal from "../../components/admin/EditRoomModal";

export default function AdminRoomsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState(null);

  const [selectedDormitory, setSelectedDormitory] = useState(null);

  const [openRoomMenu, setOpenRoomMenu] = useState("");

  const [actionMessage, setActionMessage] = useState("");

  const [actionError, setActionError] = useState("");

  const [genderFilter, setGenderFilter] = useState("all");

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminRooms();

  const { setRoomStatus, changingStatus } = useSetHostelRoomStatus();

  const { removeRoom, removing } = useRemoveHostelRoom();

  const dormitories = data?.dormitories || [];

  const filteredDormitories = useMemo(() => {
    if (genderFilter === "all") {
      return dormitories;
    }

    return dormitories.filter((dormitory) => dormitory.gender === genderFilter);
  }, [dormitories, genderFilter]);

  if (isLoading) {
    return (
      <AdminLayout>
        <PageMessage message="Loading accommodation information..." />
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-xl font-bold text-red-800">
            Rooms could not be loaded
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

  const summary = data?.summary || {};
  const male = data?.male || {};
  const female = data?.female || {};

  function openEditRoom(room, dormitory) {
    setSelectedRoom(room);
    setSelectedDormitory(dormitory);
    setEditModalOpen(true);
    setOpenRoomMenu("");
    setActionMessage("");
    setActionError("");
  }

  async function changeRoomStatus(room, status) {
    const labels = {
      available: "reactivate",
      maintenance: "place under maintenance",
      inactive: "deactivate",
    };

    const confirmed = window.confirm(
      `Are you sure you want to ${labels[status]} ${room.room_name}?`,
    );

    if (!confirmed) return;

    setOpenRoomMenu("");
    setActionMessage("");
    setActionError("");

    try {
      const result = await setRoomStatus({
        roomId: room.id,
        status,
      });

      setActionMessage(result?.message || "Room status updated successfully.");
    } catch (statusChangeError) {
      setActionError(statusChangeError.message);
    }
  }

  async function handleRemoveRoom(room) {
    const removalDescription = room.can_permanently_delete
      ? "permanently delete this unused room and its bed spaces"
      : "deactivate this room while preserving its assignment history";

    const confirmed = window.confirm(
      `This will ${removalDescription}. Continue?`,
    );

    if (!confirmed) return;

    setOpenRoomMenu("");
    setActionMessage("");
    setActionError("");

    try {
      const result = await removeRoom(room.id);

      setActionMessage(result?.message || "Room removed successfully.");
    } catch (removalError) {
      setActionError(removalError.message);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {(actionMessage || actionError) && (
          <div
            role={actionError ? "alert" : "status"}
            className={
              actionError
                ? "rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
                : "rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"
            }
          >
            {actionError || actionMessage}
          </div>
        )}

        <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-amber-600">
              Accommodation Management
            </p>

            <h1 className="mt-2 text-3xl font-bold text-blue-900 md:text-4xl">
              Rooms and Bed Spaces
            </h1>

            <p className="mt-2 max-w-3xl text-slate-600">
              Create hostel rooms, monitor capacity and manage available bed
              spaces.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-lg border border-blue-900 px-5 py-3 font-semibold text-blue-900 hover:bg-blue-50 disabled:opacity-50"
            >
              {isFetching ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Create Room
            </button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Dormitories"
            value={summary.totalDormitories}
            description="Active residences"
            color="blue"
          />

          <SummaryCard
            label="Rooms"
            value={summary.totalRooms}
            description="Created rooms"
            color="amber"
          />

          <SummaryCard
            label="Total Capacity"
            value={summary.totalCapacity}
            description="Generated bed spaces"
            color="violet"
          />

          <SummaryCard
            label="Available Spaces"
            value={summary.availableSpaces}
            description={`${summary.occupiedSpaces || 0} currently occupied`}
            color="emerald"
          />
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <GenderCapacityCard
            title="Male Accommodation"
            houses="Nephi House and Alma House"
            capacity={male.capacity}
            occupied={male.occupied}
            available={male.available}
            expectedMaximum={192}
            color="blue"
          />

          <GenderCapacityCard
            title="Female Accommodation"
            houses="Ruth House and Esther House"
            capacity={female.capacity}
            occupied={female.occupied}
            available={female.available}
            expectedMaximum={160}
            color="rose"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-blue-900">Dormitories</h2>

              <p className="mt-1 text-sm text-slate-500">
                Each dormitory can contain up to four rooms or halls.
              </p>
            </div>

            <select
              value={genderFilter}
              onChange={(event) => setGenderFilter(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
            >
              <option value="all">All dormitories</option>

              <option value="male">Male dormitories</option>

              <option value="female">Female dormitories</option>
            </select>
          </div>

          <div className="grid gap-5 p-6 xl:grid-cols-2">
            {filteredDormitories.map((dormitory) => (
              <DormitoryCard
                key={dormitory.id}
                dormitory={dormitory}
                onCreateRoom={() => setCreateModalOpen(true)}
                openRoomMenu={openRoomMenu}
                onToggleRoomMenu={(roomId) =>
                  setOpenRoomMenu((current) =>
                    current === roomId ? "" : roomId,
                  )
                }
                onEditRoom={(room) => openEditRoom(room, dormitory)}
                onChangeRoomStatus={changeRoomStatus}
                onRemoveRoom={handleRemoveRoom}
                actionPending={changingStatus || removing}
              />
            ))}
          </div>
        </section>
      </div>

      <CreateRoomModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        dormitories={dormitories}
      />

      <EditRoomModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedRoom(null);
          setSelectedDormitory(null);
        }}
        room={selectedRoom}
        dormitory={selectedDormitory}
      />
    </AdminLayout>
  );
}

function SummaryCard({ label, value = 0, description, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-900",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="font-semibold text-slate-600">{label}</p>

      <div
        className={`mt-4 inline-flex min-w-16 items-center justify-center rounded-xl px-4 py-3 text-3xl font-bold ${colors[color]}`}
      >
        {value}
      </div>

      <p className="mt-3 text-sm text-slate-500">{description}</p>
    </article>
  );
}

function GenderCapacityCard({
  title,
  houses,
  capacity = 0,
  occupied = 0,
  available = 0,
  expectedMaximum,
  color,
}) {
  const percentage =
    capacity > 0 ? Math.min(100, Math.round((occupied / capacity) * 100)) : 0;

  const barColor = color === "rose" ? "bg-rose-500" : "bg-blue-700";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-blue-900">{title}</h2>

          <p className="mt-1 text-sm text-slate-500">{houses}</p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Maximum {expectedMaximum}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <CapacityValue label="Created" value={capacity} />

        <CapacityValue label="Occupied" value={occupied} />

        <CapacityValue label="Available" value={available} />
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-2 text-right text-xs font-semibold text-slate-500">
        {percentage}% occupied
      </p>
    </article>
  );
}

function CapacityValue({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>

      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function DormitoryCard({
  dormitory,
  onCreateRoom,
  openRoomMenu,
  onToggleRoomMenu,
  onEditRoom,
  onChangeRoomStatus,
  onRemoveRoom,
  actionPending,
}) {
  const rooms = dormitory.rooms || [];

  const roomLimitReached = rooms.length >= 4;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200">
      <header className="bg-blue-50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
              {dormitory.hostel_label}
            </p>

            <h3 className="mt-1 text-xl font-bold text-blue-900">
              {dormitory.house_name}
            </h3>

            <p className="mt-1 text-sm capitalize text-slate-600">
              {dormitory.gender} residence
            </p>
            {dormitory.allocation_code && (
              <p className="mt-1 text-xs font-bold text-blue-700">
                {dormitory.allocation_code}
              </p>
            )}
          </div>

          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
            {dormitory.status}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <CapacityValue label="Rooms" value={`${dormitory.total_rooms}/4`} />

          <CapacityValue label="Capacity" value={dormitory.total_capacity} />

          <CapacityValue label="Available" value={dormitory.available_spaces} />
        </div>
      </header>

      <div className="space-y-3 p-5">
        {rooms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
            <p className="font-semibold text-slate-700">No rooms created</p>

            <p className="mt-1 text-sm text-slate-500">
              Create the first room for {dormitory.house_name}.
            </p>
          </div>
        ) : (
          rooms.map((room) => (
            <RoomRow
              key={room.id}
              room={room}
              menuOpen={openRoomMenu === room.id}
              onToggleMenu={() => onToggleRoomMenu(room.id)}
              onEdit={() => onEditRoom(room)}
              onChangeStatus={(status) => onChangeRoomStatus(room, status)}
              onRemove={() => onRemoveRoom(room)}
              actionPending={actionPending}
            />
          ))
        )}

        <button
          type="button"
          onClick={onCreateRoom}
          disabled={roomLimitReached}
          className="w-full rounded-lg border border-blue-900 px-4 py-3 text-sm font-semibold text-blue-900 hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
        >
          {roomLimitReached
            ? "Four-Room Limit Reached"
            : `Add Room to ${dormitory.house_name}`}
        </button>
      </div>
    </article>
  );
}

function RoomRow({
  room,
  menuOpen,
  onToggleMenu,
  onEdit,
  onChangeStatus,
  onRemove,
  actionPending,
}) {
  const percentage = Number(room.occupancy_percentage) || 0;

  return (
    <div className="relative rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-bold text-slate-900">{room.room_name}</p>

          {room.room_code && (
            <p className="mt-1 text-xs font-bold text-blue-700">
              {room.room_code}
            </p>
          )}

          <p className="mt-1 text-xs text-slate-500">
            {room.bunk_bed_count} double bunk beds · {room.capacity} spaces
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={room.status} />

          <button
            type="button"
            onClick={onToggleMenu}
            disabled={actionPending}
            aria-label={`Room actions for ${room.room_name}`}
            aria-expanded={menuOpen}
            className="rounded-lg px-3 py-2 text-xl font-bold leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
          >
            ⋮
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="absolute right-4 top-14 z-20 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          <RoomAction
            onClick={onEdit}
            disabled={room.status === "inactive" || actionPending}
          >
            Edit Room
          </RoomAction>

          {room.status === "inactive" || room.status === "maintenance" ? (
            <RoomAction
              onClick={() => onChangeStatus("available")}
              disabled={actionPending}
            >
              Reactivate Room
            </RoomAction>
          ) : (
            <RoomAction
              onClick={() => onChangeStatus("maintenance")}
              disabled={!room.can_close || actionPending}
            >
              Mark for Maintenance
            </RoomAction>
          )}

          {room.status !== "inactive" && (
            <RoomAction
              onClick={() => onChangeStatus("inactive")}
              disabled={!room.can_close || actionPending}
            >
              Deactivate Room
            </RoomAction>
          )}

          <div className="my-1 border-t border-slate-200" />

          <RoomAction
            danger
            onClick={onRemove}
            disabled={!room.can_close || actionPending}
          >
            {room.can_permanently_delete ? "Delete Unused Room" : "Remove Room"}
          </RoomAction>

          {!room.can_close && (
            <p className="px-3 py-2 text-xs text-amber-700">
              Move assigned students before closing or removing this room.
            </p>
          )}
        </div>
      )}

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-700"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-slate-500">
        <span>{room.occupied_spaces} occupied</span>

        <span>{room.available_spaces} available</span>
      </div>
    </div>
  );
}

function RoomAction({ children, onClick, disabled = false, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "text-red-700 hover:bg-red-50"
          : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  const colors = {
    available: "bg-emerald-50 text-emerald-700",

    full: "bg-blue-50 text-blue-700",

    maintenance: "bg-amber-50 text-amber-700",

    inactive: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        colors[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

function PageMessage({ message }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-lg font-semibold text-slate-600">{message}</p>
    </div>
  );
}
