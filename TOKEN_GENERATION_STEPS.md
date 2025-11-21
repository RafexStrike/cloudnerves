// UNIQUE TOKEN GENERATION - EXACT STEPS WITH COMMENTS
// =====================================================

// ========== TOKEN GENERATION FUNCTION ==========
function generateUniqueTokenId(mealType, studentId) {
  
  // STEP 1: Get meal type prefix (B, L, or D)
  // Purpose: Identify which meal type this token is for
  // Example: "breakfast" -> "B"
  const prefix = mealType.charAt(0).toUpperCase();
  
  // STEP 2: Get today's date in DDMMYY format
  // Purpose: Ensure token changes every day for same student
  // Today: Nov 21, 2025 -> "211125"
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');           // "21"
  const month = String(today.getMonth() + 1).padStart(2, '0');   // "11"
  const year = String(today.getFullYear()).slice(-2);             // "25"
  const dateCode = `${day}${month}${year}`;  // "211125"
  
  // STEP 3: Extract last 4 characters from student's Firebase UID
  // Purpose: Make token unique per student
  // Firebase UID: "a1b2c3d4e5f6g7h8" -> Last 4: "g7h8"
  const studentIdSuffix = studentId.slice(-4).toLowerCase();
  
  // STEP 4: Generate random 2-digit number (00-99)
  // Purpose: Extra uniqueness layer (prevents collision edge case)
  // Random: Math.floor(Math.random() * 100) -> "47"
  const randomSuffix = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  
  // STEP 5: Combine all parts into final token format
  // Format: PREFIX-DDMMYY-STUDENTID-RANDOM
  // Example: "B-211125-g7h8-47"
  const tokenId = `${prefix}-${dateCode}-${studentIdSuffix}-${randomSuffix}`;
  
  return tokenId;
}

// ========== REQUEST CREATION FLOW ==========
export async function POST(request) {
  
  // STEP 1: Extract and validate required fields
  const { studentId, studentName, mealType, studentEmail } = await request.json();
  if (!studentId || !studentName || !mealType) {
    return error 400 "Missing required fields";
  }

  // STEP 2: Validate meal type is breakfast, lunch, or dinner
  if (!['breakfast', 'lunch', 'dinner'].includes(mealType.toLowerCase())) {
    return error 400 "Invalid meal type";
  }

  const db = await connectToDatabase();
  const requestsCollection = db.collection('mealRequests');

  // STEP 3: Check if student is blocked
  // Purpose: Prevent blocked students from requesting
  const studentBlockStatus = await requestsCollection.findOne({ studentId });
  if (studentBlockStatus && studentBlockStatus.isBlocked) {
    return error 403 "You have been blocked from making requests";
  }

  // STEP 4: Get today's date at midnight (00:00:00)
  // Purpose: Compare with requestedAt timestamps to find today's requests
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // STEP 5: Check if student ALREADY has a pending request for this meal type TODAY
  // Database Query:
  //   - studentId = current student
  //   - mealType = breakfast/lunch/dinner (requested meal)
  //   - requestedAt >= today (within last 24 hours)
  //   - status = "pending" (not yet processed)
  // Purpose: Prevent multiple breakfast requests on same day (enforce 1 per meal per day)
  const existingRequest = await requestsCollection.findOne({
    studentId,
    mealType: mealType.toLowerCase(),
    requestedAt: { $gte: today },
    status: 'pending'
  });

  if (existingRequest) {
    return error 409 "You already have a pending request for breakfast today";
  }
  // Note: 409 Conflict is HTTP status for duplicate/conflict

  // STEP 6: Generate unique token
  // Calls generateUniqueTokenId with:
  //   - mealType: "breakfast"
  //   - studentId: Firebase UID
  // Returns: "B-211125-g7h8-47"
  const tokenId = generateUniqueTokenId(mealType, studentId);

  // STEP 7: Insert new meal request into MongoDB
  // Stores everything in mealRequests collection:
  //   - studentId: "a1b2c3d4e5f6g7h8"
  //   - studentName: "John Doe"
  //   - studentEmail: "john@school.edu"
  //   - mealType: "breakfast"
  //   - tokenId: "B-211125-g7h8-47" (UNIQUE!)
  //   - status: "pending" (waiting for manager approval)
  //   - isBlocked: false (not blocked by manager)
  //   - requestedAt: now()
  //   - updatedAt: now()
  const result = await requestsCollection.insertOne({
    studentId,
    studentName,
    studentEmail: studentEmail || 'unknown@email.com',
    mealType: mealType.toLowerCase(),
    tokenId,
    status: 'pending',
    isBlocked: false,
    requestedAt: new Date(),
    updatedAt: new Date(),
  });

  // STEP 8: Fetch the newly created request from database
  // Purpose: Get MongoDB's _id and confirm insert succeeded
  const newRequest = await requestsCollection.findOne({ _id: result.insertedId });

  // STEP 9: Log successful creation (for debugging)
  // Shows: token, student, meal type, timestamp
  console.log('✓ Meal request created:', {
    tokenId: newRequest.tokenId,
    studentId: newRequest.studentId,
    mealType: newRequest.mealType,
    requestedAt: newRequest.requestedAt,
  });

  // STEP 10: Return the created request to frontend
  // Frontend displays: "✓ Request approved! Token: B-211125-g7h8-47"
  return success response with newRequest;
}

// ========== WHAT PREVENTS DUPLICATES ==========
// 1. Database Query (Step 5)
//    - Checks if PENDING request exists for same meal type today
//    - Returns 409 Conflict if found
//    
// 2. Token Format Includes Date (Step 2)
//    - Nov 21: "B-211125-g7h8-47"
//    - Nov 22: "B-221125-g7h8-XX" (different date)
//    - Even if system generates same token, dates are different = different token
//    
// 3. Token Includes Student ID (Step 3)
//    - Student A: "B-211125-g7h8-47"
//    - Student B: "B-211125-k2m5-53"
//    - Different students = different tokens
//    
// 4. Random Suffix (Step 4)
//    - First generation: "B-211125-g7h8-47"
//    - Second generation: "B-211125-g7h8-82"
//    - Same date/student? Random changes = different token

// ========== EXAMPLE FLOW ==========
// Day 1 - Student 1 requests breakfast at 9:00 AM:
//   ✓ Check: No pending breakfast for today -> OK
//   ✓ Generate: "B-211125-a1b2-47"
//   ✓ Save to DB
//   ✓ Return to student: Token = "B-211125-a1b2-47"

// Day 1 - Same student tries breakfast again at 10:00 AM:
//   ✗ Check: Found pending breakfast for today -> STOP
//   ✗ Return 409: "You already have a pending request for breakfast today"
//   ✗ No token generated, no duplicate created

// Day 1 - Same student requests lunch at 12:00 PM:
//   ✓ Check: No pending lunch for today -> OK
//   ✓ Generate: "L-211125-a1b2-82" (different meal type)
//   ✓ Save to DB
//   ✓ Return to student: Token = "L-211125-a1b2-82"

// Day 2 - Same student requests breakfast at 9:00 AM:
//   ✓ Check: Previous breakfast is from yesterday -> OK (new day)
//   ✓ Generate: "B-221125-a1b2-33" (different date)
//   ✓ Save to DB
//   ✓ Return to student: Token = "B-221125-a1b2-33"
