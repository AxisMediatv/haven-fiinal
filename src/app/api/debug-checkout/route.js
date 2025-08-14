import Stripe from 'stripe';

export async function POST(request) {
  try {
    console.log('=== DEBUG CHECKOUT START ===');
    
    const { planType } = await request.json();
    console.log('Plan type received:', planType);
    
    // Check Stripe initialization
    const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
    console.log('Stripe initialized:', !!stripe);
    
    if (!stripe) {
      return Response.json({ error: 'Stripe not initialized' });
    }
    
    // Define plans
    const plans = {
      starter: {
        name: 'Starter Plan',
        priceId: process.env.STRIPE_STARTER_PRICE_ID,
        description: '300 tokens + Journaling access'
      },
      regular: {
        name: 'Regular Plan', 
        priceId: process.env.STRIPE_REGULAR_PRICE_ID,
        description: '1,500 tokens + Journaling access'
      }
    };
    
    const selectedPlan = plans[planType];
    console.log('Selected plan:', selectedPlan);
    
    if (!selectedPlan) {
      return Response.json({ error: 'Invalid plan type' });
    }
    
    // Test price retrieval
    try {
      console.log('Testing price retrieval for:', selectedPlan.priceId);
      const price = await stripe.prices.retrieve(selectedPlan.priceId);
      console.log('Price retrieved successfully:', price.id);
    } catch (priceError) {
      console.error('Price retrieval failed:', priceError);
      return Response.json({ error: 'Price retrieval failed', details: priceError.message });
    }
    
    // Test session creation
    try {
      console.log('Creating checkout session...');
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: selectedPlan.priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `http://localhost:3004/haven-chat/plans.html?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:3004/haven-chat/plans.html?canceled=true`,
        metadata: {
          planType: planType,
          userId: 'user_' + Date.now(),
        },
        billing_address_collection: 'auto',
      });
      
      console.log('Session created successfully:', session.id);
      return Response.json({ 
        success: true,
        sessionId: session.id, 
        url: session.url 
      });
      
    } catch (sessionError) {
      console.error('Session creation failed:', sessionError);
      return Response.json({ 
        error: 'Session creation failed', 
        details: sessionError.message,
        code: sessionError.code
      });
    }
    
  } catch (error) {
    console.error('Debug checkout error:', error);
    return Response.json({ 
      error: 'Debug failed', 
      details: error.message 
    }, { status: 500 });
  }
} 