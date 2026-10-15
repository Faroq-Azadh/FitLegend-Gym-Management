# فیتلجند — Gym OS Auth

Production-ready Next.js application for FitLegend Gym OS login and gym registration flows.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- React Hook Form + Zod
- Framer Motion
- Lucide React

## Requirements

- Node.js **18.18.0+** (or 20+)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login)

## Routes

| Route | Description |
|-------|-------------|
| `/login` | Password & OTP login |
| `/register-gym` | Gym registration request |

## Project Structure

```
app/(auth)/login/          — Login page
app/(auth)/register-gym/   — Gym registration page
components/auth/           — Login, OTP, social auth
components/register/       — Registration form & success
components/shared/         — Visual panel, stats, trust row
components/ui/             — Button, input, card, logo
lib/                       — Utils, hooks, validations
```

## Gym registration API

The registration form posts to `/api/v1/gyms/register/` with `credentials: "include"` and the
`X-CSRFToken` cookie.

| Variable | Purpose |
|----------|---------|
| `API_BASE_URL` | Proxies `/api/*` to a backend (e.g. `http://127.0.0.1:8000`), keeping cookies same-origin |
| `NEXT_PUBLIC_GYM_REGISTER_ENDPOINT` | Overrides the registration endpoint |
| `NEXT_PUBLIC_DASHBOARD_URL` | Redirect target after a successful registration (default `/admin`) |
| `MOCK_GYM_REGISTER=1` | Returns a fake success response so the flow can be tried without a backend |

Without `API_BASE_URL` or `MOCK_GYM_REGISTER`, the endpoint answers `501` and the form shows the
reason in its alert box.

## Notes

- Persian RTL layout with Vazirmatn font
- Forms are validated client-side and ready for API integration
- Visual design matches the original HTML reference files pixel-perfect
