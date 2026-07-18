# Blobbed security model (MVP)

Not a formal audit. Product positioning: **encrypted-first drive** on Shelby, not “we never see anything.”

## Data paths

| Data | Where | Who can read |
|------|--------|----------------|
| File plaintext | Browser memory only during encrypt/decrypt | User device |
| Ciphertext blob | Shelby storage nodes | Anyone who can fetch blob bytes (useless without DEK) |
| File DEK (raw) | Share URL `#fragment`; briefly in browser when unwrapped | Anyone with the share link |
| File DEK (at rest in library) | Neon / localStorage as `bw1.…` wallet-wrapped blob | Server stores ciphertext of DEK; unwrap needs wallet signature-derived vault key |
| Names, sizes, thumbs, blob pointers | Neon library meta | Backend + DB operators |
| Wallet address | Session + library owner field | Backend (identity) |

## Wallet key wrap (v1)

1. User connects wallet (session flag `blobbed_session`).
2. App requests `aptos:signMessage` with **fixed** nonce `blobbed-vault-v1`.
3. `SHA-256("blobbedv1" || lower(address) || sigBytes)` → AES-256-GCM vault key.
4. Each file DEK is wrapped → stored as `bw1.` + base64(iv‖ciphertext).
5. Legacy plain base64 DEKs migrate on unlock (`migratePlainKeys`).
6. Vault signature cached in `sessionStorage` for the tab session; cleared on disconnect.

**Caveats**

- Determinism depends on wallet returning a stable signature for the same message+nonce.
- sessionStorage holds the raw signature (not ideal on shared machines) — tab-scoped convenience.
- Thumbs (`thumb_data_url`) are plaintext previews in meta by design (small JPEG).

## Share links

- Payload (including raw DEK) lives only in URL **fragment**.
- `POST /api/upload` accepts **ciphertext only** — never a file key.
- No server-side “Shared with you” inbox (capability model). Lose link → lose access.

## Upload economics (MVP)

- Browser encrypts → `POST /api/upload` with `encryptedBase64`.
- Service account (`APTOS_PRIVATE_KEY`) signs Shelby registration and pays APT + ShelbyUSD on **shelbynet**.
- User wallet = library identity + vault unlock, not gas payer (yet).

## Production checklist

1. Vercel env: `DATABASE_URL` (Neon) → multi-device meta.
2. Vercel env: `APTOS_PRIVATE_KEY` + `APTOS_NETWORK=shelbynet`.
3. Fund service wallet: APT (gas) + ShelbyUSD (storage) — see [Shelby Petra setup](https://docs.shelby.xyz/tools/wallets/petra-setup).
4. Confirm drive status: `Library synced (Neon)` + `Keys wrapped`.
5. Never commit private keys; rotate service wallet if leaked.

## API surface (keys)

| Endpoint | Keys? |
|----------|--------|
| `POST /api/upload` | No — ciphertext + owner address only |
| `POST /api/library` addFile | May store **wrapped** `encryptedKey` string (owner-supplied meta) |
| Share open | Client-only `parseShareFragment` — no API |

## Residual risks

- Malicious/compromised frontend build can exfiltrate keys after unwrap.
- XSS = game over for session vault.
- Service wallet is a hot key with funds.
- Pre-migration legacy rows may still have plain DEKs until user unlocks once.
- Share links are bearer tokens — treat like passwords.
