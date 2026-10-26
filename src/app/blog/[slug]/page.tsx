import { notFound } from "next/navigation";
import { getBlogBySlug, getAllBlogSlugs, getAllBlogs, getComments } from "@/lib/blogs";
import BlogDetail from "@/components/blog/BlogDetail";
import type { Metadata } from "next";
import PageMotion from "@/components/UI/PageMotion";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return getAllBlogSlugs();
}

export const revalidate = 0;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return {
      title: "Blog",
    };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: [
      post.title,
      "Combine Foundation Blog",
      "NGO in Pakistan",
      "Nonprofit Organization Pakistan",
      "Community Welfare Pakistan",
    ],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      images: [
        {
          url: post.heroImage1 || post.cardImage || "",
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.heroImage1 || post.cardImage || ""],
    },
  };
}

export default async function BlogPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return notFound();
  }

  const [blogs, storedComments] = await Promise.all([
    getAllBlogs(),
    getComments(post.id),
  ]);

  const legacyComments = [...post.commentList]
    .reverse()
    .filter((comment) => comment?.id && comment?.text);

  const comments = [...storedComments, ...legacyComments];

  return <PageMotion><BlogDetail post={post} blogs={blogs} initialComments={comments} /></PageMotion>;
}
