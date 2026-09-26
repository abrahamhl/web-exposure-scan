# Perfil de cliente (ICP)

## ICP principal — CASH NOW

**Negocio local en Arnhem/Gelderland, 1–25 empleados, que factura o recibe pagos por email, con dominio propio (`@empresa.nl`) y sin persona de IT interna.**

Señales observables (todas públicas, verificables en internet.nl antes de entrar):
- DMARC ausente o en `p=none`.
- Tiene MX (usa el dominio para correo de verdad).
- Tiene web con formulario, reservas o tienda (más remitentes → más valor en Compleet).

| Sector | Por qué le duele | Remitentes típicos | Paquete probable |
|---|---|---|---|
| Administratiekantoor / boekhouder | Sus clientes pagan facturas que llegan por email; una falsa en su nombre le destruye la confianza | Outlook/M365, software de nóminas, portal de clientes | Compleet |
| Makelaar | Anticipos y fianzas por transferencia | M365, Realworks/Kolibri, newsletter | Compleet |
| Tandarts / fysio / praktijk | Recordatorios de citas por email; datos sensibles | Sistema de citas, M365 | Compleet |
| Webshop pequeño | Confirmaciones de pedido, facturas | Shopify/WooCommerce, Mollie, Sendcloud, Mailchimp | Compleet |
| Horeca con reservas | Menor riesgo financiero, pero muchos remitentes (reservas) | Formitable/Zenchef, Gmail/M365 | Basis |
| Kapper / salon | Poco email saliente | Salonized/Treatwell | Basis o Domeinslot |

## Buyer persona

**"Marieke", 44, eigenaar van een administratiekantoor met 6 medewerkers in Arnhem-Zuid.**
- Decide ella. Presupuesto de €349 no requiere aprobación de nadie.
- La web la hizo "un conocido" o una agencia hace años. No sabe quién tiene el acceso al DNS.
- Ha oído de "CEO-fraude" en el Kamer van Koophandel o a un colega. Le preocupa más la reputación ante clientes que el dinero directo.
- Desconfía de vendedores de "cybersecurity". Confía en la herramienta del gobierno y en alguien del barrio que no le pide contraseñas.

## Trigger de compra

1. Un colega o cliente recibió una factura falsa (el más fuerte).
2. Un correo suyo legítimo empezó a llegar a spam (Gmail/Outlook endurecen desde 2024–2025).
3. Ve su propio rojo en internet.nl delante de ella.
4. Cambio de web, de proveedor de correo o de dominio (momento natural de "ponerlo bien").

## Objeciones probables y presupuesto

Ver [SALES_PLAYBOOK.md](SALES_PLAYBOOK.md). Presupuesto realista: €100–400 decisión en el acto; >€500 necesita "lo pienso".

## ICP secundario — CASH SOON: webbouwers y pequeñas agencias

**Freelance o agencia de 1–10 personas en Gelderland que aloja o gestiona el DNS de 20–200 dominios de clientes.**
- Dolor: sus clientes empiezan a preguntar por internet.nl / spam; no tienen tiempo de hacer DMARC dominio a dominio ni de leer informes.
- Oferta: `wxs --file clientes.txt --no-offer` sobre **su propia lista** (autorizados por ellos), informe white-label, y €99/dominio de implementación o reparto de margen.
- Una venta = 5–50 dominios. Este es el camino a ingreso repetible.

## Quién NO es cliente

- Empresas con departamento IT propio o MSP con contrato (ya lo tienen o deberían).
- Negocios que usan solo `@gmail.com` / `@hotmail.com` (no hay dominio que proteger — cortesía y fuera).
- Entidades bajo la Cyberbeveiligingswet (NIS2): necesitan otra cosa, más grande que esto.
