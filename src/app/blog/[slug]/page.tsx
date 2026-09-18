import { notFound } from "next/navigation";
import { getBlogBySlug, getAllBlogSlugs, getAllBlogs } from "@/lib/blogs";
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

export const dynamic = "force-dynamic";

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
    },
  };
}

export default async function BlogPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);
  const blogs = await getAllBlogs();

  if (!post) {
    return notFound();
  }

  return <PageMotion><BlogDetail post={post} blogs={blogs} /></PageMotion>;
}
