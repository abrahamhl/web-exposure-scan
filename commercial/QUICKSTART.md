# Quickstart

Requisitos: **Node.js 18+**. Nada más (cero dependencias). Probado en Windows 11 con Node 22.

```bash
git clone https://github.com/abrahamhl/web-exposure-scan.git
cd web-exposure-scan
npm test          # 18 tests, sin red
npm run demo      # informes de ejemplo en examples/demo/ (sin red, empresa ficticia)
```

Abre `examples/demo/report.nl.html` y `examples/demo/handover.nl.html` en el navegador.

## Uso real

```bash
# 1. Control de un dominio propio o de un cliente que lo ha pedido
node bin/wxs.js <domein.nl> --i-am-authorized --lang nl

# 2. Tras hacer el trabajo: re-test a otra carpeta
node bin/wxs.js <domein.nl> --i-am-authorized --lang nl --out after

# 3. Informe de entrega (antes/después)
node bin/wxs.js compare out/<domein.nl>.json after/<domein.nl>.json --lang nl --out oplevering
```

Imprimir a PDF: abrir el `.html` → Ctrl+P → "Guardar como PDF". El CSS de impresión ya está.

## Opciones útiles

| Opción | Para qué |
|---|---|
| `--lang nl\|en\|es` | Idioma del informe al cliente |
| `--contact "Abraham · 06-… · auxdesign.nl"` | Línea de contacto al pie |
| `--no-offer` | Informe sin precios (p. ej. para un webbouwer-partner) |
| `--offer-file mis-precios.json` | Sobrescribir paquetes sin tocar el código |
| `--file dominios.txt` | Lote (uno por línea, `#` para comentarios) |
| `--json` | Solo JSON (para integrar con ARGUS u hojas de cálculo) |

## Códigos de salida

`0` ok · `1` nada se pudo escanear (red) · `2` uso incorrecto · `3` falta `--i-am-authorized`.

## Si algo sale raro

- **"INCONCLUSIVE"**: tu red no resuelve DNS (wifi de hotel, VPN corporativa). Cambia de red. El escáner se niega a emitir un informe falso.
- **"SPF no verificable"**: la red truncó el DNS. No se afirma nada; repite desde otra red o usa internet.nl.
- **Siempre** contrasta con `https://internet.nl/mail/<dominio>/` antes de enseñar un hallazgo a un cliente.
