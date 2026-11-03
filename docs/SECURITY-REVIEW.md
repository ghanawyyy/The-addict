# The Addict: pre-launch security review

Reviewed: 3 Nov 2026 · Scope: this repository (static website + `vercel.json`).

## How the site works (why many checks are "not relevant")

The website is **static**: HTML, CSS and JavaScript files only. There is **no backend, no database, no login, no admin area, no file uploads, no cookies, no API keys and no npm packages**.
The cart lives in the visitor's own browser tab (`sessionStorage`). Name and address are never stored.
The only thing saved on the device long-term is the language choice (`localStorage`: `en` or `ar`).
When the visitor presses **Send on WhatsApp**, the browser opens `wa.me/96171181987` with the order text. Nothing is sent to any server of ours.

Removing those parts removes most of the attack surface. That is the main security decision.

## Critical findings

**None.**

## Things that need your decision (no code changed)

| # | Severity | Finding | Proposed fix |
|---|----------|---------|--------------|
| A | Medium | **Prices come from the visitor's browser.** The total in the WhatsApp message is calculated on the phone. A visitor can edit the text before sending. There is no online payment, so no money is taken. | Process rule: staff confirm the total against the real menu before preparing (the site already says "Our team confirms the final total"). Optional code fix: add short item codes (e.g. `[B1]`) to each line so staff can check quickly. |
| B | Low | **No alerts for suspicious activity.** Vercel keeps request logs, but no one gets alerted. | In the Vercel dashboard: turn on Firewall (Attack Challenge Mode when needed), Observability, and usage/spend notifications. No code change. |
| C | Info | **Live checks pending.** The Vercel connector returned 403 (no permission to create a project), so the site is not deployed yet. HTTPS redirect, headers and exposed files were verified locally only. | After you import the repo in Vercel, run `bash scripts/security-check.sh https://<your-url>`. |
| D | Info | **HSTS uses `includeSubDomains; preload`.** Good for a site that is always HTTPS. `preload` only matters if you submit the domain to hstspreload.org, which is hard to undo. | Keep as is, or remove `preload` if any subdomain of your custom domain must stay on plain HTTP. |

## Checklist (prompt items)

### Auth and access
| Item | Status | Notes |
|------|--------|-------|
| Proper authentication | Not relevant | No accounts or logins. |
| Admin routes protected by role | Not relevant | No admin area. Menu is edited in code (`data.js`) and published through GitHub/Vercel, which have their own logins. Use 2-step login on both. |
| Secure session cookies | Not relevant | The site sets no cookies. |
| CSRF protection | Not relevant | No forms post to a server. `form-action 'none'` in the CSP blocks form posts anyway. |
| Password reset links expire | Not relevant | No passwords. |
| Rate limiting | Not relevant | No login or API endpoints. Static files are served by Vercel's CDN with built-in DDoS protection. |

### Secrets
| Item | Status | Notes |
|------|--------|-------|
| No API keys in frontend code | OK | The only identifiers are public: phone numbers and social links. |
| Environment variables checked | OK | None used. No DEBUG flags. `.env*`, `*.pem`, `*.key` are in `.gitignore` (verified with `git check-ignore`). |
| Git history scanned | OK | Full history (1 commit) scanned with secret patterns (AWS, Google, Stripe, GitHub, Slack, Vercel, JWT, private keys, passwords). No matches. gitleaks could not be downloaded in this environment, and GitHub secret scanning needs GitHub Advanced Security, which is not enabled on the repo. |
| Exposed keys to rotate | OK | None found. Nothing to rotate. |

### Data
| Item | Status | Notes |
|------|--------|-------|
| Database not public, row-level rules | Not relevant | No database. |
| Passwords hashed | Not relevant | No passwords. |
| Parameterized queries | Not relevant | No SQL. |
| Server-side validation on every form | Not relevant | No server receives the form. The browser checks length limits, required name/address, strips hidden control characters, and puts customer notes on one line so nobody can fake extra lines (such as a fake "Total") in the message. |
| XSS protection | OK | All text is written with `textContent` (no `innerHTML`, `eval` or `document.write` anywhere). Strict CSP: `script-src 'self'`, no inline scripts. Tested: typing `<script>alert(1)</script>` as a name shows as plain text. |
| Prices and payments verified on the server | Needs decision (A) | No payments online. See finding A. |

