# Mailslot — producto

> **Una frase (NL):** "Wij zorgen dat niemand meer e-mail kan versturen die lijkt alsof hij van uw bedrijf komt — vaste prijs, binnen een week geregeld, en u kunt het zelf controleren op internet.nl."
>
> **Una frase (ES):** Cerramos tu dominio para que nadie pueda mandar correos que parezcan tuyos. Precio cerrado, en una semana, y lo compruebas tú mismo en internet.nl.

## Qué problema resolvemos

Cualquiera puede enviar un email con `factuur@tuempresa.nl` como remitente. Si el dominio no tiene SPF, DKIM y DMARC bien configurados, los servidores que lo reciben no tienen instrucción para rechazarlo. Eso es lo que hace posibles las facturas falsas "en tu nombre" a tus clientes y el fraude del director a tu administración.

Los tres registros no cuestan licencia. Lo que cuesta es **saber hacerlo sin romper el correo legítimo** (la tienda online, el programa de facturación y el boletín también mandan correo en tu nombre) y **llevarlo hasta `p=reject`**, que es donde deja de ser papel y empieza a proteger. La mayoría se queda en `p=none` para siempre.

## Qué recibe el cliente

| Paso | Entregable |
|---|---|
| 1. Control gratuito | Informe de 1 página en neerlandés con lo que se ve desde fuera + enlace a su test de internet.nl |
| 2. Trabajo | SPF correcto, DKIM activado, DMARC con informes y, en Compleet, subida gradual a `p=reject` |
| 3. Entrega | **Opleverrapport** antes/después (`wxs compare`) + test de internet.nl en verde para "authenticity marks" |
| 4. Opcional | Wachter: re-test mensual y aviso si algo cambia |

## Paquetes (precios en [PRICING.md](PRICING.md), fuente única: `src/report/offer.js`)

- **Domeinslot** — dominio sin correo: SPF `-all` + DMARC `reject`. 15 minutos de trabajo.
- **Mailslot Basis** — base correcta + informes, 1 día laborable.
- **Mailslot Compleet** — inventario de remitentes + 4 semanas de informes + `p=reject` + entrega. **La oferta principal.**
- **Website-beveiliging** — redirección HTTPS y cabeceras, precio según hosting.
- **Wachter** — mensual.

## Por qué nosotros y no otro

| Alternativa | Qué hace | Qué no hace |
|---|---|---|
| internet.nl (gratis) | Mide. Es la referencia oficial NL. | No arregla nada. Lo usamos **a favor**: es nuestra prueba. |
| DMARC Advisor, EasyDMARC, PowerDMARC | Software de informes (desde €0–19/mes) | Alguien tiene que leer los informes y cambiar el DNS. |
| Webbouwer / IT-partner habitual | Puede hacerlo | Suele no hacerlo si nadie lo pide; se queda en `p=none`. |
| Nosotros | Hacemos el cambio, precio cerrado, entrega con prueba verificable por un tercero | No somos un SOC ni un pentest. |

## Motor técnico

`web-exposure-scan` (este repo): comprobaciones pasivas (DNS público, un handshake TLS, un GET HTTPS y otro HTTP), informes NL/EN/ES, informe de entrega antes/después. Cero dependencias, Node ≥18. Ver [QUICKSTART.md](QUICKSTART.md).

## Lo que NO es

No es un pentest, no es una certificación, no es "cumplimiento AVG/GDPR", no evita todo phishing (un dominio parecido tipo `tuempresa-nl.com` no se para con DMARC). Ver [LIMITATIONS.md](LIMITATIONS.md). Decirlo en voz alta es parte de la venta.
