"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { uploadImage, uploadFile } from "@/lib/firebase-upload";
import { Loader2 } from "lucide-react";

interface AnnualReportFormData {
  title: string;
  description: string;
  image: string;
  viewUrl: string;
}

interface EditAnnualReportModalProps {
  report: {
    title: string;
    description: string;
    image: string;
    viewUrl: string;
  };
  onCancel: () => void;
  onSave: (data: AnnualReportFormData) => void;
}

export default function EditAnnualReportModal({ report, onCancel, onSave }: EditAnnualReportModalProps) {
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [form, setForm] = useState<AnnualReportFormData>({
    title: report.title,
    description: report.description,
    image: report.image,
    viewUrl: report.viewUrl,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const field = "image";
    setUploadingFields((prev) => ({ ...prev, [field]: true }));
    setError("");
    try {
      const storageUrl = await uploadImage(file, "reports");
      setForm((prev) => ({ ...prev, [field]: storageUrl }));
    } catch (err: any) {
      console.error("Image upload error:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploadingFields((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const field = "viewUrl";
    setUploadingFields((prev) => ({ ...prev, [field]: true }));
    setError("");
    try {
      const storageUrl = await uploadFile(file, "reports");
      setForm((prev) => ({ ...prev, [field]: storageUrl }));
    } catch (err: any) {
      console.error("File upload error:", err);
      setError("Failed to upload report file. Please try again.");
    } finally {
      setUploadingFields((prev) => ({ ...prev, [field]: false }));
    }
  };

  const isUploading = Object.values(uploadingFields).some(Boolean);

  const isValid = form.title.trim() && form.description.trim() && form.image && form.viewUrl;

  const handleSave = () => {
    if (!isValid || isUploading) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Edit Annual Report</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Annual Report 2024"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Report description..."
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            disabled={isUploading}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer disabled:opacity-50"
          />
          {uploadingFields.image ? (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span>Uploading cover image...</span>
            </div>
          ) : form.image ? (
            <img src={form.image} alt="Preview" className="mt-2 h-32 w-auto object-cover rounded" />
          ) : null}
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Report File</label>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {uploadingFields.viewUrl ? (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span>Uploading report file...</span>
            </div>
          ) : form.viewUrl ? (
            <p className="mt-2 text-xs text-gray-500 break-all">
              Stored at: {form.viewUrl}
            </p>
          ) : null}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 font-medium rounded-r-md">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isUploading}
            className="px-5 py-2 rounded-md text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || isUploading}
            className={`px-5 py-2 rounded-md text-sm font-medium text-white transition-all cursor-pointer flex items-center gap-2 ${
              isValid && !isUploading
                ? "bg-gradient-to-r from-secondary-600 via-primary-500 to-secondary-600 hover:brightness-110"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isUploading ? "Uploading..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
