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

## Ultra Smart · Ultra Slim · Ultra Fiable (2026-11-21)

- **Vue compacte par défaut** : menu historique replié ; bouton `▥` pour passer de la vue compacte à l'interface classique, sur PC et mobile. Les conversations et les fonctionnalités d'origine restent disponibles.
- **Contexte documentaire pertinent** : quand un modèle est choisi volontairement, Mini Moi joint au maximum trois fiches de capacités pertinentes à la demande courante. Aucune installation de capacité ni appel réseau supplémentaire. Le réglage est désactivable dans `⚙ → Cerveau léger`.
- **Brouillons résistants aux rechargements** : sauvegarde légère immédiate du texte saisi, associée à la conversation ; la conversation originale reste stockée dans le même format `gvault-stable.chat-studio.v1`.
- **Réessayer manuellement** : après une erreur, le texte du dernier message utilisateur revient dans le champ. Aucun deuxième appel au fournisseur n'est lancé sans action explicite.
- **Contexte borné** : historique de conversation envoyé au modèle limité par un budget en caractères selon le réglage Rapide / Équilibré / Approfondi, sans supprimer les messages stockés localement.
- **Secrets** : clés seulement en mémoire d'onglet, toujours absentes des exports et de `localStorage`. Une clé perdue au rechargement doit être ressaisie.
- **Respect du réel** : en mode local, ce sont des règles et une bibliothèque documentaire, pas un modèle génératif. Les fonctions IA distantes restent opt-in et soumises à l'URL, aux quotas et à la disponibilité des fournisseurs.

### Tests

Lancer les deux suites :

```bash
python chat-studio/tests/endurance.py
python chat-studio/tests/ultra_regression.py
```

La suite `ultra_regression.py` utilise un fournisseur de test simulé, un stockage de session simulé, un catalogue réel, et des écrans PC et Android. Aucune clé ni accès à un modèle distant réel n'est nécessaire. Elle vérifie notamment le mode compact, les brouillons, la sélection des fiches, la non-conservation des clés et l'absence d'erreurs JavaScript. À exécuter sur GitHub Actions pour valider la version déposée.

---

# Mini Moi · IA gratuite par défaut

La page `chat-studio/index.html` propose un **modèle génératif gratuit** dès l'ouverture de la configuration, sans service payant implicite.

- **Cloud gratuit recommandé** : NVIDIA Nemotron 3 Ultra (free), `nvidia/nemotron-3-ultra-550b-a55b:free`, servi par l'API OpenRouter. Une **clé API personnelle** et une connexion Internet restent indispensables. Les quotas des variantes `:free` s'appliquent et peuvent évoluer ; un modèle gratuit n'est pas un serveur sans authentification. La clé demeure dans la mémoire volatile de la page et n'est ni sauvegardée ni intégrée au code publié.
- **Local sans compte** : Qwen3 0.6B ONNX (WebGPU, téléchargement du modèle pouvant dépasser 500 Mo), avec repli SmolLM2 135M (WASM) si WebGPU ou Qwen3 est indisponible. **Téléchargement seulement après clic** ; aucune compatibilité Android universelle n'est promise. Le cache dépend du navigateur. Le modèle n'est pas inclus dans le fichier HTML.
- **Sans activation** : la page conserve le message dans le champ et ouvre la configuration au lieu de prétendre répondre avec un modèle non chargé. L'ancien atelier documentaire reste disponible comme mode séparé.

Aucun téléchargement volumineux, aucune sortie réseau vers un fournisseur d'IA et aucun coût ne sont déclenchés à l'ouverture de la page. Les réponses de fournisseurs externes demandent une activation explicite puis l'envoi volontaire d'un message. Les fonctions de GVAULT Stable, le catalogue des capacités, les réglages personnels et l'historique restent séparés.

**Tests de cette mise à jour** : les contrôles Playwright simulent un endpoint OpenRouter, et simulent le chargement du modèle Qwen3. Ils ne démontrent pas l'accès à une clé réelle ou la compatibilité GPU de chaque téléphone. La suite de tests existante reste exécutée en CI. 

Documentation des sources : https://openrouter.ai/nvidia/nemotron-3-ultra-550b-a55b:free ; https://openrouter.ai/collections/free-models/ ; https://huggingface.co/onnx-community/Qwen3-0.6B-ONNX