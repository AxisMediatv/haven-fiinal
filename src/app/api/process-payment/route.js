import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(request) {
    try {
        const { email, plan, promoCode, paymentMethod } = await request.json();

        console.log('Processing payment:', { email, plan, promoCode });

        // Validate promo codes
        if (promoCode) {
            if (promoCode.toUpperCase() === 'BETA30') {
                // 30 days free trial, no card required
                return NextResponse.json({
                    success: true,
                    message: 'BETA30 applied! You get 30 days free trial.',
                    promoCode: 'BETA30',
                    trialDays: 30,
                    requiresCard: false
                });
            } else if (promoCode.toUpperCase() === 'FAMILY30') {
                // 30 days free trial with card on file
                return NextResponse.json({
                    success: true,
                    message: 'FAMILY30 applied! You get 30 days free trial with card on file.',
                    promoCode: 'FAMILY30',
                    trialDays: 30,
                    requiresCard: true
                });
            } else {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid promo code. Please try again.'
                }, { status: 400 });
            }
        }

        // Regular payment processing
        if (!stripe) {
            return NextResponse.json({
                success: false,
                error: 'Payment system not configured'
            }, { status: 503 });
        }

        // Determine plan pricing
        let amount;
        
        switch (plan) {
            case 'starter':
                amount = 299; // $2.99 in cents
                break;
            case 'regular':
                amount = 999; // $9.99 in cents
                break;
            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid plan selected'
                }, { status: 400 });
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method: paymentMethod,
            confirm: true,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`,
            metadata: {
                email: email,
                plan: plan,
                promoCode: promoCode || 'none'
            }
        });

        console.log('Payment processed successfully:', paymentIntent.id);

        return NextResponse.json({
            success: true,
            paymentIntentId: paymentIntent.id,
            message: 'Payment processed successfully!'
        });

    } catch (error) {
        console.error('Payment processing error:', error);
        
        return NextResponse.json({
            success: false,
            error: error.message || 'Payment processing failed'
        }, { status: 500 });
    }
} 