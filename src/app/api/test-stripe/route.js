export async function GET() {
  try {
    console.log('Testing Stripe configuration...');
    
    // Check environment variables
    const envVars = {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'Set (starts with ' + process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...)' : 'Not set',
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY ? 'Set (starts with ' + process.env.STRIPE_PUBLISHABLE_KEY.substring(0, 10) + '...)' : 'Not set',
      STRIPE_BETA_PRICE_ID: process.env.STRIPE_BETA_PRICE_ID || 'Not set',
      STRIPE_STARTER_PRICE_ID: process.env.STRIPE_STARTER_PRICE_ID || 'Not set',
      STRIPE_REGULAR_PRICE_ID: process.env.STRIPE_REGULAR_PRICE_ID || 'Not set',
      STRIPE_FAMILY_PRICE_ID: process.env.STRIPE_FAMILY_PRICE_ID || 'Not set',
      STRIPE_EMERGENCY_PRICE_ID: process.env.STRIPE_EMERGENCY_PRICE_ID || 'Not set'
    };
    
    return Response.json({
      message: 'Stripe configuration test',
      environment: envVars,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return Response.json({ 
      error: 'Test failed', 
      details: error.message 
    }, { status: 500 });
  }
} 