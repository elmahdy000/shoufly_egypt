# Delivery Agent Frontend Integration Guide

## Overview
The Delivery interface is highly mobile-optimized (Mobile First). Agents use it while driving/walking. It focuses on large buttons, clear GPS routing, and QR code scanning.

---

## 1. Task Procurement
**Purpose**: View packages that are `READY_FOR_PICKUP` at vendor locations and accept them.
**Pages**:
- `/tasks` (List of available delivery jobs nearby).
**Endpoints**:
*   *(Requires a GET route that fetches requests where status = ORDER_PAID_PENDING_DELIVERY and last deliveryTracking = READY_FOR_PICKUP)*.
*   `POST /api/delivery/accept` - Locks the delivery task to this specific agent. Changes status to `OUT_FOR_DELIVERY`.

## 2. Active Delivery & Routing
**Purpose**: Navigate from Vendor to Client. Update locations.
**Pages**:
- `/active-task/:id` (Shows map, vendor address, client address, and contact CTA).
**Endpoints**:
*   `PATCH /api/delivery/status` - For incremental updates (e.g., `IN_TRANSIT`).

## 3. Handover & Completion
**Purpose**: Physically hand the item to the client and prove delivery.
**Pages**:
- `/scanner` (Used to scan the client's confirmation QR code).
**Endpoints**:
*   `POST /api/delivery/complete` - Finalizes the delivery flow. *Note: This often triggers the `settleOrder()` logic in the backend, distributing funds.*
