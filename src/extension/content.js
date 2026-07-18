(() => {
  // src/extension/overlay_ui/injector.ts
  var OVERLAY_CONTAINER_ID = "jit-workflow-overlay-root";
  function injectOverlay(rulesData) {
    if (document.getElementById(OVERLAY_CONTAINER_ID)) {
      updateOverlayContent(rulesData);
      return;
    }
    const host = document.createElement("div");
    host.id = OVERLAY_CONTAINER_ID;
    host.style.position = "fixed";
    host.style.top = "0";
    host.style.right = "0";
    host.style.width = "0";
    host.style.height = "100vh";
    host.style.zIndex = "2147483647";
    host.style.pointerEvents = "none";
    const shadowRoot = host.attachShadow({ mode: "open" });
    const wrapper = document.createElement("div");
    wrapper.className = "jit-overlay-wrapper";
    const style = document.createElement("style");
    style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

    :host {
      --jit-primary: #6366f1;
      --jit-primary-hover: #4f46e5;
      --jit-bg: rgba(17, 24, 39, 0.85);
      --jit-border: rgba(255, 255, 255, 0.1);
      --jit-text: #f9fafb;
      --jit-text-muted: #9ca3af;
    }

    .jit-overlay-wrapper {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 380px;
      max-height: calc(100vh - 40px);
      background: var(--jit-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--jit-border);
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05) inset;
      color: var(--jit-text);
      font-family: 'Inter', sans-serif;
      display: flex;
      flex-direction: column;
      pointer-events: auto; /* Re-enable pointer events for the UI */
      transform: translateX(120%);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }

    .jit-overlay-wrapper.visible {
      transform: translateX(0);
    }

    .jit-header {
      padding: 20px;
      border-bottom: 1px solid var(--jit-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%);
    }

    .jit-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .jit-badge {
      background: var(--jit-primary);
      color: white;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .jit-close-btn {
      background: transparent;
      border: none;
      color: var(--jit-text-muted);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .jit-close-btn:hover {
      background: rgba(255,255,255,0.1);
      color: var(--jit-text);
    }

    .jit-content {
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .jit-rule-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--jit-border);
      border-radius: 12px;
      padding: 16px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .jit-rule-card:hover {
      background: rgba(255,255,255,0.06);
      border-color: rgba(255,255,255,0.2);
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -10px rgba(0,0,0,0.5);
    }

    .jit-rule-title {
      font-size: 14px;
      font-weight: 500;
      margin: 0 0 8px 0;
      color: var(--jit-primary);
    }

    .jit-rule-desc {
      font-size: 13px;
      color: var(--jit-text-muted);
      margin: 0;
      line-height: 1.5;
    }
      
    /* Custom Scrollbar */
    .jit-content::-webkit-scrollbar {
      width: 6px;
    }
    .jit-content::-webkit-scrollbar-track {
      background: transparent;
    }
    .jit-content::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.2);
      border-radius: 3px;
    }
    .jit-content::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.3);
    }
  `;
    wrapper.innerHTML = `
    <div class="jit-header">
      <h2 class="jit-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        JIT Guidance
        <span class="jit-badge">AI</span>
      </h2>
      <button class="jit-close-btn" aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <div class="jit-content" id="jit-content-area">
      <!-- Dynamic Content injected here -->
    </div>
  `;
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(wrapper);
    document.body.appendChild(host);
    updateOverlayContent(rulesData, shadowRoot);
    const closeBtn = shadowRoot.querySelector(".jit-close-btn");
    closeBtn?.addEventListener("click", () => removeOverlay());
    requestAnimationFrame(() => {
      wrapper.classList.add("visible");
    });
  }
  function updateOverlayContent(rulesData, shadowRoot) {
    const root = shadowRoot || document.getElementById(OVERLAY_CONTAINER_ID)?.shadowRoot;
    if (!root) return;
    const contentArea = root.getElementById("jit-content-area");
    if (!contentArea) return;
    contentArea.innerHTML = "";
    rulesData.forEach((rule) => {
      const card = document.createElement("div");
      card.className = "jit-rule-card";
      card.innerHTML = `
      <h3 class="jit-rule-title">${rule.title || "Workflow Guidance"}</h3>
      <p class="jit-rule-desc">Click here to view the approved standard operating procedure for this step.</p>
    `;
      card.addEventListener("click", () => {
        console.log("[JIT Overlay] Expanding rule:", rule.id);
        card.innerHTML = `
        <h3 class="jit-rule-title">${rule.title || "Workflow Guidance"}</h3>
        <p class="jit-rule-desc" style="color: var(--jit-text);">
          Welcome to the ${rule.applicationPattern} guidance module.<br/><br/>
          <strong>1.</strong> Review the current page state.<br/>
          <strong>2.</strong> Proceed with the standard workflow defined for ${rule.title}.<br/><br/>
          <em>Generated by Enterprise RAG Pipeline</em>
        </p>
      `;
      });
      contentArea.appendChild(card);
    });
  }
  function removeOverlay() {
    const host = document.getElementById(OVERLAY_CONTAINER_ID);
    if (host && host.shadowRoot) {
      const wrapper = host.shadowRoot.querySelector(".jit-overlay-wrapper");
      if (wrapper) {
        wrapper.classList.remove("visible");
        setTimeout(() => {
          host.remove();
        }, 400);
      } else {
        host.remove();
      }
    }
  }

  // src/extension/content_script/content.ts
  var currentUrl = location.href;
  function sendContextUpdate() {
    const payload = {
      url: location.href,
      // In the future, we could capture specific DOM element presences here 
      // e.g. document.querySelector('#checkout-button') !== null
      domSelectors: []
    };
    chrome.runtime.sendMessage({ type: "CONTEXT_UPDATE", payload }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn("[JIT Content Script] Error communicating with background worker:", chrome.runtime.lastError);
        return;
      }
      if (response && response.type === "SHOW_OVERLAY") {
        console.log("[JIT Content Script] Guidance received. Injecting overlay.");
        injectOverlay(response.data);
      } else if (response && response.type === "HIDE_OVERLAY") {
        removeOverlay();
      }
    });
  }
  var observer = new MutationObserver(() => {
    if (currentUrl !== location.href) {
      currentUrl = location.href;
      console.log("[JIT Content Script] URL changed to:", currentUrl);
      sendContextUpdate();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("popstate", () => {
    currentUrl = location.href;
    sendContextUpdate();
  });
  console.log("[JIT Content Script] Initialized on:", currentUrl);
  sendContextUpdate();
})();
