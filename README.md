# FinAgent AI

FinAgent AI is a financial operations workspace starting with accounts receivable. It helps businesses organize invoices, prioritize follow-ups, and prepare collection reminders for human approval.

## Current implementation

- Public marketing landing page and account screens.
- Supabase email/password authentication using cookie-based SSR sessions.
- Company onboarding after signup.
- Company and invoice schema with Row Level Security (RLS).
- Empty company dashboard: no seeded or demo financial records.

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Supabase Auth + Postgres
- `@supabase/ssr` for cookie-based sessions

## Required setup

This repository does not create or configure a Supabase project automatically.

1. Create a dedicated Supabase project for FinAgent AI.
2. In the Supabase SQL Editor, run `supabase/migrations/202611260001_initial_company_workspace.sql`.
3. In Supabase Project Settings / Connect, copy the Project URL and publishable key.
4. Add these environment variables to your local environment and Vercel project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
NEXT_PUBLIC_SITE_URL=https://YOUR-DEPLOYED-DOMAIN
```

5. In Supabase Authentication URL Configuration, set the Site URL to your deployed domain and add this Redirect URL:
   `https://YOUR-DEPLOYED-DOMAIN/auth/callback`
6. Enable email/password sign-in. For production email delivery, configure a trusted SMTP provider.
7. Redeploy after adding environment variables.

## Database security

- RLS is enabled on both `companies` and `invoices`.
- A signed-in user can access only companies they own.
- Invoice access is restricted through the owning company.
- No service-role or secret key is used in the browser.
- Tables are explicitly granted to the authenticated role because new Supabase projects may not expose public tables to the Data API by default.

The initial schema supports one owner per company. Team memberships and roles are a later milestone; do not treat this initial owner-only model as multi-user collaboration.

## Current limitations

- CSV import and invoice entry are not connected yet.
- Email reminders are not sent.
- AI recommendations are not connected to a model.
- Billing, subscriptions, audit logs and team invitations are not implemented.
- A dependency lockfile/build verification has not yet been produced from this repository.

## Local development

```bash
npm install
npm run dev
```
