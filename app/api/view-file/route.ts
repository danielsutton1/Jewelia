import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const data = formData.get('data') as string;
    const url = formData.get('url') as string;

    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing file information' },
        { status: 400 }
      );
    }

    // If we have a direct URL, redirect to it
    if (url) {
      return NextResponse.redirect(url);
    }

    // If we have base64 data, serve it as the file
    if (data) {
      // Remove the data URL prefix if present
      const base64Data = data.startsWith('data:') ? data.split(',')[1] : data;
      
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Set appropriate headers
      const headers = new Headers();
      headers.set('Content-Type', type);
      headers.set('Content-Disposition', `inline; filename="${name}"`);
      headers.set('Content-Length', buffer.length.toString());
      
      return new NextResponse(buffer, {
        status: 200,
        headers
      });
    }

    return NextResponse.json(
      { success: false, error: 'No file data provided' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (url) {
      return NextResponse.redirect(url);
    }

    return NextResponse.json(
      { success: false, error: 'No file URL provided' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 