import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jsonData } = body;

    if (!jsonData) {
      return NextResponse.json(
        { error: 'No JSON data provided' },
        { status: 400 }
      );
    }

    // Validate JSON structure
    let jsonObj;
    try {
      jsonObj = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    } catch (err: any) {
      return NextResponse.json(
        { error: `Invalid JSON: ${err.message}` },
        { status: 400 }
      );
    }

    // Return the validated JSON (in a real app, you'd save it to a file)
    return NextResponse.json({
      success: true,
      jsonData: JSON.stringify(jsonObj, null, 2),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to save JSON' },
      { status: 500 }
    );
  }
}

