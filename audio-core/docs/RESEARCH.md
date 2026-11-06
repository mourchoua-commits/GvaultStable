# AUDIO CORE • Sources publiques vérifiées (2026-11-06)

Cette recherche n'est pas exhaustive. Les sources privées, non indexées et réseaux cachés n'ont pas été inspectés.

| Source | Usage | Statut |
|---|---|---|
| [ACE-Step 1.5](https://huggingface.co/ACE-Step/Ace-Step1.5) | Chansons avec paroles, référence, retouche, plusieurs langues | Modèle libre MIT, nécessite matériel / serveur local |
| [GitHub ACE-Step](https://github.com/ace-step/ACE-Step-1.5) et [API officielle](https://github.com/ace-step/ACE-Step-1.5/blob/main/docs/en/API.md) | /release_task, /query_result, /v1/audio | Client optionnel dans ace-step-local.html |
| [Transformers.js](https://huggingface.co/docs/transformers.js/index) | Inférence voix compatible ONNX dans navigateur | Pas de gros modèle audio intégré ici |
| [Tone.js](https://github.com/Tonejs/Tone.js) | Moteur Web Audio / transport | MIT, pas requis pour notre station native |
| [Audio Separator](https://github.com/nomadkaraoke/python-audio-separator) | Séparer voix / instruments avec modèles UVR | Non installé, demande CPU/GPU |
| [AudioCraft](https://github.com/facebookresearch/audiocraft) | MusicGen / génération conditionnée | Code MIT, poids CC BY-NC 4.0 (non commercial) |
| [Reddit : DAW in-browser](https://www.reddit.com/r/musicprogramming/comments/1k7vzqi/making_an_opensource_daw/) | Témoignage sur MIDI et contrôle local | Inspiration, pas validation |
| [Reddit : NodaLab](https://www.reddit.com/r/webaudio/comments/1xbukq7/nodalab_music_theory_as_a_node_graph_played_live/) | Programmation de musique par graphe de nœuds | Inspiration, pas dépendance |
| [ACE-Step Issue 1114](https://github.com/ace-step/ACE-Step-1.5/issues/1114) | Retours critiques sur nuances et transitions | Signale des limites possibles, non benchmark |
| [MDN Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | API de synthèse et mixage embarquée | Fonctionne dans les navigateurs modernes |

## Frontière deep web
« Deep web » ne signifie pas nécessairement « dark web ». Aucun site .onion ou source invisible n'a été parcouru ni cité comme preuve. Pas de crawling autonome dans la station.

## Principe architectural
Les moteurs lourds restent interchangeables. L'utilisateur conserve les fichiers éditables, l'origine des pistes, les droits et l'accès sans compte.
