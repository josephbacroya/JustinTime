/**
 * Background Service Worker for JIT Workflow Overlay
 * 
 * Responsibilities:
 * 1. Maintain a persistent/reconnecting WebSocket or SSE connection to the backend API.
 * 2. Fetch and cache the context detection rules for the current user's workspace.
 * 3. Receive URL/DOM updates from content scripts and evaluate them against the cached rules.
 * 4. Dispatch matched SOPs/guidance back to the content script for rendering.
 */

const API_ENDPOINT = 'https://api.jitoverlay.enterprise/v1';
let cachedRules: any[] = [];
let wsConnection: WebSocket | null = null;

// Initialize WebSocket connection to backend for real-time rule updates and analytics
function initializeConnection() {
  // In a real implementation, we would pass auth tokens here
  wsConnection = new WebSocket(`wss://api.jitoverlay.enterprise/v1/ws`);

  wsConnection.onopen = () => {
    console.log('[Background] Connected to JIT Overlay API');
    fetchRules();
  };

  wsConnection.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'RULES_UPDATED') {
      console.log('[Background] Received rule update invalidation');
      fetchRules();
    }
  };

  wsConnection.onclose = () => {
    console.warn('[Background] WebSocket disconnected, attempting reconnect in 5s...');
    setTimeout(initializeConnection, 5000);
  };
}

// Fetch context rules from the API
async function fetchRules() {
  try {
    // In production, use standard fetch with Authorization headers
    // const response = await fetch(`${API_ENDPOINT}/rules`);
    // cachedRules = await response.json();
    
    // Mock data for MVP
    cachedRules = [
      {
        id: 'rule_1',
        applicationPattern: 'salesforce.com',
        urlPattern: '.*\/lightning\/r\/Opportunity\/.*',
        articleId: 'art_123',
        title: 'Opportunity Creation SOP'
      }
    ];
    console.log('[Background] Rules cached successfully.', cachedRules.length);
  } catch (error) {
    console.error('[Background] Failed to fetch rules:', error);
  }
}

// Listen for messages from Content Scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CONTEXT_UPDATE') {
    const { url, domSelectors } = message.payload;
    
    // Evaluate the URL against cached rules
    const matchedRules = cachedRules.filter(rule => {
      const regex = new RegExp(rule.urlPattern, 'i');
      return regex.test(url);
    });

    if (matchedRules.length > 0) {
      console.log(`[Background] Match found for ${url}:`, matchedRules);
      
      // In production, if the SOP content isn't cached, we fetch it here
      // Or we trigger the AI Service for a contextual summary
      
      sendResponse({ type: 'SHOW_OVERLAY', data: matchedRules });
    } else {
      sendResponse({ type: 'HIDE_OVERLAY' });
    }
  }

  return true; // Keep the message channel open for async response
});

// Bootstrap
initializeConnection();
