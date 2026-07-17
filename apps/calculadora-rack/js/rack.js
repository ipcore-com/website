// rack.js — configurador 2D del rack IPcore.
//
// Modelo (vida real, EIA-310):
//   • 1U = 44.45 mm. La altura del armario se mide en U (42/45/47).
//   • Panel de montaje 19" = 482.6 mm — el frente de todo equipo rackeable.
//   • Ancho del armario: 600 mm (60 cm) u 800 mm (80 cm). El montaje 19" es
//     el mismo en ambos; el de 800 mm deja canales laterales anchos donde se
//     montan PDUs verticales (0U). En 600 mm no entran → se deshabilitan.
//
// El dibujo es un alzado frontal monocromo tipo CAD sobre "papel": el armario
// (marco + zócalo), los dos rieles de montaje perforados, la grilla de U con
// su numeración, y los equipos como rectángulos a escala real coloreados por
// categoría. Todo en mm reales con relación de aspecto 1:1 (sin distorsión).
//
// Interacción: clic en el catálogo → inserta en la ranura libre más alta que
// alcance (llena de arriba hacia abajo). La lista "Contenido del rack" permite
// seleccionar, reubicar (▲▼) y
// quitar (✕). Clic sobre un equipo en el dibujo también lo selecciona.

(function () {
  'use strict';

  // ── i18n: t(clave_es, vars?) traduce según el idioma activo (ES = identidad,
  // EN vía diccionario). Ver js/i18n.js. Fallback seguro si aún no cargó. ──────
  const I18N = window.CALCRACK_I18N || { t: (s) => s, onChange: () => {}, applyStatic: () => {}, getLang: () => 'es', setLang: () => {} };
  const t = (s, vars) => I18N.t(s, vars);

  // ── Constantes físicas (mm) ──────────────────────────────────────────
  const U_MM       = 44.45;   // 1 unidad de rack
  const RACK_19_MM = 482.6;   // ancho del frente 19"
  const FRAME      = 22;      // espesor del marco lateral del armario
  const PLINTH     = 90;      // zócalo inferior
  const TOP_CAP    = 40;      // remate superior
  const RAIL_W     = 15;      // ancho visual del riel de montaje
  const EAR        = 6;       // saliente de las orejas del equipo sobre el riel
  // Margen lateral (aire a cada lado del gabinete, en mm-dato). Izq. = nombres de
  // equipo; der. = columna de POTENCIAS + totales. Simétrico → el gabinete queda
  // centrado (clave para el carrusel). En móvil los totales van APILADOS (valor +
  // etiqueta debajo) para que quepan sin solaparse con el gabinete/números.
  const SIDE_GUTTER = 320;

  // ── Paleta del dibujo ────────────────────────────────────────────────
  const C = {
    frame:    '#0e2017',
    frameEdge:'rgba(50,213,131,0.45)',
    plinth:   '#0b1812',
    paper:    '#040d09',
    rail:     '#13261c',
    railEdge: 'rgba(50,213,131,0.50)',
    hole:     '#02100a',
    uLine:    'rgba(50,213,131,0.10)',
    uLine5:   'rgba(50,213,131,0.24)',
    channel:  'rgba(50,213,131,0.06)',
    channelEdge: 'rgba(50,213,131,0.35)',
    accent:   '#32d583',
    eqEdge:   'rgba(157,182,170,0.45)',
  };

  // ── Estado ───────────────────────────────────────────────────────────
  // Varios racks: `racks` es la colección y `state` apunta SIEMPRE al rack
  // activo (todo el resto del código lee `state.x`). uidSeq es global a todos
  // los racks; `id` es un identificador estable único por rack (para futura
  // persistencia), independiente del número visible del nombre.
  const racks = [];
  let rackUidSeq = 1;
  // Número visible del rack ("Rack N"): continúa desde el máximo actual (máx+1).
  // Borrar un rack del medio deja el hueco y el próximo sigue subiendo; solo al
  // borrar desde la punta derecha (el número más alto) el contador retrocede y
  // ese número vuelve a estar disponible. Los racks renombrados a mano no cuentan.
  function nextRackNumber() {
    let max = 0;
    racks.forEach(r => {
      const m = /^Rack (\d+)$/.exec(r.name);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return max + 1;
  }
  function makeRack(name) {
    return {
      id: rackUidSeq++, name: name || ('Rack ' + nextRackNumber()),
      widthMM: 800, heightU: 42,
      items: [],        // { uid, catId, name, u, color, mount, posU?, side?, power_w, config? }
      selected: null,   // uid del item seleccionado
      targetU: null,    // U (1-based) de una ranura libre elegida para insertar
    };
  }
  racks.push(makeRack());
  let state = racks[0];
  let uidSeq = 1;

  const $ = sel => document.querySelector(sel);
  const catalog = window.CALCRACK_CATALOG || [];
  const catById = id => catalog.find(c => c.id === id);

  // ── Base de datos de modelos (consumo) ───────────────────────────────
  // Se carga async de /data/*.json (ver docs/db.md). La usa el modal de
  // "Añadir servidor" para elegir CPUs/GPUs reales o el genérico editable.
  const DB = { cpus: [], gpus: [], dpus: [], switches: [], routers: [] };
  const dbReady = Promise.all(Object.keys(DB).map(k =>
    fetch('data/' + k + '.json').then(r => r.json()).then(d => { DB[k] = d; }).catch(() => {})));

  // Formatea watts: W hasta 1000, kW (2 decimales) por encima.
  const fmtW = w => w >= 1000 ? (w / 1000).toFixed(2) + ' kW' : Math.round(w) + ' W';

  // ── Modo "Realista" (sprites fotográficos 2D) ────────────────────────
  // Toggle CAD ↔ Realista. En realista, los equipos cuyo `kind` tiene sprite
  // se dibujan como foto compuesta en su ranura; el resto cae al faceplate
  // vectorial (fallback). Los sprites se recortan de una foto de referencia.
  let realista = true;   // sólo modo Realista por ahora (toggle CAD oculto, ver mountViewToggle)
  let exportMode = false; // true mientras se renderiza un rack para la imagen de export
                          // (omite el bloque de totales dibujado: en el export van en el pie)
  const SPRITES = {
    // Fotográficos (recortados de la referencia)
    switch:  'sprites/switch.png',
    storage: 'sprites/storage.png',
    ups:     'sprites/ups.png',
    // Sintéticos (faceplate de metal por tipo)
    server:   'sprites/server.png',
    router:   'sprites/router.png',
    firewall: 'sprites/firewall.png',
    patch:    'sprites/patch.png',
    fiber:    'sprites/fiber.png',
    cable:    'sprites/cable.png',
    kvm:      'sprites/kvm.png',
    shelf:    'sprites/shelf.png',
    blank:    'sprites/blank.png',
    pdu:      'sprites/pdu.png',
    pduv:     'sprites/pduv.png',
  };

  // Precarga de assets (sprites de equipos + texturas del armario + DB) detrás
  // del spinner de primera carga: sin esto, la imagen de cada equipo/armario se
  // descarga recién la primera vez que se dibuja (lag notable online). Cuando
  // todo está en caché, agregar/mover items es instantáneo. Tope de seguridad
  // para no colgar la carga si algún asset falla.
  (function preloadAssets() {
    const cab = ['metal', 'vent', 'plinth', 'rail'].map(n => 'sprites/cab/' + n + '.png');
    const urls = [...new Set([...Object.values(SPRITES), ...cab])];
    const loadImg = url => new Promise(res => { const i = new Image(); i.onload = i.onerror = res; i.src = url; });
    const done = () => {
      const el = document.getElementById('loading');
      if (!el) return;
      el.classList.add('hide');
      setTimeout(() => el.remove(), 300);
    };
    Promise.race([
      Promise.all([...urls.map(loadImg), dbReady]),
      new Promise(res => setTimeout(res, 8000)),   // tope de seguridad
    ]).then(done);
  })();

  // ── Helpers de geometría ─────────────────────────────────────────────
  const totalH = () => state.heightU * U_MM;
  const bayX0  = () => (state.widthMM - RACK_19_MM) / 2;          // borde izq. del frente 19"
  const bayX1  = () => bayX0() + RACK_19_MM;
  // y (mm) del borde inferior de la U número `n` (1-based, U1 abajo).
  const uBottom = n => (n - 1) * U_MM;

  function contrast(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex);
    if (!m) return '#1f2937';
    const n = parseInt(m[1], 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.6 ? '#1f2937' : '#ffffff';
  }

  // ── Ocupación de los rieles ──────────────────────────────────────────
  // Array de heightU booleanos; índice 0 = U1.
  function occupancy() {
    const occ = new Array(state.heightU).fill(false);
    for (const it of state.items) {
      if (it.mount !== 'rail') continue;
      for (let i = 0; i < it.u; i++) {
        const idx = it.posU - 1 + i;
        if (idx >= 0 && idx < occ.length) occ[idx] = true;
      }
    }
    return occ;
  }

  // Ocupación IGNORANDO un item (por uid) — para editar/reubicar sin contarse a sí mismo.
  function occExcept(uid) {
    const occ = new Array(state.heightU).fill(false);
    for (const it of state.items) {
      if (it.mount !== 'rail' || it.uid === uid) continue;
      for (let i = 0; i < it.u; i++) { const idx = it.posU - 1 + i; if (idx >= 0 && idx < occ.length) occ[idx] = true; }
    }
    return occ;
  }

  // Registro de editores por tipo (cada modal registra su openForEdit) + despacho.
  const editors = {};
  function editItem(uid) {
    const it = state.items.find(i => i.uid === uid);
    if (!it) return;
    if (it.kind === 'server') { if (editors.server) editors.server(it); }
    else if (['switch', 'router', 'firewall', 'storage'].includes(it.kind)) { if (editors.device) editors.device(it); }
  }

  // Primera ranura (posU, 1-based) que aloja `u` unidades contiguas libres,
  // buscando desde arriba (la U más alta hacia abajo). null si no entra.
  function firstFit(u, occ) {
    occ = occ || occupancy();
    for (let start = state.heightU - u; start >= 0; start--) {
      let free = true;
      for (let k = 0; k < u; k++) if (occ[start + k]) { free = false; break; }
      if (free) return start + 1;
    }
    return null;
  }

  // ¿Entran `u` unidades contiguas libres empezando en posU (creciendo hacia
  // arriba)? Respeta la altura del rack y las ranuras ya ocupadas.
  function fitsAt(posU, u, occ) {
    occ = occ || occupancy();
    if (posU < 1 || posU + u - 1 > state.heightU) return false;
    for (let k = 0; k < u; k++) if (occ[posU - 1 + k]) return false;
    return true;
  }

  // Resuelve la posU para insertar un item de alto `u`.
  //  1. Ranura elegida explícitamente (click en un hueco): manda; si no cabe, avisa.
  //  2. Por defecto continúa JUSTO por debajo del último item (el seleccionado,
  //     que es también el último insertado; si no hay, el más bajo de la pila),
  //     aunque queden huecos libres más arriba — no los rellena. Análogo a la
  //     numeración de racks (máx+1, retrocede al eliminar desde el fondo).
  //  3. Si abajo no entra, cae a la primera ranura libre (rellena huecos).
  function resolvePos(u) {
    if (state.targetU != null) {
      // La U clickeada es el TOPE del equipo: se llena hacia abajo (U menores).
      const posU = state.targetU - u + 1;
      if (posU >= 1 && fitsAt(posU, u)) return posU;
      flash(t('No cabe un equipo de {u}U hacia abajo desde U{tu}.', { u, tu: state.targetU }));
      return null;
    }
    const occ = occupancy();
    const rail = state.items.filter(i => i.mount === 'rail');
    if (rail.length === 0) {                       // rack vacío → arriba del todo
      const pos = firstFit(u, occ);
      if (pos == null) flash(t('No hay {u}U libres contiguas en el rack.', { u }));
      return pos;
    }
    const bottomOf = list => list.reduce((lo, i) => i.posU < lo.posU ? i : lo, list[0]);
    const anchor = rail.find(i => i.uid === state.selected) || bottomOf(rail);
    let cand = anchor.posU - u;                     // justo debajo del ancla
    if (cand >= 1 && fitsAt(cand, u, occ)) return cand;
    cand = bottomOf(rail).posU - u;                 // si no, debajo del fondo de la pila
    if (cand >= 1 && fitsAt(cand, u, occ)) return cand;
    const pos = firstFit(u, occ);                   // último recurso: rellenar huecos
    if (pos == null) flash(t('No hay {u}U libres contiguas en el rack.', { u }));
    return pos;
  }

  function usedU() {
    return state.items.reduce((s, it) => s + (it.mount === 'rail' ? it.u : 0), 0);
  }

  // ── Overhead eléctrico ("consumo fantasma") ─────────────────────────
  // La suma de TDP/consumos de un servidor es potencia DC de los componentes;
  // el medidor del rack (y la factura) ven la potencia AC de la toma, mayor por
  // la pérdida de la fuente (PSU). Además la gestión siempre-encendida
  // (BMC/iDRAC) suma un consumo fijo. Constantes generales, no editables
  // (ver docs/costo-estimado.md). Switch/router/firewall NO llevan overhead:
  // su consumo es dato de datasheet ya medido en AC.
  const PSU_EFFICIENCY = 0.90;   // 80 PLUS Gold → potencia_pared = potencia_dc / η
  const SERVER_STANDBY_W = 15;   // gestión siempre-encendida por servidor (BMC/iDRAC)

  // Potencia estimada en la toma (AC) de un equipo: "lo que factura el PDU".
  function billedPower(it) {
    const w = it.power_w || 0;
    if (it.kind === 'server') return (w + SERVER_STANDBY_W) / PSU_EFFICIENCY;
    return w;
  }

  // Consumo estimado en pared (W) de un rack (por defecto el activo).
  function powerTotal(rack) {
    return (rack || state).items.reduce((s, it) => s + billedPower(it), 0);
  }

  // ── Planificación de capacidad (variables generales, no editables) ───
  const SAFETY_MARGIN = 0.20;    // margen de seguridad sobre el consumo estimado
  const RACK_ROUND_W  = 1000;    // el "Plan" se redondea ↑ a múltiplos de esto
  const RACK_MAX_W    = 5000;    // tope de consumo planificado por rack (debe ser ≤)

  // Consumo estimado + margen de seguridad (antes de redondear).
  function marginedPower(rack) {
    return powerTotal(rack) * (1 + SAFETY_MARGIN);
  }

  // "Plan" del rack: consumo con margen redondeado hacia arriba al próximo
  // múltiplo de RACK_ROUND_W. Es la potencia a contratar/tope.
  function plannedPower(rack) {
    return Math.ceil(marginedPower(rack) / RACK_ROUND_W) * RACK_ROUND_W;
  }

  // Devuelve true (y muestra el error) si sumar `extraBilledW` al rack activo
  // haría que el Plan supere el tope por rack. Los que insertan deben abortar.
  function exceedsCap(extraBilledW) {
    const projected = Math.ceil((powerTotal() + extraBilledW) * (1 + SAFETY_MARGIN) / RACK_ROUND_W) * RACK_ROUND_W;
    if (projected > RACK_MAX_W) {
      flash(t('Supera el tope de {kw} kW por rack (el Plan quedaría en {plan}).', { kw: (RACK_MAX_W / 1000).toFixed(1), plan: fmtW(projected) }));
      return true;
    }
    return false;
  }

  // Resumen corto de la config de un servidor (para tooltip de la lista).
  function serverSummary(cfg) {
    if (!cfg) return '';
    const parts = [];
    (cfg.cpus || []).forEach(c => parts.push(`${c.n}× ${c.model}`));
    (cfg.gpus || []).forEach(g => parts.push(`${g.n}× ${g.model}`));
    (cfg.dpus || []).forEach(d => parts.push(`${d.n}× ${d.model}`));
    if (cfg.disks_w) parts.push(`discos ${cfg.disks_w}W`);
    if (cfg.ram_w) parts.push(`RAM ${cfg.ram_w}W`);
    return parts.join('  ·  ');
  }

  // Resumen del item para el tooltip de la lista (servidor → CPUs/GPUs;
  // switch/router → modelo).
  function itemSummary(it) {
    const c = it.config;
    if (!c) return '';
    if (c.cpus || c.gpus) return serverSummary(c);
    return c.model || '';
  }

  // Tooltip de un equipo: nombre, U que ocupa y watts (+ resumen de config si
  // lo hay). Se usa en la capa de hit-areas del plot y en la lista de contenido.
  function itemTooltip(it) {
    const pos = it.mount === 'side'
      ? `lateral ${it.side === 'left' ? 'izq' : 'der'}`
      : (it.u === 1 ? `U${it.posU}` : `U${it.posU}–${it.posU + it.u - 1}`);
    const u = it.mount === 'side' ? '0U' : `${it.u}U`;
    const parts = [t(it.name), `${u} · ${pos}`, fmtW(billedPower(it))];
    const sum = itemSummary(it);
    if (sum && sum !== it.name) parts.push(sum);   // no repetir el nombre (switch/router)
    return parts.join('\n');
  }

  // Alterna las clases de realce en la capa de hit-areas (items) y ranuras
  // libres (slots) según state.selected / state.targetU. Sin redibujar Plotly.
  function refreshOverlaySelection() {
    const ov = $('#rack-overlay');
    if (!ov) return;
    ov.querySelectorAll('.rack-hit').forEach(el =>
      el.classList.toggle('selected', parseInt(el.dataset.uid, 10) === state.selected));
    ov.querySelectorAll('.rack-slot').forEach(el =>
      el.classList.toggle('target', parseInt(el.dataset.u, 10) === state.targetU));
  }

  // Selecciona un item (descarta la ranura objetivo). Rápido: sólo CSS + lista.
  function setSelected(uid) {
    state.selected = state.selected === uid ? null : uid;
    state.targetU = null;
    refreshOverlaySelection();
    renderPlacedList();
  }

  // Elige/quita una ranura libre como destino de la próxima inserción (descarta
  // el item seleccionado). Rápido: sólo CSS + lista.
  function setTargetU(u) {
    state.targetU = state.targetU === u ? null : u;
    state.selected = null;
    refreshOverlaySelection();
    renderPlacedList();
  }

  // ── Mutaciones ───────────────────────────────────────────────────────
  function addFromCatalog(catId) {
    const c = catById(catId);
    if (!c) return;

    if (c.mount === 'side') {
      if (state.widthMM !== 800) {
        flash(t('El PDU vertical (0U) requiere armario de 800 mm.'));
        return;
      }
      const sidesUsed = state.items.filter(i => i.mount === 'side').map(i => i.side);
      const side = !sidesUsed.includes('left') ? 'left'
                 : !sidesUsed.includes('right') ? 'right' : null;
      if (!side) { flash(t('Ambos canales laterales ya tienen un PDU vertical.')); return; }
      const sideItem = { uid: uidSeq++, catId, name: c.name, u: 0, color: c.color, mount: 'side', kind: c.kind, side, power_w: c.power_w || 0 };
      if (exceedsCap(billedPower(sideItem))) return;
      state.items.push(sideItem);
      render();
      return;
    }

    const posU = resolvePos(c.u);
    if (posU == null) return;
    const it = { uid: uidSeq++, catId, name: c.name, u: c.u, color: c.color, mount: 'rail', kind: c.kind, posU, power_w: c.power_w || 0 };
    if (exceedsCap(billedPower(it))) return;
    state.items.push(it);
    state.selected = it.uid;
    state.targetU = null;   // ranura objetivo consumida
    render();
  }

  // Clona un equipo existente (con su config) en la siguiente ranura libre.
  function cloneItem(uid) {
    const src = state.items.find(i => i.uid === uid);
    if (!src) return;
    const copy = JSON.parse(JSON.stringify(src));
    copy.uid = uidSeq++;
    if (src.mount === 'side') {
      const used = state.items.filter(i => i.mount === 'side').map(i => i.side);
      const side = !used.includes('left') ? 'left' : !used.includes('right') ? 'right' : null;
      if (!side) { flash(t('Ambos canales laterales ya están ocupados.')); return; }
      copy.side = side;
    } else {
      const posU = firstFit(copy.u);
      if (posU == null) { flash(t('No hay {u}U libres para clonar "{name}".', { u: copy.u, name: t(src.name) })); return; }
      copy.posU = posU;
    }
    if (exceedsCap(billedPower(copy))) return;
    state.items.push(copy);
    state.selected = copy.uid;
    render();
  }

  function removeItem(uid) {
    state.items = state.items.filter(i => i.uid !== uid);
    if (state.selected === uid) state.selected = null;
    render();
  }

  // Mueve un item de riel hacia arriba (+1) o abajo (-1) a la siguiente
  // posición libre en esa dirección. No "salta" sobre equipos: busca el
  // primer hueco contiguo del tamaño correcto.
  function nudge(uid, dir) {
    const it = state.items.find(i => i.uid === uid);
    if (!it || it.mount !== 'rail') return;
    const occWithout = (() => {
      const occ = new Array(state.heightU).fill(false);
      for (const o of state.items) {
        if (o.mount !== 'rail' || o.uid === uid) continue;
        for (let i = 0; i < o.u; i++) occ[o.posU - 1 + i] = true;
      }
      return occ;
    })();
    let p = it.posU + dir;
    while (p >= 1 && p + it.u - 1 <= state.heightU) {
      let free = true;
      for (let k = 0; k < it.u; k++) if (occWithout[p - 1 + k]) { free = false; break; }
      if (free) { it.posU = p; render(); return; }
      p += dir;
    }
  }

  function clearRack() {
    if (state.items.length === 0) return;
    state.items = [];
    state.selected = null;
    render();
  }

  // ── Racks (colección) ────────────────────────────────────────────────
  // El rack nuevo se inserta JUSTO DESPUÉS del activo (no al final): así entra
  // como el vecino de la derecha y la fila se desliza un puesto — con todos los
  // vecinos presentes, sin que "desaparezcan/reaparezcan".
  function addRack(opts) {
    opts = opts || {};
    const r = makeRack(opts.name);
    if (opts.widthMM) r.widthMM = opts.widthMM;
    if (opts.heightU) r.heightU = opts.heightU;
    racks.splice(activeRackIndex() + 1, 0, r);
    state = r;
    slideRowIntoPlace(-1);   // el nuevo entra desde la derecha → la fila va a la izq.
  }
  // Clona el rack activo en uno nuevo (junto al actual): copia ancho/alto y todos
  // los equipos (con su config), con uids frescos. El clon pasa a ser el activo.
  function cloneRack() {
    const r = makeRack();
    r.widthMM = state.widthMM;
    r.heightU = state.heightU;
    r.items = state.items.map(it => {
      const copy = JSON.parse(JSON.stringify(it));
      copy.uid = uidSeq++;
      return copy;
    });
    r.selected = null;
    racks.splice(activeRackIndex() + 1, 0, r);
    state = r;
    slideRowIntoPlace(-1);
  }
  function switchRack(i) {
    if (racks[i] && racks[i] !== state) { state = racks[i]; render(); }
  }

  // Anima la FILA completa (ya con la membresía final y `state` en el nuevo
  // activo) deslizándola un puesto hasta centrar. startP = puesto de arranque:
  // −1 = la fila arranca corrida a la derecha y se centra (el activo entró desde
  // la derecha); +1 = al revés. Usada por add/clonar/quitar para que los vecinos
  // se muevan CON la animación en vez de redibujarse al final.
  let carouselAnimating = false;
  function slideRowIntoPlace(startP) {
    if (racks.length < 2 || carouselAnimating || !cfWrap() ||
        document.body.classList.contains('zoom-on')) { render(); return; }
    cfBuild((ok) => {
      if (!ok) { render(); carouselAnimating = false; return; }
      cfApply(startP);                 // arrancar desplazada un puesto
      cfAnimateTo(0, () => render());  // deslizar hasta centrar (state ya es el nuevo)
    });
  }

  // Flechas / costados del carrusel. FINITO: en el extremo (sin vecino en esa
  // dirección) hace un rebote ("topetar"). Anima la tira deslizándola un puesto.
  function goToRack(dir) {
    const n = racks.length;
    if (n < 2) return;
    const target = racks[activeRackIndex() + dir];
    if (!target) { if (!cfTrack) bounceRack(dir); return; }
    if (document.body.classList.contains('zoom-on')) { state = target; render(); return; }
    const toP = dir > 0 ? 1 : -1;    // +1 = el vecino derecho va al centro
    // Si YA hay una tira animando, no esperamos: re-apuntamos al instante
    // (reusa la tira; el vecino en esta dirección va al centro).
    if (cfTrack) {
      cfAnimateTo(toP, () => { state = racks[activeRackIndex() + dir]; return render(); });
      return;
    }
    cfBuild((ok) => {
      if (!ok) { state = target; render(); carouselAnimating = false; return; }
      cfAnimateTo(toP, () => { state = target; return render(); });
    });
  }

  // Rebote en el extremo: el rack se nudge hacia el lado y vuelve (topetar).
  let bounceTimer = 0;
  function bounceRack(dir) {
    document.body.style.setProperty('--bounce-dx', (dir > 0 ? -22 : 22) + 'px');
    document.body.classList.remove('rack-bouncing');
    void document.body.offsetWidth;                 // reflow para reiniciar la animación
    document.body.classList.add('rack-bouncing');
    clearTimeout(bounceTimer);
    bounceTimer = setTimeout(() => document.body.classList.remove('rack-bouncing'), 380);
  }

  // ── Animación coverflow ──────────────────────────────────────────────
  // Genera (secuencialmente, sin pisarse en el div offscreen) las miniaturas de
  // varios racks y llama done(Map rack→url).
  function ensureThumbs(racksArr, done) {
    const urls = new Map();
    let k = 0;
    const step = () => {
      if (k >= racksArr.length) { done(urls); return; }
      const r = racksArr[k++];
      rackThumb(r, (url) => { urls.set(r, url); step(); });
    };
    step();
  }
  function makeSlide(url, cls) {
    const el = document.createElement('div');
    el.className = 'cf-slide ' + cls;
    el.innerHTML = `<img src="${url}" alt="">`;
    return el;
  }
  // ── Carrusel = FILA de racks pegados (varios por lado, en perspectiva) ────
  // El central va a escala 1; los vecinos se pegan a su borde (se tocan), reculan
  // un pelín y se oscurecen con la distancia → sensación de recorrer una hilera.
  // cfChain(i, …, p) encadena la fila entera dando posición/escala/brillo de cada
  // rack según su "coordenada" (0 = centro, ±1 = 1er vecino…); sirve para reposo
  // (p=0) y para el arrastre/animación (p fraccionario) → mismo cálculo en ambos.
  // Clave: cada rack se pega con SU media anchura real (cabFrac), no una común, así
  // la fila calza aunque se mezclen anchos de 60 y 80 cm.
  const CF_SIDE = 0.9;        // escala del 1er vecino (un pelín menor que el centro)
  const CF_RECEDE = 0.05;     // cada puesto más lejos, un poco más chico
  const CF_DIM1 = 0.56;       // brillo del 1er vecino (0..1)
  const CF_DIMFALL = 0.1;     // se oscurece con la distancia
  const CF_MAXD = 6;          // tope de vecinos por lado
  let cfCalib = 1;            // px medidos del plot vivo / analítico del activo (calibra cabFrac)
  let cfLayer = null, cfTrack = null, cfOffset = 0, cfRaf = 0, cfStepPx = 1;

  function cfWrap() { const d = $('#rack-plot'); return d && d.parentElement; }
  function cfScaleAt(d) { d = Math.abs(d); return d < 1 ? 1 : Math.max(0.6, CF_SIDE - CF_RECEDE * (d - 1)); }
  function cfDimAt(d)   { d = Math.abs(d); return d < 1 ? 1 : Math.max(0.22, CF_DIM1 - CF_DIMFALL * (d - 1)); }
  // Escala/brillo SUAVES: interpolación lineal entre las muestras enteras (lo que
  // antes hacía cfPlace) → sin salto al cruzar |dist|=1.
  function scaleSmooth(a) { a = Math.abs(a); const k = Math.floor(a), f = a - k; return cfScaleAt(k) + (cfScaleAt(k + 1) - cfScaleAt(k)) * f; }
  function dimSmooth(a)   { a = Math.abs(a); const k = Math.floor(a), f = a - k; return cfDimAt(k)   + (cfDimAt(k + 1)   - cfDimAt(k))   * f; }

  // Fracción del ancho del wrap que ocupa el GABINETE de un rack, según SU ancho
  // (600/800 mm) y la geometría del wrap. Con escala cuadrada (scaleratio:1) el
  // dibujo va al mismo px/mm en x e y, así que un rack de 60 sale más ANGOSTO que
  // uno de 80 → es lo que permite pegar la fila aunque se MEZCLEN anchos. Con todos
  // iguales, todos devuelven lo mismo (comportamiento previo intacto). El factor
  // cfCalib (medido del plot vivo) corrige márgenes para que el central calce exacto.
  function cabFracRaw(rack) {
    const wrap = cfWrap();
    const wrapW = (wrap && wrap.clientWidth) || 1;
    const wrapH = (wrap && wrap.clientHeight) || 1;
    const W = rack.widthMM, H = (rack.heightU || 42) * U_MM;
    const xspan = W + 2 * SIDE_GUTTER;
    const yspan = H + PLINTH + TOP_CAP + 48;                 // = rango y de la miniatura/plot
    const s = Math.min((wrapW - 16) / xspan, (wrapH - 16) / yspan);   // px/mm (márgenes l/r/t/b = 8)
    return (s * W) / wrapW;
  }
  function cabFrac(rack) { return Math.min(0.95, cfCalib * cabFracRaw(rack)); }

  // Posiciones (x, escala, brillo, z) de una tira CONTIGUA de racks [dMin..dMax]
  // (offsets respecto al activo i), desplazada `p` puestos. Cada rack se pega al
  // anterior con SU media anchura escalada → fila pegada exacta con anchos mezclados.
  // La coordenada `p` se mapea a x=0 (centro del viewport).
  function cfChain(i, wrapW, dMin, dMax, p) {
    const halfAt = (d) => {
      const rk = racks[i + d] || racks[i];
      return scaleSmooth(d - p) * cabFrac(rk) * wrapW / 2;
    };
    const xs = {}; xs[dMin] = 0;
    for (let d = dMin + 1; d <= dMax; d++) xs[d] = xs[d - 1] + halfAt(d - 1) + halfAt(d);
    const lo = Math.floor(p), hi = lo + 1, f = p - lo;
    let cx;
    if (xs[lo] != null && xs[hi] != null) cx = xs[lo] + (xs[hi] - xs[lo]) * f;
    else if (xs[lo] != null) cx = xs[lo];
    else if (xs[hi] != null) cx = xs[hi];
    else cx = 0;
    const out = {};
    for (let d = dMin; d <= dMax; d++) {
      const c = d - p;
      out[d] = {
        x: xs[d] - cx, scale: scaleSmooth(c), dim: dimSmooth(c),
        z: Math.abs(c) < 0.5 ? 6 : Math.max(0, 5 - Math.round(Math.abs(c))),
      };
    }
    return out;
  }
  // Mide el ancho REAL del gabinete del plot vivo → calibra cabFrac (para que el
  // central y las miniaturas de reposo calcen exactos) y fija cfStepPx (px por
  // puesto, para convertir el arrastre en dedo).
  function measureRackFrac() {
    const gd = $('#rack-plot'), wrap = cfWrap();
    if (!gd || !gd._fullLayout || !wrap) return;
    const xa = gd._fullLayout.xaxis;
    if (!xa || !xa.l2p) return;
    const px = Math.abs(xa.l2p(state.widthMM) - xa.l2p(0));
    const w = wrap.clientWidth || 1;
    if (px > 4 && w > 4) {
      const raw = cabFracRaw(state);
      cfCalib = raw > 0 ? (px / w) / raw : 1;
      const pos = cfChain(activeRackIndex(), w, 0, 1, 0);
      cfStepPx = Math.abs(pos[1] ? pos[1].x : 0) || cfStepPx;
    }
  }
  // Cuántos vecinos por lado hacen falta para llenar la pantalla.
  function cfVisibleReach(wrapW) {
    const i = activeRackIndex();
    const pos = cfChain(i, wrapW, 0, CF_MAXD, 0);
    for (let d = 1; d <= CF_MAXD; d++) {
      const rk = racks[i + d] || racks[i];
      const innerEdge = pos[d].x - pos[d].scale * cabFrac(rk) * wrapW / 2;
      if (innerEdge > wrapW / 2) return d;     // este puesto ya sale entero de pantalla
    }
    return CF_MAXD;
  }

  // Coloca cada slide de la tira según el progreso p (0 = reposo; +1 = el vecino
  // derecho quedó centrado; −1 = el izquierdo).
  function cfApply(p) {
    cfOffset = p;
    if (!cfTrack) return;
    const wrapW = (cfWrap() || {}).clientWidth || 1;
    const i = activeRackIndex();
    let dMin = Infinity, dMax = -Infinity;
    for (const el of cfTrack.children) { if (el._d < dMin) dMin = el._d; if (el._d > dMax) dMax = el._d; }
    if (!isFinite(dMin)) return;
    const pos = cfChain(i, wrapW, dMin, dMax, p);
    for (const el of cfTrack.children) {
      const q = pos[el._d];
      el.style.transform = `translateX(${q.x}px) scale(${q.scale})`;
      el.style.opacity = q.dim;   // difuminado por opacidad (composita en GPU; barato)
      el.style.zIndex = String(q.z);
    }
  }
  function cfBuild(done) {
    const wrap = cfWrap();
    if (!wrap) { done(false); return; }
    carouselAnimating = true;
    const i = activeRackIndex();
    const wrapW = wrap.clientWidth;
    const step = cfChain(i, wrapW, 0, 1, 0);
    cfStepPx = Math.abs(step[1] ? step[1].x : 0) || cfStepPx;
    const reach = cfVisibleReach(wrapW) + 1;   // +1: el que entra al animar un puesto
    const list = [];
    for (let d = -reach; d <= reach; d++) { const r = racks[i + d]; if (r) list.push({ rack: r, d }); }
    ensureThumbs(list.map(o => o.rack), (urls) => {
      document.body.classList.add('carousel-animating');
      cfLayer = document.createElement('div'); cfLayer.className = 'carousel-anim';
      cfTrack = document.createElement('div'); cfTrack.className = 'cf-track';
      // más lejos primero → el central queda arriba en el apilado
      list.sort((a, b) => Math.abs(b.d) - Math.abs(a.d)).forEach(({ rack, d }) => {
        const el = makeSlide(urls.get(rack), 'cf-flat');
        el._d = d; cfTrack.appendChild(el);
      });
      cfLayer.appendChild(cfTrack); wrap.appendChild(cfLayer);
      cfApply(0);
      done(true);
    });
  }
  function cfMove(px) { if (cfRaf) { cancelAnimationFrame(cfRaf); cfRaf = 0; } cfApply(px); }
  function cfStop() { if (cfRaf) { cancelAnimationFrame(cfRaf); cfRaf = 0; } }
  // Anima el desplazamiento hasta `target` (rápido) y al terminar aplica el
  // estado y revela el plot vivo con un crossfade corto (ya calza en tamaño).
  // INTERRUMPIBLE: se puede re-llamar en cualquier momento (cancela la anterior).
  function cfAnimateTo(target, applyState) {
    cfStop();
    if (!cfTrack) { Promise.resolve(applyState && applyState()).then(() => { carouselAnimating = false; }); return; }
    const start = cfOffset, dur = 190, t0 = performance.now();
    const ease = (u) => 1 - Math.pow(1 - u, 3);   // easeOutCubic
    const settle = () => {
      cfRaf = 0;
      // Dejar pintar el ÚLTIMO frame del deslizamiento antes del render pesado del
      // nuevo central (Plotly.react bloquea ~40ms en desktop): así el "aterrizaje"
      // no se traba pegado al movimiento (la tira ya muestra el destino correcto).
      requestAnimationFrame(() => {
        Promise.resolve(applyState ? applyState() : render()).then(() => {
          requestAnimationFrame(() => {
            if (cfRaf) return;                          // otra transición tomó el control
            // CORTE LIMPIO (no fundido): el estado final de la tira y los minis de
            // reposo son idénticos, así que revelar reposo + quitar la capa en el
            // MISMO frame es un swap invisible. Un fundido, en cambio, superponía
            // mini + slide saliente y sumaba brillo en los vecinos (parpadeo).
            document.body.classList.remove('carousel-animating');
            const l = cfLayer;
            if (l) l.remove();
            if (cfLayer === l) { cfLayer = null; cfTrack = null; }
            carouselAnimating = false;
          });
        });
      });
    };
    const frame = (now) => {
      const u = Math.min(1, (now - t0) / dur);
      cfApply(start + (target - start) * ease(u));
      if (u < 1) cfRaf = requestAnimationFrame(frame); else settle();
    };
    cfRaf = requestAnimationFrame(frame);
  }

  // Borra el rack en el índice i (cualquiera, no solo el activo). Si se borra el
  // activo, el foco pasa al SUPERIOR (i+1, el siguiente número); si era el último,
  // al anterior. Siempre debe quedar al menos un rack.
  function removeRackAt(i) {
    if (racks.length <= 1) { flash(t('Tiene que quedar al menos un rack.')); return; }
    if (i < 0 || i >= racks.length) return;
    const wasActive = racks[i] === state;
    if (!wasActive) { racks.splice(i, 1); render(); return; }
    const hasNext = i + 1 < racks.length;
    const newActive = hasNext ? racks[i + 1] : racks[i - 1];
    racks.splice(i, 1);                 // quitar YA: la fila se arma con la membresía final
    state = newActive;
    // Si el borrado estaba a la izquierda del nuevo activo (había "next"), éste
    // entra desde la derecha → la fila arranca corrida a la derecha (startP −1);
    // si el borrado era el último, el nuevo activo entra desde la izquierda (+1).
    slideRowIntoPlace(hasNext ? -1 : 1);
  }
  function renameRack(i) {
    const r = racks[i];
    if (!r) return;
    const n = prompt(t('Nombre del rack:'), r.name);
    if (n && n.trim()) { r.name = n.trim(); render(); }
  }

  // ── Dock inferior: rótulo + menús (racks / ajustes) ──────────────────
  // Todos los controles viven en el dock. renderDock() sincroniza el rótulo
  // del rack activo y refresca cualquier menú abierto para reflejar el estado.
  function activeRackIndex() { return racks.indexOf(state); }

  // Carrusel: nombre del rack activo en el header + flechas ‹ › según haya
  // vecinos, y los mini-racks (difuminados, detrás) del anterior/siguiente.
  function renderCarousel() {
    const i = activeRackIndex();
    const nameEl = $('#rack-name');
    if (nameEl) {
      nameEl.textContent = state.name;
      nameEl.title = t('{name} — {i} / {n} (doble clic para renombrar)', { name: state.name, i: i + 1, n: racks.length });
    }
    // Carrusel FINITO: los vecinos se ven sólo si existen; en los extremos no hay
    // asomo de ese lado (indica el fin) y al intentar seguir se "topeta" (rebote).
    const n = racks.length;
    const prevRack = racks[i - 1];
    const nextRack = racks[i + 1];
    // Botones de navegación: uno por dirección, sólo si hay rack de ese lado.
    const prevBtn = $('#rack-prev'), nextBtn = $('#rack-next');
    if (prevBtn) prevBtn.disabled = !prevRack;
    if (nextBtn) nextBtn.disabled = !nextRack;
    const hzP = $('#cf-prev'), hzN = $('#cf-next');
    if (hzP) hzP.hidden = !prevRack;
    if (hzN) hzN.hidden = !nextRack;
    layoutRestMinis();   // fila de vecinos (varios por lado) detrás del plot vivo
    // Pre-generar la miniatura del rack ACTIVO para que el swipe/flechas arranquen
    // al instante — pero DEBOUNCED: al editar rápido (muchos servidores) NO se
    // encola una toImage pesada por cada cambio; sólo una al quedarse quieto.
    if (n > 1) schedulePregen();
    if (!$('#pop-settings').hidden) buildSettingsPop();
  }

  // Contenedor de la fila de reposo (miniaturas detrás del rack vivo).
  function ensureMinisContainer() {
    const wrap = cfWrap(); if (!wrap) return null;
    let c = wrap.querySelector('#rack-minis');
    if (!c) { c = document.createElement('div'); c.id = 'rack-minis'; wrap.insertBefore(c, wrap.firstChild); }
    return c;
  }
  // Dibuja la FILA de reposo: un mini por cada vecino visible a cada lado, pegado
  // al central (el plot vivo) con escala/brillo por distancia. Reusa nodos por
  // (rack + puesto) para no recrear imágenes en cada render.
  function layoutRestMinis() {
    const cont = ensureMinisContainer(); if (!cont) return;
    const wrap = cfWrap(); const wrapW = wrap.clientWidth || 1;
    const i = activeRackIndex();
    const reach = racks.length > 1 ? cfVisibleReach(wrapW) : 0;
    // Mismo encadenado que la animación (p=0): la fila de reposo queda pegada al
    // central con la media anchura REAL de cada rack (60/80 mezclados incluidos).
    const pos = cfChain(i, wrapW, -reach, reach, 0);
    const want = new Map();   // key → {rack, d}
    for (let d = 1; d <= reach; d++) {
      if (racks[i + d]) want.set('r' + d, { rack: racks[i + d], d });
      if (racks[i - d]) want.set('l' + d, { rack: racks[i - d], d: -d });
    }
    [...cont.children].forEach(el => { if (!want.has(el.dataset.key)) el.remove(); });
    want.forEach((o, key) => {
      let el = cont.querySelector('.rack-mini[data-key="' + key + '"]');
      if (!el) { el = document.createElement('div'); el.className = 'rack-mini'; el.dataset.key = key; cont.appendChild(el); }
      const q = pos[o.d];
      el.style.transform = `translateX(${q.x}px) scale(${q.scale})`;
      el.style.opacity = q.dim;   // mismo difuminado que la animación (por opacidad)
      el.style.zIndex = String(q.z);
      paintMini(el, o.rack);
    });
  }
  // Pinta la miniatura (imagen del render real) en un nodo de la fila de reposo.
  function paintMini(el, rack) {
    const key = rack.id + '#' + rackSig(rack);
    if (el._shown === key) return;
    rackThumb(rack, (url) => { el.innerHTML = `<img class="rack-mini-img" src="${url}" alt="">`; el._shown = key; });
  }
  let pregenTimer = 0;
  function schedulePregen() {
    clearTimeout(pregenTimer);
    const rack = state;
    pregenTimer = setTimeout(() => {
      if (racks.length <= 1 || rack !== state) return;
      if (carouselAnimating) { schedulePregen(); return; }   // no generar mientras se mueve
      rackThumb(rack, () => {});                       // miniatura del activo
      // Además, los vecinos del BORDE (los que entran al animar un puesto): así
      // las flechas/swipe arrancan sin generar nada (evita el pico de inicio en
      // desktop, donde generar una miniatura grande cuesta). Serializado y
      // cacheado, así que sólo se paga una vez por rack.
      const i = activeRackIndex();
      const edge = cfVisibleReach((cfWrap() || {}).clientWidth || 1) + 1;
      [racks[i + edge], racks[i - edge]].forEach(r => { if (r) rackThumb(r, () => {}); });
    }, 350);
  }

  // ── Miniatura de un rack: imagen del RENDER REAL (difuminada en el carrusel) ──
  // Se dibuja el rack (mismos shapes/sprites que el activo) en un plot fuera de
  // pantalla y se exporta a PNG con Plotly.toImage. Se cachea por contenido
  // (firma) en el propio rack para no regenerar en cada render.
  let thumbDiv = null;
  function ensureThumbDiv() {
    if (thumbDiv) return thumbDiv;
    thumbDiv = document.createElement('div');
    thumbDiv.style.cssText = 'position:absolute;left:-99999px;top:0;pointer-events:none;';
    document.body.appendChild(thumbDiv);
    return thumbDiv;
  }
  // Dimensiones del área del rack (para que la miniatura calce EXACTO con el
  // plot vivo → sin salto de tamaño al empalmar). Entran en la firma de caché.
  function thumbDims() {
    // Tamaño EXACTO del wrap (sin capar): así la miniatura usa la misma escala de
    // píxeles que el plot vivo — la fuente fija (11px) de los números coincide y
    // no salen agrandados. En iPhone el wrap es chico, así que no hay problema de
    // memoria de canvas. (Se genera a escala 2, ver rackThumb.)
    const wrap = cfWrap();
    const w = wrap ? Math.max(1, Math.round(wrap.clientWidth)) : 420;
    const h = wrap ? Math.max(1, Math.round(wrap.clientHeight)) : 680;
    return { w, h };
  }
  function rackSig(rack) {
    const d = thumbDims();
    return d.w + 'x' + d.h + '|' + rack.widthMM + '|' + (realista ? 'R' : 'C') + '|' + rack.items
      .map(it => it.kind + ':' + (it.posU || 0) + ':' + it.u + ':' + (it.side || '') + ':' + it.color).join(',');
  }
  // Renderiza `rack` a PNG (al TAMAÑO del wrap, mismo layout que el plot vivo) y
  // llama done(url). Cachea en rack._thumbURL (por contenido + tamaño). Las
  // generaciones se SERIALIZAN (una toImage a la vez) para no pisarse en el div
  // offscreen — clave cuando se editan/navegan muchos racks rápido.
  // Los vecinos van chicos y difuminados → no necesitan 2×; 1.5× rinde nítido y
  // pesa bastante menos (miniaturas ~1.8× más livianas → generación y composición
  // más rápidas, clave en desktop donde el wrap es ancho).
  const THUMB_SCALE = 1.5;
  // Caché GLOBAL por firma: racks con el mismo contenido+tamaño comparten la
  // misma miniatura → con N racks vacíos (o iguales) se genera UNA sola, no N.
  // Elimina la mayor parte del trabajo de toImage en el caso "muchos racks".
  const thumbCache = new Map();
  let thumbChain = Promise.resolve();
  function rackThumb(rack, done) {
    const sig0 = rackSig(rack);
    if (rack._thumbSig === sig0 && rack._thumbURL) { done(rack._thumbURL, sig0); return; }
    const hit0 = thumbCache.get(sig0);
    if (hit0) { rack._thumbSig = sig0; rack._thumbURL = hit0; done(hit0, sig0); return; }
    thumbChain = thumbChain.then(() => new Promise((resolve) => {
      const sig = rackSig(rack);
      if (rack._thumbSig === sig && rack._thumbURL) { done(rack._thumbURL, sig); resolve(); return; }
      const hit = thumbCache.get(sig);
      if (hit) { rack._thumbSig = sig; rack._thumbURL = hit; done(hit, sig); resolve(); return; }
      const div = ensureThumbDiv();
      const { w: tw, h: th } = thumbDims();
      // Wrap colapsado (tamaño transitorio durante navegación rápida): NO generar
      // ni cachear (saldría deformada). Se reintenta en el próximo render válido.
      if (tw < 120 || th < 120) { resolve(); return; }
      const saved = state;
      state = rack;                     // los builders leen `state`
      const W = state.widthMM, H = totalH();
      const eq = buildEquipment();
      const yRange = [-PLINTH - 24, H + TOP_CAP + 24];
      const xRange = [-SIDE_GUTTER, W + SIDE_GUTTER];
      const layout = {
        autosize: false, width: tw, height: th, margin: { l: 8, r: 8, t: 8, b: 8 },
        paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', dragmode: false, showlegend: false,
        shapes: [...buildShapes(), ...eq.shapes],
        images: realista ? [...buildCabinetImages(), ...eq.images] : eq.images,
        annotations: [...buildAnnotations(), ...eq.annotations],
        xaxis: { visible: false, range: xRange, fixedrange: true, zeroline: false, showgrid: false },
        yaxis: { visible: false, range: yRange, fixedrange: true, zeroline: false, showgrid: false, scaleanchor: 'x', scaleratio: 1 },
      };
      state = saved;                    // restaurar antes del render async
      Plotly.react(div, [{ x: [], y: [], type: 'scatter', mode: 'markers', hoverinfo: 'skip' }],
        layout, { displayModeBar: false, responsive: false, staticPlot: true })
        // Esperar un ciclo de pintado antes de serializar: Safari iOS a veces
        // serializa el SVG ANTES de terminar el layout y se pierde el gabinete
        // (bordes) — típico en la PRIMERA miniatura (la del Rack 1). Doble rAF
        // garantiza que el frame ya se pintó.
        .then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
        .then(() => Plotly.toImage(div, { format: 'png', width: tw, height: th, scale: THUMB_SCALE }))
        .then(url => {
          if (thumbCache.size > 60) thumbCache.clear();   // tope simple (firmas viejas al redimensionar)
          thumbCache.set(sig, url);
          rack._thumbSig = sig; rack._thumbURL = url; done(url, sig); resolve();
        })
        .catch(() => resolve());
    }));
  }


  // Cambia el ancho del rack activo (60/80). El de 600 mm deshabilita piezas
  // laterales; reflowConstraints() descarta lo que ya no entra.
  function setWidth(w) {
    if (w === state.widthMM) return;
    state.widthMM = w;
    reflowConstraints();
    render();
  }

  function closeDockPops() {
    const p = $('#pop-settings'); if (p) p.hidden = true;
    const b = $('#dock-settings'); if (b) b.setAttribute('aria-expanded', 'false');
  }

  // Ítem de menú del dock (botón con texto + hint opcional + estilo).
  function popItem(label, onClick, opts) {
    opts = opts || {};
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pop-item' + (opts.cls ? ' ' + opts.cls : '');
    b.setAttribute('role', 'menuitem');
    if (opts.disabled) b.disabled = true;
    b.innerHTML = `<span class="pop-item-label">${label}</span>` +
      (opts.hint ? `<span class="pop-item-hint">${opts.hint}</span>` : '');
    if (onClick) b.addEventListener('click', onClick);
    return b;
  }

  // (El menú "Rack ▾" se retiró: la navegación entre racks es el carrusel +
  //  flechas ‹ › del header; alta/renombrar/quitar viven en ＋Rack y en ⚙.)

  // Menú "⚙": ajustes del rack activo — ancho, alto, renombrar, clonar, vaciar
  // y quitar.
  function buildSettingsPop() {
    const p = $('#pop-settings');
    if (!p) return;
    p.innerHTML = '';
    const title = document.createElement('div');
    title.className = 'pop-title'; title.textContent = t('Ajustes del rack');
    p.appendChild(title);

    // Ancho 60/80 como segmento.
    const wrow = document.createElement('div');
    wrow.className = 'pop-row';
    wrow.innerHTML = `<span class="pop-row-label">${t('Ancho')}</span>`;
    const seg = document.createElement('div');
    seg.className = 'pop-seg';
    [[600, '60'], [800, '80']].forEach(([w, txt]) => {
      const s = document.createElement('button');
      s.type = 'button';
      s.className = 'pop-seg-btn' + (state.widthMM === w ? ' on' : '');
      s.textContent = txt;
      s.addEventListener('click', () => { setWidth(w); });  // no cierra: deja comparar
      seg.appendChild(s);
    });
    wrow.appendChild(seg);
    p.appendChild(wrow);

    // Alto: única opción (42U) → sólo lectura.
    const hrow = document.createElement('div');
    hrow.className = 'pop-row';
    hrow.innerHTML = `<span class="pop-row-label">${t('Alto')}</span><span class="pop-row-val">${state.heightU} U</span>`;
    p.appendChild(hrow);

    const hr = document.createElement('hr'); hr.className = 'pop-sep'; p.appendChild(hr);
    p.appendChild(popItem(t('✎ Renombrar rack'), () => { closeDockPops(); renameRack(activeRackIndex()); }));
    p.appendChild(popItem(t('⧉ Clonar rack'), () => { closeDockPops(); cloneRack(); }, { cls: 'acc' }));
    p.appendChild(popItem(t('Vaciar rack'),
      () => { closeDockPops(); clearRack(); },
      { disabled: state.items.length === 0 }));
    p.appendChild(popItem(t('✕ Quitar rack'),
      () => { closeDockPops(); removeRackAt(activeRackIndex()); },
      { cls: 'danger', disabled: racks.length <= 1 }));
  }

  // Al cambiar ancho/alto, descartar items que ya no son válidos.
  function reflowConstraints() {
    const before = state.items.length;
    state.items = state.items.filter(it => {
      if (it.mount === 'side') return state.widthMM === 800;
      return it.posU + it.u - 1 <= state.heightU;  // entra en la nueva altura
    });
    if (state.items.length !== before) {
      flash(t('Se quitaron {n} equipo(s) que ya no entran.', { n: before - state.items.length }));
    }
    if (state.selected && !state.items.some(i => i.uid === state.selected)) {
      state.selected = null;
    }
    if (state.targetU != null && state.targetU > state.heightU) {
      state.targetU = null;
    }
  }

  // ── Selector "Añadir" (FAB → #add-picker) ────────────────────────────
  // Abrir/cerrar el selector único. Declaradas a nivel de módulo para que
  // renderCatalog() (y las tarjetas) puedan cerrarlo tras añadir.
  function openPicker() {
    const p = $('#add-picker');
    if (!p) return;
    renderCatalog();       // refresca la grilla de infraestructura (side 60/80)
    p.hidden = false;
  }
  function closePicker() {
    const p = $('#add-picker');
    if (p) p.hidden = true;
  }

  // Llena la grilla de "Infraestructura" del selector con una tarjeta por pieza
  // del catálogo. Se rearma en cada render (y al abrir) para reflejar el ancho:
  // las piezas `mount:'side'` (PDU vertical 0U) se deshabilitan en 600 mm.
  function renderCatalog() {
    const root = $('#pick-catalog');
    if (!root) return;
    root.innerHTML = '';
    for (const c of catalog) {
      const sideDisabled = c.mount === 'side' && state.widthMM !== 800;
      const btn = document.createElement('button');
      btn.className = 'pick-card';
      btn.type = 'button';
      btn.disabled = sideDisabled;
      btn.title = t(c.note) + (sideDisabled ? t(' · requiere 800 mm') : '');
      btn.innerHTML = `
        <span class="pick-swatch" style="background:${c.color}"></span>
        <span class="pick-tt"><span class="pick-nm">${t(c.name)}</span><span class="pick-hint">${c.u === 0 ? t('0U · lateral') : c.u + 'U'}</span></span>`;
      btn.addEventListener('click', () => { addFromCatalog(c.id); closePicker(); });
      root.appendChild(btn);
    }
  }

  // ── Render de la lista "Contenido del rack" ──────────────────────────
  function renderPlacedList() {
    const root = $('#placed');
    if (!root) return;   // lista de contenido eliminada (se opera desde el dibujo)
    root.innerHTML = '';
    if (state.items.length === 0) {
      const p = document.createElement('div');
      p.className = 'placed-empty';
      p.textContent = t('Rack vacío. Elige equipos del catálogo.');
      root.appendChild(p);
    } else {
      // Orden visual: de arriba hacia abajo (U alta primero); side al final.
      const sorted = [...state.items].sort((a, b) => {
        if (a.mount !== b.mount) return a.mount === 'side' ? 1 : -1;
        return (b.posU || 0) - (a.posU || 0);
      });
      for (const it of sorted) {
        const row = document.createElement('div');
        row.className = 'placed-item' + (state.selected === it.uid ? ' selected' : '');
        const pos = it.mount === 'side'
          ? `lat. ${it.side === 'left' ? 'izq' : 'der'}`
          : (it.u === 1 ? `U${it.posU}` : `U${it.posU}–${it.posU + it.u - 1}`);
        row.innerHTML = `
          <span class="cat-swatch" style="background:${it.color}"></span>
          <div class="placed-main">
            <span class="placed-name">${t(it.name)}</span>
            ${it.power_w ? `<span class="placed-power">${fmtW(billedPower(it))}</span>` : ''}
          </div>
          <span class="placed-pos">${pos}</span>`;
        row.title = itemTooltip(it);
        const up = iconBtn('▲', t('Subir'));
        const dn = iconBtn('▼', t('Bajar'));
        const cl = iconBtn('⧉', t('Clonar'));
        const rm = iconBtn('✕', t('Quitar'), 'danger');
        if (it.mount === 'side') { up.disabled = true; dn.disabled = true; up.style.visibility = dn.style.visibility = 'hidden'; }
        up.addEventListener('click', e => { e.stopPropagation(); nudge(it.uid, +1); });
        dn.addEventListener('click', e => { e.stopPropagation(); nudge(it.uid, -1); });
        cl.addEventListener('click', e => { e.stopPropagation(); cloneItem(it.uid); });
        rm.addEventListener('click', e => { e.stopPropagation(); removeItem(it.uid); });
        row.append(up, dn, cl, rm);
        row.addEventListener('click', () => setSelected(it.uid));
        root.appendChild(row);
      }
    }
    $('#occupancy').innerHTML = `<b>${usedU()} U</b> ${t('usadas de {h} U', { h: state.heightU })}`;
  }

  function iconBtn(label, title, extra) {
    const b = document.createElement('button');
    b.className = 'icon-btn' + (extra ? ' ' + extra : '');
    b.type = 'button';
    b.title = title;
    b.textContent = label;
    return b;
  }

  // ── Render del rack (Plotly) ─────────────────────────────────────────
  function buildShapes() {
    const W = state.widthMM, H = totalH();
    const x0 = bayX0(), x1 = bayX1();
    const shapes = [];

    const rect = (x0, y0, x1, y1, fill, line, lw) => ({
      type: 'rect', x0, y0, x1, y1,
      fillcolor: fill,
      line: { color: line || 'rgba(0,0,0,0)', width: lw == null ? 1 : lw },
      layer: 'below',
    });
    const line = (x0, y0, x1, y1, color, lw) => ({
      type: 'line', x0, y0, x1, y1,
      line: { color, width: lw || 1 },
      layer: 'below',
    });

    // En modo realista el armario se compone con texturas fotográficas
    // (buildCabinetImages): acá solo dejamos el fondo oscuro de respaldo y el
    // interior oscuro del bay (los equipos-foto se dibujan encima).
    if (realista) {
      shapes.push(rect(0, -PLINTH, W, H + TOP_CAP, '#0a120d', 'rgba(0,0,0,0)', 0));
      shapes.push(rect(x0, 0, x1, H, C.paper, 'rgba(0,0,0,0)', 0));
      return shapes;
    }

    // Armario: marco exterior + apertura interior (papel) + zócalo + remate.
    shapes.push(rect(0, -PLINTH, W, H + TOP_CAP, C.frame, C.frameEdge, 1.6));
    shapes.push(rect(FRAME, 0, W - FRAME, H, C.paper, 'rgba(31,41,55,0.30)', 1));
    shapes.push(rect(0, -PLINTH, W, 0, C.plinth, C.frameEdge, 1));
    shapes.push(rect(0, H, W, H + TOP_CAP, C.frame, C.frameEdge, 1));

    // Canales laterales de gestión (entre marco y rieles). Resaltados cuando
    // hay ancho útil (800 mm) porque ahí montan los PDUs verticales.
    const chHi = state.widthMM === 800;
    shapes.push(rect(FRAME, 0, x0 - RAIL_W, H, chHi ? C.channel : 'rgba(0,0,0,0)',
                     chHi ? C.channelEdge : 'rgba(31,41,55,0.12)', 1));
    shapes.push(rect(x1 + RAIL_W, 0, W - FRAME, H, chHi ? C.channel : 'rgba(0,0,0,0)',
                     chHi ? C.channelEdge : 'rgba(31,41,55,0.12)', 1));

    // Rieles de montaje 19" (dos columnas perforadas).
    shapes.push(rect(x0 - RAIL_W, 0, x0, H, C.rail, C.railEdge, 1));
    shapes.push(rect(x1, 0, x1 + RAIL_W, H, C.rail, C.railEdge, 1));

    // Grilla de U: una línea por borde de U sobre el papel del bay.
    // En modo realista se omite para que la composición fotográfica quede
    // limpia (sin retícula CAD encima).
    if (!realista) {
      for (let i = 0; i <= state.heightU; i++) {
        const y = i * U_MM;
        const major = i % 5 === 0;
        shapes.push(line(x0, y, x1, y, major ? C.uLine5 : C.uLine, major ? 1 : 0.6));
      }
    }
    // Perforaciones del riel: un agujerito por U en cada riel (look EIA).
    for (let i = 0; i < state.heightU; i++) {
      const yc = uBottom(i + 1) + U_MM / 2;
      const hh = 4, hw = 3;
      for (const rx of [x0 - RAIL_W / 2, x1 + RAIL_W / 2]) {
        shapes.push({
          type: 'rect', x0: rx - hw, y0: yc - hh, x1: rx + hw, y1: yc + hh,
          fillcolor: C.hole, line: { width: 0 }, layer: 'below',
        });
      }
    }

    // Los equipos (faceplates con detalle) se dibujan en buildEquipment(),
    // que aporta shapes + annotations a la vez.
    return shapes;
  }

  // Texturas fotográficas del armario para el modo realista: postes,
  // canales, tapa/zócalo (ventilación) y los dos rieles 19" perforados.
  // Se dibujan por debajo de los sprites de equipo (orden en el array).
  function buildCabinetImages() {
    const W = state.widthMM, H = totalH();
    const x0 = bayX0(), x1 = bayX1();
    const S = 'sprites/cab/';
    const img = (ax0, ay0, ax1, ay1, src) => ({
      source: src, xref: 'x', yref: 'y',
      x: ax0, y: ay1, sizex: ax1 - ax0, sizey: ay1 - ay0,
      xanchor: 'left', yanchor: 'top', sizing: 'stretch', layer: 'above',
    });
    return [
      img(0, -PLINTH, FRAME, H + TOP_CAP, S + 'metal.png'),      // poste izq.
      img(W - FRAME, -PLINTH, W, H + TOP_CAP, S + 'metal.png'),  // poste der.
      img(FRAME, 0, x0 - RAIL_W, H, S + 'metal.png'),            // canal izq.
      img(x1 + RAIL_W, 0, W - FRAME, H, S + 'metal.png'),        // canal der.
      img(0, H, W, H + TOP_CAP, S + 'vent.png'),                 // tapa (ventilada)
      img(0, -PLINTH, W, 0, S + 'plinth.png'),                   // zócalo (macizo horizontal)
      img(x0 - RAIL_W, 0, x0, H, S + 'rail.png'),                // riel izq.
      img(x1, 0, x1 + RAIL_W, H, S + 'rail.png'),                // riel der.
    ];
  }

  // Geometría de la caja de un PDU vertical en su canal lateral.
  function sideBox(it) {
    const x0 = bayX0(), x1 = bayX1(), W = state.widthMM, H = totalH();
    const cx = it.side === 'left' ? (FRAME + (x0 - RAIL_W)) / 2 : ((x1 + RAIL_W) + (W - FRAME)) / 2;
    const halfW = Math.min(20, ((x0 - RAIL_W) - FRAME) / 2 - 3);
    return { x0: cx - halfW, x1: cx + halfW, y0: 4, y1: H - 4, ear: 0 };
  }

  // Construye los faceplates de todos los equipos + el realce de selección.
  // Devuelve { shapes, annotations } para fusionar en el layout.
  function buildEquipment() {
    const shapes = [], annotations = [], images = [];
    const x0 = bayX0(), x1 = bayX1(), W = state.widthMM;
    const powerCol = !isZoomMode();               // columna de potencias a la derecha
    const valRightX = W + SIDE_GUTTER - 14;        // borde derecho de la columna de W
    for (const it of state.items) {
      const box = it.mount === 'side'
        ? sideBox(it)
        : { x0, x1, y0: uBottom(it.posU) + 1.2, y1: uBottom(it.posU + it.u) - 1.2, ear: EAR };
      const sel = state.selected === it.uid;
      const sprite = realista ? SPRITES[it.kind] : null;
      const pad = box.ear;

      if (sprite) {
        images.push({
          source: sprite, xref: 'x', yref: 'y',
          x: box.x0 - pad, y: box.y1, sizex: (box.x1 - box.x0) + pad * 2, sizey: box.y1 - box.y0,
          xanchor: 'left', yanchor: 'top', sizing: 'stretch', layer: 'above',
        });
        // (El realce de selección lo dibuja la capa HTML #rack-overlay, no Plotly.)
      } else {
        // Faceplate vectorial (modo CAD, o fallback en realista sin sprite).
        const face = window.CALCRACK_FACE(it, box);
        shapes.push(...face.shapes);
        annotations.push(...face.annotations);
        // (El realce de selección lo dibuja la capa HTML #rack-overlay, no Plotly.)
      }

      // Rótulo del equipo en el margen izquierdo, alineado a su unidad. En modo
      // FOCO el nombre va como etiqueta HTML sobre el equipo (ver buildHitOverlay),
      // así que acá se omite y el gabinete puede ir centrado.
      if (it.mount === 'rail' && !isZoomMode() && !exportMode) {   // en export el nombre va en el resumen (evita texto claro sobre fondo blanco)
        annotations.push({
          x: x0 - RAIL_W - 10, y: uBottom(it.posU) + (it.u * U_MM) / 2,
          xanchor: 'right', yanchor: 'middle', align: 'right',
          text: t(it.name), showarrow: false,
          font: {
            size: 11,
            color: sel ? C.accent : '#eaf6f0',
            family: 'Lato, system-ui, sans-serif',
          },
        });
        // Potencia del equipo a la DERECHA (espejo del nombre): protagonismo a los W.
        if (powerCol && !exportMode) {   // en export las potencias se dibujan en el lienzo (líneas conductoras)
          const pw = billedPower(it);    // 0 W también se muestra, en gris tenue: se entiende que no aporta
          annotations.push({
            x: valRightX, y: uBottom(it.posU) + (it.u * U_MM) / 2,
            xanchor: 'right', yanchor: 'middle', align: 'right',
            text: fmtW(pw), showarrow: false,
            font: { size: 12, color: sel ? C.accent : (pw > 0 ? '#c8d8cf' : '#5f716a'), family: 'Lato, system-ui, sans-serif' },
          });
        }
      }
    }

    // ── Totales (abajo del último equipo con consumo), a la derecha y resaltados:
    // Suma (consumo estimado) · +20% (margen) · Plan. SÓLO en desktop: en móvil el
    // rack ocupa casi todo el alto y el ancho, y en viewports cortos (Safari con
    // barra de URL) las filas se comprimían y se encimaban con los números. En
    // móvil los totales ya salen prominentes en el HEADER (est./margen/Plan).
    const mobile = window.matchMedia('(max-width: 820px)').matches;
    const powered = state.items.filter(it => it.mount === 'rail' && billedPower(it) > 0);
    const labeled = state.items.filter(it => it.mount === 'rail');   // todos llevan etiqueta de W (incl. 0 W)
    if (powerCol && !mobile && !exportMode && powered.length) {
      // Bajo el equipo MÁS BAJO (con o sin consumo) → no se encima con los "0 W".
      const yLow = Math.min(...labeled.map(it => uBottom(it.posU)));
      const sepY = yLow - 12;
      shapes.push({
        type: 'line', x0: W + 26, y0: sepY, x1: valRightX, y1: sepY,
        line: { color: C.accent, width: 1 }, layer: 'above',
      });
      const rows = [
        { l: t('Suma'), v: fmtW(powerTotal()),   c: '#eaf6f0' },
        { l: '+20%',    v: fmtW(marginedPower()), c: '#9db6aa' },
        { l: 'Plan',    v: fmtW(plannedPower()),  c: C.accent },
      ];
      const rowGap = U_MM * 1.2;
      rows.forEach((r, k) => {
        annotations.push({
          x: valRightX, y: sepY - rowGap * (k + 0.7),
          xanchor: 'right', yanchor: 'middle', align: 'right',
          text: `${r.l}  <b>${r.v}</b>`, showarrow: false,
          font: { size: 12, color: r.c, family: 'Lato, system-ui, sans-serif' },
        });
      });
    }
    return { shapes, annotations, images };
  }

  function buildAnnotations() {
    const H = totalH(), x0 = bayX0(), x1 = bayX1(), W = state.widthMM;
    const ann = [];

    // Numeración de U a la derecha del riel (el margen izquierdo queda libre
    // para los nombres de equipo, como en un plano de elevación).
    for (let i = 1; i <= state.heightU; i++) {
      const major = i % 5 === 0 || i === 1 || i === state.heightU;
      ann.push({
        x: x1 + RAIL_W + 6, y: uBottom(i) + U_MM / 2,
        xanchor: 'left', yanchor: 'middle',
        text: String(i), showarrow: false,
        font: { size: major ? 11 : 9, color: major ? '#9db6aa' : '#5f786d' },
      });
    }

    // Las etiquetas de los equipos las aportan los faceplates (buildEquipment).
    return ann;
  }

  // Capa HTML de "hit-areas" sobre el plot: un div transparente por equipo,
  // alineado a su caja con las escalas de Plotly. Da click preciso en TODA el
  // área del equipo (no sólo el centro), tooltip nativo (nombre · U · W) y un
  // botón ✕ para quitarlo. La selección se marca por CSS acá, sin redibujar
  // Plotly (rápido). Se reconstruye tras cada Plotly.react (incl. resize).
  function buildHitOverlay() {
    const gd = $('#rack-plot'), ov = $('#rack-overlay');
    if (!ov || !gd || !gd._fullLayout) return;
    const xa = gd._fullLayout.xaxis, ya = gd._fullLayout.yaxis;
    if (!xa || !ya || !xa.l2p) return;
    const fx = v => xa._offset + xa.l2p(v);
    const fy = v => ya._offset + ya.l2p(v);
    const x0 = bayX0(), x1 = bayX1();
    // En modo foco el overlay cubre el plot ALTO (que scrollea junto con él);
    // fuera de foco cubre el área visible (inset:0 por CSS).
    const zoom = isZoomMode();
    ov.style.height = zoom ? (gd.style.height || '') : '';
    ov.innerHTML = '';
    for (const it of state.items) {
      const box = it.mount === 'side'
        ? sideBox(it)
        : { x0, x1, y0: uBottom(it.posU) + 1.2, y1: uBottom(it.posU + it.u) - 1.2 };
      const pad = it.mount === 'side' ? 1 : EAR;
      const L = fx(box.x0 - pad), R = fx(box.x1 + pad);
      const T = fy(box.y1), B = fy(box.y0);
      const hit = document.createElement('div');
      hit.className = 'rack-hit' + (state.selected === it.uid ? ' selected' : '');
      hit.dataset.uid = it.uid;
      hit.style.left = Math.min(L, R) + 'px';
      hit.style.top = Math.min(T, B) + 'px';
      hit.style.width = Math.abs(R - L) + 'px';
      hit.style.height = Math.abs(B - T) + 'px';
      hit.title = itemTooltip(it);
      hit.addEventListener('click', e => { e.stopPropagation(); setSelected(it.uid); });
      // En modo foco el nombre va como etiqueta sobre el equipo (izquierda), así
      // el gabinete queda centrado sin reservar margen para nombres.
      if (zoom && it.mount === 'rail') {
        const name = document.createElement('span');
        name.className = 'rack-hit-name' + (state.selected === it.uid ? ' sel' : '');
        name.textContent = t(it.name);
        hit.appendChild(name);
      }
      // Manija de arrastre (equipos de riel): touch-action:none → arrastrar sin
      // que iOS scrollee. Ver mountRackDrag.
      if (it.mount === 'rail') {
        const grip = document.createElement('div');
        grip.className = 'rack-hit-grip';
        grip.textContent = '⠿';
        grip.title = t('Arrastrar para mover');
        hit.appendChild(grip);
      }
      // Editar: sólo equipos con popup editable (servidor y switch/router/firewall/cabina).
      if (it.kind === 'server' || ['switch', 'router', 'firewall', 'storage'].includes(it.kind)) {
        const edit = document.createElement('button');
        edit.className = 'rack-hit-edit';
        edit.type = 'button';
        edit.textContent = '✎';
        edit.title = t('Editar {name}', { name: t(it.name) });
        edit.addEventListener('click', e => { e.stopPropagation(); editItem(it.uid); });
        hit.appendChild(edit);
      }
      const clone = document.createElement('button');
      clone.className = 'rack-hit-clone';
      clone.type = 'button';
      clone.textContent = '⧉';
      clone.title = t('Clonar {name}', { name: t(it.name) });
      clone.addEventListener('click', e => { e.stopPropagation(); cloneItem(it.uid); });
      hit.appendChild(clone);
      const del = document.createElement('button');
      del.className = 'rack-hit-del';
      del.type = 'button';
      del.textContent = '✕';
      del.title = t('Quitar {name}', { name: t(it.name) });
      del.addEventListener('click', e => { e.stopPropagation(); removeItem(it.uid); });
      hit.appendChild(del);
      ov.appendChild(hit);
    }
    // Ranuras libres (U sin ocupar): clickeables para elegir dónde insertar.
    const occ = occupancy();
    for (let u = 1; u <= state.heightU; u++) {
      if (occ[u - 1]) continue;
      const L = fx(x0), R = fx(x1);
      const T = fy(uBottom(u + 1)), B = fy(uBottom(u));
      const slot = document.createElement('div');
      slot.className = 'rack-slot' + (state.targetU === u ? ' target' : '');
      slot.dataset.u = u;
      slot.style.left = Math.min(L, R) + 'px';
      slot.style.top = Math.min(T, B) + 'px';
      slot.style.width = Math.abs(R - L) + 'px';
      slot.style.height = Math.abs(B - T) + 'px';
      slot.title = t('U{u} · libre — haz clic: la parte superior del equipo va aquí y se rellena hacia abajo', { u });
      slot.addEventListener('click', e => { e.stopPropagation(); setTargetU(u); });
      ov.appendChild(slot);
    }
    if (zoom) autoScrollZoom(ya);
  }

  // En modo foco, desplaza el rack para dejar a la vista el sector que se está
  // editando: el equipo seleccionado (o, si no hay, el frente de inserción = el
  // equipo más alto de la pila). Sólo scrollea si ese U está fuera de la ventana
  // visible, para no "saltar" cuando tocás algo que ya se ve.
  function autoScrollZoom(ya) {
    const gd = $('#rack-plot'), wrap = gd && gd.parentElement;
    if (!wrap) return;
    const rail = state.items.filter(i => i.mount === 'rail');
    let u = null;
    const selIt = rail.find(i => i.uid === state.selected);
    if (selIt) u = selIt.posU + (selIt.u - 1) / 2;
    else if (rail.length) u = Math.min(...rail.map(i => i.posU));
    if (u == null) return;
    const yc = ya._offset + ya.l2p(uBottom(u) + U_MM / 2);
    const vh = wrap.clientHeight;
    if (yc < wrap.scrollTop + 24 || yc > wrap.scrollTop + vh - 24) {
      wrap.scrollTop = Math.max(0, Math.round(yc - vh / 2));
    }
  }

  // Modo FOCO/zoom: sólo móvil, activado con la lupa (#zoom-btn → body.zoom-on).
  // Rack a ancho completo, alto scrollable, y auto-centra el item seleccionado.
  function isZoomMode() {
    return window.matchMedia('(max-width: 820px)').matches
        && document.body.classList.contains('zoom-on');
  }

  let rackSizeRetries = 0;
  function renderRack() {
    const div = $('#rack-plot');
    // El contenedor puede medir 0 en el primer render (layout aún sin resolver,
    // típico en iOS al cargar): reintentar en el próximo frame en vez de dibujar
    // el rack a tamaño 0 (que se vería vacío / tapado por el bottom sheet).
    const rect0 = div.getBoundingClientRect();
    if ((rect0.width < 1 || rect0.height < 1) && rackSizeRetries < 30) {
      rackSizeRetries++;
      requestAnimationFrame(renderRack);
      return;
    }
    rackSizeRetries = 0;

    const wrap = div.parentElement;
    const W = state.widthMM, H = totalH();
    const eq = buildEquipment();
    const yRange = [-PLINTH - 24, H + TOP_CAP + 24];

    // En modo FOCO el ancho de referencia es el del rack de 80 cm (el más ancho
    // del catálogo): así el 80 "marca el tamaño" y el 60, a la misma escala,
    // queda proporcionalmente MÁS ANGOSTO. El gabinete va CENTRADO (span fijo
    // centrado en el rack actual). Los nombres van sobre el equipo (HTML), no en
    // el margen izquierdo → no hace falta reservar espacio a la izquierda.
    // Fuera de foco: gabinete CENTRADO en pantalla (bajo el "＋" del dock). Se
    // reserva el mismo margen a ambos lados (NAME_GUTTER) — el izquierdo lo usan
    // los nombres de equipo; el derecho queda como aire simétrico — para que el
    // eje del armario (0..W) coincida con el centro del área de dibujo.
    const zoom = isZoomMode();
    const REF_W = zoom ? 800 : W;
    const FOCUS_PAD = 30;
    const focusSpan = REF_W + 2 * FOCUS_PAD;
    const xRange = zoom
      ? [W / 2 - focusSpan / 2, W / 2 + focusSpan / 2]
      : [-SIDE_GUTTER, REF_W + SIDE_GUTTER];

    // Modo FOCO: rack alto, escala 1:1 (sin deformar los sprites), contenedor
    // scrollea vertical. Fuera de foco: fit-all midiendo el contenedor.
    let width, height, yaxis;
    if (zoom) {
      const xspan = xRange[1] - xRange[0];
      const yspan = yRange[1] - yRange[0];
      width = wrap.clientWidth || 1;
      height = Math.round(width * yspan / xspan);
      div.style.height = height + 'px';
      yaxis = {
        visible: false, range: yRange, fixedrange: true, zeroline: false, showgrid: false,
        scaleanchor: 'x', scaleratio: 1,   // 1:1 mm → sin distorsión
      };
    } else {
      div.style.height = '';
      // Re-medir DESPUÉS de limpiar la altura inline del modo foco: si usáramos
      // rect0 (medido arriba) quedaría la altura alta vieja y el rack se
      // dibujaría gigante y fuera de vista al cerrar el catálogo.
      const rect = div.getBoundingClientRect();
      width = rect.width || undefined;
      height = rect.height || undefined;
      yaxis = {
        visible: false, range: yRange, fixedrange: true, zeroline: false, showgrid: false,
        scaleanchor: 'x', scaleratio: 1,   // 1:1 mm → sin distorsión (CAD)
      };
    }

    const layout = {
      autosize: false, width, height,
      margin: { l: 8, r: 8, t: 8, b: 8 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      dragmode: false,
      hovermode: 'closest',
      showlegend: false,
      shapes: [...buildShapes(), ...eq.shapes],
      images: realista ? [...buildCabinetImages(), ...eq.images] : eq.images,
      annotations: [...buildAnnotations(), ...eq.annotations],
      xaxis: {
        visible: false, range: xRange,
        fixedrange: true, zeroline: false, showgrid: false,
      },
      yaxis,
    };
    const config = { displayModeBar: false, responsive: true, doubleClick: false };

    // Traza ancla vacía: sólo fija los ejes. El dibujo son shapes/images y la
    // interacción (click, selección, ✕, tooltip) vive en la capa HTML
    // #rack-overlay, que se arma tras el render (ver buildHitOverlay).
    const anchor = { x: [], y: [], type: 'scatter', mode: 'markers', hoverinfo: 'skip', showlegend: false };
    return Plotly.react(div, [anchor], layout, config).then(() => {
      buildHitOverlay();
      measureRackFrac();     // ancho real del gabinete → fila pegada exacta
      layoutRestMinis();     // recolocar los vecinos con la medida fresca
    });
  }

  // ── Render maestro ───────────────────────────────────────────────────
  // Stats prominentes en el header del rack: ocupación + consumo (lo más
  // importante de la v2), antes escondido al fondo del panel.
  function renderStats() {
    const el = $('#rack-stats');
    if (!el) return;
    const plan = plannedPower();
    const over = plan > RACK_MAX_W;
    const marginPct = Math.round(SAFETY_MARGIN * 100);
    const stepW = RACK_ROUND_W;
    const capKW = (RACK_MAX_W / 1000).toFixed(1);
    let tip = t('Plan del rack = consumo estimado en pared × (1 + {pct}% de margen de seguridad), redondeado hacia arriba al próximo múltiplo de {step} W. Debe ser ≤ {cap} kW por rack.', { pct: marginPct, step: stepW, cap: capKW });
    if (over) tip += t(' ⚠ Este rack ({plan}) supera el máximo de {cap} kW por rack.', { plan: fmtW(plan), cap: capKW });
    const marginTip = t('Consumo estimado en pared + {pct}% de margen de seguridad (antes de redondear). Se redondea ↑ a múltiplos de {step} W para el Plan.', { pct: marginPct, step: stepW });
    let html = `<span class="rs-u"><b>${usedU()}</b> / ${state.heightU} U</span>`
      + `<span class="rs-dim">${state.widthMM} mm</span>`
      + `<span class="rs-pw">${fmtW(powerTotal())} ${t('est.')}</span>`
      + `<span class="rs-margin">+${marginPct}% ${t('margen')}: <b>${fmtW(marginedPower())}</b>`
      + `<span class="info-dot" title="${marginTip}">?</span></span>`
      + `<span class="rs-plan${over ? ' rs-plan-over' : ''}">Plan: <b>${fmtW(plan)}</b>`
      + `<span class="info-dot" title="${tip}">?</span></span>`;
    el.innerHTML = html;
  }

  // Tarjeta de totales del rack activo (SÓLO se ve en móvil, por CSS). HTML
  // superpuesto → posición y espaciado en píxeles, robusto a cualquier viewport
  // (en el plot, con escala de datos, las filas colapsaban en pantallas cortas).
  function renderTotalsCard() {
    const el = $('#rack-totals');
    if (!el) return;
    const powered = state.items.some(it => it.mount === 'rail' && billedPower(it) > 0);
    if (!powered) { el.classList.add('empty'); el.innerHTML = ''; return; }
    el.classList.remove('empty');
    const row = (l, v, cls) =>
      `<div class="rt-row${cls ? ' ' + cls : ''}"><span class="rt-label">${l}</span><span class="rt-val">${v}</span></div>`;
    el.innerHTML =
      row(t('Suma'), fmtW(powerTotal())) +
      row('+20%', fmtW(marginedPower())) +
      row('Plan', fmtW(plannedPower()), 'rt-plan');
  }

  function render() {
    renderCarousel();
    renderCatalog();
    renderPlacedList();
    renderStats();
    renderTotalsCard();
    return renderRack();   // devuelve la promesa del plot (para el coverflow)
  }

  // ── Toast efímero ────────────────────────────────────────────────────
  let toastTimer = 0;
  function flash(msg) {
    let el = $('#toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);' +
        'background:#1f2937;color:#fff;padding:10px 18px;border-radius:999px;font-size:0.85rem;' +
        'box-shadow:0 4px 16px rgba(0,0,0,0.3);z-index:50;opacity:0;transition:opacity .15s;';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 2600);
  }

  // ── Wiring ───────────────────────────────────────────────────────────
  // Toggle CAD ↔ Realista, inyectado en el header del rack.
  // OCULTO por ahora: el proyecto usa sólo el modo Realista. Poné
  // SHOW_VIEW_TOGGLE = true para volver a mostrar el selector (el código CAD
  // sigue intacto). Ver también `realista` (default true) arriba.
  const SHOW_VIEW_TOGGLE = false;
  (function mountViewToggle() {
    if (!SHOW_VIEW_TOGGLE) return;
    const header = document.querySelector('.rack-header');
    if (!header) return;
    const seg = document.createElement('div');
    seg.className = 'seg';
    seg.style.marginLeft = 'auto';
    seg.innerHTML =
      `<button class="seg-btn active" data-view="cad" type="button">${t('CAD')}</button>` +
      `<button class="seg-btn" data-view="real" type="button">${t('Realista')}</button>`;
    header.appendChild(seg);
    seg.addEventListener('click', e => {
      const btn = e.target.closest('.seg-btn');
      if (!btn) return;
      const on = btn.dataset.view === 'real';
      if (on === realista) return;
      realista = on;
      seg.querySelectorAll('.seg-btn').forEach(b => b.classList.toggle('active', b === btn));
      render();
    });
  })();

  // Como dibujamos con tamaño explícito (ver renderRack), nos encargamos de
  // redibujar ante cambios de tamaño (debounced). En iOS la barra de Safari
  // cambia el alto del área visible sin disparar 'resize' de window de forma
  // fiable, así que escuchamos también visualViewport, orientationchange y load.
  let resizeTimer = 0;
  const scheduleRackRender = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderRack, 120);
  };
  window.addEventListener('resize', scheduleRackRender);
  window.addEventListener('orientationchange', scheduleRackRender);
  window.addEventListener('load', () => renderRack());
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleRackRender);
  }

  // Selector único "Añadir": el FAB lo abre; las tarjetas de dispositivo
  // (#add-server/#add-switch/#add-router/#add-firewall) ya tienen su listener
  // de "abrir modal" en mountServerModal/mountDeviceModal — aquí sólo cerramos
  // el selector para que el modal quede al frente. Infraestructura y racks se
  // resuelven directamente.
  (function mountPicker() {
    const btn = $('#dock-add');
    const picker = $('#add-picker');
    if (!btn || !picker) return;
    btn.addEventListener('click', () => { closeDockPops(); openPicker(); });
    $('#pk-close').addEventListener('click', closePicker);
    picker.addEventListener('click', e => { if (e.target === picker) closePicker(); });
    // Al elegir Router/Firewall dentro de "Más", cerramos el selector (su modal
    // se abre encima).
    ['#add-router', '#add-firewall'].forEach(id => {
      const b = $(id); if (b) b.addEventListener('click', closePicker);
    });
    // Cerrar con Escape.
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !picker.hidden) closePicker(); });
  })();

  // ── Header del rack: conmutador ‹ › + ＋Rack + menú "⚙" ──────────────────
  (function mountRackControls() {
    const setBtn = $('#dock-settings');
    if (!setBtn) return;

    // Carrusel: flechas para ir al rack anterior/siguiente, ＋ para crear, y
    // doble clic en el nombre para renombrarlo.
    const prevBtn = $('#rack-prev'), nextBtn = $('#rack-next'), nameEl = $('#rack-name');
    if (prevBtn) prevBtn.addEventListener('click', () => goToRack(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToRack(1));
    // Zonas laterales clicables (saltar al vecino anterior/siguiente).
    const hzP = $('#cf-prev'), hzN = $('#cf-next');
    if (hzP) hzP.addEventListener('click', () => goToRack(-1));
    if (hzN) hzN.addEventListener('click', () => goToRack(1));
    if (nameEl) nameEl.addEventListener('dblclick', () => renameRack(activeRackIndex()));
    const addRackBtn = $('#add-rack-btn');
    if (addRackBtn) addRackBtn.addEventListener('click', openRackModal);

    // Ancla el menú a su botón (Rack ▾/⚙ en el header): abre hacia abajo, y si
    // no entra abajo, hacia arriba. Alineado a un borde y sin salirse.
    function positionPop(pop, btn, align) {
      const r = btn.getBoundingClientRect();
      const pw = pop.offsetWidth, ph = pop.offsetHeight;
      let left = align === 'right' ? r.right - pw : r.left;
      left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
      let top = r.bottom + 6;
      if (top + ph > window.innerHeight - 8) top = Math.max(8, r.top - ph - 6);
      pop.style.left = left + 'px';
      pop.style.top = top + 'px';
      pop.style.bottom = 'auto';
    }
    function toggle(popId, btn, build, align) {
      const pop = $(popId);
      const willOpen = pop.hidden;
      closeDockPops();
      closePicker();
      if (willOpen) {
        build();
        pop.hidden = false;
        positionPop(pop, btn, align);
        btn.setAttribute('aria-expanded', 'true');
      }
    }
    setBtn.addEventListener('click', e => {
      e.stopPropagation(); toggle('#pop-settings', setBtn, buildSettingsPop, 'right');
    });
    // Cerrar al tocar fuera de un menú o de los botones de navegación.
    document.addEventListener('pointerdown', e => {
      if (e.target.closest('.dock-pop') || e.target.closest('.rack-nav')) return;
      closeDockPops();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDockPops(); });
    window.addEventListener('resize', closeDockPops);
  })();

  // Lupa (sólo móvil): alterna Ajustar ↔ Ampliar. En "Ampliar" (body.zoom-on) el
  // rack se dibuja a ancho completo, alto y scrollable, y auto-centra el equipo
  // seleccionado (ver isZoomMode/renderRack/autoScrollZoom). El icono muestra "+"
  // para ampliar y "−" (lupa sin la barra vertical) para volver a ajustar.
  (function mountZoom() {
    const btn = $('#zoom-btn');
    if (!btn) return;
    const plusV = btn.querySelector('.zoom-plus-v');
    btn.addEventListener('click', () => {
      const on = document.body.classList.toggle('zoom-on');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? 'Ajustar' : 'Ampliar');
      btn.setAttribute('title', on ? 'Ajustar (ver todo el rack)' : 'Ampliar (seguir el equipo)');
      if (plusV) plusV.style.display = on ? 'none' : '';
      // Animación sutil de "asentado" (retrigger: quitar clase → reflow → poner).
      const wrap = $('#rack-plot') && $('#rack-plot').parentElement;
      if (wrap) { wrap.classList.remove('rack-pulse'); void wrap.offsetWidth; wrap.classList.add('rack-pulse'); }
      // Re-render tras el cambio de layout (el wrap pasa a scrollear vertical).
      setTimeout(renderRack, 60);
    });
  })();

  // Swipe (estilo Instagram): arrastrar horizontal para deslizar entre racks; la
  // tira sigue el dedo. Gesto VERTICAL se ignora (queda para mover equipos /
  // scroll en modo Ampliar). En los extremos hay resistencia + rebote (topetar).
  (function mountSwipe() {
    const wrap = $('#rack-plot') && $('#rack-plot').parentElement;
    if (!wrap) return;
    let active = false, decided = false, x0 = 0, y0 = 0, pid = null, base = 0;
    const abort = () => { active = false; decided = false; pid = null; };

    // Escuchamos en DOCUMENT (fase de captura): así el gesto nos llega aunque
    // Plotly capture el puntero sobre el plot. Arranca si empezó dentro del área
    // del rack y no sobre un control de equipo / flecha lateral. NO bloquea si ya
    // hay una transición: el touch tiene prioridad y la ADOPTA (la interrumpe).
    document.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (racks.length < 2) return;
      if (document.body.classList.contains('zoom-on')) return;   // ahí el gesto scrollea
      if (!wrap.contains(e.target)) return;
      if (e.target.closest('.rack-hit-grip') || e.target.closest('.rack-hit-clone') ||
          e.target.closest('.rack-hit-del') || e.target.closest('.cf-hotzone')) return;
      active = true; decided = false; x0 = e.clientX; y0 = e.clientY; pid = e.pointerId;
    }, true);

    document.addEventListener('pointermove', (e) => {
      if (!active || e.pointerId !== pid) return;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      if (!decided) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        if (Math.abs(dx) <= Math.abs(dy) * 1.2) { abort(); return; }   // vertical → soltar
        decided = true;
        if (cfTrack) { cfStop(); base = cfOffset; }                   // adoptar la tira en curso
        else { cfBuild(() => {}); base = 0; }                         // o armar una nueva
      }
      e.preventDefault(); e.stopPropagation();                         // reclamar el gesto (Plotly no)
      // Arrastrar a la izquierda (dx<0) → p>0 (el vecino derecho avanza al centro).
      let p = base - dx / (cfStepPx || 1);
      const i = activeRackIndex();
      if ((p > 0 && !racks[i + 1]) || (p < 0 && !racks[i - 1])) p *= 0.32;  // resistencia en extremos
      cfMove(p);
    }, true);

    const end = (e) => {
      if (!active) return;
      if (e && pid != null && e.pointerId !== pid) return;
      if (!decided) { abort(); return; }
      const off = cfOffset;
      const i = activeRackIndex();
      const thr = 0.35;   // fracción de un puesto para confirmar el salto
      let target = null, toP = 0;
      if (off >= thr && racks[i + 1]) { target = racks[i + 1]; toP = 1; }
      else if (off <= -thr && racks[i - 1]) { target = racks[i - 1]; toP = -1; }
      cfAnimateTo(toP, target ? (() => { state = target; return render(); }) : (() => render()));
      abort();
    };
    document.addEventListener('pointerup', end, true);
    document.addEventListener('pointercancel', end, true);
  })();

  // Tooltip de los "?" (info-dot) al TOCAR: en touch (iPhone) no hay hover, así
  // que el title nativo no aparece. Mostramos un popover al tocar el "?" y lo
  // cerramos al tocar en cualquier otro lado. Delegado (los "?" se recrean en
  // cada render). El title nativo sigue funcionando en desktop (hover).
  (function mountInfoTips() {
    let pop = null;
    const hide = () => { if (pop) pop.hidden = true; };
    // pointerup (no click): en iOS un <span> no dispara click al tocarlo.
    document.addEventListener('pointerup', e => {
      const dot = e.target.closest && e.target.closest('.info-dot');
      if (!dot) { hide(); return; }
      e.stopPropagation();
      const text = dot.getAttribute('title') || '';
      if (!text) return;
      if (!pop) {
        pop = document.createElement('div');
        pop.className = 'info-pop';
        pop.hidden = true;
        document.body.appendChild(pop);
      }
      if (!pop.hidden && pop._anchor === dot) { hide(); return; }   // toggle
      pop._anchor = dot;
      pop.textContent = text;
      pop.hidden = false;
      const r = dot.getBoundingClientRect();
      const pw = pop.offsetWidth, ph = pop.offsetHeight;
      let left = r.left + r.width / 2 - pw / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
      let top = r.bottom + 6;
      if (top + ph > window.innerHeight - 8) top = r.top - ph - 6;  // arriba si no entra abajo
      pop.style.left = left + 'px';
      pop.style.top = Math.max(8, top) + 'px';
    });
    window.addEventListener('resize', hide);
  })();

  // ── Arrastrar equipos en el rack ─────────────────────────────────────
  // Desktop: click y arrastrar. iPhone: mantener presionado ~300ms para
  // "levantar" el equipo (así no choca con el scroll del modo foco) y arrastrar.
  // Se suelta en la U destino si entra (excluyendo el propio equipo). Pointer
  // Events unifican mouse y touch. Delegado en #rack-overlay (los hits se
  // recrean en cada render).
  (function mountRackDrag() {
    const ov = $('#rack-overlay');
    if (!ov) return;
    // Evitar que el long-press dispare menú callout / selección / drag nativo (iOS).
    ['contextmenu', 'selectstart', 'dragstart'].forEach(ev =>
      ov.addEventListener(ev, e => e.preventDefault()));
    let d = null, indicator = null;
    const gd = () => $('#rack-plot');
    const axes = () => { const g = gd(); return g && g._fullLayout ? g._fullLayout : null; };

    function uUnderPointer(clientY) {
      const g = gd(), fl = axes(); if (!g || !fl) return null;
      const yData = fl.yaxis.p2l((clientY - g.getBoundingClientRect().top) - fl.yaxis._offset);
      return Math.floor(yData / U_MM) + 1;
    }
    function occExcept(uid) {
      const occ = new Array(state.heightU).fill(false);
      for (const it of state.items) {
        if (it.mount !== 'rail' || it.uid === uid) continue;
        for (let i = 0; i < it.u; i++) { const idx = it.posU - 1 + i; if (idx >= 0 && idx < occ.length) occ[idx] = true; }
      }
      return occ;
    }
    const fits = (posU, uu, occ) => {
      if (posU < 1 || posU + uu - 1 > state.heightU) return false;
      for (let k = 0; k < uu; k++) if (occ[posU - 1 + k]) return false;
      return true;
    };
    function targetPos(clientY) {
      const u = uUnderPointer(clientY); if (u == null) return null;
      const uu = d.it.u, H = state.heightU, occ = occExcept(d.uid);
      let posU = Math.max(1, Math.min(u - Math.floor(uu / 2), H - uu + 1));
      if (fits(posU, uu, occ)) return posU;
      for (let off = 1; off < H; off++) {           // ranura válida más cercana
        if (fits(posU - off, uu, occ)) return posU - off;
        if (fits(posU + off, uu, occ)) return posU + off;
      }
      return null;
    }
    function showIndicator(posU) {
      const fl = axes(); if (!fl) return;
      if (!indicator) { indicator = document.createElement('div'); indicator.className = 'rack-drop'; ov.appendChild(indicator); }
      if (posU == null) { indicator.hidden = true; return; }
      const fx = v => fl.xaxis._offset + fl.xaxis.l2p(v);
      const fy = v => fl.yaxis._offset + fl.yaxis.l2p(v);
      const L = fx(bayX0()), R = fx(bayX1());
      const T = fy(uBottom(posU + d.it.u)), B = fy(uBottom(posU));
      indicator.hidden = false;
      indicator.style.left = Math.min(L, R) + 'px'; indicator.style.top = Math.min(T, B) + 'px';
      indicator.style.width = Math.abs(R - L) + 'px'; indicator.style.height = Math.abs(B - T) + 'px';
    }
    function lift() {
      if (!d || d.lifted) return;
      d.lifted = true;
      d.hit.classList.add('dragging');
      if (navigator.vibrate) { try { navigator.vibrate(12); } catch (_) {} }
    }
    function cleanup() {
      if (!d) return;
      clearTimeout(d.timer);
      try { d.hit.releasePointerCapture(d.pointerId); } catch (_) {}
      d.hit.classList.remove('dragging');
      d.hit.style.transform = '';
      if (indicator) indicator.hidden = true;
      d = null;
    }

    ov.addEventListener('pointerdown', e => {
      if (e.target.closest('.rack-hit-del') || e.target.closest('.rack-hit-clone') || e.target.closest('.rack-hit-edit')) return;  // ✕/⧉/✎ hacen lo suyo
      const hit = e.target.closest('.rack-hit'); if (!hit) return;
      const onGrip = !!e.target.closest('.rack-hit-grip');
      // En touch se arrastra SÓLO desde la manija (touch-action:none → no
      // scrollea); el resto del equipo scrollea. En mouse, desde cualquier parte.
      if (e.pointerType === 'touch' && !onGrip) return;
      const uid = parseInt(hit.dataset.uid, 10);
      const it = state.items.find(i => i.uid === uid);
      if (!it || it.mount !== 'rail') return;             // sólo equipos de riel
      d = { uid, it, hit, startY: e.clientY, pointerId: e.pointerId, lifted: false, posU: null };
      try { hit.setPointerCapture(e.pointerId); } catch (_) {}
    });
    ov.addEventListener('pointermove', e => {
      if (!d || e.pointerId !== d.pointerId) return;
      const dy = e.clientY - d.startY;
      if (!d.lifted) { if (Math.abs(dy) > 4) lift(); else return; }
      e.preventDefault();
      d.hit.style.transform = 'translateY(' + dy + 'px)';
      d.posU = targetPos(e.clientY);
      showIndicator(d.posU);
    });
    const end = e => {
      if (!d || e.pointerId !== d.pointerId) return;
      const moved = d.lifted && d.posU != null && d.posU !== d.it.posU;
      const wasLifted = d.lifted;
      if (moved) { d.it.posU = d.posU; state.selected = d.uid; }
      cleanup();
      if (moved || wasLifted) render();
    };
    ov.addEventListener('pointerup', end);
    ov.addEventListener('pointercancel', end);
  })();

  // ── Guía guiada (onboarding) ─────────────────────────────────────────
  // Tour de pasos con spotlight + tarjeta. Arranca solo en la 1ª visita (flag
  // en localStorage) y se puede repetir con el botón "Guía". Skippable.
  (function mountTour() {
    const KEY = 'calcrack_tour_done';
    const STEPS = [
      { title: '¡Bienvenido! 👋', text: 'Monta y presupuesta un rack IPcore en menos de un minuto. Todos los controles viven en la barra de abajo. Te muestro lo esencial — puedes omitir la guía cuando quieras.' },
      { target: '#add-rack-btn', title: 'Nuevo rack', text: 'El botón «＋ Rack» (arriba/izquierda, con borde verde) crea un armario nuevo vacío. Los de al lado añaden equipos al rack actual: Host, Switch, Cabina y «Más» (Router, Firewall e Infraestructura).' },
      { target: '.rack-plot-wrap', title: 'Cada equipo, en el dibujo', text: 'Toca un equipo para seleccionarlo. Con el asa ⠿ lo mueves, con ⧉ lo clonas y con ✕ lo quitas. También puedes arrastrarlo a otra U.' },
      { target: '#dock-settings', title: 'Ajustes del rack', text: 'En «⚙» cambias el ancho del armario (60 / 80 cm) y el alto, clonas el rack actual o lo vacías.' },
      { target: '#rack-stats', title: 'Consumo y Plan', text: 'Arriba, sólo lectura: consumo estimado, +margen de seguridad y el «Plan» (redondeado, con tope de 5 kW por rack). El «?» explica cada valor.' },
      { target: '.rack-switch', title: 'Varios racks', text: 'Con «‹ ›» cambias de armario y con doble clic en el nombre lo renombras. Para crear uno nuevo usa «＋ Rack»; para clonarlo o quitarlo, «⚙».' },
      { target: '#export-svg', title: 'Exporta el plano', text: 'Cuando termines, descarga el plano del rack como imagen para presupuestar o documentar.' },
    ];
    let overlay, spot, card, idx = 0;

    function elFor(step) {
      const mobile = window.matchMedia('(max-width: 820px)').matches;
      const sel = (mobile && step.mobileTarget) ? step.mobileTarget : step.target;
      if (!sel) return null;
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return (r.width < 1 || r.height < 1) ? null : el;
    }
    function build() {
      overlay = document.createElement('div'); overlay.id = 'tour'; overlay.hidden = true;
      spot = document.createElement('div'); spot.className = 'tour-spot';
      card = document.createElement('div'); card.className = 'tour-card';
      overlay.append(spot, card);
      document.body.appendChild(overlay);
    }
    function positionCard(r) {
      const cw = card.offsetWidth, ch = card.offsetHeight, m = 12;
      let left = Math.max(12, Math.min(r.left + r.width / 2 - cw / 2, window.innerWidth - cw - 12));
      let top = r.bottom + m;
      if (top + ch > window.innerHeight - 12) top = r.top - ch - m;   // arriba si no entra abajo
      card.style.left = left + 'px'; card.style.top = Math.max(12, top) + 'px';
    }
    function render() {
      const step = STEPS[idx], el = elFor(step), last = idx === STEPS.length - 1;
      card.innerHTML = '<h3>' + t(step.title) + '</h3><p>' + t(step.text) + '</p>'
        + '<div class="tour-foot"><span class="tour-progress">' + (idx + 1) + ' / ' + STEPS.length + '</span>'
        + '<div class="tour-actions">'
        + (last ? '' : '<button class="tour-skip" type="button">' + t('Saltar') + '</button>')
        + '<button class="tour-next" type="button">' + (last ? t('Listo') : t('Siguiente')) + '</button></div></div>';
      card.querySelector('.tour-next').addEventListener('click', () => { if (last) end(); else { idx++; render(); } });
      const sk = card.querySelector('.tour-skip'); if (sk) sk.addEventListener('click', end);
      if (el) {
        const r = el.getBoundingClientRect(), pad = 6;
        spot.style.display = '';
        spot.style.left = (r.left - pad) + 'px'; spot.style.top = (r.top - pad) + 'px';
        spot.style.width = (r.width + pad * 2) + 'px'; spot.style.height = (r.height + pad * 2) + 'px';
        positionCard(r);
      } else {
        spot.style.display = 'none';
        card.style.left = Math.round((window.innerWidth - card.offsetWidth) / 2) + 'px';
        card.style.top = Math.round((window.innerHeight - card.offsetHeight) / 2) + 'px';
      }
    }
    function start() { if (!overlay) build(); idx = 0; overlay.hidden = false; render(); }
    function end() { if (overlay) overlay.hidden = true; try { localStorage.setItem(KEY, '1'); } catch (_) {} }

    const btn = $('#tour-btn'); if (btn) btn.addEventListener('click', start);
    window.addEventListener('resize', () => { if (overlay && !overlay.hidden) render(); });
    // Arranque automático en la 1ª visita (tras la precarga: esperamos a que se
    // quite el spinner para no taparlo).
    let seen = false; try { seen = localStorage.getItem(KEY) === '1'; } catch (_) {}
    if (!seen) {
      const tryStart = () => { document.getElementById('loading') ? setTimeout(tryStart, 200) : start(); };
      setTimeout(tryStart, 400);
    }
  })();

  // ── Modal "Nuevo rack" ────────────────────────────────────────────────
  // Al crear un rack pregunta nombre + ancho (60/80) + alto (U) — lo que vive en
  // ⚙ — en una sola pantalla, con el estilo verde del asistente de servidor.
  function segGet(seg) {
    const on = seg && seg.querySelector('.on');
    return on ? (on.dataset.w || on.dataset.u) : null;
  }
  function segSet(seg, val) {
    if (seg) [...seg.children].forEach(b => b.classList.toggle('on', (b.dataset.w || b.dataset.u) === val));
  }
  function openRackModal() {
    const modal = $('#rack-modal');
    if (!modal) { addRack(); return; }            // fallback si falta el markup
    const nameEl = $('#rm-name');
    if (nameEl) nameEl.value = 'Rack ' + nextRackNumber();
    segSet($('#rm-width'), '800');                // 80 cm por defecto
    modal.hidden = false;
  }
  (function mountRackModal() {
    const modal = $('#rack-modal');
    if (!modal) return;
    const close = () => { modal.hidden = true; };
    // Segmento de ancho: clic → deja uno marcado (radio). El alto es fijo (42U).
    const wseg = $('#rm-width');
    if (wseg) wseg.addEventListener('click', e => {
      const b = e.target.closest('.pop-seg-btn'); if (!b) return;
      [...wseg.children].forEach(x => x.classList.toggle('on', x === b));
    });
    $('#rm-close').addEventListener('click', close);
    $('#rm-cancel').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    $('#rm-create').addEventListener('click', () => {
      addRack({
        name: ($('#rm-name').value || '').trim() || undefined,
        widthMM: parseInt(segGet($('#rm-width')), 10) || 800,
      });
      close();
    });
  })();

  // ── Modal "Añadir servidor" ──────────────────────────────────────────
  // Compone un servidor: nombre, alto en U, consumo base del chasis y filas
  // de CPUs/GPUs (modelo de la DB o genérico, con watt editable). El consumo
  // estimado = base + Σ(watt × cantidad). Al confirmar inserta el item con su
  // power_w y config (para mostrarlo y, a futuro, clonarlo).
  (function mountServerModal() {
    const modal = $('#server-modal');
    const btnOpen = $('#add-server');
    if (!modal || !btnOpen) return;

    const elName = $('#sm-name'), elU = $('#sm-u'), elBase = $('#sm-base');
    const elDisks = $('#sm-disks'), elRam = $('#sm-ram'), elTotal = $('#sm-total');
    const elRecap = $('#sm-recap'), smTitle = $('#sm-title');
    let editUid = null;   // null = añadir; uid = editar ese servidor en su sitio
    const btnBack = $('#sm-back'), btnNext = $('#sm-next'), btnDone = $('#sm-confirm');
    const steps = [...modal.querySelectorAll('.wiz-step')];
    const panes = [...modal.querySelectorAll('.wiz-pane')];
    const LAST = panes.length - 1;

    // ── Un selector de componente por categoría (cpu | gpu) ────────────────
    // El modelo genérico es la opción por defecto y su watt es editable; al
    // elegir un modelo real de la DB, el watt se bloquea con el dato de datasheet.
    // Las opciones se (re)generan en cada open() porque la DB llega por fetch
    // asíncrono: al montar el modal aún puede estar vacía.
    function makeComp(kind, sel, qty, watt, subEl, defQty) {
      const genName = ({ cpu: 'CPU genérica', gpu: 'GPU genérica' })[kind];
      const genW = ({ cpu: 120, gpu: 150 })[kind];   // conservador (DC europeo, no última gen)
      let reals = [], gpool = [];

      function populate() {
        const arr = ({ cpu: DB.cpus, gpu: DB.gpus })[kind] || [];
        const generics = arr.filter(e => e.generic);
        reals = arr.filter(e => !e.generic);
        // Fallback si la DB todavía no cargó: un genérico mínimo.
        gpool = generics.length ? generics : [{ model: genName, tdp_w: genW }];

        sel.innerHTML = '';
        // Genérico (editable) SIEMPRE primero → es el valor por defecto.
        gpool.forEach((e, i) => {
          const o = document.createElement('option');
          o.value = 'g:' + i; o.textContent = t('Genérico (consumo editable)');
          sel.appendChild(o);
        });
        // Después los modelos de la DB. Las GPUs se agrupan por CATEGORÍA
        // (escritorio / workstation / data center, como el listado de NVIDIA en
        // Wikipedia); el resto (CPU) por marca.
        const groups = [];
        const findG = (name) => {
          let g = groups.find(x => x.name === name);
          if (!g) { g = { name, items: [] }; groups.push(g); }
          return g;
        };
        if (kind === 'gpu') {
          // NVIDIA por categoría (escritorio/workstation/data center); AMD, aparte.
          const LABEL = { desktop: 'NVIDIA GeForce', workstation: 'NVIDIA workstation', datacenter: 'NVIDIA data center' };
          ['desktop', 'workstation', 'datacenter'].forEach(k => findG(LABEL[k]));  // orden fijo
          findG('AMD');                                                            // apartado propio al final
          reals.forEach((e, i) => {
            const g = e.brand === 'NVIDIA' ? (LABEL[e.class] || LABEL.datacenter) : 'AMD';
            findG(g).items.push({ e, i });
          });
        } else {
          reals.forEach((e, i) => findG(e.brand).items.push({ e, i }));
        }
        groups.filter(g => g.items.length).forEach(g => {
          const og = document.createElement('optgroup'); og.label = t(g.name);
          g.items.sort((x, y) => (y.e.year || 0) - (x.e.year || 0)); // más nuevo primero
          g.items.forEach(({ e, i }) => {
            const o = document.createElement('option');
            o.value = 'r:' + i;
            const spec = kind === 'cpu'
              ? `${e.cores ? e.cores + 'c, ' : ''}${e.tdp_w}W`
              : `${e.vram_gb ? e.vram_gb + 'GB, ' : ''}${e.tdp_w}W`;
            o.textContent = `${e.model} (${spec})`;
            og.appendChild(o);
          });
          sel.appendChild(og);
        });
      }

      const entryOf = () => {
        const [t, i] = sel.value.split(':');
        return t === 'g' ? gpool[+i] : reals[+i];
      };
      const isGeneric = () => sel.value.startsWith('g:');
      // Sincroniza el watt con el modelo: genérico → editable; real → bloqueado.
      const syncWatt = () => {
        watt.value = entryOf().tdp_w;
        watt.readOnly = !isGeneric();
        watt.classList.toggle('is-locked', !isGeneric());
      };

      const ctl = {
        read() {
          return {
            model: entryOf().model,
            n: Math.max(0, parseInt(qty.value, 10) || 0),
            w: Math.max(0, parseFloat(watt.value) || 0),
          };
        },
        power() { const c = ctl.read(); return c.w * c.n; },
        refreshSub() {
          const c = ctl.read();
          subEl.textContent = c.n ? `${c.n} × ${fmtW(c.w)} = ${fmtW(c.w * c.n)}` : '—';
        },
        reset() { populate(); sel.value = 'g:0'; qty.value = String(defQty); syncWatt(); ctl.refreshSub(); },
        // Pre-carga desde una config guardada { model, n, w }: si el modelo existe
        // en la DB se selecciona (watt bloqueado); si no, genérico con su watt editable.
        set(cfg) {
          populate();
          const idx = (cfg && cfg.model) ? reals.findIndex(e => e.model === cfg.model) : -1;
          if (idx >= 0) { sel.value = 'r:' + idx; syncWatt(); }
          else {
            sel.value = 'g:0';
            watt.readOnly = false; watt.classList.remove('is-locked');
            watt.value = (cfg && cfg.w != null) ? cfg.w : gpool[0].tdp_w;
          }
          qty.value = String(cfg && cfg.n != null ? cfg.n : defQty);
          ctl.refreshSub();
        },
      };

      sel.addEventListener('change', () => { syncWatt(); ctl.refreshSub(); recompute(); });
      qty.addEventListener('input', () => { ctl.refreshSub(); recompute(); });
      watt.addEventListener('input', () => { ctl.refreshSub(); recompute(); });
      return ctl;
    }

    const cpu = makeComp('cpu', $('#sm-cpu-model'), $('#sm-cpu-qty'), $('#sm-cpu-watt'), $('#sm-cpu-sub'), 1);
    const gpu = makeComp('gpu', $('#sm-gpu-model'), $('#sm-gpu-qty'), $('#sm-gpu-watt'), $('#sm-gpu-sub'), 0);

    // Potencia DC total (componentes) y su reflejo en pared en el pie.
    function dcTotal() {
      return Math.max(0, parseFloat(elBase.value) || 0)
        + cpu.power() + gpu.power()
        + (parseFloat(elDisks.value) || 0) + (parseFloat(elRam.value) || 0);
    }
    function recompute() {
      const total = dcTotal();
      modal._total = total;   // DC completo (se guarda en power_w), sea cual sea la pantalla
      // El pie "Consumo estimado" muestra el ACUMULADO hasta la pantalla actual:
      // paso 1 = sólo CPU; paso 2 = CPU + GPU; paso 3 = total del servidor en pared
      // (+ standby, ÷ eficiencia de fuente), como siempre.
      let shown;
      if (step === 0) shown = cpu.power();
      else if (step === 1) shown = cpu.power() + gpu.power();
      else shown = (total + SERVER_STANDBY_W) / PSU_EFFICIENCY;
      elTotal.textContent = fmtW(shown);
    }

    // Recap del último paso: desglose legible de todo lo que se va a añadir.
    function buildRecap() {
      const c = cpu.read(), g = gpu.read();
      const rows = [];
      const line = (k, v) => `<li><span>${k}</span><b>${v}</b></li>`;
      rows.push(line(t('Chasis (base)'), fmtW(Math.max(0, parseFloat(elBase.value) || 0))));
      rows.push(line(t('CPUs'), c.n ? `${c.n} × ${fmtW(c.w)}` : '—'));
      rows.push(line(t('GPUs'), g.n ? `${g.n} × ${fmtW(g.w)}` : '—'));
      rows.push(line(t('Discos'), (parseFloat(elDisks.value) || 0) ? fmtW(parseFloat(elDisks.value)) : '—'));
      rows.push(line(t('RAM'), (parseFloat(elRam.value) || 0) ? fmtW(parseFloat(elRam.value)) : '—'));
      elRecap.innerHTML = rows.join('');
    }

    // ── Navegación del asistente ───────────────────────────────────────────
    let step = 0;
    function show(n) {
      step = Math.max(0, Math.min(LAST, n));
      panes.forEach((p, i) => p.classList.toggle('is-active', i === step));
      steps.forEach((s, i) => {
        s.classList.toggle('is-active', i === step);
        s.classList.toggle('is-done', i < step);
      });
      btnBack.hidden = step === 0;
      btnNext.hidden = step === LAST;
      btnDone.hidden = step !== LAST;
      if (step === LAST) buildRecap();
      recompute();   // el pie refleja el acumulado de la pantalla actual
    }

    function open() {
      editUid = null;
      if (smTitle) smTitle.textContent = t('Nuevo servidor');
      elName.value = t('Servidor');
      elU.value = '1';
      elBase.value = '80';
      elDisks.value = '20';    // 1–4 discos SSD (~5 W c/u)
      elRam.value = '20';      // ≤128 GB (~0,16 W/GB, carga típica)
      cpu.reset();             // genérico · 1 ud · 120 W
      gpu.reset();             // genérico · 0 uds · 150 W
      recompute();
      show(0);
      modal.hidden = false;
    }
    // Editar un servidor existente: mismo asistente pre-cargado con su config.
    function openForEdit(item) {
      editUid = item.uid;
      const cfg = item.config || {};
      if (smTitle) smTitle.textContent = t('Editar servidor');
      elName.value = item.name || t('Servidor');
      elU.value = String(item.u || 1);
      elBase.value = String(cfg.base_w != null ? cfg.base_w : 80);
      elDisks.value = String(cfg.disks_w != null ? cfg.disks_w : 0);
      elRam.value = String(cfg.ram_w != null ? cfg.ram_w : 0);
      cpu.set((cfg.cpus && cfg.cpus[0]) || { n: 0 });
      gpu.set((cfg.gpus && cfg.gpus[0]) || { n: 0 });
      recompute();
      show(0);
      modal.hidden = false;
    }
    editors.server = openForEdit;
    const close = () => { modal.hidden = true; };

    btnOpen.addEventListener('click', open);
    $('#sm-close').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    btnBack.addEventListener('click', () => show(step - 1));
    btnNext.addEventListener('click', () => show(step + 1));
    // Permitir saltar a un paso concreto tocando su ficha en la barra.
    steps.forEach(s => s.addEventListener('click', () => show(+s.dataset.step)));
    elBase.addEventListener('input', recompute);
    elDisks.addEventListener('change', recompute);
    elRam.addEventListener('change', recompute);

    btnDone.addEventListener('click', () => {
      const u = Math.min(state.heightU, Math.max(1, parseInt(elU.value, 10) || 1));
      const c = cpu.read(), g = gpu.read();
      const gpus = g.n ? [g] : [];
      const fields = {
        name: (elName.value || 'Servidor').trim() || 'Servidor',
        u, color: gpus.length ? '#3f4b5b' : '#475569',
        power_w: modal._total,
        config: {
          base_w: Math.max(0, parseFloat(elBase.value) || 0),
          cpus: c.n ? [c] : [], gpus, dpus: [],
          disks_w: parseFloat(elDisks.value) || 0,
          ram_w: parseFloat(elRam.value) || 0,
        },
      };
      if (editUid != null) {
        // EDITAR en el sitio. Mantener posU si el nuevo alto cabe; si no, reubicar.
        const item = state.items.find(i => i.uid === editUid);
        if (!item) { close(); return; }
        let posU = item.posU;
        if (!fitsAt(posU, u, occExcept(item.uid))) {
          posU = firstFit(u, occExcept(item.uid));
          if (posU == null) { flash(t('No hay {u}U libres contiguas en el rack.', { u })); return; }
        }
        const newBilled = (fields.power_w + SERVER_STANDBY_W) / PSU_EFFICIENCY;
        if (exceedsCap(newBilled - billedPower(item))) return;   // no cierra: deja ajustar
        Object.assign(item, fields, { posU });
        state.selected = item.uid;
      } else {
        const posU = resolvePos(u);
        if (posU == null) return;
        const it = Object.assign({ uid: uidSeq++, catId: null, mount: 'rail', kind: 'server', posU }, fields);
        if (exceedsCap(billedPower(it))) return;   // no cierra: deja ajustar
        state.items.push(it);
        state.selected = it.uid;
      }
      state.targetU = null;
      close();
      render();
    });
  })();

  // ── Modal "Añadir switch / router" ───────────────────────────────────
  // Elige un modelo de la DB (consumo de datasheet) o el genérico (U y watt
  // editables). Completa el "genérico modificable" para equipos de red.
  (function mountDeviceModal() {
    const modal = $('#device-modal');
    if (!modal) return;
    const elModel = $('#dm-model'), elName = $('#dm-name'), elU = $('#dm-u'),
          elWatt = $('#dm-watt'), elTotal = $('#dm-total'), elTitle = $('#dm-title');
    let kind = 'switch';
    let pool = { gpool: [], reals: [] };
    let editUid = null;   // null = añadir; uid = editar ese equipo en su sitio
    const isReal = e => e.brand && e.brand !== 'Genérico';
    // Config por tipo. Firewall y cabina no tienen DB de modelos: sólo estimado
    // editable. La cabina de discos por defecto ~450 W (cabina poblada de 1ª/2ª
    // gen: ~24 discos + expansores/PSU dobles, dato en AC) y 3U.
    const KIND = {
      switch:   { label: 'switch',            name: 'Switch',            color: '#2563eb', w: 150, u: 1, arr: () => DB.switches },
      router:   { label: 'router',            name: 'Router',            color: '#1e3a8a', w: 200, u: 1, arr: () => DB.routers },
      firewall: { label: 'firewall',          name: 'Firewall',          color: '#3730a3', w: 150, u: 1, arr: () => [] },
      storage:  { label: 'cabina de discos',  name: 'Cabina de discos',  color: '#0e7490', w: 450, u: 3, arr: () => [] },
    };
    const fallbackName = () => KIND[kind].name;

    function populate() {
      const arr = KIND[kind].arr();
      const generics = arr.filter(e => e.generic);
      const reals = arr.filter(e => !e.generic);
      const gpool = generics.length ? generics
        : [{ model: fallbackName() + ' genérico', u: KIND[kind].u || 1, power_typ_w: KIND[kind].w }];
      pool = { gpool, reals };
      elModel.innerHTML = '';
      // Genérico (consumo editable) SIEMPRE primero → es el valor por defecto.
      gpool.forEach((e, i) => {
        const o = document.createElement('option');
        o.value = 'g:' + i; o.textContent = t('Genérico (consumo editable)');
        elModel.appendChild(o);
      });
      // Después los modelos de la DB, agrupados por marca.
      const brands = [];
      reals.forEach((e, i) => {
        let b = brands.find(x => x.name === e.brand);
        if (!b) { b = { name: e.brand, items: [] }; brands.push(b); }
        b.items.push({ e, i });
      });
      brands.forEach(b => {
        const og = document.createElement('optgroup'); og.label = t(b.name);
        b.items.sort((x, y) => (y.e.year || 0) - (x.e.year || 0)); // más nuevo primero
        b.items.forEach(({ e, i }) => {
          const o = document.createElement('option');
          o.value = 'r:' + i;
          const w = e.power_typ_w || e.power_max_w;
          o.textContent = `${e.model} (${e.u}U, ${w}W)`;
          og.appendChild(o);
        });
        elModel.appendChild(og);
      });
    }

    const entryOf = () => {
      const [t, i] = elModel.value.split(':');
      return t === 'g' ? pool.gpool[+i] : pool.reals[+i];
    };
    function syncFromModel() {
      const e = entryOf();
      const generic = !isReal(e);
      // Genérico → "Switch Genérico" (si el tipo tiene lista de modelos; firewall/
      // cabina no, y quedan sólo con su nombre). Modelo real → prefijo de tipo:
      // "Switch Nexus 93180YC-FX".
      elName.value = generic
        ? (pool.reals.length ? t('{type} Genérico', { type: t(fallbackName()) }) : t(fallbackName()))
        : t(fallbackName()) + ' ' + e.model;
      elU.value = e.u || 1;
      elWatt.value = e.power_typ_w || e.power_max_w || KIND[kind].w;
      // Genérico → consumo editable; modelo real → bloqueado (dato de datasheet).
      elWatt.readOnly = !generic;
      elWatt.classList.toggle('is-locked', !generic);
      recompute();
    }
    const recompute = () => { elTotal.textContent = fmtW(Math.max(0, parseFloat(elWatt.value) || 0)); };

    function open(k) {
      editUid = null;
      kind = k;
      elTitle.textContent = t('Añadir {label}', { label: t(KIND[k].label) });
      // Firewall y cabina no llevan lista de modelos: sólo consumo estimado editable.
      $('#dm-model-row').style.display = (k === 'firewall' || k === 'storage') ? 'none' : '';
      populate();
      elModel.value = 'g:0';   // por defecto: genérico (consumo editable)
      syncFromModel();
      modal.hidden = false;
    }
    // Editar un switch/router/… existente: mismo modal pre-cargado con su config.
    function openForEdit(item) {
      editUid = item.uid;
      kind = item.kind;
      elTitle.textContent = t('Editar {label}', { label: t(KIND[kind].label) });
      $('#dm-model-row').style.display = (kind === 'firewall' || kind === 'storage') ? 'none' : '';
      populate();
      const modelName = item.config && item.config.model;
      const ri = (modelName && modelName !== 'Genérico') ? pool.reals.findIndex(e => e.model === modelName) : -1;
      elModel.value = ri >= 0 ? 'r:' + ri : 'g:0';
      syncFromModel();                       // fija bloqueo del watt según genérico/real
      elName.value = item.name || fallbackName();   // luego restauro los valores GUARDADOS
      elU.value = item.u || 1;
      elWatt.value = item.power_w;
      recompute();
      modal.hidden = false;
    }
    editors.device = openForEdit;
    const close = () => { modal.hidden = true; };

    elModel.addEventListener('change', syncFromModel);
    elWatt.addEventListener('input', recompute);
    $('#dm-close').addEventListener('click', close);
    $('#dm-cancel').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    $('#add-switch').addEventListener('click', () => open('switch'));
    $('#add-router').addEventListener('click', () => open('router'));
    $('#add-firewall').addEventListener('click', () => open('firewall'));
    { const b = $('#add-storage'); if (b) b.addEventListener('click', () => open('storage')); }

    $('#dm-confirm').addEventListener('click', () => {
      const u = Math.min(state.heightU, Math.max(1, parseInt(elU.value, 10) || 1));
      const e = entryOf();
      const fields = {
        name: (elName.value || '').trim() || fallbackName(),
        u, color: KIND[kind].color,
        power_w: Math.max(0, parseFloat(elWatt.value) || 0),
        config: { model: isReal(e) ? e.model : 'Genérico' },
      };
      if (editUid != null) {
        // EDITAR en el sitio. Mantener posU si el nuevo alto cabe; si no, reubicar.
        const item = state.items.find(i => i.uid === editUid);
        if (!item) { close(); return; }
        let posU = item.posU;
        if (!fitsAt(posU, u, occExcept(item.uid))) {
          posU = firstFit(u, occExcept(item.uid));
          if (posU == null) { flash(t('No hay {u}U libres contiguas en el rack.', { u })); return; }
        }
        if (exceedsCap(fields.power_w - billedPower(item))) return;   // no cierra: deja ajustar
        Object.assign(item, fields, { posU });
        state.selected = item.uid;
      } else {
        const posU = resolvePos(u);
        if (posU == null) return;
        const it = Object.assign({ uid: uidSeq++, catId: null, mount: 'rail', kind, posU }, fields);
        if (exceedsCap(billedPower(it))) return;   // no cierra: deja ajustar
        state.items.push(it);
        state.selected = it.uid;
      }
      state.targetU = null;
      close();
      render();
    });
  })();

  // Ancho (60/80), alto, vaciar, clonar y alta/baja de racks se manejan desde
  // el dock inferior (menús "Rack ▾" y "⚙", ver mountDock/buildSettingsPop).

  // ── Exportar: UNA imagen con TODOS los racks (dibujo + items + potencias +
  //    Plan a contratar) ─────────────────────────────────────────────────
  // 100% cliente: reúne el PNG de cada rack (reusa rackThumb, que ya dibuja los
  // equipos con sus nombres y consumos) y los compone en un solo lienzo con
  // cabecera (marca + título + fecha) y, bajo cada rack, su nombre y su Plan. El
  // PDF/email se montarán encima de esto más adelante, sin rehacer nada.
  function loadImg(src) {
    return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
  }
  // Render dedicado de un rack para el export: PNG en aspecto RETRATO ajustado
  // (sin las bandas negras del wrap) y SIN el bloque de totales dibujado (van en
  // el pie de la composición). Alta resolución para impresión (scale 2).
  function exportRackPNG(rack) {
    return new Promise((resolve) => {
      const div = ensureThumbDiv();
      const saved = state, savedExport = exportMode, savedSel = rack.selected;
      state = rack; exportMode = true; rack.selected = null;   // sin realce de selección
      const W = state.widthMM, H = totalH();
      const eq = buildEquipment();
      const yRange = [-PLINTH - 24, H + TOP_CAP + 24];
      // Izq.: margen para los nombres de equipo. Der.: ajustado (las potencias ya
      // no van horneadas; se dibujan en el lienzo con líneas hacia los totales).
      const xRange = [-SIDE_GUTTER, W + 44];
      const xspan = xRange[1] - xRange[0], yspan = yRange[1] - yRange[0];
      const th = 1100, tw = Math.max(200, Math.round(th * xspan / yspan));
      const layout = {
        // Margen 0: con tw calculado al aspecto EXACTO de los datos, el dibujo
        // llena el lienzo sin banda de letterbox → el mapeo data→lienzo del
        // export (canvasY/canvasX) es exacto y las líneas quedan clavadas al
        // centro de cada item.
        autosize: false, width: tw, height: th, margin: { l: 0, r: 0, t: 0, b: 0, autoexpand: false },
        paper_bgcolor: 'transparent', plot_bgcolor: 'transparent', dragmode: false, showlegend: false,
        shapes: [...buildShapes(), ...eq.shapes],
        images: realista ? [...buildCabinetImages(), ...eq.images] : eq.images,
        annotations: [...buildAnnotations(), ...eq.annotations],
        xaxis: { visible: false, range: xRange, fixedrange: true, zeroline: false, showgrid: false },
        yaxis: { visible: false, range: yRange, fixedrange: true, zeroline: false, showgrid: false, scaleanchor: 'x', scaleratio: 1 },
      };
      state = saved; exportMode = savedExport; rack.selected = savedSel;
      Plotly.react(div, [{ x: [], y: [], type: 'scatter', mode: 'markers', hoverinfo: 'skip' }],
        layout, { displayModeBar: false, responsive: false, staticPlot: true })
        .then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))))
        .then(() => Plotly.toImage(div, { format: 'png', width: tw, height: th, scale: 2 }))
        .then(resolve)
        .catch(() => resolve(null));
    });
  }
  // Overlay con spinner mientras se genera la imagen (los render tardan un poco).
  function showExportSpinner(on, label) {
    let ov = $('#export-spin');
    if (on) {
      if (!ov) {
        ov = document.createElement('div');
        ov.id = 'export-spin';
        ov.innerHTML = '<div class="spinner" aria-hidden="true"></div><div class="export-spin-text"></div>';
        document.body.appendChild(ov);
      }
      ov.querySelector('.export-spin-text').textContent = label || t('Exportando…');
      ov.hidden = false;
    } else if (ov) {
      ov.hidden = true;
    }
  }
  // Renderiza la cotización de TODOS los racks. `deliver(blob)` opcional: si se
  // pasa, recibe el JPEG resultante (para adjuntarlo a un correo) en vez de
  // descargarlo. `done()` se llama siempre al terminar (éxito o error).
  function renderQuoteImage(deliver, done) {
    const cells = [];
    // Serializado: todos los render usan el MISMO div offscreen (uno a la vez).
    racks.reduce((chain, r) => chain
      .then(() => exportRackPNG(r))
      .then(url => (url ? loadImg(url).catch(() => null) : null))
      .then(img => { cells.push({ rack: r, img }); }), Promise.resolve())
      .then(() => composeExport(cells, done, deliver))
      .catch(() => done());
  }
  function exportRacksImage() {
    const btn = $('#export-svg');
    if (btn) btn.disabled = true;
    showExportSpinner(true);
    const done = () => { showExportSpinner(false); if (btn) btn.disabled = false; };
    renderQuoteImage(null, done);   // sin deliver → descarga
  }
  // Composición VERTICAL (cotización): una fila por rack. De izquierda a derecha:
  // dibujo del rack → líneas conductoras PEGADAS a cada equipo (a su altura) que
  // van hacia la derecha, donde se escribe el MONTO de cada equipo en columna, y
  // debajo su SUMATORIA (Suma · +20% margen · línea · Plan). Cabecera con marca +
  // título + fecha, y separadores tenues entre racks.
  function composeExport(cells, done, deliver) {
    const FONT = 'Lato, system-ui, sans-serif', CAP = 1920, SS = 2;   // ancho máx de salida (px) · supersampling
    const M = 50, HEAD = 104, RH = 620, ROWGAP = 48;    // px lógicos
    const GAPL = 200, UCOL = 84, NAMEW = 520;            // líneas conductoras · columna U-posición · ancho nombre+valores
    // Paleta CLARA (fondo blanco, tipo hoja de cotización): texto oscuro y verde
    // más oscuro para que contraste. El rack fotográfico (oscuro) luce sobre blanco.
    const BG = '#ffffff', ACCENT = '#159a58', FG = '#0e1a14', MUTE = '#64756c';
    const HAIR = 'rgba(14,26,20,0.14)', LEAD = 'rgba(21,154,88,0.55)';
    // Cada rack a altura RH conservando su aspecto (retrato); los más angostos se
    // centran en el ancho del rack más ancho.
    const scaled = cells.map(c => ({
      ...c, w: c.img ? Math.max(120, Math.round(RH * c.img.width / c.img.height)) : Math.round(RH * 0.6),
    }));
    const rwMax = Math.max(...scaled.map(c => c.w));
    const panelX = M + rwMax + GAPL;   // columna U-posición, etiquetas de totales y fin de las líneas
    const nameX = panelX + UCOL;       // nombres de equipo + sub-detalle
    const valX = nameX + NAMEW;        // valores (consumos y totales), alineados a la derecha
    const W = valX + M;

    // ── Detalle por equipo (para la lista del panel) ─────────────────────
    // Todos los items ordenados de arriba hacia abajo (los 0U laterales al final).
    const itemsOf = (rack) => rack.items.slice().sort((a, b) => {
      const sa = a.mount === 'side', sb = b.mount === 'side';
      if (sa !== sb) return sa ? 1 : -1;
      return (b.posU || 0) - (a.posU || 0);
    });
    // U ocupadas (posición) de un item: "U42", "U40–41" o "lat. izq/der" (0U).
    const uLabelOf = (it) => it.mount === 'side'
      ? (it.side === 'left' ? 'lat. izq' : 'lat. der')
      : (it.u === 1 ? 'U' + it.posU : 'U' + it.posU + '–' + (it.posU + it.u - 1));
    // Sub-detalle de un servidor: hasta 2 líneas (cómputo · infraestructura).
    const serverLines = (it) => {
      if (it.kind !== 'server' || !it.config) return [];
      const cfg = it.config, comp = [], infra = [];
      (cfg.cpus || []).forEach(cp => { if (cp.n) comp.push(cp.n + '× ' + t(cp.model)); });   // t(): traduce el genérico, deja pasar modelos reales
      (cfg.gpus || []).forEach(gp => { if (gp.n) comp.push(gp.n + '× ' + t(gp.model)); });
      if (cfg.base_w) infra.push(t('Chasis') + ' ' + fmtW(cfg.base_w));
      if (cfg.disks_w) infra.push(t('Discos') + ' ' + fmtW(cfg.disks_w));
      if (cfg.ram_w) infra.push('RAM ' + fmtW(cfg.ram_w));
      const lines = [];
      if (comp.length) lines.push(comp.join('   ·   '));
      if (infra.length) lines.push(infra.join('   ·   '));
      return lines;
    };
    const itemRowH = (it) => 30 + serverLines(it).length * 20;
    // Alto del panel de un rack (nombre + lista de equipos + totales). El alto de
    // la fila = max(alto del dibujo, alto del panel) → el detalle "empuja" hacia abajo.
    const panelHeightOf = (rack) => 92 + itemsOf(rack).reduce((s, it) => s + itemRowH(it), 0) + 146;
    const rowH = scaled.map(c => Math.max(RH, panelHeightOf(c.rack)));
    const H = M + HEAD + rowH.reduce((a, b) => a + b, 0) + Math.max(0, scaled.length - 1) * ROWGAP + M;

    // Ancho de salida = SS× el ancho lógico, con tope CAP (1920, Full HD). A
    // resolución completa (~2600 px) las imágenes eran enormes. Render directo a
    // esa densidad → nítido y sin lienzo intermedio gigante (mejor para iOS).
    const outW = Math.min(Math.round(W * SS), CAP);
    const s = outW / W;                        // densidad de render (px por unidad lógica)
    const cv = document.createElement('canvas');
    cv.width = Math.round(W * s); cv.height = Math.round(H * s);
    const ctx = cv.getContext('2d');
    ctx.scale(s, s);
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);   // fondo blanco (hoja de cotización)
    // Recorta con … si el texto excede maxW (según la fuente ACTUAL del ctx).
    const fitText = (s, maxW) => {
      if (ctx.measureText(s).width <= maxW) return s;
      let r = s;
      while (r.length > 1 && ctx.measureText(r + '…').width > maxW) r = r.slice(0, -1);
      return r + '…';
    };
    // Cabecera: marca "ipcore" + título + fecha.
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = FG; ctx.font = '900 30px ' + FONT;
    ctx.fillText('ipcore', M, M + 30);
    const bw = ctx.measureText('ipcore').width;
    ctx.fillStyle = FG; ctx.font = '700 20px ' + FONT;
    ctx.fillText('·  ' + t('Cotización de consumo eléctrico'), M + bw + 16, M + 29);
    const d = new Date();
    const dstr = d.toLocaleDateString(I18N.getLang() === 'en' ? 'en-GB' : 'es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillStyle = MUTE; ctx.font = '400 14px ' + FONT;
    ctx.fillText(dstr, M, M + 54);
    ctx.strokeStyle = HAIR; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(M, M + HEAD - 18); ctx.lineTo(W - M, M + HEAD - 18); ctx.stroke();
    // Fila del panel de totales: label (izq) · valor (der). kind: 'sum' | 'plan'.
    const panelRow = (by, label, val, kind) => {
      const big = kind === 'plan', mid = kind === 'sum';
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.font = (big ? '800 24px ' : mid ? '800 19px ' : '400 17px ') + FONT;
      ctx.fillStyle = big ? ACCENT : (mid ? FG : MUTE);
      ctx.fillText(label, panelX, by);
      ctx.textAlign = 'right';
      ctx.font = (big ? '800 24px ' : mid ? '800 19px ' : '700 17px ') + FONT;
      ctx.fillStyle = big ? ACCENT : FG;
      ctx.fillText(val, valX, by);
    };
    // Racks apilados.
    let y = M + HEAD;
    scaled.forEach((c, idx) => {
      const drawX = M + (rwMax - c.w) / 2;
      if (c.img) ctx.drawImage(c.img, drawX, y, c.w, RH);
      // Mapeo data→lienzo (mismo rango que el render de export: x=[-SIDE_GUTTER, W+44]).
      const xLeftD = -SIDE_GUTTER, xspanD = c.rack.widthMM + 44 - xLeftD;
      const canvasX = (dx) => drawX + c.w * (dx - xLeftD) / xspanD;
      const bayRight = (c.rack.widthMM + RACK_19_MM) / 2;   // borde derecho del frente 19"
      const cabRight = canvasX(c.rack.widthMM);              // borde derecho del armario
      const yTop = c.rack.heightU * U_MM + TOP_CAP + 24, yBot = -PLINTH - 24;
      const span = yTop - yBot;
      const canvasY = (dataY) => y + RH * (yTop - dataY) / span;

      // Nombre del rack + su alto en U (entre paréntesis, en gris).
      const nameY = y + 48;
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.fillStyle = FG; ctx.font = '800 27px ' + FONT;
      ctx.fillText(c.rack.name, panelX, nameY);
      const rnW = ctx.measureText(c.rack.name).width;
      ctx.fillStyle = MUTE; ctx.font = '400 18px ' + FONT;
      ctx.fillText('(' + c.rack.heightU + ' U)', panelX + rnW + 12, nameY);

      // Lista de equipos: U · nombre (+ sub-detalle de servidores) · consumo. La
      // línea conductora desde el rack se dibuja SÓLO para los que consumen (los
      // que aportan al Suma); los de 0 W se listan por completismo, sin línea.
      let by = nameY + 44;
      itemsOf(c.rack).forEach(it => {
        const on = it.mount === 'rail' && billedPower(it) > 0;
        if (on) {
          const iy = canvasY(uBottom(it.posU) + (it.u * U_MM) / 2);
          const x0 = canvasX(bayRight), x1 = cabRight + 22, x2 = panelX - 26, x3 = panelX;
          ctx.strokeStyle = LEAD; ctx.lineWidth = 1; ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(x0, iy); ctx.lineTo(x1, iy); ctx.lineTo(x2, by); ctx.lineTo(x3, by);
          ctx.stroke();
        }
        ctx.textBaseline = 'middle';
        // U ocupadas (posición, izq) · nombre + tamaño en U (paréntesis) · consumo.
        ctx.textAlign = 'left'; ctx.font = '400 13px ' + FONT; ctx.fillStyle = MUTE;
        ctx.fillText(uLabelOf(it), panelX, by);                                   // U ocupadas (posición)
        ctx.font = '400 16px ' + FONT; ctx.fillStyle = on ? FG : MUTE;
        const nm = fitText(t(it.name), valX - nameX - 150);
        ctx.fillText(nm, nameX, by);                                              // nombre
        const nmW = ctx.measureText(nm).width;
        ctx.font = '400 14px ' + FONT; ctx.fillStyle = MUTE;
        ctx.fillText('(' + it.u + 'U)', nameX + nmW + 8, by);                     // tamaño en U
        ctx.textAlign = 'right'; ctx.font = '700 16px ' + FONT; ctx.fillStyle = on ? FG : MUTE;
        ctx.fillText(fmtW(billedPower(it)), valX, by);                            // consumo
        serverLines(it).forEach((ln, li) => {                                     // sub-detalle
          ctx.textAlign = 'left'; ctx.font = '400 12.5px ' + FONT; ctx.fillStyle = MUTE;
          ctx.fillText(fitText(ln, valX - nameX), nameX, by + 20 + li * 20);
        });
        by += itemRowH(it);
      });

      // Sumatoria (Suma) y demás totales, debajo de la lista.
      by += 8;
      ctx.strokeStyle = HAIR; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(panelX, by); ctx.lineTo(valX, by); ctx.stroke();
      by += 24;
      panelRow(by, t('Suma'), fmtW(powerTotal(c.rack)), 'sum'); by += 34;
      panelRow(by, '+20% ' + t('margen'), fmtW(marginedPower(c.rack))); by += 30;
      ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(panelX, by); ctx.lineTo(valX, by); ctx.stroke(); by += 34;
      panelRow(by, 'Plan', fmtW(plannedPower(c.rack)), 'plan');

      y += rowH[idx];
      if (idx < scaled.length - 1) {
        y += ROWGAP / 2;
        ctx.strokeStyle = HAIR; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(M, y); ctx.lineTo(W - M, y); ctx.stroke();
        y += ROWGAP / 2;
      }
    });
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    // JPEG 0.9: comprime muchísimo los sprites fotográficos del rack; fondo sólido
    // (sin transparencia) y lo abre cualquier cliente de correo.
    cv.toBlob(blob => {
      try {
        if (!blob) return;
        if (typeof deliver === 'function') { deliver(blob); return; }  // email: se adjunta, no se descarga
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = t('cotizacion-ipcore') + '-' + d.toISOString().slice(0, 10) + '.jpg';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } finally { if (done) done(); }
    }, 'image/jpeg', 0.9);
  }
  $('#export-svg').addEventListener('click', exportRacksImage);

  // ── Enviar por mail ──────────────────────────────────────────────────
  // El mailer corre en su propio puerto (subcomando `calculadora-rack mailer`, :52525),
  // separado del SPA. Por defecto asumimos el mismo host que sirve la página;
  // se puede sobrescribir con window.CALCRACK_MAILER_URL.
  const MAILER_URL = (window.CALCRACK_MAILER_URL ||
    (location.protocol + '//' + location.hostname + ':52525')).replace(/\/$/, '');

  // Resumen en texto plano de todos los racks (va en el cuerpo del correo; la
  // imagen adjunta lleva el detalle completo).
  function quoteSummaryText() {
    const lines = [];
    let planSum = 0;
    racks.forEach((r, i) => {
      const n = r.items.length;
      lines.push(`${r.name} (${r.heightU} U) — ${n} ${n === 1 ? t('equipo') : t('equipos')}: ` +
        `${fmtW(powerTotal(r))} ${t('estimado')} · ${t('Plan')} ${fmtW(plannedPower(r))}`);
      planSum += plannedPower(r);
    });
    if (racks.length > 1) lines.push(`${t('Total de planes')}: ${fmtW(planSum)}`);
    return lines.join('\n');
  }

  // Tope del mensaje (debe coincidir con maxlength en el HTML y con maxNoteRunes
  // del mailer). El nombre/email los acota el maxlength del input.
  const NOTE_MAX = 1000;

  (function mountMailModal() {
    const modal = $('#mail-modal');
    if (!modal) return;
    const elName = $('#mm-name'), elEmail = $('#mm-email'), elNote = $('#mm-note'),
          elHoney = $('#mm-website'), elStatus = $('#mm-status'), elCount = $('#mm-note-count'),
          btnSend = $('#mm-send'), btnCancel = $('#mm-cancel'), btnClose = $('#mm-close');
    let busy = false;

    const setStatus = (msg, kind) => {
      elStatus.textContent = msg || '';
      elStatus.className = kind ? 'mm-status mm-status--' + kind : '';
    };
    const updateCount = () => { if (elCount) elCount.textContent = String((elNote.value || '').length); };
    elNote.addEventListener('input', updateCount);
    const close = () => { if (!busy) modal.hidden = true; };
    const open = () => {
      if (!racks.some(r => r.items.length)) { flash(t('Agregá al menos un equipo antes de enviar.')); return; }
      setStatus(''); busy = false; btnSend.disabled = false;
      updateCount();
      modal.hidden = false;
      setTimeout(() => elName.focus(), 30);
    };

    function send() {
      if (busy) return;
      const name = (elName.value || '').trim();
      const email = (elEmail.value || '').trim();
      const note = (elNote.value || '').trim();
      // Validación en cliente (el servidor revalida y es la frontera real).
      // Nombre y email son obligatorios (los ejecutivos necesitan saber quién
      // envía y cómo responder). maxlength en el HTML acota el largo.
      if (!name) { setStatus(t('Ingresá tu nombre.'), 'err'); elName.focus(); return; }
      if (!email) { setStatus(t('Ingresá tu email.'), 'err'); elEmail.focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatus(t('Revisá el email.'), 'err'); elEmail.focus(); return;
      }
      if (note.length > NOTE_MAX) {
        setStatus(t('El mensaje es demasiado largo.'), 'err'); elNote.focus(); return;
      }
      busy = true; btnSend.disabled = true;
      setStatus(t('Generando cotización…'), '');
      showExportSpinner(true, t('Enviando…'));

      const deliver = (blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          const payload = {
            sender_name: name,
            sender_email: email,
            note: note,
            summary: quoteSummaryText(),
            image: reader.result,          // data:image/jpeg;base64,...
            website: elHoney.value || '',  // honeypot
          };
          fetch(MAILER_URL + '/api/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
            .then(res => res.json().then(j => ({ ok: res.ok, j })).catch(() => ({ ok: res.ok, j: {} })))
            .then(({ ok, j }) => {
              showExportSpinner(false); busy = false; btnSend.disabled = false;
              if (ok && j.ok) {
                modal.hidden = true;
                flash(t('Cotización enviada. ¡Gracias!'));
                elNote.value = '';
              } else {
                setStatus((j && j.error) ? j.error : t('No se pudo enviar. Intentá de nuevo.'), 'err');
              }
            })
            .catch(() => {
              showExportSpinner(false); busy = false; btnSend.disabled = false;
              setStatus(t('No se pudo conectar con el servidor de correo.'), 'err');
            });
        };
        reader.onerror = () => {
          showExportSpinner(false); busy = false; btnSend.disabled = false;
          setStatus(t('No se pudo preparar la imagen.'), 'err');
        };
        reader.readAsDataURL(blob);
      };
      // done() sólo cubre el error de render; en el camino feliz deliver() se
      // encarga del cierre del spinner tras la respuesta del fetch.
      renderQuoteImage(deliver, () => {});
    }

    $('#send-mail').addEventListener('click', open);
    btnSend.addEventListener('click', send);
    btnCancel.addEventListener('click', close);
    btnClose.addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
  })();

  // ── Selector de idioma (ES/EN) ───────────────────────────────────────
  // Marca el botón activo, cablea el cambio y re-renderiza todo lo dinámico
  // cuando cambia el idioma (lo estático lo reescribe i18n.applyStatic).
  (function mountLangSeg() {
    const seg = $('#lang-seg');
    if (!seg) return;
    const sync = () => {
      const cur = I18N.getLang();
      seg.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('on', b.dataset.lang === cur));
    };
    seg.addEventListener('click', e => {
      const b = e.target.closest('.lang-btn'); if (!b) return;
      I18N.setLang(b.dataset.lang);
    });
    I18N.onChange(() => { sync(); render(); });
    sync();
  })();

  // ── Arranque ─────────────────────────────────────────────────────────
  I18N.applyStatic();   // traduce el HTML estático al idioma detectado/guardado
  render();
})();
