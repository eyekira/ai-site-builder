"use client";

import { useEffect, useState } from "react";

type LoadStatus = "idle" | "success" | "error";

export default function TestAutocompletePage() {
  const [status, setStatus] = useState<LoadStatus>("idle");

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY;

    if (!key) {
      setStatus("error");
      return;
    }

    const scriptId = "google-maps-js-test-script";
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    const handleLoad = () => setStatus("success");
    const handleError = () => setStatus("error");

    if (existingScript) {
      if ((window as Window & { google?: unknown }).google) {
        setStatus("success");
      } else {
        existingScript.addEventListener("load", handleLoad);
        existingScript.addEventListener("error", handleError);
      }

      return () => {
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Google Places Browser Key Test</h1>
      <p>
        {status === "success"
          ? "Loaded Google Maps JS OK"
          : status === "error"
            ? "Failed to load Google Maps JS"
            : "Loading Google Maps JS..."}
      </p>
    </main>
  );
}
