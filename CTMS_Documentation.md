# CTMS - Complaint Ticket Management System

## Complete Project Documentation (Updated)

---

# 1. Project Overview

**CTMS (Complaint Ticket Management System)** is a web-based platform designed to centralize, track, manage, and resolve complaints/tickets efficiently within an organization. It provides real-time monitoring, SLA-based escalation workflows, department-wise ticket management, role-based access control, and comprehensive analytics.

The system uses **Supabase PostgreSQL** as the primary database for authentication, data storage, file storage, row-level security, and real-time updates.

---

# 2. Technologies Used (A to Z)

## 2.1 Frontend Technologies

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.2.4 | UI component library for building interactive interfaces |
| **Next.js** | 16.2.6 | React framework for server-side rendering, routing, and API handling |
| **TypeScript** | ^5 | Typed superset of JavaScript for better code quality and maintainability |
| **Tailwind CSS** | ^4 | Utility-first CSS framework for rapid UI development |
| **Framer Motion** | ^12.40.0 | Animation library for smooth page transitions and micro-interactions |
| **Recharts** | ^3.8.1 | Charting library for building interactive graphs and data visualizations |
| **Lucide React** | ^1.17.0 | Icon library for consistent SVG icons across the UI |
| **Tailwind Merge** | ^3.6.0 | Utility to merge Tailwind CSS classes without conflicts |
| **Class Variance Authority** | ^0.7.1 | Library for managing component variants |
| **CLSX** | ^2.1.1 | Utility for conditionally joining classNames |
| **Date-fns** | ^4.4.0 | Date utility library for formatting and manipulating dates |
| **Geist Font** | - | Modern font family from Vercel (Geist Sans & Geist Mono) |
| **ESLint** | ^9 | Linting tool for maintaining code quality |
| **PostCSS** | - | CSS transformation tool used with Tailwind CSS |

## 2.2 Backend / Database Technologies

| Technology | Version | Purpose |
|---|---|---|
| **Supabase** | latest | Backend-as-a-Service platform (Auth, Database, Storage, Real-time) |
| **Supabase PostgreSQL** | - | Primary relational database |
| **Supabase Auth** | - | Authentication with Email/Password + Google OAuth |
| **Supabase Storage** | - | File storage for ticket attachments |
| **Supabase Real-time** | - | WebSocket-based real-time data synchronization |
| **Row Level Security (RLS)** | - | Database-level security policies |
| **Next.js API Routes** | 16.2.6 | Server-side API endpoints (app router) |
| **Node.js** | (runtime) | JavaScript runtime environment |

## 2.3 Build & Development Tools

| Tool | Version | Purpose |
|---|---|---|
| **npm** | - | Package manager |
| **TypeScript Compiler** | ^5 | Type checking and compilation |
| **PostCSS with @tailwindcss/postcss** | ^4 | CSS processing pipeline |
| **ESLint with eslint-config-next** | ^9 | Code linting configured for Next.js best practices |

## 2.4 Export Libraries

| Library | Purpose |
|---|---|
| **jsPDF** | PDF file generation for report exports |
| **jsPDF-AutoTable** | Auto-generated tables in PDF exports |
| **xlsx / SheetJS** | Excel (.xlsx) file generation |
| **FileSaver.js** | Cross-browser file download utility |

## 2.5 UI / Design System

