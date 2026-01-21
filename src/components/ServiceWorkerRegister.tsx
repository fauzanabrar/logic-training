"use client";

import { useEffect, useRef } from "react";

type ServiceWorkerRegisterProps = {
  enabled?: boolean;
  path?: string;
};

/**
 * Service Worker registration component.
 * Registers the SW for offline support in production.
 * Safely handles registration errors and client-only rendering.
 */
export default function ServiceWorkerRegister({
  enabled = true,
  path = "/sw.js",
}: ServiceWorkerRegisterProps) {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const registrationAttempted = useRef(false);

  useEffect(() => {
    // Only run once
    if (registrationAttempted.current) return;
    registrationAttempted.current = true;

    // Check if feature is enabled
    if (!enabled) {
      console.log("[SW] Service Worker disabled");
      return;
    }

    // Check if browser supports Service Workers
    if (!("serviceWorker" in navigator)) {
      console.warn("[SW] Service Workers not supported");
      return;
    }

    // Don't register in development
    if (process.env.NODE_ENV !== "production") {
      console.log("[SW] Not registering in development mode");
      return;
    }

    // Wait for page load
    const onLoad = () => {
      navigator.serviceWorker
        .register(path)
        .then((registration) => {
          registrationRef.current = registration;
          console.log("[SW] Registered successfully:", registration);

          // Check for updates periodically
          setInterval(() => {
            registration.update().catch((error) => {
              console.error("[SW] Update check failed:", error);
            });
          }, 3600000); // Check every hour
        })
        .catch((error) => {
          console.error("[SW] Registration failed:", error);
          // App still works without Service Worker
        });
    };

    // Check if document is already loaded
    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, [enabled, path]);

  return null;
}
