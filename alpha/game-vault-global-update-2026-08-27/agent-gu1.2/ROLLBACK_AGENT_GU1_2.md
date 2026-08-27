# ROLLBACK — GU1.2 AGENT MAX

Base de retour : **GU1.1 CHECKUP REPAIR**.

La modification est isolée par le patch `GLOBAL_CENSUS_GU1_1_to_GU1_2_AGENT_MAX.patch`.

## Identités
- GU1.2 source SHA-256 : `b62068dd783d6ee51bef671edc5b07d6897d4385540e2a868ead7277b403c0fb`
- GU1.2 PHONE_LOCK SHA-256 : `6af7f0d314a8050492cc1ff69f1d601d0e917c573b0b3d86678ce0d3b02a2cb0`

## Stratégie
1. Ne pas reset/force-push une branche canonique.
2. Pour GitHub, revenir par commit de revert si GU1.2 a été promue.
3. Pour un fichier local, réutiliser la PHONE_LOCK GU1.1 conservée dans le pack de continuité précédent.
4. Ne jamais restaurer un ancien canal de secret ou une sécurité obsolète seulement pour retrouver un comportement fonctionnel.

GU1.2 est actuellement une candidate : aucune OFFICIELLE n’est écrasée par ce lot.
