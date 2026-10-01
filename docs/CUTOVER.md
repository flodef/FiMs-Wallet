# Cutover DNS `fims.fi` → Cloudflare

La zone `fims.fi` vit chez OVH (NS : `ns111.ovh.net` / `dns111.ovh.net`). Pour
servir les workers sur le vrai domaine, la zone doit passer sous DNS Cloudflare
(OVH reste registrar — seuls les nameservers changent).

## État actuel de la zone (relevé le 2026-XX)

Records à **recréer** dans la zone Cloudflare avant le switch NS :

| Type  | Nom            | Valeur                                        | Note                          |
|-------|----------------|-----------------------------------------------|-------------------------------|
| MX    | `@`            | `mx1.mail.ovh.net` (1)                        | OVH mail — obligatoire        |
| MX    | `@`            | `mx2.mail.ovh.net` (5)                        | OVH mail                      |
| MX    | `@`            | `mx3.mail.ovh.net` (100)                      | OVH mail                      |
| TXT   | `@`            | `v=spf1 include:mx.ovh.com ~all`              | SPF mail                      |
| CNAME | `autodiscover` | `mailconfig.ovh.net`                          | autodiscover OVH              |
| CNAME | `mail`         | `cname.vercel-dns.com`                        | legacy V2 (supprimer au cutover ou garder le temps de la migration) |
| CNAME | `wallet`       | `cname.vercel-dns.com`                        | legacy V2 — remplacé par le worker route `wallet.fims.fi` |

À supprimer (remplacés par les routes workers) :

- `fims.fi` A → `213.186.33.5` (redirect OVH) + TXT `1|https://www.fims.fi`
- `www` CNAME → `ghs.googlehosted.com` (Google Sites)
- `app` A → `213.186.33.5`
- `wallet` CNAME → Vercel (le worker prend le relais via route)

## Procédure

1. Cloudflare dashboard → **Add site** → `fims.fi` (plan gratuit) — note les 2
   nameservers CF fournis.
2. Importe les records ci-dessus (CSV ou à la main). Garde `mail`/`wallet` CNAME
   Vercel tant que le wallet V3 n'est pas routé.
3. OVH → domaine → **Serveurs DNS** → remplacer par les NS Cloudflare.
   Propagation : quelques minutes à 24h.
4. Quand la zone est `Active` côté CF :
   - `apps/landing/wrangler.jsonc` → décommenter routes `fims.fi` + `www.fims.fi`
   - `apps/web/wrangler.jsonc` → ajouter route `wallet.fims.fi` (custom_domain)
   - `apps/api/wrangler.jsonc` → ajouter route `api.fims.fi` (custom_domain)
   - `CORS_ORIGINS` inclut déjà `https://wallet.fims.fi` côté API
   - `wrangler deploy` les 3 apps
5. Front-end : vérifier `VITE_FIMS_API_ENDPOINT` / endpoint par défaut pointe sur
   `api.fims.fi` (sinon maj `apps/web/src/env.ts` avant deploy).
6. Puis : supprimer les CNAME Vercel (`wallet`, `mail`), retirer le site Vercel,
   archiver le projet V2.

## ⚠️ Ne pas casser

- **Mail OVH** : les 3 MX + SPF + autodiscover doivent être présents avant le
  switch NS sinon la boîte mail coupe.
- **`VITE_ADMIN_ADDRESSES`** : vérifier que le build web embarque la bonne clé.
