# Partager des fichiers de scanner et d’IRM avec un hôpital en Chine

## Hero

- **Category:** Guides des soins de santé en Chine
- **Subcategory:** Imagerie et dossiers médicaux
- **Reviewed by:** Équipe éditoriale de Medora Health ; relecture radiologique et de sécurité de l’information requise avant publication
- **Hero image:** `hero-reviewed.png`
- **Image alt text:** Un radiologue chinois discute d’imagerie en coupes avec un patient international


- **Title:** Partager des fichiers de scanner et d’IRM avec un hôpital en Chine
- **Subtitle:** Exportez des examens DICOM complets, vérifiez les séries, protégez les données du patient et confirmez l’importation et la relecture radiologique en Chine.
- **Updated date:** 2026/09/19

## Key Takeaways

- DICOM est le format standard d’échange d’images médicales avec les données et la qualité nécessaires à l’usage clinique.[1] Demandez au centre d’imagerie l’examen DICOM complet.
- Envoyez les images et le compte rendu radiologique définitif. Les premières permettent une relecture ; le second consigne l’interprétation initiale, la technique et la comparaison.
- Testez les fichiers avant le téléversement. Confirmez le bon patient, la date d’examen, la région corporelle, les séries et le nombre d’images ; un téléchargement réussi ne prouve pas que l’examen est complet.
- Les fichiers DICOM contiennent des données intégrées sur le patient et l’examen. Renommer un dossier ne supprime pas les informations identifiantes.[2]
- Obtenez de l’hôpital une confirmation de réception et d’importation, puis demandez si un radiologue a réellement examiné les images. Un téléversement administratif n’est pas un avis clinique.

## Content

Une photographie de film d’IRM peut montrer une anomalie reconnaissable. Elle empêche pourtant le radiologue qui la reçoit de faire défiler les coupes, de modifier le fenêtrage, de mesurer une lésion, de vérifier les séquences d’acquisition ou de comparer exactement les images antérieures.

Pour une véritable relecture, préparez un ensemble de transfert en trois parties : les données complètes d’imagerie diagnostique, le compte rendu signé ou définitif et une courte question clinique. La tâche ne s’achève pas lorsque le patient clique sur « envoyer ». Elle s’achève lorsque le bon hôpital importe l’examen complet et confirme qui l’interprétera.

## Demandez au centre d’imagerie le bon export

Utilisez l’expression « examen DICOM complet avec toutes les séries diagnostiques ». DICOM — Digital Imaging and Communications in Medicine — est la norme internationale des images médicales et des informations associées, utilisée en scanner, IRM, radiographie, échographie, médecine nucléaire, radiothérapie et dans d’autres systèmes.[1]

Demandez :

- Les fichiers DICOM originaux de chaque série pertinente
- L’index `DICOMDIR` lorsque l’export en fournit un
- Le compte rendu radiologique définitif et tout addendum
- La date d’examen, la modalité et la région corporelle
- Si un produit de contraste a été utilisé et, si elles sont consignées, les informations de phase ou de séquence
- Les examens antérieurs pertinents pour comparaison
- Un export sur disque, par téléchargement sécurisé ou par une voie cloud approuvée par l’hôpital

Ne demandez pas seulement « les images ». Certains guichets d’export produiraient alors des images clés JPEG ou une planche-contact PDF.

## Connaissez la différence entre quatre formats courants

### Examen DICOM

Il s’agit du jeu de données diagnostiques. Il comporte les pixels de l’image ainsi que des attributs décrivant le patient, l’examen, la série et l’acquisition. Un scanner ou une IRM contient habituellement de nombreux fichiers et séries, pas une seule image.[2]

### Visionneuse DICOM

Un disque peut inclure un logiciel affichant l’examen. La visionneuse n’est pas l’examen lui-même. Si le programme ne fonctionne pas sur un autre système d’exploitation, les fichiers DICOM bruts doivent toujours être présents et importables.

### Compte rendu radiologique

Le compte rendu est l’interprétation du radiologue initial. Il doit préciser l’examen, les constatations et la conclusion, et peut décrire la technique, le contraste, les limites et les comparaisons. L’American College of Radiology indique que des informations cliniques pertinentes et une question précise améliorent l’utilité de l’interprétation, et que les examens comparatifs doivent être utilisés lorsqu’ils sont appropriés et disponibles.[3]

### JPEG, PNG, PDF ou photographie de téléphone

Ce sont des aperçus pratiques. Ils suppriment habituellement la navigation entre coupes, les métadonnées, la plage dynamique et la capacité de mesure. Utilisez-les uniquement pour signaler une constatation — pas comme transfert diagnostique principal.

