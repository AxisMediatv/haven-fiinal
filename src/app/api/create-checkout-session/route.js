import Stripe from 'stripe';

// Only initialize Stripe if the secret key exists
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    console.log('Creating Stripe checkout session...');
    
    // Check if Stripe is configured
    if (!stripe) {
      console.log('Stripe not configured - returning mock response');
      return Response.json({ 
        mock: true,
        url: `http://${request.headers.get('host')}/haven-chat/success.html?session_id=mock_${Date.now()}&planType=${planType}`
      });
    }
    
    const { planType, promoCode } = await request.json();
    
    console.log('Plan type requested:', planType);
    console.log('Promo code:', promoCode);
    console.log('Stripe secret key exists:', !!process.env.STRIPE_SECRET_KEY);
    console.log('Stripe secret key starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 10));

    // If promo code is provided, default to Regular plan
    const finalPlanType = promoCode ? 'regular' : planType;

    // Define your plans and their Stripe price IDs
    const plans = {
      beta: {
        name: 'BETA TESTING',
        price: 199, // $1.99 in cents
        priceId: process.env.STRIPE_BETA_PRICE_ID || 'price_beta_testing',
        description: 'Beta testing plan - Limited access for testing purposes',
        tokens: 50,
        originalPrice: 399
      },
      starter: {
        name: 'Starter Plan',
        price: 299, // $2.99 in cents (50% off from $5.99)
        priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_plan',
        description: '300 tokens + Journaling access (Beta 50% discount)',
        tokens: 300,
        originalPrice: 599
      },
      regular: {
        name: 'Regular Plan', 
        price: 999, // $9.99 in cents (50% off from $19.99)
        priceId: process.env.STRIPE_REGULAR_PRICE_ID || 'price_regular_plan',
        description: '1,500 tokens + Journaling access (Beta 50% discount)',
        tokens: 1500,
        originalPrice: 1999
      },
      family: {
        name: 'Premium Family Plan',
        price: 1999, // $19.99 in cents
        priceId: process.env.STRIPE_FAMILY_PRICE_ID || 'price_family_plan',
        description: '4,000 tokens + Journaling + 4 users (Coming Soon)',
        tokens: 4000,
        originalPrice: 3999,
        available: false
      },
             emergency: {
         name: 'Token Top-up',
         price: 299, // $2.99 in cents
         priceId: process.env.STRIPE_TOKENS_PRICE_ID || 'price_1RqwoyIwaWv1ScRrorUT40iO',
         description: '100 tokens when you run out',
         tokens: 100,
         originalPrice: 299
       }
    };

    const selectedPlan = plans[finalPlanType];
    console.log('Selected plan:', selectedPlan);
    if (!selectedPlan) {
      return Response.json({ error: 'Invalid plan type' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Determine if this is a one-time payment or subscription
    const isOneTimePayment = finalPlanType === 'beta' || finalPlanType === 'emergency';
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPlan.priceId, // Use the existing Stripe price ID
          quantity: 1,
        },
      ],
      mode: isOneTimePayment ? 'payment' : 'subscription', // Use payment mode for one-time, subscription for recurring
      success_url: `${request.headers.get('origin') || 'https://www.havenei.com'}/haven-chat/success?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin') || 'https://www.havenei.com'}/haven-chat/plans?canceled=true`,
                            payment_method_collection: 'always',
       payment_method_options: {
         card: {
           request_three_d_secure: 'automatic',
         },
       },
       payment_method_types: ['card'],
       billing_address_collection: 'auto',
      metadata: {
        planType: finalPlanType,
        originalPlanType: planType,
        promoCode: promoCode || null,
        userId: 'user_' + Date.now(), // You can replace this with actual user ID
      },
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      ...(isOneTimePayment ? {} : {
        subscription_data: {
          metadata: {
            planType: finalPlanType,
          },
        },
      }),
    });

    console.log('Stripe session created successfully:', session.id);
    return Response.json({ 
      sessionId: session.id, 
      url: session.url,
      redirect: true 
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ 
      error: 'Failed to create checkout session', 
      details: error.message 
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
} 