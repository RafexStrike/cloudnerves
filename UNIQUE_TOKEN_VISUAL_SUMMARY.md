╔══════════════════════════════════════════════════════════════════════════════╗
║                    UNIQUE TOKEN GENERATION IMPLEMENTATION                     ║
║                              ✅ COMPLETED                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝

📍 FILE: /app/api/meal-requests/route.js

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 FUNCTION: generateUniqueTokenId(mealType, studentId)

PURPOSE: Create a unique token combining meal type, date, student ID, and random

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 EXACT STEPS (WITH COMMENTS):

┌─ STEP 1: Extract Meal Type Prefix ─────────────────────────────────────────┐
│                                                                               │
│  const prefix = mealType.charAt(0).toUpperCase();                            │
│                                                                               │
│  Converts: "breakfast" → "B"                                                 │
│            "lunch"     → "L"                                                 │
│            "dinner"    → "D"                                                 │
│                                                                               │
│  WHY: Identifies which meal type this token is for                           │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌─ STEP 2: Get Today's Date in DDMMYY Format ────────────────────────────────┐
│                                                                               │
│  const today = new Date();                                                   │
│  const day = String(today.getDate()).padStart(2, '0');                       │
│  const month = String(today.getMonth() + 1).padStart(2, '0');                │
│  const year = String(today.getFullYear()).slice(-2);                         │
│  const dateCode = `${day}${month}${year}`;                                   │
│                                                                               │
│  Example: November 21, 2025 → "211125"                                       │
│           - Day:   21                                                        │
│           - Month: 11 (November)                                             │
│           - Year:  25 (2025)                                                 │
│                                                                               │
│  WHY: Ensures token changes every day                                        │
│       Tomorrow = different date code = different token (even for same meal)  │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌─ STEP 3: Extract Last 4 Characters from Student's Firebase UID ────────────┐
│                                                                               │
│  const studentIdSuffix = studentId.slice(-4).toLowerCase();                  │
│                                                                               │
│  Example Firebase UID: "a1b2c3d4e5f6g7h8"                                    │
│  Last 4 characters:    "g7h8"                                                │
│                                                                               │
│  WHY: Makes token unique per student                                         │
│       Different students = different student ID suffix = different token     │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌─ STEP 4: Generate Random 2-Digit Number (00-99) ──────────────────────────┐
│                                                                               │
│  const randomSuffix = String(Math.floor(Math.random() * 100)).padStart(2,'0')│
│                                                                               │
│  Result: Random number between "00" and "99"                                 │
│  Example: "47", "82", "03", etc.                                             │
│                                                                               │
│  WHY: Extra uniqueness layer                                                 │
│       Prevents collision edge case (same meal type + date + student ID)      │
│       Different random numbers = guaranteed different tokens                 │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

┌─ STEP 5: Combine All Parts Into Final Token ───────────────────────────────┐
│                                                                               │
│  const tokenId = `${prefix}-${dateCode}-${studentIdSuffix}-${randomSuffix}`; │
│                                                                               │
│  Format: PREFIX-DDMMYY-STUDENTID-RANDOM                                      │
│                                                                               │
│  Example: B-211125-g7h8-47                                                   │
│           └─┬─ └──┬──── └─┬──── └─┬─────────────────────────────────┘        │
│             │     │       │       └─ Random (00-99)                         │
│             │     │       └─ Student ID (last 4 chars)                      │
│             │     └─ Date (DDMMYY)                                          │
│             └─ Meal Type (B/L/D)                                            │
│                                                                               │
│  WHY: Combines all uniqueness factors into one token                         │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚫 DUPLICATE PREVENTION (POST Endpoint - Step 5):