## Choisissez les examens autour d’une question clinique

Rédigez une question d’une ou deux phrases, par exemple :

- La lésion pancréatique est-elle techniquement résécable ?
- La maladie pulmonaire a-t-elle progressé par rapport à l’examen avant le traitement de deuxième ligne ?
- Quel niveau rachidien explique le déficit neurologique actuel ?
- La collection postopératoire évolue-t-elle, et nécessite-t-elle une évaluation urgente ?

Incluez ensuite la chronologie d’imagerie pertinente. Le dernier examen seul peut être insuffisant. L’évaluation de la réponse dépend souvent d’un examen initial avant traitement ; la planification chirurgicale peut nécessiter une phase de contraste particulière ; une complication suspectée peut nécessiter l’examen postopératoire immédiat.

Demandez au clinicien ou au radiologue destinataire quels examens sont nécessaires. Envoyer toutes les images depuis l’enfance peut masquer la comparaison importante aussi efficacement qu’en envoyer trop peu.

## Inspectez l’export avant de quitter l’établissement

Ouvrez le disque ou le téléchargement sur un ordinateur qui ne l’a pas créé. Un support DICOM inclut habituellement des fichiers d’images individuels et peut inclure `DICOMDIR` ; les conseils aux patients de la norme DICOM expliquent qu’une visionneuse charge normalement l’examen entier plutôt qu’un fichier à la fois.[4]

Vérifiez :

- Le nom du patient et un autre identifiant
- La date et l’heure de l’examen
- La modalité et la région corporelle
- Le nombre et les noms des séries
- Le nombre approximatif d’images
- La présence de phases avec et sans contraste lorsqu’elles sont attendues
- La présence des coupes fines, reconstructions ou séquences fonctionnelles demandées par le relecteur
- La correspondance du compte rendu avec cet examen exact

Faites défiler plusieurs séries principales de la première à la dernière image. Un dossier peut s’ouvrir normalement tout en ayant perdu la moitié de l’examen.

Si plusieurs examens partagent un disque, créez un inventaire plutôt que de déplacer les fichiers internes. Exemple :

| Dossier | Examen | Date | Compte rendu | Notes |
|---|---|---|---|---|
| `01` | Scanner thorax/abdomen avec contraste | 2026-01-04 | Oui | Examen initial |
| `02` | Scanner thorax/abdomen avec contraste | 2026-03-18 | Oui | Après 2 cycles |

## Ne renommez pas et ne modifiez pas les fichiers DICOM internes

Les systèmes DICOM identifient les examens et séries par des attributs intégrés et des identifiants uniques, pas par des noms de fichiers lisibles. Gardez la structure d’export intacte. Renommez uniquement le dossier externe ou l’archive, par exemple :

`2026-03-18_CT-chest-abdomen_DICOM`

N’ouvrez pas les images dans un logiciel photo pour les enregistrer à nouveau. Ne recadrez pas, n’annotez pas et ne modifiez pas les pixels. Si un clinicien a besoin d’une flèche ou d’une note, créez une capture de référence séparée tout en conservant l’examen intact.

Si l’hôpital demande une archive ZIP, compressez une fois le dossier de premier niveau de l’examen. Évitez plusieurs ZIP imbriqués sauf si ses consignes l’exigent.

## Téléversez par la voie confirmée de l’hôpital

Demandez :

- Le portail exact ou le lien sécurisé de transfert
- Les formats acceptés et la taille maximale des fichiers
- Si les archives doivent être ZIP, non compressées ou compatibles DICOMweb
- Le numéro de patient ou de dossier à saisir
- Si le compte rendu est téléversé séparément
- L’expiration du lien et la date limite de téléversement
- Le contact d’assistance technique

Les règles chinoises de dossier médical électronique permettent aux établissements médicaux, lorsqu’ils en ont la capacité, de fournir électroniquement des documents d’imagerie ou vidéo et exigent que les copies électroniques puissent être lues indépendamment.[5] Cela ne signifie pas que chaque hôpital utilise le même portail ou puisse importer tous les ensembles étrangers de visionneuse.

Téléversez depuis une connexion stable. Gardez le navigateur ouvert jusqu’à ce que la plateforme indique l’achèvement, puis conservez le reçu ou une capture. Une barre de progression atteignant 100% peut confirmer uniquement le transfert vers un serveur, pas l’importation réussie dans le système radiologique.

## Protégez l’identité du patient sans endommager l’examen

Les objets DICOM peuvent contenir le nom du patient, son identifiant, des dates et d’autres informations à l’intérieur des fichiers ; changer un nom de fichier ne les désidentifie pas.[2] Certaines images contiennent aussi du texte inscrit directement dans les pixels.

