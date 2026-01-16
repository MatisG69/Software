import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, X, User, Minimize2, Sparkles, History, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { sendMessageWithTools, sendMessageToGemini, ChatMessage } from '@/lib/gemini';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { createAgentContext, getAgentContext } from '@/lib/chatbox/agentContext';
import { agentTools, getToolByName, toolsToGeminiFormat } from '@/lib/chatbox/agentTools';
import { indexAllUserData, indexAllJobOffers } from '@/lib/chatbox/ragIndexer';
import { searchRAGDocuments, formatRAGContext } from '@/lib/chatbox/ragSearch';
import { 
  getConversationHistory, 
  saveMessage, 
  getUserPreferences,
  detectSearchPattern,
  detectApplicationPattern,
  getConversationId,
  listConversations,
  createNewConversation,
  deleteConversation,
} from '@/lib/chatbox/agentMemory';
import { getDataAccessSummary } from '@/lib/chatbox/userDataService';
import { RAGDocument } from '@/lib/chatbox/types';

// Composant pour rendre le contenu des messages avec liens cliquables
const MessageContent = ({ content }: { content: string }) => {
  // Parser les liens markdown [texte](/path)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: (string | { text: string; href: string })[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    // Ajouter le texte avant le lien
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }
    // Ajouter le lien
    parts.push({
      text: match[1],
      href: match[2],
    });
    lastIndex = linkRegex.lastIndex;
  }

  // Ajouter le texte restant
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  // Si aucun lien trouvé, retourner le contenu tel quel
  if (parts.length === 0) {
    return <p>{content}</p>;
  }

  return (
    <p>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return <span key={index}>{part}</span>;
        }
        return (
          <Link
            key={index}
            to={part.href}
            className="text-primary hover:text-primary/80 underline font-medium transition-colors inline-flex items-center gap-1 mt-1"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {part.text}
          </Link>
        );
      })}
    </p>
  );
};

