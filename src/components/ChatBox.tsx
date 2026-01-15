import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, X, User, Minimize2, Sparkles } from 'lucide-react';
import { sendMessageWithTools, ChatMessage } from '@/lib/groq';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { createAgentContext, getAgentContext } from '@/lib/chatbox/agentContext';
import { agentTools, getToolByName, toolsToGroqFormat } from '@/lib/chatbox/agentTools';
import { indexAllUserData, indexAllJobOffers } from '@/lib/chatbox/ragIndexer';
import { searchRAGDocuments, formatRAGContext } from '@/lib/chatbox/ragSearch';
import { 
  getConversationHistory, 
  saveMessage, 
  getUserPreferences,
  detectSearchPattern,
  detectApplicationPattern,
  getConversationId,
} from '@/lib/chatbox/agentMemory';
import { getDataAccessSummary } from '@/lib/chatbox/userDataService';
import { RAGDocument } from '@/lib/chatbox/types';

// Nouveau prompt système explicite et honnête
const getSystemPrompt = (dataAccess: any, preferences: any[]): string => {
  return `Tu es un agent IA opérationnel de ELYNDRA · TRAJECTORY OS.

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
2. Exemples d'utilisation des tools :
   - "Y a-t-il des offres en développement ?" → Utilise searchJobOffers avec category="Développement"
   - "Montre-moi mes candidatures" → Utilise getUserApplications
   - "Quelles sont mes offres favorites ?" → Utilise getFavoriteJobs
3. Accède aux données via RAG pour répondre avec précision
4. Sois explicite : dis "Je vais rechercher..." puis exécute réellement la tool
5. Ne promets jamais ce que tu ne peux pas faire
6. Utilise les préférences apprises pour personnaliser les suggestions
7. Fournis toujours des données réelles, pas des exemples fictifs
8. Réponds toujours en français
9. Sois concis, professionnel, et amical`;

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

      // Indexer les données pour RAG
      loadRAGData();

      // Initialiser le message système
      initializeSystemMessage();
    }
  }, [user, candidate, company]);

  const loadConversationHistory = async () => {
    if (!user) return;
    const context = getAgentContext();
    if (!context) return;

    try {
      const history = await getConversationHistory(context, 10);
      if (history.length > 0) {
        setMessages(prev => {
          const systemMsg = prev.find(m => m.role === 'system');
          return systemMsg ? [systemMsg, ...history] : history;
        });
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
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

      // Appeler Groq avec function calling
      const tools = toolsToGroqFormat();
      let response;
      let toolCalls: any[] = [];
      const executedToolNames: string[] = []; // Déclarer avant le bloc if

      try {
        response = await sendMessageWithTools(messagesWithContext, tools);
        toolCalls = response.tool_calls || [];
      } catch (error: any) {
        // Si function calling échoue, essayer sans tools
        console.warn('Function calling failed, trying without tools:', error);
        try {
          const { sendMessageToGroq } = await import('@/lib/groq');
          const fallbackResponse = await sendMessageToGroq(messagesWithContext);
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
                tool_call_id: toolCall.id,
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
                tool_call_id: toolCall.id,
              });
            }
          }
        }

        setExecutedActions(executedToolNames);

        // Envoyer les résultats des tools à l'IA pour générer la réponse finale
        const messagesWithToolResults = [
          ...messagesWithContext,
          ...toolResults.map(tr => ({
            ...tr,
            role: 'tool' as const,
          })),
        ];

        try {
          const finalResponse = await sendMessageWithTools(messagesWithToolResults, tools);
          assistantContent = finalResponse.content || 'Action exécutée avec succès.';
        } catch (error: any) {
          // Si la réponse finale échoue, utiliser un message simple
          console.warn('Error getting final response:', error);
          assistantContent = `J'ai exécuté ${executedToolNames.length} action(s) : ${executedToolNames.join(', ')}. Les résultats sont disponibles.`;
        }
      }

      const assistantMessageIndex = newMessages.filter((msg) => msg.role !== 'system').length;
      setMessages([...newMessages, { role: 'assistant', content: assistantContent }]);

      // Sauvegarder les messages (la conversation sera créée automatiquement)
      try {
        const conversationId = await getConversationId(context);
        if (conversationId) {
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
                          <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words">
                            {message.content}
                          </p>
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
