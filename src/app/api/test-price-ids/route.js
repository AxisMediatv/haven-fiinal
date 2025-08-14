import Stripe from 'stripe';

export async function GET() {
  try {
    console.log('Testing Stripe price IDs...');
    
    const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
    
    if (!stripe) {
      return Response.json({
        error: 'Stripe not initialized',
        reason: 'STRIPE_SECRET_KEY not found'
      });
    }
    
    // Get all price IDs from environment
    const priceIds = {
      STRIPE_BETA_PRICE_ID: process.env.STRIPE_BETA_PRICE_ID,
      STRIPE_STARTER_PRICE_ID: process.env.STRIPE_STARTER_PRICE_ID,
      STRIPE_REGULAR_PRICE_ID: process.env.STRIPE_REGULAR_PRICE_ID,
      STRIPE_FAMILY_PRICE_ID: process.env.STRIPE_FAMILY_PRICE_ID,
      STRIPE_EMERGENCY_PRICE_ID: process.env.STRIPE_EMERGENCY_PRICE_ID
    };
    
    // Test each price ID
    const results = {};
    for (const [key, priceId] of Object.entries(priceIds)) {
      if (!priceId) {
        results[key] = { valid: false, error: 'Not set in environment' };
        continue;
      }
      
      try {
        const price = await stripe.prices.retrieve(priceId);
        results[key] = { 
          valid: true, 
          price: {
            id: price.id,
            unit_amount: price.unit_amount,
            currency: price.currency,
            product: price.product
          }
        };
      } catch (error) {
        results[key] = { 
          valid: false, 
          error: error.message,
          code: error.code
        };
      }
    }
    
    return Response.json({
      message: 'Price ID test results',
      results: results
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return Response.json({ 
      error: 'Test failed', 
      details: error.message 
    }, { status: 500 });
  }
} 