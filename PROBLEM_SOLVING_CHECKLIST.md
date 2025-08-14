# Haven Chat Problem Solving Checklist

## 🚨 Crisis Detection Issues

### Problem: Crisis messages showing both correct response AND generic error
**Symptoms:**
- User types crisis phrase (e.g., "i want to kill myself")
- System shows correct crisis response
- System ALSO shows "I'm having trouble connecting right now" error
- Crisis buttons appear after both messages

**Root Cause:** Crisis handling was inside `try-catch` block, causing errors to trigger generic fallback

**Solution:**
1. Move crisis detection and handling OUTSIDE main `try-catch` block in `sendToAPI`
2. Add early `return` after crisis handling to prevent further API calls
3. Remove `try-catch-finally` from `handleCrisisMessage` function
4. Ensure `addMessage` function is globally accessible

**Code Location:** `public/haven-chat/index.html` lines 1499-1579

---

## 🔧 API Connection Issues

### Problem: 500 Internal Server Error
**Symptoms:**
- `POST http://localhost:3000/api/chat 500 (Internal Server Error)`
- `OpenAI API Error: Error: Failed to get response from Haven`

**Root Causes & Solutions:**

#### 1. Environment Variables Not Loading
**Check:** `console.log(process.env.OPENAI_API_KEY)` in backend
**Solution:** Hardcode API key temporarily in route files
**Files:** `src/app/api/chat/route.js`, `src/app/api/chat-with-assistant/route.js`

#### 2. Duplicate Route Files
**Check:** Look for duplicate `.js` files in `src/app/api/`
**Solution:** Delete duplicate files (e.g., `chat-with-assistant.js` alongside `chat-with-assistant/route.js`)

#### 3. Wrong Port Connection
**Check:** Server running on different port (3001, 3002, 3003)
**Solution:** Navigate to correct port in browser (e.g., `http://localhost:3001/haven-chat/`)

---

## 🎨 Frontend JavaScript Errors

### Problem: ReferenceError: routingType is not defined
**Symptoms:** `ReferenceError: routingType is not defined at sendToAPI`
**Solution:** Declare global variables at start of `DOMContentLoaded`
**Code:** Add `let routingType = 'standard';` at beginning of event listener

### Problem: ReferenceError: addMessage is not defined
**Symptoms:** `ReferenceError: addMessage is not defined at handleCrisisMessage`
**Solution:** Move `addMessage` function to global scope
**Code:** Move function definition before `DOMContentLoaded` listener

---

## 🌈 UI Color Changes

### Problem: Need to change specific colors
**Solution:** Use search and replace for exact color codes
**Common Colors:**
- Pink: `#FF6B8A`
- Light Yellow: `#FFEB3B`
- Yellow: `#FFD93D`

**Files to check:** `public/haven-chat/index.html` (lines 33, 72, 99, 161, 165, 223, 228, 541, 563, 1681)

---

## 📝 Crisis Response Updates

### Problem: Need to update crisis text or add resources
**Files to update:**
1. **Frontend:** `public/haven-chat/index.html`
   - `generateCrisisResponse()` function
   - `showCrisisButtons()` function
2. **Backend:** `src/app/api/chat/route.js`
   - `crisisResources` in response object
   - System prompt crisis instructions

---

## 🔍 Debugging Steps

### 1. Check Console Logs
- Look for routing information
- Check crisis detection logs
- Verify API key loading

### 2. Check Network Tab
- Verify correct API endpoint
- Check request/response data
- Confirm port connection

### 3. Check Environment Variables
```bash
# In backend route files
console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
console.log('API Key length:', process.env.OPENAI_API_KEY?.length);
```

### 4. Check File Structure
- Ensure no duplicate route files
- Verify `.env.local` and `.env` files exist
- Check file permissions

---

## 🚀 Quick Fixes

### API Key Issues
```javascript
// Temporary fix - hardcode in route files
'Authorization': `Bearer YOUR_API_KEY_HERE`
```

### Port Issues
- Check terminal for actual port number
- Navigate to correct URL in browser
- Restart dev server if needed: `npm run dev`

### Crisis Detection
- Test with exact phrases: "kill myself", "suicide", "self harm"
- Check `crisisKeywords` array in frontend
- Verify `detectCrisis` function is working

---

## 📋 Pre-Implementation Checklist

Before making changes:
1. ✅ Check current working state
2. ✅ Identify exact error messages
3. ✅ Locate relevant files and line numbers
4. ✅ Test crisis detection with known phrases
5. ✅ Verify API key is loaded in backend
6. ✅ Check for duplicate route files
7. ✅ Confirm correct port connection

---

## 🔄 Recovery Steps

If system breaks:
1. **Revert to last working state**
2. **Check console for new errors**
3. **Verify all global variables are declared**
4. **Ensure crisis handling is outside try-catch**
5. **Test crisis detection separately**
6. **Check API key in backend routes**
7. **Restart dev server if needed**

---

## 📞 Crisis Resources (Current)
- Call 988 (Crisis Lifeline) - Available 24/7
- Call 911 - Emergency Services
- Text HOME to 741741 - Available 24/7

**Last Updated:** Crisis response now includes 911 emergency services 