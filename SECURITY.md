# Security

## What the tool does on the network

Per scanned domain: DNS lookups (A/AAAA, TXT, `_dmarc` TXT, MX, CAA, up to 14 `_domainkey` TXT/CNAME) against 1.1.1.1 / 8.8.8.8 and the system resolver, one TLS handshake on port 443, one `GET /` over HTTPS and one over HTTP (redirects not followed). User-Agent: `web-exposure-scan/1.x (+defensive posture check)`. Nothing else.

It sends no payloads, tries no credentials, follows no links and scans no ports. That is roughly what a browser plus a mail server do when they meet a domain.

## Authorization

The CLI refuses to scan without `--i-am-authorized`. Use it only for domains you own or have written permission to check (see `commercial/templates/OPDRACHTBEVESTIGING.md`). For prospects, point them to the public test at internet.nl instead of scanning them.

## Data

Reports and JSON are written only to the local `--out` folder. No telemetry, no uploads. Client folders (`clientes/`) and scan output (`out/`) are git-ignored — keep client data out of this repository.

## Reporting a vulnerability

E-mail the maintainer (see the GitHub profile of `abrahamhl`) with "wxs security" in the subject. Please do not open a public issue for a security problem.
