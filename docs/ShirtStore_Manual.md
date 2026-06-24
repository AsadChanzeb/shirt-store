# Shirt Store User Manual

## 1. Introduction

**ShirtStore** is a modern e‑commerce platform for buying and selling custom‑designed shirts. This manual provides step‑by‑step guidance for all user roles.

### 1.1 Purpose of This Document

This user manual is intended for all users of the ShirtStore system, including system administrators, store managers, staff, and customers. It covers everyday tasks, configuration, and troubleshooting.

### 1.2 System Overview

ShirtStore operates as a web‑based SaaS platform accessible via any modern browser. The system supports four distinct roles, each with a tailored dashboard and feature set.

| Role | Description | Primary Responsibilities |
|------|-------------|--------------------------|
| **System Admin** | Platform‑level super administrator | Manage stores, subscriptions, audit logs, system health |
| **Store Manager** | Manager of a specific shirt store | Manage products, staff, orders, reports |
| **Staff** | Store staff handling order fulfillment | Process orders, update inventory, manage shipping |
| **Customer** | End‑user purchasing shirts | Browse catalog, place orders, track shipments |

### 1.3 System Requirements

| Component | Requirement |
|-----------|-------------|
| **Browser** | Chrome 100+, Firefox 100+, Edge 100+, Safari 15+ |
| **Internet** | Stable broadband (minimum 2 Mbps) |
| **Device** | Desktop, laptop, tablet, or smartphone |
| **Screen Resolution** | Minimum 1280 × 720 (responsive layout supports mobile) |

> **Tip**: No desktop software installation is required – just a web browser.

### 1.4 Accessing the System

1. Open your browser and navigate to the ShirtStore URL provided by your store.
2. On the login page, enter your registered email address and password.
3. Click **Sign In** to be directed to your role‑specific dashboard.

### 1.5 Support & Contact

For technical assistance, contact the store’s designated administrator. For platform‑level issues, use the **Help** menu’s feedback form.

---

## 2. Getting Started

### 2.1 Registration & Onboarding

#### Store Manager / Staff
1. Store owners invite managers and staff via the **Invitations** page.
2. Recipients receive an email with an **Accept Invitation** button.
3. After clicking the link, set a secure password and complete registration.

#### Customers
1. Customers create an account via the **Sign Up** page.
2. Provide name, email, and password.
3. Verify the email address using the confirmation link.

### 2.2 Logging In

1. Navigate to the login page.
2. Enter email and password.
3. Click **Sign In**.
4. If multi‑factor authentication is enabled, enter the one‑time code sent to your email.

> **Forgot Password?** Click the link on the login page to reset it.

### 2.3 Dashboard Overview

Each dashboard contains:
- **Sidebar** – navigation menu.
- **Top Bar** – user name, notifications, profile menu.
- **Summary Cards** – key metrics (orders, revenue, inventory).
- **Quick Actions** – shortcuts for common tasks.

---

## 3. System Administrator Guide

### 3.1 System Admin Dashboard

Shows a global view of all stores, subscriptions, and system health.

### 3.2 Managing Stores
- **Add Store** – provide store name, contact email, address, and logo.
- **Invite Manager** – send invitation to a new store manager.
- **Edit / Deactivate Store** – modify details or toggle status.

### 3.3 Subscription Management
- View, modify, or cancel Stripe subscriptions for each store.
- Override plans, apply proration automatically.

### 3.4 Audit Logs
- Filter by date, action type, entity, or user role.
- Export logs as CSV.

### 3.5 System Health
- Monitor database connectivity, API latency, job queue, and email service.

---

## 4. Store Manager Guide

### 4.1 Store Dashboard

Provides an overview of daily orders, inventory levels, revenue, and pending staff invitations.

### 4.2 Product Management
- **Add Product** – name, description, price, categories, images, inventory quantity.
- **Edit Product** – update details or adjust stock.
- **Toggle Availability** – enable/disable a product in real‑time.

### 4.3 Staff Management
- Invite staff members, assign roles, and deactivate accounts.

### 4.4 Order Management
- View order queue, process payments, update order status (Processing → Shipped → Delivered).
- Issue refunds or cancellations.

### 4.5 Reports & Analytics
- **Sales Reports** – date range, product filters, export CSV.
- **Inventory Reports** – low‑stock alerts, restock suggestions.

---

## 5. Staff Guide

### 5.1 Staff Dashboard

Shows pending orders, inventory alerts, and daily revenue.

### 5.2 Processing Orders
- Mark orders as **Processed**, generate shipping labels, update tracking numbers.
- Handle cancellations and refunds.

### 5.3 Inventory Updates
- Adjust stock levels after shipments or returns.

---

## 6. Customer Guide

### 6.1 Shopping Experience
- Browse catalog, filter by style, size, color.
- Add items to cart, apply discount codes.

### 6.2 Checkout
- Review cart, select shipping method, enter payment details (Stripe).
- Receive order confirmation email.

### 6.3 Order Tracking
- View order status and tracking number in **My Orders**.

### 6.4 Account Management
- Update profile, address book, and password.
- View order history and download invoices.

---

## 7. Notifications

Real‑time in‑app notifications, email alerts, and optional push notifications for:
- New orders
- Low inventory
- Shipping updates
- Payment issues

---

## 8. Troubleshooting

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| Cannot log in | Wrong credentials | Reset password via **Forgot Password** |
| Order not showing | Browser cache | Hard refresh (Ctrl+Shift+R) |
| Payment failed | Card declined | Use a different payment method |
| Inventory not updating | Staff permissions | Ensure staff has inventory edit rights |

---

## 9. Security & Privacy

- All data encrypted in transit (TLS 1.3).
- Passwords hashed with bcrypt.
- Payments processed by Stripe; no card data stored.
- Role‑based access control ensures users see only their store’s data.

---

## 10. Glossary

| Term | Definition |
|------|------------|
| **Store** | Individual shirt shop managed within the platform |
| **Product** | Shirt item listed for sale |
| **SKU** | Stock‑Keeping Unit, unique identifier for inventory |
| **Cart** | Temporary collection of products before checkout |
| **Order** | Completed purchase transaction |
| **Subscription** | Paid plan for store owners (Basic / Pro) |
| **Audit Log** | Record of significant actions performed in the system |
| **Stripe** | Payment processor used for secure transactions |

---

*End of Shirt Store User Manual*
