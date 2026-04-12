# Client Frontend Integration Guide

## Overview
The Client interface is the primary consumer-facing app. Its main goal is to allow users to quickly submit service/repair requests, view incoming vendor bids, accept offers, and manage escrows.

---

## 1. Request Creation Flow
**Purpose**: Allow the client to take photos of their issue, describe it, and set a location.
**Pages**:
- `/create-request` (Form with Image Upload + GPS Map).
**Endpoints**:
*   `GET /api/categories` - To populate the dropdown of services.
*   `POST /api/requests` - To submit the final form.

## 2. Browsing Bids & Offers
**Purpose**: Once admin approves the request, vendors bid on it. The client reviews these forwarded bids and selects the chosen vendor.
**Pages**:
- `/my-requests` (List of active requests).
- `/request/:id/bids` (List of incoming offers for a specific request).
**Endpoints**:
*   *(Note: Bids are fetched as nested objects inside the request detail endpoint or a dedicated client-bid fetcher).*
*   `POST /api/requests/:id/accept-offer` - Client accepts the bid.

## 3. Escrow & Payment (Checkout)
**Purpose**: After accepting an offer, the client must deposit the agreed funds into the platform's escrow before work begins.
**Pages**:
- `/checkout/:requestId` (Payment gateway interface).
**Endpoints**:
*   `POST /api/requests/:id/pay` - Confirms payment and moves request to `ORDER_PAID_PENDING_DELIVERY`.

## 4. Chat & Tracking
**Purpose**: Communicate with the vendor for details or with the delivery agent for location.
**Pages**:
- `/chat/:userId` (Chat UI).
- `/track/:requestId` (Shows delivery status updates).
**Endpoints**:
*   `GET /api/chat?otherUserId={id}` - Load chat history.
*   `POST /api/chat` - Send a message.
*   `GET /api/notifications/stream?userId={id}` - Listen for real-time delivery updates & messages via SSE.

## 5. Settlement (QR Code)
**Purpose**: When delivery is complete, client scans the agent's QR code or approves the task to release funds to the vendor.
**Pages**:
- `/qr-scanner` (Camera UI).
**Endpoints**:
*   `POST /api/requests/:id/settle` (Assumption/Implementation detail based on QR logic).
