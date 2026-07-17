# calculadora-rack

Calculadora de consumo eléctrico y configurador de rack de IPcore. Se arma uno o
varios racks 19" con equipamiento de un catálogo (servidores con CPU/GPU/discos/
RAM, switches, routers, firewalls, cabinas de disco e infraestructura pasiva) y
la app estima el **consumo eléctrico en pared** y la **potencia a contratar**
(Plan en kW). El armado se exporta como imagen de cotización.

Interfaz **bilingüe ES/EN** (auto-detecta el idioma del navegador; selector en el
topbar). Sin base de datos: el estado del rack vive en memoria del navegador.

## Stack

Frontend **estático**: HTML + JS + [Plotly.js](https://plotly.com/javascript/)
(vendorizado). Sin build step ni dependencias más allá de Plotly. Se sirve como
contenido estático — cualquier servidor de archivos alcanza.

## Modelo del rack (EIA-310)

- `1U = 44.45 mm`; panel de montaje 19" = `482.6 mm`.
- Ancho del armario: **600 mm** u **800 mm**. El de 800 mm deja canales laterales
  para PDUs verticales (0U), que en 600 mm no entran.
- Los equipos de riel ocupan un rango contiguo de U; al insertarlos van a la
  primera ranura libre más baja que los aloje.

El catálogo y la base de modelos con consumo (archivos JS/JSON) son editables; el
render no asume un set cerrado.
