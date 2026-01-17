# 📚 Documentation Complète de la Chatbox ELYNDRA · TRAJECTORY OS

## 🎯 Vue d'ensemble

La chatbox ELYNDRA est un agent IA opérationnel intégré à la plateforme de recrutement. Elle permet aux utilisateurs (candidats et entreprises) d'interagir avec le système de manière naturelle et d'exécuter des actions réelles sur leurs données.

**Caractéristiques principales :**
- ✅ Actions réelles sur la base de données (pas de simulation)
- ✅ Accès en temps réel aux données utilisateur
- ✅ Support multilingue (français, anglais, espagnol, arabe, chinois)
- ✅ Apprentissage comportemental (préférences, patterns)
- ✅ RAG (Retrieval-Augmented Generation) pour contexte enrichi
- ✅ Historique des conversations persistantes
- ✅ Interface moderne avec animations 3D

---

## 🛠️ Fonctionnalités Disponibles

### 🔍 **1. Recherche d'Offres d'Emploi**

#### `searchJobOffers`
Recherche réelle d'offres dans la base de données avec filtres avancés.

**Paramètres disponibles :**
- `search` : Terme de recherche (métier, compétences, entreprise)
- `location` : Localisation (ville, région, télétravail)
- `type` : Type de contrat (`full-time`, `part-time`, `contract`, `internship`)
- `category` : Catégorie d'emploi (Finance, Développement, Design, Management, Marketing, Commerce, Santé, etc.)
- `salaryMin` : Salaire minimum souhaité (en EUR)
- `salaryMax` : Salaire maximum souhaité (en EUR)
- `remote` : Rechercher uniquement les offres en télétravail/hybride

**Exemples d'utilisation :**
```
"Y a-t-il des offres en développement ?"
"Je cherche un poste de développeur junior en télétravail avec un salaire entre 30000 et 40000€"
"Montre-moi des offres de marketing à Paris"
```

**Fonctionnalités spéciales :**
- Tolérance aux fautes d'orthographe et accents
- Recherche sémantique avec synonymes et métiers liés
- Support de 75 thématiques de métiers en 5 langues

---

### 💼 **2. Gestion des Candidatures**

#### `getUserApplications`
Récupère toutes les candidatures de l'utilisateur avec leurs statuts.

**Statuts possibles :**
- `pending` : En attente
- `reviewed` : En cours d'examen
- `accepted` : Acceptée
- `rejected` : Refusée

**Exemples d'utilisation :**
```
"Montre-moi mes candidatures"
"Quelles sont mes candidatures en attente ?"
"Combien de candidatures ai-je envoyées ?"
```

#### `createApplication`
Postule réellement à une offre d'emploi (crée une candidature dans la base de données).

**Paramètres :**
- `jobId` : ID de l'offre d'emploi (requis)
- `skills` : Liste des compétences (optionnel)

**Exemples d'utilisation :**
```
"Je veux postuler à l'offre [ID]"
"Postule-moi à cette offre avec mes compétences"
```

---

### ⭐ **3. Favoris**

#### `getFavoriteJobs`
Récupère toutes les offres sauvegardées en favoris.

**Exemples d'utilisation :**
```
"Quelles sont mes offres favorites ?"
"Montre-moi mes favoris"
```

#### `addFavoriteJob`
Ajoute une offre aux favoris.

**Paramètres :**
- `jobId` : ID de l'offre (requis)

**Exemples d'utilisation :**
```
"Ajoute cette offre à mes favoris"
"Marque cette offre comme favorite"
```

#### `removeFavoriteJob`
Retire une offre des favoris.

**Paramètres :**
- `jobId` : ID de l'offre (requis)

---

### 👤 **4. Profil Utilisateur**

#### `getUserProfile`
Récupère le profil complet de l'utilisateur.

**Pour les candidats :**
- Email, compétences, expérience, éducation
- Localisation, bio, statut de certification
- Statut de vérification

