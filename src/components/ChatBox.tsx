import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X, Bot, User, Minimize2 } from 'lucide-react';
import { sendMessageToGroq, ChatMessage } from '@/lib/groq';
import { cn } from '@/lib/utils';

export const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: `Tu es l'assistant IA de ELYNDRA · TRAJECTORY OS, une plateforme de recrutement anonyme innovante.

CONTEXTE DE LA PLATEFORME :
- ELYNDRA · TRAJECTORY OS est une plateforme de recrutement qui garantit l'anonymat des candidats
- Les entreprises peuvent publier des offres d'emploi et recevoir des candidatures anonymes
- Les candidats peuvent rechercher des emplois, postuler de manière anonyme, et utiliser un système de "Decision DNA" pour évaluer leur compatibilité
- Le système inclut un système de vérification/certification des profils candidats
- Les candidats peuvent sauvegarder des offres en favoris et suivre leurs candidatures
- Il y a un système de messagerie entre candidats et entreprises
- La plateforme utilise des technologies modernes (React, TypeScript, Supabase, shadcn/ui)

TON RÔLE :
- Aide les utilisateurs (candidats et entreprises) à naviguer sur la plateforme
- Réponds aux questions sur les fonctionnalités (recherche d'emploi, candidatures, Decision DNA, vérification, messages, favoris)
- Guide les utilisateurs dans l'utilisation de la plateforme
- Sois concis, professionnel, et amical
- Réponds toujours en français`,
    },
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis l\'assistant IA de ELYNDRA · TRAJECTORY OS. Je peux vous aider avec la recherche d\'emploi, les candidatures, le système Decision DNA, la vérification de profil, et bien plus encore. Comment puis-je vous assister aujourd\'hui ?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [animatingMessages, setAnimatingMessages] = useState<Set<number>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Animation pour le message utilisateur
    const userMessageIndex = newMessages.filter((msg) => msg.role !== 'system').length - 1;
    setAnimatingMessages((prev) => new Set([...prev, userMessageIndex]));
    setTimeout(() => {
      setAnimatingMessages((prev) => {
        const next = new Set(prev);
        next.delete(userMessageIndex);
        return next;
      });
    }, 500);

    try {
      const response = await sendMessageToGroq(newMessages);
      const assistantMessageIndex = newMessages.filter((msg) => msg.role !== 'system').length;
      setMessages([...newMessages, { role: 'assistant', content: response }]);
      
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
    } finally {
      setLoading(false);
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
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleOpen}
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 active:scale-95 relative group chat-button-pulse"
            size="icon"
          >
            <Bot className="h-6 w-6 transition-transform group-hover:scale-110" />
            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
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
        className={cn(
          'fixed bottom-6 right-6 w-full max-w-sm shadow-xl border-2 border-primary/20 z-50 flex flex-col overflow-hidden bg-card/95 backdrop-blur-md',
          isMinimized ? 'h-16' : 'h-[480px] sm:h-[500px]',
          isOpening && 'chatbox-open-3d',
          isClosing && 'chatbox-close-3d'
        )}
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
        }}
      >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 py-3 border-b-2 border-primary/10 bg-gradient-to-r from-primary/5 via-background to-background backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-2.5 ring-2 ring-primary/30 shadow-lg">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-bold truncate bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Assistant IA</CardTitle>
            <p className="text-xs text-muted-foreground truncate font-medium">ELYNDRA · TRAJECTORY OS</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted/80 transition-colors"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={handleClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-background">
            <ScrollArea className="flex-1 px-1">
              <div className="px-4 py-5 space-y-4">
                {messages
                  .filter((msg) => msg.role !== 'system')
                  .map((message, index) => {
                    const isAnimating = animatingMessages.has(index);
                    return (
                      <div
                        key={index}
                        className={cn(
                          'flex gap-2.5 items-end group',
                          message.role === 'user' ? 'justify-end' : 'justify-start',
                          isAnimating && message.role === 'user' && 'chat-message-user-enter',
                          isAnimating && message.role === 'assistant' && 'chat-message-assistant-enter'
                        )}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border mb-0.5">
                            <Bot className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-2.5 max-w-[85%]',
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-lg rounded-br-md border border-primary/20'
                              : 'bg-gradient-to-br from-muted to-muted/80 text-foreground border-2 border-border/60 shadow-md rounded-bl-md'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">
                            {message.content}
                          </p>
                        </div>
                        {message.role === 'user' && (
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 mb-0.5">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                {loading && (
                  <div className="flex gap-2.5 justify-start items-end chat-message-assistant-enter">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border mb-0.5">
                      <Bot className="h-4 w-4 text-muted-foreground animate-pulse" />
                    </div>
                    <div className="bg-muted border border-border/50 rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm">
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
            <div className="border-t-2 border-primary/10 bg-gradient-to-r from-background via-background to-primary/5 backdrop-blur-sm p-3.5">
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Écrivez un message..."
                    disabled={loading}
                    className="pr-10 border-2 border-border focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-base bg-background/90"
                    style={{ fontSize: '16px' }}
                  />
                </div>
                <Button 
                  onClick={handleSend} 
                  disabled={loading || !input.trim()} 
                  size="icon"
                  className="h-9 w-9 shrink-0 bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
