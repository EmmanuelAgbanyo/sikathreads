# Sika Threads — Premium Fabric Store with AI-Powered Recommendations

**Official Tagline:** *Weaving Heritage, Stitching Modernity.*

**Primary Market:** Ghana  
**Primary Currency:** Ghana Cedi (GHS)  
**Payment Model:** Order Request & Verification (No online payments processed in this release)

---

## 1. Project Overview

Sika Threads is a production-oriented, full-stack online fabric store that brings Ghanaian textile heritage into harmony with contemporary fashion. The application is built for customers across Ghana seeking authentic handwoven Kente, certified GTP and Woodin African wax prints, couture French bridal lace, luxury brocade, and handspun Northern fugu cloth.

### Core Architectural Capabilities
- **Premium Editorial Storefront:** Designed with a Ghanaian luxury palette (Warm Ivory `#FAF9F6`, Gold `#B8863B`, Charcoal `#20201D`, Burgundy `#8B2635`).
- **Fabric Catalogue & Gallery:** Rich faceted search and multi-filtering (Category, Fabric Type, Colour Family, Price Range in GHS, Occasion, Availability).
- **Product Detail Pages:** Technical specifications, sell units (yards/pieces), minimum order quantities, stock badges, WhatsApp concierge integration, and related fabrics.
- **Shopping Bag & Cart:** Persistent state, availability and MOQ enforcement, line totals in GHS.
- **Order Request Checkout (No Online Payments):** Collects customer contact and delivery address in Ghana (regional courier or showroom pickup). Validates stock and pricing on the server, generates a unique reference (e.g., `ST-2026-XXXX`), and initiates human verification.
- **Sika StyleMatch AI:** Gemini-powered styling engine that analyzes customer occasions, themes, palettes, and budgets, matching **strictly against genuine, published in-stock catalogue items**.
- **Admin Approval Centre:** Enforces mandatory human stylist verification before recommendations are dispatched. Features a live **3–5 minute response target countdown**, candidate product substitution, reason editing, and explicit email approval.
- **Bespoke Fabric Sourcing:** Sourcing concierge workflow for rare or sold-out fabrics, connecting with master weavers in Bonwire and Tamale.
- **Transactional Email System:** Branded HTML and plain-text templates with the official tagline, idempotency keys, delivery tracking, and status updates.
- **Operations & Security:** Role-based access controls, complete audit logging, deny-by-default Firestore rules, and image upload validation.

---

## 2. Directory Structure

```
SIKATHREADS/
├── firestore.rules          # Deny-by-default Firestore security rules
├── storage.rules            # Firebase Storage security rules
├── .env.example             # Environment variable template
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite bundler configuration
├── tailwind.config.js       # Sika Threads design tokens and palette
├── server/
│   └── index.js             # Trusted backend server (Gemini AI + validation API)
├── src/
│   ├── types/               # TypeScript data models
│   ├── data/                # Seed catalogue of authentic Ghanaian textiles
│   ├── services/            # StoreService, StyleMatch AI, EmailService
│   ├── context/             # AuthContext, CartContext, WishlistContext
│   ├── components/          # Header, Footer, Hero, ProductCard, AnnouncementBar
│   └── pages/
│       ├── Home.tsx
│       ├── Shop.tsx
│       ├── ProductDetail.tsx
│       ├── Collections.tsx
│       ├── StyleMatch.tsx   # Signature AI customer request form
│       ├── SourcingRequestPage.tsx
│       ├── Cart.tsx
│       ├── Checkout.tsx
│       ├── OrderConfirmation.tsx
│       ├── Account.tsx
│       ├── Login.tsx
│       ├── AboutUs.tsx
│       ├── ContactUs.tsx
│       ├── PolicyAndFaqPages.tsx
│       └── admin/
│           ├── AdminLayout.tsx
│           ├── AdminDashboard.tsx
│           ├── AdminProducts.tsx
│           ├── AdminInventory.tsx
│           ├── AdminOrders.tsx
│           ├── AdminStyleMatch.tsx # Stylist 3-5 min SLA approval queue
│           ├── AdminSourcing.tsx
│           ├── AdminEnquiries.tsx
│           ├── AdminContent.tsx
│           └── AdminAuditLogs.tsx
└── tests/
    └── store.test.ts        # Automated unit and business logic tests
```

---

## 3. Getting Started

### Prerequisites
- Node.js v18+ (tested on Node v22.18.0)
- npm v10+

### Installation
```bash
npm install
```

### Running Locally
To launch the Vite development storefront:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

To launch the trusted backend server (for Gemini AI calls and order revalidation):
```bash
npm run server
```

### Running the Test Suite
```bash
npm test
```

---

## 4. Operational Workflows

### Order Request Journey (No Online Payments)
1. Customer adds desired yardage of fabrics to the bag.
2. At checkout, the customer submits their Ghanaian delivery region or chooses showroom pickup in Osu, Accra.
3. The server validates current stock and unit pricing, creates order reference `ST-2026-XXXX`, and logs the request.
4. The customer sees the confirmation message:
   > *"Thank you for choosing Sika Threads. Your order request has been received. Our team will confirm product availability, final pricing, and delivery arrangements with you."*
5. The order appears in the Admin Portal under **Order Requests**.
6. The store manager audits the physical fabric lot in the warehouse, contacts the customer via phone/WhatsApp, records final delivery terms, and confirms the order.
7. Upon confirmation, inventory is safely deducted and an audit movement log is committed.

### Sika StyleMatch AI & Stylist Verification (3–5 Min SLA Target)
1. Customer inputs their event occasion (e.g., Traditional Engagement), preferred colors, budget, and intended outfit.
2. The AI interprets parameters and retrieves eligible catalogue products.
3. The candidate recommendations enter the **Admin StyleMatch Approval Centre**.
4. The stylist reviews candidate fabrics, can swap products from the catalogue, and edits the rationale.
5. Once verified, the stylist clicks **Approve & Dispatch Lookbook**.
6. The branded email is dispatched to the customer with genuine photographs, GHS pricing, and verified stock.

---

## 5. Security and Compliance

- **No Public Client Secrets:** Gemini API keys and email provider credentials are restricted to the trusted backend.
- **Role Isolation:** Administrator status is checked via secure custom claims or server validation, never from client-editable database fields.
- **Audit Logs:** All admin updates, inventory deltas, and order confirmations are recorded in the immutable audit log.
- **Ghanaian Data Protection:** Customer contact details are handled according to the Ghana Data Protection Act (Act 843).