// Nouveau prompt système explicite et honnête
const getSystemPrompt = (dataAccess: any, preferences: any[]): string => {
  return `Tu es un agent IA opérationnel de ELYNDRA · TRAJECTORY OS.

CAPACITÉS RÉELLES (ce que tu PEUX faire) :
✅ Rechercher des offres d'emploi dans la base de données en temps réel (avec filtres : salaire, type, localisation, télétravail, catégorie)
✅ Récupérer des recommandations d'offres personnalisées basées sur le profil du candidat
✅ Comparer deux offres d'emploi côte à côte
✅ Trouver des offres similaires à une offre donnée
✅ Effectuer un diagnostic de carrière rapide (careerDiagnostic)
✅ Créer des alertes d'emploi automatiques (createJobAlert)
✅ Simuler des entretiens avec questions/réponses (simulateInterview)
✅ Préparer aux tests techniques (prepareTechnicalTest)
✅ Donner des conseils de négociation salariale personnalisés (salaryNegotiationAdvice)
✅ Récupérer les détails complets d'une offre d'emploi
✅ Lister les candidatures de l'utilisateur avec leurs statuts
✅ Postuler à une offre d'emploi (créer une candidature)
✅ Ajouter/retirer des offres en favoris
✅ Récupérer le profil complet de l'utilisateur (CV, compétences, expérience, localisation)
✅ Accéder à l'historique des messages
✅ Envoyer des messages aux entreprises
✅ Récupérer les profils Decision DNA
✅ Accéder aux statistiques de l'utilisateur
✅ Utiliser le contexte RAG pour répondre avec des données réelles
✅ Fournir des conseils de carrière personnalisés
✅ Aider à la reconversion professionnelle
✅ Reformuler des offres complexes de manière simple

LIMITES EXPLICITES (ce que tu NE PEUX PAS faire) :
❌ Modifier le profil utilisateur (lecture seule)
❌ Supprimer des candidatures
❌ Accéder aux données d'autres utilisateurs
❌ Modifier les offres d'emploi (si candidat)
❌ Apprendre de manière persistante sans stockage explicite

ACCÈS AUX DONNÉES :
- Profil utilisateur : ${dataAccess.profile.available ? '✅ Lecture seule, temps réel' : '❌ Non disponible'}
- Candidatures : ${dataAccess.applications_history.available ? '✅ Lecture seule, temps réel' : '❌ Non disponible'}
- Messages : ${dataAccess.messages.available ? '✅ Lecture seule, temps réel' : '❌ Non disponible'}
- Offres d'emploi : ✅ Lecture seule, temps réel
- Decision DNA : ${dataAccess.decision_dna.available ? '✅ Lecture seule, temps réel' : '❌ Non disponible'}
- Historique navigation : ${dataAccess.navigation_history.available ? '✅ Disponible' : '❌ Non disponible'}

PRÉFÉRENCES APPRISES :
${preferences.length > 0 ? preferences.map(p => `- ${p.preference_type}: ${JSON.stringify(p.preference_value)} (confiance: ${(p.confidence_score * 100).toFixed(0)}%)`).join('\n') : 'Aucune préférence apprise pour le moment'}

INSTRUCTIONS :
1. **IMPORTANT** : Quand l'utilisateur demande quelque chose qui nécessite une action (recherche d'offres, liste de candidatures, etc.), TU DOIS utiliser les tools disponibles. N'explique pas comment faire, EXÉCUTE l'action.

2. **RÉPONSE OBLIGATOIRE APRÈS EXÉCUTION DES TOOLS** : Après avoir exécuté un ou plusieurs tools, TU DOIS TOUJOURS générer une réponse textuelle complète et détaillée basée sur les résultats. Ne dis JAMAIS simplement "Action exécutée avec succès" ou des messages génériques. Analyse les résultats des tools et réponds de manière informative et utile :
   - Si tu as recherché des offres : liste-les avec leurs détails (titre, entreprise, localisation, salaire, type) et inclus les liens [Voir l'offre](/candidate/jobs/{id})
   - Si tu as récupéré le profil : présente les informations pertinentes (compétences, expérience, localisation, etc.)
   - Si tu as récupéré les détails d'une offre : présente les informations de l'offre (description, missions, compétences requises, salaire, etc.)
   - Si l'utilisateur demande "est-ce que je correspond à cette offre ?" ou "peux-tu me dire si je correspond ?" :
     * TU DOIS d'abord récupérer le profil avec getUserProfile
     * PUIS récupérer les détails de l'offre avec getJobOfferDetails
     * ENSUITE analyser la correspondance en comparant :
       - Les compétences du profil vs les compétences requises
       - L'expérience du profil vs l'expérience requise
       - La localisation du profil vs la localisation de l'offre
       - Le type de contrat souhaité vs le type de l'offre
     * Présente une analyse détaillée avec :
       - Un score de correspondance (ex: "Vous correspondez à 75% à cette offre")
       - Les points forts (compétences qui correspondent)
       - Les points à améliorer (compétences manquantes)
       - Une conclusion avec recommandation
   - Si tu as comparé des offres : présente la comparaison de manière claire
   - Si tu as exécuté une autre action : présente les résultats de manière claire et structurée
3. Exemples d'utilisation des tools :
   - "Y a-t-il des offres en développement ?" → Utilise searchJobOffers avec category="Développement"
   - "Je cherche un poste de développeur junior en télétravail avec un salaire entre 30000 et 40000€" → Utilise searchJobOffers avec search="développeur junior", remote=true, salaryMin=30000, salaryMax=40000
   - "Montre-moi des offres qui me correspondent" → Utilise getPersonalizedJobRecommendations
   - "Fais-moi un diagnostic de carrière" → Utilise careerDiagnostic
   - "Crée une alerte pour les offres de développeur à Lille" → Utilise createJobAlert avec category="Développement", location="Lille"
   - "Simule un entretien pour cette offre" → Utilise simulateInterview avec jobId et questionNumber=1
   - Pour les questions suivantes, utilise simulateInterview avec questionNumber et previousAnswers (tableau de toutes les réponses précédentes)
   - Après la 5ème question, le rapport est généré automatiquement avec analyse et conseils personnalisés
   - "Aide-moi à préparer le test technique pour cette offre" → Utilise prepareTechnicalTest avec jobId
   - "Donne-moi des conseils pour négocier le salaire de cette offre" → Utilise salaryNegotiationAdvice avec jobId
   - "Compare ces deux offres" → Utilise compareJobOffers avec les IDs des offres
   - "Trouve-moi des offres similaires à celle-ci" → Utilise findSimilarJobOffers
   - "Montre-moi mes candidatures" → Utilise getUserApplications
   - "Quelles sont mes offres favorites ?" → Utilise getFavoriteJobs
4. **RECHERCHE PAR CATÉGORIE** : Tu peux rechercher des offres dans N'IMPORTE QUELLE catégorie (Finance, Commerce, Santé, Développement, Design, Management, Marketing, etc.). Il n'y a PAS de liste limitée de catégories. Si une recherche ne retourne aucun résultat, dis simplement "Je n'ai trouvé aucune offre d'emploi dans la catégorie [catégorie] pour le moment." Ne dis JAMAIS qu'une catégorie n'existe pas ou n'est pas disponible.

5. **LIENS VERS LES OFFRES** : Quand tu listes des offres d'emploi, chaque offre retournée par searchJobOffers contient un champ "id". TU DOIS inclure un lien cliquable pour chaque offre au format : [Voir l'offre](/candidate/jobs/{id}) où {id} est l'ID de l'offre. Place ce lien sur une nouvelle ligne juste après les détails de chaque offre.
6. Accède aux données via RAG pour répondre avec précision
7. Sois explicite : dis "Je vais rechercher..." puis exécute réellement la tool
8. Ne promets jamais ce que tu ne peux pas faire
9. Utilise les préférences apprises pour personnaliser les suggestions
10. Fournis toujours des données réelles, pas des exemples fictifs
11. **LANGUE** : Détecte automatiquement la langue de l'utilisateur et réponds dans la même langue (français, anglais, espagnol, arabe, chinois, etc.). Si l'utilisateur écrit en français, réponds en français. Si l'utilisateur écrit en anglais, réponds en anglais, etc.
12. Sois concis, professionnel, et amical

FONCTIONNALITÉS SPÉCIALES POUR LES CANDIDATS :

🧭 **ORIENTATION & ONBOARDING** :
- Accueille chaleureusement les nouveaux candidats
- Aide à comprendre et compléter le profil (métier, expérience, compétences, localisation)
- Explique le fonctionnement de la plateforme de manière claire
- Propose un diagnostic de carrière rapide basé sur le profil
- Suggère des parcours professionnels adaptés

🔍 **RECHERCHE INTELLIGENTE** :
- Comprend les recherches en langage naturel (ex: "Je cherche un poste de développeur junior en télétravail")
- Utilise les filtres dynamiques (salaire, type de contrat, lieu, télétravail) automatiquement
- Propose des recommandations personnalisées avec getPersonalizedJobRecommendations
- Compare les offres avec compareJobOffers
- Trouve des offres similaires avec findSimilarJobOffers

💼 **COACHING CARRIÈRE** :
- Donne des conseils personnalisés basés sur le profil et l'historique
- **SIMULATIONS D'ENTRETIENS** : 
  * Lance une simulation avec simulateInterview(jobId, questionNumber=1)
  * Pour chaque question suivante, utilise simulateInterview avec questionNumber et previousAnswers contenant toutes les réponses précédentes
  * Après la 5ème question, l'outil génère automatiquement un rapport complet avec :
    - Score global (0-100)
    - Points forts et faibles par catégorie
    - Analyse détaillée par catégorie (motivation, technique, comportemental, négociation, carrière)
    - Recommandations personnalisées basées sur les réponses
  * Présente le rapport de manière claire et structurée avec des sections bien formatées
- Donne des conseils de négociation salariale basés sur le marché
- Aide à la reconversion professionnelle avec des suggestions de parcours
- Fournit des feedbacks constructifs sur les candidatures

🌍 **ACCESSIBILITÉ & MULTILINGUE** :
- **Détection automatique de la langue** : Si l'utilisateur écrit dans une autre langue (anglais, espagnol, arabe, chinois), réponds dans la même langue
- **Reformulation simple** : Reformule les offres complexes de manière simple et accessible
- **Langage inclusif** : Adapte le langage selon le niveau de compréhension, utilise un vocabulaire clair
- **Support multilingue** : Tu peux communiquer en français, anglais, espagnol, arabe, chinois, et autres langues selon les besoins de l'utilisateur
- **Simplification** : Si une offre est trop technique ou complexe, propose une version simplifiée avec les points clés

FORMATAGE PROFESSIONNEL (CRITIQUE - À RESPECTER ABSOLUMENT) :
Toutes tes réponses doivent être formatées de manière professionnelle, propre et élégante.

**EXEMPLE DE FORMATAGE CORRECT pour les offres d'emploi :**

Voici les offres d'emploi que j'ai trouvées :

• Développeur test — JKBuildings
Lille · Temps plein
[Voir l'offre](/candidate/jobs/{id})

• Développeur front — matis
Lille · Temps plein · 23 000–30 000 EUR
[Voir l'offre](/candidate/jobs/{id})

• Développeur Web Full Stack JK — JKBuildings
Télétravail / hybride (France) · Temps plein · 45 000–60 000 EUR

**Règles de formatage OBLIGATOIRES :**

1. **Puces** : Toujours utiliser • (point médian Unicode) pour les listes, JAMAIS de tirets (-) ou astérisques (*)

2. **Séparateurs** : Toujours utiliser · (point médian) pour séparer les informations sur une même ligne (localisation, type, salaire)

3. **Nombres** : Toujours formater les montants avec des espaces insécables (ex: 23 000–30 000 EUR, pas 23000-30000)

4. **Sauts de ligne** : Toujours mettre un saut de ligne entre le titre et les détails, et entre chaque élément de liste

5. **Structure** : 
   - Ligne 1 : • [Titre] — [Entreprise]
   - Ligne 2 : [Localisation] · [Type] · [Salaire si disponible]
   - Ligne 3 : [Voir l'offre](/candidate/jobs/{id}) - OBLIGATOIRE pour chaque offre

6. **Liens** : Pour chaque offre d'emploi, TU DOIS inclure un lien au format markdown : [Voir l'offre](/candidate/jobs/{id}) où {id} est l'ID de l'offre retourné par la fonction searchJobOffers dans le champ "id" de chaque job. Remplace {id} par l'ID réel (ex: si l'ID est "abc123", le lien sera [Voir l'offre](/candidate/jobs/abc123)). Le lien doit être sur une nouvelle ligne juste après les détails de l'offre.

7. **Ton** : Professionnel, poli, concis mais complet

8. **Markdown** : Utiliser uniquement les liens markdown [texte](/path) pour les offres, éviter le markdown complexe ailleurs

9. **Espacement** : Garder un espacement cohérent et aéré entre les sections

**Pour toutes les autres réponses :**
- Structure claire avec des paragraphes courts
- Utilise des sauts de ligne pour aérer le texte
- Sois concis mais complet
- Utilise un ton professionnel et poli
- Formate les listes avec des puces • et des sauts de ligne`;

};

