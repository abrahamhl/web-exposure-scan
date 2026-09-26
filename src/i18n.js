// Client-facing text in Dutch and English. The checks keep their Spanish text inline
// (that is the fallback and what the JSON has always carried); this catalog only
// translates what ends up in front of a client. Keyed by finding key (the id without
// per-instance suffixes such as a cookie name). Each entry receives the finding's params.
//
// Tone rule for every string here: describe what we observed and what it allows.
// No fines, no "certified", no fear. A web builder must be able to read it and agree.

export const LANGS = ['es', 'nl', 'en'];

const T = {
  // ---------- TLS ----------
  'tls-invalid-chain': {
    nl: p => ({ title: 'TLS-certificaat wordt niet vertrouwd',
      detail: `Browsers weigeren het certificaat (${p.authError || 'keten niet te verifiëren'}). Bezoekers zien een waarschuwing "Niet veilig".`,
      fix: 'Certificaat opnieuw uitgeven bij een vertrouwde CA (Let’s Encrypt is gratis) en de volledige tussenketen installeren.' }),
    en: p => ({ title: 'TLS certificate is not trusted',
      detail: `Browsers reject the certificate (${p.authError || 'chain cannot be verified'}). Visitors see a "Not secure" warning.`,
      fix: 'Reissue the certificate from a trusted CA (Let’s Encrypt is free) and install the full intermediate chain.' })
  },
  'tls-expired': {
    nl: p => ({ title: 'TLS-certificaat is verlopen',
      detail: `Verlopen sinds ${p.days} dag(en) (${p.validTo}).`,
      fix: 'Direct vernieuwen en automatisch laten vernieuwen (ACME / certbot of via de hostingpartij).' }),
    en: p => ({ title: 'TLS certificate has expired',
      detail: `Expired ${p.days} day(s) ago (${p.validTo}).`,
      fix: 'Renew now and automate renewal (ACME / certbot or through the hosting provider).' })
  },
  'tls-expiring': {
    nl: p => ({ title: 'TLS-certificaat verloopt binnenkort',
      detail: `Nog ${p.days} dag(en) geldig (tot ${p.validTo}).`,
      fix: 'Nu vernieuwen en controleren of automatische vernieuwing werkt.' }),
    en: p => ({ title: 'TLS certificate expires soon',
      detail: `${p.days} day(s) left (until ${p.validTo}).`,
      fix: 'Renew now and check that automatic renewal works.' })
  },
  'tls-weak-protocol': {
    nl: p => ({ title: `Verouderd TLS-protocol (${p.protocol})`,
      detail: 'Protocollen ouder dan TLS 1.2 zijn uitgefaseerd.',
      fix: 'Alleen TLS 1.2 en TLS 1.3 toestaan op de server of het CDN.' }),
    en: p => ({ title: `Outdated TLS protocol (${p.protocol})`,
      detail: 'Protocols older than TLS 1.2 are retired.',
      fix: 'Allow only TLS 1.2 and TLS 1.3 on the server or CDN.' })
  },
  'tls-weak-cipher': {
    nl: p => ({ title: `Zwakke versleuteling (${p.cipher})`,
      detail: 'De onderhandelde cipher suite gebruikt verouderde bouwstenen.',
      fix: 'Beperken tot moderne AEAD-suites (AES-GCM, ChaCha20-Poly1305).' }),
    en: p => ({ title: `Weak cipher suite (${p.cipher})`,
      detail: 'The negotiated cipher suite uses outdated primitives.',
      fix: 'Restrict to modern AEAD suites (AES-GCM, ChaCha20-Poly1305).' })
  },
  'tls-unreachable': {
    nl: p => ({ title: 'Geen HTTPS-verbinding mogelijk',
      detail: `Poort 443 reageerde niet goed (${p.msg}). Mogelijk draait de site alleen via HTTP.`,
      fix: 'De site via HTTPS aanbieden met een geldig certificaat en al het HTTP-verkeer doorsturen.' }),
    en: p => ({ title: 'No HTTPS connection possible',
      detail: `Port 443 did not respond correctly (${p.msg}). The site may be served over HTTP only.`,
      fix: 'Serve the site over HTTPS with a valid certificate and redirect all HTTP traffic.' })
  },

  // ---------- HTTP ----------
  'hdr-hsts': {
    nl: () => ({ title: 'HSTS ontbreekt (Strict-Transport-Security)',
      detail: 'Zonder HSTS kan een eerste bezoek via onversleuteld HTTP lopen, bijvoorbeeld op openbare wifi.',
      fix: 'Toevoegen: Strict-Transport-Security: max-age=31536000; includeSubDomains' }),
    en: () => ({ title: 'HSTS missing (Strict-Transport-Security)',
      detail: 'Without HSTS a first visit can happen over plain HTTP, for example on public Wi-Fi.',
      fix: 'Add: Strict-Transport-Security: max-age=31536000; includeSubDomains' })
  },
  'hdr-csp': {
    nl: () => ({ title: 'Content-Security-Policy ontbreekt',
      detail: 'CSP beperkt welke scripts de pagina mag laden. Zonder CSP heeft een ingevoegd script vrij spel.',
      fix: "Beginnen in meetmodus: Content-Security-Policy-Report-Only: default-src 'self', daarna aanscherpen." }),
    en: () => ({ title: 'Content-Security-Policy missing',
      detail: 'CSP limits which scripts the page may load. Without it an injected script runs freely.',
      fix: "Start in report-only mode: Content-Security-Policy-Report-Only: default-src 'self', then tighten." })
  },
  'hdr-xfo': {
    nl: () => ({ title: 'X-Frame-Options ontbreekt',
      detail: 'De site kan in een frame van een andere site worden geladen (clickjacking).',
      fix: 'Toevoegen: X-Frame-Options: SAMEORIGIN (of frame-ancestors in de CSP).' }),
    en: () => ({ title: 'X-Frame-Options missing',
      detail: 'The site can be loaded inside another site’s frame (clickjacking).',
      fix: 'Add: X-Frame-Options: SAMEORIGIN (or frame-ancestors in the CSP).' })
  },
  'hdr-xcto': {
    nl: () => ({ title: 'X-Content-Type-Options ontbreekt',
      detail: 'De browser kan het bestandstype gaan raden en iets als script uitvoeren dat dat niet is.',
      fix: 'Toevoegen: X-Content-Type-Options: nosniff' }),
    en: () => ({ title: 'X-Content-Type-Options missing',
      detail: 'The browser may guess a file’s type and run something as script that is not.',
      fix: 'Add: X-Content-Type-Options: nosniff' })
  },
  'hdr-ref': {
    nl: () => ({ title: 'Referrer-Policy ontbreekt',
      detail: 'Interne URL’s kunnen naar externe sites lekken als iemand op een link klikt.',
      fix: 'Toevoegen: Referrer-Policy: strict-origin-when-cross-origin' }),
    en: () => ({ title: 'Referrer-Policy missing',
      detail: 'Internal URLs can leak to third-party sites when someone clicks an outbound link.',
      fix: 'Add: Referrer-Policy: strict-origin-when-cross-origin' })
  },
  'hdr-pp': {
    nl: () => ({ title: 'Permissions-Policy ontbreekt',
      detail: 'Er is niet vastgelegd welke browserfuncties (camera, microfoon, locatie) ingesloten scripts mogen gebruiken.',
      fix: 'Toevoegen: Permissions-Policy: camera=(), microphone=(), geolocation=()' }),
    en: () => ({ title: 'Permissions-Policy missing',
      detail: 'Nothing restricts which browser features (camera, microphone, location) embedded scripts may use.',
      fix: 'Add: Permissions-Policy: camera=(), microphone=(), geolocation=()' })
  },
  'hdr-hsts-short': {
    nl: p => ({ title: 'HSTS met te korte max-age',
      detail: `max-age=${p.maxAge} (minder dan 180 dagen).`,
      fix: 'Verhogen naar max-age=31536000 (1 jaar).' }),
    en: p => ({ title: 'HSTS max-age too short',
      detail: `max-age=${p.maxAge} (under 180 days).`,
      fix: 'Raise to max-age=31536000 (1 year).' })
  },
  'hdr-server-version': {
    nl: p => ({ title: `Server toont exacte versie (${p.server})`,
      detail: 'Dat maakt het makkelijker om bekende kwetsbaarheden voor die versie te zoeken.',
      fix: 'Versie verbergen: server_tokens off (nginx) of ServerTokens Prod (Apache).' }),
    en: p => ({ title: `Server discloses exact version (${p.server})`,
      detail: 'This makes it easier to match the version against known vulnerabilities.',
      fix: 'Hide the version: server_tokens off (nginx) or ServerTokens Prod (Apache).' })
  },
  'hdr-powered-by': {
    nl: p => ({ title: `X-Powered-By zichtbaar (${p.value})`,
      detail: 'Toont framework en versie zonder functioneel nut.',
      fix: 'Header verwijderen.' }),
    en: p => ({ title: `X-Powered-By exposed (${p.value})`,
      detail: 'Reveals framework and version with no functional need.',
      fix: 'Remove the header.' })
  },
  'cookie-flags': {
    nl: p => ({ title: `Cookie "${p.name}" zonder ${p.flags.join(' en ')}`,
      detail: 'Zonder deze vlaggen kan de cookie onversleuteld meereizen of door JavaScript gelezen worden.',
      fix: `Cookie zetten met: ${p.flags.join('; ')}; SameSite=Lax` }),
    en: p => ({ title: `Cookie "${p.name}" without ${p.flags.join(' or ')}`,
      detail: 'Without these flags the cookie can travel unencrypted or be read by JavaScript.',
      fix: `Set the cookie with: ${p.flags.join('; ')}; SameSite=Lax` })
  },
  'http-abnormal-status': {
    nl: p => ({ title: `Homepage gaf status ${p.code}, geen normale pagina`,
      detail: 'Mogelijk een firewall of blokkade van niet-browsers. Beveiligingsheaders zijn daarom niet beoordeeld.',
      fix: 'Opnieuw controleren vanuit een gewone browser.' }),
    en: p => ({ title: `Homepage returned status ${p.code}, not a normal page`,
      detail: 'Possibly a firewall or a block on non-browser clients. Security headers were therefore not assessed.',
      fix: 'Re-check from a regular browser.' })
  },
  'http-unreachable': {
    nl: p => ({ title: 'Homepage niet bereikbaar via HTTPS',
      detail: `Het verzoek mislukte (${p.msg}); de beveiligingsheaders konden niet worden gecontroleerd.`,
      fix: 'Controleren of de site op https:// reageert.' }),
    en: p => ({ title: 'Homepage not reachable over HTTPS',
      detail: `The request failed (${p.msg}); security headers could not be checked.`,
      fix: 'Check that the site responds on https://.' })
  },
  'http-no-https-redirect': {
    nl: p => ({ title: 'http:// stuurt niet door naar https://',
      detail: `Wie ${p.domain} zonder https intypt, blijft op een onversleutelde pagina (status ${p.code}).`,
      fix: 'Een permanente doorverwijzing (301) van HTTP naar HTTPS instellen bij de hosting.' }),
    en: p => ({ title: 'http:// does not redirect to https://',
      detail: `Typing ${p.domain} without https leaves the visitor on an unencrypted page (status ${p.code}).`,
      fix: 'Set a permanent (301) redirect from HTTP to HTTPS at the hosting provider.' })
  },

  // ---------- DNS / e-mail ----------
  'dns-nxdomain': {
    nl: p => ({ title: 'Domein resolvet niet', detail: p.reason || '', fix: 'Registratie en DNS-servers van het domein controleren.' }),
    en: p => ({ title: 'Domain does not resolve', detail: p.reason || '', fix: 'Check the domain registration and its DNS servers.' })
  },
  'dns-spf-missing': {
    nl: () => ({ title: 'Geen SPF-record',
      detail: 'Er staat nergens welke servers namens dit domein mogen mailen. Een vervalste afzender met uw domeinnaam wordt daardoor minder snel herkend.',
      fix: 'TXT-record publiceren: v=spf1 include:<uw-mailprovider> -all' }),
    en: () => ({ title: 'No SPF record',
      detail: 'Nothing states which servers may send mail for this domain, so a forged sender using your domain is harder to spot.',
      fix: 'Publish a TXT record: v=spf1 include:<your-mail-provider> -all' })
  },
  'dns-spf-unverified': {
    nl: p => ({ title: 'SPF niet te verifiëren vanaf dit netwerk',
      detail: 'Er kwam geen enkel TXT-record terug; dat wijst op een netwerkprobleem, niet per se op een ontbrekend SPF. Hier wordt niets over beweerd.',
      fix: `Opnieuw controleren vanaf een ander netwerk of via internet.nl (${p.domain}).` }),
    en: p => ({ title: 'SPF could not be verified from this network',
      detail: 'No TXT record came back at all, which points to a network issue rather than a missing SPF. No claim is made.',
      fix: `Re-check from another network or via internet.nl (${p.domain}).` })
  },
  'dns-spf-soft': {
    nl: p => ({ title: 'SPF staat in zachte modus',
      detail: `Het record eindigt op "${p.tail}": ontvangers markeren vervalste mail hooguit, ze weigeren hem niet.`,
      fix: 'Als alle legitieme verzenders bekend zijn, afsluiten met -all (samen met DMARC).' }),
    en: p => ({ title: 'SPF is in soft mode',
      detail: `The record ends in "${p.tail}": receivers may flag forged mail but will not reject it.`,
      fix: 'Once all legitimate senders are known, close with -all (together with DMARC).' })
  },
  'dns-dmarc-missing': {
    nl: () => ({ title: 'Geen DMARC-record',
      detail: 'Zonder DMARC weten ontvangende mailservers niet wat ze moeten doen met mail die zich als uw domein voordoet, en krijgt u geen rapporten over wie dat probeert.',
      fix: 'TXT-record op _dmarc publiceren: v=DMARC1; p=none; rua=mailto:<rapportadres> — daarna stap voor stap aanscherpen.' }),
    en: () => ({ title: 'No DMARC record',
      detail: 'Without DMARC, receiving mail servers have no instruction for mail pretending to be your domain, and you get no reports on who tries.',
      fix: 'Publish a TXT record at _dmarc: v=DMARC1; p=none; rua=mailto:<report-address> — then tighten step by step.' })
  },
  'dns-dmarc-none': {
    nl: () => ({ title: 'DMARC staat op p=none (alleen meten)',
      detail: 'Het beleid staat in meetmodus: vervalste mail uit uw naam wordt gemeld, maar niet tegengehouden.',
      fix: 'Na 2–4 weken rapporten bekijken overstappen naar p=quarantine en daarna p=reject.' }),
    en: () => ({ title: 'DMARC is at p=none (monitor only)',
      detail: 'The policy is in monitoring mode: forged mail in your name is reported, not stopped.',
      fix: 'After 2–4 weeks of reviewing reports, move to p=quarantine and then p=reject.' })
  },
  'dns-dmarc-no-rua': {
    nl: () => ({ title: 'DMARC zonder rapportadres (rua)',
      detail: 'Er komen geen rapporten binnen, dus niemand ziet of er misbruik is of dat legitieme mail faalt. Veilig aanscherpen kan dan niet.',
      fix: 'rua=mailto:<rapportadres> toevoegen (een gratis DMARC-rapportagedienst volstaat voor een klein domein).' }),
    en: () => ({ title: 'DMARC without a report address (rua)',
      detail: 'No reports arrive, so nobody sees abuse or failing legitimate mail. Tightening safely is not possible.',
      fix: 'Add rua=mailto:<report-address> (a free DMARC reporting service is enough for a small domain).' })
  },
  'dns-mx-without-spf': {
    nl: p => ({ title: 'Domein ontvangt mail maar beschermt het verzenden niet',
      detail: `Er zijn ${p.mx} mailserver(s) ingesteld en geen SPF. Juist die combinatie maakt nep-facturen en "CEO-fraude" uit uw naam makkelijker.`,
      fix: 'Eerst SPF en DMARC regelen, vóór alle andere punten op deze lijst.' }),
    en: p => ({ title: 'Domain receives mail but does not protect sending',
      detail: `${p.mx} mail server(s) configured and no SPF. That combination makes fake invoices and "CEO fraud" in your name easier.`,
      fix: 'Fix SPF and DMARC first, before anything else on this list.' })
  },
  'dns-no-mail-unprotected': {
    nl: () => ({ title: 'Domein zonder mail, maar niet afgeschermd',
      detail: 'Dit domein ontvangt geen mail, maar er staat ook niet dat het géén mail verstuurt. Oplichters gebruiken juist zulke domeinen als afzender.',
      fix: 'Publiceren: SPF "v=spf1 -all" en DMARC "v=DMARC1; p=reject". Vijf minuten werk.' }),
    en: () => ({ title: 'Domain without mail, but not locked',
      detail: 'This domain receives no mail, yet nothing says it sends none either. Scammers like to use exactly such domains as sender.',
      fix: 'Publish SPF "v=spf1 -all" and DMARC "v=DMARC1; p=reject". Five minutes of work.' })
  },
  'dns-dkim-not-found': {
    nl: p => ({ title: 'Geen DKIM gevonden op gangbare selectors',
      detail: `Gecontroleerd: ${p.selectors.join(', ')}. DKIM kan onder een andere naam bestaan; dat is van buitenaf niet vast te stellen. Zonder DKIM faalt DMARC vaak bij doorgestuurde mail.`,
      fix: 'DKIM-ondertekening aanzetten bij de mailprovider (Microsoft 365, Google Workspace, hosting) en de DNS-records publiceren.' }),
    en: p => ({ title: 'No DKIM found on common selectors',
      detail: `Checked: ${p.selectors.join(', ')}. DKIM may exist under another selector; that cannot be determined from outside. Without DKIM, DMARC often fails on forwarded mail.`,
      fix: 'Enable DKIM signing at the mail provider (Microsoft 365, Google Workspace, hosting) and publish the DNS records.' })
  },
  'dns-caa-missing': {
    nl: () => ({ title: 'Geen CAA-record',
      detail: 'Elke certificaatautoriteit mag een certificaat voor dit domein uitgeven.',
      fix: 'CAA publiceren: 0 issue "letsencrypt.org" (of uw eigen CA).' }),
    en: () => ({ title: 'No CAA record',
      detail: 'Any certificate authority may issue a certificate for this domain.',
      fix: 'Publish CAA: 0 issue "letsencrypt.org" (or your own CA).' })
  }
};

