"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import JobDescriptionEditor from "./JobDescriptionEditor";

interface JobFormData {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  formLink: string;
  requirements: string[];
  active: boolean;
}

interface EditJobModalProps {
  job: {
    title: string;
    department?: string;
    location: string;
    type: string;
    description: string;
    formLink?: string;
    requirements: string[];
    active: boolean;
  };
  onCancel: () => void;
  onSave: (data: JobFormData) => void;
}

export default function EditJobModal({ job, onCancel, onSave }: EditJobModalProps) {
  const [form, setForm] = useState<JobFormData>({
    title: job.title,
    department: job.department || "",
    location: job.location,
    type: job.type,
    description: job.description,
    formLink: job.formLink || "",
    requirements: job.requirements.length > 0 ? job.requirements : [""],
    active: job.active,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addRequirement = () => {
    setForm((prev) => ({ ...prev, requirements: [...prev.requirements, ""] }));
  };

  const removeRequirement = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== idx),
    }));
  };

  const updateRequirement = (idx: number, value: string) => {
    setForm((prev) => {
      const updated = [...prev.requirements];
      updated[idx] = value;
      return { ...prev, requirements: updated };
    });
  };

  const isValid = form.title.trim() && form.description.replace(/<[^>]+>/g, "").trim() && form.requirements.some((r) => r.trim());

  const handleSave = () => {
    if (!isValid) return;
    onSave({ ...form, requirements: form.requirements.filter((r) => r.trim()) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Edit Job</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Job Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Software Engineer"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Karachi, Pakistan"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Department</label>
          <input
            type="text"
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="Programs, Finance, Communications"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Volunteer">Volunteer</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Description</label>
          <JobDescriptionEditor
            value={form.description}
            onChange={(description) => setForm((prev) => ({ ...prev, description }))}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Application Form Link</label>
          <input
            type="url"
            name="formLink"
            value={form.formLink}
            onChange={handleChange}
            placeholder="https://forms.google.com/..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm text-gray-600">Requirements</label>
            <button
              onClick={addRequirement}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <Plus size={14} /> Add Requirement
            </button>
          </div>
          {form.requirements.map((req, idx) => (
            <div key={idx} className="flex items-start gap-2 mb-2">
              <input
                type="text"
                value={req}
                onChange={(e) => updateRequirement(idx, e.target.value)}
                placeholder={`Requirement ${idx + 1}`}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {form.requirements.length > 1 && (
                <button
                  onClick={() => removeRequirement(idx)}
                  className="mt-1 text-red-400 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            checked={form.active}
            onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer accent-blue-600"
          />
          <label htmlFor="active" className="text-sm text-gray-600 cursor-pointer">
            Active (visible on career page)
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-md text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`px-5 py-2 rounded-md text-sm font-medium text-white transition-all cursor-pointer ${
              isValid
                ? "bg-gradient-to-r from-secondary-600 via-primary-500 to-secondary-600 hover:brightness-110"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
