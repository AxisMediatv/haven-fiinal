import Stripe from 'stripe';

export async function GET() {
  try {
    console.log('Debugging Stripe configuration...');
    
    // Check if Stripe is initialized
    const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
    
    if (!stripe) {
      return Response.json({
        error: 'Stripe not initialized',
        reason: 'STRIPE_SECRET_KEY not found'
      });
    }
    
    // Test Stripe connection
    try {
      const account = await stripe.accounts.retrieve();
      console.log('Stripe connection successful');
      
      return Response.json({
        success: true,
        message: 'Stripe connection working',
        account: {
          id: account.id,
          business_type: account.business_type
        }
      });
      
    } catch (stripeError) {
      console.error('Stripe connection failed:', stripeError);
      return Response.json({
        error: 'Stripe connection failed',
        details: stripeError.message,
        code: stripeError.code
      });
    }
    
  } catch (error) {
    console.error('Debug error:', error);
    return Response.json({ 
      error: 'Debug failed', 
      details: error.message 
    }, { status: 500 });
  }
} 