**Pour les entreprises :**
- Nom, description, site web
- Industrie, taille de l'entreprise

**Exemples d'utilisation :**
```
"Montre-moi mon profil"
"Quelles sont mes compétences ?"
"Donne-moi les infos de mon profil"
```

---

### 📧 **5. Messagerie**

#### `getUserMessages`
Récupère les messages de l'utilisateur (conversations avec entreprises/candidats).

**Paramètres :**
- `applicationId` : ID de la candidature (optionnel, pour filtrer)

#### `sendMessage`
Envoie un message réel à une entreprise ou un candidat.

**Paramètres :**
- `applicationId` : ID de la candidature (requis)
- `content` : Contenu du message (requis)

**Exemples d'utilisation :**
```
"Envoie un message à l'entreprise pour la candidature [ID]"
"Écris un message de suivi pour ma candidature"
```

---

### 🎯 **6. Recommandations Personnalisées**

#### `getPersonalizedJobRecommendations`
Récupère des recommandations d'offres basées sur le profil du candidat.

**Algorithme de scoring :**
- Correspondance des compétences (×10 points)
- Niveau d'expérience vs niveau du poste (×5 points)
- Localisation (×3 points)

**Paramètres :**
- `limit` : Nombre maximum de recommandations (défaut: 10)

**Exemples d'utilisation :**
```
"Montre-moi des offres qui me correspondent"
"Quelles offres me recommandes-tu ?"
"Trouve-moi des offres adaptées à mon profil"
```

---

### 🔄 **7. Comparaison et Offres Similaires**

#### `compareJobOffers`
Compare deux offres d'emploi côte à côte.

**Paramètres :**
- `jobId1` : ID de la première offre (requis)
- `jobId2` : ID de la deuxième offre (requis)

**Critères de comparaison :**
- Salaire, avantages, localisation
- Type de contrat, catégorie

**Exemples d'utilisation :**
```
"Compare ces deux offres [ID1] et [ID2]"
"Quelle offre est la meilleure entre [ID1] et [ID2] ?"
```

#### `findSimilarJobOffers`
Trouve des offres similaires à une offre donnée.

**Paramètres :**
- `jobId` : ID de l'offre de référence (requis)
- `limit` : Nombre maximum d'offres (défaut: 5)

**Critères de similarité :**
- Même catégorie
- Compétences similaires
- Localisation proche

**Exemples d'utilisation :**
```
"Trouve-moi des offres similaires à celle-ci"
"Y a-t-il d'autres offres comme celle-là ?"
```

---

### 📊 **8. Diagnostic de Carrière**

#### `careerDiagnostic`
Effectue un diagnostic de carrière rapide basé sur le profil.

**Analyse fournie :**
- Profil (expérience, compétences, éducation, localisation)
- Activité (nombre de candidatures, taux de réponse)
- Recommandations personnalisées

**Exemples d'utilisation :**
```
"Fais-moi un diagnostic de carrière"
"Analyse ma situation professionnelle"
"Quels sont mes points forts et faibles ?"
```

---

### 🔔 **9. Alertes d'Emploi**

#### `createJobAlert`
Crée une alerte d'emploi automatique.

**Paramètres :**
- `search` : Terme de recherche (optionnel)
- `category` : Catégorie d'emploi (optionnel)
- `location` : Localisation souhaitée (optionnel)
- `salaryMin` : Salaire minimum (optionnel)

**Fonctionnement :**
- L'utilisateur reçoit une notification quand de nouvelles offres correspondantes sont publiées

**Exemples d'utilisation :**
```
"Crée une alerte pour les offres de développeur à Lille"
"Alerte-moi pour les postes de marketing en télétravail"
```

---

### 🎤 **10. Simulation d'Entretien**

#### `simulateInterview`
Lance une simulation d'entretien pour une offre spécifique.

