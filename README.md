# FinAgent AI

FinAgent AI is an accounts-receivable operations workspace for small businesses and bookkeeping teams.

## MVP scope
- Import invoice CSV files
- Classify paid, upcoming, overdue and disputed invoices
- Prioritize follow-up using transparent rules
- Draft payment reminders for human review
- Track approved follow-ups and review receivables metrics

## Run locally
```bash
npm install
npm run dev
```

## CSV format
Required columns: `customer`, `invoice`, `amount`, `dueDate`, `status`.
Optional columns: `email`, `notes`.

The initial version uses browser-local sample data and deterministic rules. It does not connect to a bank, send email, or modify accounting records. All reminder sending and accounting actions remain under human control.

## Status
Early MVP scaffold. Authentication, persistent multi-tenant storage, integrations, billing and production security are not yet implemented.
