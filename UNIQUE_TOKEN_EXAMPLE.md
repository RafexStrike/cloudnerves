// UNIQUE TOKEN GENERATION - EXAMPLE WALKTHROUGH
// ================================================

// Let's say:
// - Student: John (Firebase UID: "a1b2c3d4e5f6g7h8")
// - Today: November 21, 2025
// - Meal Type: Breakfast

// STEP 1: Extract meal type prefix
// Breakfast -> "B"
const prefix = "B";

// STEP 2: Get today's date in DDMMYY format
// November 21, 2025 -> "211125"
const dateCode = "211125";

// STEP 3: Extract last 4 characters from student's Firebase UID
// "a1b2c3d4e5f6g7h8" -> last 4 chars -> "g7h8"
const studentIdSuffix = "g7h8";

// STEP 4: Generate random 2-digit number
// Random between 00-99 -> let's say "47"
const randomSuffix = "47";

// STEP 5: Combine all parts
const tokenId = `${prefix}-${dateCode}-${studentIdSuffix}-${randomSuffix}`;
// Result: "B-211125-g7h8-47"

// ================================================
// UNIQUENESS GUARANTEES:
// ================================================

// ✅ SAME STUDENT, DIFFERENT MEALS (Same Day)
//   Breakfast:  B-211125-g7h8-47
//   Lunch:      L-211125-g7h8-82
//   Dinner:     D-211125-g7h8-33
//   Different prefixes = Different tokens ✓

// ✅ SAME STUDENT, SAME MEAL (Different Days)
//   Today:      B-211125-g7h8-47
//   Tomorrow:   B-221125-g7h8-94
//   Different dates = Different tokens ✓

// ✅ DIFFERENT STUDENTS, SAME MEAL (Same Day)
//   Student 1:  B-211125-g7h8-47
//   Student 2:  B-211125-k2m5-53
//   Different student IDs = Different tokens ✓

// ✅ RANDOM SUFFIX PREVENTS COLLISION
//   If somehow both generate same date + student:
//   B-211125-g7h8-47
//   B-211125-g7h8-91  <- Different random suffix = Different tokens ✓

// ================================================
// DUPLICATE REQUEST PREVENTION:
// ================================================

// DATABASE CHECK (Step 5 in POST endpoint):
// Query: Find any PENDING request where:
//   - studentId = same student
//   - mealType = same meal type (e.g., "breakfast")
//   - requestedAt >= today (00:00:00)
//   - status = "pending"

// If found -> Return 409 Conflict (Already have pending request)
// If not found -> Generate token and create request

// EXAMPLE:
// Student tries to request Breakfast at 9:00 AM
//   ✓ Created: B-211125-g7h8-47

// Student tries to request Breakfast again at 10:00 AM (same day)
//   ✗ Blocked: "You already have a pending request for breakfast today"
//   ✗ Returns: 409 Conflict

// Student tries to request Breakfast tomorrow
//   ✓ Created: B-221125-g7h8-81 (New date, new token)

// ================================================
// EDGE CASES HANDLED:
// ================================================

// 1. Student is blocked:
//    - Check isBlocked flag in database
//    - Return 403 Forbidden
//    - Prevent ANY new requests

// 2. Invalid meal type:
//    - Only accept: breakfast, lunch, dinner
//    - Return 400 Bad Request

// 3. Missing fields:
//    - Require: studentId, studentName, mealType
//    - Return 400 Bad Request

// 4. Database error:
//    - Catch exception
//    - Return 500 Internal Server Error
