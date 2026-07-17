// i18n.js — internacionalización mínima ES/EN para toda la interfaz.
//
// Modelo: la CLAVE de traducción es el propio texto en español (el idioma
// original). Por eso `t('Exportar')` en español devuelve 'Exportar' tal cual, y
// en inglés busca en el diccionario `EN`. Si una clave falta en EN, cae al
// español (nunca se rompe). Interpolación con `{var}`: `t('Hola {n}', {n: 3})`.
//
// Detección: si hay preferencia guardada (localStorage `calcrack_lang`) se usa;
// si no, se mira el idioma del navegador → español si empieza por "es", inglés
// en cualquier otro caso. Dos idiomas: 'es' (actual) y 'en'.
//
// Estático (HTML): elementos con `data-i18n` (texto), `data-i18n-title`,
// `data-i18n-aria` (aria-label) y `data-i18n-ph` (placeholder). El valor del
// atributo es el texto español = la clave. applyStatic() los reescribe.
// Dinámico (JS): rack.js llama a CALCRACK_I18N.t(...) y se re-renderiza en cada
// cambio de idioma (CALCRACK_I18N.onChange).
window.CALCRACK_I18N = (function () {
  // ── Diccionario EN (clave = texto español) ────────────────────────────
  const EN = {
    // Título de la página (pestaña del navegador)
    'Calculadora de consumo eléctrico': 'Power calculator',

    // Exportar (imagen de cotización)
    'Cotización de consumo eléctrico': 'Power consumption quote',
    'Estimado': 'Estimated',
    'Exportando…': 'Exporting…',
    'cotizacion-ipcore': 'ipcore-power-quote',   // base del nombre del archivo descargado
    'CPU genérica': 'Generic CPU',
    'GPU genérica': 'Generic GPU',
    'Chasis': 'Chassis',
    '{type} Genérico': 'Generic {type}',   // nombre por defecto de switch/router genérico

    // Carga / cabecera
    'Cargando…': 'Loading…',
    'Calcula la potencia eléctrica óptima para contratar tu rack.':
      'Work out the optimal power draw to provision your rack.',
    'Guía': 'Guide',
    'Guía rápida': 'Quick guide',
    'Descargar el plano como imagen': 'Download the layout as an image',
    'Exportar': 'Export',
    'Disponible próximamente — envío por correo del PDF': 'Coming soon — email the PDF',
    'Enviar por mail': 'Send by email',
    'Enviar la cotización por correo a los ejecutivos de IPcore': 'Email the quote to IPcore sales',

    // Modal "Enviar por mail"
    'Enviar cotización por mail': 'Email quote',
    'Se enviará la cotización (imagen con todos los racks) a nuestros ejecutivos.':
      'The quote (an image with all racks) will be sent to our sales team.',
    'Tu nombre': 'Your name',
    'Tu email (para que te respondan)': 'Your email (so they can reply)',
    'Mensaje (opcional)': 'Message (optional)',
    'Enviar': 'Send',
    'Agregá al menos un equipo antes de enviar.': 'Add at least one item before sending.',
    'Ingresá tu nombre.': 'Please enter your name.',
    'Ingresá tu email.': 'Please enter your email.',
    'Revisá el email.': 'Please check the email address.',
    'El mensaje es demasiado largo.': 'The message is too long.',
    'Generando cotización…': 'Building quote…',
    'Enviando…': 'Sending…',
    'Cotización enviada. ¡Gracias!': 'Quote sent. Thank you!',
    'No se pudo enviar. Intentá de nuevo.': 'Could not send. Please try again.',
    'No se pudo conectar con el servidor de correo.': 'Could not reach the mail server.',
    'No se pudo preparar la imagen.': 'Could not prepare the image.',
    'equipo': 'item',
    'equipos': 'items',
    'estimado': 'estimated',
    'Total de planes': 'Total of plans',

    // Barra de añadir
    'Añadir equipos': 'Add equipment',
    'Crear un rack nuevo (vacío)': 'Create a new (empty) rack',
    'Rack': 'Rack',
    'Host': 'Host',
    'Switch': 'Switch',
    'Cabina de discos': 'Disk array',
    'Cabina': 'Array',
    'Más': 'More',

    // Cabecera del rack / navegación
    'Cambiar de rack': 'Switch rack',
    'Rack anterior': 'Previous rack',
    'Rack siguiente': 'Next rack',
    'Doble clic para renombrar': 'Double-click to rename',
    'Ajustes del rack activo': 'Active rack settings',
    'Ampliar': 'Zoom in',
    'Ampliar (seguir el equipo)': 'Zoom in (follow the item)',

    // Selector "Más equipos"
    'Más equipos': 'More equipment',
    'Cerrar': 'Close',
    'Equipos': 'Equipment',
    'Router': 'Router',
    'catálogo · consumo': 'catalog · power',
    'Firewall': 'Firewall',
    'consumo editable': 'editable power',
    'Infraestructura': 'Infrastructure',
    '(sin consumo)': '(no power)',

    // Asistente "Nuevo servidor"
    'Nuevo servidor': 'New server',
    'CPUs': 'CPUs',
    'GPUs': 'GPUs',
    'Resumen': 'Summary',
    'Procesadores': 'Processors',
    'Por defecto, un servidor de doble zócalo con CPU de gama datacenter. Ajusta si hace falta.':
      'By default, a dual-socket server with a datacenter-grade CPU. Adjust if needed.',
    'Modelo': 'Model',
    'Cantidad': 'Quantity',
    'Consumo por CPU (W)': 'Power per CPU (W)',
    'Subtotal CPUs': 'CPU subtotal',
    'Aceleradores / GPUs': 'Accelerators / GPUs',
    'La mayoría de servidores no llevan GPU. Deja la cantidad en 0 si no aplica.':
      'Most servers have no GPU. Leave the quantity at 0 if not applicable.',
    'Consumo por GPU (W)': 'Power per GPU (W)',
    'Subtotal GPUs': 'GPU subtotal',
    'Revisa el nombre, el tamaño y el resto del equipamiento antes de añadirlo.':
      'Review the name, size and the rest of the gear before adding it.',
    'Nombre': 'Name',
    'Tamaño (U)': 'Size (U)',
    'Consumo del chasis (placa, ventilación) sin CPU/GPU/discos/RAM':
      'Chassis power (board, fans) without CPU/GPU/disks/RAM',
    'Consumo base del chasis (W)': 'Base chassis power (W)',
    '~5 W por disco (SSD generalista); un HDD 3,5" sería más. Se cuenta el tope del bloque':
      '~5 W per disk (mainstream SSD); a 3.5" HDD would be more. The block\'s upper bound is counted',
    'Discos (~5 W c/u)': 'Disks (~5 W each)',
    'Sin discos': 'No disks',
    'Estimado ~0,16 W por GB (DDR4 RDIMM en carga típica)':
      'Estimated ~0.16 W per GB (DDR4 RDIMM at typical load)',
    'Memoria (RAM)': 'Memory (RAM)',
    'Sin declarar': 'Not specified',
    'Consumo estimado': 'Estimated power',
    'Atrás': 'Back',
    'Continuar': 'Continue',
    'Añadir al rack': 'Add to rack',

    // Modal "Nuevo rack"
    'Nuevo rack': 'New rack',
    'Ancho del armario': 'Cabinet width',
    'Ancho': 'Width',
    'Cancelar': 'Cancel',
    'Crear rack': 'Create rack',

    // Modal switch/router/…
    'Añadir switch': 'Add switch',
    'Consumo (W)': 'Power (W)',
    'Consumo:': 'Power:',

    // ── Cadenas dinámicas (rack.js) ──────────────────────────────────────
    // Avisos (toast)
    'No cabe un equipo de {u}U hacia abajo desde U{tu}.':
      'A {u}U item does not fit downward from U{tu}.',
    'No hay {u}U libres contiguas en el rack.':
      'No {u}U of contiguous free space in the rack.',
    'Supera el tope de {kw} kW por rack (el Plan quedaría en {plan}).':
      'Exceeds the {kw} kW per-rack cap (Plan would be {plan}).',
    'El PDU vertical (0U) requiere armario de 800 mm.':
      'The vertical PDU (0U) requires an 800 mm cabinet.',
    'Ambos canales laterales ya tienen un PDU vertical.':
      'Both side channels already have a vertical PDU.',
    'Ambos canales laterales ya están ocupados.':
      'Both side channels are already occupied.',
    'No hay {u}U libres para clonar "{name}".':
      'No {u}U free to clone "{name}".',
    'Tiene que quedar al menos un rack.': 'At least one rack must remain.',
    'Se quitaron {n} equipo(s) que ya no entran.':
      'Removed {n} item(s) that no longer fit.',
    'Envío por correo: próximamente.': 'Email sending: coming soon.',
    'Nombre del rack:': 'Rack name:',

    // Cabecera / stats
    '{name} — {i} / {n} (doble clic para renombrar)':
      '{name} — {i} / {n} (double-click to rename)',
    'est.': 'est.',
    'margen': 'margin',
    'Plan del rack = consumo estimado en pared × (1 + {pct}% de margen de seguridad), redondeado hacia arriba al próximo múltiplo de {step} W. Debe ser ≤ {cap} kW por rack.':
      'Rack Plan = estimated wall power × (1 + {pct}% safety margin), rounded up to the next multiple of {step} W. Must be ≤ {cap} kW per rack.',
    ' ⚠ Este rack ({plan}) supera el máximo de {cap} kW por rack.':
      ' ⚠ This rack ({plan}) exceeds the {cap} kW per-rack maximum.',
    'Consumo estimado en pared + {pct}% de margen de seguridad (antes de redondear). Se redondea ↑ a múltiplos de {step} W para el Plan.':
      'Estimated wall power + {pct}% safety margin (before rounding). Rounded ↑ to multiples of {step} W for the Plan.',
    'Suma': 'Sum',

    // Lista de equipos / rack
    'Rack vacío. Elige equipos del catálogo.': 'Empty rack. Pick equipment from the catalog.',
    'usadas de {h} U': 'used of {h} U',
    'Arrastrar para mover': 'Drag to move',
    'Clonar': 'Clone',
    'Quitar': 'Remove',
    'Clonar {name}': 'Clone {name}',
    'Quitar {name}': 'Remove {name}',
    'Editar {name}': 'Edit {name}',
    'Editar servidor': 'Edit server',
    'Editar {label}': 'Edit {label}',
    'U{u} · libre — haz clic: la parte superior del equipo va aquí y se rellena hacia abajo':
      'U{u} · free — click: the top of the item goes here and fills downward',

    // Ajustes del rack (⚙)
    'Ajustes del rack': 'Rack settings',
    'Alto': 'Height',
    '✎ Renombrar rack': '✎ Rename rack',
    '⧉ Clonar rack': '⧉ Clone rack',
    'Vaciar rack': 'Empty rack',
    '✕ Quitar rack': '✕ Remove rack',

    // Vista CAD / Realista
    'CAD': 'CAD',
    'Realista': 'Realistic',

    // Recap del asistente
    'Chasis (base)': 'Chassis (base)',
    'Discos': 'Disks',
    'RAM': 'RAM',

    // Selector de componentes / dispositivos
    'Genérico (consumo editable)': 'Generic (editable power)',
    'Otros (editable)': 'Other (editable)',
    'NVIDIA GeForce': 'NVIDIA GeForce',
    'NVIDIA workstation': 'NVIDIA workstation',
    'NVIDIA data center': 'NVIDIA data center',
    'Añadir {label}': 'Add {label}',
    'switch': 'switch',
    'router': 'router',
    'firewall': 'firewall',
    'cabina de discos': 'disk array',

    // KIND names (nombre por defecto del equipo)
    'Servidor': 'Server',

    // Catálogo (nombres visibles)
    'UPS 2U': 'UPS 2U',
    'UPS 3U': 'UPS 3U',
    'PDU horizontal': 'Horizontal PDU',
    'PDU vertical (0U)': 'Vertical PDU (0U)',
    'Patch Panel 24p': 'Patch Panel 24p',
    'Patch Panel 48p': 'Patch Panel 48p',
    'ODF / Bandeja FO': 'ODF / Fiber tray',
    'Organizador 1U': 'Cable manager 1U',
    'Organizador 2U': 'Cable manager 2U',
    'Consola KVM': 'KVM console',
    'Bandeja': 'Shelf',
    'Panel ciego 1U': 'Blanking panel 1U',
    'Panel ciego 2U': 'Blanking panel 2U',
    '0U · lateral': '0U · side',
    ' · requiere 800 mm': ' · requires 800 mm',

    // Notas de catálogo (tooltip de cada pieza)
    'UPS rackeable, 2U': 'Rack-mount UPS, 2U',
    'UPS rackeable, 3U': 'Rack-mount UPS, 3U',
    'Regleta PDU horizontal, 1U': 'Horizontal PDU strip, 1U',
    'PDU vertical en canal lateral — requiere armario de 800 mm':
      'Vertical PDU in the side channel — requires an 800 mm cabinet',
    'Patch panel cobre 24 puertos, 1U': 'Copper patch panel, 24 ports, 1U',
    'Patch panel cobre 48 puertos, 2U': 'Copper patch panel, 48 ports, 2U',
    'Distribuidor de fibra óptica, 1U': 'Fiber-optic distributor, 1U',
    'Organizador horizontal de cable, 1U': 'Horizontal cable manager, 1U',
    'Organizador horizontal de cable, 2U': 'Horizontal cable manager, 2U',
    'Cajón consola/KVM con teclado, 1U': 'Console/KVM drawer with keyboard, 1U',
    'Bandeja fija para equipo no rackeable, 1U': 'Fixed shelf for non-rack gear, 1U',
    'Panel ciego (flujo de aire), 1U': 'Blanking panel (airflow), 1U',
    'Panel ciego (flujo de aire), 2U': 'Blanking panel (airflow), 2U',

    // Acciones de la lista de contenido
    'Subir': 'Move up',
    'Bajar': 'Move down',

    // Tour / guía
    '¡Bienvenido! 👋': 'Welcome! 👋',
    'Monta y presupuesta un rack IPcore en menos de un minuto. Todos los controles viven en la barra de abajo. Te muestro lo esencial — puedes omitir la guía cuando quieras.':
      'Build and quote an IPcore rack in under a minute. All the controls live in the bottom bar. Here are the essentials — you can skip the guide whenever you like.',
    'El botón «＋ Rack» (arriba/izquierda, con borde verde) crea un armario nuevo vacío. Los de al lado añaden equipos al rack actual: Host, Switch, Cabina y «Más» (Router, Firewall e Infraestructura).':
      'The “＋ Rack” button (top/left, green border) creates a new empty cabinet. The ones beside it add equipment to the current rack: Host, Switch, Array and “More” (Router, Firewall and Infrastructure).',
    'Cada equipo, en el dibujo': 'Every item, in the drawing',
    'Toca un equipo para seleccionarlo. Con el asa ⠿ lo mueves, con ⧉ lo clonas y con ✕ lo quitas. También puedes arrastrarlo a otra U.':
      'Tap an item to select it. Use the ⠿ handle to move it, ⧉ to clone it and ✕ to remove it. You can also drag it to another U.',
    'En «⚙» cambias el ancho del armario (60 / 80 cm) y el alto, clonas el rack actual o lo vacías.':
      'In “⚙” you change the cabinet width (60 / 80 cm) and height, clone the current rack or empty it.',
    'Consumo y Plan': 'Power and Plan',
    'Arriba, sólo lectura: consumo estimado, +margen de seguridad y el «Plan» (redondeado, con tope de 5 kW por rack). El «?» explica cada valor.':
      'At the top, read-only: estimated power, +safety margin and the “Plan” (rounded, capped at 5 kW per rack). The “?” explains each value.',
    'Varios racks': 'Multiple racks',
    'Con «‹ ›» cambias de armario y con doble clic en el nombre lo renombras. Para crear uno nuevo usa «＋ Rack»; para clonarlo o quitarlo, «⚙».':
      'Use “‹ ›” to switch cabinet and double-click the name to rename it. To create a new one use “＋ Rack”; to clone or remove it, “⚙”.',
    'Exporta el plano': 'Export the layout',
    'Cuando termines, descarga el plano del rack como imagen para presupuestar o documentar.':
      'When you\'re done, download the rack layout as an image to quote or document it.',
    'Saltar': 'Skip',
    'Siguiente': 'Next',
    'Listo': 'Done',
  };

  const DICT = { en: EN };

  function detect() {
    try {
      const s = localStorage.getItem('calcrack_lang');
      if (s === 'es' || s === 'en') return s;
    } catch (e) { /* localStorage no disponible */ }
    const n = (navigator.language || navigator.userLanguage || 'es').toLowerCase();
    return n.indexOf('es') === 0 ? 'es' : 'en';
  }

  let lang = detect();
  const listeners = [];

  function interp(str, vars) {
    if (!vars) return str;
    return str.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  }
  function t(s, vars) {
    const table = DICT[lang];
    const out = (table && table[s] != null) ? table[s] : s;
    return interp(out, vars);
  }

  function applyStatic(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.getAttribute('data-i18n')); });
    root.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.getAttribute('data-i18n-title')); });
    root.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'))); });
    root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.getAttribute('data-i18n-ph')); });
  }

  function setLang(l) {
    if (l !== 'es' && l !== 'en') return;
    lang = l;
    try { localStorage.setItem('calcrack_lang', l); } catch (e) { /* ignore */ }
    document.documentElement.lang = l;
    applyStatic();
    listeners.forEach(fn => { try { fn(l); } catch (e) { /* aislar */ } });
  }

  function onChange(fn) { listeners.push(fn); }
  function getLang() { return lang; }

  // Idioma inicial en <html lang> lo antes posible.
  try { document.documentElement.lang = lang; } catch (e) { /* ignore */ }

  return { t, setLang, getLang, onChange, applyStatic };
})();
