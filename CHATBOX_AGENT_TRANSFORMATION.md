# TRANSFORMATION DU CHATBOX EN AGENT OPÉRATIONNEL
## Plan d'action complet et liste des modifications

---

## 📋 ÉTAT ACTUEL (AVANT MODIFICATIONS)

### Capacités réelles actuelles
- ❌ **Aucune action système** : L'IA est un simple chatbot conversationnel
- ❌ **Aucun accès aux données** : Pas d'accès aux données utilisateur, offres, candidatures
- ❌ **Pas de RAG** : Aucun système de récupération de contexte
- ❌ **Pas de mémoire persistante** : Chaque conversation est isolée
- ❌ **Pas d'apprentissage** : Aucune adaptation au comportement utilisateur
- ✅ **Guidance textuelle uniquement** : L'IA peut seulement expliquer comment utiliser la plateforme

### Promesses marketing actuelles (à corriger)
- "Je peux vous aider avec la recherche d'emploi" → ❌ Faux, elle ne peut que guider
- "Je peux gérer vos candidatures" → ❌ Faux, aucune action réelle
- "Je peux accéder à vos données" → ❌ Faux, aucun accès

---

## 🎯 OBJECTIF FINAL

Transformer le ChatBox en **agent opérationnel réellement capable** :
- ✅ Exécuter des actions système (recherche, candidatures, favoris, etc.)
- ✅ Accéder aux données utilisateur en temps réel
- ✅ Utiliser un système RAG pour le contexte
- ✅ Apprendre et s'adapter au comportement utilisateur
- ✅ Discours explicite et honnête sur les capacités réelles

---

## 📝 LISTE COMPLÈTE DES MODIFICATIONS

### 1. ARCHITECTURE D'AGENT AVEC FUNCTION CALLING

#### 1.1 Créer le système de tools/actions
**Fichier à créer :** `src/lib/chatbox/agentTools.ts`

**Actions à implémenter :**
- `searchJobOffers(filters)` - Recherche réelle d'offres d'emploi
- `getJobOfferDetails(jobId)` - Récupérer les détails d'une offre
- `getUserApplications()` - Lister les candidatures de l'utilisateur
- `createApplication(jobId)` - Postuler réellement à une offre
- `getFavoriteJobs()` - Récupérer les favoris
- `addFavoriteJob(jobId)` - Ajouter un favori
- `removeFavoriteJob(jobId)` - Retirer un favori
- `getUserProfile()` - Récupérer le profil utilisateur
- `getUserMessages()` - Récupérer les messages
- `sendMessage(applicationId, content)` - Envoyer un message
- `getDecisionDNA(applicationId)` - Récupérer le Decision DNA
- `getUserStats()` - Statistiques utilisateur
- `searchCompanies(filters)` - Rechercher des entreprises

**Format des tools :**
```typescript
interface AgentTool {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, any>;
    required: string[];
  };
  execute: (params: any, context: AgentContext) => Promise<any>;
}
```

#### 1.2 Implémenter Function Calling avec Groq
**Fichier à modifier :** `src/lib/groq.ts`

**Modifications :**
- Ajouter support pour `tools` et `tool_choice` dans l'API Groq
- Créer fonction `sendMessageWithTools(messages, tools)`
- Gérer les réponses avec `tool_calls`
- Exécuter les tools et renvoyer les résultats à l'IA

#### 1.3 Créer le contexte d'agent
**Fichier à créer :** `src/lib/chatbox/agentContext.ts`

**Contenu :**
- User ID, role (candidate/company)
- Session ID pour la mémoire
- Historique des actions exécutées
- Cache des données récentes

---

### 2. SYSTÈME RAG (RETRIEVAL AUGMENTED GENERATION)

#### 2.1 Créer l'indexeur de données
**Fichier à créer :** `src/lib/chatbox/ragIndexer.ts`

