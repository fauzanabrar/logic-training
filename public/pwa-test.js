/**
 * PWA Offline Functionality Test Script
 * 
 * This script verifies that the Service Worker and offline functionality work correctly.
 * Run this in the browser console at http://localhost:3000
 * 
 * Copy and paste this entire script into DevTools Console (F12 > Console tab)
 */

console.log("🧪 PWA Testing Suite Started\n");

// Test 1: Check Service Worker Registration
console.log("📋 Test 1: Service Worker Registration");
navigator.serviceWorker
  .getRegistrations()
  .then((registrations) => {
    if (registrations.length === 0) {
      console.error("❌ No Service Workers registered");
      return;
    }
    console.log(`✅ Found ${registrations.length} Service Worker(s)`);
    registrations.forEach((reg, index) => {
      console.log(`  SW #${index + 1}:`);
      console.log(`    - Scope: ${reg.scope}`);
      console.log(`    - State: ${reg.active ? "Active" : "Inactive"}`);
      console.log(`    - Update URL: ${reg.updateViaCache}`);
    });
  })
  .catch((error) => console.error("❌ Error checking SWs:", error));

// Test 2: Check Cache Storage
console.log("\n📋 Test 2: Cache Storage");
caches
  .keys()
  .then((cacheNames) => {
    if (cacheNames.length === 0) {
      console.error("❌ No caches found");
      return;
    }
    console.log(`✅ Found ${cacheNames.length} cache(s)`);
    return Promise.all(
      cacheNames.map(async (cacheName) => {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        console.log(`  Cache: "${cacheName}"`);
        console.log(`    - Size: ${requests.length} entries`);
        requests.slice(0, 5).forEach((req, i) => {
          console.log(`      ${i + 1}. ${req.url}`);
        });
        if (requests.length > 5) {
          console.log(`      ... and ${requests.length - 5} more`);
        }
      })
    );
  })
  .catch((error) => console.error("❌ Error checking caches:", error));

// Test 3: Check localStorage
console.log("\n📋 Test 3: localStorage Data");
const sessionData = localStorage.getItem("logicTrainingSession");
const settingsData = localStorage.getItem("logicTrainingSettings");

console.log("Session Data:");
if (sessionData) {
  try {
    const parsed = JSON.parse(sessionData);
    console.log("  ✅ Valid JSON");
    console.log("    - Stats:", parsed.stats ? "Present" : "Missing");
    console.log("    - Mode:", parsed.mode || "Not set");
  } catch (e) {
    console.error("  ❌ Invalid JSON:", e.message);
  }
} else {
  console.log("  ⚠️  No session data (will be created on first use)");
}

console.log("\nSettings Data:");
if (settingsData) {
  try {
    const parsed = JSON.parse(settingsData);
    console.log("  ✅ Valid JSON");
    console.log("    - Language:", parsed.language || "Not set");
    console.log("    - Time Limit:", parsed.timeLimitSeconds || "Not set");
    console.log("    - Question Count:", parsed.questionCount || "Not set");
  } catch (e) {
    console.error("  ❌ Invalid JSON:", e.message);
  }
} else {
  console.log("  ⚠️  No settings data (will be created on first use)");
}

// Test 4: Manifest.json
console.log("\n📋 Test 4: Web App Manifest");
fetch("/manifest.json")
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then((manifest) => {
    console.log("✅ Manifest loaded successfully");
    console.log(`  - Name: ${manifest.name || "Not set"}`);
    console.log(`  - Short Name: ${manifest.short_name || "Not set"}`);
    console.log(`  - Display: ${manifest.display || "Not set"}`);
    console.log(`  - Icons: ${manifest.icons ? manifest.icons.length : 0}`);
    console.log(`  - Theme Color: ${manifest.theme_color || "Not set"}`);
  })
  .catch((error) => console.error("❌ Manifest error:", error.message));

// Test 5: Network Status
console.log("\n📋 Test 5: Network Status");
console.log(`Online: ${navigator.onLine ? "✅ Yes" : "❌ No"}`);
console.log("To test offline mode:");
console.log("  1. Open DevTools (F12)");
console.log("  2. Go to Network tab");
console.log("  3. Click the throttling dropdown (currently 'No throttling')");
console.log("  4. Select 'Offline'");
console.log("  5. The app should still work!");

// Test 6: Summary
console.log("\n✅ Testing Complete!\n");
console.log("📝 Next Steps:");
console.log("  1. Open DevTools → Application → Service Workers");
console.log("  2. Verify 'sw.js' shows 'activated and running'");
console.log("  3. Open DevTools → Application → Cache Storage");
console.log("  4. Verify cache contents");
console.log("  5. Go to Network tab and select 'Offline'");
console.log("  6. Try using the app - it should work offline!");
console.log("  7. Use console commands below to debug:\n");

// Test 7: Utility Functions
console.log("💡 Useful Commands:");
console.log(
  "  Clear all caches: caches.keys().then(names => Promise.all(names.map(n => caches.delete(n))))"
);
console.log(
  "  Unregister all SWs: navigator.serviceWorker.getRegistrations().then(r => r.forEach(x => x.unregister()))"
);
console.log(
  "  Check online status: navigator.onLine"
);
console.log(
  "  Force SW update: navigator.serviceWorker.ready.then(r => r.update())"
);

// Test 8: Real-time Monitoring
console.log("\n🔍 Real-time Monitoring Setup:");
window.addEventListener("online", () => {
  console.log("🟢 Network ONLINE");
});
window.addEventListener("offline", () => {
  console.log("🔴 Network OFFLINE");
});

if (navigator.connection) {
  navigator.connection.addEventListener("change", () => {
    console.log(
      `📡 Network type changed to: ${navigator.connection.effectiveType}`
    );
  });
}