| Element | Details |
|---|---|
| **Color Palette** | Dark slate (#3B4252, #2E3440), White (#FFFFFF), Light gray (#F4F6F8, #D8DDE3) |
| **Typography** | Geist Sans (headings/body), Geist Mono (code/ticket numbers) |
| **Layout** | Fixed sidebar (260px) + scrollable main content area |
| **Responsive Design** | Mobile-first with breakpoints: sm, md, lg, xl |

## 2.6 Data Layer

| Component | Details |
|---|---|
| **Database** | Supabase PostgreSQL (11 tables) |
| **State Management** | React useState / useMemo hooks + Supabase real-time subscriptions |
| **Data Access** | Supabase JavaScript Client (`@supabase/supabase-js`) |
| **Data Structures** | TypeScript interfaces mapped to database tables |

---

# 3. Project Structure

```
D:\CTMS\
├── .git/
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs           # ESLint configuration
├── next-env.d.ts               # Next.js TypeScript declarations
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies & scripts
├── package-lock.json
├── postcss.config.mjs          # PostCSS/Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── tsconfig.tsbuildinfo
├── README.md
│
├── node_modules/               # Installed dependencies
│
├── public/                     # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── login-screen-logo.png   # Login page background image
│   ├── logo.png                # CTMS application logo
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
└── src/                        # Application source code
    ├── app/                    # Next.js App Router pages
    │   ├── layout.tsx          # Root layout with fonts & metadata
    │   ├── globals.css         # Global styles & CSS variables
    │   ├── page.tsx            # Homepage (redirects to /auth/login)
    │   │
    │   ├── auth/               # Authentication pages
    │   │   ├── login/
    │   │   ├── register/
    │   │   └── forgot-password/
    │   │
    │   ├── dashboard/          # Main dashboard
    │   │
    │   ├── tickets/            # Ticket management
    │   │   ├── page.tsx        # Ticket listing with filters
    │   │   ├── [id]/page.tsx   # Ticket detail view
    │   │   └── create/page.tsx # Multi-step ticket creation form
    │   │
    │   ├── departments/        # Department management (Admin CRUD)
    │   ├── reports/            # Report generation (dynamic)
    │   ├── analytics/          # Analytics & charts
    │   ├── knowledge-base/     # Knowledge base / FAQs
    │   ├── notifications/      # Notification center
    │   └── feedback/           # User feedback form
    │
    ├── components/             # Reusable UI components
    │   ├── layout/
    │   │   ├── MainLayout.tsx  # Shell: Sidebar + TopNav + Content
    │   │   ├── Sidebar.tsx     # Navigation sidebar
    │   │   └── TopNav.tsx      # Top navigation bar
    │   │
    │   └── ui/
    │       ├── KPICard.tsx     # Key Performance Indicator card
    │       └── PageHeader.tsx  # Page title + actions header
    │
    └── lib/                    # Shared utilities
        ├── supabase.ts        # Supabase client configuration
        ├── data.ts            # Type definitions
        ├── utils.ts           # Helper functions (format, cn, colors)
        └── export.ts          # PDF, CSV, Excel export utilities
```

---

# 4. System Architecture & Project Flow

## 4.1 Architectural Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER (Browser)                          │
├─────────────────────────────────────────────────────────────┤
│                    Next.js 16 App Router                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Client Components ("use client")          │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │  │
│  │  │ Dashboard│ │ Tickets  │ │Analytics │ │Settings│  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Layout Components (MainLayout)                │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │ Sidebar  │  │ TopNav   │  │  Page Content    │   │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           UI Component Library                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │  │
│  │  │ KPICard  │ │PageHeader│ │ Charts   │ │ Icons  │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                           │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     Supabase Client (@supabase/supabase-js)          │  │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────────────┐   │  │
│  │  │   Auth   │ │Database  │ │  Real-time        │   │  │
│  │  │  Client  │ │  Query   │ │  Subscriptions    │   │  │
│  │  └──────────┘ └──────────┘ └────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE CLOUD                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐ │
│  │PostgreSQL│ │ Auth     │ │ Storage  │ │ Real-time     │ │
│  │ Database │ │ (JWT)    │ │ (Files)  │ │ (WebSocket)   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Row Level Security (RLS)                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 4.2 Data Flow (Real-time)

```
User Action (Create Ticket / Update Status / Comment)
        │
        ▼
Supabase Client ──────────────────────────┐
        │                                   │
        ▼                                   ▼
Supabase PostgreSQL              Supabase Real-time
(INSERT/UPDATE/DELETE)           (WebSocket Broadcast)
        │                                   │
        ▼                                   ▼
Database Updated               All Connected Clients
        │                       Receive Update
        ▼                                   │
Audit Log Created                           ▼
        │                      ┌────────────────────────┐
        ▼                      │  User Dashboard        │
Notification Created          │  Department Dashboard   │
        │                      │  Manager Dashboard     │
        ▼                      │  Notification Panel    │
Push/Email/SMS Sent           └────────────────────────┘
                                      │
                                      ▼
                              UI Updates WITHOUT
                              Page Refresh
```

## 4.3 Authentication Flow

```
/ (Homepage)
    │
    ▼ (redirect)
/auth/login ──────────────────────────────────────────────┐
    │                                                      │
    ├── Email + Password ────────────────────────────────► │
    │                                                      │
    ├── Google Sign-In ──────────────────────────────────► │
    │                                                      │
    ├── "Don't have an account?" ───► /auth/register       │
    │                                   │                  │
    │                                   └──► /auth/login   │
    │                                                      │
    ├── "Forgot Password?" ────► /auth/forgot-password     │
    │                               │                      │
    │                               ├── Step 1: Enter Email│
    │                               ├── Step 2: Verify OTP │
    │                               ├── Step 3: New Password│
    │                               └── Step 4: Success ──►│
    │                                                      │
    └── Success Login ────► /dashboard                     │
                                                           │
/auth/logout ◄─────────────────────────────────────────────┘

NOTE: Microsoft Sign-In is NOT supported.
```

## 4.4 Ticket Assignment Workflow

```
User Creates Ticket
        │
        ▼
User Selects Department (e.g., "IT")
        │
        ▼
Ticket Saved in Database (Status: "Open")
        │
        ├──► Notification Generated: "New Ticket Created"
        │
        ▼
Ticket Auto-Assigned to Department Queue
        │
        ├──► Status Changes to "Assigned"
        │
        ├──► Notification: "New Ticket Assigned to Your Department"
        │
        ▼
Department Manager Dashboard
(Sees new ticket in department queue)
        │
        ▼
Manager Assigns to Support Executive
        │
        ├──► Status: "Assigned"
        │
        ├──► Notification: "Ticket Assigned to You"
        │
        ▼
Executive Begins Work
        │
        ├──► Status: "In Progress"
        │
        ▼
Executive Resolves Ticket
        │
        ├──► Status: "Pending User Response"
        │
        ├──► Notification: "Your Ticket Has Been Resolved"
        │
        ▼
User Reviews Resolution
        │
        ├── User Clicks "Close Ticket" ──► Status: "Closed"
        │
        └── No Response After 72 Hours ──► System Auto-Closes ──► Status: "Closed"
```

---

# 5. Block Diagram

```
┌────────────────── BLOCK DIAGRAM: CTMS ──────────────────┐
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │         AUTHENTICATION MODULE (Supabase Auth)    │   │
│  │  ┌─────────┐  ┌──────────┐  ┌────────────────┐   │   │
│  │  │  Login  │  │ Register │  │Forgot Password │   │   │
│  │  │ Email+  │  │ 6 Fields │  │  4-Step Flow   │   │   │
│  │  │Password │  │ Dynamic  │  │                │   │   │
│  │  │+ Google │  │ Dept Drop│  │                │   │   │
│  │  └─────────┘  └──────────┘  └────────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │         LAYOUT MODULE                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │   │
│  │  │ Sidebar  │  │ TopNav   │  │ Content Area  │  │   │
│  │  │ (Role-   │  │ (Search, │  │ (Page Output) │  │   │
│  │  │  Based)  │  │ Notif,   │  │               │  │   │
│  │  │          │  │ Profile) │  │               │  │   │
│  │  └──────────┘  └──────────┘  └───────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │         TICKET MANAGEMENT MODULE                 │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │   │
│  │  │ Create   │  │ View     │  │ Assign       │   │   │
│  │  │ Ticket   │  │ Tickets  │  │ Ticket       │   │   │
│  │  │ (4-step  │  │ (List +  │  │ (Auto to     │   │   │
│  │  │  wizard) │  │  Detail) │  │  Department) │   │   │
│  │  └──────────┘  └──────────┘  └──────────────┘   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │   │
│  │  │ Status   │  │ Close    │  │ Auto-Close   │   │   │
│  │  │ Workflow │  │ Ticket   │  │ (72 Hours)   │   │   │
│  │  │          │  │ (User)   │  │              │   │   │
│  │  └──────────┘  └──────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │         DEPARTMENT MODULE                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │   │
│  │  │ Admin    │  │ Dept     │  │ Dept         │   │   │
│  │  │ CRUD     │  │ Manager  │  │ Executive    │   │   │
│  │  │ (Add/    │  │ Dashboard│  │ Dashboard    │   │   │
│  │  │ Edit/    │  │ (Dept    │  │ (Assigned    │   │   │
│  │  │ Disable/ │  │  Tickets)│  │  Tickets)    │   │   │
│  │  │ Delete)  │  │          │  │              │   │   │
│  │  └──────────┘  └──────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│  ┌──────────┬──────────┬─┴──────┬──────────┬─────────┐  │
│  │          │          │        │          │          │  │
│  ▼          ▼          ▼        ▼          ▼          ▼  │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐ ┌────────┐ ┌───┐│
│ │USER  │ │TICKET│ │DEPART│ │REPORTS │ │ANALY-  │ │KNW││
│ │DASH  │ │ MGMT │ │MENTS │ │(Dynamic│ │TICS    │ │BASE││
│ │BOARD │ │      │ │(CRUD)│ │ from   │ │        │ │    ││
│ │      │ │      │ │      │ │  DB)   │ │        │ │    ││
│ └──────┘ └──────┘ └──────┘ └────────┘ └────────┘ └───┘│
│    │        │        │          │          │            │
│    ▼        ▼        ▼          ▼          ▼            │
│  ┌──────────────────────────────────────────────────┐   │
│  │         DATA LAYER (Supabase PostgreSQL)         │   │
│  │  ┌────────────────┐  ┌────────────────────────┐  │   │
│  │  │  11 Database   │  │  Real-time Updates     │  │   │
│  │  │  Tables        │  │  (WebSocket)           │  │   │
│  │  │  + RLS         │  │                        │  │   │
│  │  └────────────────┘  └────────────────────────┘  │   │
│  │  ┌────────────────┐  ┌────────────────────────┐  │   │
│  │  │ Audit Logs     │  │ Notifications          │  │   │
│  │  │ (Auto-track)   │  │ (Auto-generated)       │  │   │
│  │  └────────────────┘  └────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │         EXPORT MODULE                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │   │
│  │  │   PDF    │  │   CSV    │  │   Excel      │   │   │
│  │  │ (jsPDF)  │  │ (Built-in│  │   (xlsx)     │   │   │
│  │  │          │  │  Blob)   │  │              │   │   │
│  │  └──────────┘  └──────────┘  └──────────────┘   │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

# 6. Features & Modules

## 6.1 Authentication Module (Supabase Auth)

- **Login Page** (`/auth/login`): Email/password sign-in with "Remember Me" + Google Sign-In
- **Registration Page** (`/auth/register`): Single-step form with 6 fields (Full Name, Email, Mobile, Department, Password, Confirm Password). Department dropdown loads dynamically from the `departments` table.
- **Forgot Password** (`/auth/forgot-password`): Four-step flow (Email → OTP → New Password → Success)
- **Email Verification**: Required for account activation
- **Google OAuth**: Single Sign-On via Google account
- **Session Management**: JWT-based sessions with configurable timeout

### Registration Fields
| Field | Type | Required | Notes |
|---|---|---|---|
| Full Name | text | Yes | User's full display name |
| Email Address | email | Yes | Used for login and notifications |
| Mobile Number | tel | Yes | Contact number |
| Department | select | Yes | **Dynamically loaded from `departments` table** |
| Password | password | Yes | Minimum 8 characters, must include uppercase + numbers |
| Confirm Password | password | Yes | Must match password |

**Important**: Users cannot manually type department names. Departments must be selected from existing departments created by Admin.

## 6.2 Department Management Module (Admin CRUD)

### Admin Panel - Department Management (`/admin/departments`)

| Action | Description |
|---|---|
| **Add Department** | Create new department with name, manager, description |
| **Edit Department** | Modify department name, manager, description |
| **Disable Department** | Temporarily disable (hidden from dropdowns, keeps existing data) |
| **Delete Department** | Permanently remove (only if no tickets assigned) |

### Default Departments
1. IT
2. HR
3. Finance
4. Administration
5. Operations
6. Security
7. Facilities

**All departments are stored in the database.** Department dropdowns throughout the application load from the database dynamically.

## 6.3 Dashboard Module

### User Dashboard (`/dashboard`)
After login, users see their personal dashboard with:

**Statistics Cards:**
- Total Tickets (created by user)
- Open Tickets
- In Progress Tickets
- Resolved Tickets
- Closed Tickets

**Recent Tickets Table:**
| Column | Description |
|---|---|
| Ticket ID | Format: CMP-YYYY-XXXXXX |
| Title | Ticket title |
| Department | Assigned department |
| Priority | Low / Medium / High / Critical (color-coded) |
| Status | Current status (color-coded) |
| Created Date | Ticket creation date |

All newly created tickets must appear immediately (real-time).

### Department Dashboard (Manager View)
Each department manager sees only their department's tickets:

**Cards:**
- Open Tickets
- Assigned Tickets
- Pending Tickets
- Escalated Tickets
- Closed Tickets

**Access Control:** HR Department cannot see IT tickets. IT cannot see Finance tickets. Each department only sees their own tickets.

### Department Dashboard (Executive View)
Support executives see tickets assigned to them within their department.

## 6.4 Ticket Management Module

### Ticket Status Workflow

```
Open
  ↓ (Auto-assigned to department queue)
Assigned
  ↓ (Executive starts working)
In Progress
  ↓ (Executive marks resolved)
Pending User Response
  ↓ (User reviews and closes)
Closed

OR

Pending User Response
  ↓ (No response after 72 hours)
Closed (Auto-closed by system)
```

### Status Definitions
| Status | Description |
|---|---|
| **Open** | Ticket created, waiting for department assignment |
| **Assigned** | Ticket assigned to department/department queue |
| **In Progress** | Support executive is actively working on the ticket |
| **Pending User Response** | Resolution provided, awaiting user confirmation |
| **Resolved** | Support executive has resolved the issue |
| **Closed** | User confirmed resolution or auto-closed after 72 hours |

### Ticket Closure Workflow

```
Support Executive
        │
        ▼
Marks Ticket as "Resolved"
        │
        ├──► Status: "Pending User Response"
        │
        ├──► Notification: "Your Ticket Has Been Resolved"
        │
        ▼
User Reviews Resolution
        │
        ├──► User Clicks "Close Ticket"
        │        │
        │        ▼
        │    Status: "Closed"
        │
        └──► No Response After 72 Hours
                 │
                 ▼
             System Auto-Closes
                 │
                 ├──► Status: "Closed"
                 │
                 └──► Notification: "Ticket Auto-Closed (No Response)"
```

### Ticket Listing (`/tickets`)
- Searchable by title or ticket number
- Filterable by Status, Priority, Department
- Paginated table with 5 items per page

### Ticket Detail (`/tickets/[id]`)
- Full ticket view with description, comments, activity timeline
- Attachments section
- SLA countdown timer
- Quick actions: Update Status, Assign, Escalate, Close

### Ticket Creation (`/tickets/create`)
- 4-step wizard: Complaint Info → Description → Department → Review
- Department selection triggers auto-assignment
- Ticket number generated: CMP-YYYY-XXXXXX

## 6.5 Reports Module (Dynamic - From Database)

Reports are NOT static. Reports generate from live database data.

### Supported Reports
| Report | Description |
|---|---|
| **Ticket Report** | All tickets with filters (date, department, status, priority) |
| **Department Report** | Department-wise ticket counts, resolution times, performance |
| **User Report** | User activity, tickets created, tickets resolved |
| **Resolution Report** | Average resolution times, resolution rate trends |
| **SLA Report** | SLA compliance, breach rates, trends |

### Export Formats
All reports can be downloaded in:
- **PDF** (via jsPDF library - generates actual files)
- **CSV** (via browser Blob API - generates actual files)
- **Excel (.xlsx)** (via xlsx/SheetJS library - generates actual files)

**Export buttons generate actual downloadable files, not placeholders.**

## 6.6 Analytics Module (`/analytics`)
- Filter by date range, department, category
- Monthly Trends (Line chart)
- Department Comparison (Bar chart)
- Category Distribution (Pie chart)
- Priority Breakdown (Bar chart)

## 6.7 Knowledge Base (`/knowledge-base`)
- Search articles by keyword
- Filter by category: All, FAQs, Troubleshooting, Procedures, Policies, Training
- Popular Articles sidebar
- FAQ accordion section

## 6.8 Notifications Module (Auto-generated)

Notifications are generated automatically for the following events:

| Event | Notification |
|---|---|
| **Ticket Created** | "New ticket CMP-XXXX-XXXXXX has been created" |
| **Ticket Assigned** | "Ticket CMP-XXXX-XXXXXX has been assigned to you" |
| **Ticket Updated** | "Ticket CMP-XXXX-XXXXXX has been updated" |
| **Ticket Resolved** | "Ticket CMP-XXXX-XXXXXX has been resolved" |
| **Ticket Closed** | "Ticket CMP-XXXX-XXXXXX has been closed" |

### Notification Features
- Filter tabs: All, Unread, Mentions, System
- Mark as read / Mark all read
- Delete notifications
- Real-time updates (no page refresh)

## 6.9 Audit Logs (Auto-tracking)

### Tracked Events
| Event | Details |
|---|---|
| **Login** | User login with timestamp and IP |
| **Ticket Creation** | Who created, when, which ticket |
| **Ticket Assignment** | Who assigned, to whom, when |
| **Status Change** | From/to status, who changed, when |
| **Ticket Closure** | Who closed, when |
| **User Updates** | User profile changes, role changes |

### Stored Data
- User (who performed action)
- Action type
- Date/Time (timestamp)
- IP Address
- Module (Tickets, Users, Settings, etc.)
- Details (description of what happened)

## 6.10 Admin Module

### User Management (`/admin/users`)
- User table with search, role filter, pagination
- Actions: Edit, Delete, More

### Roles & Permissions (`/admin/roles`)
- 4 roles: Super Admin, Department Manager, Support Executive, User
- Permissions Matrix (14 permissions × 4 roles)

### SLA Management (`/admin/sla`)
- SLA rule cards by priority
- Compliance trend chart
- Active SLA violations list

### Audit Logs (`/admin/audit-logs`)
- Searchable, filterable log table
- Export functionality

### Settings (`/admin/settings`)
- General, Notifications, Security, System tabs

---

# 7. Database Design (Supabase PostgreSQL)

## 7.1 Database Tables (11 Tables)

### Table 1: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20),
  department_id UUID REFERENCES departments(id),
  designation VARCHAR(100),
  employee_id VARCHAR(50) UNIQUE,
  role VARCHAR(50) DEFAULT 'user',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table 2: `departments`
```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table 3: `tickets`
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  sub_category VARCHAR(100),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  department_id UUID REFERENCES departments(id),
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  sla_deadline TIMESTAMP WITH TIME ZONE,
  sla_breached BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  auto_close_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table 4: `ticket_comments`
```sql
CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table 5: `ticket_attachments`
```sql
CREATE TABLE ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table 6: `ticket_status_history`
```sql
CREATE TABLE ticket_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  old_status VARCHAR(30),
  new_status VARCHAR(30) NOT NULL,
  changed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table 7: `notifications`
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  related_ticket_id UUID REFERENCES tickets(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table 8: `reports`
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  generated_by UUID REFERENCES users(id),
  parameters JSONB,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table 9: `audit_logs`
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  module VARCHAR(50) NOT NULL,
  details TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table 10: `roles`
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Table 11: `user_roles`
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);
```

## 7.2 Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    users     │       │   departments    │       │    roles     │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id (PK)      │◄──────│ manager_id (FK)  │       │ id (PK)      │
│ email        │       │ id (PK)          │       │ name         │
│ full_name    │       │ name             │       │ description  │
│ mobile       │       │ description      │       │ permissions  │
│ department_id│───►   │ is_active        │       └──────┬───────┘
│ designation  │       └──────────────────┘              │
│ role         │                                         │
│ is_active    │       ┌──────────────────┐              │
└──────┬───────┘       │   user_roles     │              │
       │               ├──────────────────┤              │
       │               │ user_id (FK)     │◄─────────────┘
       │               │ role_id (FK)     │
       │               └──────────────────┘
       │
       │               ┌──────────────────┐
       │               │    tickets       │
       ├──────────────►├──────────────────┤
       │               │ id (PK)          │
       │               │ ticket_number    │
       │               │ title            │
       │               │ description      │
       │               │ priority         │
       │               │ status           │
       │               │ department_id(FK)│───►departments
       │               │ created_by (FK)  │───►users
       │               │ assigned_to (FK) │───►users
       │               │ sla_deadline     │
       │               └────────┬─────────┘
       │                        │
       │        ┌───────────────┼───────────────┐
       │        │               │               │
       │        ▼               ▼               ▼
       │  ┌──────────┐  ┌──────────┐  ┌──────────────┐
       │  │ comments │  │attachments│  │status_history│
       │  ├──────────┤  ├──────────┤  ├──────────────┤
       │  │ ticket_id│  │ ticket_id│  │ ticket_id    │
       │  │ user_id  │  │ file_url │  │ old_status   │
       │  │ content  │  │ file_name│  │ new_status   │
       │  └──────────┘  └──────────┘  │ changed_by   │
       │                               └──────────────┘
       │
       │        ┌──────────────────┐       ┌──────────────┐
       │        │  notifications   │       │  audit_logs  │
       │        ├──────────────────┤       ├──────────────┤
       └───────►│ user_id (FK)     │       │ user_id (FK) │
                │ related_ticket_id│──────►│ action       │
                │ title            │       │ module       │
                │ message          │       │ ip_address   │
                │ is_read          │       └──────────────┘
                └──────────────────┘
```

---

# 8. User Roles & Permissions

| Permission | Super Admin | Dept Manager | Support Exec | User |
|---|---|---|---|---|
| Create Tickets | ✓ | ✓ | ✓ | ✓ |
| View All Tickets | ✓ | ✓ (dept only) | ✓ (assigned) | ✗ |
| Edit Any Ticket | ✓ | ✓ (dept only) | ✗ | ✗ |
| Delete Tickets | ✓ | ✗ | ✗ | ✗ |
| Assign Tickets | ✓ | ✓ (within dept) | ✗ | ✗ |
| Manage Users | ✓ | ✗ | ✗ | ✗ |
| Manage Departments | ✓ | ✗ | ✗ | ✗ |
| View Users | ✓ | ✓ (dept only) | ✗ | ✗ |
| Manage Roles | ✓ | ✗ | ✗ | ✗ |
| View Audit Logs | ✓ | ✓ | ✗ | ✗ |
| Export Data | ✓ | ✓ | ✗ | ✗ |
| View Reports | ✓ | ✓ | ✓ | ✗ |
| Manage SLA Rules | ✓ | ✗ | ✗ | ✗ |
| System Settings | ✓ | ✗ | ✗ | ✗ |
| View Dashboard | ✓ | ✓ | ✓ | ✓ |
| Close Own Tickets | ✗ | ✗ | ✗ | ✓ |

---

# 9. SLA Rules

| Priority | Time Limit | Escalation After | Escalation Trigger |
|---|---|---|---|
| **Critical** | 2 hours | 1 hour | Auto-escalate to Department Manager |
| **High** | 4 hours | 2 hours | Notify Department Manager |
| **Medium** | 8 hours | 4 hours | Send reminder notification |
| **Low** | 24 hours | 12 hours | Send reminder notification |

**Auto-Close Rule:** Tickets in "Pending User Response" status for **72 hours** are automatically closed by the system.

---

# 10. Complete Usage Guide

## 10.1 Getting Started

### Prerequisites
- **Node.js** (v18 or later)
- **npm** (comes with Node.js)
- **Supabase Account** (https://supabase.com)

### How to Run the Application

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Access URLs
- **Development**: http://localhost:3000
- **Production**: (configured via deployment)

## 10.2 Authentication

### Login
1. Navigate to `/auth/login`
2. Enter your email address and password
3. (Optional) Check "Remember Me" to stay signed in
4. Click **Sign In**
5. Alternatively, sign in with **Google** (Microsoft is NOT supported)

### Register a New Account
1. Click "Sign Up" on the login page or go to `/auth/register`
2. Fill in all 6 fields:
   - **Full Name** (required)
   - **Email Address** (required - used for login)
   - **Mobile Number** (required)
   - **Department** (required - select from dropdown loaded from database)
   - **Password** (required - minimum 8 characters, must include uppercase + numbers)
   - **Confirm Password** (required - must match password)
3. Click **Create Account**
4. Verify your email address
5. You will be redirected to the login page to sign in

### Forgot Password
1. Click "Forgot Password?" on the login page or go to `/auth/forgot-password`
2. **Step 1**: Enter your email address → Click **Send Verification Code**
3. **Step 2**: Enter the 6-digit OTP received → Click **Verify Code**
4. **Step 3**: Enter new password and confirm → Click **Reset Password**
5. **Step 4**: Success screen → Click **Sign In** to log in with new password

## 10.3 Navigating the Application

### Sidebar Navigation
The sidebar on the left provides access to all modules (role-based):
- **Dashboard**: Overview and KPIs
- **Tickets**: My Tickets, Open, In Progress, Escalated, Resolved, Closed, Create Complaint
- **Departments**: Department-wise performance
- **Reports**: Generate and export reports (dynamic from database)
- **Analytics**: Charts and data analysis
- **Knowledge Base**: Articles, FAQs, guides
- **Notifications**: Alerts and updates
- **Audit Logs**: System activity tracking
- **Administration**: User Management, Departments, Roles & Permissions, SLA Management, Audit Logs, Settings

### Top Navigation Bar
- **Search Bar**: Search tickets and users globally
- **Bell Icon**: View recent notifications (with unread count badge)
- **Profile Dropdown**: Profile, Settings, Sign Out

## 10.4 User Dashboard Usage

After login, users see their personal dashboard:

1. **Statistics Cards** (top row): Total Tickets, Open, In Progress, Resolved, Closed
2. **Recent Tickets Table**: Shows Ticket ID, Title, Department, Priority, Status, Created Date
3. All newly created tickets appear immediately (real-time updates)

## 10.5 Department Dashboard Usage

### Manager View
1. Navigate to **Dashboard** after department manager login
2. View department-specific cards: Open, Assigned, Pending, Escalated, Closed
3. See only tickets belonging to your department
4. Ticket list updates automatically (real-time)

### Executive View
1. Navigate to **Dashboard** after support executive login
2. View tickets assigned to you within your department
3. Update ticket status and add comments
4. Real-time updates without page refresh

## 10.6 Managing Tickets

### Creating a New Ticket
1. Click **Create Complaint** button or go to `/tickets/create`
2. **Step 1 - Complaint Info**:
   - Enter a descriptive **Title**
   - Select **Category** (Email, Hardware, etc.)
   - Select **Sub-Category** (appears after category selection)
   - Choose **Priority Level** (Low, Medium, High, Critical)
   - Click **Next**
3. **Step 2 - Description**:
   - Write a detailed **Description** (minimum 10 characters)
   - **Attach files** by drag-and-drop or click to upload (PDF, DOC, JPG, PNG up to 10MB)
   - Click **Next**
4. **Step 3 - Department**:
   - Select the appropriate **Department** from the grid (loads from database)
   - Click **Next**
5. **Step 4 - Review**:
   - Review all entered information
   - Click **Submit Complaint**
6. A success screen shows the ticket number (CMP-YYYY-XXXXXX)
   - Ticket is auto-assigned to the selected department queue
   - Real-time: User Dashboard, Department Dashboard, and Notifications update immediately

### Viewing Ticket Details
1. Click the **eye icon** on any ticket row in the Tickets table
2. The detail page shows:
   - **Header**: Title, ID, Created date, Status badge, Priority badge
   - **Description**: Full ticket description
   - **Details Grid**: Category, Department, Created By, Assigned To
   - **Tabs**: Comments (with Internal Note toggle) and Activity Timeline
   - **Attachments**: Uploaded files with download
   - **SLA Countdown**: Time remaining with warning if at risk
   - **Quick Actions**: Update Status, Assign, Escalate, Close

### Updating Ticket Status
1. Open a ticket detail page
2. Click **Update Status**
3. Select new status from the workflow
4. Add notes (optional)
5. Status changes are reflected in real-time across all dashboards

### Closing a Ticket (User Action)
1. Open a ticket detail page
2. Click **Close Ticket** (available when status is "Resolved")
3. Confirm the closure
4. Status changes to "Closed"
5. Notification generated

### Auto-Close (System Action)
- If user does not respond to a "Resolved" ticket within **72 hours**, the system automatically closes the ticket
- Notification: "Ticket auto-closed due to no response"

### Commenting on Tickets
1. Open a ticket detail page
2. Go to the **Comments** tab
3. (Optional) Check **"Internal note"** for internal-only comments
4. Type your message in the text box
5. Press **Enter** or click the **Send** button

## 10.7 Department Management (Admin)

1. Go to **Administration → Departments** (`/admin/departments`)
2. **View Departments**: See all departments with manager, ticket count, status
3. **Add Department**: Click "Add Department" → Enter name, description, select manager
4. **Edit Department**: Click edit icon → Modify department details
5. **Disable Department**: Toggle to disable (hides from registration dropdowns)
6. **Delete Department**: Click delete (only if no tickets assigned)

## 10.8 Reports Module (Dynamic)

1. Navigate to **Reports** in the sidebar
2. Select report type:
   - **Ticket Report**: Filter by date, department, status, priority
   - **Department Report**: Department-wise metrics
   - **User Report**: User activity and performance
   - **Resolution Report**: Resolution times and rates
   - **SLA Report**: SLA compliance and breaches
3. Select **From Date** and **To Date**
4. Click **Generate Report**
5. Report generates from live database data
6. Click **Export** to download:
   - **PDF**: Generates actual PDF file (via jsPDF)
   - **CSV**: Generates actual CSV file
   - **Excel**: Generates actual .xlsx file (via SheetJS)

## 10.9 Analytics Module

1. Navigate to **Analytics** in the sidebar
2. Use filters: Date Range, Department, Category
3. View four chart sections (all from live database data):
   - Monthly Trends (line chart)
   - Department Comparison (bar chart)
   - Category Distribution (pie chart)
   - Priority Breakdown (bar chart)

## 10.10 Notifications

1. Navigate to **Notifications** in the sidebar
2. Use filter tabs: All, Unread, Mentions, System
3. Each notification shows: icon by type, title, message, timestamp
4. **Mark as Read**: Click the check icon on individual notifications
5. **Mark All Read**: Click the "Mark All Read" button
6. **Delete**: Click the trash icon to remove individual notifications
7. Notifications update in real-time

## 10.11 Audit Logs

1. Go to **Administration → Audit Logs** (`/admin/audit-logs`)
2. **Search** logs by user name or details
3. **Filters**: Action type, Module, Date range
4. Table shows: Timestamp, User, Action badge, Module badge, Details, IP Address
5. Click **Export** to download logs

## 10.12 Administration

### User Management
1. Go to **Administration → User Management** (`/admin/users`)
2. Search and filter users
3. Actions: Edit, Delete, More

### Roles & Permissions
1. Go to **Administration → Roles & Permissions** (`/admin/roles`)
2. View role cards and permissions matrix

### SLA Management
1. Go to **Administration → SLA Management** (`/admin/sla`)
2. View SLA rules, compliance trend, active violations

### Settings
1. Go to **Administration → Settings** (`/admin/settings`)
2. Configure General, Notifications, Security, System settings

---

# 11. Real-Time Behavior

## Real-time Update Flow

When a ticket is created or updated:

```
1. User Creates Ticket
        │
        ├──► User Dashboard Updates (real-time)
        │
        ├──► Department Dashboard Updates (real-time)
        │
        ├──► Notification Generated (real-time)
        │
        ├──► Manager Sees Ticket (real-time)
        │
        ├──► Executive Assigned (real-time)
        │
        └──► Status Updates Reflected Everywhere (real-time)
```

**All updates happen WITHOUT page refresh.** Supabase Real-time (WebSocket) handles live data synchronization.

## Real-time Features
- Ticket creation appears instantly in all dashboards
- Status changes reflect immediately across all views
- New comments appear without refresh
- Notification count updates live
- SLA countdown updates in real-time

---

# 12. Running the Project

## Development
```bash
npm run dev
```
The development server starts at `http://localhost:3000` with hot module replacement.

## Build
```bash
npm run build
```
Creates an optimized production build in the `.next/` folder.

## Production
```bash
npm start
```
Starts the production server (run `build` first).

## Lint
```bash
npm run lint
```
Runs ESLint to check for code quality issues.

---

# 13. Deployment

## Recommended: Vercel
1. Push the code to a Git repository
2. Import the project in Vercel
3. Add environment variables (Supabase URL, Anon Key)
4. Deploy with a single click

## Supabase Setup
1. Create a Supabase project at https://supabase.com
2. Run the SQL migrations to create all 11 tables
3. Enable Google OAuth in Supabase Auth settings
4. Enable Real-time for required tables
5. Configure Row Level Security policies
6. Copy the Project URL and Anon Key to `.env.local`

---

# 14. Production Ready Requirements

## Checklist

| Requirement | Status |
|---|---|
| Fully functional authentication (Email + Password + Google) | ✓ |
| Email verification | ✓ |
| Department-based access control | ✓ |
| Real-time ticket updates | ✓ |
| Working PDF export (actual files) | ✓ |
| Working CSV export (actual files) | ✓ |
| Working Excel export (actual files) | ✓ |
| Notification system (auto-generated) | ✓ |
| Audit logging (auto-tracking) | ✓ |
| Responsive design | ✓ |
| Secure database integration (Supabase PostgreSQL) | ✓ |
| Google Sign-In | ✓ |
| Role-based permissions | ✓ |
| Automatic ticket workflow | ✓ |
| Department management (Admin CRUD) | ✓ |
| Dynamic reports from database | ✓ |
| Auto-close tickets after 72 hours | ✓ |
| Row Level Security (RLS) | ✓ |
| Real-time WebSocket updates | ✓ |

---

# 15. Future Enhancements

- **Mobile App**: React Native or Flutter mobile application
- **Advanced Search**: Elasticsearch integration for full-text search
- **Multi-language Support**: i18n for internationalization
- **Dark Mode**: Theme toggle functionality
- **Performance Optimization**: Server-side caching, CDN integration, lazy loading
- **Email Integration**: Automated email notifications for ticket updates
- **File Storage**: Supabase Storage for attachments (already configured)

---

*Document generated on: June 1, 2026*
*CTMS - Complaint Ticket Management System v1.0.0*
