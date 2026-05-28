// Determine the app URL based on environment
function getAppUrl() {
  // For development, use localhost
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    // In production, this would be your deployed URL
    return 'http://localhost:3000';
  }
  return 'http://localhost:3000';
}

const APP_URL = getAppUrl();

let currentSession = null;
let expiresAt = null;

async function loadSession() {
  // Try to load existing session from storage
  chrome.storage.local.get(['currentSession'], (result) => {
    if (result.currentSession) {
      currentSession = result.currentSession;
      expiresAt = result.currentSession.expiresAt;
      displaySession();
    } else {
      createNewSession();
    }
  });
}

async function createNewSession() {
  try {
    const response = await fetch(`${APP_URL}/api/session/create`, {
      method: 'POST',
    });

    if (response.ok) {
      const session = await response.json();
      currentSession = session;
      expiresAt = session.expiresAt;
      chrome.storage.local.set({ currentSession: session });
      displaySession();
    } else {
      showStatus('Failed to create session', 'error');
    }
  } catch (error) {
    console.error('Error creating session:', error);
    showStatus('Failed to connect to server', 'error');
  }
}

function displaySession() {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('content').style.display = 'block';

  // Display code
  document.getElementById('sessionCode').textContent = currentSession.code;

  // Display URL
  const sessionUrl = `${APP_URL}/transfer/${currentSession.id}`;
  document.getElementById('sessionUrl').textContent = sessionUrl;

  // Generate QR code
  generateQR(sessionUrl);

  // Start timer
  updateTimer();
  setInterval(updateTimer, 1000);

  // Start polling for file updates
  pollFiles();
  setInterval(pollFiles, 5000);
}

function generateQR(text) {
  const container = document.getElementById('qrCode');
  container.innerHTML = '';

  // Use QR code library (we'll use a simple approach with an image)
  const encodedText = encodeURIComponent(text);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedText}`;
  
  const img = document.createElement('img');
  img.src = qrUrl;
  img.style.maxWidth = '100%';
  img.alt = 'QR Code';
  container.appendChild(img);
}

function updateTimer() {
  if (!expiresAt) return;

  const remaining = expiresAt - Date.now();
  if (remaining > 0) {
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    document.getElementById('timeRemaining').textContent = 
      `${minutes}:${seconds.toString().padStart(2, '0')}`;
  } else {
    document.getElementById('timeRemaining').textContent = 'Expired';
  }
}

async function pollFiles() {
  if (!currentSession) return;

  try {
    const response = await fetch(`${APP_URL}/api/files`, {
      headers: { 'x-session-id': currentSession.id },
    });

    if (response.ok) {
      const data = await response.json();
      document.getElementById('fileCount').textContent = data.files.length;
    }
  } catch (error) {
    console.error('Error polling files:', error);
  }
}

function copyCode() {
  const code = currentSession.code;
  navigator.clipboard.writeText(code).then(() => {
    showStatus('Code copied!', 'success');
  });
}

function openSession() {
  const url = `${APP_URL}/transfer/${currentSession.id}`;
  chrome.tabs.create({ url });
}

function newSession() {
  chrome.storage.local.remove(['currentSession']);
  currentSession = null;
  document.getElementById('content').style.display = 'none';
  document.getElementById('loading').style.display = 'block';
  document.getElementById('statusMessage').innerHTML = '';
  createNewSession();
}

function closeSession() {
  chrome.storage.local.remove(['currentSession']);
  currentSession = null;
  window.close();
}

function showStatus(message, type) {
  const statusDiv = document.getElementById('statusMessage');
  statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
  if (type === 'success') {
    setTimeout(() => {
      statusDiv.innerHTML = '';
    }, 3000);
  }
}

// Load session on popup open
loadSession();
