import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  const config = {
    NODE_ENV: process.env.NODE_ENV,
    JCC_TEST_MODE: process.env.JCC_TEST_MODE,
    JCC_TEST_LOGIN: process.env.JCC_TEST_LOGIN ? 'SET' : 'NOT SET',
    JCC_TEST_PASSWORD: process.env.JCC_TEST_PASSWORD ? 'SET' : 'NOT SET',
    JCC_PROD_LOGIN: process.env.JCC_PROD_LOGIN ? 'SET' : 'NOT SET',
    JCC_PROD_PASSWORD: process.env.JCC_PROD_PASSWORD ? 'SET' : 'NOT SET',
  };

  return NextResponse.json({
    success: true,
    config,
    isTestMode: process.env.NODE_ENV === 'development' || process.env.JCC_TEST_MODE === 'true',
  });
} 