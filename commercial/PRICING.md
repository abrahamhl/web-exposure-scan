# Precios

Todos los importes en EUR **sin IVA (excl. btw)**. Fuente única: `src/report/offer.js` (lo que ve el cliente en el informe sale de ahí; si cambias un precio, cámbialo allí).

| Paquete | Precio | Tiempo real estimado | Para quién |
|---|---|---|---|
| **Gratis: controle** | €0 | 10 min | Todos. Es la puerta, no un producto. |
| **Domeinslot** | €49 por dominio | 15–30 min | Dominios sin correo (marcas, dominios viejos, `.com` de un `.nl`) |
| **Mailslot Basis** | €149 | 1,5–2 h | Autónomo / 1–5 empleados que solo quiere "que esté bien" |
| **Mailslot Compleet** ⭐ | €349 | 4–6 h repartidas en 4 semanas | Negocio con tienda online, facturación por email o varios remitentes |
| **Website-beveiliging** | desde €149 (cerrado antes de empezar) | 1–3 h | Si el informe muestra fallos de HTTPS/cabeceras |
| **Wachter** | €15/mes por dominio | 10–15 min/mes | Tras Basis o Compleet. Cancelable mensual. |
| **Webbouwer-partner** | €99 por dominio desde 5 dominios | — | Agencias que gestionan dominios de clientes (ver LEAD_STRATEGY) |

## Por qué estos números (evidencia, no intuición)

- Una guía NL para MKB estima **4–8 horas** de trabajo único para 1–2 dominios y **€5–20/mes** en un servicio de informes DMARC ([digitaalgezag.nl](https://digitaalgezag.nl/e-mailbeveiliging/), consultado 2026-09-26). Compleet a €349 por ~5 h ≈ **€70/h**: por debajo de una tarifa IT NL habitual, adecuado para alguien sin cartera de clientes aún.
- DMARC Advisor (NL) cobra **€19/mes** su plan Basic solo por el software de informes, y tiene plan gratuito para 2 dominios y 1.000 correos/mes ([dmarcadvisor.com/nl/prijzen](https://dmarcadvisor.com/nl/prijzen/), consultado 2026-09-26). Wachter a €15/mes con una persona detrás es comparable y comprensible.
- ARGUS (`SERVICE_PRICING.md`) propone €195–495 por lo mismo. **Recomendación:** unificar en €149 / €349. Un precio de €495 por "cambiar un registro" es la objeción más fácil de ganar para un webbouwer que ya está en la tienda.

## Reglas

1. **Precio cerrado antes de empezar.** Nunca por horas con un negocio pequeño.
2. **Pago:** Basis y Domeinslot al entregar. Compleet: 50% al empezar, 50% con el opleverrapport. Plazo 14 días.
3. **Descuento solo por volumen** (varios dominios, o partner). Nunca por regatear: en su lugar, bajar a Basis.
4. **IVA:** si Abraham está en la KOR (kleineondernemersregeling, umbral €20.000/año) factura sin IVA con la mención legal; si no, 21%. Confirmar antes de la primera factura (ver OVERNIGHT_EXECUTIVE_REPORT → bloqueos).

## Lo que no se vende

- "Certificados" de seguridad o cumplimiento.
- Informes sobre dominios de terceros que no lo han pedido, enviados sin conversación previa.
- Horas sueltas de "soporte informático".
