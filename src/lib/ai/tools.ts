import { tool } from 'ai';
import { z } from 'zod';
import { collection, getDocs, query, orderBy } from 'firebase/firestore/lite';
import { getDb } from '@/lib/firebase';
import { jobDescriptionText } from '@/lib/job-description';

// Firestore collections change rarely but these tools can fire on several turns
// in a row, so each collection read is memoised for a short window to avoid
// paying the network round-trip (and read cost) again and again.
const CACHE_TTL_MS = 30 * 1000;

function cache<T>(ttlMs: number, load: () => Promise<T>) {
  let value: T | undefined;
  let expiresAt = 0;
  return async (): Promise<T> => {
    const now = Date.now();
    if (value !== undefined && expiresAt > now) return value;
    value = await load();
    expiresAt = now + ttlMs;
    return value;
  };
}

type Course = {
  id: string;
  title: string;
  category: string;
  status: string;
  duration: string;
  mode: string;
  instructor: string;
  enrollmentLink: string;
  description: string;
};

type Event = {
  id: string;
  title: string;
  summary: string;
  dateTime: string;
  location: string;
  registrationLink: string;
};

type Project = {
  id: string;
  title: string;
  summary: string;
  goal: string;
  location: string;
  keyStats: string[];
};

type Career = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  formLink: string;
  requirements: string[];
  active: boolean;
  createdAtSeconds: number;
};

// The list tools return only names, so the model always sees exact titles.
// Details lookups try an exact match first and fall back to a partial one.
const normalize = (text: string) => text.toLowerCase().trim();

function bestMatch<T extends { title: string }>(items: T[], query: string): T | null {
  const q = normalize(query);
  if (!q) return null;
  return (
    items.find((i) => normalize(i.title) === q) ||
    items.find((i) => normalize(i.title).startsWith(q)) ||
    items.find((i) => normalize(i.title).includes(q)) ||
    null
  );
}

