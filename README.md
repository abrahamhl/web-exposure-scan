# 🛡️ Web Exposure Scan (`wxs`)

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![Zero External Dependencies](https://img.shields.io/badge/dependencies-0-blue.svg)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tests: Green](https://img.shields.io/badge/tests-8%20passed-success.svg)](test/unit.test.js)
[![Field Ready: Chromebook](https://img.shields.io/badge/Chromebook-100%25%20Field%20Ready-cyan.svg)](index.html)

**Defensive web attack-surface scanner & client-ready report generator.**  
Analyzes DNS posture (SPF, DMARC, DKIM), TLS certificate health, and HTTP security headers passively from the outside — and generates ready-to-deliver HTML/PDF client audits with market-calibrated remediation budgets.

---

## 🚀 Live Demo & Web App

- **Web Scanner (Zero install, Chromebook field ready):** [https://abrahamhl.github.io/web-exposure-scan/](https://abrahamhl.github.io/web-exposure-scan/)
- **Author:** Abraham Haddioui · [AUX Design](https://auxdesign.nl)

---

## ✨ Key Features

1. **Zero External Dependencies:** Built 100% using native Node.js standard modules (`node:dns`, `node:https`, `node:tls`, `node:crypto`). Nothing to break, lightning fast.
2. **Defensive & Passive OSINT:** Evaluates strictly public signals without aggressive port scanning, brute-forcing, or server exploitation.
3. **Automated Client-Ready Reports:** Generates clean, branded HTML per-client reports (printable directly to PDF with `@media print` layout).
4. **Dynamic Market Pricing:** Computes remediation hours and quotes based on target market economics (`ES` standard and `NL` Northern Europe rate).
5. **Double Deployment Surface:** Runs as a terminal CLI for batch operations and as an interactive client-side web application for Chromebook field work.

---

## 💻 CLI Usage

### 1. Audit a Single Domain
```bash
node bin/wxs.js mycompany.com --i-am-authorized
```

### 2. Multi-domain Batch with Dutch Market Rates
```bash
node bin/wxs.js client1.nl client2.nl --i-am-authorized --market NL --out reports
```

### 3. Read Target List from File
```bash
node bin/wxs.js --file prospects.txt --i-am-authorized --out reports
```

---

## 🧪 Automated Testing

Runs the full unit test suite covering domain sanitization, authorization gates, risk calculation, market quoting, and HTML generation:

```bash
pnpm test
# or
node --test test/unit.test.js
```

---

## ⚖️ Ethics & Authorization Gate

This tool enforces the `--i-am-authorized` flag. Running passive web posture scans must be conducted under explicit authorization or legitimate interest within defensive security frameworks.

---

## 📄 License

MIT License © 2026 Abraham Haddioui.
