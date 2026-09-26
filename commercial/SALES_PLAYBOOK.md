# Sales playbook — Mailslot

## La regla que lo cambia todo

**No escaneamos a nadie para luego asustarle.** El control gratuito se hace **con** el dueño, en **su** móvil, en **internet.nl** — la herramienta oficial neerlandesa (NCSC-NL, SIDN, Ministerio de EZ). Así:

- el test es suyo, no nuestro → no hay "¿quién te ha dado permiso para mirar mi web?";
- el resultado viene de una fuente que no somos nosotros → no hay "esto es un truco para venderme";
- nosotros solo explicamos qué significa el rojo y cuánto cuesta ponerlo en verde.

`wxs` se usa **después** del "sí, mírelo" (para el informe de 1 página y para el opleverrapport). Los datos de ARGUS sirven para elegir **a qué puerta llamar**, no para abrir con "le hemos analizado".

---

## Pitch de 15 segundos

**NL:** "Ik help ondernemers hier in Arnhem om hun e-mailadres op slot te zetten, zodat niemand nepfacturen uit hun naam kan sturen. Vaste prijs, binnen een week, en u kunt het zelf controleren op internet.nl."

**ES:** Ayudo a negocios de Arnhem a cerrar su dirección de correo para que nadie mande facturas falsas en su nombre. Precio cerrado, en una semana, y lo compruebas tú en internet.nl.

## Pitch de 60 segundos

**NL:**
"Wist u dat iedereen een e-mail kan versturen met úw adres als afzender? Dat is hoe nepfacturen werken: uw klant krijgt een mail die van u lijkt te komen, met een ander rekeningnummer.
Daar bestaan drie instellingen voor — SPF, DKIM en DMARC. Ze kosten geen licentie, maar bij de meeste bedrijven staan ze niet goed, of alleen op 'meten' in plaats van 'blokkeren'.
U kunt het nu zelf zien: internet.nl, de gratis test van de overheid en SIDN. Tik uw domein in bij 'Test uw e-mail'.
Als daar rood staat, zet ik het voor u goed. Vaste prijs, €149 of €349 als u ook een webshop of boekhoudpakket heeft dat mailt. Daarna draait u de test opnieuw en ziet u groen."

**ES (resumen para Abraham):** qué es el spoofing → tres registros sin licencia → casi nadie los tiene en "bloquear" → míralo tú en internet.nl → si sale rojo, lo arreglo a precio cerrado → vuelves a testear y sale verde.

---

## Mensajes

> Todos llevan nombre propio y un motivo concreto. Nada de envíos masivos. Máximo 20 por semana, escritos a mano a partir de la plantilla.

### LinkedIn (conexión con nota, ≤300 caracteres)
"Hoi [naam], ik woon en werk in Arnhem en help MKB'ers om hun e-maildomein af te schermen tegen nepfacturen (SPF/DKIM/DMARC). Geen verkooppraatje: als u [domein] even op internet.nl test, ziet u meteen of het nodig is. Graag verbonden!"

### Email corto (solo a direcciones genéricas de empresas con BV, y con baja fácil — ver "Legal")
**Onderwerp:** Vraag over e-mail van [bedrijfsnaam]

"Beste [naam],

Ik ben Abraham, zelfstandig IT-specialist in Arnhem. Ik zet voor lokale bedrijven de e-mailbeveiliging goed (SPF, DKIM en DMARC), zodat niemand mail kan versturen die lijkt alsof hij van u komt.

U kunt in één minuut zelf zien of dat bij [domein] nodig is: https://internet.nl/mail/[domein]/ — de gratis test van het Internetstandaardenplatform.

Staat daar rood bij 'echtheidsmerken tegen phishing', dan regel ik het voor een vaste prijs vanaf €149, meestal binnen een week. Zo niet, dan is het goed geregeld en hoeft u niets te doen.

Groet,
Abraham Haddioui · AUX Design · [telefoon]
(Liever geen mail meer van mij? Een kort 'nee' is genoeg.)"

### WhatsApp (solo si ya hubo contacto o te dieron el número)
"Hoi [naam], Abraham hier, we spraken elkaar [waar/wanneer]. Zoals beloofd: de test is internet.nl → 'Test uw e-mail' → [domein]. Als u een screenshot stuurt, zeg ik u in 2 minuten wat er rood staat en wat het kost om het groen te krijgen. 👍"

