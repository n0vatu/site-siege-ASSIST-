let destroyMode = false;
let lastHovered = null;
let score = 0;
const destroyedElements = [];

const POINTS_BY_TAG = {
  IMG: 25,
  BUTTON: 15,
  A: 10,
  H1: 30,
  H2: 20,
  H3: 15
};

function getPointsForElement(el) {
  return POINTS_BY_TAG[el.tagName] || 5;
}

function clearHoverOutline() {
  if (lastHovered) {
    lastHovered.style.outline = '';
    lastHovered = null;
  }
}

document.addEventListener('mouseover', (e) => {
  if (!destroyMode) return;
  const target = e.target;

  if (!target || target === document.body || target === document.documentElement) {
    return;
  }

  clearHoverOutline();
  lastHovered = target;
  target.style.outline = '2px solid #ff3b30';
});

document.addEventListener('click', (e) => {
  if (!destroyMode) return;
  const target = e.target;

  if (!target || target === document.body || target === document.documentElement) {
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  clearHoverOutline();

  const points = getPointsForElement(target);
  score += points;
  target.dataset.siegeDestroyed = 'true';
  destroyedElements.push({
    el: target,
    prevDisplay: target.style.display,
    prevTransition: target.style.transition,
    prevOpacity: target.style.opacity
  });

  target.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
  target.style.opacity = '0';
  target.style.transform = 'scale(0.9)';

  setTimeout(() => {
    target.style.display = 'none';
  }, 250);

  console.log(`Distrus: ${target.tagName} (+${points} pct). Scor total: ${score}`);
}, true);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scan_page') {
    const images = document.querySelectorAll('img').length;
    const links = document.querySelectorAll('a').length;
    const buttons = document.querySelectorAll('button, input[type="button"]').length;
    const totalHP = (images * 10) + (links * 2) + (buttons * 5);

    sendResponse({ images, links, buttons, totalHP });
  } else if (request.action === 'toggle_destroy') {
    destroyMode = !destroyMode;
    if (!destroyMode) {
      clearHoverOutline();
    }
    sendResponse({ destroyMode, score });
  } else if (request.action === 'get_state') {
    sendResponse({ destroyMode, score });
  } else if (request.action === 'restore_page') {
    while (destroyedElements.length > 0) {
      const item = destroyedElements.pop();
      const el = item.el;
      if (!el || !el.isConnected) continue;

      el.style.display = item.prevDisplay;
      el.style.transition = 'none';
      el.style.opacity = item.prevOpacity;
      el.style.transform = '';
      delete el.dataset.siegeDestroyed;

      // Readucem tranziția inițială după un tick, ca să nu facă animație aiurea la revenire
      requestAnimationFrame(() => {
        el.style.transition = item.prevTransition;
      });
    }

    score = 0;
    destroyMode = false;
    clearHoverOutline();

    console.log('Pagina a fost restaurată.');
    sendResponse({ score, destroyMode });
  }
  

  return true;
});