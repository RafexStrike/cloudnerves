import { connectToDatabase } from '@/lib/mongodb.js';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { uid } = await params;
    console.log('🔍 GET /api/users/ - Looking for uid:', uid);

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ uid });
    console.log('📍 Found user:', user);

    if (!user) {
      console.log('❌ User not found for uid:', uid);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('❌ Error in GET /api/users/[uid]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { uid } = await params;
    const updateData = await request.json();
    console.log('📝 PUT /api/users/ - Updating uid:', uid, 'with:', updateData);

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const result = await usersCollection.findOneAndUpdate(
      { uid },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    console.log('📍 Update result:', result);

    if (!result) {
      console.log('❌ User not found for update uid:', uid);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✓ User updated:', result);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('❌ Error in PUT /api/users/[uid]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { uid } = await params;

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const result = await usersCollection.deleteOne({ uid });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error in DELETE /api/users/[uid]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
