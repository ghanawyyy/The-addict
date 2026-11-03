#!/usr/bin/env bash
# Quick live checks for The Addict website.
# Usage: bash scripts/security-check.sh https://your-domain.com
# Checks: HTTPS redirect, security headers, exposed files, CORS.
set -u
URL="${1:?Usage: bash scripts/security-check.sh https://your-domain.com}"
URL="${URL%/}"
HOST="${URL#https://}"
pass=0; fail=0
ok()  { echo "  OK    $1"; pass=$((pass+1)); }
bad() { echo "  FAIL  $1"; fail=$((fail+1)); }

echo "== HTTPS =="
code=$(curl -s -o /dev/null -w "%{http_code}" "http://$HOST/")
loc=$(curl -s -o /dev/null -w "%{redirect_url}" "http://$HOST/")
if [[ "$code" =~ ^30[178]$ && "$loc" == https://* ]]; then ok "http:// redirects to https ($code)"; else bad "http:// did not redirect to https (got $code)"; fi

echo "== Security headers =="
headers=$(curl -sI "$URL/")
for h in content-security-policy strict-transport-security x-frame-options x-content-type-options referrer-policy permissions-policy; do
  if grep -qi "^$h:" <<<"$headers"; then ok "$h"; else bad "missing $h"; fi
done

echo "== Exposed files (must be 404) =="
for p in /.env /.env.local /.git/config /.git/HEAD /vercel.json /README.md /scripts/security-check.sh /.gitignore /backup.zip /package.json; do
  c=$(curl -s -o /dev/null -w "%{http_code}" "$URL$p")
  if [[ "$c" == "404" ]]; then ok "$p -> 404"; else bad "$p -> $c"; fi
done

echo "== CORS (no wildcard) =="
acao=$(curl -sI -H "Origin: https://evil.example" "$URL/" | grep -i '^access-control-allow-origin:' || true)
if [[ -z "$acao" ]]; then ok "no Access-Control-Allow-Origin for foreign origin"; else bad "CORS header present: $acao"; fi

echo "== Clickjacking =="
if grep -qi "frame-ancestors 'none'" <<<"$headers"; then ok "frame-ancestors 'none'"; else bad "page can be framed"; fi

echo
echo "Passed: $pass   Failed: $fail"
[[ $fail -eq 0 ]]
