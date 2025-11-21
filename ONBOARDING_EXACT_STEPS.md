# Student Onboarding - Exact Implementation Steps

## STEP-BY-STEP CODE COMMENTS

### STEP 1: Student Signs Up
```javascript
// File: app/api/users/route.js - POST endpoint
// When new student signs up through signup form:

const result = await usersCollection.insertOne({
  uid: userData.uid,                          // Firebase UID
  displayName: userData.displayName || '',
  email: userData.email || '',
  photoURL: userData.photoURL || '',
  phoneNumber: userData.phoneNumber || '',
  isOnboarded: false,  // ✅ STEP 1: Set to FALSE for new students
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Result: Student created but CANNOT make requests
```

---

### STEP 2: Student Tries to Request Meal (BLOCKED)
```javascript
// File: app/api/meal-requests/route.js - POST endpoint
// When student clicks Breakfast/Lunch/Dinner:

const { studentId, studentName, mealType, studentEmail } = await request.json();

// ✅ STEP 2.5: CHECK ONBOARDING BEFORE ALLOWING REQUEST
const student = await usersCollection.findOne({ uid: studentId });
if (!student || !student.isOnboarded) {
  // Student is either:
  // 1. Not found in database
  // 2. Has isOnboarded === false
  
  return NextResponse.json(
    { 
      error: 'Your account is pending manager approval. ' +
             'You will be able to make requests once approved.' 
    },
    { status: 403 }  // ✅ 403 = Forbidden/Not Authorized
  );
}

// ✅ If we reach here: student IS onboarded, continue with meal request
```

---

### STEP 3: Manager Views Pending Approvals
```javascript
// File: app/api/onboarding/route.js - GET endpoint
// When manager opens approvals section:

export async function GET() {
  const db = await connectToDatabase();
  const usersCollection = db.collection('users');

  /**
   * ✅ STEP 3: Fetch all pending students
   * Query: Find all users where isOnboarded === false
   * Sort by newest first (createdAt descending)
   */
  const pendingStudents = await usersCollection
    .find({ isOnboarded: false })  // ← Only students not yet approved
    .sort({ createdAt: -1 })       // ← Newest first
    .toArray();

  return NextResponse.json(
    {
      total: pendingStudents.length,  // How many pending?
      students: pendingStudents,      // List of students
    },
    { status: 200 }
  );
}

// Result: Manager sees list of pending approvals
```

---

### STEP 4: Manager Approves Student
```javascript
// File: app/api/onboarding/route.js - PUT endpoint
// When manager clicks [APPROVE] button:

export async function PUT(request) {
  const { uid, action } = await request.json();
  // uid: Student's Firebase UID
  // action: "approve" or "reject"

  if (action.toLowerCase() === 'approve') {
    /**
     * ✅ STEP 4: Update student's onboarding status to TRUE
     */
    const result = await usersCollection.findOneAndUpdate(
      { uid },                    // Find this student
      {
        $set: {
          isOnboarded: true,      // ✅ Change FALSE → TRUE
          approvedAt: new Date(), // When approved?
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }  // Return updated document
    );

    console.log(`✓ Student ${uid} approved for onboarding`);

    return NextResponse.json(
      {
        message: `Student ${result.displayName} has been approved`,
        student: result,
      },
      { status: 200 }
    );
  }
  
  // Result: Student's isOnboarded = true, can now make requests
}
```

---

### STEP 5: Manager Rejects/Deletes Student
```javascript
// File: app/api/onboarding/route.js - PUT endpoint (reject action)
// When manager clicks [REJECT] button:

if (action.toLowerCase() === 'reject') {
  /**
   * ✅ STEP 5: Delete the student entirely
   * Their user document is removed from database
   * They must sign up again if they want to retry
   */
  const deleteResult = await usersCollection.deleteOne({ uid });

  if (deleteResult.deletedCount === 0) {
    return NextResponse.json(
      { error: 'Student not found' },
      { status: 404 }
    );
  }

  console.log(`✓ Student ${uid} rejected from onboarding`);

  return NextResponse.json(
    {
      message: 'Student onboarding request has been rejected',
      deletedCount: deleteResult.deletedCount,  // How many deleted? Should be 1
    },
    { status: 200 }
  );
}

// Result: Student deleted, must sign up again
```

---

### STEP 6: Approved Student Can Now Request
```javascript
// File: app/api/meal-requests/route.js - POST endpoint
// When APPROVED student clicks Breakfast/Lunch/Dinner:

const student = await usersCollection.findOne({ uid: studentId });
if (!student || !student.isOnboarded) {
  // Student is approved, so this condition is FALSE
  // We skip the error and continue...
}

// ✅ Continue with normal meal request flow:
// 1. Check if blocked
// 2. Check if duplicate request today
// 3. Generate unique token
// 4. Create meal request
// 5. Return token to student
```

---

## Data Flow Diagram