Pour les soins cliniques directs, l’hôpital destinataire a généralement besoin d’une identité suffisante pour associer l’examen au patient en sécurité. Utilisez sa voie désignée et sa procédure d’autorisation.

Pour la recherche, l’enseignement ou un service de seconde lecture en aveugle, demandez à l’établissement quel profil de désidentification il exige et qui l’applique. Ne supprimez pas les balises sans précaution : une mauvaise désidentification peut laisser des informations personnelles ou retirer des attributs nécessaires pour relier les séries et comparer les examens.

La loi chinoise sur la protection des informations personnelles considère les informations médicales et de santé comme sensibles et exige un objectif précis, la nécessité et des mesures de protection.[6] Envoyez uniquement à des destinataires identifiés, utilisez une expiration d’accès si disponible et ne publiez pas les liens d’imagerie dans des conversations publiques ou de grands groupes.

## Associez chaque examen à son compte rendu et à sa traduction

Nommez les comptes rendus pour qu’ils ne puissent pas être dissociés des images :

- `2026-03-18_CT-chest-abdomen_report_ORIGINAL.pdf`
- `2026-03-18_CT-chest-abdomen_report_EN-translation.pdf`

Conservez le compte rendu original même lorsqu’une traduction anglaise ou chinoise existe. Indiquez le traducteur et la date. La traduction ne remplace pas une nouvelle interprétation radiologique.

Si le compte rendu original a été modifié, envoyez le compte rendu définitif et tous les addenda. Précisez quelle version l’hôpital initial considère comme actuelle.

## Confirmez l’importation, l’intégralité et la relecture clinique

Après le téléversement, demandez à l’équipe destinataire de confirmer :

1. Le bon patient et le bon dossier
2. La date d’examen, la région corporelle et la modalité
3. Le nombre d’examens reçus
4. Si toutes les séries attendues ont été importées
5. Si les examens comparatifs antérieurs sont reliés
6. Le nom ou la fonction du radiologue interprétant
7. La date prévue du compte rendu ou de la consultation
8. Comment les constatations urgentes seront communiquées

« Fichiers reçus » de la part d’un coordinateur n’est que la première étape. Le référentiel de communication de l’ACR souligne que les informations d’imagerie ne sont utiles que lorsqu’elles sont transmises en temps utile aux responsables des décisions thérapeutiques.[3]

Demandez si le résultat sera une revue multidisciplinaire informelle, un compte rendu formel de seconde lecture ou simplement la disponibilité des images pour le chirurgien traitant. Ces prestations ne sont pas interchangeables.

## Échecs courants de transfert et solutions

### Seules des captures d’écran ont été exportées

Retournez au centre d’imagerie et demandez l’examen DICOM complet.

### La visionneuse s’ouvre, mais l’hôpital n’importe rien

Repérez les dossiers DICOM bruts ou demandez un nouvel export conforme aux normes. N’envoyez pas uniquement l’exécutable de la visionneuse.

### Le ZIP est trop volumineux

Demandez à l’hôpital une voie de plus grande capacité, divisez par examen complet plutôt que selon un nombre arbitraire de fichiers, ou envoyez un support physique chiffré. Ne supprimez jamais des séries sans consigne radiologique.

### Le nom ou le passeport ne correspond pas

Ne modifiez pas vous-même les métadonnées DICOM. Fournissez les anciens et les nouveaux identifiants et demandez à l’hôpital de documenter la correspondance lors de l’importation.

### Le lien sécurisé expire

Conservez l’archive locale intacte et demandez un nouveau lien. Ne déplacez pas l’unique copie dans un portail temporaire.

### L’examen est incomplet

Renvoyez l’inventaire et la description des séries manquantes à l’établissement source. Un second téléversement doit être étiqueté comme remplacement ou complément pour que le relecteur ne lise pas à son insu un examen partiel.

## Liste finale de vérification du transfert

- La question clinique et les comparaisons demandées sont précisées
- L’examen DICOM complet a été obtenu
- Le compte rendu définitif et les addenda sont inclus
- Le compte rendu en langue originale est conservé ; la traduction est identifiée
- Le bon patient, la date, la modalité et la région corporelle sont vérifiés
- Les séries attendues et les nombres d’images sont contrôlés
- La structure interne des dossiers est intacte
- L’archive externe est nommée clairement et s’ouvre correctement
- La voie hospitalière, la limite de taille et le numéro de dossier sont confirmés
- La confidentialité et les autorisations d’accès sont vérifiées
- Le reçu de téléversement est conservé
- L’hôpital a confirmé l’importation et l’intégralité
- Le relecteur clinique nommé et la date de réponse sont consignés

