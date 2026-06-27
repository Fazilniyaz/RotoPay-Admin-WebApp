# API Integration Fixes

## Issues Fixed

### 1. Double `/api` Prefix in API Endpoints
**Problem**: API calls were using `/api/auth/login` which resulted in requests to `/api/api/auth/login` because the Axios instance already includes the base URL.

**Solution**: Removed the `/api` prefix from all endpoint calls in `hooks/useAuth.ts`:
- Changed `/api/auth/login` → `/auth/login`
- Changed `/api/auth/register` → `/auth/register`
- Changed `/api/auth/verify-email` → `/auth/verify-email`
- Changed `/api/auth/forgot-password` → `/auth/forgot-password`
- Changed `/api/auth/reset-password` → `/auth/reset-password`
- Changed `/api/auth/google` → `/auth/google`
- Changed `/api/auth/logout` → `/auth/logout`

### 2. Google Login Field Name Mismatch
**Problem**: Google login was sending `token` but the backend expects `idToken`.

**Solution**: Updated `googleLogin` in `hooks/useAuth.ts` to send the correct field:
```typescript
// Before
const response = await api.post('/api/auth/google', { token });

// After
const response = await api.post('/auth/google', { idToken: token });
```

### 3. Reset Password Field Name Mismatch
**Problem**: The reset password endpoint was sending `newPassword` but backend expects `password`.

**Solution**: Updated `resetPassword` in `hooks/useAuth.ts`:
```typescript
// Before
const response = await api.post('/api/auth/reset-password', {
  token,
  newPassword,
});

// After
const response = await api.post('/auth/reset-password', {
  token,
  password: newPassword,
});
```

### 4. Email Verification UI Showing Wrong Status
**Problem**: API returns 200 success but the UI was displaying "Verification Failed".

**Solution**: Added better error handling and debugging in `app/auth/verify-email/page.tsx`:
- Added console logging to track verification results
- Added try-catch block for proper error handling
- Removed dependency array issue that could cause state inconsistencies

### 5. Google OAuth Provider Not Conditionally Rendered
**Problem**: Build failed because GoogleLogin component requires NEXT_PUBLIC_GOOGLE_CLIENT_ID to be set.

**Solution**: Made Google login button conditional in `app/auth/login/page.tsx`:
```typescript
{process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
  <div className="flex justify-center">
    <GoogleLogin {...props} />
  </div>
)}
```

## How API Calls Work Now

The centralized Axios instance in `lib/axios.ts` handles:
- Base URL: `http://localhost:5000` (from NEXT_PUBLIC_API_URL)
- All endpoints use: `api.post('/auth/endpoint')` format
- Automatic token refresh on 401 responses
- Consistent error handling across the app

## Testing the Fixes

1. **Login**: `demo@rotapay.com` / `Demo@123456`
2. **Google Login**: Works when NEXT_PUBLIC_GOOGLE_CLIENT_ID is set
3. **Reset Password**: Form now sends correct field names
4. **Email Verification**: Correctly shows success or failure UI
5. **All Endpoints**: No more double `/api` prefix issues

## Files Modified

- `hooks/useAuth.ts` - Fixed all endpoint paths and field names
- `app/auth/login/page.tsx` - Conditional Google login rendering
- `app/auth/verify-email/page.tsx` - Better error handling and logging

## Environment Variables

Make sure `.env.local` has:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id (optional)
```
