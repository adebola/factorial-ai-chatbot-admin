# Test Login Flow - Debugging Multiple Token Requests

## Prerequisites

1. Angular dev server is running on http://localhost:4201
2. Authorization server is running on http://localhost:9000
3. Browser DevTools are open (F12)

## Test Steps

### Step 1: Clear All Browser Data

In Browser Console (F12 > Console tab):
```javascript
sessionStorage.clear();
localStorage.clear();
location.reload(true); // Hard reload
```

Or use hard refresh:
- **Mac**: Cmd + Shift + R
- **Windows/Linux**: Ctrl + Shift + F5

### Step 2: Open Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Click "Clear" to clear existing requests
4. Enable "Preserve log" checkbox
5. Filter by "token" in the filter box

### Step 3: Open Console Tab

1. Keep Console tab visible alongside Network tab
2. Look for logs with `[CallbackComponent]` and `[AuthService]` prefixes

### Step 4: Navigate to Login

1. Go to: http://localhost:4201
2. Should auto-redirect to login page
3. Enter credentials:
   - Username: `admin`
   - Password: `password`
4. Click "Login"

### Step 5: Observe the Logs

**In the Console, you should see this sequence:**

```
[CallbackComponent] ngOnInit called at 2026-01-31T...
[CallbackComponent] queryParams subscription fired at 2026-01-31T...
[CallbackComponent] Calling handleCallback with code: <auth-code>
[AuthService] handleCallback called at 2026-01-31T... isHandlingCallback: false
[AuthService] Set isHandlingCallback = true, proceeding with token exchange
[AuthService] Making POST request to token endpoint
[AuthService] Resetting isHandlingCallback = false
```

**If you see multiple ngOnInit calls:**
- The component is being instantiated multiple times
- Check for routing issues or multiple router-outlet directives

**If you see multiple queryParams subscription fires:**
- The take(1) operator is not working
- OR the component is being created multiple times

**If you see multiple handleCallback calls with isHandlingCallback: false:**
- Multiple sources are calling handleCallback
- OR the calls are happening faster than the flag can be set

**If you see "Token exchange already in progress" warnings:**
- The duplicate call prevention is working correctly

### Step 6: Check Network Tab

**Expected:**
- Only **1 POST** request to `http://localhost:9000/oauth2/token`
- Status: 200 OK

**If you see 5 requests:**
- Check the "Initiator" column for each request
- All should show the same initiator (auth.service.ts)

### Step 7: Check for Immediate Logout

After successful login:
- Should navigate to /dashboard
- Should NOT immediately logout
- Should NOT see any requests to `/oauth2/revoke`

## What to Report

Please provide:

1. **Complete console logs** from the moment you click login until you reach dashboard
2. **Network tab screenshot** showing all token requests
3. **Number of token requests** made
4. **Any error messages** in the console
5. **Whether user stays logged in** or gets immediately logged out

## Known Issues to Check

### Issue A: Component Created Multiple Times
If you see multiple "ngOnInit called" logs, check:
- Is there more than one `<router-outlet>` in the app?
- Is the component being rendered in multiple places?

### Issue B: Route Parameters Firing Multiple Times
If you see multiple "queryParams subscription fired" logs but only one "ngOnInit":
- The take(1) operator might not be working
- Check if there are multiple navigations to the callback route

### Issue C: Service Called Multiple Times
If you see multiple "handleCallback called" logs:
- Something else is calling the service directly
- Search the codebase for other calls to handleCallback

### Issue D: Flag Not Working
If all calls show "isHandlingCallback: false":
- The calls are happening synchronously before the flag is set
- OR there's a different instance of the service (shouldn't happen with providedIn: 'root')

## Expected Behavior After Fix

```
✅ Console shows:
   - 1 ngOnInit call
   - 1 queryParams subscription
   - 1 handleCallback call
   - 1 POST request log

✅ Network tab shows:
   - 1 POST to /oauth2/token (200 OK)
   - 0 POST to /oauth2/revoke

✅ User behavior:
   - Login successful
   - Redirected to dashboard
   - Stays logged in
   - Can navigate between pages
```

## Cleanup After Testing

```javascript
// In browser console:
sessionStorage.clear();
localStorage.clear();
```
