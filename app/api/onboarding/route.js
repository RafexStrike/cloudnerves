import { connectToDatabase } from '@/lib/mongodb.js';
import { NextResponse } from 'next/server';

/**
 * ONBOARDING MANAGEMENT ENDPOINT
 * 
 * This endpoint handles:
 * 1. GET - Fetch all pending onboarding requests (isOnboarded = false)
 * 2. PUT - Manager approves or rejects onboarding requests
 * 3. DELETE - Manager rejects/deletes onboarding request
 * 
 * When a student signs up:
 *   - isOnboarded flag is set to FALSE
 *   - Student appears in manager's pending requests
 *   - Student CANNOT make meal requests until approved
 * 
 * When manager approves:
 *   - isOnboarded flag is set to TRUE
 *   - Student can now make meal requests
 * 
 * When manager rejects/deletes:
 *   - User document is deleted from database
 *   - Student must sign up again
 */

export async function GET() {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    /**
     * STEP 1: Fetch all users with isOnboarded = false
     * These are newly signed-up students waiting for manager approval
     */
    const pendingStudents = await usersCollection
      .find({ isOnboarded: false })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`✓ Fetched ${pendingStudents.length} pending onboarding requests`);

    return NextResponse.json(
      {
        total: pendingStudents.length,
        students: pendingStudents,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error fetching pending onboarding requests:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch onboarding requests' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { uid, action } = await request.json();

    /**
     * STEP 1: Validate parameters
     * - uid: Student's Firebase UID
     * - action: "approve" or "reject"
     */
    if (!uid || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: uid, action' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    if (action.toLowerCase() === 'approve') {
      /**
       * STEP 2a: Manager approves student onboarding
       * Set isOnboarded to TRUE
       * Student can now make meal requests
       */
      const result = await usersCollection.findOneAndUpdate(
        { uid },
        {
          $set: {
            isOnboarded: true,
            approvedAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        );
      }

      console.log(`✓ Student ${uid} approved for onboarding`);

      return NextResponse.json(
        {
          message: `Student ${result.displayName || result.email} has been approved`,
          student: result,
        },
        { status: 200 }
      );
    } else {
      /**
       * STEP 2b: Manager rejects student onboarding
       * Delete the user document
       * Student must sign up again
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
          deletedCount: deleteResult.deletedCount,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('❌ Error updating onboarding status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update onboarding status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { uid } = await request.json();

    /**
     * STEP 1: Validate parameter
     */
    if (!uid) {
      return NextResponse.json(
        { error: 'Missing required field: uid' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    /**
     * STEP 2: Delete the pending student
     * Same as rejecting - removes the student from system
     * Student must sign up again if they want to retry
     */
    const result = await usersCollection.deleteOne({ uid });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    console.log(`✓ Pending student ${uid} deleted`);

    return NextResponse.json(
      {
        message: 'Student onboarding request has been deleted',
        deletedCount: result.deletedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error deleting onboarding request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete onboarding request' },
      { status: 500 }
    );
  }
}
