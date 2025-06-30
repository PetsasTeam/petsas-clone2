 
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided.' });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Use a timestamp to ensure unique filenames
  const filename = `${Date.now()}_${file.name.replaceAll(' ', '_')}`;
  const path = join(process.cwd(), 'public/content', filename);
  
  try {
    await writeFile(path, buffer);
    console.log(`File saved to ${path}`);
    
    const publicUrl = `/content/${filename}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ success: false, error: 'Failed to save file.' });
  }
} 
 