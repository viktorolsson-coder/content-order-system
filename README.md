# Content Order System

Internal tool for an agency to order content and track monthly deliverables per client.
Submitting the order form creates a task in an Asana project ("Content Team") with an
auto-set deadline (3 days for static ads, 5 days for everything else). A dashboard shows
how many creatives each client has received in a given month, with manual adjustments.

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS
- Prisma + SQLite (no external DB needed to get started)
- Asana REST API (`POST /tasks`)

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# edit .env and fill in:
#   ASANA_ACCESS_TOKEN      - Personal Access Token (https://app.asana.com/0/my-apps)
#   ASANA_PROJECT_GID       - gid of the "Content Team" Asana project
#   ASANA_WORKSPACE_GID     - optional, only needed for multi-workspace tokens

# 3. Create the database and seed some example clients
npx prisma db push
npm run db:seed   # optional

# 4. Start the dev server
npm run dev
# open http://localhost:3000
```

## How to find the Asana project gid

Open the project in Asana. The URL looks like:

```
https://app.asana.com/0/1201234567890123/list
```

The number after `/0/` is the `ASANA_PROJECT_GID`.

## Pages

- `/order` — order form. Fields: client, type (ugc / staticAds / existing / production /
  animation / other), month, brief link, optional content link, description, number of
  creatives. Task name is auto-built as `clientName - type - month`. On submit the task is
  created in the configured Asana project, the deadline is set to 5 days from today
  (3 days for static ads), and the order is persisted locally.
- `/deliverables` — per-client count for the selected month: ordered creatives (from
  orders placed that month) plus any manual adjustments, compared against the client's
  monthly target. Click "Adjust" to add / remove adjustments inline.
- `/clients` — manage the client list and each client's monthly target.

## Data model

- `Client`: name (unique), monthlyTarget
- `Order`: client, taskName, type, briefLink, contentLink?, generalDescription,
  numberOfCreatives, deadline, asanaTaskGid, asanaTaskUrl, createdAt
- `ManualAdjustment`: client, month (YYYY-MM), delta (signed integer), note?

## Deploying

The app is a standard Next.js app. If you deploy to a serverless platform, swap SQLite
for Postgres (Supabase, Neon, RDS, etc.) by updating `prisma/schema.prisma` and
`DATABASE_URL`. For a single always-on VPS, SQLite is fine.