**Fonctionnement :**
- 5 questions au total
- Questions adaptées au poste
- Catégories : motivation, technique, comportemental, négociation, carrière

**Paramètres :**
- `jobId` : ID de l'offre (requis)
- `questionNumber` : Numéro de la question (1-5)
- `userAnswer` : Réponse de l'utilisateur (requis si questionNumber > 1)
- `previousAnswers` : Tableau des réponses précédentes (requis pour question 5)

**Rapport automatique après la 5ème question :**
- Score global (0-100)
- Points forts et faiblesses
- Analyse détaillée par catégorie
- Recommandations personnalisées

**Exemples d'utilisation :**
```
"Simule un entretien pour cette offre [ID]"
"Lance une simulation d'entretien"
```

**Conseils par catégorie :**
- **Motivation** : Authenticité, connaissance de l'entreprise, alignement avec les valeurs
- **Technique** : Structure STAR, exemples concrets, réalisations
- **Comportemental** : Méthode STAR, gestion du stress, résilience
- **Négociation** : Recherche marché, flexibilité, avantages
- **Carrière** : Vision long terme, ambition, engagement

---

### 📝 **11. Préparation aux Tests Techniques**

#### `prepareTechnicalTest`
Aide à la préparation d'un test technique.

**Paramètres :**
- `jobId` : ID de l'offre (requis)
- `topic` : Sujet technique spécifique à réviser (optionnel)

**Contenu fourni :**
- Sujets à réviser (basés sur les compétences requises)
- Conseils généraux
- Exemples de questions

**Exemples d'utilisation :**
```
"Aide-moi à préparer le test technique pour cette offre"
"Qu'est-ce que je dois réviser pour le test ?"
```

---

### 💰 **12. Négociation Salariale**

#### `salaryNegotiationAdvice`
Fournit des conseils personnalisés de négociation salariale.

**Paramètres :**
- `jobId` : ID de l'offre (requis)
- `currentSalary` : Salaire actuel (optionnel)
- `targetSalary` : Salaire cible (optionnel)

**Conseils fournis :**
- Analyse de la fourchette salariale
- Stratégie selon l'expérience
- Tips de négociation
- Négociation des avantages

**Exemples d'utilisation :**
```
"Donne-moi des conseils pour négocier le salaire de cette offre"
"Comment négocier mon salaire ?"
```

---

### 📈 **13. Statistiques Utilisateur**

#### `getUserStats`
Récupère les statistiques de l'utilisateur.

**Statistiques disponibles :**
- Nombre total de candidatures
- Taux de réponse
- Candidatures acceptées/refusées
- Autres métriques pertinentes

**Exemples d'utilisation :**
```
"Montre-moi mes statistiques"
"Quel est mon taux de réponse ?"
```

---

### 🧬 **14. Decision DNA**

#### `getDecisionDNA`
Récupère le profil Decision DNA d'une candidature.

**Paramètres :**
- `applicationId` : ID de la candidature (requis)

**Contenu :**
- Trajectoires de décision du candidat
- Patterns comportementaux

---

### 📄 **15. Détails d'Offre**

#### `getJobOfferDetails`
Récupère les détails complets d'une offre d'emploi.

**Paramètres :**
- `jobId` : ID de l'offre (requis)

**Informations retournées :**
- Description complète
- Missions, avantages
- Compétences requises
- Informations entreprise
- Culture d'entreprise

**Exemples d'utilisation :**
```
"Donne-moi les détails de l'offre [ID]"
"Qu'est-ce que cette offre propose ?"
```

---

## 🌍 Support Multilingue

La chatbox détecte automatiquement la langue de l'utilisateur et répond dans la même langue.

**Langues supportées :**
- 🇫🇷 Français
- 🇬🇧 Anglais
- 🇪🇸 Espagnol
- 🇸🇦 Arabe
- 🇨🇳 Chinois

