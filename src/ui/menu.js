/**
 * Platform-adaptive hamburger menu with A4 reference pitch controls.
 *
 * Detects Android / iOS / desktop via user-agent and renders:
 *   - Android/desktop: kebab icon (three vertical dots), left-aligned title
 *   - iOS: ellipsis icon (three horizontal dots), centered title
 *
 * Exports:
 *   createMenu(container)        — mounts menu toggle + dropdown
 *   getReferencePitch()          — returns current A4 value
 *   onReferencePitchChange(cb)   — subscribe to changes
 */

// ── Platform detection ────────────────────────────────────────────────

function detectPlatform() {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  return 'desktop';
}

document.documentElement.dataset.platform = detectPlatform();

// ── A4 reference pitch state (unchanged logic) ───────────────────────

const STORAGE_KEY = 'tuner-a4-reference';
const DEFAULT_A4 = 440;
const MIN_A4 = 420;
const MAX_A4 = 460;
const PRESETS = [432, 440, 442];

let currentA4 = loadA4();
const listeners = [];

function loadA4() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const val = Number(stored);
      if (!Number.isNaN(val) && val >= MIN_A4 && val <= MAX_A4) return val;
    }
  } catch { /* localStorage unavailable */ }
  return DEFAULT_A4;
}

function saveA4(value) {
  try { localStorage.setItem(STORAGE_KEY, String(value)); } catch { /* noop */ }
}

function setA4(value) {
  const clamped = Math.min(MAX_A4, Math.max(MIN_A4, Math.round(value)));
  if (clamped === currentA4) return;
  currentA4 = clamped;
  saveA4(clamped);
  listeners.forEach(cb => cb(clamped));
  document.dispatchEvent(new CustomEvent('reference-pitch-change', { detail: { a4: clamped } }));
}

/**
 * Returns the current A4 reference frequency.
 * @returns {number}
 */
export function getReferencePitch() {
  return currentA4;
}

/**
 * Subscribe to reference pitch changes.
 * @param {(a4: number) => void} callback
 */
export function onReferencePitchChange(callback) {
  listeners.push(callback);
}

// ── SVG icons ─────────────────────────────────────────────────────────

/** Kebab icon: three vertical dots (Material Design) */
const KEBAB_SVG = `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
  <circle cx="10" cy="4" r="2"/>
  <circle cx="10" cy="10" r="2"/>
  <circle cx="10" cy="16" r="2"/>
</svg>`;

/** Ellipsis icon: three horizontal dots (iOS HIG) */
const ELLIPSIS_SVG = `<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
  <circle cx="4" cy="10" r="2"/>
  <circle cx="10" cy="10" r="2"/>
  <circle cx="16" cy="10" r="2"/>
</svg>`;

/** Hamburger icon: three horizontal lines (desktop) */
const HAMBURGER_SVG = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
  <line x1="3" y1="5" x2="17" y2="5"/>
  <line x1="3" y1="10" x2="17" y2="10"/>
  <line x1="3" y1="15" x2="17" y2="15"/>
