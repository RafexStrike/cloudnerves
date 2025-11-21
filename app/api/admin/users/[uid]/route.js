import { connectToDatabase } from '@/lib/mongodb.js';
import { NextResponse } from 'next/server';

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

    console.log('✓ User deleted:', uid);

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
