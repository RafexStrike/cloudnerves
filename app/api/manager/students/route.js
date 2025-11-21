import { connectToDatabase } from '@/lib/mongodb.js';
import { NextResponse } from 'next/server';

// GET all students
export async function GET() {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Get all students (role = 'student')
    const students = await usersCollection.find({ role: 'student' }).toArray();

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching students:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