export function findingKey(f) {
  return f.key || f.id;
}

// Returns {title, detail, fix} in the requested language, falling back to the
// Spanish text the check produced.
export function localizeFinding(f, lang = 'es') {
  const entry = T[findingKey(f)];
  const fn = entry && entry[lang];
  if (!fn) return { title: f.title, detail: f.detail, fix: f.fix };
  try { return fn(f.params || {}); }
  catch { return { title: f.title, detail: f.detail, fix: f.fix }; }
}

export const UI = {
  es: {
    htmlLang: 'es', locale: 'es-ES',
    reportTitle: 'Informe de exposición web', passive: 'análisis pasivo, sin intrusión',
    level: 'Nivel de riesgo', bands: { 'ROJO': 'ROJO', 'ÁMBAR': 'ÁMBAR', 'VERDE-BAJO': 'VERDE-BAJO', 'VERDE': 'VERDE' },
    summary: (n, d) => `Se han detectado <strong>${n}</strong> puntos de mejora en la configuración pública de ${d}. Todos son visibles desde fuera, sin acceder a ningún sistema interno.`,
    sev: { critical: 'CRÍTICO', high: 'ALTO', medium: 'MEDIO', low: 'BAJO' },
    sevPlural: { critical: 'Críticos', high: 'Altos', medium: 'Medios', low: 'Bajos' },
    findings: 'Hallazgos', none: 'Sin hallazgos: la configuración pública es correcta.', howFix: 'Cómo se arregla:',
    email: 'Correo', web: 'Web y certificado',
    verifyTitle: 'Compruébalo tú mismo',
    verify: d => `No hace falta fiarse de este informe: la prueba pública y gratuita <a href="https://internet.nl/mail/${d}/">internet.nl/mail/${d}</a> (plataforma neerlandesa de estándares de Internet, con NCSC-NL y SIDN) mide lo mismo en el apartado de correo.`,
    offerTitle: 'Propuesta', recommended: 'recomendado', exVat: 'sin IVA', perMonth: '/mes',
    evidence: 'Evidencia técnica',
    footer: (v, d) => `Generado por web-exposure-scan v${v} el ${d}. Solo comprobaciones pasivas: un handshake TLS, una petición HTTPS y otra HTTP a la portada, y consultas DNS públicas. No se ha accedido a ningún sistema ni probado credenciales.`,
    yes: 'sí', no: 'NO', hidden: 'oculto', na: 'n/d'
  },
  nl: {
    htmlLang: 'nl', locale: 'nl-NL',
    reportTitle: 'Controle e-mail- en webbeveiliging', passive: 'passieve controle van publieke instellingen',
    level: 'Beoordeling', bands: { 'ROJO': 'ROOD', 'ÁMBAR': 'ORANJE', 'VERDE-BAJO': 'GEEL', 'VERDE': 'GROEN' },
    summary: (n, d) => `We vonden <strong>${n}</strong> verbeterpunt(en) in de publieke instellingen van ${d}. Alles hieronder is van buitenaf zichtbaar voor iedereen; er is niet ingelogd en niets aangeraakt.`,
    sev: { critical: 'KRITIEK', high: 'HOOG', medium: 'MIDDEL', low: 'LAAG' },
    sevPlural: { critical: 'Kritiek', high: 'Hoog', medium: 'Middel', low: 'Laag' },
    findings: 'Bevindingen', none: 'Geen bevindingen: de publieke instellingen zijn in orde.', howFix: 'Oplossing:',
    email: 'E-mail', web: 'Website en certificaat',
    verifyTitle: 'Controleer het zelf',
    verify: d => `U hoeft ons niet op ons woord te geloven. De gratis test <a href="https://internet.nl/mail/${d}/">internet.nl/mail/${d}</a> van het Internetstandaardenplatform (o.a. NCSC-NL, SIDN, Ministerie van EZ) meet dezelfde e-mailinstellingen.`,
    offerTitle: 'Aanbod', recommended: 'aanbevolen', exVat: 'excl. btw', perMonth: '/mnd',
    evidence: 'Technisch bewijs',
    footer: (v, d) => `Gemaakt met web-exposure-scan v${v} op ${d}. Alleen passieve controles: één TLS-verbinding, één HTTPS- en één HTTP-verzoek naar de homepage en publieke DNS-opvragingen. Er is nergens ingelogd en niets gewijzigd.`,
    yes: 'ja', no: 'NEE', hidden: 'verborgen', na: 'n.v.t.'
  },
  en: {
    htmlLang: 'en', locale: 'en-GB',
    reportTitle: 'E-mail and web security check', passive: 'passive check of public settings',
    level: 'Rating', bands: { 'ROJO': 'RED', 'ÁMBAR': 'AMBER', 'VERDE-BAJO': 'YELLOW', 'VERDE': 'GREEN' },
    summary: (n, d) => `We found <strong>${n}</strong> improvement point(s) in the public settings of ${d}. Everything below is visible to anyone from outside; nothing was logged into or changed.`,
    sev: { critical: 'CRITICAL', high: 'HIGH', medium: 'MEDIUM', low: 'LOW' },
    sevPlural: { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' },
    findings: 'Findings', none: 'No findings: the public configuration is fine.', howFix: 'Fix:',
    email: 'E-mail', web: 'Website and certificate',
    verifyTitle: 'Check it yourself',
    verify: d => `You don’t have to take our word for it. The free test <a href="https://internet.nl/mail/${d}/">internet.nl/mail/${d}</a> by the Dutch Internet Standards Platform (NCSC-NL, SIDN and others) measures the same e-mail settings.`,
    offerTitle: 'Offer', recommended: 'recommended', exVat: 'excl. VAT', perMonth: '/month',
    evidence: 'Technical evidence',
    footer: (v, d) => `Generated by web-exposure-scan v${v} on ${d}. Passive checks only: one TLS handshake, one HTTPS and one HTTP request to the homepage, and public DNS lookups. Nothing was logged into or changed.`,
    yes: 'yes', no: 'NO', hidden: 'hidden', na: 'n/a'
  }
};

export function ui(lang) { return UI[lang] || UI.es; }
