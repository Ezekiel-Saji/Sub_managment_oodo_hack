# Sub_managment_oodo_hack
# Brightloop – Subscription Management System

**A unified platform for managing products, subscription plans, recurring billing, invoices, payments and revenue analytics.**

## About the Project

Brightloop is a web-based Subscription Management System developed as part of the Odoo Hackathon.

The platform is designed to simplify the operations of subscription-based businesses by bringing the complete subscription lifecycle into one centralized application.

Traditional subscription management often involves manually tracking customers, remembering renewals, preparing invoices and matching payments. These processes are time-consuming and prone to errors.

Brightloop aims to automate these operations, improve billing accuracy and provide businesses with better visibility into their recurring revenue.

## Problem Statement

Build a unified software platform that manages the complete lifecycle of a subscription business, from product and plan creation to recurring billing, invoice generation, payment tracking and revenue reporting.

The system is designed around the business scenario of Brightloop Software.

## Key Features

### 1. User Authentication and Role Management
- Secure user registration and login.
- Admin, Staff and Customer roles.
- Role-based access control.
- Password validation and reset.
- Admin-only staff account creation.

### 2. Product Management
- Create, view, update and delete products.
- Maintain product names, types, sales prices and cost prices.
- Add product variants and brand-based pricing.
- Support additional variant pricing.

### 3. Subscription Plan Management
- Create and manage subscription plans.
- Support daily, weekly, monthly and yearly billing.
- Configure minimum quantities.
- Set plan availability dates.
- Configure subscription closure, pause and renewal rules.

### 4. Quotation Management
- Create reusable quotation templates.
- Generate customer quotations.
- Configure quotation validity.
- Convert accepted quotations into subscriptions.

### 5. Subscription Management
- Create and manage customer subscriptions.
- Track subscription numbers, start dates and expiry dates.
- Manage subscription status and lifecycle.
- Support confirmation, activation, pausing, renewal and closure.

### 6. Invoice Management
- Generate invoices from subscriptions.
- Automatically populate customer and product details.
- Calculate taxes and discounts.
- Manage invoice statuses.
- Prevent duplicate billing.

### 7. Discount Management
- Fixed and percentage-based discounts.
- Minimum purchase and quantity conditions.
- Configure validity periods and usage limits.
- Apply eligible discounts automatically to invoices.

### 8. Payment Management
- Record payments against invoices.
- Track payment methods, amounts and dates.
- Monitor paid, partially paid and outstanding invoices.
- Identify overdue payments.

### 9. Analytics Dashboard
- Monitor active subscriptions.
- Track collected revenue.
- View outstanding payments.
- Identify overdue invoices.
- Filter and analyze business performance.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend development |
| Vite | Frontend development server |
| Node.js | Backend runtime |
| Express.js | REST API development |
| Supabase | Database and authentication services |
| PostgreSQL | Relational database |
| Git and GitHub | Version control and collaboration |
| Recharts | Data visualization |
| Lucide React | Interface icons |

## System Architecture

The application follows a client-server architecture.

```text
       ADMIN / STAFF / CUSTOMER
                  |
                  v
          REACT FRONTEND
                  |
                  v
          EXPRESS REST APIs
                  |
                  v
          BUSINESS LOGIC
                  |
                  v
          SUPABASE CLIENT
                  |
                  v
           POSTGRESQL DB
```

The frontend communicates with the backend through REST APIs. The backend validates requests, processes business logic and interacts with the Supabase database.

Supabase Authentication is used for managing user identities, while authorization and role-based permissions protect application resources.

## Project Structure

```text
brightloop/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── config/
│   │   └── supabase.js
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   ├── server.js
│   └── package.json
│
├── database/
│   └── schema.sql
│
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js and npm.
- Git.
- Visual Studio Code.
- A Supabase account.

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate into the project:

```bash
cd brightloop
```

### 2. Setup the Frontend

```bash
cd frontend
npm install
```

Create a `.env.local` file inside the frontend directory:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Start the frontend:

```bash
npm run dev
```

The frontend will generally run at:

`http://localhost:5173`

### 3. Setup the Backend

Open another terminal:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory:

```env
PORT=5000
SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SECRET_KEY
```

Start the backend:

```bash
npm run dev
```

The backend will run at:

`http://localhost:5000`

### 4. Database Configuration

1. Create a project in Supabase.
2. Open the SQL Editor.
3. Execute the SQL scripts provided in the `database` directory.
4. Configure Row Level Security policies and database permissions.
5. Configure authentication and user roles.

### 5. Verify Backend Connection

Open:

`http://localhost:5000/api/health`

Expected response:

```json
{
  "status": "success",
  "message": "Brightloop API is working!"
}
```

To check the database connection:

`http://localhost:5000/api/db-check`

## Security

- Supabase Authentication for user identity management.
- Role-based authorization for administrative operations.
- Row Level Security for database access control.
- Environment variables for sensitive credentials.
- Secret keys must never be exposed in frontend code or committed to GitHub.

## Team

**Developed by a team of four members** as part of the Odoo Hackathon.

## Project Status

The project is under active development.

The initial backend environment and Supabase database connection have been established. Product management, subscription workflows, billing, payment tracking and analytics are being developed.

---

**Brightloop – Simplifying Subscriptions, Automating Billing, Empowering Businesses.**
