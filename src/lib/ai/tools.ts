import { tool } from 'ai';
import { z } from 'zod';
import { collection, getDocs, query, orderBy } from 'firebase/firestore/lite';
import { getDb } from '@/lib/firebase';

// ─── getOngoingCourses ────────────────────────────────────────────────────────

export const chatbotTools = {
  getOngoingCourses: tool({
    description:
      'Fetch currently active and ongoing courses, bootcamps, and training programs at Combine Foundation.',
    inputSchema: z.object({
      category: z
        .string()
        .optional()
        .describe('Filter by category (e.g., "web", "ai", "data")'),
    }),
    execute: async ({ category }) => {
      try {
        const db = getDb();
        const snap = await getDocs(collection(db, 'courses'));

        const allCourses = snap.docs.map((doc) => {
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

        // Surface ongoing + upcoming; exclude completed
        const active = allCourses.filter(
          (c) => c.status === 'ongoing' || c.status === 'upcoming' || c.status === 'launch'
        );

        const filtered = category
          ? active.filter((c) => c.category.includes(category.toLowerCase()))
          : active;

        return { count: filtered.length, courses: filtered };
      } catch (error) {
        console.error('getOngoingCourses Firestore error:', error);
        return { count: 0, courses: [], error: 'Could not fetch courses at this time.' };
      }
    },
  }),

  // ─── getUpcomingEvents ──────────────────────────────────────────────────────

  getUpcomingEvents: tool({
    description:
      'Fetch upcoming events, seminars, webinars, and masterclasses hosted by Combine Foundation with concise summaries.',
    inputSchema: z.object({}),
    execute: async () => {
      try {
        const db = getDb();
        // Order by creation date desc (same as admin-actions.ts fetchEvents)
        const snap = await getDocs(
          query(collection(db, 'events'), orderBy('createdAt', 'desc'))
        );

        const now = new Date();

        const events = snap.docs
          .map((doc) => {
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
          })
          // Only return events that haven't happened yet
          .filter((e) => {
            if (!e.dateTime) return true; // no date set — include anyway
            return new Date(e.dateTime) >= now;
          });

        return { count: events.length, events };
      } catch (error) {
        console.error('getUpcomingEvents Firestore error:', error);
        return { count: 0, events: [], error: 'Could not fetch events at this time.' };
      }
    },
  }),

  // ─── getProjects ────────────────────────────────────────────────────────────

  getProjects: tool({
    description:
      'Fetch community projects, initiatives, goals, and key impact summaries undertaken by Combine Foundation.',
    inputSchema: z.object({
      keyword: z
        .string()
        .optional()
        .describe('Optional search keyword (e.g., "education", "health", "youth")'),
    }),
    execute: async ({ keyword }) => {
      try {
        const db = getDb();
        const snap = await getDocs(collection(db, 'projects'));

        const projects = snap.docs.map((doc) => {
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
              ? d.stats.slice(0, 3).map((s: { value?: string; label?: string }) => `${s.value || ''} ${s.label || ''}`.trim()).filter(Boolean)
              : [],
          };
        });

        const filtered = keyword
          ? projects.filter(
              (p) =>
                p.title.toLowerCase().includes(keyword.toLowerCase()) ||
                p.summary.toLowerCase().includes(keyword.toLowerCase()) ||
                p.goal.toLowerCase().includes(keyword.toLowerCase())
            )
          : projects;

        return { count: filtered.length, projects: filtered };
      } catch (error) {
        console.error('getProjects Firestore error:', error);
        return { count: 0, projects: [], error: 'Could not fetch projects at this time.' };
      }
    },
  }),
};