</svg>`;

// ── Menu creation ─────────────────────────────────────────────────────

/**
 * Mounts a platform-adaptive menu toggle and dropdown into the given container.
 * @param {HTMLElement} container — typically the .app-header element
 */
export function createMenu(container) {
  const platform = document.documentElement.dataset.platform;

  // Platform-adaptive icon: kebab (right) on Android, ellipsis (right) on iOS,
  // hamburger (left) on desktop to avoid visual collision with Chrome's own ⋮
  const icon = platform === 'ios' ? ELLIPSIS_SVG
    : platform === 'desktop' ? HAMBURGER_SVG
    : KEBAB_SVG;

  // Toggle button
  const toggle = document.createElement('button');
  toggle.className = 'menu-toggle';
  toggle.setAttribute('aria-label', 'Menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-haspopup', 'true');
  toggle.title = 'Open menu';
  toggle.innerHTML = icon;

  // Dropdown
  const dropdown = document.createElement('div');
  dropdown.className = 'menu-dropdown';
  dropdown.setAttribute('role', 'menu');
  dropdown.setAttribute('aria-label', 'Application menu');
  dropdown.hidden = true;

  // ── Reference Pitch section ──────────────────────────────────────

  const pitchSection = document.createElement('div');
  pitchSection.className = 'menu-section';

  const sectionHeader = document.createElement('div');
  sectionHeader.className = 'menu-section-header';
  sectionHeader.textContent = 'Reference Pitch (A4)';
  sectionHeader.setAttribute('role', 'heading');
  sectionHeader.setAttribute('aria-level', '2');
  pitchSection.appendChild(sectionHeader);

  const pitchControls = document.createElement('div');
  pitchControls.className = 'menu-pitch-controls';

  // Label + input
  const label = document.createElement('label');
  label.className = 'settings-a4-label';
  label.textContent = 'A4 = ';

  const input = document.createElement('input');
  input.type = 'number';
  input.className = 'settings-a4-input';
  input.min = String(MIN_A4);
  input.max = String(MAX_A4);
  input.step = '1';
  input.value = String(currentA4);
  input.setAttribute('aria-label', 'A4 reference pitch in Hz');

  const hzSpan = document.createElement('span');
  hzSpan.className = 'settings-hz';
  hzSpan.textContent = ' Hz';

  label.appendChild(input);
  label.appendChild(hzSpan);

  // Slider
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'settings-a4-slider';
  slider.min = String(MIN_A4);
  slider.max = String(MAX_A4);
  slider.step = '1';
  slider.value = String(currentA4);
  slider.setAttribute('aria-label', 'A4 reference pitch slider');

  // Preset buttons
  const presetsDiv = document.createElement('div');
  presetsDiv.className = 'settings-presets';

  for (const preset of PRESETS) {
    const btn = document.createElement('button');
    btn.className = 'settings-preset-btn';
    btn.textContent = String(preset);
    btn.setAttribute('aria-label', `Set A4 to ${preset} Hz`);
    btn.setAttribute('role', 'menuitem');
    btn.title = preset === 440
      ? 'Standard concert pitch (ISO 16)'
      : preset === 432
        ? 'Alternative tuning, often called "Verdi\'s A"'
        : preset === 442
          ? 'Common in European orchestras'
          : `Set reference pitch to ${preset} Hz`;
    if (preset === currentA4) btn.classList.add('active');
    btn.addEventListener('click', () => {
      setA4(preset);
      syncUI();
    });
    presetsDiv.appendChild(btn);
  }

  function syncUI() {
    input.value = String(currentA4);
    slider.value = String(currentA4);
    presetsDiv.querySelectorAll('.settings-preset-btn').forEach(btn => {
      btn.classList.toggle('active', Number(btn.textContent) === currentA4);
    });
  }

  input.addEventListener('change', () => {
    setA4(Number(input.value));
    syncUI();
  });

  slider.addEventListener('input', () => {
    setA4(Number(slider.value));
    syncUI();
  });

  pitchControls.appendChild(label);
  pitchControls.appendChild(slider);
  pitchControls.appendChild(presetsDiv);
  pitchSection.appendChild(pitchControls);
  dropdown.appendChild(pitchSection);

  // ── Fullscreen toggle (only when API is available) ──────────────

  if (document.fullscreenEnabled || document.webkitFullscreenEnabled) {
    const fsDivider = document.createElement('div');
    fsDivider.className = 'menu-divider';
    dropdown.appendChild(fsDivider);

    const fsSection = document.createElement('div');
    fsSection.className = 'menu-section';

    const fsBtn = document.createElement('button');
    fsBtn.className = 'menu-item';
    fsBtn.setAttribute('role', 'menuitem');
    fsBtn.textContent = 'Enter Fullscreen';

    function isFullscreen() {
      return !!(document.fullscreenElement || document.webkitFullscreenElement);
    }

    function updateFsLabel() {
      fsBtn.textContent = isFullscreen() ? 'Exit Fullscreen' : 'Enter Fullscreen';
    }

    fsBtn.addEventListener('click', () => {
      if (isFullscreen()) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      } else {
        const el = document.documentElement;
        if (el.requestFullscreen) {
          el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen();
        }
      }
    });

    document.addEventListener('fullscreenchange', updateFsLabel);
    document.addEventListener('webkitfullscreenchange', updateFsLabel);

    fsSection.appendChild(fsBtn);
    dropdown.appendChild(fsSection);
  }

  // ── About link ──────────────────────────────────────────────────

  const aboutDivider = document.createElement('div');
  aboutDivider.className = 'menu-divider';
  dropdown.appendChild(aboutDivider);

  const aboutSection = document.createElement('div');
  aboutSection.className = 'menu-section';

  const aboutLink = document.createElement('a');
  aboutLink.className = 'menu-item';
  aboutLink.href = 'https://github.com/jasonpstewart/tuner';
  aboutLink.target = '_blank';
  aboutLink.rel = 'noopener';
  aboutLink.setAttribute('role', 'menuitem');
  aboutLink.textContent = 'About';
  aboutSection.appendChild(aboutLink);

  dropdown.appendChild(aboutSection);

  // ── Build version ───────────────────────────────────────────────

  if (typeof __BUILD_TIMESTAMP__ !== 'undefined') {
    const versionDivider = document.createElement('div');
    versionDivider.className = 'menu-divider';
    dropdown.appendChild(versionDivider);

    const versionSection = document.createElement('div');
    versionSection.className = 'menu-section';

    const versionLabel = document.createElement('div');
    versionLabel.className = 'menu-build-version';
    const buildDate = new Date(__BUILD_TIMESTAMP__);
    versionLabel.textContent = `Build: ${buildDate.toLocaleString()}`;
    versionSection.appendChild(versionLabel);

    dropdown.appendChild(versionSection);
  }

  // ── Open / close logic ───────────────────────────────────────────

  let isOpen = false;

  function openMenu() {
    if (isOpen) return;
    isOpen = true;
    dropdown.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.classList.add('active');
    // Force reflow so the opening animation plays
    void dropdown.offsetHeight;
    dropdown.classList.add('menu-dropdown--open');
    // Click-outside listener (deferred to next tick so the opening click isn't caught)
    requestAnimationFrame(() => {
      document.addEventListener('click', handleOutsideClick);
    });
    document.addEventListener('keydown', handleEscape);
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    dropdown.classList.remove('menu-dropdown--open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('active');
    // Wait for close animation before hiding
    const onEnd = () => {
      dropdown.hidden = true;
      dropdown.removeEventListener('transitionend', onEnd);
    };
    dropdown.addEventListener('transitionend', onEnd);
    // Fallback if transitionend doesn't fire (e.g. reduced motion)
    setTimeout(() => { dropdown.hidden = true; }, 200);
    document.removeEventListener('click', handleOutsideClick);
    document.removeEventListener('keydown', handleEscape);
  }

  function handleOutsideClick(e) {
    if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
      closeMenu();
    }
  }

  function handleEscape(e) {
    if (e.key === 'Escape') {
      closeMenu();
      toggle.focus();
    }
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Prevent clicks inside the dropdown from closing it
  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // ── Mount ────────────────────────────────────────────────────────

  container.appendChild(toggle);
  container.appendChild(dropdown);
}

/** @deprecated Use createMenu instead */
export const createSettings = createMenu;
