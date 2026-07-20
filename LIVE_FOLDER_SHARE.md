# Aegis Live Folder Share — Design

**Date:** 2026-07-20  
**Status:** Approved for planning (pending final user review of this file)  
**Product:** Aegis (repo: blobbed)  
**Replaces (folder path):** snapshot-only `/view#` JSON payload that embeds every file DEK

## Problem

1. Folder share links are long: full per-file `{a,n,k,name,mime,size}` lives in the URL fragment.
2. Folder share is a **snapshot**. Adding a file after share does not appear for viewers; owner must mint a new link.

User wants **live folder share**: one stable capability link; viewers always see current folder contents.

## Goals

- Live folder: new uploads appear for existing link holders without a new URL.
- Capability link: anyone with the URL, no wallet.
- Short link (share id + folder key only in fragment).
- File removed from folder → disappears from viewer list.
- Folder deleted → link dead.
- Owner can **revoke** and **rotate** (old link dies; new link issued).
- Preserve Aegis privacy baseline: raw DEKs and folder key never sent to our API as query/body; server never stores raw DEK or FK.

## Non-goals (MVP)

- Wallet ACL / invite-only viewers
- Live single-file share (keep existing snapshot file share)
- Server “Shared with you” inbox
- Password-gated links
- Changing Phase B media/MSE pipeline beyond consuming `encFormat` from index

## Current behavior (baseline)

- `scripts/share.ts` builds `FolderSharePayload` with unwrapped raw DEKs per file, base64url JSON in `#fragment`.
- `GET` style server shares disabled (`api/shares.ts` → 410 `FRAGMENT_SHARES_ONLY`).
- Owner library: DEKs as `bw1.…` (wallet vault); thumbs `bt1.…`.
- Ciphertext on Shelby; meta on Neon via authenticated `POST /api/library`.

## Chosen approach

**Folder-key hierarchy + public share index (Approach A).**

Rejected:

- **B — Encrypted manifest blob on Shelby:** short link possible, but every add/delete rewrites a blob (gas/latency/races); weaker fit for frequent album updates.
- **C — Server holds DEKs behind token:** simplest UX, breaks “keys not on our API” and elevates DB breach to full decrypt.

## Cryptography

### Keys

| Key | Life | Storage |
|-----|------|---------|
| File DEK (32 B) | Per file | Owner: `encrypted_key` = `bw1(DEK)`. Share path: `folder_wrapped_key` = `fk1(DEK)`. |
| Folder key FK (32 B) | Per folder (stable until rotate) | Owner only: `folders.folder_key_wrapped` = `bw1(FK)`. In share URL fragment only for viewers. |
| Owner vault key | Tab memory after sign | Unchanged (`blobbed-vault-v1` nonce, etc.) |

### Wrap formats

- Reuse AES-GCM wrap framing from `scripts/key-wrap.ts` (`bw1.` prefix today).
- Add **`fk1.`** prefix: same AEAD structure as `bw1`, but key material is FK (not vault key).
- Never put `bw1.…` or raw DEK into public share API or URL query.
- Share fragment carries **raw FK** (capability), analogous to today’s raw DEK in snapshot links.

### Link format

```
{origin}/view#s1.{shareId}.{fk_base64url}
```

- `s1` = scheme version for live folder capability.
- `shareId` = public UUID (or URL-safe id) of `folder_shares` row.
- `fk_base64url` = unpadded base64url of 32-byte FK.
- FK stays in fragment only; `GET /api/share/:shareId` must not require or accept FK.

### Backward compatibility

- Existing `#` base64url JSON (`v:1`, `type: folder|file`) and legacy pipe/hash forms remain parseable.
- ViewPage branches: `s1.` → live folder mode; else → snapshot mode.

## Data model

### `folders` (extend)

| Column | Type | Notes |
|--------|------|--------|
| `folder_key_wrapped` | TEXT NULL | `bw1(FK)`; null until first enable-share (or explicit prepare) |

### `files` (extend)

| Column | Type | Notes |
|--------|------|--------|
| `folder_wrapped_key` | TEXT NULL | `fk1(DEK)`; required for inclusion in live index |

