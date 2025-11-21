import { connectToDatabase } from '@/lib/mongodb.js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const userData = await request.json();

    if (!userData.uid || !userData.email) {
      return NextResponse.json(
        { error: 'Missing uid or email' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ uid: userData.uid });

    if (existingUser) {
      console.log('User already exists:', userData.uid);
      return NextResponse.json(existingUser, { status: 200 });
    }

    console.log('Creating new user:', userData.uid);

    // Create new user with onboarding flag set to false and role set to "student"
    // Student will not be able to make requests until manager approves (sets isOnboarded to true)
    const result = await usersCollection.insertOne({
      uid: userData.uid,
      displayName: userData.displayName || '',
      email: userData.email || '',
      photoURL: userData.photoURL || '',
      phoneNumber: userData.phoneNumber || '',
      role: 'student',           // ✅ NEW: Default role for all new signups
      isOnboarded: false,        // Flag: Student is pending manager approval
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newUser = await usersCollection.findOne({ _id: result.insertedId });

    console.log('✓ User created:', newUser);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('❌ Error in POST /api/users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
