"use client";

import { useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";

import { uploadImage } from "@/lib/firebase-upload";

export interface SplashFormData {
  image: string;
  linkUrl: string;
  alt: string;
}

interface EditSplashModalProps {
  banner: {
    image: string;
    linkUrl?: string;
    alt: string;
  };
  onCancel: () => void;
  onSave: (data: SplashFormData) => Promise<void> | void;
}

export default function EditSplashModal({ banner, onCancel, onSave }: EditSplashModalProps) {
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<SplashFormData>({
    image: banner.image || "",
    linkUrl: banner.linkUrl || "",
    alt: banner.alt || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const field = "image";
    setUploadingFields((prev) => ({ ...prev, [field]: true }));
    setError("");
    try {
      const storageUrl = await uploadImage(file, "splash");
      setForm((prev) => ({ ...prev, [field]: storageUrl }));
    } catch (err: unknown) {
      console.error("Image upload error:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploadingFields((prev) => ({ ...prev, [field]: false }));
    }
  };

  const isUploading = Object.values(uploadingFields).some(Boolean);
  const isValid = form.image.trim() && form.alt.trim();

  const handleSave = async () => {
    if (!isValid || isUploading) return;
    setSaving(true);
    setError("");
    try {
      await onSave(form);
    } catch (err: unknown) {
      console.error("Save splash banner error:", err);
      setError(err instanceof Error ? err.message : "Failed to save splash banner.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Edit Splash Banner</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer animate-fadeIn">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm font-medium text-gray-700 mb-4">Banner Details</p>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Banner Image</label>
          {uploadingFields.image ? (
            <div className="flex flex-col items-center justify-center w-full h-40 border border-gray-200 rounded-md bg-gray-50 mb-2">
              <Loader2 className="w-8 h-8 text-[#134981] animate-spin" />
              <span className="text-xs text-gray-500 mt-2">Uploading image...</span>
            </div>
          ) : form.image ? (
            <div className="relative w-full h-40 rounded-md overflow-hidden bg-gray-100 mb-2">
              <Image
                src={form.image}
                alt="Preview"
                fill
                className="object-contain animate-fadeIn"
              />
            </div>
          ) : null}
          <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400 transition-colors">
            <Upload size={18} className="text-gray-400" />
            <span className="text-xs text-gray-400 mt-1">
              {form.image ? "Change Image" : "Upload Image"}
            </span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Link URL (optional)</label>
          <input
            type="text"
            name="linkUrl"
            value={form.linkUrl}
            onChange={handleChange}
            placeholder="https://example.com/event-details"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-1">Alt Text</label>
          <input
            type="text"
            name="alt"
            value={form.alt}
            onChange={handleChange}
            placeholder="Announcement description"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 font-medium rounded-r-md">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={saving || isUploading}
            className="px-5 py-2 rounded-md text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || isUploading || saving}
            className={`px-5 py-2 rounded-md text-sm font-medium text-white transition-all cursor-pointer flex items-center gap-2 ${
              isValid && !isUploading && !saving
                ? "bg-gradient-to-r from-secondary-600 via-primary-500 to-secondary-600 hover:brightness-110"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
