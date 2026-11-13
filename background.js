console.log('Service worker-ul Site Siege a pornit!');
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Site Siege a fost instalat cu succes!');
chrome.storage.local.set({
      stats: {
        imagesDestroyed: 0,
        linksDestroyed: 0,
        buttonsDestroyed: 0,
        score: 0
      }
    });
  }
});