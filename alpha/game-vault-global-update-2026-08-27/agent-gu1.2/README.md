# GAME VAULT — GU1.2 · AGENT MAX

Statut : **candidate testée, non promue automatiquement**.

## Résultat

L’Agent de GU1.1 a été réparé puis enrichi à partir de ressources confirmées du dépôt privé, sous forme d’un snapshot local **sanitisé**. Il ne reçoit ni token GitHub ni accès privé silencieux.

QA : **39 PASS · 0 FAIL · 1 INCONCLUSIVE**. L’inconclusif est le test Chromium : la politique du navigateur géré bloque la navigation locale avant l’exécution du Vault.

## Réparations principales

- cible explicite dans la requête > contexte UI ;
- refus des actions ambiguës ;
- budget de panne borné au lieu d’un arrêt complet au premier incident non critique ;
- provenance/confiance pour les règles apprises ;
- Dojo étendu aux contrats actuels.

## Capacités ajoutées

- 10 sources privées sanitisées avec provenance ;
- Che_kCa + FiCsa ;
- action-ledger + undo non destructif ;
- Vigie / preuve réelle / `unproven` ;
- Conversation Workflow ;
- Private First ;
- sécurité gateway / preview ;
- Branche Source et prudence hypothèse≠vérité ;
- GData mobile QA ;
- mémoire bornée de preuves et trace de décisions/actions ;
- auto-diagnostic Agent.

## Invariants sécurité

Aucun `fetch` privé ajouté, aucun `MutationObserver` global ajouté, aucun secret embarqué, et le runtime indique que le dépôt privé n’est **pas lu en direct**.

## Identité des livrables

- source : `b62068dd783d6ee51bef671edc5b07d6897d4385540e2a868ead7277b403c0fb` · 22014204 octets
- PHONE_LOCK : `6af7f0d314a8050492cc1ff69f1d601d0e917c573b0b3d86678ce0d3b02a2cb0` · 27791597 octets
- patch GU1.1→GU1.2 : `89b042e75c04f8ca2eb72442da08d58f84767135e305ad81e8c08cc9d8b4648d` · 28296 octets

## Promotion

Cette candidate ne devient pas OFFICIELLE par son seul numéro. La prochaine preuve forte est un lancement réel de la PHONE_LOCK sur l’appareil cible, suivi de Check-up + Agent Dojo.
