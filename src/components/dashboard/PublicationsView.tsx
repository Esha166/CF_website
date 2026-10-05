"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import AddAnnualReportModal from "./AddAnnualReportModal";
import AddPartnerModal from "./AddPartnerModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import EditAnnualReportModal from "./EditAnnualReportModal";
import EditPartnerModal from "./EditPartnerModal";
import Pagination from "./Pagination";
import TableToolbar from "./TableToolbar";
import {
  addAnnualReport,
  deleteAnnualReports,
  fetchAnnualReports,
  updateAnnualReport,
  type FirestoreAnnualReport,
} from "@/lib/admin-actions";

type Tab = "annual-reports";

const PAGE_SIZE = 10;

export default function PublicationsView() {
  const [activeTab, setActiveTab] = useState<Tab>("annual-reports");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [reports, setReports] = useState<FirestoreAnnualReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsSearch, setReportsSearch] = useState("");
  const [reportsFilter, setReportsFilter] = useState("");
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsSelected, setReportsSelected] = useState<Set<string>>(new Set());
  const [editReport, setEditReport] = useState<FirestoreAnnualReport | null>(null);
  const [showAddReport, setShowAddReport] = useState(false);
  const [showDeleteReports, setShowDeleteReports] = useState(false);


  const loadReports = async () => {
    try {
      setReportsLoading(true);
      setReports(await fetchAnnualReports());
    } catch (error) {
      console.error("Error fetching annual reports:", error);
    } finally {
      setReportsLoading(false);
    }
  };


  useEffect(() => {
    void loadReports();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredReports = useMemo(() => {
    let result = reports;
    if (reportsSearch) {
      result = result.filter((report) =>
        report.title.toLowerCase().includes(reportsSearch.toLowerCase()) ||
        report.description.toLowerCase().includes(reportsSearch.toLowerCase())
      );
    }
    return result;
  }, [reports, reportsSearch]);

  const reportsTotalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const reportsPaginated = filteredReports.slice((reportsPage - 1) * PAGE_SIZE, reportsPage * PAGE_SIZE);
  const reportsAllChecked = reportsPaginated.length > 0 && reportsPaginated.every((report) => reportsSelected.has(report.id!));
  const reportsSomeChecked = reportsPaginated.some((report) => reportsSelected.has(report.id!));
  const canEditReport = reportsSelected.size === 1;
  const canDeleteReports = reportsSelected.size > 0;

  const toggleReportsAll = () => {
    if (reportsAllChecked) {
      setReportsSelected((prev) => {
        const next = new Set(prev);
        reportsPaginated.forEach((report) => next.delete(report.id!));
        return next;
      });
    } else {
      setReportsSelected((prev) => {
        const next = new Set(prev);
        reportsPaginated.forEach((report) => next.add(report.id!));
        return next;
      });
    }
  };

  const toggleReport = (id: string) => {
    setReportsSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleEditReport = () => {
    if (!canEditReport) return;
    const id = [...reportsSelected][0];
    const report = reports.find((item) => item.id === id);
    if (report) setEditReport(report);
  };

  const handleSaveReport = async (data: { title: string; description: string; image: string; viewUrl: string; }) => {
    if (editReport?.id) {
      await updateAnnualReport(editReport.id, data);
      setEditReport(null);
      setReportsSelected(new Set());
      await loadReports();
    }
  };

  const handleAddReport = async (data: { title: string; description: string; image: string; viewUrl: string;}) => {
    await addAnnualReport(data);
    setShowAddReport(false);
    await loadReports();
    setReportsPage(Math.max(1, Math.ceil((reports.length + 1) / PAGE_SIZE)));
  };

  const confirmDeleteReports = async () => {
    const ids = [...reportsSelected];
    await deleteAnnualReports(ids);
    setReportsSelected(new Set());
    setShowDeleteReports(false);
    await loadReports();
    const newTotal = filteredReports.length - ids.length;
    if (reportsPage > Math.ceil(newTotal / PAGE_SIZE)) {
      setReportsPage(Math.max(1, Math.ceil(newTotal / PAGE_SIZE)));
    }
  };



  

  const handleAddNew = (type: "annual-report") => {
      setShowAddReport(true);
  };

  const renderReportsTable = () => {
    if (reportsLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#134981] animate-spin" />
          <span className="ml-3 text-gray-500 font-medium">Loading annual reports...</span>
        </div>
      );
    }

    return (
      <>
        <TableToolbar
          searchValue={reportsSearch}
          onSearchChange={(value) => {
            setReportsSearch(value);
            setReportsPage(1);
            setReportsSelected(new Set());
          }}
          filterValue={reportsFilter}
          onFilterChange={setReportsFilter}
          filterOptions={[]}
          canEdit={canEditReport}
          canDelete={canDeleteReports}
          onEdit={handleEditReport}
          onDelete={() => setShowDeleteReports(true)}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="w-10 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={reportsAllChecked}
                    ref={(element) => {
                      if (element) element.indeterminate = reportsSomeChecked && !reportsAllChecked;
                    }}
                    onChange={toggleReportsAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer accent-blue-600"
                  />
                </th>
                <th className="py-3 text-left font-medium text-gray-500">Title</th>
                <th className="py-3 text-left font-medium text-gray-500">Description</th>
                <th className="py-3 text-left font-medium text-gray-500">View URL</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportsPaginated.map((report) => {
                const isChecked = reportsSelected.has(report.id!);
                return (
                  <tr key={report.id} className={`transition-colors ${isChecked ? "bg-blue-50/40" : "hover:bg-gray-50"}`}>
                    <td className="py-3.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleReport(report.id!)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer accent-blue-600"
                      />
                    </td>
                    <td className="py-3.5 text-gray-800 font-medium pr-4">{report.title}</td>
                    <td className="py-3.5 text-gray-600 max-w-[200px] truncate">{report.description}</td>
                    <td className="py-3.5 text-blue-500 truncate max-w-[180px]">
                      {report.viewUrl ? (
                        <a href={report.viewUrl} target="_blank" rel="noopener noreferrer" className="hover:underline" title={report.viewUrl}>
                          {report.viewUrl}
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredReports.length > PAGE_SIZE && (
          <Pagination
            currentPage={reportsPage}
            totalPages={reportsTotalPages}
            totalResults={filteredReports.length}
            onPageChange={(page) => {
              setReportsPage(page);
              setReportsSelected(new Set());
            }}
          />
        )}
      </>
    );
  };


  return (
    <div className="bg-white rounded-xl shadow-sm p-6 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Publications</h1>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="flex items-center gap-2 bg-[#0f1b3d] text-white text-sm font-medium px-4 py-2 rounded-lg hover:brightness-110 transition-all cursor-pointer"
          >
            <span className="text-lg leading-none">+</span> Add New
            <ChevronDown size={16} className={`transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
              <button
                onClick={() => handleAddNew("annual-report")}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
              >
                Annual Report
              </button>
              
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab("annual-reports");
            setReportsSelected(new Set());
          }}
          className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer border-b-2 -mb-[1px] ${
            activeTab === "annual-reports"
              ? "text-blue-600 border-blue-600"
              : "text-gray-500 border-transparent hover:text-gray-700"
          }`}
        >
          Annual Reports
        </button>
        
      </div>

      {activeTab === "annual-reports" ? renderReportsTable() : renderReportsTable()}

      {editReport && (
        <EditAnnualReportModal
          report={editReport}
          onCancel={() => {
            setEditReport(null);
            setReportsSelected(new Set());
          }}
          onSave={handleSaveReport}
        />
      )}

      {showAddReport && (
        <AddAnnualReportModal
          onCancel={() => setShowAddReport(false)}
          onSave={handleAddReport}
        />
      )}

      {showDeleteReports && (
        <DeleteConfirmModal
          count={reportsSelected.size}
          label="annual report"
          onCancel={() => setShowDeleteReports(false)}
          onConfirm={confirmDeleteReports}
        />
      )}

    
    </div>
  );
}

