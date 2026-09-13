"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CONSENT_EVENT, readConsent } from "@/components/site/consent";

/**
 * Two measurement stacks with two different consent stories.
 *
 * Vercel Analytics and Speed Insights set no cookies and store no identifier
 * that follows a visitor between sites, so they run for everyone. They are what
 * keeps the page-view and Core Web Vitals numbers honest even when most people
 * decline.
 *
 * Google Analytics does set cookies, so nothing of it loads until someone has
 * actually said yes. The script tag is not rendered at all before consent,
 * which is stronger than loading it and setting consent mode to denied: no
 * request reaches Google, so there is nothing to explain in the privacy policy
 * beyond "we asked first".
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    const sync = () => setGranted(readConsent() === "granted");
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />

      {gaId && granted && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
    </>
  );
}
