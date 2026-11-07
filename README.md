# Nomera School ERP Frontend

The responsive, modern web application for Nomera School ERP. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Base UI, and Framer Motion.

---

## 1. Purpose

The frontend provides specialized, role-tailored portals and dashboards for all school stakeholders:
- **Super Admin & Admin:** User provisioning, role permissions, academic year management, section assignment, system settings, and institutional audit logs.
- **Teachers:** Daily period attendance marking, marks entry, timetable review, student academic feedback, and class announcements.
- **Students & Parents:** Real-time attendance percentage, exam result cards, fee invoice review, online payment history, hostel allocations, and notices.
- **Accountants:** Fee structure configuration, invoice generation, payment capture, scholarship management, and financial summaries.
- **Hostel & Transport Managers:** Room/bed allocations, mess expense tracking, maintenance ticketing, and bus route assignments.

---

## 2. Architecture & API Integration

- **Backend Proxy (`app/api/[...path]/route.ts`):** Next.js catch-all proxy that handles authentication token forwarding, multipart upload size limits (11 MB cap), and forwards requests to the versioned backend (`/api/v1/...`).
- **Unified API Client (`lib/services/apiClient.ts`):** Handles unified `{ success, data, error, meta }` response envelopes, extracting error messages and metadata correlation IDs.
- **Pagination Support:** Services support both direct array extraction and paginated `{ items, total }` responses across repository endpoints.
- **Security Headers:** Enforces Content Security Policy (CSP without `unsafe-eval`, restricted `connect-src`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy`.

---

## 3. Setup & Installation

### Prerequisites
- Node.js 20+
- pnpm 9+

### Local Environment Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd fe/cognora-repository
   ```

2. **Install locked dependencies:**
   ```bash
   pnpm install --frozen-lockfile
   ```

3. **Configure environment variables:**
   Copy the example environment template:
   ```bash
   cp .env.example .env.local
   ```
   Set `BACKEND_API_URL` to point to your local FastAPI server (default: `http://127.0.0.1:8000`).

---

## 4. Running the Application

### Development Server
Start the Next.js development server:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Testing & Verification

### Static Type Checking
Run the TypeScript compiler across all source files:
```bash
pnpm tsc --noEmit
```

### Linting
Run the configured ESLint check:
```bash
pnpm lint
```

### Dependency Vulnerability Audit
Run security audit on production packages:
```bash
pnpm audit --prod
```

---

## 6. Deployment

### Production Build & Run
```bash
pnpm build
pnpm start
```

### Multi-Stage Standalone Docker Container
The included production `Dockerfile` builds a standalone Next.js container:
- Runs as an unprivileged non-root user (`nextjs`, UID `10001`).
- Uses Next.js standalone mode for minimal production image size.
- Includes container healthcheck probe.
- Exposes port `3000`.

Build and run:
```bash
docker build -t edtech-frontend:latest .
docker run -p 3000:3000 -e BACKEND_API_URL="http://backend:8000" edtech-frontend:latest
```
