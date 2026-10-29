# 001 — Pourquoi le silence fait plus peur que le bruit

Statut : pilote de style (pas encore de SaaS glissé dans le script).
Durée cible : 47 s à 160 mots/min. 126 mots.

**On screen:** Le silence fait plus peur

```script
Le moment le plus angoissant d'un film, c'est souvent le silence.
Pas la musique. Pas le cri. Le vide.
Un bruit constant devient un fond, et ton cerveau l'ignore.
Coupe ce fond, et il cherche ce qui manque.
C'est là qu'il commence à imaginer.
Une porte. Un pas. Quelque chose derrière toi.
Le silence ne montre rien. Ton cerveau fait le travail.
Mais il ne marche que s'il est préparé.
Trop de vide, et l'oreille décroche.
Il faut du bruit avant, pour que le silence existe.
Puis un seul son suffit.
Un craquement. Et tout bascule.
Les meilleurs films coupent le son juste avant.
La prochaine fois, baisse le volume.
Tu entendras le silence arriver.
Commente silence, je t'envoie la fiche.
```

## Notes visuelles

- l. 1 → salle de cinéma vide, écran noir
- l. 2 → noir plein, respiration
- l. 3 → waveform continue
- l. 4 → la waveform s'aplatit
- l. 5 → silhouette dans une porte
- l. 6 → poignée de porte, gros plan
- l. 7 → couloir vide
- l. 8 → main sur un bouton de volume
- l. 9 → casque, regard vide
- l. 10 → onde sonore qui remonte
- l. 11 → ampoule unique
- l. 12 → clap de cinéma + INVERSION noir/blanc
- l. 13 → faisceau de projecteur
- l. 14 → doigt sur le volume d'un téléphone
- l. 15 → retour à la salle de cinéma (boucle)
- l. 16 → écran de commentaire

## Triggers

gap 0 s · self-recognition 0 s · proof 7 s (waveform) · pattern break 52 % · specificity 18 % · CTA 94 %

## Scores

- hook 9/10 (Specific 1 : pas de chiffre)
- humanize 10/10
- offer 0 (CTA commentaire, pas abonnement)

## CTA

Mot-clé : `silence`. Ressource à fournir : {{la fiche / le lien}}.
Le CTA est dit une fois, à la fin, sans insistance.

## Voix

Voix demandée : `SomyDQQmnE7TsltdiDgp` — absente du compte ElevenLabs connecté.
Voix de secours utilisée pour le pilote : `VuCZnF3MFlSeaM1I9wsG` (TikTok story, fr).
Pour changer : éditer `voice.id` dans `scenes.json`, puis `npm run tts -- --id 001-silence --force`.

## À remplir

- {{la fiche / le lien}} promise dans le CTA.
- Le SaaS à glisser dans une prochaine vidéo (format top 3).
