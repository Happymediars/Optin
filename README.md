# Optin MVP SaaS (Next.js + Supabase)

A clean MVP inspired by OptinMonster.

## Stack
- Next.js (App Router)
- Supabase (Auth + Postgres)
- Tailwind CSS
- shadcn/ui-style component primitives
- Recharts analytics

## Core Features Implemented
1. User authentication (email/password)
2. Add websites/domains
3. Create opt-in campaigns
4. 5 campaign types: lightbox, floating bar, slide-in, fullscreen, inline
5. Simple campaign/form editor
6. Display rules: delay, scroll %, exit intent, URL targeting, device, frequency cap
7. Lead capture through widget
8. Campaign analytics (impressions, leads, conversion)
9. CSV export
10. JavaScript embed script at `/widget.js`

## Setup
```bash
npm install
cp .env.example .env.local
# fill env values
npm run dev
```

## Supabase
Run SQL in `database/schema.sql` in Supabase SQL editor.

## Embed
```html
<script src="https://your-app-domain.com/widget.js" data-site-id="SITE_ID"></script>
```
