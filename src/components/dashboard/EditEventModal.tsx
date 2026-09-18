"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { uploadImage } from "@/lib/firebase-upload";

interface EventFormData {
  name: string;
  description: string;
  location: string;
  date: string;
  registrationLink: string;
  bulletPoints: string;
  images: string[];
  endTime: string;
}

interface EditEventModalProps {
  event: any;
  onCancel: () => void;
  onSave: (data: EventFormData) => Promise<void> | void;
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toDatetimeLocal(dateStr: string): string {
  if (!dateStr || !dateStr.includes(" / ")) return dateStr;
  try {
    const [datePart, timePart] = dateStr.split(" / ");
    const [day, month, year] = datePart.split(" ");
    const fullYear = 2000 + parseInt(year);
    const monthNum = months.indexOf(month) + 1;
    const [time, meridian] = timePart.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (meridian === "PM" && hours !== 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;
    return `${fullYear}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

export default function EditEventModal({ event, onCancel, onSave }: EditEventModalProps) {
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState("");
  const [isTBA, setIsTBA] = useState(
    event.dateTime === "To be announced" || event.date === "To be announced"
  );
  const [form, setForm] = useState<EventFormData>({
    name: event.name,
    description: event.description,
    location: event.location,
    date: event.dateTime === "To be announced" ? "" : toDatetimeLocal(event.dateTime),
    registrationLink: event.registrationLink || "",
    bulletPoints: event.bulletPoints ? (Array.isArray(event.bulletPoints) ? event.bulletPoints.join("\n") : event.bulletPoints) : "",
    images: Array.isArray(event.images) ? event.images : [],
    endTime: event.endTime || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isValid =
    form.name.trim() &&
    form.description.trim() &&
    form.location.trim() &&
    (isTBA || form.date.trim()) &&
    form.images.length >= 4;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);
    setError("");
    try {
      await onSave({
        ...form,
        date: isTBA ? "To be announced" : form.date,
      });
    } catch (err: any) {
      console.error("Save event error:", err);
      setError(err.message || "Failed to save event. Ensure you are signed in.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (form.images.length + files.length > 5) {
      setError("You can upload up to 5 images for each event.");
      e.target.value = "";
      return;
    }

    setUploadingImages(true);
    setError("");
    try {
      const uploadedUrls = await Promise.all(files.map((file) => uploadImage(file, "events")));
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls].slice(0, 5),
      }));
      e.target.value = "";
    } catch (err: any) {
      console.error("Image upload error:", err);
      setError(err.message || "Failed to upload event images. Please try another file.");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-900">Edit Event</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm font-medium text-gray-700 mb-4">Information</p>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Event Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Hammad Foundation..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Event Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="This event was hosted by ..."
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Event Images (4-5 required)</label>
          <div className="flex flex-wrap gap-3 mb-3">
            {form.images.map((src, index) => (
              <div key={`${src}-${index}`} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                <img src={src} alt={`Event ${index + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-1 top-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {form.images.length < 5 && (
            <label className="inline-flex cursor-pointer items-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <span>{uploadingImages ? "Uploading..." : "Upload images"}</span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            </label>
          )}
          <p className="mt-2 text-xs text-gray-500">Upload 4 to 5 images for the previous-events gallery.</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Event location"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Date</label>
          <input
            type="datetime-local"
            name="date"
            value={isTBA ? "" : form.date}
            onChange={handleChange}
            disabled={isTBA}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isTBA}
              onChange={(e) => {
                setIsTBA(e.target.checked);
                if (e.target.checked) {
                  setForm((prev) => ({ ...prev, date: "" }));
                }
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs text-gray-600 font-medium">To be announced (TBA)</span>
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">Registration Link</label>
          <input
            type="url"
            name="registrationLink"
            value={form.registrationLink}
            onChange={handleChange}
            placeholder="https://example.com/register"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-1">End Time (Optional)</label>
          <input
            type="text"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            placeholder="e.g. 6:00 PM or to be announced"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-1">Highlights/Bullet Points (One per line)</label>
          <textarea
            name="bulletPoints"
            value={form.bulletPoints}
            onChange={handleChange}
            placeholder="Highlight 1&#10;Highlight 2&#10;Highlight 3"
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 font-medium rounded-r-md">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-5 py-2 rounded-md text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className={`px-5 py-2 rounded-md text-sm font-medium text-white transition-all cursor-pointer flex items-center gap-2 ${
              isValid && !saving
                ? "bg-gradient-to-r from-secondary-600 via-primary-500 to-secondary-600 hover:brightness-110"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
