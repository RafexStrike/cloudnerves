# Student Onboarding - Visual Workflow

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                       STUDENT ONBOARDING SYSTEM                            │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                          STUDENT SIGNUP                             │  │
│  │                                                                      │  │
│  │  1. Student fills form (name, email, password)                     │  │
│  │  2. Firebase creates authentication                                │  │
│  │  3. System creates user document:                                  │  │
│  │     {                                                              │  │
│  │       uid: "firebase-uid",                                        │  │
│  │       displayName: "John Student",                                │  │
│  │       email: "john@school.edu",                                   │  │
│  │       isOnboarded: false,  ✋ BLOCKED                             │  │
│  │       createdAt: "2025-02-21T10:00:00Z"                          │  │
│  │     }                                                              │  │
│  │  4. Student redirected to dashboard                               │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│              ↓                                                              │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      STUDENT BLOCKED ✋                              │  │
│  │                                                                      │  │
│  │  Student clicks: [🌅 Breakfast] [🍽️ Lunch] [🌙 Dinner]            │  │
│  │                                                                      │  │
│  │  System checks:                                                     │  │
│  │    SELECT * FROM users WHERE uid = studentId                      │  │
│  │    IF isOnboarded === false:                                       │  │
│  │       ❌ RETURN 403 Forbidden                                       │  │
│  │       Message: "Your account is pending manager approval"          │  │
│  │                                                                      │  │
│  │  Result:                                                            │  │
│  │    ❌ Request NOT created                                           │  │
│  │    ❌ No token generated                                            │  │
│  │    ⚠️  Error message shown to student                              │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│              ↓                                                              │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    MANAGER DASHBOARD                                │  │
│  │                                                                      │  │
│  │  Manager views: "Pending Student Approvals"                        │  │
│  │                                                                      │  │
│  │  GET /api/onboarding                                               │  │
│  │                                                                      │  │
│  │  Response:                                                          │  │
│  │  {                                                                  │  │
│  │    total: 3,                                                        │  │
│  │    students: [                                                      │  │
│  │      {                                                              │  │
│  │        uid: "student-1",                                           │  │
│  │        displayName: "John Student",                                │  │
│  │        email: "john@school.edu",                                   │  │
│  │        isOnboarded: false,                                         │  │
│  │        createdAt: "2025-02-21T10:00:00Z"                          │  │
│  │      },                                                             │  │
│  │      { ... more students ... }                                     │  │
│  │    ]                                                                │  │
│  │  }                                                                  │  │
│  │                                                                      │  │
│  │  Manager sees list with [✅ Approve] [❌ Reject] buttons          │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│              ↙                                      ↘                        │
│                                                                             │
│    SCENARIO A: APPROVE ✅              SCENARIO B: REJECT ❌              │
│                                                                             │
│  ┌────────────────────────────┐      ┌────────────────────────────┐      │
│  │ Manager clicks [Approve]   │      │ Manager clicks [Reject]    │      │
│  │         ↓                  │      │         ↓                  │      │
│  │ PUT /api/onboarding        │      │ PUT /api/onboarding        │      │
│  │ {                          │      │ {                          │      │
│  │   uid: "student-1",        │      │   uid: "student-1",        │      │
│  │   action: "approve"        │      │   action: "reject"         │      │
│  │ }                          │      │ }                          │      │
│  │         ↓                  │      │         ↓                  │      │
│  │ UPDATE users SET:          │      │ DELETE FROM users:         │      │
│  │   isOnboarded: true        │      │   WHERE uid = "student-1"  │      │
│  │   approvedAt: NOW          │      │         ↓                  │      │
│  │         ↓                  │      │ User account DELETED       │      │
│  │ ✅ SUCCESS                 │      │         ↓                  │      │
│  │                            │      │ ❌ DELETED                 │      │
│  └────────────────────────────┘      └────────────────────────────┘      │
│         ↓                                       ↓                         │
│                                                                             │
│  ┌────────────────────────────┐      ┌────────────────────────────┐      │
│  │ STUDENT CAN NOW REQUEST ✅ │      │ STUDENT MUST SIGN UP AGAIN │      │
│  │                            │      │                            │      │
│  │ Student clicks Breakfast   │      │ Student tries to login     │      │
│  │     ↓                      │      │     ↓                      │      │
│  │ POST /api/meal-requests    │      │ Firebase auth still works  │      │
│  │     ↓                      │      │     ↓                      │      │
│  │ Check isOnboarded: true ✅ │      │ But user doc not found     │      │
│  │     ↓                      │      │     ↓                      │      │
│  │ ✅ ALLOW REQUEST           │      │ ❌ Account not found       │      │
│  │     ↓                      │      │     ↓                      │      │
│  │ Generate token             │      │ Must sign up fresh         │      │
│  │ Create meal request        │      │                            │      │
│  │ Return token               │      │                            │      │
│  │     ↓                      │      │                            │      │
│  │ ✅ WORKS! 🎉               │      │ ⚠️  RESTART PROCESS        │      │
│  │                            │      │                            │      │
│  └────────────────────────────┘      └────────────────────────────┘      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Request Flow Diagram

