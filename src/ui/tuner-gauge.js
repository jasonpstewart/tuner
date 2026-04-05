/**
 * SVG-based needle gauge for tuner display.
 * Creates a semicircular gauge (-50 to +50 cents) with animated needle,
 * color zones, and digital readout.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

// Gauge geometry (viewBox coordinates)
const CX = 200;
const CY = 180;
const RADIUS = 150;
const ARC_START_DEG = -180; // left (flat)
const ARC_END_DEG = 0;     // right (sharp)

// Color zones
const COLOR_IN_TUNE = '#2dd4bf';
const COLOR_CLOSE = '#f59e0b';
const COLOR_OUT = '#f97316';

/**
 * Convert cents (-50..+50) to angle in degrees.
 * -50 cents → -90° (left), 0 → 0° (top), +50 → +90° (right)
 */
function centsToAngle(cents) {
  const clamped = Math.max(-50, Math.min(50, cents));
  return (clamped / 50) * 90;
}

/**
 * Convert degrees to radians.
 */
function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Create an SVG arc path for the semicircular gauge.
 * startDeg/endDeg are relative to 12-o'clock (-90 is left, +90 is right).
 */
function arcPath(cx, cy, r, startDeg, endDeg) {
  const startRad = degToRad(startDeg - 90);
  const endRad = degToRad(endDeg - 90);
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

function createSVGElement(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  return el;
}

function createColorZones(svg) {
  const strokeWidth = 18;
  const r = RADIUS;

  // Outer zone: full arc
  const outerArc = createSVGElement('path', {
    d: arcPath(CX, CY, r, -90, 90),
    fill: 'none',
    stroke: COLOR_OUT,
    'stroke-width': strokeWidth,
    'stroke-linecap': 'butt',
  });
  svg.appendChild(outerArc);

  // Close zone: ±25 cents → ±45°
  const closeArc = createSVGElement('path', {
    d: arcPath(CX, CY, r, -45, 45),
    fill: 'none',
    stroke: COLOR_CLOSE,
    'stroke-width': strokeWidth,
    'stroke-linecap': 'butt',
  });
  svg.appendChild(closeArc);

  // In-tune zone: ±10 cents → ±18°
  const inTuneArc = createSVGElement('path', {
    d: arcPath(CX, CY, r, -18, 18),
    fill: 'none',
    stroke: COLOR_IN_TUNE,
    'stroke-width': strokeWidth,
    'stroke-linecap': 'butt',
  });
  svg.appendChild(inTuneArc);
}

function createTickMarks(svg) {
  const ticks = [
    { cents: -50, label: '-50' },
    { cents: -25, label: '-25' },
    { cents: 0, label: '0' },
    { cents: 25, label: '+25' },
    { cents: 50, label: '+50' },
  ];

  for (const tick of ticks) {
    const angle = centsToAngle(tick.cents);
    const rad = degToRad(angle - 90);
    const innerR = RADIUS - 16;
    const outerR = RADIUS + 16;
    const labelR = RADIUS + 30;

    const x1 = CX + innerR * Math.cos(rad);
    const y1 = CY + innerR * Math.sin(rad);
    const x2 = CX + outerR * Math.cos(rad);
    const y2 = CY + outerR * Math.sin(rad);

    const line = createSVGElement('line', {
      x1, y1, x2, y2,
      stroke: '#a3a3a3',
      'stroke-width': tick.cents === 0 ? 2.5 : 1.5,
    });
    svg.appendChild(line);

    const lx = CX + labelR * Math.cos(rad);
    const ly = CY + labelR * Math.sin(rad);
    const text = createSVGElement('text', {
      x: lx,
      y: ly,
      fill: '#a3a3a3',
      'font-size': '11',
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-family': 'system-ui, sans-serif',
    });
    text.textContent = tick.label;
    svg.appendChild(text);
  }
}

function createLabels(svg) {
  // FLAT label (left side)
  const flatLabel = createSVGElement('text', {
    x: CX - RADIUS - 12,
    y: CY + 20,
    fill: '#a3a3a3',
    'font-size': '13',
    'font-weight': '600',
    'text-anchor': 'middle',
    'font-family': 'system-ui, sans-serif',
    'aria-label': 'Flat indicator',
  });
  flatLabel.textContent = 'FLAT';
  svg.appendChild(flatLabel);

  // Arrow down (flat) on left
  const flatArrow = createSVGElement('text', {
    x: CX - RADIUS - 12,
    y: CY + 38,
    fill: '#a3a3a3',
    'font-size': '16',
    'text-anchor': 'middle',
    'font-family': 'system-ui, sans-serif',
    class: 'gauge-arrow gauge-arrow-flat',
  });
  flatArrow.textContent = '\u25BC'; // down arrow
  svg.appendChild(flatArrow);

  // SHARP label (right side)
  const sharpLabel = createSVGElement('text', {
    x: CX + RADIUS + 12,
    y: CY + 20,
    fill: '#a3a3a3',
    'font-size': '13',
    'font-weight': '600',
    'text-anchor': 'middle',
    'font-family': 'system-ui, sans-serif',
    'aria-label': 'Sharp indicator',
  });
  sharpLabel.textContent = 'SHARP';
  svg.appendChild(sharpLabel);

  // Arrow up (sharp) on right
  const sharpArrow = createSVGElement('text', {
    x: CX + RADIUS + 12,
    y: CY + 38,
    fill: '#a3a3a3',
    'font-size': '16',
    'text-anchor': 'middle',
    'font-family': 'system-ui, sans-serif',
    class: 'gauge-arrow gauge-arrow-sharp',
  });
  sharpArrow.textContent = '\u25B2'; // up arrow
  svg.appendChild(sharpArrow);

  return { flatArrow, sharpArrow };
}

function createNeedle(svg) {
  const g = createSVGElement('g', {
    class: 'gauge-needle',
    'transform-origin': `${CX} ${CY}`,
  });

  // Needle line
  const needle = createSVGElement('line', {
    x1: CX,
    y1: CY,
    x2: CX,
    y2: CY - RADIUS + 20,
    stroke: '#f5f5f5',
    'stroke-width': 2.5,
    'stroke-linecap': 'round',
  });
  g.appendChild(needle);

  // Center dot
  const dot = createSVGElement('circle', {
    cx: CX,
    cy: CY,
    r: 6,
    fill: '#f5f5f5',
  });
  g.appendChild(dot);

  svg.appendChild(g);
  return g;
}

function createReadout(container) {
  const readout = document.createElement('div');
  readout.className = 'gauge-readout';
  readout.setAttribute('aria-live', 'polite');

  const noteName = document.createElement('span');
  noteName.className = 'gauge-note-name';
  noteName.textContent = '--';

  const octave = document.createElement('span');
  octave.className = 'gauge-octave';
  octave.textContent = '';

  const frequency = document.createElement('span');
  frequency.className = 'gauge-frequency';
  frequency.textContent = '--- Hz';

  const cents = document.createElement('span');
  cents.className = 'gauge-cents';
  cents.textContent = '-- cents';

  const arrowIndicator = document.createElement('span');
  arrowIndicator.className = 'gauge-direction-arrow';
  arrowIndicator.setAttribute('aria-hidden', 'true');
  arrowIndicator.textContent = '';

  readout.appendChild(noteName);
  readout.appendChild(octave);
  readout.appendChild(arrowIndicator);
  readout.appendChild(frequency);
  readout.appendChild(cents);

  container.appendChild(readout);

  return { noteName, octave, frequency, cents, arrowIndicator };
}

/**
 * Create a TunerGauge inside the given container element.
 * @param {HTMLElement} container
 * @returns {{ update: Function }}
 */
export function create(container) {
  const wrapper = document.createElement('div');
  wrapper.className = 'gauge-wrapper';

  const svg = createSVGElement('svg', {
    viewBox: '0 0 400 240',
    class: 'gauge-svg',
    role: 'img',
    'aria-label': 'Tuning gauge showing cents deviation from target note',
  });

  createColorZones(svg);
  createTickMarks(svg);
  const { flatArrow, sharpArrow } = createLabels(svg);
  const needleGroup = createNeedle(svg);

  wrapper.appendChild(svg);

  const readout = createReadout(wrapper);
  container.appendChild(wrapper);

  /**
   * Update the gauge display.
   * @param {{ cents: number, note: string, octave: number, frequency: number, inTune: boolean }} data
   */
  function update({ cents = 0, note = '--', octave = '', frequency = 0, inTune = false }) {
    // Update needle rotation
    const angle = centsToAngle(cents);
    needleGroup.setAttribute('transform', `rotate(${angle} ${CX} ${CY})`);

    // Update needle color based on zone
    const needleLine = needleGroup.querySelector('line');
    const needleDot = needleGroup.querySelector('circle');
    let needleColor = COLOR_OUT;
    if (Math.abs(cents) <= 10) needleColor = COLOR_IN_TUNE;
    else if (Math.abs(cents) <= 25) needleColor = COLOR_CLOSE;
    needleLine.setAttribute('stroke', needleColor);
    needleDot.setAttribute('fill', needleColor);

    // Update arrow indicators in SVG
    const isFlat = cents < -1;
    const isSharp = cents > 1;
    flatArrow.setAttribute('fill', isFlat ? COLOR_OUT : '#a3a3a3');
    flatArrow.setAttribute('font-size', isFlat ? '20' : '16');
    sharpArrow.setAttribute('fill', isSharp ? COLOR_OUT : '#a3a3a3');
    sharpArrow.setAttribute('font-size', isSharp ? '20' : '16');

    // Update readout
    readout.noteName.textContent = note;
    readout.octave.textContent = octave !== '' ? octave : '';
    readout.frequency.textContent = frequency > 0 ? `${frequency.toFixed(1)} Hz` : '--- Hz';

    const sign = cents > 0 ? '+' : '';
    readout.cents.textContent = `${sign}${cents.toFixed(1)} cents`;

    // Direction arrow in readout
    if (isFlat) {
      readout.arrowIndicator.textContent = '\u2193'; // down arrow
      readout.arrowIndicator.style.color = COLOR_OUT;
    } else if (isSharp) {
      readout.arrowIndicator.textContent = '\u2191'; // up arrow
      readout.arrowIndicator.style.color = COLOR_OUT;
    } else {
      readout.arrowIndicator.textContent = '\u2713'; // checkmark
      readout.arrowIndicator.style.color = COLOR_IN_TUNE;
    }

    // In-tune glow effect
    if (inTune) {
      wrapper.classList.add('gauge-in-tune');
    } else {
      wrapper.classList.remove('gauge-in-tune');
    }
  }

  return { update };
}

/**
 * TunerGauge class wrapper for convenience.
 */
export class TunerGauge {
  constructor(container) {
    const gauge = create(container);
    this.update = gauge.update;
  }
}
