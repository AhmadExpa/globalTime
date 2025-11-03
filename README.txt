TIME & DATE ULTIMATE (Light Theme, Roles, 195 Countries)
========================================================

Backend (Node/Express + Mongo):
- Users (roles: free, pro, admin); JWT login.
- Clocks (free=2, pro=4, admin=∞).
- Events/Announcer (free=2, pro=4, admin=∞). PDF export is clean (no colors), ICS included.
- Timers (free=2, pro/admin=unlimited). Guests use sessionStorage.
- Newsletter subscribe + Admin sender via Nodemailer.
- Upgrade Requests: users request upgrade; admin approves/rejects.
- World Clock (195 countries): local time, UTC offset, sunrise/sunset using suncalc.
- Time Difference: /api/worldclock/diff?base=Asia/Karachi -> hours delta for all 195.
- Meeting Planner: convert base time to other zones and show deltas.

Frontend (Next.js + Tailwind, clean light UI, ads slots):
- Landing page: big local clock, planner CTA, feature cards, ad slots.
- Personalize: live preview + theme thumbnails; guest (2 in session), free/pro/admin saved.
- Events: live styled preview + separate clean PDF preview; bullets list included; PDF ignores theme colors.
- World Clock: 195 rows, sunrise/sunset, search.
- Time Difference Calculator: choose base TZ, list all 195 with Δ hours.
- Meeting Planner: base TZ/date+time, other zones -> local times & hour delta.
- Timers: custom timers, persisted for logged-in or session for guests.
- Admin (sidebar): Users (counts only), Newsletter (send), Requests (approve/reject).

SETUP
-----
1) Backend
   cd backend
   cp .env.example .env
   # set MONGO_URI, JWT_SECRET, EMAIL_USER, EMAIL_PASS
   npm install
   npm run dev

2) Frontend
   cd frontend
   cp .env.local.example .env.local
   npm install
   npm run dev

Notes
-----
- Sunrise/sunset are approximate (computed by suncalc).
- World dataset lists 195 entries (country, timezone, lat/lon). You can refine if you want capital-specific updates.
- Guests can use all tools; persistence only for logged-in users (sessionStorage for guests).
