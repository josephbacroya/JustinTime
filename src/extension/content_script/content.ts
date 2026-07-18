/**
 * Content Script for JIT Workflow Overlay
 * 
 * Responsibilities:
 * 1. Observe URL changes (especially for SPAs like React/Angular where a traditional reload doesn't happen).
 * 2. Observe DOM mutations (to trigger specific step-by-step guidance).
 * 3. Send Context payload to the Background Service Worker.
 * 4. Receive guidance payload from the Background Worker and instantiate the Overlay UI injector.
 */

import { injectOverlay, removeOverlay } from '../overlay_ui/injector';

let currentUrl = location.href;

// Send context to background worker to evaluate rules
function sendContextUpdate() {
  const payload = {
    url: location.href,
    // In the future, we could capture specific DOM element presences here 
    // e.g. document.querySelector('#checkout-button') !== null
    domSelectors: []
  };

  chrome.runtime.sendMessage({ type: 'CONTEXT_UPDATE', payload }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn('[JIT Content Script] Error communicating with background worker:', chrome.runtime.lastError);
      return;
    }

    if (response && response.type === 'SHOW_OVERLAY') {
      console.log('[JIT Content Script] Guidance received. Injecting overlay.');
      injectOverlay(response.data);
    } else if (response && response.type === 'HIDE_OVERLAY') {
      removeOverlay();
    }
  });
}

// ---------------------------------------------------------
// Observers
// ---------------------------------------------------------

// 1. Observe SPA URL Changes via History API and Hash
const observer = new MutationObserver(() => {
  if (currentUrl !== location.href) {
    currentUrl = location.href;
    console.log('[JIT Content Script] URL changed to:', currentUrl);
    sendContextUpdate();
  }
});

// Observe document body for structural changes indicating a route change
observer.observe(document.body, { childList: true, subtree: true });

// Also bind to popstate for standard back/forward navigation
window.addEventListener('popstate', () => {
  currentUrl = location.href;
  sendContextUpdate();
});

// Initial load check
console.log('[JIT Content Script] Initialized on:', currentUrl);
sendContextUpdate();
