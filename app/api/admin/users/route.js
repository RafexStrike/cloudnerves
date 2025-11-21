import { connectToDatabase } from '@/lib/mongodb.js';
import { NextResponse } from 'next/server';

// GET all users
export async function GET() {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const users = await usersCollection.find({}).toArray();

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST create new user
export async function POST(request) {
  try {
    const { displayName, email, password, role } = await request.json();

    if (!displayName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Check if email already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Create new user with generated uid
    const uid = `user-${Date.now()}`;
    const newUser = {
      uid,
      displayName,
      email,
      password,
      role: role || 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    console.log('✓ User created by admin:', uid);

    return NextResponse.json(
      {
        ...newUser,
        _id: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
