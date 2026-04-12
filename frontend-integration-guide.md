# Shoofly Full API & Frontend Integration Blueprint 🗺️

This document provides a detailed mapping between Frontend Routes and Backend API Endpoints.

---

## 🟦 I. Client Application (Consumer Portal)

### 1. Unified Dashboard (/dashboard)
| Action | Endpoint | Method | Key Body/Query Fields |
| :--- | :--- | :--- | :--- |
| Get Statistics | `/api/client/summary` | `GET` | `balance`, `activeRequestsCount` |
| Recent Requests | `/api/requests?limit=5` | `GET` | `title`, `status`, `createdAt` |

### 2. Request Management (/requests)
| Page | Backend Endpoint | Method | Body / Payload Requirements |
| :--- | :--- | :--- | :--- |
| **Create Request** | `/api/requests` | `POST` | `title`, `categoryId`, `description`, `address`, `latitude`, `longitude`, `deliveryPhone`, `images[]` |
| **History List** | `/api/requests?limit=20&offset=0` | `GET` | `status` (filter), `orderBy=createdAt:desc` |
| **Details & Offers** | `/api/requests/[id]` | `GET` | Returns request metadata + `bids` array with `vendor` info and `images`. |

### 3. Payment & Settlement
| Action | Backend Endpoint | Method | Body / Payload Requirements |
| :--- | :--- | :--- | :--- |
| **Wallet Deposit** | `/api/client/wallet/deposit` | `POST` | `amount` (Positive Number) |
| **Select Vendor** | `/api/offers/[bidId]/accept` | `POST` | Marks the bid as `SELECTED` by client. |
| **Complete Pay** | `/api/payments/pay/[requestId]` | `POST` | Deducts from wallet -> places into Escrow. |
| **QR Confirmation** | `/api/transactions/settle/[requestId]`| `POST` | Final release of funds to Vendor & Admin. |

---

## 🟩 II. Vendor Application (Business Cockpit)

### 1. Request Discovery (/open-market)
| Page | Backend Endpoint | Method | Body / Payload Requirements |
| :--- | :--- | :--- | :--- |
| **Market Feed** | `/api/vendor/requests/open` | `GET` | Automatic filtering by `vendorCategories`. Supports pagination. |
| **Bid Submission** | `/api/bids` | `POST` | `requestId`, `description`, `netPrice` (Vendor Payout), `images[]` |

### 2. Order Tracking (/my-bids)
| Page | Backend Endpoint | Method | Body / Payload Requirements |
| :--- | :--- | :--- | :--- |
| **Own Bids** | `/api/vendor/bids` | `GET` | List with `status` (Accepted, Pending, etc.) |
| **Update Order** | `/api/delivery/status` | `PATCH` | `requestId`, `status` (Only `VENDOR_PREPARING` or `READY_FOR_PICKUP`) |

### 3. Financial Cockpit (/wallet)
| Action | Backend Endpoint | Method | Body / Payload Requirements |
| :--- | :--- | :--- | :--- |
| **Balance View** | `/api/vendor/wallet` | `GET` | `walletBalance`, `totalEarned`, `pendingWithdrawals` |
| **Request Cash** | `/api/withdrawals` | `POST` | `amount`. Validates against `availableBalance`. |

---

## 🟧 III. Admin Portal (Management Suite)

### 1. Request Audit (/admin/moderation)
| Action | Backend Endpoint | Method | Body / Payload Requirements |
| :--- | :--- | :--- | :--- |
| **Pending List** | `/api/admin/requests/pending` | `GET` | Requests in `PENDING_ADMIN_REVISION`. |
| **Approve/Reject** | `/api/admin/requests/[id]/review`| `PATCH` | `action` ('approve' or 'reject'). |

### 2. Vendor Verification (/admin/vendors)
| Action | Backend Endpoint | Method | Body / Payload Requirements |
| :--- | :--- | :--- | :--- |
| **List Vendors** | `/api/admin/vendors` | `GET` | Paginated list of all vendors + their categories. |
| **Toggle Active** | `/api/admin/vendors` | `PATCH` | `vendorId`, `isActive` (boolean). |

### 3. Market Orchestration (/admin/offers)

| Action | Backend Endpoint | Method | Body / Payload Requirements |
| :--- | :--- | :--- | :--- |
| **Forward Bid** | `/api/admin/offers/[bidId]/forward`| `POST` | Makes bid visible to Client. Sends notification. |