**Données à indexer :**
- ✅ **Offres d'emploi** : Toutes les offres avec métadonnées complètes
- ✅ **Profil utilisateur** : CV, compétences, expérience, localisation
- ✅ **Historique candidatures** : Toutes les candidatures passées et présentes
- ✅ **Messages** : Historique des conversations
- ✅ **Favoris** : Offres sauvegardées
- ✅ **Decision DNA** : Profils Decision DNA de l'utilisateur
- ✅ **Statistiques** : Stats de candidatures, taux de réponse, etc.

**Format d'index :**
```typescript
interface RAGDocument {
  id: string;
  type: 'job_offer' | 'user_profile' | 'application' | 'message' | 'favorite' | 'decision_dna';
  content: string; // Texte indexable
  metadata: Record<string, any>; // Métadonnées structurées
  embedding?: number[]; // Optionnel pour recherche sémantique
  timestamp: Date;
}
```

#### 2.2 Implémenter la recherche RAG
**Fichier à créer :** `src/lib/chatbox/ragSearch.ts`

**Fonctionnalités :**
- Recherche textuelle dans les documents indexés
- Filtrage par type de document
- Filtrage par métadonnées (date, statut, etc.)
- Limite de résultats (top K)
- Score de pertinence

#### 2.3 Intégrer RAG dans le prompt système
- Injecter le contexte RAG dans chaque requête
- Limiter la taille du contexte (ex: top 5 documents les plus pertinents)
- Ajouter métadonnées de source pour transparence

---

### 3. MÉMOIRE PERSISTANTE ET APPRENTISSAGE

#### 3.1 Créer le système de mémoire
**Fichier à créer :** `src/lib/chatbox/agentMemory.ts`

