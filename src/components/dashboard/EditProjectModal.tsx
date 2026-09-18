"use client";

import { useState } from "react";
import { X, Upload, Plus, Trash2, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/firebase-upload";

interface ProjectStat {
  value: string;
  label: string;
}

interface ProjectFormData {
  title: string;
  description: string;
  location: string;
  coordinates: string;
  goal: string;
  stats: ProjectStat[];
  images: string[];
  beforeImage: string;
  afterImage: string;
  futurePlans: string;
  partners: string[];
}

interface EditProjectModalProps {
  project: ProjectFormData & { id: string };
  onCancel: () => void;
  onSave: (data: ProjectFormData) => Promise<void> | void;
}

export default function EditProjectModal({ project, onCancel, onSave }: EditProjectModalProps) {
  const [saving, setSaving] = useState(false);
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [form, setForm] = useState<ProjectFormData>({
    title: project.title || "",
    description: project.description || "",
    location: project.location || "",
    coordinates: project.coordinates || "",
    goal: project.goal || "",
    stats: project.stats?.length > 0 ? project.stats : [
      { value: "", label: "" },
      { value: "", label: "" },
      { value: "", label: "" },
      { value: "", label: "" },
    ],
    images: project.images || [],
    beforeImage: project.beforeImage || "",
    afterImage: project.afterImage || "",
    futurePlans: project.futurePlans || "",
    partners: project.partners || [],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (field: "images", _e: React.ChangeEvent<HTMLInputElement>) => {
    const files = _e.target.files;
    if (!files) return;
    setUploadingFields((prev) => ({ ...prev, [field]: true }));
    setError("");
    try {
      const urls = await Promise.all(Array.from(files).map((file) => uploadImage(file, "projects")));
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err: any) {
      console.error("Images upload error:", err);
      setError("Failed to upload project images. Please try again.");
    } finally {
      setUploadingFields((prev) => ({ ...prev, [field]: false }));
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSingleImageUpload = async (field: "beforeImage" | "afterImage", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFields((prev) => ({ ...prev, [field]: true }));
    setError("");
    try {
      const storageUrl = await uploadImage(file, "projects");
      setForm((prev) => ({ ...prev, [field]: storageUrl }));
    } catch (err: any) {
      console.error("Single image upload error:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploadingFields((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handlePartnerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const field = "partners";
    setUploadingFields((prev) => ({ ...prev, [field]: true }));
    setError("");
    try {
      const urls = await Promise.all(Array.from(files).map((file) => uploadImage(file, "projects")));
      setForm((prev) => ({ ...prev, partners: [...prev.partners, ...urls] }));
    } catch (err: any) {
      console.error("Partner images upload error:", err);
      setError("Failed to upload partner images. Please try again.");
    } finally {
      setUploadingFields((prev) => ({ ...prev, [field]: false }));
    }
  };

  const removePartner = (index: number) => {
    setForm((prev) => ({
      ...prev,
      partners: prev.partners.filter((_, i) => i !== index),
    }));
  };

  const isUploading = Object.values(uploadingFields).some(Boolean);

  const handleStatChange = (index: number, field: "value" | "label", val: string) => {
    setForm((prev) => {
      const stats = [...prev.stats];
      stats[index] = { ...stats[index], [field]: val };
      return { ...prev, stats };
    });
  };

  const addStat = () => {
    setForm((prev) => ({ ...prev, stats: [...prev.stats, { value: "", label: "" }] }));
  };

  const removeStat = (index: number) => {
    setForm((prev) => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index),
    }));
  };

  const isValid =
    !!(form.title?.trim() &&
    form.description?.trim() &&
    form.location?.trim() &&
    form.coordinates?.trim() &&
    form.goal?.trim() &&
    form.images?.length >= 1 &&
    form.stats?.some((s) => s.value?.trim() && s.label?.trim()));

  const handleSave = async () => {
    if (!isValid || isUploading) return;
    setSaving(true);
    setError("");
    try {
      const cleanedStats = form.stats.filter((s) => s.value?.trim() && s.label?.trim());
      await onSave({
        ...form,
        stats: cleanedStats,
      });
    } catch (err: any) {
      console.error("Save project error:", err);
      setError(err.message || "Failed to save project. Ensure you are signed in.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Edit Project</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm font-medium text-gray-700 mb-4">Basic Information</p>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Project Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ramadan Bachat Camp..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Short Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Brief description of the project..."
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Karachi"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Coordinates</label>
            <input
              type="text"
              name="coordinates"
              value={form.coordinates}
              onChange={handleChange}
              placeholder="e.g. 24.8608, 67.0104"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <hr className="my-5 border-gray-200" />
        <p className="text-sm font-medium text-gray-700 mb-4">Goal & Impact</p>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Goal</label>
          <textarea
            name="goal"
            value={form.goal}
            onChange={handleChange}
            placeholder="Project goal statement..."
            rows={2}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-600">Goal Cards (Stats)</p>
          <button onClick={addStat} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
            <Plus size={16} /> Add Card
          </button>
        </div>

        {form.stats.map((stat, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={stat.value}
              onChange={(e) => handleStatChange(i, "value", e.target.value)}
              placeholder="e.g. 800+"
              className="w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              value={stat.label}
              onChange={(e) => handleStatChange(i, "label", e.target.value)}
              placeholder="e.g. Fruits Distributed"
              className="w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {form.stats.length > 1 && (
              <button onClick={() => removeStat(i)} className="text-red-400 hover:text-red-600 cursor-pointer">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}

        <hr className="my-5 border-gray-200" />
        <p className="text-sm font-medium text-gray-700 mb-4">Project Images (4-5 required)</p>

        <div className="flex flex-wrap gap-3 mb-4">
          {form.images.map((src, i) => (
            <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200">
              <img src={src} alt={`Project ${i}`} className="w-full h-full object-cover" />
              <button onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full">
                <X size={12} />
              </button>
            </div>
          ))}
          {uploadingFields.images ? (
            <div className="flex flex-col items-center justify-center w-24 h-24 border border-gray-200 rounded-md bg-gray-50">
              <Loader2 className="w-6 h-6 text-[#134981] animate-spin" />
              <span className="text-[10px] text-gray-500 mt-1">Uploading...</span>
            </div>
          ) : (
            form.images.length < 5 && (
              <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400 transition-colors">
                <Upload size={18} className="text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Upload</span>
                <input type="file" accept="image/*" multiple onChange={(e) => handleImageUpload("images", e)} className="hidden" />
              </label>
            )
          )}
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Before Image (Optional)</label>
            {uploadingFields.beforeImage ? (
              <div className="flex flex-col items-center justify-center h-32 border border-gray-200 rounded-md bg-gray-50">
                <Loader2 className="w-6 h-6 text-[#134981] animate-spin" />
                <span className="text-xs text-gray-500 mt-1">Uploading...</span>
              </div>
            ) : form.beforeImage ? (
              <div className="relative">
                <img src={form.beforeImage} alt="Before" className="w-full h-32 object-cover rounded-md border border-gray-200" />
                <button onClick={() => setForm((prev) => ({ ...prev, beforeImage: "" }))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400 transition-colors">
                <Upload size={20} className="text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Upload</span>
                <input type="file" accept="image/*" onChange={(e) => handleSingleImageUpload("beforeImage", e)} className="hidden" />
              </label>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">After Image (Optional)</label>
            {uploadingFields.afterImage ? (
              <div className="flex flex-col items-center justify-center h-32 border border-gray-200 rounded-md bg-gray-50">
                <Loader2 className="w-6 h-6 text-[#134981] animate-spin" />
                <span className="text-xs text-gray-500 mt-1">Uploading...</span>
              </div>
            ) : form.afterImage ? (
              <div className="relative">
                <img src={form.afterImage} alt="After" className="w-full h-32 object-cover rounded-md border border-gray-200" />
                <button onClick={() => setForm((prev) => ({ ...prev, afterImage: "" }))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400 transition-colors">
                <Upload size={20} className="text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Upload</span>
                <input type="file" accept="image/*" onChange={(e) => handleSingleImageUpload("afterImage", e)} className="hidden" />
              </label>
            )}
          </div>
        </div>

        <hr className="my-5 border-gray-200" />
        <p className="text-sm font-medium text-gray-700 mb-4">Future Plans (Optional)</p>

        <div className="mb-4">
          <textarea
            name="futurePlans"
            value={form.futurePlans}
            onChange={handleChange}
            placeholder="Future plans for this project..."
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <hr className="my-5 border-gray-200" />
        <p className="text-sm font-medium text-gray-700 mb-4">Project Partners (Optional)</p>

        <div className="flex flex-wrap gap-3 mb-4">
          {form.partners.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200">
              <img src={src} alt={`Partner ${i}`} className="w-full h-full object-contain p-2" />
              <button onClick={() => removePartner(i)} className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full">
                <X size={12} />
              </button>
            </div>
          ))}
          {uploadingFields.partners ? (
            <div className="flex flex-col items-center justify-center w-20 h-20 border border-gray-200 rounded-md bg-gray-50">
              <Loader2 className="w-6 h-6 text-[#134981] animate-spin" />
              <span className="text-[10px] text-gray-500 mt-0.5">Uploading...</span>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400 transition-colors">
              <Upload size={18} className="text-gray-400" />
              <span className="text-xs text-gray-400 mt-1">Upload</span>
              <input type="file" accept="image/*" multiple onChange={handlePartnerUpload} className="hidden" />
            </label>
          )}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 font-medium rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={saving || isUploading}
            className="px-5 py-2 rounded-md text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || saving || isUploading}
            className={`px-5 py-2 rounded-md text-sm font-medium text-white transition-all cursor-pointer flex items-center gap-2 ${
              isValid && !saving && !isUploading
                ? "bg-gradient-to-r from-secondary-600 via-primary-500 to-secondary-600 hover:brightness-110"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {(saving || isUploading) && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving..." : isUploading ? "Uploading..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