**Fonctionnalités :**
- Détection automatique de la langue
- Réponse dans la langue détectée
- Reformulation simple des offres complexes
- Langage inclusif et adapté au niveau de compréhension

---

## 🧠 Intelligence et Apprentissage

### RAG (Retrieval-Augmented Generation)
- Accès au contexte enrichi via recherche sémantique
- Indexation des données utilisateur et offres
- Réponses basées sur des données réelles

### Apprentissage Comportemental
- Détection des patterns de recherche
- Détection des patterns de candidature
- Apprentissage des préférences utilisateur
- Suggestions personnalisées

### Préférences Apprises
- Type de contrat préféré
- Localisation préférée
- Catégories d'emploi préférées
- Fourchettes salariales
- Score de confiance pour chaque préférence

---

## 💬 Formatage des Réponses

### Format Professionnel
Toutes les réponses sont formatées de manière professionnelle et élégante.

**Format pour les offres d'emploi :**
```
• [Titre] — [Entreprise]
[Localisation] · [Type] · [Salaire si disponible]
[Voir l'offre](/candidate/jobs/{id})
```

**Règles de formatage :**
- Puces : Toujours utiliser • (point médian Unicode)
- Séparateurs : Toujours utiliser · (point médian) pour séparer les informations
- Nombres : Formatage avec espaces insécables (ex: 23 000–30 000 EUR)
- Liens : Format markdown [texte](/path) pour chaque offre

---

## 📱 Interface Utilisateur

### Fonctionnalités UI
- **Animations 3D** : Ouverture/fermeture avec effets 3D
- **Historique** : Gestion de plusieurs conversations
- **Nouvelle conversation** : Création de conversations séparées
- **Minimisation** : Réduction de la chatbox
- **Responsive** : Adapté mobile et desktop
- **Scroll automatique** : Scroll vers les nouveaux messages
- **Indicateurs visuels** : Badges pour les actions exécutées

### Gestion des Conversations
- Liste de toutes les conversations
- Prévisualisation des conversations
- Suppression de conversations
- Chargement de l'historique
- Compteur de messages

---

## 🔒 Sécurité et Accès

### Accès aux Données
- **Lecture seule** : L'agent ne peut pas modifier le profil utilisateur
- **Temps réel** : Accès aux données en temps réel
- **Isolation** : Chaque utilisateur accède uniquement à ses propres données
- **Authentification** : Nécessite une session utilisateur valide

### Limitations
- ❌ Modification du profil utilisateur (lecture seule)
- ❌ Suppression de candidatures
- ❌ Accès aux données d'autres utilisateurs
- ❌ Modification des offres d'emploi (si candidat)

---

## 🎯 Cas d'Usage Spéciaux

### "Est-ce que je correspond à cette offre ?"
L'agent exécute automatiquement :
1. `getUserProfile` - Récupère le profil du candidat
2. `getJobOfferDetails` - Récupère les détails de l'offre
3. Analyse la correspondance :
   - Compétences du profil vs compétences requises
   - Expérience vs expérience requise
   - Localisation vs localisation de l'offre
   - Type de contrat souhaité vs type de l'offre
4. Présente une analyse détaillée avec :
   - Score de correspondance (ex: 75%)
   - Points forts
   - Points à améliorer
   - Recommandation

---

## 📊 Statistiques et Métriques

### Données Accessibles
- Nombre de candidatures
- Taux de réponse
- Candidatures acceptées/refusées
- Offres favorites
- Historique de recherche
- Préférences apprises

---

## 🚀 Exemples de Conversations

### Exemple 1 : Recherche d'Offres
```
Utilisateur : "Je cherche un poste de développeur React à Paris"

Agent : 
Je vais rechercher des offres correspondant à votre recherche...

• Développeur React Senior — TechCorp
Paris · Temps plein · 50 000–65 000 EUR
[Voir l'offre](/candidate/jobs/abc123)

• Développeur Frontend React — StartupXYZ
Paris · Temps plein · 45 000–60 000 EUR
[Voir l'offre](/candidate/jobs/def456)
```

