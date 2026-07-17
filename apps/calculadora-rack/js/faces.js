// faces.js — dibujo del frente de cada equipo, estilo elevación de rack CAD.
//
// window.CALCRACK_FACE(it, box) recibe el equipo y su caja en mm:
//   it  = { kind, color, name, u }
//   box = { x0, x1, y0, y1, ear }   (x0..x1 = frente 19"; ear = saliente oreja)
// y devuelve { shapes, annotations } listos para inyectar en el layout Plotly.
//
// Cada equipo se compone de: orejas de montaje con tornillos, faceplate
// metálico con bisel, una franja de color por categoría + placa de nombre, y
// el detalle frontal propio del tipo (puertos RJ45, LEDs, rejillas, bahías de
// disco, outlets, etc.). El cuerpo es gris acero a propósito: lee como dibujo
// técnico, no como bloque de color. El color de marca queda en la franja.

(function () {
  'use strict';

  // ── Paleta metálica / linework ───────────────────────────────────────
  const M = {
    face:    '#e7ebf0', faceEdge: '#5b6470',
    hi:      'rgba(255,255,255,0.75)', lo: 'rgba(31,41,55,0.13)',
    ear:     '#ccd2da', earEdge: '#5b6470',
    screwR:  '#828a94', screwF: '#b9c0c9',
    line:    '#4b5563',
    bezel:   '#c4ccd5',
    port:    '#33404e', portEdge: '#222c37', portPin: '#8a93a0',
    vent:    'rgba(64,76,92,0.55)',
    ledG:    '#3fb950', ledA: '#f0b429', ledOff: '#9aa2ad',
    lcd:     '#1f6f5c', lcdEdge: '#13433a',
    dark:    '#2b333d',
    label:   '#1f2937', sub: '#6b7280',
  };

  // ── Primitivas ───────────────────────────────────────────────────────
  const rect = (x0, y0, x1, y1, fill, line, w) => ({
    type: 'rect', x0, y0, x1, y1,
    fillcolor: fill || 'rgba(0,0,0,0)',
    line: { color: line || 'rgba(0,0,0,0)', width: w == null ? 0 : w },
    layer: 'above',
  });
  const seg = (x0, y0, x1, y1, color, w) => ({
    type: 'line', x0, y0, x1, y1, line: { color, width: w || 1 }, layer: 'above',
  });
  const circ = (cx, cy, r, fill, line, w) => ({
    type: 'circle', x0: cx - r, y0: cy - r, x1: cx + r, y1: cy + r,
    fillcolor: fill || 'rgba(0,0,0,0)',
    line: { color: line || 'rgba(0,0,0,0)', width: w == null ? 0.8 : w },
    layer: 'above',
  });

  function contrast(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return '#1f2937';
    const n = parseInt(m[1], 16);
    const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    return lum > 0.62 ? '#1f2937' : '#ffffff';
  }

  // Rejilla genérica de celdas (puertos / bahías) que llena un área con cols×rows.
  function grid(ax0, ay0, ax1, ay1, cols, rows, fill, line, gapMax) {
    const out = [];
    const gx = Math.min(gapMax == null ? 2.4 : gapMax, (ax1 - ax0) / cols * 0.3);
    const gy = Math.min(gapMax == null ? 2.4 : gapMax, (ay1 - ay0) / rows * 0.3);
    const pw = ((ax1 - ax0) - (cols + 1) * gx) / cols;
    const ph = ((ay1 - ay0) - (rows + 1) * gy) / rows;
    if (pw <= 0 || ph <= 0) return out;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const px0 = ax0 + gx + c * (pw + gx);
        const py0 = ay0 + gy + r * (ph + gy);
        out.push(rect(px0, py0, px0 + pw, py0 + ph, fill, line, 0.5));
      }
    }
    return out;
  }

  // Slots verticales de ventilación que llenan un área.
  function vents(ax0, ay0, ax1, ay1, n) {
    const out = [];
    const gap = (ax1 - ax0) / (n * 1.8);
    const w = (ax1 - ax0) / (n * 1.8);
    for (let i = 0; i < n; i++) {
      const x = ax0 + gap + i * (w + gap);
      if (x + w > ax1) break;
      out.push(rect(x, ay0, x + w, ay1, M.vent, null, 0));
    }
    return out;
  }

  // ── Detalle por tipo (dentro del área de contenido) ──────────────────
  // a = { x0, y0, x1, y1 } área útil a la derecha de la placa de nombre.
  const detail = {
    switch(a, it) {
      const s = [];
      const rows = (a.y1 - a.y0) > 26 ? 2 : 1;
      const cols = 24;
      const midY = (a.y0 + a.y1) / 2;
      const portArea = rows === 2
        ? [a.x0, a.y0 + 2, a.x1 - 34, a.y1 - 2]
        : [a.x0, a.y0 + 1, a.x1 - 34, a.y1 - 1];
      s.push(...grid(portArea[0], portArea[1], portArea[2], portArea[3], cols, rows, M.port, M.portEdge, 1.4));
      // Uplinks SFP a la derecha + LEDs de estado.
      s.push(...grid(a.x1 - 30, a.y0 + 3, a.x1 - 4, a.y1 - 3, 2, 1, M.dark, M.portEdge, 2));
      s.push(circ(a.x0 - 8, midY, 1.8, M.ledG, null, 0));
      s.push(circ(a.x0 - 8, midY + 6, 1.8, M.ledA, null, 0));
      return s;
    },
    router(a) {
      const s = [];
      const midY = (a.y0 + a.y1) / 2;
      s.push(...grid(a.x0, a.y0 + 3, a.x1 - 60, a.y1 - 3, 8, 1, M.port, M.portEdge, 3));
      // Módulos/slots a la derecha.
      s.push(...grid(a.x1 - 54, a.y0 + 2, a.x1 - 4, a.y1 - 2, 2, 1, M.bezel, M.line, 3));
      for (let i = 0; i < 4; i++) s.push(circ(a.x0 - 8, a.y0 + 5 + i * ((a.y1 - a.y0 - 10) / 3), 1.6, i % 2 ? M.ledG : M.ledOff, null, 0));
      return s;
    },
    firewall(a) {
      const s = [];
      s.push(...grid(a.x0, a.y0 + 3, a.x0 + (a.x1 - a.x0) * 0.5, a.y1 - 3, 6, 1, M.port, M.portEdge, 3));
      s.push(...vents(a.x0 + (a.x1 - a.x0) * 0.55, a.y0 + 2, a.x1 - 4, a.y1 - 2, 10));
      s.push(circ(a.x0 - 8, (a.y0 + a.y1) / 2, 2, M.ledG, null, 0));
      return s;
    },
    patch(a) {
      const s = [];
      const rows = (a.y1 - a.y0) > 26 ? 2 : 1;
      // Keystones: cuadro + agujero interior, en grupos visuales.
      const cols = 24;
      const outer = grid(a.x0, a.y0 + 1, a.x1 - 4, a.y1 - 1, cols, rows, M.bezel, M.line, 1.2);
      s.push(...outer);
      for (const cell of outer) {
        const cx = (cell.x0 + cell.x1) / 2, cy = (cell.y0 + cell.y1) / 2;
        const r = Math.min(cell.x1 - cell.x0, cell.y1 - cell.y0) * 0.28;
        s.push(rect(cx - r, cy - r, cx + r, cy + r, M.port, M.portEdge, 0.4));
      }
      return s;
    },
    fiber(a) {
      const s = [];
      // Adaptadores LC dúplex (pares).
      const pairs = 12;
      const g = grid(a.x0, a.y0 + 4, a.x1 - 4, a.y1 - 4, pairs, 1, M.bezel, M.line, 2.2);
      s.push(...g);
      for (const cell of g) {
        const w = cell.x1 - cell.x0;
        s.push(rect(cell.x0 + w * 0.18, cell.y0 + 2, cell.x0 + w * 0.42, cell.y1 - 2, M.lcd, M.lcdEdge, 0.4));
        s.push(rect(cell.x0 + w * 0.58, cell.y0 + 2, cell.x0 + w * 0.82, cell.y1 - 2, M.lcd, M.lcdEdge, 0.4));
      }
      return s;
    },
    cable(a, it) {
      const s = [];
      // Peine organizador: dedos verticales con D-rings.
      const fingers = 7;
      const fw = (a.x1 - a.x0) / (fingers * 2);
      for (let i = 0; i < fingers; i++) {
        const x = a.x0 + fw / 2 + i * (a.x1 - a.x0) / fingers;
        s.push(rect(x, a.y0 + 2, x + fw, a.y1 - 2, M.bezel, M.line, 0.8));
      }
      // D-rings (arcos) como círculos guía.
      for (let i = 0; i < fingers - 1; i++) {
        const cx = a.x0 + (i + 1) * (a.x1 - a.x0) / fingers;
        s.push(circ(cx, (a.y0 + a.y1) / 2, Math.min(6, (a.y1 - a.y0) / 3), null, M.line, 0.9));
      }
      return s;
    },
    server(a, it) {
      const s = [];
      const rows = it.u >= 4 ? 2 : 1;
      const bays = it.u >= 2 ? 8 : 4;
      // Bahías de disco a la izquierda.
      const bayW = (a.x1 - a.x0) * 0.42;
      s.push(...grid(a.x0, a.y0 + 2, a.x0 + bayW, a.y1 - 2, bays, rows, M.bezel, M.line, 1.6));
      // Cada bahía con tirador + LED.
      const bg = grid(a.x0, a.y0 + 2, a.x0 + bayW, a.y1 - 2, bays, rows, 'rgba(0,0,0,0)', null, 1.6);
      for (const cell of bg) {
        s.push(seg(cell.x0 + 2, (cell.y0 + cell.y1) / 2, cell.x1 - 5, (cell.y0 + cell.y1) / 2, M.line, 0.6));
        s.push(circ(cell.x1 - 3, cell.y1 - 3, 0.9, M.ledG, null, 0));
      }
      // Rejilla de ventilación al centro.
      s.push(...vents(a.x0 + bayW + 8, a.y0 + 3, a.x1 - 60, a.y1 - 3, 14));
      // Panel de control a la derecha: power + 2 LEDs + USB.
      const cx = a.x1 - 44;
      s.push(circ(cx, (a.y0 + a.y1) / 2, 3, M.bezel, M.line, 1)); // botón power
      s.push(seg(cx - 1.4, (a.y0 + a.y1) / 2, cx + 1.4, (a.y0 + a.y1) / 2, M.line, 1));
      s.push(circ(cx + 12, (a.y0 + a.y1) / 2 + 4, 1.6, M.ledG, null, 0));
      s.push(circ(cx + 12, (a.y0 + a.y1) / 2 - 4, 1.6, M.ledA, null, 0));
      s.push(rect(a.x1 - 22, (a.y0 + a.y1) / 2 - 3, a.x1 - 6, (a.y0 + a.y1) / 2 + 3, M.dark, M.portEdge, 0.6)); // USB
      return s;
    },
    storage(a, it) {
      const s = [];
      // Caddies de disco llenando casi todo el frente.
      const cols = 12, rows = it.u >= 4 ? 4 : 2;
      const g = grid(a.x0, a.y0 + 2, a.x1 - 6, a.y1 - 2, cols, rows, M.bezel, M.line, 1.4);
      s.push(...g);
      for (const cell of g) {
        s.push(seg(cell.x0 + 1.5, (cell.y0 + cell.y1) / 2, cell.x1 - 4, (cell.y0 + cell.y1) / 2, M.line, 0.5));
        s.push(circ(cell.x1 - 2.6, cell.y1 - 2.6, 0.8, M.ledG, null, 0));
      }
      return s;
    },
    ups(a) {
      const s = [];
      // LCD + botones a la izquierda, ventilación a la derecha.
      s.push(rect(a.x0, a.y0 + 4, a.x0 + 70, a.y1 - 4, M.lcd, M.lcdEdge, 1));
      for (let i = 0; i < 4; i++) s.push(seg(a.x0 + 6 + i * 14, a.y0 + 8, a.x0 + 14 + i * 14, a.y0 + 8, 'rgba(255,255,255,0.55)', 1));
      s.push(circ(a.x0 + 86, (a.y0 + a.y1) / 2 + 5, 3, M.bezel, M.line, 1));
      s.push(circ(a.x0 + 100, (a.y0 + a.y1) / 2 + 5, 3, M.bezel, M.line, 1));
      s.push(circ(a.x0 + 93, (a.y0 + a.y1) / 2 - 6, 2, M.ledG, null, 0));
      s.push(...vents(a.x0 + 120, a.y0 + 3, a.x1 - 6, a.y1 - 3, 16));
      return s;
    },
    pdu(a) {
      const s = [];
      // Breaker + fila de tomas (IEC C13).
      s.push(rect(a.x0, (a.y0 + a.y1) / 2 - 5, a.x0 + 14, (a.y0 + a.y1) / 2 + 5, M.bezel, M.line, 1));
      const n = 10;
      const g = grid(a.x0 + 22, a.y0 + 4, a.x1 - 6, a.y1 - 4, n, 1, M.dark, M.portEdge, 3);
      s.push(...g);
      for (const cell of g) {
        const cx = (cell.x0 + cell.x1) / 2, cy = (cell.y0 + cell.y1) / 2;
        s.push(seg(cx, cell.y0 + 2, cx, cell.y1 - 2, M.portPin, 0.8));
      }
      return s;
    },
    kvm(a) {
      const s = [];
      // Cajón consola: bandeja de teclado + tiradores + touchpad.
      s.push(rect(a.x0, a.y0 + 3, a.x1 - 6, a.y1 - 3, M.bezel, M.line, 1));
      s.push(...grid(a.x0 + 6, a.y0 + 6, a.x1 - 70, a.y1 - 6, 12, 1, M.face, M.line, 1.4)); // teclas (insinuadas)
      s.push(rect(a.x1 - 60, a.y0 + 6, a.x1 - 30, a.y1 - 6, M.dark, M.portEdge, 0.8)); // touchpad
      // Tiradores.
      s.push(rect(a.x0 - 2, (a.y0 + a.y1) / 2 - 4, a.x0 + 3, (a.y0 + a.y1) / 2 + 4, M.line, M.line, 1));
      return s;
    },
    shelf(a) {
      const s = [];
      // Bandeja: labio frontal + perforaciones de ventilación.
      s.push(rect(a.x0, a.y1 - 8, a.x1 - 6, a.y1 - 2, M.bezel, M.line, 1));
      s.push(...grid(a.x0, a.y0 + 2, a.x1 - 6, a.y1 - 12, 18, 1, M.vent, null, 2));
      return s;
    },
    blank(a) {
      const s = [];
      // Panel ciego: dos ranuras-tirador centradas + textura sutil.
      const cy = (a.y0 + a.y1) / 2;
      s.push(rect((a.x0 + a.x1) / 2 - 60, cy - 2.5, (a.x0 + a.x1) / 2 - 20, cy + 2.5, M.bezel, M.line, 0.8));
      s.push(rect((a.x0 + a.x1) / 2 + 20, cy - 2.5, (a.x0 + a.x1) / 2 + 60, cy + 2.5, M.bezel, M.line, 0.8));
      return s;
    },
  };

  // ── Faceplate completo de un equipo de riel ──────────────────────────
  function railFace(it, box) {
    const { x0, x1, y0, y1, ear } = box;
    const shapes = [];
    const ann = [];
    const cy = (y0 + y1) / 2;
    const accent = it.color;

    // Orejas de montaje + tornillos (arriba y abajo; intermedios si u≥3).
    for (const [ex0, ex1, ecx] of [[x0 - ear, x0, x0 - ear / 2], [x1, x1 + ear, x1 + ear / 2]]) {
      shapes.push(rect(ex0, y0, ex1, y1, M.ear, M.earEdge, 1));
      const screwYs = [y0 + 7, y1 - 7];
      const span = (y1 - y0);
      if (span > 100) for (let yy = y0 + 7 + 44.45; yy < y1 - 10; yy += 44.45) screwYs.push(yy);
      for (const sy of screwYs) {
        shapes.push(circ(ecx, sy, 2.6, M.screwF, M.screwR, 1));
        shapes.push(seg(ecx - 1.6, sy, ecx + 1.6, sy, M.screwR, 0.9)); // ranura del tornillo
      }
    }

    // Cuerpo del faceplate + bisel.
    shapes.push(rect(x0, y0, x1, y1, M.face, M.faceEdge, 1.2));
    shapes.push(rect(x0 + 1.5, y1 - 2.4, x1 - 1.5, y1 - 0.6, M.hi, null, 0));  // highlight superior
    shapes.push(rect(x0 + 1.5, y0 + 0.6, x1 - 1.5, y0 + 2.4, M.lo, null, 0));  // sombra inferior

    // Franja de color de categoría.
    shapes.push(rect(x0 + 4, y0 + 3, x0 + 12, y1 - 3, accent, null, 0));

    // Detalle del tipo: ocupa TODO el ancho del frente, igual que en la vida
    // real (puertos / bahías / rejillas cubren la unidad 19" entera). El
    // nombre NO va en el frente — lo rotula rack.js en el margen izquierdo,
    // como en un plano de elevación, para no tapar el detalle.
    const a = { x0: x0 + 14, y0: y0 + 4, x1: x1 - 8, y1: y1 - 4 };
    const fn = detail[it.kind];
    if (fn) {
      try { shapes.push(...fn(a, it)); } catch (_) { /* detalle opcional */ }
    }

    return { shapes, annotations: ann };
  }

  // ── PDU vertical en canal lateral (caja angosta y alta) ──────────────
  function sideFace(it, box) {
    const { x0, x1, y0, y1 } = box;
    const shapes = [];
    const ann = [];
    const w = x1 - x0, cx = (x0 + x1) / 2;

    shapes.push(rect(x0, y0, x1, y1, M.face, M.faceEdge, 1.2));
    shapes.push(rect(x0 + 1, y0, x0 + 2.5, y1, M.lo, null, 0));
    shapes.push(rect(x1 - 2.5, y0, x1 - 1, y1, M.hi, null, 0));
    // Breaker arriba.
    shapes.push(rect(cx - w * 0.28, y1 - 18, cx + w * 0.28, y1 - 6, it.color, M.line, 1));
    // Columna de tomas (IEC).
    const n = Math.max(8, Math.floor((y1 - y0 - 40) / 26));
    const g = grid(x0 + 4, y0 + 8, x1 - 4, y1 - 26, 1, n, M.dark, M.portEdge, 3);
    shapes.push(...g);
    for (const cell of g) {
      const ccx = (cell.x0 + cell.x1) / 2;
      shapes.push(seg(ccx, (cell.y0 + cell.y1) / 2 - 2, ccx, (cell.y0 + cell.y1) / 2 + 2, M.portPin, 0.8));
    }
    ann.push({ x: cx, y: (y0 + y1) / 2, text: 'PDU', textangle: -90, showarrow: false,
      font: { size: 10, color: M.label, family: 'Lato, system-ui, sans-serif' } });
    return { shapes, annotations: ann };
  }

  window.CALCRACK_FACE = function (it, box) {
    return it.mount === 'side' ? sideFace(it, box) : railFace(it, box);
  };
})();