### `folder_shares` (new; replace unused mock semantics of old `shares`)

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | public `shareId` |
| `owner_address` | VARCHAR(66) | |
| `folder_id` | UUID FK → folders | ON DELETE CASCADE |
| `status` | TEXT | `active` \| `revoked` |
| `created_at` | TIMESTAMPTZ | |
| `revoked_at` | TIMESTAMPTZ NULL | |
| `rotated_from` | UUID NULL | optional lineage |

Constraints/indexes:

- At most one **active** share per folder (enforce in app or partial unique index).
- Index `(folder_id)`, `(owner_address)`, `(status)`.

Old `shares` table (file_id + share_token) stays unused / not wired; do not revive token-DEK pattern.

### Memory fallback

When `DATABASE_URL` unset, mirror structures in process memory (same as library) so local dev works; document that live share public GET needs durable backend in prod.

## API

### Owner — via `POST /api/library` (session or owner auth)

| op | Purpose |
|----|---------|
| `enableFolderShare` | Ensure folder row; accept client-provided `folderKeyWrapped` if first time; mint active share if none; return `{ shareId, folderId, name }` — **not** FK |
| `revokeFolderShare` | `shareId` or `folderId` → status `revoked` |
| `rotateFolderShare` | Revoke active; client has re-wrapped all `fk1` under **new** FK and updated `folder_key_wrapped` + file wraps; mint new shareId; return new id |
| `listFolderShares` | Optional: active/revoked metadata for Drive UI |
| Existing `addFile` / `moveFile` / `rename*` / `delete*` | Persist new columns; `addFile` accepts optional `folderWrappedKey` |

Client responsibilities before `enableFolderShare` / after rotate:

1. Vault unlocked.
2. FK generated or unwrapped from `folder_key_wrapped`.
3. Every file in folder has fresh `folder_wrapped_key` (`fk1`).
4. Persist file/folder meta updates (sync or granular ops), then enable/rotate.

### Public — `GET /api/share/:shareId`

- No auth.
- Rate limit by IP (reuse existing limiter patterns).
- **404** if unknown id.
- **410** if `revoked` OR parent folder missing (delete cascade / orphan).
- **200** body:

```json
{
  "v": 1,
  "type": "folder-live",
  "shareId": "…",
  "name": "Album",
  "updatedAt": "ISO-8601",
  "files": [
    {
      "id": "file-uuid",
      "name": "a.jpg",
      "mime": "image/jpeg",
      "size": 12345,
      "a": "0x…",
      "n": "blobbed/…/…",
      "fk": "fk1.…",
      "encFormat": "legacy"
    }
  ]
}
```

Inclusion rules:

- `files.folder_id = share.folder_id`
- `folder_wrapped_key` IS NOT NULL and starts with `fk1.`
- Never return `encrypted_key` / `bw1` / owner vault material
- Prefer omit `owner_address` from public JSON

Cache: `Cache-Control: no-store` (live list).

### Disabled paths

- Keep `api/shares.ts` mutation mock at 410 or repurpose only if routing cleanly to document public GET elsewhere (`api/share/[id].ts`). Prefer **`/api/share/:id`** new route, leave legacy `/api/shares` 410.

## Client flows

### Drive — share folder

1. Unlock vault if needed.
2. Load/create FK; persist `folder_key_wrapped`.
3. For each file in folder missing/outdated `fk1`, wrap DEK with FK and save meta (“Preparing share…”).
4. `enableFolderShare` → `shareId`.
5. Build `origin/view#s1.{shareId}.{fk_b64url}`; ShareSheet copy.
6. UI actions: **Copy live link**, **Revoke**, **Rotate** (rotate = new FK + re-wrap all + new shareId).
7. Copy: “Anyone with the link. New files show up automatically. Revoke anytime.”

### Drive — upload into folder

- If folder has FK (unwrap from `folder_key_wrapped`): write `folder_wrapped_key` with `fk1(DEK)` on addFile.
- If no FK yet: `bw1` only (today).

### Drive — move file

