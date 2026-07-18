# Blobbed production checklist

Live: https://blobbed.vercel.app  
Health: https://blobbed.vercel.app/api/status

## Required Vercel env

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon Postgres — multi-device library meta |
| `APTOS_PRIVATE_KEY` | Service wallet for Shelby uploads |
| `APTOS_NETWORK=shelbynet` | Must be shelbynet for ShelbyUSD storage |

Optional:

| Variable | Default |
|----------|---------|
| `LIBRARY_SESSION_SECRET` | falls back to `APTOS_PRIVATE_KEY` |
| `UPLOAD_MAX_PER_HOUR` | `30` |
| `MAX_UPLOAD_BYTES` | `10485760` (~10MB encrypted body) |
| `VITE_APTOS_NETWORK` | `shelbynet` (browser download client) |
| `SHELBY_API_KEY` / `APTOS_API_KEY` | if Shelby gateway requires it |

After any env change: **Redeploy** (Vercel → Deployments → Redeploy).

## Verify (curl)

```bash
# Health — expect ready:true, db.backend neon, shelby.configured true
curl -sS https://blobbed.vercel.app/api/status | jq .

# Auth gates
curl -sS -X POST https://blobbed.vercel.app/api/upload \
  -H 'content-type: application/json' \
  -d '{"encryptedBase64":"YQ==","fileName":"t","ownerAddress":"0x1"}'
# → AUTH_REQUIRED

curl -sS -X POST https://blobbed.vercel.app/api/library \
  -H 'content-type: application/json' \
  -d '{"op":"createFolder","ownerAddress":"0x1","name":"x"}'
# → AUTH_REQUIRED

# Legacy mutations locked
curl -sS -X POST https://blobbed.vercel.app/api/folders \
  -H 'content-type: application/json' \
  -d '{"ownerAddress":"0x1","name":"x"}'
# → 410 USE_LIBRARY_API
```

## Security headers

Response should include:

- `content-security-policy`
- `x-frame-options: DENY`
- `x-content-type-options: nosniff`
- `referrer-policy: no-referrer`

## Service wallet funding

1. Open `/api/status` → copy `shelby.serviceAddress`
2. Fund **APT (gas) + ShelbyUSD (storage)** on **shelbynet**  
   https://docs.shelby.xyz/tools/wallets/petra-setup
3. Generate new key locally if needed: `npm run wallet:service`  
   Put private key only in Vercel env — never commit.

## App smoke (manual)

1. Hard refresh drive
2. Connect wallet → vault sign → library session sign
3. Status line: **Library synced (Neon)** + **Keys wrapped**
4. Upload small image → queue progress → appears in grid
5. Preview modal + share sheet
6. Second browser/device same wallet → library appears (Neon)

## Failure map

| Symptom | Fix |
|---------|-----|
| `Library local-only` / memory | Set `DATABASE_URL`, redeploy |
| `MISSING_APTOS_PRIVATE_KEY` | Set `APTOS_PRIVATE_KEY`, redeploy |
| `INSUFFICIENT_FUNDS` | Fund ShelbyUSD + APT on shelbynet for service address |
| Upload `AUTH_*` | Reconnect wallet (need publicKey + signMessage) |
| Stale chunk 404 after deploy | Hard refresh (auto-reload once is built-in) |
| Vault every refresh | Expected — memory-only vault |

## API surface (prod)

| Route | Auth |
|-------|------|
| `GET /api/status` | Public health |
| `GET /api/library?owner=` | Public meta (wrapped keys only) |
| `POST /api/library` | Session ticket or owner auth |
| `POST /api/upload` | Owner auth over ciphertext hash |
| `GET /api/files`, `GET /api/folders` | Read-only legacy |
| `POST/PATCH/DELETE` legacy files/folders/shares | **410 locked** |
