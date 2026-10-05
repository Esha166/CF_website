"use client";

import type { BlogPost } from "@/lib/blogs";
import { updateBlogLikes } from "@/lib/blogs";
import AuthorCard from "@/components/blog/AuthorCard";
import YouMightAlsoLike from "@/components/blog/YouMightAlsoLike";
import Image from "next/image";
import { useState } from "react";
import Comments from "./Comments";

interface BlogDetailProps {
  post: BlogPost;
  blogs: BlogPost[];
}

export default function BlogDetail({ post, blogs }: BlogDetailProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentCount, setCommentCount] = useState(post.comments);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    const increment = newLiked ? 1 : -1;
    setLikeCount((prev) => prev + increment);
    
    // Save to Firebase
    await updateBlogLikes(post.id, increment);
  };

  const handleCommentAdded = () => {
    setCommentCount((prev) => prev + 1);
  };

  return (
    <article className="max-w-[1500px] w-full mx-auto px-9 py-8 max-sm:px-6">

      <nav className="flex items-center text-xs mb-5 flex-wrap justify-center">
  <a
    href="/blogs"
    className="text-gray-900 font-semibold text-xs md:text-sm lg:text-base transition-colors"
  >
    Blogs
  </a>
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

      {/* Like / Comment row */}
      <div className="flex items-center gap-4 text-sm text-gray-700 mb-5">
        <button
          onClick={handleLike}
          className="flex items-center gap-1.5 group transition-colors"
          aria-label="Like"
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
      <AuthorCard name={post.authorName} bio={post.authorBio} image={post.authorImage} />
      <Comments initialComments={post.commentList} blogId={post.id} onCommentAdded={handleCommentAdded} />
      <YouMightAlsoLike blogs={blogs} />
    </article>
  );
}
