import { NextResponse } from 'next/server';

export async function GET() {
  console.log('=== TEST ENV ENDPOINT ===');
  console.log('All env vars with GOOGLE:', Object.keys(process.env).filter(key => key.includes('GOOGLE')));
  console.log('GOOGLE_HAVEN_DATA:', process.env.GOOGLE_HAVEN_DATA);
  console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
  console.log('=== END TEST ===');
  
  return NextResponse.json({
    GOOGLE_HAVEN_DATA: process.env.GOOGLE_HAVEN_DATA,
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    allGoogleVars: Object.keys(process.env).filter(key => key.includes('GOOGLE'))
  });
} 