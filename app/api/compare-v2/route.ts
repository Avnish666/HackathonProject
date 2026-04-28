import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { processImageBuffer } from '@/lib/detection';
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

    const { match, distance, suspectHash, isLeak } = await processImageBuffer({
      buffer,
      source_type: 'upload',
      suspectedFilePath: relativeFilePath
    });

    return NextResponse.json({
      success: true,
      data: {
        ...match.toObject(),
        distance: distance,
        suspectHash: suspectHash
      },
      isLeak: isLeak,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Comparison Error:', error);
    return NextResponse.json({ error: 'Error comparing file' }, { status: 500 });
  }
}
