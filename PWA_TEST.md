# PWA Offline Testing Guide

This guide helps verify that the Progressive Web App (PWA) features work correctly in production.

## Prerequisites

1. Run the production build: `pnpm build`
2. Start production server: `pnpm start`
3. Open browser at `http://localhost:3000`
4. Use Chrome DevTools (F12) for testing

## Test Cases

### Test 1: Service Worker Registration

**Steps:**
1. Open DevTools → Application → Service Workers
2. Navigate to `http://localhost:3000`
3. Check that "sw.js" appears in the Service Workers list

**Expected:**
- Status shows "activated and running"
- Scope shows "/"

### Test 2: Cache Verification

**Steps:**
1. Open DevTools → Application → Cache Storage
2. Look for cache starting with "logic-training-v2"
3. Expand and verify cached resources

**Expected:**
- Cache contains `/`, `/manifest.json`
- No errors logged about cache operations

### Test 3: Offline Functionality

**Steps:**
1. Open DevTools → Network
2. Set throttling to "Offline"
3. Use the app normally (start a training session, answer questions)
4. Navigate between different skills

**Expected:**
- App loads and functions normally
- Questions load from cache
- Stats can be viewed (loaded from localStorage)
- No network errors in console
- Service Worker logs show cache hits

### Test 4: Offline Stats Persistence

**Steps:**
1. Go offline (DevTools → Network → Offline)
2. Complete a training session (answer several questions)
3. Go back online
4. Refresh the page
5. Check stats

**Expected:**
- Stats from offline session are preserved
- No data loss between offline and online
- localStorage remains intact

### Test 5: Network Recovery

**Steps:**
1. Go offline
2. Complete partial training session
3. Set network to "Slow 3G"
4. Navigate to settings
5. Change settings
6. Go back online
7. Start a new session

**Expected:**
- App recovers gracefully when network returns
- Settings persist correctly
- No stale data issues
- No double-fetch requests in network tab

### Test 6: Cache Updates (Manual Testing)

**Steps:**
1. First visit: Check what's cached
2. Modify `public/sw.js` CACHE_VERSION (e.g., "v2" → "v3")
3. Rebuild: `pnpm build`
4. Restart: `pnpm start`
5. Force refresh DevTools cache (Cmd+Shift+R / Ctrl+Shift+R)
6. Check Cache Storage

**Expected:**
- Old cache (v2) is cleaned up
- New cache (v3) is created
- No old resources are used

### Test 7: Console Logging

**Steps:**
1. Open DevTools → Console
2. Go online/offline using DevTools
3. Navigate to different pages
4. Observe console output

**Expected Messages:**
- `[SW] Service Worker disabled` (if disabled in features.ts)
- `[SW] Registered successfully:` (on registration)
- `[SW] Update check failed:` (if update check fails)
- `[Session] Question creation failed:` (on errors)
- No JavaScript errors

### Test 8: Multiple Browser Tabs

**Steps:**
1. Open app in Tab 1
2. Open app in Tab 2
3. Train in Tab 1, complete a question
4. Switch to Tab 2, check if stats are visible
5. Refresh Tab 2

**Expected:**
- Stats are consistent across tabs
- localStorage updates propagate
- No conflicts or data corruption

## Debugging Commands in Console

```javascript
// Check if SW is registered
navigator.serviceWorker.getRegistrations().then(r => console.log(r))

// Unregister all SWs (useful for testing)
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister())
})

// Check cache contents
caches.keys().then(names => {
  names.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(requests => {
        console.log(name, requests)
      })
    })
  })
})

// Clear all caches
caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))

// Check localStorage
localStorage
```

## Production Deployment

Before deploying to production:

1. ✅ Run full test suite above
2. ✅ Test on multiple browsers (Chrome, Firefox, Safari, Edge)
3. ✅ Test on mobile devices (Android, iOS)
4. ✅ Verify SW updates work via versioning
5. ✅ Monitor browser console for errors
6. ✅ Check Lighthouse PWA audit score
7. ✅ Test with slow network (DevTools → Slow 3G)
8. ✅ Verify manifest.json is served correctly

## Performance Metrics

Monitor these in DevTools → Network:
- First Contentful Paint (FCP) when offline: should be < 2s
- Time to Interactive (TTI): should be < 3s
- Service Worker registration time: should be < 500ms
- Cache hit rate: aim for > 90% on repeat visits

## Common Issues

### SW Not Registering
- Verify `NODE_ENV === "production"` when checking
- Check browser console for errors
- Verify `public/sw.js` exists and is valid JavaScript

### Cache Not Working
- Check CACHE_VERSION matches in sw.js
- Verify manifest.json path is correct
- Check optional assets aren't causing install to fail

### Stats Not Persisting
- Verify localStorage is enabled
- Check for permission errors in console
- Ensure JSON serialization works

### Network Recovery Fails
- Monitor console for unhandled promise rejections
- Check Service Worker logs
- Verify offline fallback in sw.js

## References

- [MDN Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Google PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker Lifecycle](https://developers.google.com/web/tools/chrome-devtools/progressive-web-apps)
