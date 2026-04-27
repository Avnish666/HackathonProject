import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Match } from '@/models/Match';
// Import Content to ensure Mongoose has registered the model for .populate()
import '@/models/Content';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    // Fetch all match records along with their matching original content data
    // Sorted gracefully by newest first
    const matches = await Match.find({})
      .populate('matchedContentId')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: matches }, { status: 200 });
  } catch (error: any) {
    console.error('Results Fetch Error:', error);
    return NextResponse.json({ error: 'Error fetching results' }, { status: 500 });
  }
}
