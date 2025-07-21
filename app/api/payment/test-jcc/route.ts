import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    const config = {
      apiUrl: 'https://gateway-test.jcc.com.cy',
      login: process.env.JCC_TEST_LOGIN || '',
      password: process.env.JCC_TEST_PASSWORD || '',
    };

    console.log('Testing JCC API with config:', {
      apiUrl: config.apiUrl,
      login: config.login ? 'SET' : 'NOT SET',
      password: config.password ? 'SET' : 'NOT SET',
    });

    if (!config.login || !config.password) {
      return NextResponse.json({
        success: false,
        error: 'JCC credentials not configured',
        config: {
          login: config.login ? 'SET' : 'NOT SET',
          password: config.password ? 'SET' : 'NOT SET',
        }
      });
    }

    // Test with a simple order status check (this should return an error for invalid order ID, but in JSON format)
    const payload = {
      userName: config.login,
      password: config.password,
      orderId: 'test-invalid-order-id', // This will fail but should return JSON error
    };

    const apiEndpoint = `${config.apiUrl}/payment/rest/getOrderStatusExtended.do`;
    console.log('Testing JCC endpoint:', apiEndpoint);

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(payload).toString(),
    });

    console.log('JCC Test Response Status:', response.status);
    console.log('JCC Test Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('JCC Test Response Text:', responseText.substring(0, 1000));

    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(responseText);
      return NextResponse.json({
        success: true,
        message: 'JCC API responding with JSON (credentials work)',
        endpoint: apiEndpoint,
        jccResponse: result,
        responseStatus: response.status,
      });
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        message: 'JCC API returned non-JSON response',
        endpoint: apiEndpoint,
        responseStatus: response.status,
        responseText: responseText.substring(0, 500),
        isHtml: responseText.includes('<!DOCTYPE') || responseText.includes('<html'),
      });
    }

  } catch (error) {
    console.error('JCC test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
} 