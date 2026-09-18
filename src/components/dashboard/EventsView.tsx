"use client";

import { useState, useMemo, useEffect } from "react";
import TableToolbar from "./TableToolbar";
import Pagination from "./Pagination";
import EditEventModal from "./EditEventModal";
import AddEventModal from "./AddEventModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import {
  fetchEvents,
  addEvent,
  updateEvent,
  deleteEvents,
  type FirestoreEvent,
} from "@/lib/admin-actions";
import { Loader2 } from "lucide-react";

const PAGE_SIZE = 10;

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toDisplayDate(dateStr: string): string {
  if (!dateStr || dateStr.includes(" / ")) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = months[d.getMonth()];
    const year = String(d.getFullYear()).slice(-2);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const meridian = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day} ${month} ${year} / ${hours}:${minutes} ${meridian}`;
  } catch {
    return dateStr;
  }
}

export default function EventsView() {
  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editEvent, setEditEvent] = useState<FirestoreEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await fetchEvents();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filtered = useMemo(() => {
    let result = events;
    if (search) {
      result = result.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result;
  }, [search, events]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const totalResults = filtered.length;
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const allChecked =
    paginated.length > 0 && paginated.every((e) => selectedIds.has(e.id!));
  const someChecked = paginated.some((e) => selectedIds.has(e.id!));

  const canEdit = selectedIds.size === 1;
  const canDelete = selectedIds.size > 0;

  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginated.forEach((e) => next.delete(e.id!));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginated.forEach((e) => next.add(e.id!));
        return next;
      });
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleEdit = () => {
    if (!canEdit) return;
    const id = [...selectedIds][0];
    const event = events.find((e) => e.id === id);
    if (event) setEditEvent(event);
  };

  const handleDelete = () => {
    if (!canDelete) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    const ids = [...selectedIds];
    await deleteEvents(ids);
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
    await loadEvents();
    const newTotal = filtered.length - ids.length;
    if (currentPage > Math.ceil(newTotal / PAGE_SIZE)) {
      setCurrentPage(Math.max(1, Math.ceil(newTotal / PAGE_SIZE)));
    }
  };

  const handleSaveEdit = async (data: { name: string; description: string; location: string; date: string; registrationLink?: string | null; bulletPoints?: string; images?: string[]; endTime?: string }) => {
    if (!editEvent?.id) return;
    await updateEvent(editEvent.id, {
      name: data.name,
      description: data.description,
      location: data.location,
      dateTime: toDisplayDate(data.date),
      registrationLink: data.registrationLink || "",
      bulletPoints: data.bulletPoints ? data.bulletPoints.split("\n").map(p => p.trim()).filter(Boolean) : [],
      images: data.images || [],
      endTime: data.endTime || "",
    });
    setEditEvent(null);
    setSelectedIds(new Set());
    await loadEvents();
  };

  const handleAdd = async (data: { name: string; description: string; location: string; date: string; registrationLink?: string | null; bulletPoints?: string; images?: string[]; endTime?: string }) => {
    await addEvent({
      name: data.name,
      description: data.description,
      dateTime: toDisplayDate(data.date),
      location: data.location,
      registrationLink: data.registrationLink || "",
      bulletPoints: data.bulletPoints ? data.bulletPoints.split("\n").map(p => p.trim()).filter(Boolean) : [],
      images: data.images || [],
      endTime: data.endTime || "",
    });
    setShowAddModal(false);
    await loadEvents();
    setCurrentPage(Math.ceil((events.length + 1) / PAGE_SIZE));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#134981] animate-spin" />
        <span className="ml-3 text-gray-500 font-medium">Loading events...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#0f1b3d] text-white text-sm font-medium px-4 py-2 rounded-lg hover:brightness-110 transition-all cursor-pointer"
        >
          <span className="text-lg leading-none">+</span> Add Events
        </button>
      </div>

      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        filterValue={filter}
        onFilterChange={setFilter}
        filterOptions={["Upcoming", "Past", "Today"]}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="w-10 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = someChecked && !allChecked;
                  }}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer accent-blue-600"
                />
              </th>
              <th className="py-3 text-left font-medium text-gray-500">
                Event Name
              </th>
              <th className="py-3 text-left font-medium text-gray-500 w-44">
                Date / Time
              </th>
              <th className="py-3 text-left font-medium text-gray-500 w-56">
                Location
              </th>
              <th className="py-3 text-left font-medium text-gray-500 w-64">
                Registration Link
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((event) => {
              const isChecked = selectedIds.has(event.id!);
              return (
                <tr
                  key={event.id}
                  className={`transition-colors ${isChecked ? "bg-blue-50/40" : "hover:bg-gray-50"}`}
                >
                  <td className="py-3.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOne(event.id!)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer accent-blue-600"
                    />
                  </td>
                  <td className="py-3.5 text-gray-800 font-medium pr-4">
                    {event.name}
                  </td>
                  <td className="py-3.5 text-gray-600">{event.dateTime}</td>
                  <td className="py-3.5 text-gray-600 min-w-0 max-w-0 truncate">{event.location}</td>
                  <td className="py-3.5 text-blue-500 truncate max-w-[220px]">
                    <a
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={event.registrationLink}
                      className="hover:underline"
                    >
                      {event.registrationLink}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalResults > PAGE_SIZE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalResults={totalResults}
          onPageChange={(p) => {
            setCurrentPage(p);
            setSelectedIds(new Set());
          }}
        />
      )}

      {editEvent && (
        <EditEventModal
          event={editEvent}
          onCancel={() => { setEditEvent(null); }}
          onSave={handleSaveEdit}
        />
      )}

      {showAddModal && (
        <AddEventModal
          onCancel={() => { setShowAddModal(false); }}
          onSave={handleAdd}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          count={selectedIds.size}
          label="event"
          onCancel={() => { setShowDeleteConfirm(false); }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
