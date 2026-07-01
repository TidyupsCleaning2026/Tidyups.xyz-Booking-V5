# Tidyups Cleaning Service — PRD

## Original Problem Statement
Rebuild Tidyups Cleaning Service as an Expo mobile app: a quote-request form (name, phone, email, service type, property type, bedrooms, bathrooms, address, message) that saves leads and sends a Twilio SMS alert, plus an admin screen to view leads. Brand is purple/magenta with a bunny mascot, tagline "Leave The Mess To Us!".

## User Choices
- Twilio SMS alert (credentials pending from user).
- Admin protected by a simple PIN (PIN: 1234, env `ADMIN_PIN`).
- Service types: Standard Cleaning, Deep Cleaning, Move In Cleaning, Move Out Cleaning.
- Property types: House, Flat/Apartment, Studio, Office.
- Lead status tracking added: New / Contacted / Booked / Closed.
- Official brand logo (dark bunny mascot + "(833) TIDY-UPS") supplied and integrated.

## Architecture
- Backend: FastAPI + MongoDB (motor). Routes under `/api`: POST /leads, GET /leads (x-admin-pin header), PATCH /leads/{id}/status, POST /admin/verify-pin, GET /services. Twilio Messages API sends lead alert (sync SDK via threadpool; skipped gracefully when creds unset).
- Frontend: Expo Router (stack). Screens: index (home), quote, success, admin (PIN numpad), leads. Fredoka/Nunito fonts, magenta/purple tactile theme (light) with dark brand hero. react-native-keyboard-controller for form keyboard UX; @gorhom/bottom-sheet for lead detail/status.

## Implemented (2026-07-01)
- Full lead capture form with service chips, property pills, bed/bath steppers, validation.
- Lead persistence + admin PIN gate + leads list with filters, pull-to-refresh, status update bottom sheet.
- Dark brand hero using official logo; tappable "(833) TIDY-UPS" call button; logo on splash/icon + success screen.
- Backend tested (14/14 pytest) and frontend flows verified by testing agent.

## Backlog
- P0: Wire live Twilio credentials (AC SID, Auth Token, From #, Alert-To #) to enable SMS alerts.
- P1: Email notification fallback (Resend/SendGrid) alongside SMS.
- P1: Lead search + date range filter in admin.
- P2: Booking scheduling / preferred date-time field on quote form.

## Next Tasks
1. Collect Twilio credentials and enable SMS.
2. Optionally add email alert fallback.
