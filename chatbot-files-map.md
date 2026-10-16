# Chatbot Files Map (Combine Foundation Chatbot)

This document maps only files related to the chatbot, their purpose, and relationships.

## Files

### 1. API Route
- **`src/app/api/chat/route.ts`**
  - **Purpose**: Next.js App Router API endpoint handling POST requests to `/api/chat`.
  - **Key logic**: Fast-path for trivial intents (greetings, thanks, contact, mission) via `matchTrivialIntent`/`buildTrivialReply`, returns UIMessage stream without LLM call. Falls back to `createChatResponse` with last 8 messages, `SYSTEM_PROMPT`, and `chatbotTools`. Route is capped at `maxDuration = 30` seconds.
  - **Dependencies**: `@/lib/ai/provider`, `@/lib/ai/system-prompt`, `@/lib/ai/tools`, `@/lib/ai/router`, `ai`.

### 2. UI Component
- **`src/components/chatbot/ChatbotWidget.tsx`**
  - **Purpose**: Client-side floating chatbot widget mounted globally.
  - **Key logic**: Uses `@ai-sdk/react` `useChat` with `DefaultChatTransport({ api: '/api/chat' })`. Manages open/close state, input, auto-scroll, shows loading/placeholder states based on `status` and tool usage. Renders assistant text via `renderAssistantText`, which strips stray asterisks and turns consecutive `- ` lines into a real `<ul>` bullet list (for courses/events/projects/careers). A stream error from the API (e.g. an unrecoverable rate limit) surfaces through `useChat`'s `error` and renders as a generic "Couldn't get a response" message.
  - **Dependencies**: `@ai-sdk/react`, `ai`, `lucide-react`, React hooks.
  - **Mount point**: Global - included in root layout.

### 3. Root Layout
- **`src/app/layout.tsx`**
  - **Purpose**: App root layout that globally mounts the chatbot widget.
  - **Key logic**: Imports and renders `<ChatbotWidget />` alongside analytics (`SpeedInsights`, `Analytics`, `GoogleAnalytics`).
  - **Dependencies**: `@/components/chatbot/ChatbotWidget`.

### 4. AI Core - Provider
- **`src/lib/ai/provider.ts`**
  - **Purpose**: Handles multi-provider LLM streaming with failover.
  - **Key logic**: Tries providers in priority order. Peeks the stream's first chunks to catch early errors (bad key, 429/quota) before committing; retries once on transient (non-rate-limit) errors, otherwise fails over to the next provider. Once real output starts (`text-delta` / `tool-*` / `finish`) it commits and streams the rest with no further failover. Caps agentic steps via `MAX_STEPS=4`. Converts UI messages to model messages. Throws if every provider fails.
  - **Providers**: `@ai-sdk/google` (`gemini-2.5-flash`, env `GOOGLE_GENERATIVE_AI_API_KEY`) and `@ai-sdk/groq` (`openai/gpt-oss-20b`, env `GROQ_API_KEY`). A provider is only included when its key env var is set. Both providers receive the full tool set.
  - **Failover window**: Errors are only recovered while peeking — before the first real output chunk. A rate limit/quota error that arrives *mid-generation* (after output has started) is surfaced to the client as a stream error; there is no mid-stream failover, so the partial reply stands and the client shows the generic error.
  - **Dependencies**: `@ai-sdk/google`, `@ai-sdk/groq`, `ai`.

### 5. AI Core - System Prompt
- **`src/lib/ai/system-prompt.ts`**
  - **Purpose**: Defines assistant identity, guardrails, tool usage rules, and baked company knowledge.
  - **Key logic**: Imports `company-knowledge.json`, serializes full organization profile into `COMPANY_PROFILE` (baked into prompt, zero tool calls for profile). Enforces strict boundaries (Combine Foundation only). Mandates tool-use discipline: list tools for enumerations, details tools only for a named item. Forbids asterisks everywhere, with one exception allowing `- ` bullet lines solely for enumerated tool results.
  - **Dependencies**: `@/data/company-knowledge.json`.