**Avertissement médical :** Le transfert de fichiers n’établit pas un diagnostic. L’adéquation des images, la comparaison et les implications thérapeutiques doivent être évaluées par des cliniciens qualifiés disposant du dossier complet. Les symptômes urgents nécessitent une évaluation médicale locale et ne doivent pas attendre un téléversement à distance.

## Hôpitaux associés

Avant l’envoi, vérifiez que l’hôpital destinataire peut importer des examens DICOM externes, accepte la modalité de l’examen et propose la sous-spécialité radiologique nécessaire.

## Traitements associés

La planification chirurgicale, la radiothérapie, les actes interventionnels, l’évaluation de la réponse du cancer et les évaluations neurologiques ou orthopédiques nécessitent souvent des séquences, des phases ou des comparaisons antérieures spécifiques.

## Related Guides

- [Comment organiser les dossiers médicaux avant de rechercher des soins en Chine](/fr/guides/china-healthcare-guides/how-to-organize-medical-records-before-seeking-care-in-china)
- [Revue des dossiers anatomopathologiques et biologiques avant un traitement en Chine](/fr/guides/china-healthcare-guides/pathology-and-laboratory-record-review-before-treatment-in-china)
- [Comment préparer une consultation à distance avec un médecin en Chine](/fr/guides/china-healthcare-guides/how-to-prepare-for-a-remote-consultation-with-a-doctor-in-china)
- [Protéger votre confidentialité médicale lors du partage international de dossiers](/fr/guides/china-healthcare-guides/protecting-your-medical-privacy-when-sharing-records-internationally)

## Questions fréquentes

### Puis-je envoyer quelques captures de scanner par courriel pour un deuxième avis ?

Elles peuvent aider à expliquer la question, mais une relecture diagnostique nécessite habituellement l’examen DICOM complet et le compte rendu pertinent.[1]

### Qu’est-ce que `DICOMDIR` ?

C’est un index couramment inclus sur les supports DICOM pour aider les logiciels à identifier les examens et les fichiers. Conservez-le avec la structure originale des dossiers.[4]

### Dois-je retirer mon nom des fichiers DICOM ?

Pour les soins directs, suivez les consignes de concordance d’identité de l’hôpital. Pour un usage désidentifié, demandez à un service qualifié d’appliquer le profil requis ; renommer les dossiers ne suffit pas.[2]

### Dois-je envoyer les anciens examens ?

Envoyez les comparaisons demandées par le clinicien destinataire. Les examens initiaux et immédiatement antérieurs sont souvent importants, mais la pertinence dépend de la question clinique.[3]

### Comment savoir si l’hôpital a réellement examiné les images ?

Demandez le radiologue ou l’équipe de relecture, la forme du résultat et la date prévue. Un reçu de téléversement confirme le transfert, pas l’interprétation.

## SEO Metadata

- **Slug:** `how-to-share-ct-mri-and-other-imaging-files-with-a-chinese-hospital`
- **Primary keyword:** envoyer DICOM à un hôpital chinois
- **Pillar keyword:** soins de santé en Chine pour les patients internationaux
- **Vertical keyword:** partager fichiers scanner IRM Chine
- **Search intent:** information / préparation technique
- **Secondary keywords:** téléversement DICOM hôpital Chine ; deuxième avis scanner Chine ; transfert fichiers IRM Chine


- **Meta title:** Partager des fichiers de scanner et d’IRM avec un hôpital en Chine
- **Meta description:** Exportez des examens DICOM complets, vérifiez les séries, protégez les données du patient et confirmez l’importation et la relecture radiologique en Chine.

## Sources

1. [Comité de la norme DICOM : à propos de DICOM](https://www.dicomstandard.org/about)
2. [Comité de la norme DICOM : concepts clés de DICOM et données patient intégrées](https://www.dicomstandard.org/concepts)
3. [American College of Radiology : référentiel de pratique pour la communication des constatations d’imagerie diagnostique](https://www.acr.org/-/media/ACR/Files/Practice-Parameters/communicationdiag.pdf)
4. [Comité de la norme DICOM : afficher des images médicales depuis un CD](https://www.dicomstandard.org/using/cds)
5. [Commission nationale de la santé : spécification de gestion des applications de dossier médical électronique](https://www.nhc.gov.cn/wjw/c100175/201702/90f3de8ae03d488cbddf509dc958f75b.shtml)
6. [Assemblée populaire nationale : loi de la République populaire de Chine sur la protection des informations personnelles](https://www.npc.gov.cn/WZWSREL25wYy9jMi9jMzA4MzQvMjAyMTA4L3QyMDIxMDgyMF8zMTMwODguaHRtbD9yZWY9aW1i)
