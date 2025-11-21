# Student Onboarding System - Implementation Complete ✅

## Overview
New students cannot make any meal requests until a manager approves their account. This ensures quality control and prevents spam.

## System Flow

### Step 1: Student Signs Up
```
Student fills signup form
    ↓
Firebase creates authentication
    ↓
POST /api/users creates user document with:
  {
    uid: "firebase-uid",
    displayName: "Student Name",
    email: "student@school.edu",
    isOnboarded: false,  // ← FLAG: NOT YET APPROVED
    createdAt: new Date(),
    updatedAt: new Date()
  }
    ↓
Student gets redirected to dashboard
```

### Step 2: Pending Student Tries to Request Meal
```
Student clicks "Breakfast" button
    ↓
POST /api/meal-requests called
    ↓
STEP 2.5: Check if student is onboarded
    ↓
Query: SELECT * FROM users WHERE uid = studentId
    ↓
If isOnboarded === false:
  ✋ STOP - Return 403 Forbidden
  Message: "Your account is pending manager approval. 
           You will be able to make requests once approved."
    ↓
Student sees error message
Student CANNOT proceed with request
```

### Step 3: Manager Reviews Pending Students
```
Manager logs into dashboard
    ↓
GET /api/onboarding fetches:
  All users with isOnboarded = false
  Sorted by creation date (newest first)
    ↓
Manager sees list of pending approvals:
  - Student Name
  - Email
  - Signup Date
  - Two buttons: [Approve] [Reject]
```

### Step 4: Manager Approves Student
```
Manager clicks [Approve] button
    ↓
PUT /api/onboarding with:
  {
    uid: "student-firebase-uid",
    action: "approve"
  }
    ↓
Database updates user:
  isOnboarded: false  →  true
  approvedAt: new Date()
    ↓
Success message shown
    ↓
Student can NOW make requests
```

### Step 5: Manager Rejects Student (Optional)
```
Manager clicks [Reject] button
    ↓
PUT /api/onboarding with:
  {
    uid: "student-firebase-uid",
    action: "reject"
  }
    ↓
DELETE user document from database
    ↓
Student account DELETED
    ↓
Student must sign up again if they want to retry
```

### Step 6: Approved Student Makes Request
```
Student clicks "Breakfast" button
    ↓
POST /api/meal-requests called
    ↓
STEP 2.5: Check if student is onboarded
    ↓
Query: SELECT * FROM users WHERE uid = studentId
    ↓
If isOnboarded === true:
  ✅ CONTINUE - Allow request to proceed
    ↓
Generate unique token (B-210225-f7a2-84)
    ↓
Create meal request in database
    ↓
Return token to student
```

---

## Database Changes

### Users Collection Schema
```javascript
{
  _id: ObjectId,
  uid: String,                // Firebase UID (unique)
  displayName: String,        // Student's name
  email: String,              // Student's email
  photoURL: String,           // Profile picture (optional)
  phoneNumber: String,        // Phone (optional)
  isOnboarded: Boolean,       // ✨ NEW - Approval flag
  approvedAt: Date,           // ✨ NEW - When manager approved
  createdAt: Date,            // Account creation timestamp
  updatedAt: Date             // Last update timestamp
}
```

**Key Point**: `isOnboarded` starts as `false`, becomes `true` only after manager approval

### Meal Requests - No Changes
Meal requests are only created if student is onboarded, so the schema remains the same.

---

## API Endpoints

### 1. POST /api/users (Sign Up)
```
Request:
{
  uid: "firebase-uid",
  displayName: "John Student",
  email: "john@school.edu",
  photoURL: "...",
  phoneNumber: "..."
}

Response:
{
  _id: ObjectId,
  uid: "firebase-uid",
  displayName: "John Student",
  email: "john@school.edu",
  isOnboarded: false,  // ← Automatically set
  createdAt: "2025-02-21T10:30:00Z",
  updatedAt: "2025-02-21T10:30:00Z"
}

Status: 201 Created
```

### 2. PUT /api/users/[uid] (Manager Approval)
```
Already exists - can update any field including isOnboarded
Used by: PUT /api/onboarding (internally calls this)

Request:
{
  isOnboarded: true
}

Response:
{
  _id: ObjectId,
  uid: "firebase-uid",
  displayName: "John Student",
  email: "john@school.edu",
  isOnboarded: true,  // ← Updated to true
  approvedAt: "2025-02-21T11:00:00Z",
  updatedAt: "2025-02-21T11:00:00Z"
}

Status: 200 OK
```

### 3. GET /api/onboarding (Fetch Pending Students)
```
Returns all students with isOnboarded = false

Response:
{
  total: 3,
  students: [
    {
      _id: ObjectId,
      uid: "uid-1",
      displayName: "John Student",
      email: "john@school.edu",
      isOnboarded: false,
      createdAt: "2025-02-21T10:30:00Z"
    },
    {
      _id: ObjectId,
      uid: "uid-2",
      displayName: "Sarah Smith",
      email: "sarah@school.edu",
      isOnboarded: false,
      createdAt: "2025-02-21T10:15:00Z"
    },
    ...
  ]
}

Status: 200 OK
```