### New Student Request Flow

```
Student Clicks [🌅 Breakfast]
        │
        ▼
POST /api/meal-requests
        │
        ▼
┌─────────────────────────────────────────┐
│ VALIDATION STEPS                        │
│                                         │
│ ① Check required fields ✅              │
│   - studentId ✅                        │
│   - studentName ✅                      │
│   - mealType ✅                         │
│                                         │
│ ② Check meal type valid ✅              │
│   - breakfast, lunch, dinner            │
│                                         │
│ ③ STEP 2.5: Check onboarding ⚠️        │
│   Query: SELECT * FROM users            │
│           WHERE uid = studentId         │
│                                         │
│   Is user found? NO/false               │
│        │                                │
│        ▼                                │
│   ❌ BLOCK REQUEST                      │
│   Return 403 Forbidden                  │
│   Message: "Pending approval"           │
│                                         │
└─────────────────────────────────────────┘
        │
        ▼
❌ REQUEST BLOCKED
   Student sees error
```

### Approved Student Request Flow

```
Student Clicks [🌅 Breakfast]
        │
        ▼
POST /api/meal-requests
        │
        ▼
┌─────────────────────────────────────────┐
│ VALIDATION STEPS                        │
│                                         │
│ ① Check required fields ✅              │
│ ② Check meal type valid ✅              │
│                                         │
│ ③ STEP 2.5: Check onboarding ✅        │
│   Query: SELECT * FROM users            │
│           WHERE uid = studentId         │
│                                         │
│   Is user found? YES ✅                 │
│   Is onboarded? YES ✅                  │
│        │                                │
│        ▼                                │
│   ✅ CONTINUE                           │
│                                         │
│ ④ Check if blocked ✅                   │
│   isBlocked === true? NO                │
│        │                                │
│        ▼                                │
│   ✅ CONTINUE                           │
│                                         │
│ ⑤ Check for duplicate TODAY ✅          │
│   Already have breakfast today? NO      │
│        │                                │
│        ▼                                │
│   ✅ CONTINUE                           │
│                                         │
│ ⑥ Generate unique token ✅              │
│   B-210225-f7a2-84                     │
│        │                                │
│        ▼                                │
│   ✅ CREATE REQUEST                     │
│                                         │
└─────────────────────────────────────────┘
        │
        ▼
✅ REQUEST CREATED
   Student gets token
   Status: pending
```

---

## State Transition Diagram

```
        ┌──────────────────────────────────────┐
        │      STUDENT SIGNS UP                │
        │    Creates account on site          │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │     PENDING APPROVAL STATE            │
        │     isOnboarded: FALSE                │
        │                                      │
        │  • Cannot make any requests          │
        │  • Appears in manager's pending list │
        │  • Waiting for manager action        │
        └──────────┬─────────────────┬─────────┘
                   │                 │
        ┌──────────▼──────┐   ┌──────▼──────────┐
        │ Manager Approves │   │ Manager Rejects │
        └──────────┬──────┘   └──────┬──────────┘
                   │                 │
                   ▼                 ▼
        ┌──────────────────┐  ┌──────────────────┐
        │  APPROVED STATE  │  │  DELETED STATE   │
        │ isOnboarded: TRUE│  │ (No record)      │
        │                  │  │                  │
        │ • Can request    │  │ • No account     │
        │ • Gets tokens    │  │ • Must sign up   │
        │ • Normal access  │  │   again          │
        │                  │  │                  │
        │      ↓           │  │                  │
        │ (Can also be     │  │                  │
        │  blocked later)  │  │                  │
        │      │           │  │                  │
        │      ▼           │  │                  │
        │ ┌────────────┐   │  │                  │
        │ │   BLOCKED  │   │  │                  │
        │ │Can't request│   │  │                  │
        │ └────────────┘   │  │                  │
        └──────────────────┘  └──────────────────┘
```

