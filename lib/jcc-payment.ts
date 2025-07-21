// JCC Payment Gateway Integration
// Documentation: https://gateway.jcc.com.cy/developer/

export interface JCCOrderRequest {
  amount: number; // Amount in cents (e.g., 29.99 EUR = 2999)
  currency: string; // EUR for Cyprus
  orderNumber: string; // Unique order number from your system
  description: string; // Order description
  returnUrl: string; // Success redirect URL
  failUrl: string; // Failure redirect URL
  // Optional fields
  customerDetails?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
  jsonParams?: Record<string, any>; // Additional parameters to pass back
}

export interface JCCOrderResponse {
  success: boolean;
  orderId?: string; // JCC order ID
  formUrl?: string; // URL to redirect customer for payment
  error?: string;
}

// JCC API Configuration
const JCC_CONFIG = {
  // Test environment - using the exact URL you provided
  TEST_API_URL: 'https://gateway-test.jcc.com.cy',
  TEST_LOGIN: process.env.JCC_TEST_LOGIN || '',
  TEST_PASSWORD: process.env.JCC_TEST_PASSWORD || '',
  
  // Production environment  
  PROD_API_URL: 'https://gateway.jcc.com.cy',
  PROD_LOGIN: process.env.JCC_PROD_LOGIN || '',
  PROD_PASSWORD: process.env.JCC_PROD_PASSWORD || '',
  
  // Current mode
  IS_TEST: process.env.NODE_ENV === 'development' || process.env.JCC_TEST_MODE === 'true',
};

// Get current configuration
function getConfig() {
  return {
    apiUrl: JCC_CONFIG.IS_TEST ? JCC_CONFIG.TEST_API_URL : JCC_CONFIG.PROD_API_URL,
    login: JCC_CONFIG.IS_TEST ? JCC_CONFIG.TEST_LOGIN : JCC_CONFIG.PROD_LOGIN,
    password: JCC_CONFIG.IS_TEST ? JCC_CONFIG.TEST_PASSWORD : JCC_CONFIG.PROD_PASSWORD,
  };
}

/**
 * Create payment order with JCC
 */
export async function createJCCPaymentOrder(orderData: JCCOrderRequest): Promise<JCCOrderResponse> {
  try {
    const config = getConfig();
    
    // Debug environment variables
    console.log('JCC Configuration Debug:', {
      IS_TEST: JCC_CONFIG.IS_TEST,
      NODE_ENV: process.env.NODE_ENV,
      JCC_TEST_MODE: process.env.JCC_TEST_MODE,
      TEST_LOGIN: process.env.JCC_TEST_LOGIN ? 'SET' : 'NOT SET',
      TEST_PASSWORD: process.env.JCC_TEST_PASSWORD ? 'SET' : 'NOT SET',
      config_login: config.login ? 'SET' : 'NOT SET',
      config_password: config.password ? 'SET' : 'NOT SET',
    });
    
    if (!config.login || !config.password) {
      const mode = JCC_CONFIG.IS_TEST ? 'test' : 'production';
      throw new Error(`JCC ${mode} credentials not configured. Please set JCC_${mode.toUpperCase()}_LOGIN and JCC_${mode.toUpperCase()}_PASSWORD environment variables.`);
    }

    // Prepare the request payload for JCC API
    // JCC uses numeric currency codes: 978 = EUR, 840 = USD
    const currencyCode = orderData.currency === 'EUR' ? '978' : orderData.currency;
    
    const payload = {
      userName: config.login,
      password: config.password,
      amount: orderData.amount.toString(), // Amount in cents
      currency: currencyCode,
      orderNumber: orderData.orderNumber,
      description: orderData.description,
      returnUrl: orderData.returnUrl,
      failUrl: orderData.failUrl,
      // Optional fields
      ...(orderData.customerDetails?.email && { email: orderData.customerDetails.email }),
      ...(orderData.customerDetails?.phone && { phone: orderData.customerDetails.phone }),
      jsonParams: JSON.stringify(orderData.jsonParams || {}),
    };

    console.log('Creating JCC payment order:', {
      ...payload,
      password: '[HIDDEN]', // Don't log password
    });

    // Call JCC API to create payment order
    const apiEndpoint = `${config.apiUrl}/payment/rest/register.do`;
    console.log('JCC API Endpoint:', apiEndpoint);
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(payload).toString(),
    });
    
    console.log('JCC API Response Status:', response.status);
    console.log('JCC API Response Headers:', Object.fromEntries(response.headers.entries()));

    // Get response text first
    const responseText = await response.text();
    console.log('JCC API Response Text:', responseText);

    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (error) {
      console.log('JCC API returned non-JSON response');
      throw new Error(`JCC API returned non-JSON response (${response.status}): ${responseText.substring(0, 500)}`);
    }

    if (result.orderId && result.formUrl) {
      // Success - return the payment URL
      console.log('JCC payment order created successfully:', result);
      return {
        success: true,
        orderId: result.orderId,
        formUrl: result.formUrl,
      };
    } else if (result.errorCode && result.errorCode !== '0') {
      // Error from JCC
      console.error('JCC payment order creation failed:', result);
      return {
        success: false,
        error: result.errorMessage || 'Failed to create payment order',
      };
    } else {
      // Unknown response format
      console.error('Unexpected JCC API response:', result);
      return {
        success: false,
        error: 'Unexpected response from payment gateway',
      };
    }
  } catch (error) {
    console.error('JCC payment order creation error:', error);
    return {
      success: false,
      error: 'Network error while creating payment order',
    };
  }
}

