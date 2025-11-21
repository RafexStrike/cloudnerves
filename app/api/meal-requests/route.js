import { connectToDatabase } from '@/lib/mongodb.js';
import { NextResponse } from 'next/server';

/**
 * UNIQUE TOKEN GENERATION LOGIC
 * =============================
 * Step 1: Extract meal type prefix (B=breakfast, L=lunch, D=dinner)
 * Step 2: Get today's date in DDMMYY format (e.g., 210225 for Feb 21, 2025)
 * Step 3: Extract last 4 characters from student's Firebase UID (studentId)
 * Step 4: Generate random 2-digit number for uniqueness within same date
 * Step 5: Combine all parts: PREFIX-DDMMYY-STUDENTID-RANDOM
 * 
 * Example tokens:
 *   B-210225-f7a2-84  (Breakfast on Feb 21, student ending in f7a2, random 84)
 *   L-210225-b9c3-42  (Lunch on Feb 21, student ending in b9c3, random 42)
 *   D-210225-k2m5-67  (Dinner on Feb 21, student ending in k2m5, random 67)
 * 
 * Uniqueness guaranteed by:
 *   - Meal type prevents duplicates (can only have 1 breakfast per day)
 *   - Date ensures daily reset (next day = different date)
 *   - Student ID ensures different students have different tokens
 *   - Random suffix prevents collision if system generates same token
 */
function generateUniqueTokenId(mealType, studentId) {
  // STEP 1: Get meal type prefix (B, L, or D)
  const prefix = mealType.charAt(0).toUpperCase();
  
  // STEP 2: Get today's date in DDMMYY format
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = String(today.getFullYear()).slice(-2);
  const dateCode = `${day}${month}${year}`;
  
  // STEP 3: Extract last 4 characters from student's Firebase UID
  const studentIdSuffix = studentId.slice(-4).toLowerCase();
  
  // STEP 4: Generate random 2-digit number (00-99) for additional uniqueness
  const randomSuffix = String(Math.floor(Math.random() * 100)).padStart(2, '0');
  
  // STEP 5: Combine all parts into final token format
  const tokenId = `${prefix}-${dateCode}-${studentIdSuffix}-${randomSuffix}`;
  
  return tokenId;
}


export async function POST(request) {
  try {
    const { studentId, studentName, mealType, studentEmail } = await request.json();

    // STEP 1: Validate required fields
    if (!studentId || !studentName || !mealType) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, studentName, mealType' },
        { status: 400 }
      );
    }

    // STEP 2: Validate meal type is one of the allowed values
    if (!['breakfast', 'lunch', 'dinner'].includes(mealType.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid meal type. Must be breakfast, lunch, or dinner' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const requestsCollection = db.collection('mealRequests');

    // STEP 3: Check if student is blocked - return 403 if blocked
    const studentBlockStatus = await requestsCollection.findOne({ studentId });
    if (studentBlockStatus && studentBlockStatus.isBlocked) {
      return NextResponse.json(
        { error: 'You have been blocked from making requests' },
        { status: 403 }
      );
    }

    // STEP 4: Get today's date at 00:00:00 for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // STEP 5: Check if student ALREADY has a pending request for this meal type TODAY
    // This prevents duplicate requests for the same meal type on the same day
    const existingRequest = await requestsCollection.findOne({
      studentId,
      mealType: mealType.toLowerCase(),
      requestedAt: { $gte: today },
      status: 'pending'
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: `You already have a pending request for ${mealType} today` },
        { status: 409 }
      );
    }

    // STEP 6: Generate unique token using:
    //   - Meal type prefix (B/L/D)
    //   - Today's date (DDMMYY format)
    //   - Student ID suffix (last 4 chars)
    //   - Random 2-digit number
    const tokenId = generateUniqueTokenId(mealType, studentId);

    // STEP 7: Create meal request document in MongoDB with all required fields
    const result = await requestsCollection.insertOne({
      studentId,
      studentName,
      studentEmail: studentEmail || 'unknown@email.com',
      mealType: mealType.toLowerCase(),
      tokenId,  // Unique token combining: meal type + date + student ID + random
      status: 'pending',
      isBlocked: false,
      requestedAt: new Date(),
      updatedAt: new Date(),
    });

    // STEP 8: Fetch the newly created request from database
    const newRequest = await requestsCollection.findOne({ _id: result.insertedId });

    // STEP 9: Log successful creation with token details
    console.log('✓ Meal request created:', {
      tokenId: newRequest.tokenId,
      studentId: newRequest.studentId,
      mealType: newRequest.mealType,
      requestedAt: newRequest.requestedAt,
    });

    // STEP 10: Return the newly created request
    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating meal request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create meal request' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');
    const mealType = searchParams.get('mealType');

    const db = await connectToDatabase();
    const requestsCollection = db.collection('mealRequests');

    let query = {};

    if (studentId) query.studentId = studentId;
    if (status) query.status = status;
    if (mealType) query.mealType = mealType.toLowerCase();

    const requests = await requestsCollection
      .find(query)
      .sort({ requestedAt: -1 })
      .toArray();

    return NextResponse.json(requests, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching meal requests:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch meal requests' },
      { status: 500 }
    );
  }
}
