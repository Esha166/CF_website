import { collection, getDocs, query, where, limit, updateDoc, doc, increment, orderBy } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";

export interface CommentData {
  id: string;
  name: string;
  date: string;
  text: string;
  avatar: string;
}

type CommentTimestamp = Date | { toDate?: () => Date } | string | null | undefined;

function formatCommentDate(value: CommentTimestamp): string {
  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else if (value && typeof value === "object" && typeof value.toDate === "function") {
    date = value.toDate();
  } else if (typeof value === "string") {
    date = new Date(value);
  } else {
    date = new Date();
  }

  if (Number.isNaN(date.getTime())) date = new Date();

  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export interface BlogPost {
  id: string;
  heroImage1: string;
  heroImage2: string;
  cardImage?: string;
  authorName: string;
  authorBio?: string;
  authorImage?: string;
  date: string;
  title: string;
  description: string;
  slug: string;
  status: "Published" | "Draft" | "Under Review";
  content: string[];
  conclusion: string;
  likes: number;
  comments: number;
  commentList: CommentData[];
}

let cachedBlogs: BlogPost[] | null = null;
let blogsCacheTimestamp = 0;
const BLOGS_CACHE_TTL = 30000; // 30 seconds

export async function getAllBlogs(): Promise<BlogPost[]> {
    const now = Date.now();
    if (cachedBlogs && (now - blogsCacheTimestamp < BLOGS_CACHE_TTL)) {
        return cachedBlogs;
    }
    const fetchAndCache = async (): Promise<BlogPost[]> => {
        if (!db) return [];
        try {
            const snap = await getDocs(collection(db, "blogs"));
            return snap.docs.map(doc => {
                const data = doc.data();
                const rest = { ...data };
                delete rest.createdAt;
                return {
                    id: doc.id,
                    ...rest,
                    comments: typeof data.comments === "number" ? data.comments : 0,
                    likes: typeof data.likes === "number" ? data.likes : 0,
                    commentList: Array.isArray(data.commentList) ? data.commentList : [],
                } as BlogPost;
            });
        } catch (error) {
            console.error("Error fetching blogs:", error);
            return [];
        }
    };
    const data = await fetchAndCache();
    cachedBlogs = data;
    blogsCacheTimestamp = Date.now();
    return data;
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | undefined> {
    if (!db) return undefined;
    try {
        const q = query(collection(db, "blogs"), where("slug", "==", slug), limit(1));
        const snap = await getDocs(q);
        if (snap.empty) return undefined;
        const doc = snap.docs[0];
        const data = doc.data();
        const rest = { ...data };
        delete rest.createdAt;
        return {
            id: doc.id,
            ...rest,
            comments: typeof data.comments === "number" ? data.comments : 0,
            likes: typeof data.likes === "number" ? data.likes : 0,
            commentList: Array.isArray(data.commentList) ? data.commentList : [],
        } as BlogPost;
    } catch (error) {
        console.error("Error fetching blog by slug:", error);
        return undefined;
    }
}

export async function getAllBlogSlugs() {
    const blogs = await getAllBlogs();
    return blogs.map((post) => ({ slug: post.slug }));
}

// ─── Comments Functions ──────────────────────────────────────────

export async function getComments(blogId: string): Promise<CommentData[]> {
    if (!db) return [];
    try {
        const snap = await getDocs(
            query(collection(db, "blogs", blogId, "comments"), orderBy("createdAt", "desc"))
        );

        return snap.docs.map((commentDoc) => {
            const data = commentDoc.data();
            return {
                id: commentDoc.id,
                name: typeof data.name === "string" ? data.name : "",
                date: formatCommentDate(data.createdAt),
                text: typeof data.text === "string" ? data.text : "",
                avatar: typeof data.avatar === "string" ? data.avatar : "",
            };
        });
    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
}

export async function saveComment(
    blogId: string,
    name: string,
    text: string,
    turnstileToken = "",
    website = ""
): Promise<CommentData> {
    const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId, name, text, turnstileToken, website }),
    });
    const data = (await res.json().catch(() => ({}))) as {
        comment?: CommentData;
        error?: string;
    };

    if (!res.ok || !data.comment) {
        throw new Error(data.error ?? "Failed to post comment. Please try again.");
    }

    return data.comment;
}

// ─── Likes Functions ─────────────────────────────────────────────

export async function updateBlogLikes(blogId: string, increment_value: number): Promise<boolean> {
    if (!db) return false;
    try {
        await updateDoc(doc(db, "blogs", blogId), {
            likes: increment(increment_value),
        });
        return true;
    } catch (error) {
        console.error("Error updating likes:", error);
        return false;
    }
}