### 4. PUT /api/onboarding (Manager Approve/Reject)
```
APPROVE:
Request:
{
  uid: "firebase-uid",
  action: "approve"
}

Response:
{
  message: "Student John Student has been approved",
  student: {
    _id: ObjectId,
    uid: "firebase-uid",
    isOnboarded: true,
    approvedAt: "2025-02-21T11:00:00Z",
    ...
  }
}

Status: 200 OK

---

REJECT:
Request:
{
  uid: "firebase-uid",
  action: "reject"
}

Response:
{
  message: "Student onboarding request has been rejected",
  deletedCount: 1
}

Status: 200 OK
```

### 5. DELETE /api/onboarding (Manager Delete)
```
Same as reject action

Request:
{
  uid: "firebase-uid"
}

Response:
{
  message: "Student onboarding request has been deleted",
  deletedCount: 1
}

Status: 200 OK
```

### 6. POST /api/meal-requests (Student Request Meal)
```
NOW INCLUDES ONBOARDING CHECK!

If student is NOT onboarded (isOnboarded === false):
Response:
{
  error: "Your account is pending manager approval. 
         You will be able to make requests once approved."
}

Status: 403 Forbidden

Otherwise: Creates meal request as normal
```

---

## User Experience

### New Student Flow
1. Student signs up
2. Sees message: "Your account is pending manager approval"
3. Cannot see meal request buttons (disabled or hidden)
4. Waits for manager approval

### Manager Workflow
1. Logs into dashboard
2. Sees "Pending Approvals" section
3. Reviews student information
4. Clicks "Approve" or "Reject"
5. Gets confirmation

### Approved Student Flow
1. Student can now see meal request buttons
2. Can click and request meals
3. Gets unique tokens
4. Everything works normally

---

## Implementation Files Modified

1. **app/api/users/route.js**
   - Added `isOnboarded: false` to new user creation

2. **app/api/meal-requests/route.js**
   - Added Step 2.5: Check onboarding status before allowing requests
   - Returns 403 if student not onboarded

3. **app/api/onboarding/route.js** ✨ NEW
   - GET: Fetch all pending students
   - PUT: Approve or reject students
   - DELETE: Delete pending requests

4. **components/StudentMealRequest.jsx**
   - Already handles 403 errors correctly
   - Will display: "Your account is pending manager approval..."

---

## Error Scenarios

### Scenario 1: New Student Tries to Request
```
Student clicks Breakfast
    ↓
POST /api/meal-requests
    ↓
Check: isOnboarded === false
    ↓
❌ Error: "Your account is pending manager approval"
Status: 403
    ↓
Student sees error message in UI
Cannot make request
```

### Scenario 2: Manager Rejects Student
```
Manager clicks Reject
    ↓
PUT /api/onboarding with action: "reject"
    ↓
User document DELETED
    ↓
Student Firebase auth still exists
But user document gone from MongoDB
    ↓
If student tries to login:
- Firebase recognizes them
- But no user document found
- Should redirect to signup/onboarding
```

### Scenario 3: Student Approved Then Blocked
```
Sequence of events:
1. Manager approves student (isOnboarded = true)
2. Student makes requests
3. Manager blocks student (isBlocked = true)
    ↓
Student tries to make NEW request
    ↓
POST /api/meal-requests
    ↓
Check Step 2.5: isOnboarded === true ✅
Check Step 3: isBlocked === false ❌
    ↓
Error: "You have been blocked from making requests"
Status: 403
```

---

## Security & Best Practices

✅ **Protection Against**:
- Spam accounts signing up
- Unvetted users making requests
- Automated bot registrations
- Low-quality user data

✅ **Manager Control**:
- Reviews each student individually
- Can reject without penalty to student
- Can block problematic students later
- Full audit trail in database

✅ **Student Experience**:
- Clear message about approval requirement
- Knows what's happening
- Can contact admin if issues

---

## Testing Steps

### Test 1: New Student Cannot Request
1. Create new account as student
2. Go to dashboard
3. Try to click Breakfast/Lunch/Dinner
4. ✅ Should see error: "Your account is pending manager approval..."
5. ✅ Buttons should not create requests

### Test 2: Manager Sees Pending Students
1. Login as manager
2. Go to onboarding/approvals section
3. ✅ Should see new students
4. ✅ Should show: Name, Email, Signup Date

### Test 3: Manager Approves Student
1. Manager clicks Approve on student
2. ✅ Should see success message
3. Student logs out and back in
4. Student tries to request meal
5. ✅ Should work - gets token

### Test 4: Manager Rejects Student
1. Manager clicks Reject on student
2. ✅ Should see success message
3. Student tries to login
4. ✅ Account should be gone/inaccessible
5. Student can sign up again fresh

### Test 5: Approved Student Gets Blocked Later
1. Manager approves student A
2. Student A makes several requests
3. Manager blocks student A
4. Student A tries to request again
5. ✅ Should see error: "You have been blocked..."

---

## Status: ✅ READY FOR TESTING

All endpoints created and integrated. System is:
- ✅ Preventing non-onboarded students from requesting
- ✅ Allowing managers to approve/reject
- ✅ Providing clear user feedback
- ✅ Maintaining proper database state
