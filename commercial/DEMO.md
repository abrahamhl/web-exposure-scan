# Demo

Tres demos, de la más rápida a la más completa. Ninguna necesita escanear a un tercero.

## A. En la tienda — 2 minutos, en el móvil del dueño

1. `https://internet.nl` → "Test uw e-mail" → su dominio.
2. Mientras carga (1–2 min), preguntar qué sistemas mandan correo en su nombre.
3. Señalar **solo** el bloque "Echtheidsmerken tegen phishing (DMARC, DKIM en SPF)".
4. Enseñar en tu móvil `examples/demo/handover.nl.html` (empresa ficticia): "Así queda cuando termino: 62 → 3, y su test de internet.nl en verde."

## B. En portátil / Chromebook — offline, sin red

```bash
npm run demo
```
Abre `examples/demo/report.nl.html` (lo que el cliente recibe primero) y `examples/demo/handover.nl.html` (lo que cierra el trabajo). Empresa ficticia en el TLD reservado `.example`.

## C. En vivo con un dominio autorizado

Con **auxdesign.nl** (propio), una vez arreglado, sirve como prueba de "yo lo aplico en mi casa":

```bash
node bin/wxs.js auxdesign.nl --i-am-authorized --lang nl
```

Salida real el 2026-09-26 (antes de arreglarlo): puntuación 22, 4 hallazgos — SPF `~all`, DMARC `p=none`, DMARC sin `rua`, sin CAA. internet.nl: **76%**. Arreglar esto es la acción nº1 de mañana: nadie compra seguridad de correo a quien tiene el correo en amarillo.

## Qué NO hacer en una demo

- Escanear en directo el dominio de otro negocio que no te lo ha pedido.
- Enseñar informes de ARGUS de otros negocios a un prospecto.
- Abrir con la puntuación. Abrir con la pregunta: "¿Quién manda correo en su nombre?"