---

## Database Query Examples

### Find Pending Students
```sql
SELECT * FROM users 
WHERE isOnboarded = false 
ORDER BY createdAt DESC
```

### Check if Student Can Request
```javascript
const student = await db.users.findOne({ uid: studentId })

if (!student || !student.isOnboarded) {
  // Cannot request
  return 403;
}
// Can request
```

### Approve Student
```sql
UPDATE users 
SET isOnboarded = true, 
    approvedAt = NOW() 
WHERE uid = studentId
```

### Reject Student
```sql
DELETE FROM users 
WHERE uid = studentId
```

---

## Timeline Example

```
10:00 AM - John Signs Up
───────────────────────
- Firebase creates auth
- MongoDB user created: isOnboarded = false
- John sees: "Waiting for approval"


10:05 AM - John Tries to Request Breakfast
──────────────────────────────────────────
- Clicks [🌅 Breakfast]
- System checks: isOnboarded = false
- ❌ 403 Error: "Pending manager approval"
- Request NOT created


10:10 AM - Manager Reviews Pending
─────────────────────────────────
- GET /api/onboarding
- Sees John Student in pending list
- Reviews: john@school.edu, signed up at 10:00


10:12 AM - Manager Approves John
────────────────────────────────
- Clicks [✅ Approve]
- PUT /api/onboarding { uid: john-uid, action: "approve" }
- John's record updated: isOnboarded = true
- approvedAt = 10:12 AM


10:15 AM - John Tries to Request Breakfast Again
──────────────────────────────────────────────
- Clicks [🌅 Breakfast]
- System checks: isOnboarded = true ✅
- Checks: not blocked ✅
- Checks: no duplicate ✅
- ✅ SUCCESS!
- Token created: B-210225-j7n1-42
- Request stored
- John sees token


10:20 AM - John Tries Breakfast Again
──────────────────────────────────────
- Clicks [🌅 Breakfast] again
- System checks: isOnboarded = true ✅
- Checks: not blocked ✅
- Checks: already requested breakfast today ❌
- ❌ 409 Error: "Already have breakfast today"
- Request NOT created (limit 1 per meal per day)
```

---

## Component Integration Map

```
┌─────────────────────────────────────────────────────┐
│              SYSTEM ARCHITECTURE                    │
└─────────────────────────────────────────────────────┘

FRONTEND (React Components)
├── LoginPage
│   └─→ User authenticates with Firebase
│
├── SignupPage  
│   └─→ User creates account
│       └─→ POST /api/users
│           └─→ User created with isOnboarded: false
│
├── StudentMealRequest
│   ├─→ Student clicks Breakfast/Lunch/Dinner
│   └─→ POST /api/meal-requests
│       ├─→ Check: isOnboarded === true?
│       │   └─→ YES: Continue, NO: Error 403
│       ├─→ Check: isBlocked === false?
│       ├─→ Check: No duplicate today?
│       └─→ Create token, return token
│
└── ManagerRequestsTable
    ├─→ Manager sees pending meal requests
    └─→ Manager sees pending student approvals
        ├─→ GET /api/onboarding
        ├─→ PUT /api/onboarding (approve/reject)
        └─→ DELETE /api/onboarding


BACKEND (API Routes)
├── /api/users
│   ├─→ POST: Create user (isOnboarded: false)
│   └─→ PUT /[uid]: Update user
│
├── /api/meal-requests
│   ├─→ POST: Create request (checks isOnboarded)
│   └─→ GET: List requests
│
└── /api/onboarding ✨ NEW
    ├─→ GET: List pending students (isOnboarded: false)
    ├─→ PUT: Approve/Reject action
    └─→ DELETE: Remove pending


DATABASE (MongoDB)
├── users collection
│   └─→ Field: isOnboarded (false/true)
│
└── mealRequests collection
    └─→ Only created if isOnboarded: true
```

---

✅ **Complete Onboarding System Visual Summary**