**Tables Supabase à créer :**
```sql
-- Table pour stocker les conversations
CREATE TABLE chatbox_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour stocker les messages avec contexte
CREATE TABLE chatbox_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chatbox_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tools_called JSONB, -- Actions exécutées
  rag_context JSONB, -- Contexte RAG utilisé
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour stocker les préférences utilisateur apprises
CREATE TABLE chatbox_user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  preference_type TEXT NOT NULL, -- 'job_category', 'location', 'salary_range', etc.
  preference_value JSONB NOT NULL,
  confidence_score FLOAT DEFAULT 0.5, -- 0-1
  learned_from TEXT, -- 'explicit', 'implicit', 'behavior'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, preference_type)
);

-- Table pour stocker les patterns de comportement
CREATE TABLE chatbox_behavior_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL, -- 'search_pattern', 'application_pattern', 'message_pattern'
  pattern_data JSONB NOT NULL,
  frequency INTEGER DEFAULT 1,
  last_observed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3.2 Implémenter l'apprentissage
**Fonctionnalités :**
- **Apprentissage explicite** : Préférences directement exprimées par l'utilisateur
- **Apprentissage implicite** : Détection de patterns dans les actions
- **Apprentissage comportemental** : Analyse des interactions (recherches, candidatures, favoris)

**Exemples d'apprentissage :**
- Si l'utilisateur recherche souvent "Développement React" → préférence pour cette catégorie
- Si l'utilisateur postule toujours à des offres full-time → préférence pour ce type
- Si l'utilisateur favorise les offres à Paris → préférence géographique

#### 3.3 Utiliser la mémoire dans les réponses
- Charger l'historique de conversation au démarrage
- Charger les préférences apprises
- Personnaliser les suggestions basées sur l'apprentissage

---

### 4. ACCÈS AUX DONNÉES UTILISATEUR

#### 4.1 Créer le service de données utilisateur
**Fichier à créer :** `src/lib/chatbox/userDataService.ts`

**Données accessibles :**

| Donnée | Accès | Type | Temps réel |
|--------|-------|------|------------|
| **CV utilisateur** | ✅ Oui | Lecture seule | ✅ Oui |
| **Profil complet** | ✅ Oui | Lecture seule | ✅ Oui |
| **Historique navigation** | ❌ Non (pas implémenté) | - | - |
| **Historique candidatures** | ✅ Oui | Lecture seule | ✅ Oui |
| **Messages envoyés/reçus** | ✅ Oui | Lecture seule | ✅ Oui |
| **Localisation** | ✅ Oui | Lecture seule | ✅ Oui |
| **Compétences** | ✅ Oui | Lecture seule | ✅ Oui |
| **Decision DNA** | ✅ Oui | Lecture seule | ✅ Oui |
| **Statistiques** | ✅ Oui | Lecture seule | ✅ Oui |

**Fonctions à créer :**
- `getUserCV()` - Récupérer le CV complet
- `getUserProfile()` - Profil avec toutes les infos
- `getUserApplications()` - Toutes les candidatures
- `getUserMessages()` - Tous les messages
- `getUserLocation()` - Localisation préférée
- `getUserSkills()` - Compétences listées
- `getUserDecisionDNA()` - Profils Decision DNA
- `getUserStats()` - Statistiques agrégées

#### 4.2 Sécurité et permissions
- Vérifier que l'utilisateur est authentifié
- Vérifier que l'utilisateur accède uniquement à SES données
- Logs d'accès pour audit

---

### 5. ACCÈS AUX DONNÉES GLOBALES DE LA PLATEFORME

#### 5.1 Données accessibles

| Donnée | Accès | Type | Temps réel |
|--------|-------|------|------------|
| **Toutes les offres** | ✅ Oui | Lecture seule | ✅ Oui |
| **Détails complets offres** | ✅ Oui | Lecture seule | ✅ Oui |
| **Données entreprises** | ✅ Oui (anonymisées) | Lecture seule | ✅ Oui |
| **Statistiques globales** | ✅ Oui (agrégées) | Lecture seule | ✅ Oui |

**Limites :**
- ✅ Accès exhaustif aux offres d'emploi (pour recherche)
- ✅ Accès aux données entreprises (anonymisées pour candidats)
- ✅ Mise à jour en temps réel via Supabase
- ❌ Pas d'accès aux données privées d'autres utilisateurs

#### 5.2 Fonctions de recherche globale
- `searchAllJobOffers(filters)` - Recherche dans toutes les offres
- `getCompanyPublicData(companyId)` - Données publiques entreprise
- `getGlobalStats()` - Statistiques agrégées (nombre d'offres, etc.)

---

### 6. MISE À JOUR DU PROMPT SYSTÈME

#### 6.1 Nouveau prompt système (explicite et honnête)
**Fichier à modifier :** `src/components/ChatBox.tsx`

**Ancien prompt (à supprimer) :**
```
Tu es l'assistant IA de ELYNDRA · TRAJECTORY OS...
Je peux vous aider avec la recherche d'emploi...
```

**Nouveau prompt (à implémenter) :**
```
Tu es un agent IA opérationnel de ELYNDRA · TRAJECTORY OS.

CAPACITÉS RÉELLES (ce que tu PEUX faire) :
✅ Rechercher des offres d'emploi dans la base de données en temps réel
✅ Récupérer les détails complets d'une offre d'emploi
✅ Lister les candidatures de l'utilisateur avec leurs statuts
✅ Postuler à une offre d'emploi (créer une candidature)
✅ Ajouter/retirer des offres en favoris
✅ Récupérer le profil complet de l'utilisateur (CV, compétences, expérience)
✅ Accéder à l'historique des messages
✅ Envoyer des messages aux entreprises
✅ Récupérer les profils Decision DNA
✅ Accéder aux statistiques de l'utilisateur
✅ Utiliser le contexte RAG pour répondre avec des données réelles

LIMITES EXPLICITES (ce que tu NE PEUX PAS faire) :
❌ Modifier le profil utilisateur (lecture seule)
❌ Supprimer des candidatures
❌ Accéder aux données d'autres utilisateurs
❌ Modifier les offres d'emploi (si candidat)
❌ Apprendre de manière persistante sans stockage explicite

