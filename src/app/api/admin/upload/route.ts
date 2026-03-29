import { NextRequest, NextResponse } from 'next/server';
import { saveFileLocally } from '@/lib/upload';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const filePath = await saveFileLocally(file);

    return NextResponse.json({ url: filePath });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload file' }, { status: 500 });
  }
}