### 6. AI Core - Tools
- **`src/lib/ai/tools.ts`**
  - **Purpose**: Exposes Firestore-backed tools for the model when needed. Each domain has a light **list** tool (name plus one short attribute) and a heavier **details** tool (single item), keeping tool output — which is re-sent every agentic step — small.
  - **Tools**:
    - `listCourses(category?)` - lists `courses` (all statuses except `cancelled`); returns `{ count, statusCounts: { ongoing, launch, completed }, courses: [{ title, status }] }` sorted ongoing-first; optional category match.
    - `getCourseDetails(course)` - full details for one course matched by exact/partial title (status, category, duration, mode, instructor, enrollmentLink, description); `{ found: false }` when no match.
    - `listEvents()` - lists future `events` (undated/invalid dates kept); returns `{ count, events: [{ title, date }] }` with human-readable dates via `formatEventDate`.
    - `getEventDetails(event)` - full details for one event matched by title (date, location, registrationLink, summary).
    - `listProjects(keyword?)` - lists `projects`; returns `{ count, projects: [{ title, goal }] }` with a truncated one-line goal; optional keyword search across title/summary/goal.
    - `getProjectDetails(project)` - full details for one project (location, goal, summary, keyStats).
    - `listCareers(type?)` - lists active `jobs` (only `active == true`) sorted newest-first; returns `{ count, typeCounts: { fullTime, partTime, internship, volunteer }, careers: [{ title, department, location, type }] }`; optional employment-type match.
    - `getCareerDetails(role)` - full details for one active job matched by title (department, location, type, description as plain text via `jobDescriptionText`, requirements, applyLink, applyEmail).
  - **Key logic**: Shared `cache` with 30s TTL per loader (`loadAllCourses`/`loadAllEvents`/`loadAllProjects`/`loadAllJobs`) so list + details reuse one Firestore read. `bestMatch` does exact → startsWith → includes title matching. `formatEventDate` renders ISO/TBA dates for chat; `truncate` keeps goal/description text short. Jobs loader sorts in memory (no `orderBy`, which would drop docs missing `createdAt`). Normalizes fields (maps `name/title`, truncates summaries, shapes stats).
  - **Dependencies**: `ai`, `zod`, `firebase/firestore/lite`, `@/lib/firebase`, `@/lib/job-description`.
  - **Firestore collections**: `courses`, `events`, `projects`, `jobs`.

### 7. AI Core - Router (Trivial Intent)
- **`src/lib/ai/router.ts`**
  - **Purpose**: Fast-path detection and canned replies for trivial queries.
  - **Key logic**: Normalizes text (lowercase, strip punctuation, collapse spaces). Regexes detect `greeting`, `thanks`, `mission`, `contact`. Avoids fast-path if query contains detailed terms (course/event/project/program/job/career/vacanc/intern etc.). `buildTrivialReply` uses `getCompanyInfo()` for mission/contact (with fallback strings).
  - **Dependencies**: `./company-info`.

### 8. AI Core - Company Info
- **`src/lib/ai/company-info.ts`**
  - **Purpose**: Thin wrapper over bundled company knowledge JSON.
  - **Key logic**: Exports `CompanyInfo` type and `getCompanyInfo()` returning bundled JSON (async for API compatibility).
  - **Dependencies**: `@/data/company-knowledge.json`.

### 9. Data
- **`src/data/company-knowledge.json`**
  - **Purpose**: Static canonical knowledge about Combine Foundation (org details, contact, leadership, programs, focus areas, get involved, etc.).
  - **Usage**: Consumed by `system-prompt.ts` (baked into prompt) and `company-info.ts`/`router.ts` (canned replies).

## Relationships Summary
- **Widget** → **API route** (`/api/chat`) via `useChat` transport.
- **Route** → **Router** (fast-path) OR **Provider** (LLM path). If LLM path: passes **System Prompt**, **Tools**, messages to **Provider**.
- **Provider** streams responses back as UIMessage stream to **Route**, returned to **Widget**.
- **System Prompt** + **Router** both consume **Company Info/JSON** (static knowledge).
- **Tools** read from **Firestore** (`courses`, `events`, `projects`, `jobs`) via `@/lib/firebase`.
- **Layout** mounts **Widget** globally.

## Notes (from analysis)
Token economy: list tools return a name plus one short attribute and details tools fetch a single item, so tool payloads (re-sent each agentic step) stay small. `getEventDetails` searches the full cached event set, so it can resolve past events too. `listCareers` only surfaces `active` jobs. UI: chatbot panel background is hardcoded white in dark mode.

Rate limits: because failover only happens during the peek window, an API limit hit *before* any output is handled transparently (next provider/key), but a limit hit *mid-response* is not — the user sees a partial reply plus the generic error. Adding more provider entries (extra Gemini keys via `createGoogleGenerativeAI({ apiKey })` instances, or other providers) widens the pre-output failover pool; it does not fix the mid-stream case. Rotating multiple free-tier keys is also subject to Google's terms, and the route is capped at `maxDuration = 30`s.