ACCÈS AUX DONNÉES :
- Profil utilisateur : ✅ Lecture seule, temps réel
- Candidatures : ✅ Lecture seule, temps réel
- Messages : ✅ Lecture seule, temps réel
- Offres d'emploi : ✅ Lecture seule, temps réel
- Decision DNA : ✅ Lecture seule, temps réel
- Historique navigation : ❌ Non disponible

MÉMOIRE :
- Conversations : ✅ Persistante (stockée en base)
- Préférences : ✅ Apprises et stockées
- Patterns comportementaux : ✅ Détectés et stockés

INSTRUCTIONS :
1. Utilise les tools disponibles pour exécuter des actions réelles
2. Accède aux données via RAG pour répondre avec précision
3. Sois explicite : dis "Je vais rechercher..." puis exécute réellement
4. Ne promets jamais ce que tu ne peux pas faire
5. Utilise les préférences apprises pour personnaliser les suggestions
6. Fournis toujours des données réelles, pas des exemples fictifs
```

#### 6.2 Format de réponse standardisé
- **Action exécutée** : "✅ J'ai recherché 15 offres correspondant à vos critères"
- **Données réelles** : Toujours utiliser les vraies données, jamais d'exemples
- **Transparence** : Mentionner la source des données si pertinent

---

### 7. INTERFACE UTILISATEUR

#### 7.1 Indicateurs visuels d'actions
**Fichier à modifier :** `src/components/ChatBox.tsx`

**Ajouts :**
- Badge "Action exécutée" quand une tool est appelée
- Indicateur de chargement pendant l'exécution
- Affichage des résultats d'actions (ex: "✅ 15 offres trouvées")
- Lien vers les résultats (ex: "Voir les offres" → redirection)

#### 7.2 Affichage du contexte RAG
- Optionnel : Afficher "Basé sur vos données réelles" quand RAG est utilisé
- Transparence sur les sources

#### 7.3 Gestion des erreurs
- Messages d'erreur clairs si une action échoue
- Suggestions de solutions

---

### 8. TESTS ET VALIDATION

#### 8.1 Tests unitaires
**Fichiers à créer :**
- `src/lib/chatbox/__tests__/agentTools.test.ts`
- `src/lib/chatbox/__tests__/ragSearch.test.ts`
- `src/lib/chatbox/__tests__/agentMemory.test.ts`

#### 8.2 Tests d'intégration
- Tester le flow complet : question → tool call → exécution → réponse
- Tester l'accès aux données utilisateur
- Tester la mémoire persistante

#### 8.3 Validation des capacités
- ✅ Checklist : Toutes les actions listées fonctionnent réellement
- ✅ Checklist : Toutes les données accessibles sont réellement accessibles
- ✅ Checklist : Le discours IA correspond aux capacités réelles

---

## 📊 RÉSUMÉ DES FICHIERS À CRÉER/MODIFIER

### Fichiers à CRÉER :
1. `src/lib/chatbox/agentTools.ts` - Définition des tools/actions
2. `src/lib/chatbox/agentContext.ts` - Contexte de l'agent
3. `src/lib/chatbox/ragIndexer.ts` - Indexation des données pour RAG
4. `src/lib/chatbox/ragSearch.ts` - Recherche RAG
5. `src/lib/chatbox/agentMemory.ts` - Mémoire persistante
6. `src/lib/chatbox/userDataService.ts` - Service d'accès aux données utilisateur
7. `src/lib/chatbox/types.ts` - Types TypeScript pour l'agent
8. `supabase_migrations/chatbox_agent.sql` - Tables pour mémoire et préférences

### Fichiers à MODIFIER :
1. `src/lib/groq.ts` - Ajouter support function calling
2. `src/components/ChatBox.tsx` - Intégrer l'agent, nouveau prompt système
3. `src/lib/supabase.ts` - Exposer les fonctions nécessaires (déjà fait)

---

## ✅ CHECKLIST FINALE DE VALIDATION

### Capacités opérationnelles
- [ ] L'IA peut rechercher des offres d'emploi réellement
- [ ] L'IA peut récupérer les détails d'une offre
- [ ] L'IA peut lister les candidatures de l'utilisateur
- [ ] L'IA peut postuler à une offre (créer candidature)
- [ ] L'IA peut gérer les favoris (ajouter/retirer)
- [ ] L'IA peut accéder au profil utilisateur
- [ ] L'IA peut accéder aux messages
- [ ] L'IA peut envoyer des messages
- [ ] L'IA peut accéder au Decision DNA

### Accès aux données
- [ ] Accès au CV utilisateur (lecture seule, temps réel)
- [ ] Accès au profil complet (lecture seule, temps réel)
- [ ] Accès à l'historique candidatures (lecture seule, temps réel)
- [ ] Accès aux messages (lecture seule, temps réel)
- [ ] Accès à la localisation (lecture seule, temps réel)
- [ ] Accès aux compétences (lecture seule, temps réel)
- [ ] Accès au Decision DNA (lecture seule, temps réel)
- [ ] Accès à toutes les offres d'emploi (lecture seule, temps réel)
- [ ] Accès aux données entreprises (lecture seule, temps réel)

### RAG
- [ ] Système RAG implémenté
- [ ] Indexation des offres d'emploi
- [ ] Indexation du profil utilisateur
- [ ] Indexation de l'historique candidatures
- [ ] Indexation des messages
- [ ] Indexation des favoris
- [ ] Indexation du Decision DNA
- [ ] Recherche RAG fonctionnelle
- [ ] Injection du contexte RAG dans les prompts

### Mémoire et apprentissage
- [ ] Conversations stockées en base
- [ ] Préférences utilisateur stockées
- [ ] Patterns comportementaux détectés
- [ ] Apprentissage explicite fonctionnel
- [ ] Apprentissage implicite fonctionnel
- [ ] Apprentissage comportemental fonctionnel
- [ ] Utilisation de la mémoire dans les réponses

### Discours IA
- [ ] Prompt système mis à jour (explicite)
- [ ] Aucune promesse non supportée
- [ ] Réponses reflètent les capacités réelles
- [ ] Distinction claire entre "je peux faire" et "je peux expliquer"
- [ ] Transparence sur les limites

---

## 🎯 RÉSULTAT FINAL ATTENDU

Après toutes ces modifications, le ChatBox sera :

1. **Un agent opérationnel réel** : Capable d'exécuter des actions système
2. **Accès aux données en temps réel** : Utilise les vraies données utilisateur et plateforme
3. **RAG fonctionnel** : Contexte enrichi pour réponses précises
4. **Mémoire persistante** : Apprend et s'adapte au comportement utilisateur
5. **Discours honnête** : Promesses alignées avec capacités réelles
6. **Transparent** : L'utilisateur sait exactement ce que l'IA peut faire

---

## 📅 ORDRE D'IMPLÉMENTATION RECOMMANDÉ

1. **Phase 1 : Infrastructure** (1-2 jours)
   - Créer les types et interfaces
   - Créer le contexte d'agent
   - Modifier groq.ts pour function calling

2. **Phase 2 : Tools/Actions** (2-3 jours)
   - Implémenter toutes les tools
   - Tester chaque action individuellement
   - Intégrer avec Supabase

3. **Phase 3 : RAG** (2-3 jours)
   - Créer l'indexeur
   - Implémenter la recherche
   - Intégrer dans le prompt

4. **Phase 4 : Mémoire** (2-3 jours)
   - Créer les tables Supabase
   - Implémenter le stockage
   - Implémenter l'apprentissage

5. **Phase 5 : Intégration** (1-2 jours)
   - Intégrer tout dans ChatBox.tsx
   - Mettre à jour le prompt système
   - Tests end-to-end

6. **Phase 6 : UI/UX** (1 jour)
   - Indicateurs visuels
   - Gestion d'erreurs
   - Affichage des résultats

**Total estimé : 9-14 jours de développement**

---

*Document créé le : [Date actuelle]*
*Dernière mise à jour : [Date actuelle]*
