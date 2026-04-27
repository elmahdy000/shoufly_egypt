# 🚀 Shoofly Flutter Suite Roadmap

This file tracks our progress in building the Shoofly mobile apps. Each task includes a description of **WHAT** was done and **WHY** it was necessary.

---

## ✅ Phase 1: Foundation & Setup
- [x] **Project Initialization**
  - **What**: Created `shoofly_core` package and `shoofly_client` app.
  - **Why**: Establish a shared foundation (Core) to avoid code duplication across the 4 planned apps.
- [x] **Folder Structure (Clean Architecture)**
  - **What**: Created `domain`, `data`, `presentation`, and `core` directories.
  - **Why**: Enforce a strict separation of concerns, making the app easier to test and maintain.

---

## ✅ Phase 2: Design System (The "Premium" Look)
- [x] **Color Palette (`AppColors`)**
  - **What**: Defined Shoofly orange, deep dark backgrounds, and functional colors.
  - **Why**: Ensure visual consistency and a high-end SaaS feel across all roles.
- [x] **Typography (`AppTypography`)**
  - **What**: Integrated Google Fonts (Outfit) and defined a text hierarchy.
  - **Why**: Professional typography improves readability and user trust.
- [x] **Global Theme (`AppTheme`)**
  - **What**: Defined standard styles for Buttons, Cards, and Input Fields.
  - **Why**: Centralized styling means we can update the look of all 4 apps from a single file.

---

## ✅ Phase 3: Core Architecture & Data Layer
- [x] **Domain Entities (`User`)**
  - **What**: Created the pure Dart `User` class.
  - **Why**: Entities represent our "Business Truth" and are independent of any API or DB structure.
- [x] **Data Models (`UserModel`)**
  - **What**: Implemented JSON serialization using `Freezed`.
  - **Why**: Models handle the "messy" data from the internet and convert it into clean objects for the app.
- [x] **Failure Handling**
  - **What**: Defined `ServerFailure`, `NetworkFailure`, etc.
  - **Why**: Allows us to show specific, user-friendly messages instead of generic "Error" codes.
- [x] **API Client (`ApiClient`)**
  - **What**: Configured `Dio` with base settings and interceptors.
  - **Why**: Centralized network logic ensures security (tokens) and easy debugging.
- [x] **Repository Interfaces & Impl**
  - **What**: Created `AuthRepository` and its implementation.
  - **Why**: This "bridge" separates the *What* (Repository interface) from the *How* (Implementation with API).

---

## ✅ Phase 4: Business Logic (BLoC & UseCases)
- [x] **Login UseCase**
  - **What**: Logic to execute a login request.
  - **Why**: Keeps the logic out of the BLoC and makes it reusable across different apps (e.g., Client and Vendor).
- [x] **Auth BLoC**
  - **What**: State manager for authentication.
  - **Why**: Orchestrates the UI states (Initial, Loading, Authenticated, Error) in a clean, predictable way.
- [x] **Dependency Injection (DI)**
  - **What**: Wiring everything up using `GetIt`.
  - **Why**: Decouples components, making it easy to swap implementations and manage object lifecycles efficiently.

---

## ✅ Phase 5: UI Implementation (Client App)
- [x] **Splash & Landing Page**
  - **What**: Premium landing page with brand gradients and typography.
  - **Why**: Create a strong first impression and guide the user to the auth flow.
- [x] **Login Page**
  - **What**: Interactive login page with BLoC state management (Loading/Error handling).
  - **Why**: Enable users to securely access their accounts with real-time feedback.
- [ ] **Registration Page**
- [x] **Home / Service Explorer**
  - **What**: Multi-section home screen with quick-request cards and category grid.
  - **Why**: The central hub of the app, designed to drive the "Request-First" logic.
- [ ] **Request Creation Wizard**
- [ ] **Request Details & Bids**
- [ ] **Chat & Messaging**
- [ ] **Wallet & Payments**
- [ ] **Live Tracking Map**

---

## 📱 Full App Suite Scope

### 1. Shoofly Client App
*   **Auth**: Landing, Login, Register, Forget Password.
*   **Marketplace**: Home (Categories), Search, Featured Offers.
*   **Requests**: Smart Wizard (Multi-step), My Requests List.
*   **Interaction**: Request Details, Bid Comparison, Real-time Chat.
*   **Finance**: Wallet Top-up, Escrow Payments, Transaction History.
*   **Logistics**: Live Map Tracking, QR Receipt Confirmation.
*   **Profile**: Settings, Reviews Given, Notifications.

### 2. Shoofly Vendor App
*   **Onboarding**: Professional KYC (ID/Certificate Upload).
*   **Business Dashboard**: Earnings Stats, Job History, Ratings.
*   **Job Feed**: Category-based Leads, Map-view of Opportunities.
*   **Bidding**: Price Quoting, Portfolio Attachment.
*   **Execution**: Active Jobs Management, Client Chat, Completion Proof.
*   **Financials**: Payout Tracking, Withdrawal Requests.

### 3. Shoofly Delivery App
*   **Registration**: Vehicle & Identity Verification.
*   **Task Hub**: Nearby Pickup/Delivery Tasks.
*   **Logistics**: Navigation, Telemetry (Background GPS), QR Handover.
*   **Earnings**: Commission Tracking, Daily Payouts.

### 4. Shoofly Admin App
*   **Control Center**: Platform KPIs, Global Activity Stream.
*   **Moderation**: Manual Request Review, User Management, KYC Audit.
*   **Support**: Dispute Mediation, Refund Handling, Platform Settings.
