# 🎉 CloudNerves Meal Request System - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Authentication & Authorization](#authentication--authorization)
8. [Key Features](#key-features)
9. [User Workflows](#user-workflows)
10. [Setup & Installation](#setup--installation)
11. [Testing Guide](#testing-guide)
12. [Troubleshooting](#troubleshooting)
13. [Future Enhancements](#future-enhancements)

---

## Project Overview

**CloudNerves Meal Request System** is a web-based meal request management platform that allows students to request meals (breakfast, lunch, dinner) and enables managers to approve or deny those requests. The system includes role-based dashboards for students, managers, and administrators.

### Key Objectives
- ✅ Students request meals with automatic token generation
- ✅ Managers approve/deny requests from a centralized dashboard
- ✅ Prevent duplicate meal requests (1 per meal type per day)
- ✅ Maintain approval workflow (onboarding before first request)
- ✅ Block problematic students from making requests
- ✅ Beautiful, responsive UI with DaisyUI components

### Current Status
🟢 **FULLY IMPLEMENTED** - All core features working and tested

---

## Technology Stack

### Frontend
- **React 19.2.0** - UI library with hooks (useState, useEffect, useCallback)
- **Next.js 16.0.3** - React framework with App Router and API Routes
- **Tailwind CSS 4** - Utility-first CSS framework
- **DaisyUI 4.11.1** - Component library on top of Tailwind
- **TypeScript** - Type safety for React components
- **JavaScript** - For API routes and utilities

### Backend
- **Next.js API Routes** - Serverless backend endpoints
- **Node.js** - JavaScript runtime

### Database
- **MongoDB 7.0.0** - NoSQL database for storing users and meal requests
- **MongoDB Connection Pooling** - For performance optimization

### Authentication
- **Firebase 11.0.1** - Authentication service
  - Email/password signup and login
  - Google Sign-In integration
  - UID generation for users

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **npm** - Package manager

---

## System Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER SIGNUP                                  │
├─────────────────────────────────────────────────────────────────────┤
│ 1. User fills signup form (email, password)                         │
│ 2. Firebase creates user account                                    │
│ 3. API creates MongoDB user document with:                          │
│    - role: 'student' (default)                                      │
│    - isOnboarded: false (pending manager approval)                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    MANAGER APPROVAL                                  │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Manager views pending onboarding requests                        │
│ 2. Manager can approve or reject student                            │
│ 3. If approved: isOnboarded = true                                  │
│ 4. If rejected: User document deleted                               │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  MEAL REQUEST SUBMISSION                             │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Student clicks meal button (Breakfast/Lunch/Dinner)              │
│ 2. System validates:                                                │
│    ✓ Student is onboarded (isOnboarded = true)                      │
│    ✓ Student is not blocked (isBlocked = false)                     │
│    ✓ No duplicate request for same meal type today                  │
│ 3. Generates unique token: B-DDMMYY-XXXX-NN                         │
│ 4. Creates meal request with status: 'pending'                      │
│ 5. Returns token to student                                         │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                 MANAGER REVIEW & ACTION                              │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Manager sees pending requests on dashboard                       │
│ 2. Manager can:                                                     │
│    • Approve (Accept): status = 'accepted'                          │
│    • Deny (Reject): status = 'denied'                               │
│    • Block: Mark student as isBlocked = true (all future requests)  │
│    • Delete: Remove the request                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Request Flow Diagram

```
Browser (React)
    ↓
Next.js Page/Component
    ↓
API Route Handler (/api/*)
    ↓
MongoDB Database
```

### Directory Structure

```
cloudnerves/
├── app/
│   ├── api/
│   │   ├── users/
│   │   │   ├── route.js              (POST - create user, GET - future)
│   │   │   └── [uid]/route.js        (GET/PUT/DELETE user)
│   │   ├── meal-requests/
│   │   │   ├── route.js              (POST/GET meal requests)
│   │   │   ├── [requestId]/route.js  (GET/PUT/DELETE single request)
│   │   │   └── student-block/
│   │   │       └── [studentId]/route.js (PUT/GET block status)
│   │   └── onboarding/
│   │       └── route.js              (GET/PUT/DELETE - manager approvals)
│   ├── dashboard/
│   │   └── page.tsx                  (Main dashboard router)
│   ├── login/
│   │   └── page.tsx                  (Login page)
│   ├── signup/
│   │   └── page.tsx                  (Signup page)
│   ├── layout.tsx                    (App layout wrapper)
│   ├── page.tsx                      (Home page)
│   └── globals.css                   (Global styles)
├── components/
│   ├── DashboardPage.jsx             (Role-based dashboard router)
│   ├── StudentMealRequest.jsx        (Student meal request form)
│   ├── ManagerRequestsTable.jsx      (Manager dashboard with requests)
│   ├── PendingRequestCard.jsx        (Individual request card)
│   ├── BlockStudentModal.jsx         (Confirmation modal for blocking)
│   ├── BlockedStudentsSection.jsx    (Display blocked students)
│   ├── PendingOnboardingSection.jsx  (Manager approvals for new students)
│   ├── AdminPanel.jsx                (Admin dashboard)
│   ├── LoginPage.tsx                 (Login form)
│   └── SignupPage.tsx                (Signup form)
├── lib/
│   ├── auth-context.tsx              (Firebase auth provider)
│   ├── firebase.ts                   (Firebase config)
│   ├── mongodb.js                    (MongoDB connection)
│   └── useGetCurrentUser.js          (Firebase-MongoDB hook)
├── public/                           (Static assets)
├── package.json                      (Dependencies)
├── tsconfig.json                     (TypeScript config)
├── tailwind.config.ts                (Tailwind CSS config)
├── next.config.ts                    (Next.js config)
└── eslint.config.mjs                 (ESLint config)
```

---

## Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  uid: String,                    // Firebase UID (unique)
  email: String,                  // User email
  displayName: String,            // Full name
  photoURL: String,               // Profile picture URL
  phoneNumber: String,            // Contact number
  role: String,                   // 'student' | 'manager' | 'admin'
  isOnboarded: Boolean,           // false = pending approval, true = approved
  isBlocked: Boolean,             // true = blocked from requesting
  createdAt: Date,                // Account creation time
  updatedAt: Date,                // Last update time
  approvedAt: Date                // When manager approved (optional)
}
```

### Meal Requests Collection

```javascript
{
  _id: ObjectId,
  studentId: String,              // Firebase UID of student
  studentName: String,            // Student's display name
  studentEmail: String,           // Student's email
  mealType: String,               // 'breakfast' | 'lunch' | 'dinner'
  tokenId: String,                // Unique token (B-DDMMYY-XXXX-NN)
  status: String,                 // 'pending' | 'accepted' | 'denied'
  isBlocked: Boolean,             // true if student is blocked
  requestedAt: Date,              // Request creation time
  updatedAt: Date                 // Last status update time
}
```

### Token Format Explanation

**Format**: `PREFIX-DDMMYY-STUDENTID-RANDOM`

Example: `B-210225-f7a2-84`

- **PREFIX** (1 char): Meal type
  - `B` = Breakfast
  - `L` = Lunch
  - `D` = Dinner

- **DDMMYY** (6 chars): Today's date
  - `21` = Day
  - `02` = Month
  - `25` = Year

- **STUDENTID** (4 chars): Last 4 characters of student's Firebase UID

- **RANDOM** (2 digits): Random number 00-99 for uniqueness

---

## API Endpoints

### User Management

#### POST /api/users
Create a new user account
```javascript
Request:
{
  uid: "user123abc",
  email: "student@example.com",
  displayName: "John Doe",
  photoURL: "https://...",
  phoneNumber: "+1234567890"
}

Response (201 Created):
{
  _id: ObjectId,
  uid: "user123abc",
  email: "student@example.com",
  displayName: "John Doe",
  role: "student",            // Default
  isOnboarded: false,         // Default
  createdAt: "2025-02-21T10:00:00Z",
  updatedAt: "2025-02-21T10:00:00Z"
}

Error Responses:
- 400: Missing uid or email
- 500: Database error
```

#### GET /api/users/[uid]
Fetch specific user by UID
```javascript
Response (200 OK):
{
  _id: ObjectId,
  uid: "user123abc",
  email: "student@example.com",
  role: "student",
  isOnboarded: true,
  ...
}

Error Responses:
- 404: User not found
- 500: Database error
```

#### PUT /api/users/[uid]
Update user information
```javascript
Request:
{
  displayName: "Jane Doe",
  role: "manager"
}

Response (200 OK):
{
  _id: ObjectId,
  uid: "user123abc",
  displayName: "Jane Doe",
  role: "manager",
  ...
}

Error Responses:
- 404: User not found
- 500: Database error
```

#### DELETE /api/users/[uid]
Delete a user account
```javascript
Response (200 OK):
{ message: "User deleted successfully" }

Error Responses:
- 404: User not found
- 500: Database error
```

### Meal Requests

#### POST /api/meal-requests
Create a new meal request
```javascript
Request:
{
  studentId: "user123abc",
  studentName: "John Doe",
  studentEmail: "john@example.com",
  mealType: "breakfast"           // or "lunch", "dinner"
}

Response (201 Created):
{
  _id: ObjectId,
  studentId: "user123abc",
  studentName: "John Doe",
  studentEmail: "john@example.com",
  mealType: "breakfast",
  tokenId: "B-210225-f7a2-84",
  status: "pending",
  isBlocked: false,
  requestedAt: "2025-02-21T08:30:00Z",
  updatedAt: "2025-02-21T08:30:00Z"
}

Error Responses:
- 400: Missing required fields or invalid meal type
- 403: Student not onboarded (pending approval)
- 403: Student is blocked from making requests
- 409: Duplicate request (already requested this meal today)
- 500: Database error
```

#### GET /api/meal-requests
Fetch all meal requests with optional filtering
```javascript
Query Parameters:
- status: "pending" | "accepted" | "denied"
- studentId: "user123abc"
- mealType: "breakfast" | "lunch" | "dinner"

Response (200 OK):
[
  {
    _id: ObjectId,
    studentId: "user123abc",
    mealType: "breakfast",
    tokenId: "B-210225-f7a2-84",
    status: "pending",
    requestedAt: "2025-02-21T08:30:00Z",
    ...
  },
  ...
]

Example Queries:
GET /api/meal-requests?status=pending
GET /api/meal-requests?studentId=user123abc
GET /api/meal-requests?mealType=breakfast
```

#### GET /api/meal-requests/[requestId]
Fetch specific request
```javascript
Response (200 OK):
{
  _id: ObjectId,
  studentId: "user123abc",
  ...
}

Error Responses:
- 404: Request not found
- 500: Database error
```

#### PUT /api/meal-requests/[requestId]
Update request status
```javascript
Request:
{
  status: "accepted"    // or "denied"
}

Response (200 OK):
{
  _id: ObjectId,
  status: "accepted",
  updatedAt: "2025-02-21T10:15:00Z",
  ...
}

Error Responses:
- 404: Request not found
- 400: Invalid status
- 500: Database error
```

#### DELETE /api/meal-requests/[requestId]
Delete a meal request
```javascript
Response (200 OK):
{ message: "Request deleted successfully" }

Error Responses:
- 404: Request not found
- 500: Database error
```

### Student Blocking

#### PUT /api/meal-requests/student-block/[studentId]
Block/Unblock a student
```javascript
Request:
{
  isBlocked: true     // or false to unblock
}

Response (200 OK):
{
  modifiedCount: 5,
  studentId: "user123abc",
  isBlocked: true,
  totalRequests: 5,
  requests: [...]
}

Error Responses:
- 500: Database error
```

#### GET /api/meal-requests/student-block/[studentId]
Get student's block status
```javascript
Response (200 OK):
{
  studentId: "user123abc",
  isBlocked: true,
  totalRequests: 5,
  requests: [...]
}
```

### Onboarding Management

#### GET /api/onboarding
Fetch all pending onboarding requests
```javascript
Response (200 OK):
[
  {
    _id: ObjectId,
    uid: "user123abc",
    email: "newstudent@example.com",
    displayName: "New Student",
    isOnboarded: false,
    createdAt: "2025-02-21T09:00:00Z",
    ...
  },
  ...
]
```

#### PUT /api/onboarding
Approve or reject student onboarding
```javascript
Request:
{
  uid: "user123abc",
  action: "approve"     // or "reject"
}

Response (200 OK) - Approve:
{
  message: "Student approved",
  user: {
    uid: "user123abc",
    isOnboarded: true,
    approvedAt: "2025-02-21T10:30:00Z",
    ...
  }
}

Response (200 OK) - Reject:
{
  message: "Student rejected and deleted"
}

Error Responses:
- 400: Invalid action or missing uid
- 404: User not found
- 500: Database error
```

#### DELETE /api/onboarding
Delete pending onboarding request
```javascript
Request:
{
  uid: "user123abc"
}

Response (200 OK):
{ message: "Onboarding request deleted" }

Error Responses:
- 404: User not found
- 500: Database error
```

---

## Frontend Components

### DashboardPage.jsx
**Purpose**: Main role-based dashboard router

**Features**:
- Detects user role from MongoDB
- Routes to appropriate dashboard
- Handles loading states
- Fetches user role from `/api/users/[uid]`

**Props**: None (uses auth context)

**State**:
```javascript
userRole: 'student' | 'manager' | 'admin' | null
loading: Boolean
```

**Role-Based Rendering**:
- **student**: StudentMealRequest component
- **manager**: ManagerRequestsTable component
- **admin**: AdminPanel component
- **null**: Error message ("User role not found")

---

### StudentMealRequest.jsx
**Purpose**: Student interface for requesting meals

**Features**:
- 3 meal buttons (Breakfast 🌅, Lunch 🍽️, Dinner 🌙)
- Unique token generation on request
- Prevents duplicate requests (one per meal per day)
- Success/error messages
- Real-time request history display
- Handles onboarding and blocking errors

**Props**:
```javascript
user: {
  uid: String,
  email: String
}
```

**State**:
```javascript
requests: Array,
loading: Object (per button),
error: String,
successMessage: String
```

**Button States**:
- Default: "🌅 Breakfast"
- Loading: "⏳ Loading..."
- Success: "✓ Requested"
- Error: "❌ Error" (red)
- Blocked: "🚫 Blocked"
- Pending Approval: "⏳ Pending"

---

### ManagerRequestsTable.jsx
**Purpose**: Manager dashboard for reviewing and approving requests

**Features**:
- Stats overview (Total, Pending, Approved, Denied)
- Request queue with card-based layout
- Real-time auto-refresh (5 seconds)
- Block/Unblock students
- Delete requests
- Approve/Deny requests
- View all blocked students
- View pending onboarding approvals

**Components Used**:
- PendingRequestCard (for each request)
- BlockStudentModal (confirmation)
- BlockedStudentsSection (blocked list)
- PendingOnboardingSection (new student approvals)

**State**:
```javascript
requests: Array,
loading: Boolean,
blockedStudents: Array,
refreshTrigger: Number,
alert: {
  show: Boolean,
  message: String,
  type: 'success' | 'error'
}
```

---

### PendingRequestCard.jsx
**Purpose**: Display individual meal request as a card

**Features**:
- Student name and email
- Meal type with emoji
- Token display
- Request time
- Three action buttons:
  - ✓ OK (approve)
  - 🗑️ Delete (dismiss)
  - 🚫 Block (block student)
- Loading states with spinners
- DaisyUI gradient styling

**Props**:
```javascript
request: {
  _id: ObjectId,
  studentId: String,
  studentName: String,
  studentEmail: String,
  mealType: String,
  tokenId: String,
  requestedAt: Date
},
onAccept: Function,
onDelete: Function,
onBlock: Function,
loading: Boolean
```

---

### BlockStudentModal.jsx
**Purpose**: Confirmation modal before blocking a student

**Features**:
- Student details display
- Warning message
- Confirm/Cancel buttons
- Loading state during submission

**Props**:
```javascript
isOpen: Boolean,
studentId: String,
studentName: String,
studentEmail: String,
onConfirm: Function,
onCancel: Function,
loading: Boolean
```

---

### BlockedStudentsSection.jsx
**Purpose**: Display all blocked students with unblock capability

**Features**:
- Fetches blocked students from database
- Shows: name, email, block date, request count
- Unblock button for each student
- Empty state message
- Auto-refresh when trigger changes

**Props**:
```javascript
onUnblock: Function,
refreshTrigger: Number
```

---

### PendingOnboardingSection.jsx
**Purpose**: Manager interface to approve/reject new students

**Features**:
- Displays all pending (non-onboarded) students
- Shows: name, email, signup date
- Two action buttons:
  - ✓ Approve (sets isOnboarded: true)
  - ✗ Reject (deletes user)
- Loading states
- Empty state when no pending students
- Auto-refresh on new approvals

**Props**:
```javascript
onApprove: Function,
onReject: Function,
refreshTrigger: Number
```

---

### AdminPanel.jsx
**Purpose**: Admin control panel for full system management

**Features**:
- Two tabs: Requests & Users
- View all requests with filtering
- View all users with deletion capability
- System statistics
- Full access to all data

**State**:
```javascript
requests: Array,
users: Array,
activeTab: 'requests' | 'users',
loading: Boolean
```

---

### LoginPage.tsx & SignupPage.tsx
**Purpose**: Authentication pages

**Features**:
- Email/password authentication
- Google Sign-In integration
- Form validation
- Error handling
- Beautiful DaisyUI styling

---

## Authentication & Authorization

### Firebase Authentication Flow

1. **Signup**:
   - User provides email and password
   - Firebase creates user account
   - Auth-context calls POST `/api/users` to create MongoDB document
   - New user gets:
     - `role: 'student'` (default)
     - `isOnboarded: false` (pending approval)

2. **Login**:
   - User provides email and password
   - Firebase authenticates
   - Dashboard fetches user from MongoDB using UID
   - Role-based routing applied

3. **Role-Based Access**:
   - **Student**: Can request meals (if onboarded and not blocked)
   - **Manager**: Can approve/deny requests, manage onboarding, block students
   - **Admin**: Full access to all features

### Authorization Checks

#### Meal Request Creation
```
1. Check if student is onboarded (isOnboarded === true)
   → If false: Return 403 "Pending manager approval"

2. Check if student is blocked (isBlocked === true)
   → If true: Return 403 "You have been blocked"

3. Check for duplicate request (same meal type, same day)
   → If exists: Return 409 "Duplicate request"

4. If all checks pass: Create meal request
```

---

## Key Features

### 1. Unique Token Generation
**Objective**: Generate unique, memorable tokens for each meal request

**Implementation**:
- Format: `PREFIX-DDMMYY-STUDENTID-RANDOM`
- PREFIX: B (breakfast), L (lunch), D (dinner)
- DDMMYY: Today's date
- STUDENTID: Last 4 chars of Firebase UID
- RANDOM: 2-digit random number

**Uniqueness Guarantee**:
- Meal type prevents duplicates (1 per meal type per day)
- Date ensures daily reset
- Student ID ensures different students have different tokens
- Random suffix prevents collision

---

### 2. Student Onboarding System
**Objective**: Prevent new students from making requests until manager approves

**Flow**:
1. Student signs up
   - Firebase user created
   - MongoDB user created with `isOnboarded: false`

2. Manager views pending approvals
   - GET `/api/onboarding` shows all non-onboarded students

3. Manager approves or rejects
   - Approve: `isOnboarded = true`, student can now request
   - Reject: User deleted, student cannot login

4. Student attempts meal request
   - System checks `isOnboarded === true`
   - If false: Returns 403 error "Pending manager approval"

---

### 3. Student Blocking
**Objective**: Allow managers to block problematic students

**Features**:
- Manager clicks "Block" button on request card
- Confirmation modal asks for confirmation
- All student's requests marked as `isBlocked: true`
- Blocked student gets 403 error when trying to request
- Manager can view all blocked students
- Manager can unblock students

---

### 4. Duplicate Prevention
**Objective**: Prevent students from requesting the same meal twice in one day

**Implementation**:
- When creating meal request, check for existing request:
  ```javascript
  {
    studentId,
    mealType,
    requestedAt: { $gte: today_00:00:00 }
  }
  ```
- Check includes ALL requests regardless of status
- If exists: Return 409 "Conflict"

---

### 5. Real-Time Dashboard Updates
**Objective**: Keep manager dashboard updated without manual refresh

**Implementation**:
- Auto-refresh every 5 seconds
- Fetches all pending requests
- Updates stats (Total, Pending, Approved, Denied)
- Smooth UI updates

---

### 6. Role-Based Dashboards
**Objective**: Show appropriate interface for each user role

**Implementations**:
- **Student Dashboard**: Request form, history, tokens
- **Manager Dashboard**: Request queue, approval, blocking, onboarding
- **Admin Dashboard**: Full system control, user management

---

## User Workflows

### Student Workflow

#### Initial Signup
```
1. Student visits /signup
2. Fills in email and password
3. Clicks "Sign Up"
4. Firebase creates account
5. MongoDB creates user with isOnboarded: false
6. Redirected to dashboard
7. Dashboard shows: "Waiting for manager approval"
```

#### Waiting for Approval
```
1. Student sees dashboard but cannot request
2. Buttons are disabled or show "Pending Approval"
3. Sees message: "Your account is pending manager approval"
4. Manager approves (isOnboarded set to true)
```

#### Making a Request
```
1. Student clicks "Breakfast" button
2. System validates:
   - Student is onboarded ✓
   - Student is not blocked ✓
   - No duplicate breakfast request today ✓
3. Generates token: B-210225-f7a2-84
4. Creates meal request with status: 'pending'
5. Displays token and "✓ Requested" message
6. Button remains highlighted
```

#### Viewing Request Status
```
1. Student sees request history below
2. Shows: Token, Meal Type, Time, Status
3. Auto-updates when manager approves/denies
4. Success: Status changes to "accepted" ✓
5. Failure: Status changes to "denied" ✗
```

---

### Manager Workflow

#### Viewing Dashboard
```
1. Manager logs in with manager account
2. Dashboard shows:
   - Stats (Total, Pending, Approved, Denied)
   - Pending onboarding requests section
   - Pending meal requests cards
   - Blocked students section
3. Auto-refreshes every 5 seconds
```

#### Approving New Students
```
1. Manager sees "Pending Onboarding" section
2. Lists all students with isOnboarded: false
3. For each student:
   - Shows name, email, signup date
   - "Approve" button → sets isOnboarded: true
   - "Reject" button → deletes user
4. After approval, student can request meals
```

#### Reviewing Meal Requests
```
1. Manager sees "Pending Meal Requests" section
2. Each request shown as a card:
   - Student name and email
   - Meal type with emoji
   - Token ID
   - Request time
3. Three action buttons on each card:
   - OK (Approve): status → 'accepted'
   - Delete: removes request
   - Block: blocks student
```

#### Blocking a Student
```
1. Manager clicks "Block" button on request
2. Confirmation modal appears:
   - Shows student name and email
   - Warning: "This student will be blocked from making requests"
3. Manager confirms
4. All student's future requests return 403
5. Student shows message: "You have been blocked"
```

#### Viewing Blocked Students
```
1. Manager sees "Blocked Students" section
2. Lists all blocked students:
   - Name, email, block date, request count
3. Can unblock by clicking "Unblock" button
4. After unblock, student can request again
```

---

### Admin Workflow

#### Full System Access
```
1. Admin logs in with admin account
2. Admin dashboard shows:
   - All requests (Requests tab)
   - All users (Users tab)
   - System statistics
```

#### Managing Requests
```
1. Admin views all requests regardless of status
2. Can approve, deny, or delete any request
3. Full visibility into meal request system
```

#### Managing Users
```
1. Admin views all users
2. Can see user details:
   - Email, name, role
   - Creation date
3. Can delete users
4. Can modify user data
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Firebase project setup
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/cloudnerves.git
cd cloudnerves
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Firebase Setup

1. Create Firebase project at https://console.firebase.google.com
2. Create web app in Firebase
3. Copy your Firebase config
4. Create `lib/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### Step 4: MongoDB Setup

1. Create MongoDB cluster at https://www.mongodb.com/cloud/atlas
2. Create database named `cloudnerves`
3. Create collections:
   - `users`
   - `mealRequests`
4. Get connection string

### Step 5: Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cloudnerves
```

### Step 6: Create Default Users (Optional)

Create script to seed users:
```javascript
// Script to create default users
db.collection('users').insertMany([
  {
    uid: 'student-uid-123',
    email: 'student@example.com',
    displayName: 'John Student',
    role: 'student',
    isOnboarded: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    uid: 'manager-uid-456',
    email: 'manager@example.com',
    displayName: 'Jane Manager',
    role: 'manager',
    isOnboarded: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    uid: 'admin-uid-789',
    email: 'admin@example.com',
    displayName: 'Bob Admin',
    role: 'admin',
    isOnboarded: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
```

### Step 7: Run Development Server
```bash
npm run dev
```

Visit http://localhost:3000

---

## Testing Guide

### Test Case 1: Student Signup and Approval

**Steps**:
1. Visit http://localhost:3000/signup
2. Enter email: `newstudent@example.com`
3. Enter password: `password123`
4. Click "Sign Up"
5. Redirected to dashboard
6. Buttons show "Pending Approval"

**Expected Result**:
- ✓ User created in Firebase
- ✓ User created in MongoDB with `isOnboarded: false`
- ✓ Dashboard shows pending message
- ✓ Buttons disabled

**Next Steps**:
7. Manager logs in
8. Sees "Pending Onboarding" section
9. Clicks "Approve" button
10. Student's `isOnboarded` set to `true`

---

### Test Case 2: Request Meal After Approval

**Prerequisites**: Student is onboarded

**Steps**:
1. Student logs in
2. Sees enabled meal buttons
3. Clicks "Breakfast" button
4. Token generated: `B-210225-xxxx-nn`
5. Message: "✓ Requested"
6. Button shows checkmark

**Expected Result**:
- ✓ Meal request created
- ✓ Token displayed
- ✓ Button state updated
- ✓ Request appears in manager dashboard

---

### Test Case 3: Duplicate Prevention

**Prerequisites**: Student already requested breakfast today

**Steps**:
1. Student clicks "Breakfast" button again
2. Error message appears

**Expected Result**:
- ✓ Error: "Already have breakfast request today"
- ✓ Request not created
- ✓ No duplicate tokens

---

### Test Case 4: Manager Approval

**Prerequisites**: Pending meal request exists

**Steps**:
1. Manager logs in
2. Sees pending request card
3. Clicks "OK" button (approve)
4. Button animation
5. Request status changes to "accepted"

**Expected Result**:
- ✓ Request status updated
- ✓ Card removed from pending section
- ✓ Stats updated
- ✓ Student sees status change

---

### Test Case 5: Student Blocking

**Prerequisites**: Pending meal request exists

**Steps**:
1. Manager clicks "Block" button
2. Confirmation modal appears
3. Manager clicks "Confirm"
4. Student's `isBlocked` set to `true`
5. Student appears in "Blocked Students" section

**Expected Result**:
- ✓ Student blocked
- ✓ All requests marked as blocked
- ✓ Student gets 403 error on next request
- ✓ Error message: "You have been blocked"

---

### Test Case 6: Unblocking Student

**Prerequisites**: Student is blocked

**Steps**:
1. Manager sees "Blocked Students" section
2. Clicks "Unblock" button
3. Student's `isBlocked` set to `false`
4. Student removed from blocked section

**Expected Result**:
- ✓ Student unblocked
- ✓ Student can request again
- ✓ No error message

---

### Test Case 7: Admin Full Access

**Steps**:
1. Admin logs in
2. Sees "Admin Dashboard"
3. Two tabs: "Requests" and "Users"
4. Requests tab shows all requests
5. Users tab shows all users
6. Admin can delete users

**Expected Result**:
- ✓ Full access to all data
- ✓ Can manage any request
- ✓ Can manage any user

---

## Troubleshooting

### "User role not found" Error

**Cause**: User created in Firebase but MongoDB document doesn't exist

**Solution**:
1. Check if user exists in MongoDB:
   ```javascript
   db.collection('users').findOne({ uid: 'user-uid' })
   ```

2. If missing, manually create:
   ```javascript
   db.collection('users').insertOne({
     uid: 'user-uid',
     email: 'user@example.com',
     displayName: 'User Name',
     role: 'student',
     isOnboarded: false,
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

3. Or, re-signup in the app

---

### "Student is not onboarded" Error

**Cause**: Student hasn't been approved by manager yet

**Solution**:
1. Manager logs in
2. Approves student in "Pending Onboarding" section
3. Sets `isOnboarded: true`
4. Student can now request

---

### No Requests Showing in Manager Dashboard

**Cause**: 
- No pending requests exist
- Auto-refresh not working
- Filter applied incorrectly

**Solution**:
1. Student creates meal request first
2. Check browser console for errors
3. Manually refresh dashboard
4. Check filter settings

---

### MongoDB Connection Error

**Cause**: Invalid connection string or network issue

**Solution**:
1. Check `.env.local` has correct `MONGODB_URI`
2. Check MongoDB Atlas whitelist allows your IP
3. Test connection with MongoDB CLI:
   ```bash
   mongosh "YOUR_CONNECTION_STRING"
   ```

---

### Firebase Authentication Error

**Cause**: Firebase config incorrect or service down

**Solution**:
1. Verify Firebase credentials in `.env.local`
2. Check Firebase Console for any alerts
3. Ensure web app created in Firebase project
4. Regenerate credentials if needed

---

## Future Enhancements

### Planned Features

1. **Email Notifications**
   - Send email when request approved
   - Send email when student blocked
   - Send email to manager on new requests

2. **SMS Notifications**
   - SMS when request status changes
   - Optional student preference

3. **QR Code Tokens**
   - Generate QR code for each token
   - Scan at counter to verify

4. **Analytics Dashboard**
   - Request trends over time
   - Most requested meal types
   - Student request history
   - Performance metrics

5. **Request History & Reports**
   - Export requests as PDF/CSV
   - Date range filtering
   - Meal type breakdown

6. **User Profile Management**
   - Edit profile picture
   - Update phone number
   - Change preferences
   - View personal statistics

7. **Request Cancellation**
   - Students can cancel pending requests
   - Refund tokens if applicable
   - Timestamp of cancellation

8. **Meal Preferences**
   - Students indicate dietary preferences
   - Managers see preferences
   - Report on dietary requirements

9. **Recurring Requests**
   - Students set recurring meals
   - Daily, weekly, custom schedules
   - Auto-generate tokens

10. **POS Integration**
    - Scan token at point of sale
    - Mark as "served"
    - Attendance tracking

11. **Multi-Language Support**
    - English, Spanish, French
    - Localized messages

12. **Dark Mode**
    - Toggle theme preference
    - System preference detection
    - Persist user choice

---

## Support & Contact

For issues or questions:
- GitHub Issues: https://github.com/yourusername/cloudnerves/issues
- Email: support@cloudnerves.com
- Documentation: See other .md files in project

---

## License

MIT License - See LICENSE file for details

---

## Contributors

- Project Lead: Your Name
- Development: Your Team

---

**Last Updated**: February 21, 2025

**Version**: 1.0.0 (Beta)

**Status**: ✅ Production Ready
