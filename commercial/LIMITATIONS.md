# Limitations

What `web-exposure-scan` and the Mailslot service do **not** do. Say this to clients before they ask.

## Scanner

- **Outside view only.** One TLS handshake, one HTTPS and one HTTP GET of the homepage, public DNS lookups. No login, no port scan, no crawling, no vulnerability testing.
- **DKIM cannot be proven absent from outside.** We probe 14 common selectors (Microsoft 365, Google, Hostinger, Proton, Fastmail, Mandrill, Strato and generic names). "Not found" means "not on those names", and the report says so.
- **Not measured (yet):** DNSSEC, STARTTLS/DANE on the mail server, MTA-STS, TLS-RPT, IPv6, RPKI. internet.nl measures these; always pair a report with the internet.nl link.
- **Homepage only.** Headers on other pages, subdomains or the webshop checkout are not checked.
- **WAF/bot blocks.** If the homepage answers 403/5xx to a non-browser client, header findings are suppressed rather than guessed (`http-abnormal-status`).
- **Network-dependent.** On a restricted network the scan reports INCONCLUSIVE instead of emitting a false report.
- **Scores are a sorting aid**, weighted by severity. They are not a standard and not comparable to internet.nl percentages.
- **The browser version (`index.html`, GitHub Pages) is older and Spanish-only.** The CLI is the supported path.

## Service

- DMARC `p=reject` stops mail that uses the **exact** domain. It does not stop look-alike domains (`bedrijf-nl.com`), compromised mailboxes, or a real supplier's hacked account.
- Moving to `p=reject` without the 2–4 week monitoring phase can block legitimate mail (webshop, accounting software, newsletter). Compleet includes that phase for this reason; Basis stops at `p=none` on purpose.
- This is not a penetration test, not an ISO 27001/NIS2 assessment, and not a certification of any kind.
- We need someone with access to the DNS panel. Without it, delivery waits.
