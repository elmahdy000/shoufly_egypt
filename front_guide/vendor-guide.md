# Vendor Frontend Integration Guide

## Overview
The Vendor application is a "Business Cockpit". It needs to be high-density and information-rich. Vendors use this to find jobs, submit quotes, update delivery statuses, and manage their earnings.

---

## 1. Marketplace & Job Radar
**Purpose**: See nearby requests based on the vendor's GPS and categories.
**Pages**:
- `/radar` or `/marketplace` (Map view or list view of nearby open tasks).
**Endpoints**:
*   `GET /api/vendor/requests/open?latitude=X&longitude=Y&radiusKm=Z` - Fetches requests available for bidding.

## 2. Bidding (Quoting)
**Purpose**: Vendor reviews request details and submits a price quote.
**Pages**:
- `/request/:id/bid` (Bid submission form).
**Endpoints**:
*   `POST /api/vendor/bids` - Submit price, description, and optional timeline.

## 3. Active Orders & Delivery Management
**Purpose**: Once a client pays, the vendor must prepare the item and update its status.
**Pages**:
- `/dashboard/active-orders` (Kanban or List view of paid orders).
**Endpoints**:
*   `PATCH /api/delivery/status` - Crucial for moving orders to `VENDOR_PREPARING` and then strictly to `READY_FOR_PICKUP` so delivery agents can take over.

## 4. Wallet & Treasury
**Purpose**: View available earnings and request bank withdrawals.
**Pages**:
- `/wallet` (Shows Available Balance, Pending balance, and withdrawal history).
**Endpoints**:
*   `GET /api/profile` - To read `walletBalance`.
*   `POST /api/withdrawals` - To request money out. *Note: this immediately deducts balance into a 'held' state.*

## 5. Real-time Communication
**Purpose**: Answer client questions regarding the service or chat with Admin for support.
**Pages**:
- `/inbox` (List of active conversations).
**Endpoints**:
*   `GET /api/notifications/stream?userId={id}` - Subscribe to Server-Sent Events (SSE) for instant message delivery without refreshing.
*   `POST /api/chat` - Send replies.
