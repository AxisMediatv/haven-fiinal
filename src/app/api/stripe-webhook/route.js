import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { google } from 'googleapis';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Google Sheets
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_HAVEN_DATA;
const SHEET_NAME = 'Haven-data';

// Token limits for each plan
const TOKEN_LIMITS = {
  beta: 50,
  starter: 300,
  regular: 1500,
  family: 4000
};

// Helper function to find user row in Google Sheets
async function findUserRow(customerEmail) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:O`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return null;

    // Find row with matching email (assuming email is in column B)
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][1] === customerEmail) { // Column B (index 1) for email
        return i + 1; // Google Sheets is 1-indexed
      }
    }
    return null;
  } catch (error) {
    console.error('Error finding user row:', error);
    return null;
  }
}

// Helper function to update Google Sheets
async function updateGoogleSheets(customerEmail, subscriptionData) {
  try {
    // Check if we need to add new columns
    const headersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:Z1`,
    });

    const headers = headersResponse.data.values?.[0] || [];
    let needsNewColumns = false;
    let newColumns = [];

    // Check if we need to add new columns
    if (!headers.includes('Customer Email')) {
      newColumns.push('Customer Email');
      needsNewColumns = true;
    }
    if (!headers.includes('Subscription Status')) {
      newColumns.push('Subscription Status');
      needsNewColumns = true;
    }
    if (!headers.includes('Plan Type')) {
      newColumns.push('Plan Type');
      needsNewColumns = true;
    }
    if (!headers.includes('Amount Paid')) {
      newColumns.push('Amount Paid');
      needsNewColumns = true;
    }
    if (!headers.includes('Payment Date')) {
      newColumns.push('Payment Date');
      needsNewColumns = true;
    }
    if (!headers.includes('Stripe Customer ID')) {
      newColumns.push('Stripe Customer ID');
      needsNewColumns = true;
    }
    if (!headers.includes('Token Balance')) {
      newColumns.push('Token Balance');
      needsNewColumns = true;
    }
    if (!headers.includes('Last Token Reset')) {
      newColumns.push('Last Token Reset');
      needsNewColumns = true;
    }

    // Add new columns if needed
    if (needsNewColumns) {
      const newRange = `${SHEET_NAME}!${String.fromCharCode(65 + headers.length)}1`;
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: newRange,
        valueInputOption: 'RAW',
        resource: {
          values: [newColumns]
        }
      });
      
      console.log('Added new columns:', newColumns);
    }

    // Find or create user row
    let userRow = await findUserRow(customerEmail);
    
    if (!userRow) {
      // Create new user row
      const newRow = [
        new Date().toISOString(), // Timestamp
        customerEmail, // Customer Email
        '', // Session ID
        '', // Conversation Title
        '', // Save Timestamp
        '', // Save Type
        '', // Type
        '', // Messages
        '', // Status
        '', // Tokens Used
        '', // Cost Per Message 4
        '', // Cost Per Message mini
        '', // Total Cost
        '', // ChatGPT Model
        subscriptionData.customerId, // Stripe Customer ID
        subscriptionData.status, // Subscription Status
        subscriptionData.planType, // Plan Type
        subscriptionData.amount, // Amount Paid
        subscriptionData.paymentDate, // Payment Date
        TOKEN_LIMITS[subscriptionData.planType] || 0, // Token Balance
        new Date().toISOString() // Last Token Reset
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:A`,
        valueInputOption: 'RAW',
        resource: {
          values: [newRow]
        }
      });
      
      console.log('Created new user row for:', customerEmail);
    } else {
      // Update existing user row
      const updateRange = `${SHEET_NAME}!O${userRow}:U${userRow}`;
      const updateValues = [
        [
          subscriptionData.customerId, // Stripe Customer ID
          subscriptionData.status, // Subscription Status
          subscriptionData.planType, // Plan Type
          subscriptionData.amount, // Amount Paid
          subscriptionData.paymentDate, // Payment Date
          TOKEN_LIMITS[subscriptionData.planType] || 0, // Token Balance
          new Date().toISOString() // Last Token Reset
        ]
      ];

      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: updateRange,
        valueInputOption: 'RAW',
        resource: {
          values: updateValues
        }
      });
      
      console.log('Updated existing user row for:', customerEmail);
    }

    return true;
  } catch (error) {
    console.error('Error updating Google Sheets:', error);
    return false;
  }
}

// Handle subscription events
async function handleSubscriptionEvent(event) {
  const subscription = event.data.object;
  
  try {
    // Get customer details
    const customer = await stripe.customers.retrieve(subscription.customer);
    const customerEmail = customer.email;
    
    // Get plan details
    const planType = subscription.metadata?.planType || 'starter';
    const amount = (subscription.items.data[0]?.price.unit_amount / 100).toFixed(2);
    
    const subscriptionData = {
      customerId: subscription.customer,
      status: subscription.status,
      planType: planType,
      amount: amount,
      paymentDate: new Date().toISOString()
    };

    // Update Google Sheets
    await updateGoogleSheets(customerEmail, subscriptionData);
    
    console.log(`✅ Updated Google Sheets for customer: ${customerEmail}, plan: ${planType}`);
    
  } catch (error) {
    console.error('Error handling subscription event:', error);
  }
}

// Handle invoice payment events
async function handleInvoiceEvent(event) {
  const invoice = event.data.object;
  
  try {
    if (invoice.status === 'paid' && invoice.subscription) {
      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const customer = await stripe.customers.retrieve(subscription.customer);
      const customerEmail = customer.email;
      
      // Get plan details
      const planType = subscription.metadata?.planType || 'starter';
      const amount = (invoice.amount_paid / 100).toFixed(2);
      
      const subscriptionData = {
        customerId: subscription.customer,
        status: subscription.status,
        planType: planType,
        amount: amount,
        paymentDate: new Date().toISOString()
      };

      // Update Google Sheets
      await updateGoogleSheets(customerEmail, subscriptionData);
      
      console.log(`✅ Updated Google Sheets for invoice payment: ${customerEmail}, plan: ${planType}`);
    }
    
  } catch (error) {
    console.error('Error handling invoice event:', error);
  }
}

// Main webhook handler
export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (_err) {
      console.error('Webhook signature verification failed:', _err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`📡 Received Stripe webhook: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
        console.log('🆕 New subscription created');
        await handleSubscriptionEvent(event);
        break;
        
      case 'customer.subscription.updated':
        console.log('🔄 Subscription updated');
        await handleSubscriptionEvent(event);
        break;
        
      case 'customer.subscription.deleted':
        console.log('❌ Subscription deleted');
        await handleSubscriptionEvent(event);
        break;
        
      case 'invoice.payment_succeeded':
        console.log('💰 Invoice payment succeeded');
        await handleInvoiceEvent(event);
        break;
        
      case 'invoice.payment_failed':
        console.log('❌ Invoice payment failed');
        // You can add logic here to handle failed payments
        break;
        
      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
