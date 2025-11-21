import { connectToDatabase } from '@/lib/mongodb.js';
import { NextResponse } from 'next/server';

/**
 * PUT /api/meal-requests/student-block/[studentId]
 * Updates the blocked status of a student
 * 
 * Request body:
 * {
 *   "isBlocked": true/false
 * }
 */
export async function PUT(request, { params }) {
  try {
    const { studentId } = await params;
    const { isBlocked } = await request.json();

    if (typeof isBlocked !== 'boolean') {
      return NextResponse.json(
        { error: 'isBlocked must be a boolean' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const requestsCollection = db.collection('mealRequests');

    // Update all requests for this student with blocked status
    const result = await requestsCollection.updateMany(
      { studentId },
      {
        $set: {
          isBlocked,
          updatedAt: new Date(),
        },
      }
    );

    console.log(`✓ Student ${studentId} block status set to: ${isBlocked}`);

    return NextResponse.json(
      {
        message: isBlocked ? 'Student blocked' : 'Student unblocked',
        modifiedCount: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error updating block status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update block status' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/meal-requests/student-block/[studentId]
 * Get all requests for a student (including blocked status)
 */
export async function GET(request, { params }) {
  try {
    const { studentId } = await params;

    const db = await connectToDatabase();
    const requestsCollection = db.collection('mealRequests');

    const requests = await requestsCollection.find({ studentId }).toArray();

    if (requests.length === 0) {
      return NextResponse.json(
        { error: 'No requests found for this student' },
        { status: 404 }
      );
    }

    const isBlocked = requests[0].isBlocked || false;

    return NextResponse.json(
      {
        studentId,
        isBlocked,
        totalRequests: requests.length,
        requests,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error fetching student requests:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch student requests' },
      { status: 500 }
    );
  }
}
