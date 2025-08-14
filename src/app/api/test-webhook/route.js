import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook test endpoint is working!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      message: 'Webhook POST endpoint is working!',
      receivedData: body,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Invalid JSON',
      message: error.message,
      status: 'error'
    }, { status: 400 });
  }
}
