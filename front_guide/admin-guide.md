# Admin-Next Frontend Integration Guide

## Overview
The Admin dashboard is the command center. It requires wide-screen layouts, data tables, and high authorization levels. It monitors system health, reviews content, and oversees the financial treasury.

---

## 1. Content Moderation (Requests & Bids)
**Purpose**: Ensure platform quality by reviewing client requests before publishing, and reviewing bids if necessary.
**Pages**:
- `/requests/pending` (Table of incoming client requests).
- `/bids/review` (Table of submitted bids awaiting forward).
**Endpoints**:
*   `GET /api/admin/requests?status=PENDING_ADMIN_REVISION`
*   `PATCH /api/admin/requests/:id/review` - Payload: `{ action: "approve" | "reject" }`.
*   `POST /api/admin/bids/:id/forward` - Pushes a bid to the client.

## 2. User & Vendor Management
**Purpose**: Verify vendor identities, block malicious users, and onboard delivery agents.
**Pages**:
- `/users` (Data grid of all users).
- `/vendors/verification` (Review documents and approve vendors).
**Endpoints**:
*   `GET /api/admin/vendors`
*   `PATCH /api/admin/vendors/:id/verify` (or similar profile patch).

## 3. Financial Treasury & Ledger
**Purpose**: The most sensitive part. Admins must review withdrawal requests and oversee platform commissions.
**Pages**:
- `/finance/ledger` (View platform earnings and escrow).
- `/finance/withdrawals` (Table of vendor withdrawal requests).
**Endpoints**:
*   `GET /api/admin/finance/transactions` - The master ledger history.
*   `GET /api/admin/finance/withdrawals` (You will need to construct a standard GET route for the `listWithdrawals` service).
*   `PATCH /api/admin/withdrawals/:id/review` - Approve or reject payouts. *Note: Rejecting automatically refunds the vendor's digital wallet.*

## 4. Settings
**Purpose**: Adjust dynamic variables like Commission rates and GPS radiuses.
**Pages**:
- `/settings` (Form for global platform variables).
**Endpoints**:
*   `PATCH /api/admin/settings` (Modifies `PlatformSetting` table).