### 3. Global Ledger (/admin/finance)
| Data Type | Backend Endpoint | Method | Body / Payload Requirements |
| :--- | :--- | :--- | :--- |
| **Sys Transactions**| `/api/admin/finance/transactions` | `GET` | Central ledger. Includes `ESCROW`, `COMMISSION`, `PAYOUT`. |
| **Review Payout** | `/api/admin/withdrawals/[id]` | `PATCH` | `status` ('APPROVED' or 'REJECTED'). |

### 4. System Settings (/admin/settings)
| Config | Backend Endpoint | Method | Body / Payload Requirements |
| :--- | :--- | :--- | :--- |
| **Load Settings** | `/api/admin/settings` | `GET` | Fetch commission %, matching radius, etc. |
| **Update Logic** | `/api/admin/settings` | `PATCH` | Update `commissionPercent`, `initialRadiusKm`, etc. |

---

## 🟨 IV. Delivery Agent App (Logistics)

### 1. Mission Control (/available-orders)
| Action | Backend Endpoint | Method | Body / Payload Requirements |
| :--- | :--- | :--- | :--- |
| **Find Tasks** | `/api/delivery/tasks/available` | `GET`| Filtered by `status: READY_FOR_PICKUP`. |
| **Accept Task** | `/api/delivery/tasks/[id]/accept` | `POST` | Assigns order to agent. Status -> `OUT_FOR_DELIVERY`. |

### 2. Completion (/active-delivery)
| Action | Backend Endpoint | Method | Body / Payload Requirements |
| :--- | :--- | :--- | :--- |
| **Mark Delivered** | `/api/delivery/tasks/[id]/complete`| `POST` | Status -> `DELIVERED`. Triggers client notification. |
| **Report Failure** | `/api/delivery/fail` | `POST` | `requestId`, `reason`. Alerts Admin for escrow refund. |

---

## 🟣 V. Common Shared Services (All Apps)

### 1. Notifications (/notifications)
| Action | Backend Endpoint | Method | Payload / Purpose |
| :--- | :--- | :--- | :--- |
| **List Alerts** | `/api/notifications?limit=20` | `GET` | Paginated chronological list of all user alerts. |
| **Mark All Read**| `/api/notifications` | `PATCH` | Clears the "unread" badge count for the user. |

### 2. Live Notifications & Chat Stream (Real-time)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **SSE Stream** | `/api/notifications/stream` | Receive live `notification` or `chat` events. |

**Frontend Parser Example**:
```javascript
eventSource.onmessage = (event) => {
  const payload = JSON.parse(event.data);
  if (payload.type === 'chat') {
    appendMessage(payload.data); // Real-time message update
  } else {
    showToast(payload.data.title); // New notification
  }
};
```

### 3. Integrated Chat System (/chat)
| Action | Backend Endpoint | Method | Payload / Purpose |
| :--- | :--- | :--- | :--- |
| **Send Message** | `/api/chat` | `POST` | `{ receiverId, content, requestId? }` |
| **Get History** | `/api/chat?otherId=X` | `GET` | Fetch all messages with specific user. |

### 4. User Profile (/profile)


| Action | Backend Endpoint | Method | Payload / Purpose |
| :--- | :--- | :--- | :--- |
| **Get My Info** | `/api/user/profile` | `GET` | Fetch name, role, balance, and phone number. |
| **Update Info** | `/api/user/profile` | `PATCH` | `fullName`, `phone`. Allows users to keep data current. |

### 3. Public Assets
| Action | Backend Endpoint | Method | Payload / Purpose |
| :--- | :--- | :--- | :--- |
| **Fetch Categories**| `/api/categories` | `GET` | List top-level categories. Use `?parentId=ID` for subcategories. |

---

## ⚠️ Critical Implementation Notes


1. **Transaction Integrity**: The backend implements `Prisma.Transaction` on all `POST/PATCH` routes. If an API call fails with 500, no partial data is saved.
2. **Dynamic Payouts**: Vendors see `netPrice`, but the backend uses `PlatformSetting` to calculate the final `clientPrice` (including 15%+ commission). Frontend must clarify "Platform Fees" in the UI.
3. **Pagination Handling**: Always send `?limit=X&offset=Y`. Response objects do not wrap the array (Raw list is returned). Use length of array to detect "End of Data".
4. **Image Payloads**: Images are sent as an array of objects. **Binary upload must be handled separately** prior to calling the business logic APIs.
