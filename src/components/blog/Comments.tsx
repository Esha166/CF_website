"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { CommentData } from "@/lib/blogs";
import { saveComment } from "@/lib/blogs";
import { isWithinCooldown, markSubmitted } from "@/lib/anti-spam";
import Turnstile from "@/components/UI/Turnstile";

interface CommentsProps {
  initialComments: CommentData[];
  blogId: string;
  onCommentAdded?: (newComment: CommentData) => void;
}

export default function Comments({ initialComments, blogId, onCommentAdded }: CommentsProps) {
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [name, setName] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReset, setTurnstileReset] = useState(0);

  const wordCount = response.trim() ? response.trim().split(/\s+/).length : 0;

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    const trimmedResponse = response.trim();

    if (!trimmedName) {
      setError("Please enter your name");
      return;
    }
    if (trimmedName.length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }
    if (!trimmedResponse) return;
    if (wordCount < 5) {
      setError(`Minimum 5 words required (${wordCount}/5)`);
      return;
    }

    if (honeypot.trim()) {
      setError("Submission blocked.");
      return;
    }

    if (isWithinCooldown("comment", 60000)) {
      setError("Please wait a minute before posting another comment.");
      return;
    }

    setIsLoading(true);
    try {
      const newComment = await saveComment(
        blogId,
        trimmedName,
        trimmedResponse,
        turnstileToken,
        honeypot
      );
      markSubmitted("comment");
      setComments((prev) => [newComment, ...prev]);
      onCommentAdded?.(newComment);
      setName("");
      setResponse("");
      setError("");
      setHoneypot("");
      setTurnstileToken("");
      setTurnstileReset((value) => value + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
      console.error(err);
      setTurnstileToken("");
      setTurnstileReset((value) => value + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="w-full px-4 py-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Comments</h2>

      <div className="mb-4">
        <label className="sr-only" aria-hidden="true">
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError("");
          }}
          placeholder="Your name"
          maxLength={80}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-gray-300 transition-colors mb-3"
        />

        <textarea
          value={response}
          onChange={(e) => {
            setResponse(e.target.value);
            if (error) setError("");
          }}
          placeholder="Write a response (minimum 5 words)"
          rows={4}
          maxLength={2000}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none resize-none focus:border-gray-300 transition-colors"
        />
      </div>

      <Turnstile
        onVerify={setTurnstileToken}
        resetKey={turnstileReset}
        className="mb-3 min-h-[65px]"
      />

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      <p className="text-xs text-gray-500 mb-3">
        By submitting this form, you agree to our{" "}
        <Link href="/privacy" className="text-secondary-600 underline hover:text-secondary-700">
          Privacy Policy.
        </Link>
      </p>

      <div className="flex items-center gap-3 mb-6">
        {response.trim() && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2 rounded-full bg-accent-orange text-white text-xs font-semibold hover:brightness-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Posting..." : "Post Comment"}
          </button>
        )}
        {response.trim() && (
          <span className="text-xs text-gray-400">{wordCount}/5 words</span>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {comments.map((c) => (
          <div key={c.id} className="py-5 flex gap-3">
            <div
              className="relative shrink-0 rounded-full overflow-hidden bg-gray-200"
              style={{ width: 40, height: 40 }}
            >
              {c.avatar ? (
                <Image
                  src={c.avatar}
                  alt={c.name}
                  fill
                  sizes="40px"
                  className="object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-bold">
                  {c.name[0]}
                </div>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{c.name}</p>
              <p className="text-xs text-gray-400 mb-2">{c.date}</p>
              <p className="text-sm text-gray-700 leading-relaxed">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
