function sendToActiveTab(message, callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab?.id || !tab.url || (!tab.url.startsWith('http://') && !tab.url.startsWith('https://'))) {
      return;
    }

    chrome.tabs.sendMessage(tab.id, message, (response) => {
      if (chrome.runtime.lastError) {
        return;
      }
      if (callback) callback(response);
    });
  });
}

function updateStateUI(response) {
  if (!response) return;
  document.getElementById('score-val').textContent = response.score ?? 0;
  document.getElementById('destroy-btn').textContent = response.destroyMode
    ? 'Oprește Distrugerea'
    : 'Activează Distrugerea';
}

document.getElementById('scan-btn').addEventListener('click', () => {
  sendToActiveTab({ action: 'scan_page' }, (response) => {
    if (!response) return;
    document.getElementById('img-count').textContent = response.images;
    document.getElementById('link-count').textContent = response.links;
    document.getElementById('btn-count').textContent = response.buttons;
    document.getElementById('total-hp').textContent = response.totalHP;
  });
});

document.getElementById('destroy-btn').addEventListener('click', () => {
  sendToActiveTab({ action: 'toggle_destroy' }, updateStateUI);
});

document.getElementById('restore-btn').addEventListener('click', () => {
  sendToActiveTab({ action: 'restore_page' }, updateStateUI);
});
sendToActiveTab({ action: 'get_state' }, updateStateUI);