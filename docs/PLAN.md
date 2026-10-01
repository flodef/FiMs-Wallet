# FiMs Wallet — Plan

Liste triée et dédupliquée.
**Décision V3** : refonte complète depuis samui-wallet → voir `docs/V3.md`.

Tags par item :

- `[V2]` — quick win à faire sur l'app actuelle (utile avant la V3)
- `[V3]` — absorbé par la refonte (inutile de le faire en V2)
- `[ORG]` — hors dev

## Bugs

✅ `[V3→P1]` Transactions des anciens membres : prendre en compte les achats euro→crypto  
  ↳ couvert par `computeFimsPositions` (dépôts euro→crypto : movement=cash investi, amount=unités)

✅ `[V2]` Transactions qui ne se rafraîchissent pas  
  ↳ le guard `tx.length > count` ignorait éditions/suppressions ; l'API est maintenant appliquée de force (fix plus large que la seule déconnexion)

⬜ `[V3]` Cercle/indicateur de chargement pour les prix (natif dans la nouvelle UI)

✅ `[V2]` Bouton pour recharger manuellement les données du portefeuille  
  ↳ icône refresh + `clearData(true)`

✅ `[V3→P4]` Persister la monnaie choisie  
  ↳ setting `fimsCurrency` EUR/USD persisté en DB locale, taux dérivé du prix USDC

## Style / UX

_Tous les items style sont du travail jetable si fait en V2 — sauf mention `[V2]`._

⬜ `[V3]` Migrer Tremor → recharts (absorbé : nouvelle UI Radix + recharts)

⬜ `[V3]` Graphique « liquid » pour les dons

⬜ `[V3]` Refaire complètement le donut

✅ `[V2]` Table détails token : scrollable + label « Transactions » statique + thead sticky

⬜ `[V3]` Rework de la taille du drawer

⬜ `[V3]` Chargement automatique des tables utilisateurs

⬜ `[V3]` Améliorer le composant Popup

✅ `[V2]` Tooltip sur RatioBadge  
  ↳ nouveau prop `tooltip` explicite (le `label` sert à retrouver la donnée)

⬜ `[V3]` Rétablir le swiper  
  ↳ décider si le pattern swipe reste pertinent en V3

## Fonctionnalités

### Transactions on-chain (Jupiter) — `[V3→P2/P4]`

_Regroupe : « Permettre les échanges », « Connecter wallet pour Tx avec Jupiter », « actions acheter/vendre/échanger/envoyer/recevoir », « conversion auto + frais + dépôt/retrait »._

✅ Connecter le wallet pour transactions via Jupiter  
  ↳ onglet Swap : quote lite-api.jup.ag, tx signée par la keypair du compte actif

✅ Actions : acheter, vendre, échanger (send/receive samui + swap Jupiter)

✅ Conversion jeton→jeton avec min reçu + price impact affichés (Jupiter)

✅ Ordres limités via Jupiter Trigger (create/list/cancel, signés wallet)

⬜ Outil de conversion / convertisseur

### Virements & paiements — `[V3→P2/P3]`

_Regroupe : « virements faciles vers les comptes », « carnet d'adresses », « virement depuis profil », « lien Solflare »._

✅ Carnet d'adresses externe (Nexo, Binance, Coinbase, autres Fimseurs)  
  ↳ table Neon `address_book` + API signée `/fims/address-book` + UI dans /fims

✅ Virements faciles vers les différents comptes  
  ↳ carnet d'adresses FiMs injecté comme groupe dans le picker de destination samui

⬜ Virement direct depuis le profil si montant à rembourser

✅ Lien de paiement Solana Pay (bouton copier `solana:<address>` dans Receive)

### Dons & tontine — `[V3→P3]`

✅ Séparer dons tontine / dons association  
  ↳ types `donation`/`tontine` distingués + `donationTarget` affiché

⬜ Onglet « Tontine » complet (fusion de 2 items)  
  ↳ carte Tontine ajoutée au dashboard communauté (investi/valeur) ; onglet dédié reste à faire

⬜ Améliorer le compteur de dons

✅ Explication des dons dans « Mon Profil »  
  ↳ hint 10% des gains → Tontine/association + « restant à donner »

⬜ 1 % sur les conversions tant que dons < 10 %, arrêt à 10 %

⬜ Tiers (base / silver / gold / platinum ?) — à spécifier

