# Mini Moi · modèle local intégré, sans configuration

Cette page charge automatiquement **SmolLM2-135M-Instruct** depuis Hugging Face lorsqu'elle est ouverte depuis GVAULT Stable en HTTPS. Le chargement a lieu **sans clic**, sans compte et sans clé API. Dès que l'utilisateur envoie un premier message, Mini Moi attend le modèle si nécessaire et répond dans sa conversation.

## Moteur

- **Poids ONNX quantifiés q4** : `onnx-community/SmolLM2-135M-Instruct-ONNX-MHA`, environ 182 Mo pour `onnx/model_q4.onnx`, auxquels s'ajoutent les fichiers de configuration, tokenisation, WASM et runtime.
- **Origine du modèle** : `HuggingFaceTB/SmolLM2-135M-Instruct`, licence Apache-2.0.
- **Runtime** : `@huggingface/transformers@3.8.1`, WebAssembly/CPU, dans un Web Worker de `mini-moi-local-worker.js`.
- **Mémoire des poids** : cache navigateur via `env.useBrowserCache=true` et `env.useWasmCache=true`, dans les limites de stockage ou d'éviction de chaque navigateur.
- **Streaming** : `TextStreamer` envoie les fragments dans Mini Moi ; génération locale et aucune API d'inférence externe pendant les réponses locales.
- **Compatibilité** : principalement navigateurs Android/PC modernes en HTTPS avec module Web Workers et WebAssembly. Le premier téléchargement dépend du réseau. La vitesse et les ressources nécessaires dépendent du matériel.

**Distinction essentielle** : le dépôt GitHub contient *la configuration réelle du moteur et son worker*, mais **pas les 182 Mo de poids**. Ils sont téléchargés automatiquement par le navigateur depuis le modèle public Hugging Face à la première ouverture. Ils ne peuvent pas être préinstallés à distance dans un téléphone depuis GitHub. Le cache peut être vidé par le navigateur. Une ouverture hors ligne complète n'est pas garantie si les ressources CDN ou la page ne sont pas mises en cache.

## Échecs et sécurité

- En cas d'indisponibilité du réseau, de place ou de WebAssembly, Mini Moi indique clairement **« réponse documentaire de secours »**, et ne prétend pas que le modèle IA a répondu.
- Le premier message est conservé pendant le chargement. Aucun bouton d'installation n'est requis.
- Les réglages gardent un bouton **Réessayer**. Les fournisseurs OpenRouter, Passerelle, Ollama sont conservés et restent facultatifs.
- Aucun token ni clé préinstallés ou stockés dans les conversations.
- Le modèle compact peut donner des réponses incorrectes et n'atteint pas les performances de gros modèles cloud.

## Vérification

Tests de simulation Playwright PC/mobile : `tests/auto_model_test.py` (Worker simulé, démarrage automatique, réponse progressive, sauvegarde) ; `tests/test_free_default.py` (option cloud facultative, secret non persistant). Tests d'architecture : `node --check mini-moi-local-worker.js` et validation du script principal.

**Les tests en simulation ne démontrent pas un téléchargement de 182 Mo ni l'inférence sur le téléphone de l'utilisateur.** Pour vérifier la réalité : ouvrir `https://mourchoua-commits.github.io/GvaultStable/chat-studio/` dans un navigateur compatible, suivre « Téléchargement SmolLM2 », attendre « modèle prêt », puis demander « Explique-moi les blobs en trois phrases ». Vérifier qu'aucune clé n'est demandée et que l'option IA intégrée est sélectionnée.

Sources :

- https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- https://huggingface.co/onnx-community/SmolLM2-135M-Instruct-ONNX-MHA
- https://huggingface.co/docs/transformers.js/v3.8.1/api/generation/streamers
- https://huggingface.co/docs/transformers.js/en/api/env