```
NEW ACCOUNT SIGN UP
    ↓
POST /api/users
    ↓
Create user with isOnboarded: false
    ↓
┌─────────────────────────────────────────────────────┐
│                                                     │
│  STUDENT CANNOT REQUEST (isOnboarded === false)    │
│                                                     │
│  Student clicks Breakfast                           │
│    ↓                                                │
│  POST /api/meal-requests                           │
│    ↓                                                │
│  Check: SELECT * FROM users WHERE uid = studentId │
│    ↓                                                │
│  If isOnboarded !== true                           │
│    ↓                                                │
│  ✅ RETURN 403 FORBIDDEN                           │
│  Message: "Pending manager approval"              │
│                                                     │
└─────────────────────────────────────────────────────┘
    ↓
GET /api/onboarding
    ↓
Manager sees pending students list
    ↓
┌─────────────────────────────────────────────────────┐
│                                                     │
│  MANAGER REVIEWS & ACTS                            │
│                                                     │
│  Option A: [APPROVE]                              │
│    ↓                                                │
│  PUT /api/onboarding                              │
│    ↓                                                │
│  UPDATE users SET isOnboarded = true              │
│    ↓                                                │
│  ✅ STUDENT CAN NOW REQUEST                        │
│                                                     │
│  Option B: [REJECT]                               │
│    ↓                                                │
│  PUT /api/onboarding (action: reject)             │
│    ↓                                                │
│  DELETE FROM users WHERE uid = studentId          │
│    ↓                                                │
│  ✅ STUDENT DELETED, MUST SIGN UP AGAIN            │
│                                                     │
└─────────────────────────────────────────────────────┘
    ↓
APPROVED STUDENT REQUEST (isOnboarded === true)
    ↓
POST /api/meal-requests
    ↓
Check: SELECT * FROM users WHERE uid = studentId
    ↓
If isOnboarded === true
    ↓
✅ ALLOW REQUEST (Generate token, create meal request)
```

---

## Database State Changes

### Timeline of isOnboarded Flag

```
TIME 1: Student Signs Up
─────────────────────────
uid: "student-123"
isOnboarded: false        ✋ Cannot request
email: "student@school.edu"
createdAt: 2025-02-21 10:00


TIME 2: Student Tries to Request (REJECTED)
──────────────────────────────────────────
Student: "student-123"
Action: POST /api/meal-requests
Status: ❌ 403 Forbidden
Message: "Pending manager approval"


TIME 3: Manager Approves Student
───────────────────────────────
uid: "student-123"
isOnboarded: false  →  true        ✅ NOW CAN REQUEST
approvedAt: 2025-02-21 10:15
updatedAt: 2025-02-21 10:15


TIME 4: Approved Student Requests (SUCCESS)
──────────────────────────────────────
Student: "student-123"
Action: POST /api/meal-requests
Status: ✅ 201 Created
Result: Token generated (B-210225-....), request created
```

---

## Three Possible Student States

### State 1: Pending Approval ⏳
```javascript
{
  uid: "student-123",
  isOnboarded: false,
  createdAt: "2025-02-21T10:00:00Z"
}

What student can do:
  ❌ Cannot make meal requests
  ❌ Cannot create tokens
  ✅ Can only wait and view messages

Where appears:
  ✅ In manager's pending approvals list
  ❌ NOT in normal user list
```

### State 2: Approved ✅
```javascript
{
  uid: "student-123",
  isOnboarded: true,
  approvedAt: "2025-02-21T10:15:00Z",
  createdAt: "2025-02-21T10:00:00Z"
}

What student can do:
  ✅ Make meal requests
  ✅ Create tokens
  ✅ View request history
  ✅ View meal options

Where appears:
  ❌ NOT in pending approvals list
  ✅ In normal user list
```

### State 3: Rejected/Deleted ❌
```javascript
// No document in database (deleted entirely)

What student can do:
  ❌ Account completely gone
  ✅ Can sign up again fresh

Where appears:
  ❌ Nowhere (not in any list)
  ❌ Account doesn't exist
```

---

## Query Examples

### Find All Pending Students
```javascript
db.users.find({ isOnboarded: false })
  .sort({ createdAt: -1 })
  .toArray()

// Returns:
// [
//   { uid: "abc123", displayName: "John", isOnboarded: false, ... },
//   { uid: "xyz789", displayName: "Sarah", isOnboarded: false, ... }
// ]
```

### Check if Specific Student is Onboarded
```javascript
const student = db.users.findOne({ uid: "student-123" })

if (!student || !student.isOnboarded) {
  // Cannot make request
} else {
  // Can make request
}
```

### Count Pending Approvals
```javascript
db.users.countDocuments({ isOnboarded: false })

// Returns: 5 (5 students pending approval)
```

### Approve All Students (Admin Only!)
```javascript
db.users.updateMany(
  { isOnboarded: false },
  { 
    $set: { 
      isOnboarded: true,
      approvedAt: new Date()
    }
  }
)

// ⚠️ Not recommended - approve individually
```

---

## Error Messages Student Sees

### Error 1: Account Not Approved
```
Student clicks: [🌅 Breakfast]
    ↓
Response from server:
HTTP 403 Forbidden
{
  error: "Your account is pending manager approval. 
          You will be able to make requests once approved."
}
    ↓
UI shows: Red alert with message
```

### Error 2: Account Deleted (After Rejection)
```
Student tries to login after being rejected
    ↓
Firebase auth still exists (can login)
    ↓
But user document not in MongoDB
    ↓
System redirects: "Account not found, please sign up"
```

---

## Summary

| Phase | Flag Value | Can Request? | Where |
|-------|-----------|-------------|-------|
| Just signed up | false | ❌ No | Pending approvals |
| Manager approved | true | ✅ Yes | Active students |
| Manager rejected | N/A | ❌ No | Deleted |
| Approved → Blocked | true + blocked flag | ❌ No | Blocked list |

---

✅ **Implementation Complete!**
All steps are commented in code and integrated with:
- Student meal request blocking at Step 2.5
- Manager approval workflow at API level
- Proper database state management
- Clear user feedback at every step
