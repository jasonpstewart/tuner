/**
 * Settings panel with configurable A4 reference pitch.
 *
 * Exports:
 *   createSettings(container) — mounts settings toggle + panel
 *   getReferencePitch()       — returns current A4 value
 *   onReferencePitchChange(cb) — subscribe to changes
 */

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

/**
 * Mounts a settings toggle button and collapsible panel into the given container.
 * @param {HTMLElement} container — typically the .app-header element
 */
export function createSettings(container) {
  // Toggle button
  const toggle = document.createElement('button');
  toggle.className = 'settings-toggle';
  toggle.setAttribute('aria-label', 'Settings');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.title = 'Adjust the A4 reference pitch';
  toggle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;

  // Panel
  const panel = document.createElement('div');
  panel.className = 'settings-panel';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Reference pitch settings');
  panel.hidden = true;

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

  toggle.addEventListener('click', () => {
    const opening = panel.hidden;
    panel.hidden = !opening;
    toggle.setAttribute('aria-expanded', String(opening));
    toggle.classList.toggle('active', opening);
  });

  // Assemble panel
  panel.appendChild(label);
  panel.appendChild(slider);
  panel.appendChild(presetsDiv);

  // Mount — toggle goes in the header, panel goes right after header
  container.appendChild(toggle);
  container.parentElement.insertBefore(panel, container.nextSibling);
}
