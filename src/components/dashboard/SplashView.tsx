"use client";

import { useState, useEffect } from "react";
import TableToolbar from "./TableToolbar";
import Pagination from "./Pagination";
import AddSplashModal from "./AddSplashModal";
import EditSplashModal from "./EditSplashModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import {
  fetchSplashBanners,
  addSplashBanner,
  updateSplashBanner,
  deleteSplashBanners,
  type FirestoreSplash,
} from "@/lib/admin-actions";
import { Loader2 } from "lucide-react";
import Image from "next/image";

const PAGE_SIZE = 10;

export default function SplashView() {
  const [banners, setBanners] = useState<FirestoreSplash[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editBanner, setEditBanner] = useState<FirestoreSplash | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await fetchSplashBanners();
      setBanners(data);
    } catch (err) {
      console.error("Error fetching splash banners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        const data = await fetchSplashBanners();
        if (active) setBanners(data);
      } catch (err) {
        console.error("Error fetching splash banners:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, []);

  const filtered = banners.filter((b) =>
    search ? b.alt.toLowerCase().includes(search.toLowerCase()) : true
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const totalResults = filtered.length;
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const allChecked =
    paginated.length > 0 && paginated.every((b) => selectedIds.has(b.id!));
  const someChecked = paginated.some((b) => selectedIds.has(b.id!));

  const canEdit = selectedIds.size === 1;
  const canDelete = selectedIds.size > 0;

  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginated.forEach((b) => next.delete(b.id!));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paginated.forEach((b) => next.add(b.id!));
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
    const banner = banners.find((b) => b.id === id);
    if (banner) setEditBanner(banner);
  };

  const handleDelete = () => {
    if (!canDelete) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    const ids = [...selectedIds];
    await deleteSplashBanners(ids);
    setSelectedIds(new Set());
    setShowDeleteConfirm(false);
    await loadBanners();
    const newTotal = filtered.length - ids.length;
    if (currentPage > Math.ceil(newTotal / PAGE_SIZE)) {
      setCurrentPage(Math.max(1, Math.ceil(newTotal / PAGE_SIZE)));
    }
  };

  const handleAdd = async (data: { image: string; linkUrl: string; alt: string }) => {
    await addSplashBanner(data);
    setShowAddModal(false);
    await loadBanners();
    setCurrentPage(Math.ceil((banners.length + 1) / PAGE_SIZE));
  };

  const handleSaveEdit = async (data: { image: string; linkUrl: string; alt: string }) => {
    if (!editBanner?.id) return;
    await updateSplashBanner(editBanner.id, data);
    setEditBanner(null);
    setSelectedIds(new Set());
    await loadBanners();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 min-h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#134981] animate-spin" />
        <span className="ml-3 text-gray-500 font-medium">Loading splash banners...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Splash Banners</h1>
        <p className="text-xs text-gray-400">Latest banner shows on the home page</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#0f1b3d] text-white text-sm font-medium px-4 py-2 rounded-lg hover:brightness-110 transition-all cursor-pointer"
        >
          <span className="text-lg leading-none">+</span> Add Banner
        </button>
      </div>

      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        filterValue={filter}
        onFilterChange={setFilter}
        filterOptions={[]}
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
              <th className="py-3 text-left font-medium text-gray-500 w-24">Image</th>
              <th className="py-3 text-left font-medium text-gray-500">Alt Text</th>
              <th className="py-3 text-left font-medium text-gray-500 w-64">Link URL</th>
              <th className="py-3 text-left font-medium text-gray-500 w-36">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((banner) => {
              const isChecked = selectedIds.has(banner.id!);
              const index = banners.findIndex((b) => b.id === banner.id);
              const isLatest = index === 0;
              return (
                <tr
                  key={banner.id}
                  className={`transition-colors ${isChecked ? "bg-blue-50/40" : "hover:bg-gray-50"} ${isLatest ? "bg-green-50/30" : ""}`}
                >
                  <td className="py-3.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleOne(banner.id!)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer accent-blue-600"
                    />
                  </td>
                  <td className="py-3.5">
                    <div className="relative w-16 h-10 rounded overflow-hidden bg-gray-200">
                      <Image
                        src={banner.image}
                        alt={banner.alt}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="py-3.5 text-gray-800 font-medium pr-4">
                    {banner.alt}
                    {isLatest && (
                      <span className="ml-2 text-[10px] bg-green-100 text-green-700 font-semibold px-1.5 py-0.5 rounded-full">Active</span>
                    )}
                  </td>
                  <td className="py-3.5 text-blue-500 truncate max-w-[220px]">
                    {banner.linkUrl ? (
                      <a
                        href={banner.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={banner.linkUrl}
                        className="hover:underline"
                      >
                        {banner.linkUrl}
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 text-gray-500 text-xs">
                    {banner.createdAt?.toDate?.().toLocaleDateString() || "—"}
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

      {showAddModal && (
        <AddSplashModal
          onCancel={() => { setShowAddModal(false); }}
          onSave={handleAdd}
        />
      )}

      {editBanner && (
        <EditSplashModal
          banner={editBanner}
          onCancel={() => { setEditBanner(null); }}
          onSave={handleSaveEdit}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          count={selectedIds.size}
          label="splash banner"
          onCancel={() => { setShowDeleteConfirm(false); }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
