"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Trash2, ChevronDown } from "lucide-react";
import Pagination from "./Pagination";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { fetchDonations, deleteDonations, type FirestoreDonation } from "@/lib/admin-actions";
import { Loader2 } from "lucide-react";

const PAGE_SIZE = 10;

export default function DonationsView() {
  const [donations, setDonations] = useState<FirestoreDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const data = await fetchDonations();
      setDonations(data);
    } catch (err) {
      console.error("Error fetching donations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const paymentMethods = useMemo(() => {
    return Array.from(new Set(donations.map((d) => d.paymentMethod))).filter(Boolean);
  }, [donations]);

  const filtered = useMemo(() => {
    let result = donations;
    if (search) {
      result = result.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.email.toLowerCase().includes(search.toLowerCase()) ||
        d.paymentMethod.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (filter) {
      result = result.filter((d) => d.paymentMethod === filter);
    }
    return result;
  }, [search, filter, donations]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const totalResults = filtered.length;
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const allChecked =
    paginated.length > 0 && paginated.every((d) => selectedIds.has(d.id!));
  const someChecked = paginated.some((d) => selectedIds.has(d.id!));

  const canDelete = selectedIds.size > 0;

  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginated.forEach((d) => next.delete(d.id!));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginated.forEach((d) => next.add(d.id!));
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

  const handleDelete = () => {
    if (!canDelete) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    const ids = [...selectedIds];
    await deleteDonations(ids);
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
    await loadDonations();
    const newTotal = filtered.length - ids.length;
    if (currentPage > Math.ceil(newTotal / PAGE_SIZE)) {
      setCurrentPage(Math.max(1, Math.ceil(newTotal / PAGE_SIZE)));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#134981] animate-spin" />
        <span className="ml-3 text-gray-500 font-medium">Loading donations...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
      </div>

      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
              className="appearance-none border border-gray-200 rounded-md px-3 py-2 pr-8 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">All Methods</option>
              {paymentMethods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or method..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="border border-gray-200 rounded-md pl-9 pr-3 py-2 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            disabled={!canDelete}
            title={!canDelete ? "Select items to delete" : "Delete"}
            className={`p-2 rounded-md border transition-colors ${
              canDelete
                ? "border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-200 cursor-pointer"
                : "border-gray-100 text-gray-300 cursor-not-allowed"
            }`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

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
                Name
              </th>
              <th className="py-3 text-left font-medium text-gray-500 w-52">
                Email
              </th>
              <th className="py-3 text-left font-medium text-gray-500 w-36">
                Phone
              </th>
              <th className="py-3 text-left font-medium text-gray-500 w-28">
                Country
              </th>
              <th className="py-3 text-left font-medium text-gray-500 w-32">
                City
              </th>
              <th className="py-3 text-left font-medium text-gray-500 w-28">
                Amount
              </th>
              <th className="py-3 text-left font-medium text-gray-500 w-32">
                Payment Method
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((donation) => {
              const isChecked = selectedIds.has(donation.id!);
              return (
                <tr
                  key={donation.id}
                  className={`transition-colors ${isChecked ? "bg-blue-50/40" : "hover:bg-gray-50"}`}
                >
                  <td className="py-3.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOne(donation.id!)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer accent-blue-600"
                    />
                  </td>
                  <td className="py-3.5 text-gray-800 font-medium pr-4">
                    {donation.name}
                  </td>
                  <td className="py-3.5 text-gray-600">{donation.email}</td>
                  <td className="py-3.5 text-gray-600">{donation.phone}</td>
                  <td className="py-3.5 text-gray-600">{donation.country || "-"}</td>
                  <td className="py-3.5 text-gray-600">{donation.city || "-"}</td>
                  <td className="py-3.5 text-gray-800 font-medium">{donation.amount}/-</td>
                  <td className="py-3.5 text-gray-600">{donation.paymentMethod}</td>
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

      {showDeleteConfirm && (
        <DeleteConfirmModal
          count={selectedIds.size}
          label="donation"
          onCancel={() => { setShowDeleteConfirm(false); }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
