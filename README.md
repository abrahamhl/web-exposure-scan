# web-exposure-scan (`wxs`)

[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](package.json)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Passive e-mail and web exposure check for small businesses — with a client-ready report in Dutch, English or Spanish, and a before/after hand-over report when the work is done.**

```text
$ wxs bakkerij-voorbeeld.example --i-am-authorized --lang nl
🟠 bakkerij-voorbeeld.example   score  62/100 ·  6 findings
$ wxs compare voor/bakkerij-voorbeeld.example.json na/bakkerij-voorbeeld.example.json --lang nl
bakkerij-voorbeeld.example: 5 resolved · 1 still open · 0 new · score 62 → 3
```

## What · Why · Who

- **What:** checks SPF, DKIM, DMARC, TLS, HTTPS redirect and security headers from the outside, and writes a one-page report a non-technical owner understands.
- **Why:** anyone can send mail that *looks* like it comes from `invoice@yourcompany.nl`. SPF, DKIM and DMARC stop that — they cost nothing to license, but most small businesses never get past DMARC `p=none`. The report shows where a domain stands, and the hand-over report proves it was fixed.
- **Who:** IT freelancers and small agencies who fix this for local businesses. Built for, and used in, the *Mailslot* service by [AUX Design](https://auxdesign.nl) in Arnhem (NL). See [`commercial/`](commercial/PRODUCT.md).

## Demo (offline, 10 seconds)

```bash
git clone https://github.com/abrahamhl/web-exposure-scan.git && cd web-exposure-scan
npm run demo
```

Opens nothing on the network. Writes a fictional bakery on the reserved `.example` TLD to `examples/demo/`:
`report.nl.html` (first report) and `handover.nl.html` (after the fix, score 62 → 3). English versions alongside.
A real scan of `example.com` is in [`examples/example.com.html`](examples/example.com.html).

## Install & usage

Node.js 18+ and nothing else.

```bash
node bin/wxs.js <domein.nl> --i-am-authorized --lang nl          # one domain
node bin/wxs.js --file domains.txt --i-am-authorized --lang en      # batch
node bin/wxs.js compare out/a.nl.json after/a.nl.json --lang nl     # hand-over report
node bin/wxs.js --help
```

Details and flags: [`commercial/QUICKSTART.md`](commercial/QUICKSTART.md). Print any report to PDF from the browser (print CSS included).

## What it checks

| Area | Checks | Notes |
|---|---|---|
| E-mail | SPF present / soft (`~all`) · DMARC present / `p=none` / missing `rua` · DKIM on 14 common selectors (M365, Google, Hostinger, Proton…) · mail-less domains left spoofable · MX without SPF | Never claims "missing" when the DNS read was unreliable |
| TLS | trusted chain · expiry · protocol < 1.2 · weak ciphers | one handshake |
| Web | HTTP→HTTPS redirect · HSTS · CSP · X-Frame-Options · nosniff · Referrer/Permissions-Policy · version disclosure · cookie flags | homepage only; suppressed on 403/5xx |

Every report links to the official Dutch test at `internet.nl/mail/<domain>/` so the client can verify independently.

## Architecture

```
bin/wxs.js            CLI (scan, compare)
src/engine.js         preflight → TLS | headers | DNS | redirect (parallel) → findings + evidence
src/checks/*.js       one file per area; each finding = {id, severity, params, es text}
src/i18n.js           nl/en text per finding id + report UI strings
src/report/html.js    client report      src/report/compare.js   before/after hand-over
src/report/offer.js   fixed packages (single source of truth for prices)
```

Zero dependencies (`node:dns`, `node:tls`, `node:https`). The preflight probes a control domain first: if *our* network can't resolve DNS, the scan returns `INCONCLUSIVE` instead of a false report.

## Security & ethics

Passive only: public DNS, one TLS handshake, one HTTPS and one HTTP GET of the homepage. No payloads, no logins, no port scans. `--i-am-authorized` is mandatory — run it on domains you own or have permission to check. See [SECURITY.md](SECURITY.md).

## Tests

```bash
npm test     # 18 tests, no network: i18n coverage for every finding id, offer logic, diff, HTML escaping
```

## Limitations

DKIM can't be proven absent from outside; DNSSEC, STARTTLS/DANE and MTA-STS are not measured yet (internet.nl does). The `index.html` browser version is older and Spanish-only. Full list: [`commercial/LIMITATIONS.md`](commercial/LIMITATIONS.md).

## Roadmap

- DNSSEC and MTA-STS checks
- `wxs watch`: scheduled re-scan with a diff e-mailed only when something changes (the monthly *Wachter* service)
- Bring `index.html` to parity with the CLI (NL/EN, offer block)

## License

MIT © 2026 Abraham Haddioui