### En persona (tienda, recepción, horeca en horas tranquilas)
1. "Goedemiddag, heeft u twee minuten? Ik ben Abraham, ik woon hier in Arnhem."
2. "Ik help ondernemers met de beveiliging van hun e-mail — tegen nepfacturen uit hun naam. Mag ik iets laten zien op uw eigen telefoon?"
3. Abrir internet.nl juntos. Esperar el resultado (1–2 min — hablar de su negocio mientras).
4. Si hay rojo en "echtheidsmerken": "Dit is wat ik oplos. €149, of €349 als er ook een webshop of boekhoudprogramma mailt. Ik laat een A4'tje achter." (dejar el informe impreso de `wxs` **solo si dijo sí a mirarlo**, o la tarjeta con precios si no).
5. Si todo verde: "Dan is het goed geregeld, complimenten aan uw webbouwer." Y te vas. **Esto construye más confianza que cualquier venta.**

**CTA concreto siempre:** "Zal ik het deze week voor u regelen? Ik heb alleen iemand nodig die toegang heeft tot uw domeinbeheer — dat kan ook uw webbouwer zijn."

---

## Objeciones

**"Wij hebben al een IT'er / webbouwer."**
NL: "Prima, dan is het voor hem tien minuten werk. Wilt u dat ik hem precies stuur wat er moet gebeuren? Dan kost het u niets. En als hij er geen tijd voor heeft, doe ik het."
→ Mandar el informe al webbouwer gratis. Resultado: o lo arregla (buena reputación para ti, y un webbouwer que te conoce = futuro partner), o te lo pasa a ti.

**"Dat hebben we niet nodig." / "Ons overkomt dat niet."**
NL: "Dat kan. De test op internet.nl zegt het eerlijk: staat alles groen, dan heeft u gelijk en ben ik weg. Staat het rood, dan weet u in elk geval waar u staat."
→ No insistir más. Dejar tarjeta.

**"Het is te duur."**
NL: "Begrijpelijk. Dan beginnen we met Basis voor €149: dan staat het fundament goed en krijgt u rapporten. Compleet kan later."
→ Nunca bajar el precio de un paquete. Bajar de paquete.
Contexto honesto (no amenaza): la Fraudehelpdesk registró 101.734 denuncias de fraude en 2025 (+60%) con €68,5 M de daño declarado (fuente en MARKET_EVIDENCE). No prometas que DMARC lo evita todo.

**"Stuur maar wat informatie."**
NL: "Doe ik. Mag ik meteen de test voor [domein] meesturen, zodat het over úw situatie gaat en niet over een folder? Ik bel u donderdag even kort na."
→ Mandar el informe de 1 página (con su permiso) + fijar la llamada en el momento. Sin fecha, no hay seguimiento.

**"Hoe weet ik dat u geen oplichter bent?"**
NL: "Goede vraag, juist daarom. U hoeft mij niets te geven: geen wachtwoord, geen betaling vooraf. Uw webbouwer kan de instellingen zetten die ik aangeef, of u geeft mij tijdelijk toegang en trekt die daarna weer in. En internet.nl laat u zien of het gewerkt heeft."

**"Wat als de e-mail daarna niet meer werkt?"**
NL: "Daarom begin ik op 'meten' (p=none) en kijk ik 2–4 weken mee voordat er iets geblokkeerd wordt. Zo vinden we eerst alles wat namens u mailt — webshop, boekhouding, nieuwsbrief."

---

## Legal y ética (no negociable)

- **Presencial y teléfono** al número público de la empresa: permitido.
- **Email/WhatsApp frío**: en NL la publicidad por email a personas físicas —incluidas eenmanszaak y vof— exige consentimiento previo (Telecommunicatiewet art. 11.7). A BV/NV la regla es más laxa pero exige identificarse y ofrecer baja. **Canal principal = en persona y LinkedIn.** Antes de cualquier envío en volumen, verificar en acm.nl.
- **Nunca** enviar a un tercero un informe sobre su dominio que no ha pedido. Se enseña el enlace a internet.nl; el informe `wxs` es para quien dijo sí.
- **Nunca** pedir contraseñas por WhatsApp/email. Acceso delegado (usuario propio en el panel DNS) o el cliente/webbouwer aplica los cambios. Ver `templates/OPDRACHTBEVESTIGING.md`.
- **No** hablar de multas AVG/GDPR ni de "certificados". No es verdad para este servicio y un cliente listo lo detecta.
