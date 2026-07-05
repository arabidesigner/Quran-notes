import { useEffect, useState } from "react";
import "./InstallPrompt.css";

/**
 * Home-screen install affordance.
 *
 * - Chrome / Edge / Android fire `beforeinstallprompt`; we stash it and show an
 *   "Install" button that triggers the native prompt.
 * - iOS Safari never fires it, so when we detect iOS (and we're not already
 *   installed) we show a one-line "Add to Home Screen" hint instead.
 * - Once the app runs standalone (installed), nothing shows.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "qn:install-dismissed";

function isStandalone(): boolean {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari exposes this non-standard flag when launched from the home screen.
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  const ua = window.navigator.userAgent;
  const iDevice = /ipad|iphone|ipod/i.test(ua);
  // iPadOS 13+ reports as desktop Safari but is a touch Mac.
  const iPadOnMac = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return (iDevice || iPadOnMac) && /safari/i.test(ua) && !/crios|fxios/i.test(ua);
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === "1",
  );

  useEffect(() => {
    if (dismissed || isStandalone()) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // Hide everything once the app gets installed during this session.
    const onInstalled = () => {
      setDeferred(null);
      setShowIosHint(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    if (isIos()) setShowIosHint(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [dismissed]);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  if (dismissed) return null;

  if (deferred) {
    return (
      <div className="install-bar" role="dialog" aria-label="Install Quran Notes">
        <span className="install-bar__icon" aria-hidden>
          <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" width={28} height={28} />
        </span>
        <span className="install-bar__text">Install Quran Notes for a full-screen, offline workspace.</span>
        <div className="install-bar__actions">
          <button className="install-bar__btn install-bar__btn--primary" onClick={install}>
            Install
          </button>
          <button className="install-bar__btn" onClick={dismiss} aria-label="Dismiss">
            Not now
          </button>
        </div>
      </div>
    );
  }

  if (showIosHint) {
    return (
      <div className="install-bar" role="dialog" aria-label="Add Quran Notes to Home Screen">
        <span className="install-bar__icon" aria-hidden>
          <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" width={28} height={28} />
        </span>
        <span className="install-bar__text">
          Install: tap the Share button <span className="install-bar__share">⎋</span> then{" "}
          <strong>Add to Home Screen</strong>.
        </span>
        <div className="install-bar__actions">
          <button className="install-bar__btn" onClick={dismiss} aria-label="Dismiss">
            Got it
          </button>
        </div>
      </div>
    );
  }

  return null;
}
