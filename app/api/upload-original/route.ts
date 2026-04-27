import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Content } from '@/models/Content';
import { generatePHash } from '@/lib/hashUtils';
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

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename and save to local storage
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    // Generate Perceptual Hash
    const hash = await generatePHash(buffer);

    // Save to the database
    const relativeFilePath = `/uploads/${filename}`;
    const newContent = await Content.create({
      filePath: relativeFilePath,
      hash,
    });

    return NextResponse.json({ success: true, data: newContent }, { status: 201 });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
  }
}
