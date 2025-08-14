# Haven Token-Based Pricing System

## Overview

Haven has been updated to use a token-based pricing system that provides users with a clear, predictable way to access emotional support conversations.

## Token System Details

### How Tokens Work
- **1 token = 1 conversation exchange** with Haven
- **Monthly refresh** - tokens reset each month
- **No rollover** - unused tokens don't carry over
- **Emergency top-ups** available when users run out

### Pricing Plans (50% Beta Discount)

#### BETA TESTING - $1.99 (one-time)
- 50 tokens for testing purposes
- Limited access for development only

#### Starter Plan - $2.99/month (50% off from $5.99)
- 300 tokens per month
- Journaling access
- Crisis support protocols
- Basic personalization

#### Regular Plan - $9.99/month (50% off from $19.99)
- 1,500 tokens per month
- Journaling access
- Deep personalization
- Conversation history
- Crisis support protocols

#### Premium Family Plan - $19.99/month (Coming Soon)
- 4,000 tokens per month
- Journaling access
- Up to 4 family members
- Individual EI companions
- Custom therapy plans
- Crisis support protocols

#### Emergency Top-up - $2.99
- 100 tokens when you run out
- Available anytime during the month

## Technical Implementation

### Backend Components

1. **Token Management API** (`src/app/api/tokens/route.js`)
   - GET: Retrieve user token count and plan
   - POST: Use tokens or add tokens
   - PUT: Emergency top-up functionality

2. **Updated Stripe Integration** (`src/app/api/create-checkout-session/route.js`)
   - Supports all new plan types
   - Emergency top-up pricing
   - Token limits for each plan

3. **Chat API Integration** (`src/app/api/chat/route.js`)
   - Token checking before processing messages
   - Crisis and exercise responses bypass token limits
   - Returns token limit messages when needed

### Frontend Components

1. **Token Display** (`public/haven-chat/index.html`)
   - Shows current token count in header
   - Changes color when tokens are low (≤10)
   - Only visible for paid plans

2. **Token Management Functions**
   - `useToken()`: Consumes one token
   - `addTokens(amount, plan)`: Adds tokens and sets plan
   - `updateTokenDisplay()`: Updates visual display
   - `initializeTokenDisplay()`: Sets up initial display

3. **Emergency Top-up Modal**
   - Shows when users run out of tokens
   - Direct integration with Stripe checkout
   - Opens in new window to avoid iframe restrictions

4. **Updated Plans Page** (`public/haven-chat/plans.html`)
   - New token-based pricing display
   - Emergency top-up section
   - Token system explanation
   - Updated plan descriptions

## User Experience

### Token Usage
- Users see their token count in the chat header
- Tokens are consumed with each message sent
- Crisis and exercise keywords bypass token limits
- Low token warnings (≤10 tokens remaining)

### Emergency Top-up
- Automatic detection when tokens run out
- Modal appears with purchase option
- Seamless Stripe checkout integration
- Immediate token addition after payment

### Plan Management
- Clear pricing with 50% beta discounts
- Monthly token refresh
- No complex rollover calculations
- Predictable monthly costs

## Testing

### Initial Setup
- New users get 50 beta tokens automatically
- Token display appears in chat header
- Emergency top-up modal works correctly

### Token Consumption
- Send messages to consume tokens
- Crisis/exercise keywords don't consume tokens
- Token count updates in real-time

### Payment Flow
- All plan types work with Stripe
- Emergency top-up processes correctly
- Success/cancel handling implemented

## Promo Codes (Backend Only)

The following promo codes are available for manual distribution:
- **BETA30**: 30 days free Regular plan, no credit card
- **FAMILY30**: 30 days free Regular plan, credit card required

These codes are NOT displayed in the app interface and are for manual distribution only.

## Future Enhancements

1. **Database Integration**: Replace in-memory storage with persistent database
2. **Usage Analytics**: Track token usage patterns and popular features
3. **Family Plan**: Implement multi-user token sharing
4. **Token Gifting**: Allow users to gift tokens to others
5. **Usage Insights**: Show users their token usage patterns

## Security Notes

- Token limits are enforced server-side
- Crisis responses always available regardless of token status
- Payment processing uses secure Stripe integration
- No sensitive data stored in localStorage 