### Exemple 2 : Diagnostic de Carrière
```
Utilisateur : "Fais-moi un diagnostic de carrière"

Agent :
Voici votre diagnostic de carrière :

📊 Profil :
- Expérience : 3 ans
- Compétences : React, Node.js, TypeScript
- Localisation : Paris

📈 Activité :
- Candidatures totales : 12
- En attente : 5
- Acceptées : 2
- Taux de réponse : 58%

💡 Recommandations :
- Vous êtes au niveau intermédiaire, vous pouvez viser des postes avec plus de responsabilités
- Continuez à postuler, votre taux de réponse est bon
```

### Exemple 3 : Simulation d'Entretien
```
Utilisateur : "Simule un entretien pour l'offre [ID]"

Agent :
Bienvenue dans la simulation d'entretien pour le poste de Développeur React Senior chez TechCorp.

Question 1/5 (Motivation) :
Pourquoi souhaitez-vous rejoindre TechCorp en tant que Développeur React Senior ?

💡 Conseils :
- Soyez authentique et sincère
- Mentionnez des éléments spécifiques sur l'entreprise
- Montrez votre alignement avec les valeurs et la mission
```

---

## 🔧 Architecture Technique

### Composants Principaux
- `ChatBox.tsx` : Composant principal de l'interface
- `agentTools.ts` : Définition de tous les outils disponibles
- `agentContext.ts` : Gestion du contexte utilisateur
- `agentMemory.ts` : Gestion de l'historique et des préférences
- `ragIndexer.ts` : Indexation des données pour RAG
- `ragSearch.ts` : Recherche sémantique RAG

### Intégrations
- **Gemini API** : Modèle IA pour les réponses
- **Supabase** : Base de données et authentification
- **RAG** : Système de recherche augmentée

---

## 📝 Notes Importantes

1. **Actions Réelles** : Toutes les actions sont réelles et modifient la base de données
2. **Réponses Obligatoires** : L'agent génère toujours une réponse textuelle après l'exécution d'outils
3. **Formatage** : Respect strict du formatage professionnel pour les offres
4. **Multilingue** : Détection et réponse automatiques dans la langue de l'utilisateur
5. **Contexte** : Utilisation du RAG pour enrichir les réponses avec des données réelles

---

## 🎓 Guide d'Utilisation

### Pour les Candidats

1. **Recherche d'Offres**
   - Utilisez des phrases naturelles
   - Spécifiez vos critères (localisation, salaire, type)
   - L'agent comprend les fautes d'orthographe

2. **Candidatures**
   - Demandez vos candidatures à tout moment
   - Postulez directement via la chatbox
   - Suivez vos statuts

3. **Coaching**
   - Utilisez les simulations d'entretien
   - Préparez-vous aux tests techniques
   - Obtenez des conseils de négociation

4. **Recommandations**
   - Demandez des recommandations personnalisées
   - Comparez des offres
   - Trouvez des offres similaires

### Pour les Entreprises

1. **Gestion des Candidatures**
   - Consultez les candidatures reçues
   - Gérez les statuts
   - Communiquez avec les candidats

2. **Statistiques**
   - Consultez vos métriques
   - Analysez les performances

---

## 🔄 Mises à Jour et Évolutions

La chatbox évolue constamment avec :
- Nouveaux outils et fonctionnalités
- Amélioration de l'apprentissage comportemental
- Optimisation des performances
- Amélioration de l'interface utilisateur

---

## 📞 Support

Pour toute question ou problème :
- Consultez cette documentation
- Vérifiez les exemples d'utilisation
- Contactez le support technique

---

**Version de la documentation** : 1.0  
**Dernière mise à jour** : Janvier 2026  
**Plateforme** : ELYNDRA · TRAJECTORY OS
