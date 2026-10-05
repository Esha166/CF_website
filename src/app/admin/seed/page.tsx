"use client";

import { useState, useEffect } from "react";
import {
  fetchCourses,
  updateCourse,
  type FirestoreCourse,
} from "@/lib/admin-actions";

interface CourseForm {
  studentName: string;
  testimonial: string;
  reelUrl: string;
}

export default function SeedPage() {
  const [courses, setCourses] = useState<FirestoreCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [forms, setForms] = useState<Record<string, CourseForm>>({});

  const loadCourses = async () => {
    setLoading(true);
    try {
      const all = await fetchCourses();
      setCourses(all);

      const initialForms: Record<string, CourseForm> = {};
      for (const c of all) {
        initialForms[c.id!] = {
          studentName: "",
          testimonial: "",
          reelUrl: "",
        };
      }
      setForms(initialForms);
    } catch {
      setResult({ type: "error", message: "Failed to load courses" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const updateForm = (id: string, field: keyof CourseForm, value: string) => {
    setForms((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const matched = courses.filter((c) => {
    const name = c.name?.toLowerCase() || "";
    return (
      name.includes("web development") &&
      (name.includes("batch 01") || name.includes("batch 02") || name.includes("batch 1") || name.includes("batch 2")) &&
      c.status === "Completed"
    );
  });

  const handleSeed = async (course: FirestoreCourse) => {
    const form = forms[course.id!];
    if (!form || !form.reelUrl.trim() || !form.studentName.trim()) return;

    setSeeding((prev) => ({ ...prev, [course.id!]: true }));
    setResult(null);

    try {
      const existing = course.successStories || [];
      existing.push({
        studentName: form.studentName.trim(),
        testimonial: form.testimonial.trim() || `Completed the ${course.name} successfully!`,
        videoUrl: form.reelUrl.trim(),
      });
      await updateCourse(course.id!, { successStories: existing });
      setResult({
        type: "success",
        message: `Added reel for "${form.studentName}" to "${course.name}".`,
      });
      updateForm(course.id!, "studentName", "");
      updateForm(course.id!, "testimonial", "");
      updateForm(course.id!, "reelUrl", "");
      await loadCourses();
    } catch {
      setResult({
        type: "error",
        message: `Failed to seed "${course.name}".`,
      });
    } finally {
      setSeeding((prev) => ({ ...prev, [course.id!]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Seed: Course Success Stories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add Instagram reel URLs per student per course.
          </p>
        </div>

        {result && (
          <div
            className={`px-4 py-3 rounded-lg text-sm font-medium mb-6 ${
              result.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {result.message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Completed Web Development Courses
            </h2>
            <button
              onClick={loadCourses}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 cursor-pointer bg-transparent border-none"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading courses...</div>
          ) : matched.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm mb-2">
                No completed Web Development (Batch 01 / 02) courses found.
              </p>
              <p className="text-gray-400 text-xs">
                Make sure courses exist in Firestore with names containing &quot;Web Development&quot; and
                &quot;Batch 01&quot; or &quot;Batch 02&quot;, and status set to &quot;Completed&quot;.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {matched.map((course) => {
                const form = forms[course.id!];
                const isSeeding = seeding[course.id!];
                const canSeed = form?.reelUrl.trim() && form?.studentName.trim();

                return (
                  <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{course.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">ID: {course.id?.slice(0, 12)}...</p>
                        </div>
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white bg-blue-500">
                          {course.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Student Name</label>
                        <input
                          type="text"
                          value={form?.studentName || ""}
                          onChange={(e) => updateForm(course.id!, "studentName", e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. eshal subhan"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Instagram Reel URL
                        </label>
                        <input
                          type="text"
                          value={form?.reelUrl || ""}
                          onChange={(e) => updateForm(course.id!, "reelUrl", e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://www.instagram.com/reel/..."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Testimonial <span className="text-gray-300 font-normal">(optional)</span>
                        </label>
                        <textarea
                          value={form?.testimonial || ""}
                          onChange={(e) => updateForm(course.id!, "testimonial", e.target.value)}
                          rows={2}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder={`Completed the ${course.name} successfully!`}
                        />
                      </div>

                      {course.successStories && course.successStories.length > 0 && (
                        <div className="pt-2">
                          <p className="text-xs font-medium text-gray-400 mb-1">
                            Existing stories ({course.successStories.length}):
                          </p>
                          <ul className="space-y-0.5">
                            {course.successStories.map((s, i) => (
                              <li key={i} className="text-xs text-gray-500">
                                • <span className="font-medium text-gray-600">{s.studentName}</span>
                                {s.videoUrl && <span className="text-blue-400 ml-1">(has reel)</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button
                        onClick={() => handleSeed(course)}
                        disabled={isSeeding || !canSeed}
                        className="w-full py-2 px-4 rounded-lg text-white font-medium text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: "#FF6900" }}
                        onMouseOver={(e) => {
                          if (!isSeeding && canSeed) e.currentTarget.style.filter = "brightness(1.1)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.filter = "none";
                        }}
                      >
                        {isSeeding ? "Seeding..." : "Seed to this course"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
