# Project Overview

This repository implements a B2B Plastics SRM web application with:

- Frontend: React (Vite) at `http://localhost:5173`
- Backend: Node/Express with PostgreSQL
- Real-time: Socket.io for admin content refresh

Key flows:

- Admin content (banners, testimonials, sponsors) with reliable revalidation and client-side drafts to avoid accidental blank writes.
- Commerce MVP: products, cart, checkout, and admin orders visibility.
- Private messaging (DM) and public forum endpoints.
- JWT-based authentication with roles: USER and ADMIN.

Auth & Roles:

- `POST /api/auth/login` issues JWT. Tokens carry `uid`, `email`, `role`.
- Admin endpoints require `ADMIN` role.
- User actions (cart/checkout/messages/forum create) require JWT.

See `API_REFERENCE.md` for endpoints and payloads.