// Event dates are stored either as "To be announced" or an ISO-ish string like
// "2026-01-15T18:00". Turn them into something a chat reply can read naturally.
function formatEventDate(raw: string): string {
  if (!raw) return '';
  if (/to be announced|tba/i.test(raw)) return 'To be announced';
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return raw;
  const hasTime = /t\d{2}:\d{2}/i.test(raw);
  return dt.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(hasTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
}

// Keep list payloads light — a single line is enough to describe an item.
const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max).trim()}...` : text;

// ─── Cached collection loaders ────────────────────────────────────────────────

const loadAllCourses = cache<Course[]>(CACHE_TTL_MS, async () => {
  const db = getDb();
  const snap = await getDocs(collection(db, 'courses'));

  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      title: d.name || d.title || '',
      category: (d.category || '').toLowerCase(),
      status: (d.status || '').toLowerCase(),
      duration: d.duration || '',
      mode: d.mode || '',
      instructor: d.instructor || '',
      enrollmentLink: d.enrollmentLink || '',
      description: d.description || '',
    };
  });
});

const loadAllEvents = cache<Event[]>(CACHE_TTL_MS, async () => {
  const db = getDb();
  // Order by creation date desc (same as admin-actions.ts fetchEvents)
  const snap = await getDocs(query(collection(db, 'events'), orderBy('createdAt', 'desc')));

  return snap.docs.map((doc) => {
    const d = doc.data();
    const rawDesc = d.description || d.summary || '';
    const summary = rawDesc.length > 180 ? `${rawDesc.slice(0, 180).trim()}...` : rawDesc;

    return {
      id: doc.id,
      title: d.name || d.title || '',
      summary,
      dateTime: d.dateTime || d.date || '',
      location: d.location || '',
      registrationLink: d.registrationLink || d.registerLink || '',
    };
  });
});

const loadAllProjects = cache<Project[]>(CACHE_TTL_MS, async () => {
  const db = getDb();
  const snap = await getDocs(collection(db, 'projects'));

  return snap.docs.map((doc) => {
    const d = doc.data();
    const rawDesc = d.description || '';
    const summary = rawDesc.length > 200 ? `${rawDesc.slice(0, 200).trim()}...` : rawDesc;

    return {
      id: doc.id,
      title: d.title || 'Combine Project',
      summary,
      goal: d.goal || '',
      location: d.location || '',
      keyStats: Array.isArray(d.stats)
        ? d.stats
            .slice(0, 3)
            .map((s: { value?: string; label?: string }) => `${s.value || ''} ${s.label || ''}`.trim())
            .filter(Boolean)
        : [],
    };
  });
});

const loadAllJobs = cache<Career[]>(CACHE_TTL_MS, async () => {
  const db = getDb();
  // No orderBy here: docs missing createdAt would be silently dropped, so sort
  // the open roles in memory instead (same approach as the public career page).
  const snap = await getDocs(collection(db, 'jobs'));

  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      title: d.title || '',
      department: d.department || '',
      location: d.location || '',
      type: d.type || '',
      description: d.description || '',
      formLink: d.formLink || '',
      requirements: Array.isArray(d.requirements) ? d.requirements.map(String) : [],
      active: d.active === true,
      createdAtSeconds: typeof d.createdAt?.seconds === 'number' ? d.createdAt.seconds : 0,
    };
  });
});

// ─── Tools ────────────────────────────────────────────────────────────────────
//
// Each domain exposes two tools: a light "list" tool that returns only names
// (and a status/date), and a heavier "details" tool for a single named item.
// This keeps tool output — which is re-sent on every agentic step — as small as
// possible while still letting the model answer follow-up detail questions.

export const chatbotTools = {
  // ─── Courses ────────────────────────────────────────────────────────────────

  listCourses: tool({
    description:
      'List Combine Foundation courses with only their name and status. Use this FIRST whenever the user asks what courses, batches, enrollments, or training offerings exist.',
    inputSchema: z.object({
      category: z
        .string()
        .optional()
        .describe('Filter by category (e.g., "web", "ai", "data")'),
    }),
    execute: async ({ category }) => {
      try {
        const all = await loadAllCourses();
        const visible = all.filter((c) => c.status !== 'cancelled');
        const filtered = category
          ? visible.filter((c) => c.category.includes(category.toLowerCase()))
          : visible;

        // Explicit counts so the model never has to tally statuses itself and
        // can clearly say when nothing is currently running.
        const statusCounts = {
          ongoing: filtered.filter((c) => c.status === 'ongoing').length,
          launch: filtered.filter((c) => c.status === 'launch').length,
          completed: filtered.filter((c) => c.status === 'completed').length,
        };

        // Ongoing/launch first so the most relevant items head the list.
        const order: Record<string, number> = { ongoing: 0, launch: 1, completed: 2 };
        const courses = [...filtered]
          .sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9))
          .map((c) => ({ title: c.title, status: c.status }));

        return { count: courses.length, statusCounts, courses };
      } catch (error) {
        console.error('listCourses Firestore error:', error);
        return { count: 0, courses: [], error: 'Could not fetch courses at this time.' };
      }
    },
  }),

  getCourseDetails: tool({
    description:
      'Get full details for ONE specific course. Only call this when the user asks about a particular course by name; pass the exact title returned by listCourses.',
    inputSchema: z.object({
      course: z.string().describe('Exact course title, as returned by listCourses'),
    }),
    execute: async ({ course }) => {
      try {
        const all = await loadAllCourses();
        const match = bestMatch(all.filter((c) => c.status !== 'cancelled'), course);
        if (!match) return { found: false };

        return {
          found: true,
          course: {
            title: match.title,
            status: match.status,
            category: match.category,
            duration: match.duration,
            mode: match.mode,
            instructor: match.instructor,
            enrollmentLink: match.enrollmentLink,
            description: match.description,
          },
        };
      } catch (error) {
        console.error('getCourseDetails Firestore error:', error);
        return { found: false, error: 'Could not fetch course details at this time.' };
      }
    },
  }),

  // ─── Events ─────────────────────────────────────────────────────────────────

  listEvents: tool({
    description:
      'List upcoming Combine Foundation events with only their name and date. Use this FIRST whenever the user asks about upcoming events, masterclasses, webinars, or schedules.',
    inputSchema: z.object({}),
    execute: async () => {
      try {
        const all = await loadAllEvents();
        const now = new Date();

        // Only surface events that haven't happened yet; keep undated/invalid ones.
        const events = all.filter((e) => {
          if (!e.dateTime) return true;
          const dt = new Date(e.dateTime);
          if (Number.isNaN(dt.getTime())) return true;
          return dt >= now;
        });

        return {
          count: events.length,
          events: events.map((e) => ({ title: e.title, date: formatEventDate(e.dateTime) })),
        };
      } catch (error) {
        console.error('listEvents Firestore error:', error);
        return { count: 0, events: [], error: 'Could not fetch events at this time.' };
      }
    },
  }),

  getEventDetails: tool({
    description:
      'Get full details for ONE specific event. Only call this when the user asks about a particular event by name; pass the exact title returned by listEvents.',
    inputSchema: z.object({
      event: z.string().describe('Exact event title, as returned by listEvents'),
    }),
    execute: async ({ event }) => {
      try {
        const all = await loadAllEvents();
        const match = bestMatch(all, event);
        if (!match) return { found: false };

        return {
          found: true,
          event: {
            title: match.title,
            date: formatEventDate(match.dateTime),
            location: match.location,
            registrationLink: match.registrationLink,
            summary: match.summary,
          },
        };
      } catch (error) {
        console.error('getEventDetails Firestore error:', error);
        return { found: false, error: 'Could not fetch event details at this time.' };
      }
    },
  }),

  // ─── Projects ───────────────────────────────────────────────────────────────

  listProjects: tool({
    description:
      'List Combine Foundation community projects with their name and a one-line goal. Use this FIRST whenever the user asks about community projects, welfare works, impact initiatives, or goals.',
    inputSchema: z.object({
      keyword: z
        .string()
        .optional()
        .describe('Optional search keyword (e.g., "education", "health", "youth")'),
    }),
    execute: async ({ keyword }) => {
      try {
        const all = await loadAllProjects();
        const filtered = keyword
          ? all.filter(
              (p) =>
                p.title.toLowerCase().includes(keyword.toLowerCase()) ||
                p.summary.toLowerCase().includes(keyword.toLowerCase()) ||
                p.goal.toLowerCase().includes(keyword.toLowerCase())
            )
          : all;

        return {
          count: filtered.length,
          projects: filtered.map((p) => ({ title: p.title, goal: truncate(p.goal, 140) })),
        };
      } catch (error) {
        console.error('listProjects Firestore error:', error);
        return { count: 0, projects: [], error: 'Could not fetch projects at this time.' };
      }
    },
  }),

  getProjectDetails: tool({
    description:
      'Get full details for ONE specific project. Only call this when the user asks about a particular project by name; pass the exact title returned by listProjects.',
    inputSchema: z.object({
      project: z.string().describe('Exact project title, as returned by listProjects'),
    }),
    execute: async ({ project }) => {
      try {
        const all = await loadAllProjects();
        const match = bestMatch(all, project);
        if (!match) return { found: false };

        return {
          found: true,
          project: {
            title: match.title,
            location: match.location,
            goal: match.goal,
            summary: match.summary,
            keyStats: match.keyStats,
          },
        };
      } catch (error) {
        console.error('getProjectDetails Firestore error:', error);
        return { found: false, error: 'Could not fetch project details at this time.' };
      }
    },
  }),

  // ─── Careers ────────────────────────────────────────────────────────────────

  listCareers: tool({
    description:
      'List Combine Foundation career openings that are currently active, with name, department, location and employment type. Use this FIRST whenever the user asks about jobs, careers, vacancies, internships, or open positions.',
    inputSchema: z.object({
      type: z
        .string()
        .optional()
        .describe('Filter by employment type (e.g., "Full-time", "Part-time", "Internship", "Volunteer")'),
    }),
    execute: async ({ type }) => {
      try {
        const all = await loadAllJobs();
        const open = all
          .filter((j) => j.active)
          .sort((a, b) => b.createdAtSeconds - a.createdAtSeconds);
        const filtered = type
          ? open.filter((j) => j.type.toLowerCase().includes(type.toLowerCase()))
          : open;

        // Explicit counts so the model can answer type-specific questions and
        // clearly say when there are no open roles.
        const typeCounts = {
          fullTime: open.filter((j) => /full.?time/i.test(j.type)).length,
          partTime: open.filter((j) => /part.?time/i.test(j.type)).length,
          internship: open.filter((j) => /intern/i.test(j.type)).length,
          volunteer: open.filter((j) => /volunt/i.test(j.type)).length,
        };

        return {
          count: filtered.length,
          typeCounts,
          careers: filtered.map((j) => ({
            title: j.title,
            department: j.department,
            location: j.location,
            type: j.type,
          })),
        };
      } catch (error) {
        console.error('listCareers Firestore error:', error);
        return { count: 0, careers: [], error: 'Could not fetch career openings at this time.' };
      }
    },
  }),

  getCareerDetails: tool({
    description:
      'Get full details for ONE specific job opening. Only call this when the user asks about a particular role by name; pass the exact title returned by listCareers.',
    inputSchema: z.object({
      role: z.string().describe('Exact job title, as returned by listCareers'),
    }),
    execute: async ({ role }) => {
      try {
        const all = await loadAllJobs();
        const match = bestMatch(all.filter((j) => j.active), role);
        if (!match) return { found: false };

        return {
          found: true,
          career: {
            title: match.title,
            department: match.department,
            location: match.location,
            type: match.type,
            description: truncate(jobDescriptionText(match.description), 800),
            requirements: match.requirements,
            applyLink: match.formLink,
            applyEmail: 'info@combinefoundation.org',
          },
        };
      } catch (error) {
        console.error('getCareerDetails Firestore error:', error);
        return { found: false, error: 'Could not fetch job details at this time.' };
      }
    },
  }),
};
