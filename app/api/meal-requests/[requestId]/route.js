import { connectToDatabase } from '@/lib/mongodb.js';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

/**
 * GET /api/meal-requests/[requestId]
 * Fetch a single meal request by ID
 */
export async function GET(request, { params }) {
  try {
    const { requestId } = await params;

    const db = await connectToDatabase();
    const requestsCollection = db.collection('mealRequests');

    const mealRequest = await requestsCollection.findOne({ _id: new ObjectId(requestId) });

    if (!mealRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(mealRequest, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching meal request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch meal request' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/meal-requests/[requestId]
 * Update a meal request status (pending → accepted/denied)
 */
export async function PUT(request, { params }) {
  try {
    const { requestId } = await params;
    const { status } = await request.json();

    if (!['pending', 'accepted', 'denied'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be pending, accepted, or denied' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const requestsCollection = db.collection('mealRequests');

    const result = await requestsCollection.findOneAndUpdate(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    console.log(`✓ Request ${requestId} updated to ${status}`);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('❌ Error updating meal request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update meal request' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/meal-requests/[requestId]
 * Delete a meal request (manager can delete pending requests)
 * This is used by managers to dismiss/delete requests
 */
export async function DELETE(request, { params }) {
  try {
    const { requestId } = await params;

    const db = await connectToDatabase();
    const requestsCollection = db.collection('mealRequests');

    // Find the request first to log info
    const mealRequest = await requestsCollection.findOne({ _id: new ObjectId(requestId) });
    
    if (!mealRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Delete the request
    const result = await requestsCollection.deleteOne({ _id: new ObjectId(requestId) });

    console.log(`✓ Request ${requestId} deleted by manager (student: ${mealRequest.studentName})`);

    return NextResponse.json(
      {
        message: 'Request deleted successfully',
        deletedRequest: mealRequest,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error deleting meal request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete meal request' },
      { status: 500 }
    );
  }
}
