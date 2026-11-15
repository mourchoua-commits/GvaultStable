# Route Studio v1.0 — édition particulier 🎨🎵

Studio musical colorimétrique **autonome** : un seul fichier HTML, aucune installation,
aucune connexion requise, aucune donnée qui sort de ton appareil.

## 🚀 Lancer

1. **Double-clique sur `route-studio.html`** — il s'ouvre dans ton navigateur (Chrome, Firefox, Edge…).
2. C'est tout. Pas de serveur, pas de compte, pas de pub.

Version en ligne (pratique pour partager) : https://raw.githack.com/mourchoua-commits/GvaultStable/vibe/route-studio-clean-3d2cda/route-studio.html

## 🎹 Mode d'emploi express

- **▶ GO / ⏹** : la grille 8 pistes × 16 pas joue en boucle. BPM réglable.
- **Clique dans la grille** pour poser/retirer des notes. Outils : ✏️ crayon, 🧽 gomme, 🪣 pot, 🌫️ estompe, 📏 aplanir, **↩️ retour** (annule 50 coups).
- **🎨 Couleurs** : teinte/saturation/luminosité, hex, **négatif** 🔄, palette XXL 24 teintes.
- **🪄 Palette** : 64 pads vivants — chaque appui joue la note de la teinte (+69°), influence les voisins (+12°), **revient au clair** tout seul, avec parfois une **anomalie ⚡** (le pad opposé s'inverse).
- **✏️ Dessinateur** : dessine, chaque couleur devient une fréquence, lecture colonne par colonne, boucle possible.
- **🌍 Magic System** : écosystème à matériaux (eau, sable, feu, lave, plante…) — le monde vivant **participe à la couleur perçue**.
- **🎤 Micro** : **maintiens le bouton** pour prélever l'extérieur + l'intérieur (mixte). Relâche → le **butin** naît avec sa fragrance colorimétrique. Clic court = verrou (reste armé, re-clic pour clore). Après 3 s de maintien, la **🪜 Passerelle** s'ouvre (état du port : https, permissions — on frappe à la porte, on ne la défonce jamais).
- **🎛️ Auto-tune** : chante, ta voix est recalée sur la gamme (micro à bord requis).
- **🎁 Butin** : ▶️ écouter, 🔁 boucler, 🗄️ entreposer au coffre fort, **⬆ armer comme sample d'une piste**.
- **🤝 Économie à par égal** : chaque butin lu rapporte +2 écus de recette, dont +1 pour celui qui a appuyé — co-propriété avec le navigateur, pas une taxe.
- **🗄️ Coffre fort** : prélèvements persistants (IndexedDB), gardés entre les sessions, transfert ↔ butin dans les deux sens.
- **🛰️ Sonde** : vision de l'espace pilotée par la couleur entendue. **🔮 Sachants / 📯 Écho** : tout ce qui va arriver est annoncé juste avant.
- **🪜 Anatomie du portail** : ouvre la Passerelle et clique sur un module pour le retrouver. Les liens s'allument quand une teinte ou un prélèvement passe d'une fenêtre à l'autre.
- **🦠 Grille vivante** : chaque note fait naître un organisme qui s'envole.
- **⏺ Session** : enregistre toute la session studio → au coffre au butin (jamais de téléchargement surprise).
- **⬇ WAV / JSON** : exporte un butin en audio, ou ton motif (réimportable).

## 🔒 Vie privée

- **0 appel réseau** : pas de script externe, pas de traqueur, pas de crypto-minage, code 100 % lisible (vanilla HTML/CSS/JS).
- Tes données (butins, coffre fort, préférences) restent **sur ton appareil** (IndexedDB / localStorage).
- Le micro ne s'active **que** quand tu maintiens le bouton, et **jamais** sans ta permission navigateur.

## 🎮 Bonus : Route Miroir

`route-miroir.html` : la route miroir avec nuages, voitures, piétons — et le **Mode Jardin** 🥕🐛💎 (récolte persistante).

## 🛠️ Dépannage

- **Micro refusé ?** Ouvre la **🪜 Passerelle** pour voir l'état du port, puis réautorise le micro dans les réglages du navigateur (icône cadenat dans la barre d'adresse) et clique « ⚓ Aborder le port ». En ligne, la page doit être en **https** (c'est le cas du lien ci-dessus).
- **Tout semble figé ?** **Ctrl+F5** pour vider le cache du navigateur.
- **Coffre fort indisponible ?** Ton navigateur bloque peut-être IndexedDB en local — ouvre la version en ligne, ou utilise Firefox/Chrome.

---
Route Studio v1.0 — fait avec 🖤, des écus à par égal et zéro serveur.
