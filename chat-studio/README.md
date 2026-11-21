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

## Session d'endurance et réponses progressives (novembre 2026)

Le sélecteur de profondeur permet trois budgets de réponse : **Rapide** (500 jetons), **Équilibré** (1 400) et **Approfondi** (3 500, valeur par défaut) pour les API compatibles. Il ne force pas le modèle à réfléchir un certain temps et ne divulgue pas de raisonnement caché. Le message est accusé réception immédiatement ; un fournisseur qui accepte `text/event-stream` affiche ses fragments au fil de la génération. Une API non-streaming est affichée après sa réponse complète. Ollama supporte également le flux NDJSON. Les modèles exécutés dans le navigateur répondent en bloc si leur moteur n'expose pas de flux.

L'utilisateur peut interrompre une réponse avec **Stop** ; le texte partiel reçu est conservé. Une réponse reste attachée à la conversation où elle a commencé, même si une autre discussion est ouverte pendant le traitement. La sauvegarde locale, les 38 fiches de capacités et les clés non persistées sont préservées.

Un auto-test synthétique de 200 cycles se trouve dans les paramètres ; il n'envoie aucun message à une API. Pour la vérification réelle avec Chromium, exécuter `python chat-studio/tests/endurance.py` après avoir installé Playwright et Chromium. Le workflow GitHub Actions `chat-studio-endurance.yml` peut répéter ce contrôle depuis une PR ou manuellement. Les tests utilisent des fournisseurs **simulés** et ne garantissent pas le débit ni les quotas d'une vraie API.