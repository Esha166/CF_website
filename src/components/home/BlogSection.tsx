"use client";

import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/UI/SectionHeader";


type BlogCardProps = {
  post: BlogPost;
};

function BlogCard({ post }: BlogCardProps) {
  return (
    <div className="flex flex-col font-sans w-full">
      <div
        className="relative w-full rounded-2xl overflow-hidden shrink-0"
        style={{ height: "320px" }}
      >
        <Image
          src={post.cardImage || post.heroImage1}
          alt={post.title}
          fill
          className="object-cover"
        />

        <div
          className="absolute bottom-0 left-0 right-0 px-5 py-5"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(4.7px)",
            WebkitBackdropFilter: "blur(4.7px)",
            borderTop: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          <p className="text-white text-lg font-semibold leading-snug drop-shadow-sm">
            {post.authorName}
          </p>
          <p className="text-white/80 text-sm mt-0.5 drop-shadow-sm">
            {post.date}
          </p>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 mt-3">
        <div className="flex-1">
          <h3 className="text-gray-900 font-bold text-xl mb-1.5">{post.title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
            {post.description}
          </p>
        </div>
        <Link
          href={`/blog/${post.slug}`}
          className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-opacity duration-200 mt-1 hover:opacity-90"
          style={{
            // background: "linear-gradient(180deg, #2e86d4 0%, #1057b0 50%, #0a3d8f 100%)",
            background: "linear-gradient(90deg, var(--secondary-600) 0%, var(--secondary-500) 50%, var(--secondary-500) 75%, var(--secondary-600) 100%)",
          }}
          aria-label={`Read ${post.title}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

import type { BlogPost } from "@/lib/blogs";

export default function BlogSection({ blogs }: { blogs: BlogPost[] }) {
  return (
    <section id="blogs" className="max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-14 font-sans scroll-mt-24">
      <div id="blog">
        <SectionHeader
          title="Blog"
          description="Stay updated with our latest news"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 justify-items-center">
          {blogs.slice(0, 3).map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