### Tokens, indice FiMs & profits — `[V3→P2/P4]`

_Regroupe : « xStocks, Jupiter Lend, Flip + FiMs Token », « migrer vers JUP + BTC & ZCASH & HYPE », « Zcash aux profits + parser tx »._

⬜ Migrer tous les jetons vers JUP

⬜ Ajouter BTC, ZCASH, HYPE + parser les transactions Zcash

⬜ Ajouter xStocks, Jupiter Lend, FLiP

⬜ Jeton « FiMs Token » = indice réel

✅ Prix d'achat moyen + PnL dans détails token  
  ↳ carte Positions : unités, prix moyen, valeur, PnL réalisé+latent  
  ↳ tous jetons, pas juste les 3 FiMs (clarification « vvyvv »)

### Analytics & affichage — `[V3→P4]`

⬜ Compter en SOL / autre devise + graphique (persister le choix)  
  ↳ EUR/USD persisté fait ; SOL + graphiques restent

⬜ Graphique comparatif des monnaies entre elles

⬜ Variation de toutes les monnaies

⬜ RatioBadge : ratios par jour / total (+ tooltip `[V2]`)

⬜ Portfolio : coût de transfert restant + last updated

⬜ Page FiMs : coût de transfert + charité

⬜ Rebalancing (ex : 90/10) : détecter la dérive + proposer un transfert

### Onboarding & profil — `[V3→P2/P3]`

⬜ Import clé privée Solflare à la connexion  
  ↳ natif via `keypair`/`vault` samui

⬜ Changement pseudo / privacy / adresse dans Profile (1×/jour)

✅ `[V2]` Wallet vide → proposer des jetons ; aucun SOL → warning (Alert antd dans Portfolio)

✅ `[V2]` Notification nouvelle transaction (antd notification, remontée par `loadTransactionData`)

### Transparence, pédagogie & confiance — `[V3→P5]`

✅ `[V2]` Disclaimer « pas de conseil en investissement »  
  ↳ footer du dashboard ; version complète en V3 (app + landing)

✅ `[V2]` Lien d'audit jup.ag dans le footer du dashboard  
  ↳ adresse = `FIMS_WALLET_ADDRESS` dans constants.ts

⬜ Page expliquant les différentes cryptos

⬜ Explication des chiffres affichés dans FiMs

✅ `[V2]` Résolution SNS fimsfi.sol via proxy bonfida  
  ↳ affiché à côté du lien audit seulement s'il résout vers l'adresse auditée

### Automatisation — `[V3→P3]`

⬜ Automatisme transactions entrantes : catégorisation auto (don/tontine/invest/conversion) **+** répartition auto des fonds

⬜ Transactions in/out CEX + tontine + conversion

### Gouvernance — `[V3→P5]`

⬜ Outil de vote (fusion des 2 occurrences)  
  ↳ table Neon `votes`

### Refonte

⬜ `[V3]` Refaire le site → **c'est la V3 entière**, voir `docs/V3.md`

## Hors dev / organisation — `[ORG]`

⬜ Vidéos crypto Nexo / Coinbase

⬜ Manuel de continuité + répétition « post mortem » avec Bloopsy  
  ↳ objectif : Flo non indispensable

⬜ Point passation Philo + roadmap

## Quick wins V2 — tous faits ✅

1. ~~Bouton reload + fix refresh transactions~~
2. ~~Warning « aucun SOL » + suggestions wallet vide~~
3. ~~Disclaimer simple + lien audit jup.ag + SNS fimsfi.sol~~
4. ~~Tooltip RatioBadge + table transactions scrollable/sticky~~
5. ~~Notif nouvelle transaction~~

Note : « persister la monnaie choisie » re-taggé V3 (aucun sélecteur de devise n'existe en V2 — fait partie de la feature multi-devise). Tout le reste part en V3.

## Notes de clarification

- « Non-jeton / vvyvv » : affichage de tous les jetons déjà résolu ; le reste = « prix d'achat moyen + PnL ». vvyvv = investisseur avec jetons hors FiMs.
- Disclaimer : app + dashboard public + landing — « pas responsable des pertes, pas un conseil en investissement ».
- Bloopsy : repreneur potentiel ; transmission Philo : passation à une personne.
- Ordres limités : Jupiter Trigger. Automatisme : catégorisation + répartition.
