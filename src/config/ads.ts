import { featureFlags } from "./features";

export const adsConfig = {
  enabled: featureFlags.ads.enabled,
  popUnder: {
    enabled: featureFlags.ads.popUnder,
    scriptSrc:
      "https://pl28480662.effectivegatecpm.com/5b/9e/bf/5b9ebf11a1c5d7a7e97f435c53621ae2.js",
    scriptId: "pop-under-ad-script",
    frequencyStorageKey: "popUnderAdLastShown",
    minIntervalMs: 300_000,
  },
  inline: {
    enabled: featureFlags.ads.inline,
    containerId: "container-43a42b9ef767f34975617216e72a8df3",
    scriptId: "adsterra-native-43a42b9ef767f34975617216e72a8df3",
    scriptSrc:
      "https://pl28533349.effectivegatecpm.com/43a42b9ef767f34975617216e72a8df3/invoke.js",
    sessionStorageKey: "inlineAdShown",
    ariaLabel: "Sponsored content",
  },
};