### Server
| Item | Status | Notes |
|------|--------|-------|
| HTTPS enforced | OK (verify live) | Vercel redirects HTTP to HTTPS automatically. HSTS header set. CSP has `upgrade-insecure-requests`. |
| Security headers | OK | Content-Security-Policy, Strict-Transport-Security, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy. |
| CORS restricted | OK | No `Access-Control-Allow-Origin` header is sent, so other sites cannot read anything. |
| Production debug mode off | OK | No debug mode exists. No source maps. The 404 page just says "Something went wrong". |
| File uploads limited | Not relevant | No uploads. |
| No exposed files (/.env, /.git) | OK (verify live) | Only `public/` is published (`outputDirectory`). `README`, `scripts/`, `vercel.json` and `.git` are never served. Local test: `/.env` → 404. |
| Vulnerable / unused dependencies | OK | Zero npm packages, no CDN scripts. Fonts are self-hosted. Nothing to audit. |

### Monitoring
| Item | Status | Notes |
|------|--------|-------|
| Logging and alerts | Missing (B) | See finding B. |

## The 27 checks from the toolkit PDF

| # | Check | Result |
|---|-------|--------|
| 01 | Proper authentication | ✅ Not relevant (no logins) |
| 02 | Hide API keys | ✅ OK |
| 03 | Secure the database | ✅ Not relevant (no database) |
| 04 | Enforce HTTPS | 🟡 Configured, verify on live URL |
| 05 | Hash passwords | ✅ Not relevant |
| 06 | Validate forms on the server | ✅ Not relevant (no server); browser validation in place |
| 07 | Protect against XSS | ✅ OK, tested |
| 08 | Log and monitor suspicious activity | ⬜ Missing (finding B) |
| 09 | Lock down admin routes | ✅ Not relevant (no admin) |
| 10 | Parameterized queries | ✅ Not relevant |
| 11 | Check environment variables | ✅ OK |
| 12 | Rate limiting | ✅ Not relevant (no endpoints) |
| 13 | Restrict CORS | ✅ OK |
| 14 | Security headers | ✅ OK |
| 15 | Secure session cookies | ✅ Not relevant (no cookies) |
| 16 | CSRF protection | ✅ Not relevant |
| 17 | Password reset links expire | ✅ Not relevant |
| 18 | Restrict file uploads | ✅ Not relevant |
| 19 | Verify prices and payments | 🟡 Needs decision (finding A) |
| 20 | Debug mode off | ✅ OK |
| 21 | Update vulnerable dependencies | ✅ OK (none) |
| 22 | Remove unused packages | ✅ OK (none) |
| 23 | Check for exposed files | ✅ OK locally, re-check live |
| 24 | Scan Git history for secrets | ✅ OK |
| 25 | Revoke compromised keys | ✅ Nothing to revoke |
| 26 | Thorough security review | ✅ Done (this document) |
| 27 | Test the protections and report | 🟡 Local tests done, live run pending deploy |

**Score: 23 of 27 closed. 4 open:** #04 and #27 need the live URL, #08 and #19 need your decision.

## How to test

```bash
# 1) Live headers, HTTPS redirect, exposed files, CORS (after deploy)
bash scripts/security-check.sh https://your-live-url

# 2) Secrets in history (any machine with gitleaks installed)
gitleaks git .
```

Manual XSS test: add an item, open the order, type `<img src=x onerror=alert(1)>` as your name and in a note. It must appear as plain text in the preview, with no pop-up.

## Fixes applied

None yet. The site was built with these protections from the start. Fixes A (item codes) and B (monitoring) wait for your approval.
