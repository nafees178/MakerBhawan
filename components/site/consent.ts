/**
 * Where the cookie choice lives, and how the rest of the app hears about it.
 *
 * localStorage rather than a cookie: the whole point of the banner is that
 * nothing is written to the browser until someone agrees, and a consent cookie
 * that appears before the answer undercuts that. It also means the value never
 * travels to the server, which is fine, because the only consumer is a script
 * tag decided in the browser.
 *
 * Every read is wrapped: in a private window, or with site data blocked,
 * localStorage throws rather than returning null, and a thrown storage error
 * should not take down the page.
 */
export const CONSENT_KEY = "artl.cookie-consent";
export const CONSENT_EVENT = "artl:consent";

export type Consent = "granted" | "denied" | null;

export function readConsent(): Consent {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(value: Exclude<Consent, null>) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Storage blocked. The choice holds for this page view and is asked again
    // next time, which is the safe direction to fail in.
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
