# GvaultStable

Dépôt **public** de référence de GVAULT / GAME VAULT. Il conserve une base de consultation et des expériences isolées. **« Stable » décrit son rôle de référence, pas la garantie qu'il est à jour ni que toutes ses fonctions ont été retestées.**

Ce dépôt est distinct de [Gvault-Pages](https://github.com/mourchoua-commits/Gvault-Pages), la surface publique plus expérimentale. Le dépôt source `Gvault` reste privé.

## Se repérer

| Emplacement | Rôle observé |
| --- | --- |
| [`index.html`](index.html) | Page GAME VAULT de référence. |
| [`manifest.json`](manifest.json) | Métadonnées du paquet Vault chiffré et historique des références. |
| `vault.<empreinte>.bin` | Charge chiffrée désignée par le manifeste ; ne pas modifier séparément. |
| [`alpha/`](alpha/) | Expériences de validation, dont Button Lab et des sous-répertoires historiques. Ne pas les assimiler à la page principale. |
| [`private-catalog/`](private-catalog/) | Catalogue chiffré et manifeste visibles dans ce dépôt **public**. Le nom « private » n'est pas un contrôle d'accès. |
| [`previews/`](previews/) | Références d'aperçus associés aux versions antérieures. |
| [`.github/workflows/`](.github/workflows/) | Vérifications Button Lab et export de snapshots. |

## Repère de vérification du 5 novembre 2026

- La branche par défaut était `main`.
- Le dernier commit observé sur `main` datait du **29 août 2026**.
- La dernière exécution observée du déploiement GitHub Pages avait réussi le **11 septembre 2026**. Cette réussite ne démontre pas un fonctionnement intégral du site.
- Le manifeste consulté déclarait **R5.6.2**, publié le **26 août 2026**, avec la même empreinte de paquet chiffré que le dépôt Gvault-Pages.
- Une [pull request expérimentale en brouillon](https://github.com/mourchoua-commits/GvaultStable/pull/1) restait ouverte. Ne pas la fusionner sans examiner ses effets.

Les dates ci-dessus sont celles du contrôle, pas une promesse de fraîcheur permanente.

## Règles de maintenance prudente

1. Conserver la filiation historique : ne pas remettre `main` à zéro, fusionner des sauvegardes, déplacer des branches ou effacer des expériences sans analyse préalable.
2. Ne pas recopier automatiquement la version de `Gvault-Pages` : les deux dépôts n'ont pas le même objectif.
3. Traiter tout élément du dépôt comme **public**, même si un chemin s'appelle `private-files` ou `private-catalog`. Vérifier qu'aucun secret ni contenu privé en clair n'y est ajouté.
4. Conserver la cohérence `manifest.json` / `vault.<empreinte>.bin` et l'historique des aperçus.
5. Utiliser une branche de maintenance et une pull request ; tester la page, Button Lab et les éventuels parcours mobiles avant toute fusion technique.

Ce README améliore la navigation du dépôt sans altérer le runtime ni le contenu chiffré.
