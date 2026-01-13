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

    try {
      const response = await sendMessageToGroq(newMessages);
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Désolé, une erreur est survenue. Veuillez réessayer plus tard.',
        },
      ]);
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

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 bg-primary hover:bg-primary/90 transition-all hover:scale-110"
        size="icon"
      >
        <Bot className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
      </Button>
    );
  }

  return (
    <Card
      className={cn(
        'fixed bottom-6 right-6 w-full max-w-md shadow-2xl z-50 flex flex-col transition-all duration-300 border-2',
        isMinimized ? 'h-16' : 'h-[600px]'
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">Assistant IA</CardTitle>
            <p className="text-xs text-muted-foreground">ELYNDRA · TRAJECTORY OS</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-gradient-to-b from-background to-muted/20">
            <ScrollArea className="flex-1">
              <div className="px-4 py-4 space-y-4">
                {messages
                  .filter((msg) => msg.role !== 'system')
                  .map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex gap-3 items-start',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/20">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'rounded-xl px-4 py-3 max-w-[80%] shadow-sm',
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-card border border-border rounded-bl-sm'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                      {message.role === 'user' && (
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/20">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                      )}
                    </div>
                  ))}
                {loading && (
                  <div className="flex gap-3 justify-start items-start">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/20">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="bg-card border border-border rounded-xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1.5 items-center">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="border-t bg-background/95 backdrop-blur-sm p-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  disabled={loading}
                  className="flex-1 border-2 focus:border-primary"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={loading || !input.trim()} 
                  size="icon"
                  className="bg-primary hover:bg-primary/90 transition-all"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
};