- Into folder with FK: set `folder_wrapped_key` for destination FK.
- Out of folder / other folder: clear or replace wrap; old live index drops file automatically via `folder_id` filter.

### Drive — delete file / delete folder

- Delete file: gone from index.
- Delete folder: CASCADE shares → public GET 410.

### ViewPage — live mode

1. Parse hash `s1.` → `{ shareId, fk }`; keep FK in memory only.
2. `GET /api/share/:shareId`.
3. Map errors to existing brand error UI (revoked / missing / network).
4. For each file: unwrap `fk` with FK → existing Shelby download + decrypt + lightbox.
5. Refresh: button + revalidate on `visibilitychange` / window focus; optional light poll 15–30s while tab visible (MVP: focus + button is enough if poll is costly).
6. Header: live folder name + “Live folder” affordance.

### ViewPage — snapshot mode

Unchanged parser path for old links.

## Security invariants

1. Raw DEK and FK never in query string or request body to Aegis API.
2. Public index may expose names, sizes, mime, Shelby coordinates, and `fk1` wraps only.
3. Without FK, `fk1` blobs are useless (same class as today’s snapshot: capability = secret in link).
4. Revoke removes index; rotate changes FK so old fragments cannot unwrap new wraps.
5. Owner `bw1` keys never appear on `GET /api/share`.
6. Rate-limit public GET; no directory listing of all shareIds.
7. Honest TrustPanel copy: live share is still capability secrecy; lose link ≈ lose access; revoke is server-side kill switch for **index**, not proof against someone who already downloaded ciphertext+DEK while active.

## Threat notes (accepted)

- Server/meta breach: metadata + `fk1` without FK → no plaintext files.
- Link leak: full read of current and future files until revoke/rotate (by design of capability live folder).
- Viewer who saved files offline while link was live keeps those bytes (cannot retroactively erase downloads).
- Malicious deploy of frontend could exfiltrate FK from fragment (same class as current DEK-in-fragment).

## UX copy (product)

- Brand: **Aegis** (not Blobbed) in user-facing strings.
- Share sheet: live folder language; no claim of ACL.
- Preparing share progress when wrapping many files.

## Testing

- Unit: `fk1` wrap/unwrap; fragment parse `s1`; reject FK in API bodies if accidentally sent.
- Integration: enable → public GET lists N files → addFile with `fk1` → GET lists N+1 → delete file → N → revoke → 410 → rotate → old 410, new 200.
- E2E smoke: mock or local memory backend; ViewPage live header; old snapshot link still opens.
- Regression: wallet vault `bw1` path; single-file snapshot share.

## Rollout

1. Schema + db helpers + public GET + library ops (feature-flag unnecessary if client only emits `s1` after wrap path ships together).
2. Client key-wrap + share.ts + Drive share sheet + upload/move hooks.
3. ViewPage live branch.
4. Docs: SECURITY.md / TrustPanel one paragraph; landing “Capability shares” note live folder.
5. Prod: migrate Neon columns via `ensureSchema`; verify Render env unchanged.

## Implementation order (for plan skill)

1. Crypto `fk1` + tests  
2. Schema + db read/write  
3. Library ops enable/revoke/rotate + addFile field  
4. Public GET `/api/share/:id`  
5. Client prepare/enable + ShareSheet  
6. Upload/move write `fk1`  
7. ViewPage live  
8. Copy/TrustPanel + manual verify  

## Open decisions (resolved)

| Topic | Decision |
|-------|----------|
| Who can open | Anyone with link (capability) |
| File remove | Drop from live list |
| Folder delete | Link dead |
| Revoke without delete folder | Supported |
| Rotate | New shareId + new FK + re-wrap |
| Single-file | Snapshot remains MVP |

## References (code today)

- `scripts/share.ts` — snapshot encode/parse  
- `scripts/key-wrap.ts` / `scripts/vault.ts` — `bw1`, vault  
- `api/lib/db.ts` — folders/files/shares DDL  
- `api/shares.ts` — disabled server tokens  
- `src/pages/ViewPage.tsx` — fragment consumer  
- `src/components/feature/share/ShareSheet.tsx` — copy UX  