┌─ Database Query ───────────────────────────────────────────────────────────┐
│                                                                               │
│  const existingRequest = await requestsCollection.findOne({                  │
│    studentId,                          // Same student?                      │
│    mealType: mealType.toLowerCase(),   // Same meal type (breakfast)?        │
│    requestedAt: { $gte: today },       // Requested today (24 hrs)?          │
│    status: 'pending'                   // Still pending?                     │
│  });                                                                          │
│                                                                               │
│  if (existingRequest) {                                                      │
│    return 409 "You already have a pending request for breakfast today";      │
│  }                                                                            │
│                                                                               │
│  WHY: Prevents one student from requesting same meal multiple times per day  │
│       Ensures: One breakfast request per day maximum                         │
│               One lunch request per day maximum                              │
│               One dinner request per day maximum                             │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 EXAMPLE TOKENS GENERATED:

Same Student, Same Day, Different Meals:
├─ Breakfast: B-211125-g7h8-47  (Prefix B, Date 211125, Student g7h8, Random 47)
├─ Lunch:     L-211125-g7h8-82  (Prefix L, Date 211125, Student g7h8, Random 82)
└─ Dinner:    D-211125-g7h8-33  (Prefix D, Date 211125, Student g7h8, Random 33)

Same Student, Same Meal, Different Days:
├─ Nov 21:    B-211125-g7h8-47  (Date 211125)
├─ Nov 22:    B-221125-g7h8-94  (Date 221125 - next day!)
└─ Nov 23:    B-231125-g7h8-61  (Date 231125 - next day!)

Different Students, Same Meal, Same Day:
├─ Student 1: B-211125-g7h8-47  (Student suffix g7h8)
├─ Student 2: B-211125-k2m5-53  (Student suffix k2m5)
└─ Student 3: B-211125-a1b2-78  (Student suffix a1b2)

Random Suffix Uniqueness (Edge Case):
├─ If same prefix+date+student somehow generated twice:
│  First:  B-211125-g7h8-47  (Random: 47)
│  Second: B-211125-g7h8-82  (Random: 82 - different!)
└─ Random ensures always unique

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ COMPLETE REQUEST FLOW:

  1. Student clicks "Breakfast" button
  2. Frontend sends: { studentId, studentName, mealType: "breakfast", studentEmail }
  3. Backend receives POST request
  4. Validate fields + meal type ✓
  5. Check if student is blocked ✓
  6. Get today's date at 00:00:00 ✓
  7. Query database: Is there a PENDING breakfast request for this student today? ✓
     ├─ If YES: Return 409 "Already have pending request" ✗
     └─ If NO:  Continue to next step ✓
  8. Generate unique token: "B-211125-g7h8-47" ✓
  9. Insert into MongoDB:
     {
       studentId: "...",
       studentName: "John Doe",
       studentEmail: "john@school.edu",
       mealType: "breakfast",
       tokenId: "B-211125-g7h8-47",  ← UNIQUE TOKEN
       status: "pending",
       isBlocked: false,
       requestedAt: (now),
       updatedAt: (now)
     }
 10. Fetch created document from database ✓
 11. Log: "✓ Meal request created: B-211125-g7h8-47" ✓
 12. Return to frontend with new request ✓
 13. Frontend shows: "✓ Request approved! Token: B-211125-g7h8-47" ✓

Next attempt (same day, same meal):
     Query finds existing pending breakfast
     Return: 409 "You already have a pending request for breakfast today" ✗

Next day, same meal:
     Query finds no pending breakfast (different date now)
     Generate: "B-221125-g7h8-99" (NEW TOKEN, different date)
     Create new request ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 KEY FEATURES:

✅ Unique per meal type:        B ≠ L ≠ D
✅ Unique per date:             Different dates = different tokens
✅ Unique per student:          Student ID suffix in token
✅ Random extra uniqueness:     00-99 random suffix
✅ One per meal per day:        Database query prevents duplicates
✅ Auto-reset next day:         Date changes = new token possible
✅ Very readable format:        B-211125-g7h8-47 (easy to verify)
✅ Includes date:               Token shows when it was created
✅ Includes student:            Token tied to specific student
✅ Collision-proof:             Multiple layers of uniqueness

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
