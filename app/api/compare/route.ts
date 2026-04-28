import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Content } from '@/models/Content';
import { Match } from '@/models/Match';
import { generatePHash, getSimilarityPercentage, calculateHammingDistance } from '@/lib/hashUtils';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save the suspected file locally to display it visually later
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `suspect-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);
    const relativeFilePath = `/uploads/${filename}`;

    // Generate Perceptual Hash for the suspected image
    const suspectHash = await generatePHash(buffer);

    // 1-to-N comparison process: Fetch all original hashes from DB
    // MVP iteration: In-memory O(N) loop is extremely fast for under 100k hashes.
    const allOriginals = await Content.find({});

    let bestMatch = null;
    let highestSimilarity = 0;
    let bestDistance: number | null = null;

    for (const original of allOriginals) {
      const similarity = getSimilarityPercentage(suspectHash, original.hash);

      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        bestMatch = original;
      }
    }

    // Save the match record
    const newMatch = await Match.create({
      suspectedFilePath: relativeFilePath,
      matchedContentId: bestMatch ? bestMatch._id : null,
      similarity: highestSimilarity,
    });

    if (bestMatch) {
      bestDistance = calculateHammingDistance(suspectHash, bestMatch.hash);
    }

    // Populate the original file data into the response so the frontend can render both images
    const populatedMatch = await Match.findById(newMatch._id).populate('matchedContentId');

    if (!populatedMatch) {
      return NextResponse.json({
        success: false,
        error: "No match found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...populatedMatch.toObject(),
        distance: bestDistance,
        suspectHash: suspectHash
      },
      isLeak: highestSimilarity >= 85, // Simple threshold logic
    }, { status: 200 });

  } catch (error: any) {
    console.error('Comparison Error:', error);
    return NextResponse.json({ error: 'Error comparing file' }, { status: 500 });
  }
}
