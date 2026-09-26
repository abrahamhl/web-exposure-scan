# ROI — ejemplos honestos

> Regla: no inventamos probabilidades de ataque ni prometemos que "esto le ahorra X €". Damos los datos públicos y dejamos que el cliente decida. Todo lo que sigue es un **razonamiento**, no una garantía.

## Datos de partida (fuentes en MARKET_EVIDENCE)

- Fraudehelpdesk 2025: **101.734 denuncias de fraude** (+60% vs 2024), **€68,5 M** de daño declarado (fuente secundaria que cita a la Fraudehelpdesk, 2026-09-01).
- Estimación de una guía NL para MKB: un incidente de fraude de factura/CEO cuesta a una pyme **€10.000–50.000** y >40 h de gestión. Es una estimación de un blog del sector, **no** un estudio: úsala como orden de magnitud, no como cifra.
- Coste del arreglo: 4–8 h de trabajo único + €0–20/mes de informes.

## Ejemplo 1 — Administratiekantoor, 6 personas

- Hoy: SPF `~all`, sin DMARC. Manda facturas y nóminas por email.
- Compleet: €349 + Wachter €15/mes → **€529 el primer año**.
- Razonamiento: si una sola factura falsa en su nombre llega a un cliente y éste paga, el daño directo suele ser **mayor que diez años de este servicio**, sin contar la conversación con el cliente. DMARC `p=reject` hace que la mayoría de servidores rechacen esa factura falsa **si usa su dominio exacto**. No protege contra dominios parecidos.

## Ejemplo 2 — Salón de peluquería

- Hoy: sin SPF, sin DMARC, email solo para confirmaciones de citas.
- Basis: €149. Sin Wachter.
- Razonamiento: el riesgo financiero directo es bajo. El beneficio práctico es otro: **sus confirmaciones dejan de ir a spam** (Gmail y Outlook exigen autenticación desde 2024–2025). Venderlo así, no como antifraude.

## Ejemplo 3 — Dominio sin correo

- `empresa.com` redirige a `empresa.nl`, no tiene MX, sin SPF ni DMARC.
- Domeinslot: €49.
- Razonamiento: es el dominio favorito para suplantar porque nadie lo vigila. 15 minutos de trabajo.

## Ejemplo 4 — Webbouwer con 40 dominios de clientes

- Partner: €99 × 40 = €3.960 si se hacen todos; realista en un trimestre: 10–15 dominios → **€1.000–1.500**.
- Para el webbouwer: servicio que puede revender con margen, sin aprender DMARC.

## Qué NO decir

- "Evita multas AVG." — Falso para este servicio.
- "Le protege del phishing." — Solo del que usa su dominio exacto.
- "El 90% de los ataques empiezan por email." — Se repite mucho, no tenemos fuente primaria. No usarlo.
