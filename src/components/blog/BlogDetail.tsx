"use client";

import type { BlogPost, CommentData } from "@/lib/blogs";
import { updateBlogLikes } from "@/lib/blogs";
import AuthorCard from "@/components/blog/AuthorCard";
import YouMightAlsoLike from "@/components/blog/YouMightAlsoLike";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Comments from "./Comments";

const WhatsAppIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

const FacebookIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>
);

const LinkedInIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const LIKE_EVENT = "cf-blog-like-change";

function subscribeToLikeChanges(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(LIKE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LIKE_EVENT, callback);
  };
}

function getLikeStorageKey(postId: string) {
  return `cf-blog-liked:${postId}`;
}

interface BlogDetailProps {
  post: BlogPost;
  blogs: BlogPost[];
  initialComments: CommentData[];
}

export default function BlogDetail({ post, blogs, initialComments }: BlogDetailProps) {
  const likeStorageKey = getLikeStorageKey(post.id);
  const liked = useSyncExternalStore(
    subscribeToLikeChanges,
    () => window.localStorage.getItem(likeStorageKey) === "true",
    () => false
  );
  const [likeCount, setLikeCount] = useState(post.likes ?? 0);
  const [commentCount, setCommentCount] = useState(initialComments.length);
  const [isLiking, setIsLiking] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  // Lock body scroll + close on Escape while the share modal is open
  useEffect(() => {
    if (!isShareModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsShareModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isShareModalOpen]);

  const getFullShareUrl = () => {
    if (typeof window !== "undefined") {
      return shareUrl || window.location.href;
    }
    return "";
  };

  const shareWhatsApp = () => {
    const url = getFullShareUrl();
    const text = encodeURIComponent(`${post.title}\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const shareFacebook = () => {
    const url = getFullShareUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
  };

  const shareLinkedIn = () => {
    const url = getFullShareUrl();
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    const url = getFullShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: getFullShareUrl(),
        });
      } catch {
        // cancelled
      }
    }
  };

  const persistLiked = (value: boolean) => {
    window.localStorage.setItem(likeStorageKey, String(value));
    window.dispatchEvent(new Event(LIKE_EVENT));
  };

  const handleLike = async () => {
    if (isLiking) return;

    const previousLiked = liked;
    const newLiked = !liked;
    const delta = newLiked ? 1 : -1;

    setIsLiking(true);
    setLikeCount((prev) => Math.max(0, prev + delta));
    persistLiked(newLiked);

    try {
      const saved = await updateBlogLikes(post.id, delta);

      if (!saved) {
        setLikeCount((prev) => Math.max(0, prev - delta));
        persistLiked(previousLiked);
      }
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentAdded = () => {
    setCommentCount((prev) => prev + 1);
  };

  return (
    <article className="max-w-[1500px] w-full mx-auto px-9 py-8 max-sm:px-6">

      <nav className="flex items-center text-xs mb-5 flex-wrap justify-center">
        <Link
          href="/#blogs"
          className="text-gray-900 font-semibold text-xs md:text-sm lg:text-base hover:text-secondary-600 transition-colors"
        >
          Blogs
        </Link>
        <span className="text-gray-400 mx-1">/</span>
        <span className="text-gray-600 text-xs md:text-sm lg:text-base">{post.title}</span>
      </nav>

      {/* Title — center aligned */}
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-5 leading-tight text-center">
        {post.title}
      </h1>

      {/* Hero Image */}
      <div className="rounded-2xl overflow-hidden mb-4 bg-gray-100">
        <Image
          src={post.heroImage1}
          alt={post.title}
          width={900}
          height={500}
          className="w-full h-64 md:h-96 object-cover object-top"
        />
      </div>

      {/* Like / Comment / Share row */}
      <div className="flex items-center gap-4 text-sm text-gray-700 mb-5 flex-wrap">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className="flex items-center gap-1.5 group transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Like"
          aria-pressed={liked}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`w-4 h-4 transition-colors ${
              liked
                ? "fill-red-500 stroke-red-500"
                : "fill-none stroke-gray-700 group-hover:stroke-red-400"
            }`}
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <span>{likeCount}</span>
        </button>

        <button
          onClick={() => {
            document.getElementById("comments-section")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="flex items-center gap-1.5 group transition-colors"
          aria-label="Comment"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={2}
            className="w-4 h-4 stroke-gray-700 group-hover:stroke-blue-400 transition-colors"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
          <span>{commentCount}</span>
        </button>

        <button
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center gap-1.5 group transition-colors text-gray-700 hover:text-secondary-600 cursor-pointer"
          aria-label="Share this blog"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-4 h-4 stroke-gray-700 group-hover:stroke-secondary-600 transition-colors"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span className="group-hover:text-secondary-600 transition-colors">Share</span>
        </button>
      </div>

      <div className="space-y-4 text-sm md:text-base lg:text-xl text-gray-800 leading-relaxed">
        {post.content.map((para, i) => (
          <div key={i}>
            {i === post.content.length - 1 && post.heroImage2 && (
              <div className="rounded-2xl overflow-hidden mb-4 bg-gray-100">
                <Image
                  src={post.heroImage2}
                  alt="Blog content"
                  width={900}
                  height={500}
                  className="w-full h-64 md:h-96 object-cover object-top"
                />
              </div>
            )}
            <p>{para}</p>
          </div>
        ))}
      </div>

      {post.conclusion && (
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Conclusion</h2>
          <p className="text-sm md:text-base lg:text-xl text-gray-800 leading-relaxed">{post.conclusion}</p>
        </div>
      )}

      {/* Share Section with thumbnail and direct links */}
      <div className="my-8 p-5 bg-gradient-to-r from-gray-50 to-blue-50/40 rounded-2xl border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-200 bg-gray-100">
              <Image
                src={post.cardImage || post.heroImage1}
                alt={post.title}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-gray-900">Share with friends & family</h3>
              <p className="text-xs text-gray-500 mt-0.5">Spread the word about this story</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* WhatsApp */}
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:brightness-95 transition-all shadow-sm active:scale-95"
              aria-label="Share on WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={shareLinkedIn}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0A66C2] text-white text-xs font-semibold hover:brightness-95 transition-all shadow-sm active:scale-95"
              aria-label="Share on LinkedIn"
            >
              <LinkedInIcon className="w-4 h-4" />
              <span>LinkedIn</span>
            </button>

            {/* Facebook */}
            <button
              onClick={shareFacebook}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#1877F2] text-white text-xs font-semibold hover:brightness-95 transition-all shadow-sm active:scale-95"
              aria-label="Share on Facebook"
            >
              <FacebookIcon className="w-4 h-4" />
              <span>Facebook</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-all shadow-sm active:scale-95"
              aria-label="Copy Link"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-green-600 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <AuthorCard name={post.authorName} bio={post.authorBio} image={post.authorImage} />
      <div id="comments-section">
        <Comments initialComments={initialComments} blogId={post.id} onCommentAdded={handleCommentAdded} />
      </div>
      <YouMightAlsoLike blogs={blogs} />

      {/* Share Modal Dialog */}
      {isShareModalOpen &&
        createPortal(
          <div
            className="cf-share-overlay fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsShareModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Share this blog"
          >
            <style>{`
              @keyframes cfFade { from { opacity: 0 } to { opacity: 1 } }
              @keyframes cfSheet { from { transform: translateY(100%) } to { transform: translateY(0) } }
              @keyframes cfPop { from { opacity: 0; transform: scale(.95) translateY(8px) } to { opacity: 1; transform: scale(1) translateY(0) } }
              .cf-share-overlay { animation: cfFade .18s ease-out }
              .cf-share-panel { animation: cfSheet .28s cubic-bezier(.32,.72,0,1) }
              @media (min-width: 640px) { .cf-share-panel { animation: cfPop .2s ease-out } }
            `}</style>

            <div
              className="cf-share-panel relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto px-5 pt-3 sm:pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile drag handle */}
              <div className="sm:hidden mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300" />

              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Share with friends & family</h3>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Preview card */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl flex items-center gap-3 border border-gray-200">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                  <Image
                    src={post.cardImage || post.heroImage1}
                    alt={post.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-secondary-600 uppercase tracking-wider mb-0.5">
                    Combine Foundation Blog
                  </p>
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-2">{post.title}</h4>
                </div>
              </div>

              {/* Social buttons */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: "WhatsApp", onClick: shareWhatsApp, bg: "bg-[#25D366]", Icon: WhatsAppIcon },
                  { label: "LinkedIn", onClick: shareLinkedIn, bg: "bg-[#0A66C2]", Icon: LinkedInIcon },
                  { label: "Facebook", onClick: shareFacebook, bg: "bg-[#1877F2]", Icon: FacebookIcon },
                ].map(({ label, onClick, bg, Icon }) => (
                  <button
                    key={label}
                    onClick={onClick}
                    className="group flex flex-col items-center justify-center gap-2 py-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all active:scale-95 cursor-pointer"
                  >
                    <span className={`w-11 h-11 rounded-full ${bg} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-semibold text-gray-700">{label}</span>
                  </button>
                ))}
              </div>

              {/* Copy link */}
              <div className="mt-5">
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Or copy link</label>
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-1.5 bg-gray-50 focus-within:border-secondary-500 focus-within:bg-white transition-colors">
                  <input
                    type="text"
                    readOnly
                    value={getFullShareUrl()}
                    onFocus={(e) => e.currentTarget.select()}
                    className="min-w-0 flex-1 text-xs text-gray-700 bg-transparent px-2 outline-none truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`shrink-0 min-w-[76px] px-4 py-2 rounded-lg text-white text-xs font-semibold transition-colors active:scale-95 cursor-pointer ${
                      copied ? "bg-green-600" : "bg-secondary-600 hover:bg-secondary-700"
                    }`}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                <button
                  onClick={handleNativeShare}
                  className="w-full mt-3 py-2.5 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  More share options...
                </button>
              )}
            </div>
          </div>,
          document.body
        )}
    </article>
  );
}