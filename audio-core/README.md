# GVAULT AUDIO CORE 01 · TIC ↔ TAC 2078

**Une station, pas un abonnement.** Le cœur est un module **ajouté**, jamais une réécriture de GVAULT. Le dépôt public de destination est `mourchoua-commits/GvaultStable` (branche `main`). Son fichier d'entrée est `audio-core/index.html`.

## Démarrage

- **Android :** extraire le ZIP téléchargé, puis ouvrir `index.html` avec Chrome/Opera/Firefox si le navigateur autorise les fichiers locaux. Le micro peut être indisponible en `file://`; HTTPS et certaines versions de localhost sont préférables. Tous les autres modules HTML restent ouvrables séparément.
- **Windows :** ouvrir `index.html` depuis le dossier décompressé, sans installation. Pour servir localement les pages avec une origine commune, dans ce dossier lancer `python -m http.server 8080`, puis ouvrir `http://localhost:8080/` (Python requis uniquement dans ce scénario).
- **GVAULT public :** les fichiers sont dans `audio-core/` ; la présence du code dans GitHub **ne prouve pas** l'activation d'un site GitHub Pages.

## Station centrale

`index.html` propose : platines A et B avec import de fichiers audio, vitesse, volume, crossfade à puissance égale ; filtre, écho, compresseur ; oscilloscope/spectre ; capture du mixage local dans un format `MediaRecorder` pris en charge ; radio **locale** avec playlist ; synthèse rythmique/mélodique 16 pas, mutations, notes éditables, graine et export JSON ; vocalises de voyelles générées dans Web Audio ; entrée micro sur consentement. Les fichiers ne quittent pas le navigateur.

## Jumelage avec les ateliers précédents

- `fabrique-v1.html` : Fabrique musicale V1 conservée.
- `studio2078.html` : studio 8 pistes conservé, avec un petit adaptateur `postMessage` **nouveau** placé après son script original. Le cœur peut y envoyer une idée, demander lecture/arrêt et cliquer sur son export WAV. Son code moteur original demeure intact.
- `voice-lab.html` : atelier voix conservé.
- `ace-step-local.html` : client facultatif pour un **serveur ACE-Step 1.5 installé et démarré par l'utilisateur**. Ce fichier seul ne contient aucun réseau neuronal.

L'atelier Studio 2078 garde sa propre sauvegarde locale, son séquenceur, son MIDI et ses propres exports. Le cœur n'extrait pas ses fichiers audio cachés et ne les publie jamais.

## Port local ACE-Step

Installer ACE-Step depuis le dépôt officiel : https://github.com/ace-step/ACE-Step-1.5 . Démarrer son serveur API conformément à sa documentation ; l'adresse par défaut peut être `http://127.0.0.1:8001`. Ouvrir `ace-step-local.html`, vérifier `/health`, puis soumettre un `caption`, des `lyrics`, une durée et un BPM. L'interface appelle `/release_task`, consulte `/query_result`, puis ouvre le fichier de `/v1/audio`. Une erreur CORS, HTTP/HTTPS ou réseau privé est possible selon le navigateur et le serveur. Ne jamais exposer sans authentification un serveur de génération sur Internet. La génération consomme tes propres ressources informatiques, éventuellement de l'électricité ; elle n'est donc pas « gratuite » au sens matériel.

## À quoi la station ne prétend PAS

- Pas de modèle neural chantant installé dans `index.html`.
- Pas de séparation instrumentale par IA sans moteur externe.
- Pas de diffusion « radio » publique : la radio existante est une playlist sur l'appareil.
- Pas d'accès automatique à GitHub, Hugging Face, Reddit, Tor ou au « deep web » dans la page : les liens documentaires sont des liens, pas des connexions secrètes.
- Pas de benchmark montrant une meilleure qualité que Suno ; le gain actuel est le contrôle, l'édition, le fonctionnement local et l'ouverture des modules.

## Données et droits

Importation locale seulement. Le micro ne s'active qu'après autorisation explicite. L'enregistrement prend le master Web Audio et non les sources de voix d'autres onglets. La station n'intègre pas le MP3 personnel d'origine dans le dépôt public. Pour enregistrer des voix, obtenir le consentement et respecter les licences des échantillons et modèles.

## Audit

Voir `core.manifest.json`, `docs/RESEARCH.md`, `docs/TESTS.md` et `docs/ROADMAP.md`.