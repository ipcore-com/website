// catalog.js — catálogo predefinido de equipamiento IPcore para el rack.
//
// Cada entrada modela un equipo de montaje 19" (EIA-310). Campos:
//   id       — slug estable (no se muestra; sirve de clave).
//   name     — etiqueta visible en el menú y dentro del rack.
//   group    — categoría para agrupar el menú.
//   u        — alto en unidades de rack (U). 0U = montaje vertical lateral.
//   color    — relleno del equipo en el dibujo (paleta slate IPcore).
//   mount    — 'rail' (montado en los rieles 19", default) | 'side' (canal
//              lateral de gestión, solo disponible en armario de 800 mm).
//   power_w  — consumo estimado (W) del equipo para el cálculo del rack. La
//              "Infraestructura" (UPS/PDU + pasivos: patch, ODF, organizador,
//              bandeja, ciego, KVM) es 0: no aporta carga al rack. Los
//              servidores configurables se arman desde "+ Servidor" (consumo
//              real por CPU/GPU); los del catálogo son presets con un default.
//   note     — descripción corta para el tooltip del menú.
//
// Las alturas son las típicas de cada equipo en la vida real. Ajustá los
// valores o agregá entradas — el render no asume un catálogo cerrado, solo
// lee estos campos.
window.CALCRACK_CATALOG = [
  // Servidores, switch, router y firewall se arman desde "Añadir" (consumo por
  // componentes / modelo). Un storage/JBOD = un servidor con muchos discos
  // (base + bloque de discos, sin CPU/GPU) → no va como item de catálogo.

  // ── Infraestructura (no aporta consumo al rack → 0 W) ───────────────────
  // Energía (UPS/PDU: distribuyen, no son carga IT) + pasivos (patch, ODF,
  // organizador, KVM, bandeja, ciego). Todo bajo un lema común porque su
  // power_w es 0 y no suma al consumo del rack.
  { id: 'ups-2u',    name: 'UPS 2U',            group: 'Infraestructura', u: 2, color: '#ca8a04', mount: 'rail', kind: 'ups',   power_w: 0, note: 'UPS rackeable, 2U' },
  { id: 'ups-3u',    name: 'UPS 3U',            group: 'Infraestructura', u: 3, color: '#a16207', mount: 'rail', kind: 'ups',   power_w: 0, note: 'UPS rackeable, 3U' },
  { id: 'pdu-1u',    name: 'PDU horizontal',    group: 'Infraestructura', u: 1, color: '#16a34a', mount: 'rail', kind: 'pdu',   power_w: 0, note: 'Regleta PDU horizontal, 1U' },
  { id: 'pdu-0u',    name: 'PDU vertical (0U)', group: 'Infraestructura', u: 0, color: '#15803d', mount: 'side', kind: 'pduv',  power_w: 0, note: 'PDU vertical en canal lateral — requiere armario de 800 mm' },
  { id: 'patch-1u',  name: 'Patch Panel 24p',   group: 'Infraestructura', u: 1, color: '#64748b', mount: 'rail', kind: 'patch', power_w: 0, note: 'Patch panel cobre 24 puertos, 1U' },
  { id: 'patch-2u',  name: 'Patch Panel 48p',   group: 'Infraestructura', u: 2, color: '#52606d', mount: 'rail', kind: 'patch', power_w: 0, note: 'Patch panel cobre 48 puertos, 2U' },
  { id: 'odf',       name: 'ODF / Bandeja FO',  group: 'Infraestructura', u: 1, color: '#0891b2', mount: 'rail', kind: 'fiber', power_w: 0, note: 'Distribuidor de fibra óptica, 1U' },
  { id: 'cable-1u',  name: 'Organizador 1U',    group: 'Infraestructura', u: 1, color: '#94a3b8', mount: 'rail', kind: 'cable', power_w: 0, note: 'Organizador horizontal de cable, 1U' },
  { id: 'cable-2u',  name: 'Organizador 2U',    group: 'Infraestructura', u: 2, color: '#94a3b8', mount: 'rail', kind: 'cable', power_w: 0, note: 'Organizador horizontal de cable, 2U' },
  { id: 'kvm',       name: 'Consola KVM',       group: 'Infraestructura', u: 1, color: '#db2777', mount: 'rail', kind: 'kvm',   power_w: 0, note: 'Cajón consola/KVM con teclado, 1U' },
  { id: 'shelf',     name: 'Bandeja',           group: 'Infraestructura', u: 1, color: '#78716c', mount: 'rail', kind: 'shelf', power_w: 0, note: 'Bandeja fija para equipo no rackeable, 1U' },
  { id: 'blank-1u',  name: 'Panel ciego 1U',    group: 'Infraestructura', u: 1, color: '#cbd5e1', mount: 'rail', kind: 'blank', power_w: 0, note: 'Panel ciego (flujo de aire), 1U' },
  { id: 'blank-2u',  name: 'Panel ciego 2U',    group: 'Infraestructura', u: 2, color: '#cbd5e1', mount: 'rail', kind: 'blank', power_w: 0, note: 'Panel ciego (flujo de aire), 2U' },
];
