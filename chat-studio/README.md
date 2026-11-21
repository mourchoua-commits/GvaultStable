# Mini Moi · Chat Studio | GVAULT Stable

La page `chat-studio/index.html` est une conversation autonome, responsive et dotée de 38 fiches documentaires HADOCK.

## Dès l'ouverture, sans configuration

Le modèle **SmolLM2 135M Instruct ONNX q4** commence à se charger automatiquement en arrière-plan sur la page HTTPS, sans compte ni clé API. Le poids quantifié fait environ **182 Mo**. Lorsqu'un utilisateur écrit, son message apparaît immédiatement ; Mini Moi attend que le modèle soit prêt et lui répond localement par fragments.

- Moteur : `mini-moi-local-worker.js` + `@huggingface/transformers@3.8.1` + ONNX Runtime WebAssembly CPU.
- Fichiers récupérés automatiquement chez Hugging Face ; cache navigateur (susceptible d'éviction). **Les 182 Mo ne sont pas stockés dans GitHub**, et on ne peut pas les installer à distance sur le téléphone sans qu'il accède au site.
- Si modèle indisponible (réseau, mémoire, compatibilité), **mode documentaire de secours explicitement indiqué**, jamais présenté comme une réponse IA.
- Les paramètres disposent d'un bouton Réessayer ; il n'est pas nécessaire pour le premier usage.
- Aucun secret, abonnement ni API de chat distante nécessaire pour le mode par défaut.

Détails, limites et licences : [MODELE-LOCAL.md](MODELE-LOCAL.md), [model-manifest.json](model-manifest.json).

## Autres fournisseurs facultatifs

- **Nemotron 3 Ultra** via OpenRouter : clé personnelle, quotas gratuits selon le fournisseur et envoi volontaire des messages au cloud.
- **Passerelle** : URL effective d'une API compatible `/chat/completions` à renseigner.
- **Ollama** : modèle sur ton PC via une URL accessible sur ton réseau, CORS et HTTPS à prendre en compte.
- **Atelier local** : lecture de fiches et réponses documentaires sans modèle génératif, accessible séparément.

Les clés restent dans la mémoire de l'onglet, jamais dans l'historique, les exports ni `localStorage`.

## Historique et UX

- Une seule conversation au premier plan, interface compacte et historique local conservé au format `gvault-stable.chat-studio.v1`.
- Réception immédiate, streaming selon le moteur, trois budgets Rapide / Équilibré / Approfondi. Les petits modèles locaux sont limités à 224 nouveaux jetons pour éviter de saturer le téléphone.
- Stop, brouillons résistants aux rechargements et réponses rattachées à leur conversation d'origine.
- Contexte IA optionnel : maximum trois fiches HADOCK pertinentes ; **ce ne sont pas des capacités installées** ni un accès au GVAULT privé.

## Tests

Les tests en Chromium PC et émulation viewport Android :

```bash
python chat-studio/tests/endurance.py
python chat-studio/tests/ultra_regression.py
python chat-studio/tests/test_free_default.py
python chat-studio/tests/auto_model_test.py
node --check chat-studio/mini-moi-local-worker.js
```

Les tests du modèle utilisent un **Worker simulé** : ils valident le circuit de bout en bout dans l'application, l'absence de configuration, les sélections cloud volontaires et la conservation des messages, **pas l'exécution réelle des 182 Mo sur le téléphone utilisateur**.

## Isolation

Aucun changement à `/index.html` (SAS chiffré), `/manifest.json` (release), `audio-core/`, Route Studio ou aux autres moteurs GVAULT. Cette mise à jour se limite à `chat-studio/` et à son workflow de test.
