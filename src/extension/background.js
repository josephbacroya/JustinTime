(() => {
  // src/extension/background/background.ts
  var cachedRules = [];
  function initializeConnection() {
    try {
      console.log("[Background] Mock connected to JIT Overlay API");
      fetchRules();
    } catch (error) {
      console.warn("[Background] WebSocket failed, falling back to static rules.", error);
      fetchRules();
    }
  }
  async function fetchRules() {
    try {
      cachedRules = [
        {
          id: "rule_1",
          applicationPattern: "salesforce.com",
          urlPattern: ".*\\/lightning\\/r\\/Opportunity\\/.*",
          articleId: "art_123",
          title: "Opportunity Creation SOP"
        },
        {
          id: "rule_2",
          applicationPattern: "google.com",
          urlPattern: ".*google\\.com.*",
          articleId: "art_456",
          title: "Company Search Guidelines"
        },
        {
          id: "rule_3",
          applicationPattern: "github.com",
          urlPattern: ".*github\\.com.*",
          articleId: "art_789",
          title: "Code Review Standards"
        }
      ];
      console.log("[Background] Rules cached successfully.", cachedRules.length);
    } catch (error) {
      console.error("[Background] Failed to fetch rules:", error);
    }
  }
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "CONTEXT_UPDATE") {
      const { url, domSelectors } = message.payload;
      const matchedRules = cachedRules.filter((rule) => {
        const regex = new RegExp(rule.urlPattern, "i");
        return regex.test(url);
      });
      if (matchedRules.length > 0) {
        console.log(`[Background] Match found for ${url}:`, matchedRules);
        sendResponse({ type: "SHOW_OVERLAY", data: matchedRules });
      } else {
        sendResponse({ type: "HIDE_OVERLAY" });
      }
    }
    return true;
  });
  initializeConnection();
})();
