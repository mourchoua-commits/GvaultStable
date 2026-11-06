# Preuves techniques • 2026-11-06

- Node v22 : syntaxe du script de la station, du Studio 2078 plus adaptateur et du client ACE-Step vérifiée.
- Chromium par injection HTML (page.set_content) : génération 16 pas, mutation, modification, « j'aime », lecture/arrêt Web Audio, vocalises, export du projet JSON : vérifiés.
- Capture MediaRecorder du master : WebM non vide d'environ 35 Ko. Aucune erreur JavaScript dans les tests de page.
- Port ACE-Step testé avec des réponses d'API simulées (/health, /release_task, /query_result et chemin /v1/audio). Aucun modèle neuronal n'a été lancé.
- Les fichiers originaux des ateliers sont séparés ; Studio 2078 reçoit un adaptateur postMessage, pas une réécriture de son moteur.

## Limitations explicites
- Chromium automatisé bloque la navigation vers file:// dans cet environnement ; l'injection de HTML ne prouve pas le fonctionnement Android.
- Micro matériel, ACE-Step réel, Hugging Face inference et radio Internet non testés.
- Les exports WAV/MIDI relèvent du Studio 2078 réutilisé. Le cœur central enregistre en WebM/OGG selon MediaRecorder.
- Pas de benchmark « supérieur à Suno ».
