# Runbook de entrega — Mailslot

Cómo hacer el trabajo sin romper el correo del cliente. Imprimible. Cada paso tiene su comprobación.

## 0. Antes de tocar nada

- [ ] `templates/OPDRACHTBEVESTIGING.md` firmado (o aceptado por email con "akkoord"). Sin esto no se empieza.
- [ ] Informe inicial guardado: `node bin/wxs.js DOMINIO --i-am-authorized --lang nl --out clientes/DOMINIO/voor`
- [ ] Captura del resultado de `https://internet.nl/mail/DOMINIO/` (guardar la URL con el número de test).
- [ ] ¿Dónde está el DNS? `nslookup -type=ns DOMINIO` → el proveedor de los NS (TransIP, Hostinger, Strato, Versio, Cloudflare, Mijndomein, one.com…).
- [ ] ¿Quién da el correo? `nslookup -type=mx DOMINIO` → `*.mail.protection.outlook.com` = Microsoft 365 · `*.google.com` = Google Workspace · `mx1.hostinger.com` = Hostinger · etc.
- [ ] Acceso: el cliente te crea un **usuario propio** en el panel DNS, o su webbouwer aplica los cambios que tú le pasas. **Nunca** su contraseña principal por chat.
- [ ] Copia de texto de los registros TXT actuales (SPF, `_dmarc`, `_domainkey`) en `clientes/DOMINIO/notas.md`. Es tu rollback.

## 1. Inventario de remitentes (lo que hace Compleet valer €349)

Preguntar uno por uno — "¿Esto manda correo con @su-dominio?":

- Buzones: Microsoft 365 / Google Workspace / correo del hosting
- Web: formulario de contacto (WordPress manda por el servidor del hosting salvo plugin SMTP)
- Tienda: WooCommerce, Shopify, Lightspeed, CCV Shop
- Facturación/contabilidad: Moneybird, e-Boekhouden, Exact Online, SnelStart, Jortt, Informer
- Newsletter: Mailchimp, Laposta, MailBlue, Brevo
- Reservas/citas: Formitable, Zenchef, Salonized, Treatwell
- Pagos/envíos: Mollie, Sendcloud (normalmente con su propio dominio — comprobar)
- Impresora/escáner que manda a email, CRM, sistema de tickets

Cada remitente necesita **SPF include o DKIM propio alineado**. Consultar la documentación de cada proveedor ("SPF" / "DKIM" / "eigen domein") y apuntar el valor exacto en `notas.md`.

## 2. SPF

- **Un solo** registro TXT que empiece por `v=spf1` en el apex. Dos registros = SPF roto.
- Máximo **10 consultas DNS** (cada `include`, `a`, `mx` cuenta). Si se pasa, quitar lo que no manda correo.
- Valores confirmados: Microsoft 365 `include:spf.protection.outlook.com` · Google Workspace `include:_spf.google.com` · Hostinger `include:_spf.mail.hostinger.com`. Resto: documentación del proveedor.
- Empezar con `~all` si el inventario tiene dudas; `-all` cuando DMARC confirme que todo pasa.
- ✔ `nslookup -type=txt DOMINIO` muestra un único `v=spf1 … ~all|-all`.

## 3. DKIM

- **Microsoft 365:** portal de Microsoft Defender → Email & collaboration → Policies → Email authentication settings → DKIM → dominio → publicar los dos CNAME `selector1._domainkey` y `selector2._domainkey` que indica → Enable.
- **Google Workspace:** Admin console → Apps → Google Workspace → Gmail → Authenticate email → Generate new record → publicar TXT `google._domainkey` → Start authentication.
- **Hostinger:** hPanel muestra tres CNAME `hostingermail-a/b/c._domainkey`; comprobar que están en el DNS.
- **Newsletter/facturación:** cada uno tiene su propio DKIM ("domein verifiëren"). Hacerlo aquí evita problemas en el paso 5.
- ✔ `wxs` ya no muestra "Geen DKIM gevonden" (o, si el selector es propio, comprobar con `nslookup -type=txt SELECTOR._domainkey.DOMINIO`).

## 4. DMARC — fase de medida (Basis termina aquí)

```
_dmarc.DOMINIO  TXT  "v=DMARC1; p=none; rua=mailto:BUZON_INFORMES; fo=1"
```

- `BUZON_INFORMES`: dirección que te da un servicio de informes (DMARC Advisor tiene plan gratuito para 2 dominios de envío y 1.000 correos/mes) o un buzón del cliente. Si el buzón está en **otro** dominio, ese dominio debe publicar la autorización de informes externos (el servicio lo indica).
- ✔ `wxs` muestra DMARC con `p=none` y **sin** hallazgo "zonder rapportadres".
- **Basis:** entrega aquí (paso 6).

## 5. DMARC — a `reject` (Compleet)

- Semana 1–2: leer informes. Cada IP/servicio que envía con el dominio debe pasar SPF **o** DKIM **alineado**. Lo que falla y es legítimo → volver al paso 1–3 para ese remitente.
- Cuando 2 semanas seguidas todo lo legítimo pasa: `p=quarantine; pct=25` → a la semana `pct=100`.
- Una semana sin quejas: `p=reject`. Cerrar SPF con `-all`.
- ✔ internet.nl → "Echtheidsmerken tegen phishing (DMARC, DKIM en SPF)" en verde.

**Rollback:** si un correo legítimo deja de llegar, volver DMARC a `p=none` (5 minutos, efecto en el TTL del registro) y arreglar el remitente. Por eso se guarda `notas.md`.

## 6. Entrega y cobro

```bash
node bin/wxs.js DOMINIO --i-am-authorized --lang nl --out clientes/DOMINIO/na
node bin/wxs.js compare clientes/DOMINIO/voor/DOMINIO.json clientes/DOMINIO/na/DOMINIO.json --lang nl --out clientes/DOMINIO
```

- Enviar: `DOMINIO.oplevering.html` (o PDF con Ctrl+P) + enlace del nuevo test internet.nl + factura.
- Ofrecer Wachter en la misma frase: "Wilt u dat ik elke maand even meekijk? €15 per maand, maandelijks opzegbaar."
- Pedir: una recomendación (Google review o nombre de otro negocio). Es el canal de adquisición más barato que existe.

### Factura (requisitos NL mínimos — verificar con la Belastingdienst)
Nombre y dirección de ambas partes · número de factura correlativo · fecha · número KvK · número de IVA (btw-id) o, si se aplica la KOR, la mención de exención · descripción ("Mailslot Compleet — DOMINIO") · importe sin IVA, IVA y total · plazo de pago (14 días) · IBAN.

## 7. Carpeta de cliente (fuera de git)

```
clientes/DOMINIO/
  opdrachtbevestiging.pdf
  notas.md            # registros antes/después, remitentes, accesos concedidos (sin contraseñas)
  voor/  na/          # salidas de wxs
  DOMINIO.oplevering.html
```

`clientes/` no se sube nunca a GitHub (está en `.gitignore`).
