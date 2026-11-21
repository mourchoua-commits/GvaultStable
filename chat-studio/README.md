# Mini Moi · Chat Studio | GVAULT Stable

Page autonome : `chat-studio/index.html` et `chat-studio/catalogue.js`.

## Mode d'emploi

Ouvrir le site et discuter avec Mini Moi. Le mode **Atelier local** est actif dès l'ouverture et n'utilise pas de réseau ni de modèle d'IA. Les modes supplémentaires sont configurables via ⚙ :

- **Sur le téléphone** : Transformers.js avec SmolLM2 135M Instruct ; téléchargement volontaire et possibilité d'échec sur les navigateurs aux ressources limitées.
- **OpenRouter** : clé utilisateur conservée en mémoire temporaire ; routeur `openrouter/free` par défaut, disponibilité et quotas variables.
- **Ma Passerelle** : endpoint complet compatible `POST /chat/completions`, modèle et éventuelle clé, fournis par l'utilisateur. La Passerelle existante n'est pas branchée automatiquement.
- **Ollama** : endpoint `POST /api/chat` sur une machine accessible, avec nom du modèle installé. Les restrictions HTTPS/HTTP et CORS peuvent limiter le navigateur.

## Confidentialité et frontières

Historique en localStorage sur l'appareil uniquement, sans synchronisation GitHub. Les clés API sont conservées en **mémoire de page**, jamais dans localStorage ni dans les exports. Les requêtes externes partent uniquement lorsqu'un mode distant est activé et qu'un message est envoyé. Le chargement d'un modèle local est volontaire.

Le catalogue reprend 38 fiches de capacités documentées provenant de HADOCK (fichiers `HADOCK-BLOBS-2086-CATALOGUE.json` et `HADOCK-2086-NOUVELLES-CAPACITES.json`). Il ne donne pas accès à l'ensemble des runtimes ni aux fichiers du GVAULT privé.

## Architecture

Site statique HTTPS. Aucune modification au portail chiffré racine, à `manifest.json`, aux releases ni à `audio-core`. La page ne peut pas héberger secrètement un modèle sur un serveur ni accéder aux données privées sans API et authentification explicites.