/**
 * Verify payment status with JCC
 */
export async function verifyJCCPayment(orderId: string): Promise<{
  success: boolean;
  status?: string;
  amount?: number;
  currency?: string;
  error?: string;
}> {
  try {
    const config = getConfig();
    
    if (!config.login || !config.password) {
      const mode = JCC_CONFIG.IS_TEST ? 'test' : 'production';
      throw new Error(`JCC ${mode} credentials not configured for verification. Please set JCC_${mode.toUpperCase()}_LOGIN and JCC_${mode.toUpperCase()}_PASSWORD environment variables.`);
    }
    
    const payload = {
      userName: config.login,
      password: config.password,
      orderId: orderId,
    };

    const apiEndpoint = `${config.apiUrl}/payment/rest/getOrderStatusExtended.do`;
    console.log('JCC Verification API Endpoint:', apiEndpoint);
    console.log('JCC Verification Payload:', {
      ...payload,
      password: '[HIDDEN]',
    });

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(payload).toString(),
    });

    console.log('JCC Verification Response Status:', response.status);
    console.log('JCC Verification Response Headers:', Object.fromEntries(response.headers.entries()));

    // Get response text first to check if it's JSON
    const responseText = await response.text();
    console.log('JCC Verification Response Text:', responseText);

    // Check if response is JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JCC verification returned non-JSON response:', responseText.substring(0, 500));
      
      // Check if it's an HTML error page
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
        console.log('JCC API returned HTML page - likely authentication or endpoint error');
        
        // In test mode, provide more helpful error message
        const isTestMode = process.env.NODE_ENV === 'development' || process.env.JCC_TEST_MODE === 'true';
        if (isTestMode) {
          return {
            success: false,
            error: 'JCC API returned HTML error page. This usually means authentication failed or wrong endpoint. Check credentials and API URL.',
          };
        }
      }
      
      return {
        success: false,
        error: `JCC API returned non-JSON response (${response.status}): ${responseText.substring(0, 200)}`,
      };
    }

    console.log('JCC Verification Parsed Result:', result);

    if (result.errorCode === '0') {
      return {
        success: true,
        status: result.orderStatus, // 0 = not paid, 1 = pre-authorized, 2 = paid
        amount: result.amount,
        currency: result.currency,
      };
    } else {
      console.error('JCC verification failed with error:', result);
      return {
        success: false,
        error: result.errorMessage || `JCC Error Code: ${result.errorCode}`,
      };
    }
  } catch (error) {
    console.error('JCC payment verification error:', error);
    return {
      success: false,
      error: `Network error while verifying payment: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Generate JCC payment URL for direct integration
 */
export function generateJCCPaymentUrl(orderId: string): string {
  const config = getConfig();
  return `${config.apiUrl}/payment?mdOrder=${orderId}`;
}

/**
 * Format amount for JCC (convert EUR to cents)
 */
export function formatAmountForJCC(amount: number): number {
  return Math.round(amount * 100); // Convert to cents
}

/**
 * Format amount from JCC (convert cents to EUR)
 */
export function formatAmountFromJCC(amount: number): number {
  return amount / 100; // Convert from cents
} 