const questionCard = document.getElementById("questionCard");
const loveCard = document.getElementById("loveCard");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const confetti = document.getElementById("confetti");

let hasEscaped = false;

// Moves the No button to a location that stays fully inside the viewport
// and does not overlap any visible `.card` elements (question or love card).
function moveNoButton() {
  const buttonWidth = noButton.offsetWidth;
  const buttonHeight = noButton.offsetHeight;
  const padding = 12;
  const clearance = 14; // breathing room around cards

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const minX = padding;
  const minY = padding;
  const maxX = Math.max(minX, vw - buttonWidth - padding);
  const maxY = Math.max(minY, vh - buttonHeight - padding);

  const avoidCards = Array.from(document.querySelectorAll('.card')).filter(el => !el.hidden);

  function overlapsAnyCard(x, y) {
    const r1 = { left: x - clearance, top: y - clearance, right: x + buttonWidth + clearance, bottom: y + buttonHeight + clearance };
    return avoidCards.some(card => {
      const b = card.getBoundingClientRect();
      if (!b.width || !b.height) return false;
      const r2 = { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
      return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
    });
  }

  let left = minX;
  let top = minY;

  // Try several random positions within the viewport until we find one that doesn't overlap.
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const candidateLeft = minX + Math.random() * (maxX - minX);
    const candidateTop = minY + Math.random() * (maxY - minY);
    if (!overlapsAnyCard(candidateLeft, candidateTop)) {
      left = Math.round(candidateLeft);
      top = Math.round(candidateTop);
      break;
    }
  }

  // If no non-overlapping position found, snap to the nearest corner inside the viewport.
  if (overlapsAnyCard(left, top)) {
    const corners = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: minX, y: maxY },
      { x: maxX, y: maxY }
    ];
    for (const c of corners) {
      if (!overlapsAnyCard(c.x, c.y)) { left = c.x; top = c.y; break; }
    }
  }

  noButton.style.position = 'fixed';
  noButton.style.left = `${left}px`;
  noButton.style.top = `${top}px`;
  noButton.style.zIndex = '5';
  noButton.classList.remove('escaping');
  void noButton.offsetWidth; // restart CSS animation
  noButton.classList.add('escaping');
  hasEscaped = true;
}

// Move on hover/touch enter only; don't block clicks or focus so the button remains usable.
noButton.addEventListener('pointerenter', moveNoButton);
noButton.addEventListener('pointerdown', () => moveNoButton());
noButton.addEventListener('click', () => moveNoButton());

// Keep the button in a safe location if the window is resized.
window.addEventListener('resize', () => {
  if (hasEscaped) moveNoButton();
});

// The Yes button swaps the question for the romantic reveal, then releases gentle falling hearts.
yesButton.addEventListener('click', () => {
  questionCard.hidden = true;
  // Keep the No button visible and reachable; don't hide it.
  loveCard.hidden = false;
  createConfetti();
});

function createConfetti() {
  const hearts = ["♥", "✦", "♥", "♡", "✦", "♥"];
  for (let i = 0; i < 24; i += 1) {
    const piece = document.createElement("i");
    piece.textContent = hearts[i % hearts.length];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.animationDelay = `${Math.random() * .8}s`;
    piece.style.animationDuration = `${2.7 + Math.random() * 1.6}s`;
    confetti.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove());
  }
}
