# GAME VAULT — GLOBAL CENSUS GU1.1 CHECK-UP REPAIR

Correctif ciblé du check-up GU1.

## Réparations
- 6 projets documentaires (`playable:false`) ne sont plus considérés comme des builds HTML.
- Les builds GU1 courantes deviennent autorité après montage VFS et sont réconciliées dans `/games/<id>/current.b64`.
- Les `current.b64` obsolètes des projets sans build sont retirés.
- `forgeBtn` et `assistantConfigBtn` sont raccordés dans `initCoreLaunchers()`.
- Les assertions Agent Dojo dépendantes du registre utilisent désormais l’état courant au lieu des chiffres de l’ancien census.

## Contrat attendu
- projets : 29
- builds attendues : 23
- projets sans build par conception : 6

## Preuves
- QA statique : 28/28 PASS
- Source GU1.1 : `57665decafa76efdb1d2905b0ef9d45e56fd9fbf1528147a49ae7ecd284c957f`
- PHONE_LOCK GU1.1 : `89f1df03b5c390aa6d641b3706d5a012e739c94695f63352f9d44a4cc0643646`
- Le wrapper de sas est inchangé hors payload gzip.
- Validation navigateur complète : **INCONCLUSIVE** dans ce harness (package VFS absent lors du chargement isolé).

Voir `CHECKUP_REPAIR_GU1_1_QA.json`, `GLOBAL_CENSUS_GU1_to_GU1_1_CHECKUP_REPAIR.patch` et `ROLLBACK_GU1_1.md`.
