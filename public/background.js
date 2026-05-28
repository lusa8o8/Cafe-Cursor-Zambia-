// Background service worker for QuickShare extension

// Initialize extension on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('[v0] QuickShare extension installed');
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStoredSession') {
    chrome.storage.local.get(['currentSession'], (result) => {
      sendResponse(result.currentSession || null);
    });
    return true; // Keep the message channel open
  }
});

// Optional: Cleanup expired sessions periodically
chrome.alarms.create('cleanupSessions', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanupSessions') {
    chrome.storage.local.get(['currentSession'], (result) => {
      if (result.currentSession && result.currentSession.expiresAt < Date.now()) {
        chrome.storage.local.remove(['currentSession']);
      }
    });
  }
});
