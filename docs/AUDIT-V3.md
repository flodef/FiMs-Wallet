# Audit sécurité FiMs Wallet V3 — angle « vol de fonds »

Audit mené sur `FiMs-Wallet-V3` (API Cloudflare Worker + web React + Neon). Correctifs déployés dans les commits `8b37b35`, `595742b`, `6a90f4b`, `9af3f18`.

## Failles trouvées et corrigées

### Haute — squat d'adresse membre → détournement de fonds

`PATCH /fims/users` laissait tout membre changer son `users.address`. Scénario : l'attaquant squatte la pubkey d'un *futur* membre → quand la victime s'enregistre, `users?address=` (trié par id asc) résout la ligne de l'attaquant en premier → la victime voit **son carnet d'adresses** (adresses « Coinbase » contrôlées par l'attaquant) dans le picker de destination → envoi détourné.

**Fix** : `address` et `isPro` sont admin-only dans `updateUser` (403 sinon) + contrainte `UNIQUE` sur `users.address` (migration `0001`, appliquée à Neon — 0 doublon existant).

### Haute — signature non liée au corps ni au host

Le message signé était `method\npath\nts` → une signature capturée (ex. via un `apiEndpoint` malveillant, ou des logs intermédiaires) était rejouable avec un body différent, ou contre le vrai host.

**Fix** : message signé = `fims-wallet-v3\n{HOST}\n{METHOD}\n{PATH}\n{TS}\n{sha256(body)}`. Bug bonus trouvé : l'adaptateur workers expose `request.url` en path relatif → le host est lu depuis le header `Host`.

### Moyenne — écritures comptables ouvertes aux membres

`POST/PATCH/DELETE /fims/transactions` étaient owner-or-admin → n'importe quel membre pouvait injecter de faux dons/dépôts dans sa propre compta (falsifie les totaux communautaires et ses tiers de dons), et `userId` dans le body PATCH permettait de réassigner ses lignes à une victime.

**Fix** : les 3 endpoints sont **admin-only** (l'import se fait en direct DB, pas via l'API) + `userId` retiré du schéma d'update.

### Moyenne — `isPublic` ignoré

7 membres sur 18 avaient `is_public=false` mais leur nom, adresse, positions et historique complet étaient publics via l'API.

**Fix** : données d'un membre privé servies uniquement à lui-même (GET signé) ou à un admin — `users`, `transactions`, `user-historic`, `address-book` filtrés en SQL (le filtre est dans le WHERE, avant LIMIT/OFFSET, sinon la pagination tronquerait les pages).

### Faible

Validation `SolanaAddress` (base58, 32-44 chars) sur `users.address` et `address_book.address` — plus de junk dans le carnet → pas de fausse destination.

## Protection ajoutée — inspection locale des transactions Jupiter

Avant : la tx construite par jup.ag était signée **aveuglément** (standard industrie, mais si l'API Jupiter est compromise, la tx peut vider le wallet).

Maintenant (`packages/solana-client/src/inspect-wire-transaction.ts` + `assertJupiterTransactionSafe`), avant toute signature :

1. Decode la wire transaction + résolution des ALTs (lookup tables)
2. Vérifie fee payer = wallet, signataires requis = wallet (ou déjà signés par Jupiter — keypair éphémère des trigger orders)
3. Allowlist de programmes : aggregator v6, trigger v1/v2 (`j1o2qRpjcy…`), system, token, token-2022, ATA, compute budget, memo, address lookup table
4. Simulation RPC locale (`replaceRecentBlockhash`, `sigVerify: false`)
5. Cap des sorties : SOL natif (lamports + compte wSOL du wallet) et SPL par mint limités au montant déclaré ± tolérance rent/fee (0.006 SOL)

Une simu échouée ou un dépassement → refus avant même de lire la clé privée. Vérifié bout-en-bout contre de vraies txs swap + createOrder Jupiter.

## Protection ajoutée — coûts & abus

- Pagination `limit`/`offset` cappée à 2000 sur tous les GET publics (ordre stable : PK/date + tie-breaker) ; le client boucle les pages (`fimsGetAll`, variantes signées).
- Rate-limit best-effort par IP dans le worker (240 req/min/isolate, GETs). Limitation connue : per-isolate, pas global — la vraie protection reste à faire au niveau zone Cloudflare si besoin.
- `apiEndpoint` (Settings) réservé aux admins : le champ n'est rendu que pour les pubkeys `VITE_ADMIN_ADDRESSES`, et `useFimsEndpoint` ignore tout override stocké pour un compte non-admin (un endpoint malveillant peut servir un carnet d'adresses empoisonné → détournement au picker ; la confirmation d'envoi affiche toujours l'adresse brute à vérifier).

## SNS

Le proxy Bonfida historique (`sns-sdk-proxy.bonfida.workers.dev`) est mort (erreur 1042) → route `/domain` supprimée. Résolution reverse directe via `api.sns.id` : primary/favorite domain, fallback premier domaine owned. `flodef.sol` s'affiche sur la carte membre et le carnet d'adresses.

## Points sains vérifiés (pas de faille)

- **Clés privées** : AES-256-GCM + PBKDF2 600k itérations, vault key en mémoire, CryptoKey non-extractable (qualité Samui)
- **Injection SQL** : tout passe par drizzle paramétré
- **XSS** : aucun `dangerouslySetInnerHTML`, React échappe tout
- **Auth** : ed25519 + fenêtre ±5 min ; `createUser` = self-register uniquement
- **CORS** : restreint à l'origine du web
- **Confirm send** : adresse destination complète affichée (dernière ligne de défense anti-poisoning)

## Restants connus

- Rate-limit global (zone Cloudflare) si le trafic le justifie
- `fimsfi.sol` (résolution forward pour lien audit) — pas implémenté, reverse seulement