export const ChatBox = () => {
  const { user, candidate, company } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [animatingMessages, setAnimatingMessages] = useState<Set<number>>(new Set());
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [ragDocuments, setRagDocuments] = useState<RAGDocument[]>([]);
  const [executedActions, setExecutedActions] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Array<{
    id: string;
    created_at: string;
    updated_at: string;
    preview: string;
    message_count: number;
  }>>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const agentContextInitialized = useRef(false);

  // Initialiser le contexte agent et charger les données
  useEffect(() => {
    if (user && !agentContextInitialized.current) {
      const context = createAgentContext(
        user.id,
        user.role,
        candidate?.id,
        company?.id
      );
      agentContextInitialized.current = true;

      // Charger l'historique de conversation
      loadConversationHistory();

      // Charger la liste des conversations
      loadConversationsList();

      // Indexer les données pour RAG
      loadRAGData();

      // Initialiser le message système
      initializeSystemMessage();
    }
  }, [user, candidate, company]);

  const loadConversationHistory = async (conversationId?: string) => {
    if (!user) return;
    const context = getAgentContext();
    if (!context) return;

    try {
      // Toujours réinitialiser le message système d'abord
      const dataAccess = getDataAccessSummary(context);
      const preferences = await getUserPreferences(context);
      const systemPrompt = getSystemPrompt(dataAccess, preferences);
      
      const history = await getConversationHistory(context, 100, conversationId);
      if (history.length > 0) {
        // Charger l'historique avec le message système
        setMessages([
          { role: 'system', content: systemPrompt },
          ...history,
        ]);
      } else {
        // Si pas d'historique, afficher le message système et le message de bienvenue
        const welcomeMessage = 'Bonjour ! Je suis votre agent IA opérationnel. Je peux réellement rechercher des offres, gérer vos candidatures, accéder à vos données, et bien plus. Comment puis-je vous aider aujourd\'hui ?';
        setMessages([
          { role: 'system', content: systemPrompt },
          { role: 'assistant', content: welcomeMessage },
        ]);
      }
      
      // Réinitialiser les actions exécutées
      setExecutedActions([]);
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const loadConversationsList = async () => {
    if (!user) return;
    const context = getAgentContext();
    if (!context) return;

    try {
      const convs = await listConversations(context);
      setConversations(convs);
      
      // Si une conversation est sélectionnée, la charger
      if (currentConversationId) {
        await loadConversationHistory(currentConversationId);
      } else if (convs.length > 0) {
        // Charger la conversation la plus récente
        setCurrentConversationId(convs[0].id);
        await loadConversationHistory(convs[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations list:', error);
    }
  };

  const handleNewConversation = async () => {
    if (!user) return;
    const context = getAgentContext();
    if (!context) return;

    try {
      const newConvId = await createNewConversation(context);
      if (newConvId) {
        setCurrentConversationId(newConvId);
        
        // Réinitialiser complètement les messages avec le système et le message de bienvenue
        const dataAccess = getDataAccessSummary(context);
        const preferences = await getUserPreferences(context);
        const systemPrompt = getSystemPrompt(dataAccess, preferences);
        const welcomeMessage = 'Bonjour ! Je suis votre agent IA opérationnel. Je peux réellement rechercher des offres, gérer vos candidatures, accéder à vos données, et bien plus. Comment puis-je vous aider aujourd\'hui ?';
        
        setMessages([
          { role: 'system', content: systemPrompt },
          { role: 'assistant', content: welcomeMessage },
        ]);
        
        // Réinitialiser aussi les actions exécutées
        setExecutedActions([]);
        
        await loadConversationsList();
      }
    } catch (error) {
      console.error('Error creating new conversation:', error);
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    await loadConversationHistory(conversationId);
    setShowHistory(false);
  };

  const loadRAGData = async () => {
    if (!user) return;
    const context = getAgentContext();
    if (!context) return;

    try {
      // Indexer les données utilisateur
      const userDocs = await indexAllUserData(context);
      
      // Indexer quelques offres récentes (limité pour performance)
      const jobDocs = await indexAllJobOffers(50);
      
      setRagDocuments([...userDocs, ...jobDocs]);
    } catch (error) {
      console.error('Error loading RAG data:', error);
    }
  };

  const initializeSystemMessage = async () => {
    if (!user) return;
    const context = getAgentContext();
    if (!context) return;

    const dataAccess = getDataAccessSummary(context);
    const preferences = await getUserPreferences(context);

    const systemPrompt = getSystemPrompt(dataAccess, preferences);
    const welcomeMessage = 'Bonjour ! Je suis votre agent IA opérationnel. Je peux réellement rechercher des offres, gérer vos candidatures, accéder à vos données, et bien plus. Comment puis-je vous aider aujourd\'hui ?';

    setMessages([
      { role: 'system', content: systemPrompt },
      { role: 'assistant', content: welcomeMessage },
    ]);
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Gérer le scroll quand le clavier apparaît sur mobile
  useEffect(() => {
    const scrollToBottom = () => {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
          if (scrollContainer) {
            scrollContainer.scrollTo({
              top: scrollContainer.scrollHeight,
              behavior: 'smooth'
            });
          }
        }
      }, 100);
    };

    const handleFocus = () => {
      setIsKeyboardOpen(true);
      scrollToBottom();
    };

    const handleBlur = () => {
      setIsKeyboardOpen(false);
    };

    const handleViewportResize = () => {
      if (typeof window !== 'undefined' && window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const keyboardHeight = windowHeight - viewportHeight;
        
        if (keyboardHeight > 150) {
          setIsKeyboardOpen(true);
          setKeyboardOffset(keyboardHeight);
          scrollToBottom();
        } else {
          setIsKeyboardOpen(false);
          setKeyboardOffset(0);
        }
      }
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
    }

    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize);
    }
    
    return () => {
      if (input) {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      }
      if (typeof window !== 'undefined' && window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
      }
    };
  }, [isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim() || loading || !user) return;

    const context = getAgentContext();
    if (!context) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // La conversation sera créée/gérée automatiquement dans saveMessage

    // Animation pour le message utilisateur
    const userMessageIndex = newMessages.filter((msg) => msg.role !== 'system').length - 1;
    setAnimatingMessages((prev) => new Set([...prev, userMessageIndex]));

    try {
      // Recherche RAG pour contexte
      const ragContext = searchRAGDocuments(ragDocuments, input.trim(), { limit: 5 });
      const ragContextText = formatRAGContext(ragContext);

      // Préparer les messages avec contexte RAG
      const messagesWithContext = newMessages.map((msg, idx) => {
        if (idx === newMessages.length - 1 && msg.role === 'user') {
          return {
            ...msg,
            content: ragContextText + '\n\n' + msg.content,
          };
        }
        return msg;
      });

      // Appeler Gemini avec function calling
      const tools = toolsToGeminiFormat();
      let response;
      let toolCalls: any[] = [];
      const executedToolNames: string[] = []; // Déclarer avant le bloc if

      try {
        const systemPrompt = messages.find(m => m.role === 'system')?.content;
        response = await sendMessageWithTools(messagesWithContext, tools, systemPrompt);
        toolCalls = response.tool_calls || [];
      } catch (error: any) {
        // Si function calling échoue, essayer sans tools
        console.warn('Function calling failed, trying without tools:', error);
        try {
          const systemPrompt = messages.find(m => m.role === 'system')?.content;
          const fallbackResponse = await sendMessageToGemini(messagesWithContext, systemPrompt);
          response = { content: fallbackResponse };
        } catch (fallbackError) {
          throw error; // Relancer l'erreur originale
        }
      }

      let assistantContent = response?.content || '';

      // Exécuter les tools si nécessaire
      if (toolCalls.length > 0) {
        const toolResults: ChatMessage[] = [];

        for (const toolCall of toolCalls) {
          const tool = getToolByName(toolCall.function.name);
          if (tool) {
            try {
              const params = JSON.parse(toolCall.function.arguments);
              const result = await tool.execute(params, context);

              toolResults.push({
                role: 'tool',
                content: JSON.stringify(result),
                tool_call_id: toolCall.function.name, // Gemini utilise le nom de la fonction comme ID
              });

              executedToolNames.push(tool.name);

              // Apprentissage comportemental
              if (tool.name === 'searchJobOffers') {
                await detectSearchPattern(context, params.search || '', params);
              }
              if (tool.name === 'createApplication') {
                // Récupérer la catégorie de l'offre pour l'apprentissage
                const jobDetails = await getToolByName('getJobOfferDetails')?.execute({ jobId: params.jobId }, context);
                if (jobDetails?.success) {
                  await detectApplicationPattern(context, jobDetails.job.category, jobDetails.job.type);
                }
              }
            } catch (error: any) {
              toolResults.push({
                role: 'tool',
                content: JSON.stringify({ success: false, error: error.message }),
                tool_call_id: toolCall.function.name, // Gemini utilise le nom de la fonction comme ID
              });
            }
          }
        }

        setExecutedActions(executedToolNames);

        // Envoyer les résultats des tools à l'IA pour générer la réponse finale
        // Ajouter un message explicite pour que l'IA comprenne qu'elle doit répondre
        const messagesWithToolResults = [
          ...messagesWithContext,
          ...toolResults.map(tr => ({
            ...tr,
            role: 'tool' as const,
          })),
          {
            role: 'user' as const,
            content: 'Analyse les résultats des actions exécutées et réponds de manière complète et détaillée à la question de l\'utilisateur. Présente les informations de manière claire et structurée.',
          },
        ];

        try {
          const systemPrompt = messages.find(m => m.role === 'system')?.content;
          // Utiliser sendMessageToGemini car on n'a plus besoin de function calling pour la réponse finale
          const finalResponse = await sendMessageToGemini(messagesWithToolResults, systemPrompt);
          assistantContent = finalResponse || 'Je n\'ai pas pu générer de réponse. Veuillez réessayer.';
          
          // Si la réponse est vide ou trop courte, essayer de formater les résultats manuellement
          if (!assistantContent || assistantContent.trim().length < 10) {
            const toolResultsSummary = toolResults.map(tr => {
              try {
                const result = JSON.parse(tr.content);
                if (result.success !== false) {
                  return result;
                }
              } catch (e) {
                return null;
              }
              return null;
            }).filter(r => r !== null);
            
            if (toolResultsSummary.length > 0) {
              assistantContent = `J'ai exécuté les actions suivantes : ${executedToolNames.join(', ')}. Voici les résultats :\n\n${JSON.stringify(toolResultsSummary, null, 2)}`;
            } else {
              assistantContent = `J'ai exécuté ${executedToolNames.length} action(s) : ${executedToolNames.join(', ')}. Les résultats sont disponibles.`;
            }
          }
        } catch (error: any) {
          // Si la réponse finale échoue, formater les résultats manuellement
          console.warn('Error getting final response:', error);
          const toolResultsSummary = toolResults.map(tr => {
            try {
              const result = JSON.parse(tr.content);
              if (result.success !== false) {
                return result;
              }
            } catch (e) {
              return null;
            }
            return null;
          }).filter(r => r !== null);
          
          if (toolResultsSummary.length > 0) {
            assistantContent = `J'ai exécuté les actions suivantes : ${executedToolNames.join(', ')}. Voici les résultats :\n\n${JSON.stringify(toolResultsSummary, null, 2)}`;
          } else {
            assistantContent = `J'ai exécuté ${executedToolNames.length} action(s) : ${executedToolNames.join(', ')}. Les résultats sont disponibles.`;
          }
        }
      }

      const assistantMessageIndex = newMessages.filter((msg) => msg.role !== 'system').length;
      setMessages([...newMessages, { role: 'assistant', content: assistantContent }]);

      // Sauvegarder les messages
      try {
        const conversationId = currentConversationId || await getConversationId(context);
        if (conversationId) {
          if (!currentConversationId) {
            setCurrentConversationId(conversationId);
          }
          await saveMessage(conversationId, {
            role: 'user',
            content: userMessage.content,
          });
          await saveMessage(conversationId, {
            role: 'assistant',
            content: assistantContent,
            tools_called: executedToolNames,
            rag_context: ragContext,
          });
          // Recharger la liste des conversations pour mettre à jour les previews
          await loadConversationsList();
        }
      } catch (error) {
        console.error('Error saving messages:', error);
      }

      // Animation pour le message assistant
      setTimeout(() => {
        setAnimatingMessages((prev) => new Set([...prev, assistantMessageIndex]));
        setTimeout(() => {
          setAnimatingMessages((prev) => {
            const next = new Set(prev);
            next.delete(assistantMessageIndex);
            return next;
          });
        }, 500);
      }, 100);
    } catch (error: any) {
      console.error('Error sending message:', error);
      const assistantMessageIndex = newMessages.filter((msg) => msg.role !== 'system').length;
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.',
        },
      ]);
    } finally {
      setLoading(false);
      setExecutedActions([]);
      setTimeout(() => {
        setAnimatingMessages((prev) => {
          const next = new Set(prev);
          next.delete(userMessageIndex);
          return next;
        });
      }, 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpen = () => {
    setIsOpening(true);
    setTimeout(() => {
      setIsOpen(true);
      setTimeout(() => {
        setIsOpening(false);
      }, 600);
    }, 10);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 500);
  };

  if (!isOpen && !isClosing) {
    return (
      <>
        <style>{`
          @keyframes buttonPulse {
            0%, 100% {
              transform: scale(1) rotate(0deg);
            }
            50% {
              transform: scale(1.1) rotate(5deg);
            }
          }
          .chat-button-pulse {
            animation: buttonPulse 2s ease-in-out infinite;
          }
        `}</style>
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <Button
            onClick={handleOpen}
            className="h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-xl hover:shadow-2xl bg-gradient-to-br from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary transition-all duration-300 hover:scale-105 active:scale-95 relative group chat-button-pulse border-2 border-primary/30"
            size="icon"
          >
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] sm:text-xs font-serif font-bold text-primary-foreground leading-none">E</span>
              <span className="text-[8px] sm:text-[10px] font-serif font-semibold text-primary-foreground/80 leading-none mt-0.5">OS</span>
            </div>
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5 bg-emerald-500 rounded-full border-2 border-background animate-pulse shadow-lg" />
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes chatboxOpen3D {
          0% {
            transform: perspective(1000px) rotateY(-90deg) rotateX(20deg) scale(0.3);
            opacity: 0;
            transform-origin: bottom right;
          }
          50% {
            transform: perspective(1000px) rotateY(10deg) rotateX(-5deg) scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1);
            opacity: 1;
          }
        }
        @keyframes chatboxClose3D {
          0% {
            transform: perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1);
            opacity: 1;
            transform-origin: bottom right;
          }
          50% {
            transform: perspective(1000px) rotateY(10deg) rotateX(-5deg) scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: perspective(1000px) rotateY(-90deg) rotateX(20deg) scale(0.3);
            opacity: 0;
          }
        }
        .chatbox-open-3d {
          animation: chatboxOpen3D 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .chatbox-close-3d {
          animation: chatboxClose3D 0.5s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards;
        }
        @keyframes slideInRight {
          from {
            transform: translateX(1rem);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideInLeft {
          from {
            transform: translateX(-1rem);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .chat-message-user-enter {
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .chat-message-assistant-enter {
          animation: slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
      <Card
        ref={cardRef}
        className={cn(
          'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-full sm:max-w-sm shadow-2xl border-2 border-primary/30 z-50 flex flex-col overflow-hidden bg-card/98 backdrop-blur-md',
          isMinimized ? 'h-14 sm:h-16' : 'h-[calc(100vh-8rem)] sm:h-[500px] max-h-[600px]',
          isKeyboardOpen && !isMinimized && 'h-[calc(100vh-12rem)] sm:h-[500px]',
          isOpening && 'chatbox-open-3d',
          isClosing && 'chatbox-close-3d'
        )}
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          ...(isKeyboardOpen && keyboardOffset > 0 && {
            bottom: `${keyboardOffset + 16}px`,
          }),
        }}
      >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 sm:px-4 py-2.5 sm:py-3 border-b-2 border-primary/10 bg-gradient-to-r from-primary/5 via-background to-background backdrop-blur-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 p-2 sm:p-2.5 ring-2 ring-primary/30 shadow-lg border border-primary/20">
              <div className="flex flex-col items-center justify-center">
                <span className="text-[10px] sm:text-xs font-serif font-bold text-primary leading-none">E</span>
                <span className="text-[8px] sm:text-[10px] font-serif font-semibold text-primary/80 leading-none mt-0.5">OS</span>
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 sm:h-2.5 sm:w-2.5 bg-emerald-500 rounded-full border-2 border-background animate-pulse shadow-md" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm sm:text-base font-bold truncate bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Agent IA</CardTitle>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate font-medium">ELYNDRA · TRAJECTORY OS</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-muted/80 transition-colors"
            onClick={() => setShowHistory(!showHistory)}
            title="Historique"
          >
            <History className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-muted/80 transition-colors"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={handleClose}
          >
            <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          {showHistory && (
            <div className="absolute inset-y-0 left-0 w-full sm:w-80 bg-background border-r-2 border-primary/10 z-50 shadow-2xl flex flex-col">
              <div className="p-4 border-b-2 border-primary/10 bg-gradient-to-r from-primary/5 to-background">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Historique
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowHistory(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={handleNewConversation}
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle conversation
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {conversations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Aucune conversation</p>
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.id}
                        className={cn(
                          'w-full rounded-lg transition-all border-2 group',
                          currentConversationId === conv.id
                            ? 'bg-primary/10 border-primary/30 shadow-md'
                            : 'bg-background border-transparent hover:border-primary/10'
                        )}
                      >
                        <button
                          onClick={() => handleSelectConversation(conv.id)}
                          className="w-full text-left p-3"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-xs font-medium text-foreground line-clamp-2 flex-1">
                              {conv.preview}
                            </p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {conv.message_count > 0 && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {conv.message_count}
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                onClick={(e) => handleDeleteConversation(conv.id, e)}
                                title="Supprimer"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(conv.updated_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-background">
            <ScrollArea ref={scrollAreaRef} className="flex-1 px-1">
              <div className="px-3 sm:px-4 py-4 sm:py-5 space-y-3 sm:space-y-4">
                {messages
                  .filter((msg) => msg.role !== 'system')
                  .map((message, index) => {
                    const isAnimating = animatingMessages.has(index);
                    const hasActions = executedActions.length > 0 && index === messages.filter(m => m.role !== 'system').length - 1;
                    return (
                      <div
                        key={index}
                        className={cn(
                          'flex gap-2 sm:gap-2.5 items-end group',
                          message.role === 'user' ? 'justify-end' : 'justify-start',
                          isAnimating && message.role === 'user' && 'chat-message-user-enter',
                          isAnimating && message.role === 'assistant' && 'chat-message-assistant-enter'
                        )}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20 mb-0.5 shadow-sm">
                            <div className="flex flex-col items-center justify-center">
                              <span className="text-[8px] sm:text-[10px] font-serif font-bold text-primary leading-none">E</span>
                              <span className="text-[6px] sm:text-[8px] font-serif font-semibold text-primary/70 leading-none mt-0.5">OS</span>
                            </div>
                          </div>
                        )}
                        <div
                          className={cn(
                            'rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 max-w-[80%] sm:max-w-[85%]',
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg rounded-br-md border border-primary/20'
                              : 'bg-gradient-to-br from-muted to-muted/80 text-foreground border-2 border-border/60 shadow-md rounded-bl-md'
                          )}
                        >
                          {hasActions && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {executedActions.map((action, idx) => (
                                <Badge key={idx} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                                  <Sparkles className="w-2.5 h-2.5 mr-1" />
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words">
                            {message.role === 'assistant' ? (
                              <MessageContent content={message.content} />
                            ) : (
                              <p>{message.content}</p>
                            )}
                          </div>
                        </div>
                        {message.role === 'user' && (
                          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mb-0.5">
                            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                {loading && (
                  <div className="flex gap-2 sm:gap-2.5 justify-start items-end chat-message-assistant-enter">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20 mb-0.5 shadow-sm">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-[8px] sm:text-[10px] font-serif font-bold text-primary leading-none animate-pulse">E</span>
                        <span className="text-[6px] sm:text-[8px] font-serif font-semibold text-primary/70 leading-none mt-0.5">OS</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-muted to-muted/80 border-2 border-border/60 rounded-2xl rounded-bl-md px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm">
                      <div className="flex gap-1 items-center">
                        <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            </ScrollArea>
            <div className="border-t-2 border-primary/10 bg-gradient-to-r from-background via-background to-primary/5 backdrop-blur-sm p-3 sm:p-3.5">
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                      }, 100);
                    }}
                    onKeyPress={handleKeyPress}
                    onFocus={() => {
                      setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
                        if (scrollAreaRef.current) {
                          const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
                          if (scrollContainer) {
                            scrollContainer.scrollTo({
                              top: scrollContainer.scrollHeight,
                              behavior: 'smooth'
                            });
                          }
                        }
                      }, 400);
                    }}
                    placeholder="Écrivez un message..."
                    disabled={loading || !user}
                    className="pr-10 border-2 border-border focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-base bg-background/90 h-10 sm:h-11"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <Button 
                  onClick={handleSend} 
                  disabled={loading || !input.trim() || !user} 
                  size="icon"
                  className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </>
      )}
      </Card>
    </>
  );
};
