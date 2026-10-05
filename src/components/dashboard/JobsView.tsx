"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import TableToolbar from "./TableToolbar";
import Pagination from "./Pagination";
import DeleteConfirmModal from "./DeleteConfirmModal";
import AddJobModal from "./AddJobModal";
import EditJobModal from "./EditJobModal";
import {
  fetchJobs,
  addJob,
  updateJob,
  deleteJobs,
  type FirestoreJob,
} from "@/lib/admin-actions";

const PAGE_SIZE = 10;

const typeColors: Record<string, string> = {
  "Full-time": "bg-blue-100 text-blue-700",
  "Part-time": "bg-purple-100 text-purple-700",
  Internship: "bg-green-100 text-green-700",
  Volunteer: "bg-amber-100 text-amber-700",
};

export default function JobsView() {
  const [jobs, setJobs] = useState<FirestoreJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editJob, setEditJob] = useState<FirestoreJob | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setJobs(await fetchJobs());
    } catch (err) {
      console.error("Error fetching jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const filtered = useMemo(() => {
    let result = jobs;
    if (search) {
      result = result.filter((j) =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.location.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filter) {
      result = result.filter((j) => j.type === filter);
    }
    return result;
  }, [search, filter, jobs]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const totalResults = filtered.length;
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const allChecked =
    paginated.length > 0 && paginated.every((j) => selectedIds.has(j.id!));
  const someChecked = paginated.some((j) => selectedIds.has(j.id!));
  const canEdit = selectedIds.size === 1;
  const canDelete = selectedIds.size > 0;

  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginated.forEach((j) => next.delete(j.id!));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginated.forEach((j) => next.add(j.id!));
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
    const job = jobs.find((j) => j.id === id);
    if (job) setEditJob(job);
  };

  const handleDelete = () => {
    if (!canDelete) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    const ids = [...selectedIds];
    await deleteJobs(ids);
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
    await loadJobs();
    const newTotal = filtered.length - ids.length;
    if (currentPage > Math.ceil(newTotal / PAGE_SIZE)) {
      setCurrentPage(Math.max(1, Math.ceil(newTotal / PAGE_SIZE)));
    }
  };

  const handleSaveEdit = async (data: {
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    formLink: string;
    requirements: string[];
    active: boolean;
  }) => {
    if (!editJob?.id) return;
    await updateJob(editJob.id, data);
    setEditJob(null);
    setSelectedIds(new Set());
    await loadJobs();
  };

  const handleAdd = async (data: {
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    formLink: string;
    requirements: string[];
    active: boolean;
  }) => {
    await addJob(data);
    setShowAddModal(false);
    await loadJobs();
    setCurrentPage(Math.ceil((jobs.length + 1) / PAGE_SIZE));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#134981] animate-spin" />
        <span className="ml-3 text-gray-500 font-medium">Loading jobs...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#0f1b3d] text-white text-sm font-medium px-4 py-2 rounded-lg hover:brightness-110 transition-all cursor-pointer"
        >
          <span className="text-lg leading-none">+</span> Add Job
        </button>
      </div>

      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        filterValue={filter}
        onFilterChange={setFilter}
        filterOptions={["Full-time", "Part-time", "Internship", "Volunteer"]}
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
              <th className="py-3 text-left font-medium text-gray-500">Title</th>
              <th className="py-3 text-left font-medium text-gray-500">Location</th>
              <th className="py-3 text-left font-medium text-gray-500">Type</th>
              <th className="py-3 text-left font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((job) => {
              const isChecked = selectedIds.has(job.id!);
              return (
                <tr
                  key={job.id}
                  className={`transition-colors ${isChecked ? "bg-blue-50/40" : "hover:bg-gray-50"}`}
                >
                  <td className="py-3.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOne(job.id!)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer accent-blue-600"
                    />
                  </td>
                  <td className="py-3.5 text-gray-800 font-medium pr-4">{job.title}</td>
                  <td className="py-3.5 text-gray-600">{job.location}</td>
                  <td className="py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[job.type] || "bg-gray-100 text-gray-600"}`}>
                      {job.type}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {job.active ? "Active" : "Inactive"}
                    </span>
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
          onPageChange={(p) => { setCurrentPage(p); setSelectedIds(new Set()); }}
        />
      )}

      {editJob && (
        <EditJobModal
          job={editJob}
          onCancel={() => { setEditJob(null); setSelectedIds(new Set()); }}
          onSave={handleSaveEdit}
        />
      )}

      {showAddModal && (
        <AddJobModal
          onCancel={() => setShowAddModal(false)}
          onSave={handleAdd}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          count={selectedIds.size}
          label="job"
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
