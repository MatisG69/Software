import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { Send, MessageSquare, X, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '../../context/AuthContext';
import { getMessages, createMessage, markMessageAsRead, getApplicationById, getCompanyApplications } from '@/lib/supabase';
import { useSearchParams } from 'react-router-dom';

export const CompanyMessages = () => {
  const { company } = useAuth();
  const [searchParams] = useSearchParams();
  const applicationIdParam = searchParams.get('application');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(applicationIdParam || null);
  const [messageText, setMessageText] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadConversations = async () => {
      if (!company?.id) return;
      setLoading(true);
      try {
        // Récupérer les applications de l'entreprise pour construire les conversations
        const companyApplications = await getCompanyApplications(company.id);
        const convs = companyApplications.map(app => ({
          id: app.id,
          jobTitle: app.jobOffer?.title,
          candidateId: app.candidateId,
          lastMessage: 'No messages yet',
          unread: 0,
          updatedAt: app.createdAt,
        }));
        setConversations(convs);
        if (convs.length > 0 && !selectedConversation) {
          setSelectedConversation(convs[0].id);
        } else if (applicationIdParam && !convs.find(c => c.id === applicationIdParam)) {
          // Si applicationIdParam est fourni mais pas dans la liste, on l'ajoute
          setSelectedConversation(applicationIdParam);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [company?.id, selectedConversation, applicationIdParam]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedConversation) {
        setMessages([]);
        return;
      }

      try {
        const msgs = await getMessages(selectedConversation);
        setMessages(msgs);

        // Marquer les messages non lus comme lus
        if (company?.id) {
          msgs.forEach((msg) => {
            if (!msg.read && msg.receiverId === company.id) {
              markMessageAsRead(msg.id);
            }
          });
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      }
    };

    loadMessages();
  }, [selectedConversation, company?.id]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !company?.id) return;

    setSending(true);
    try {
      // Récupérer l'application pour trouver le receiverId (candidateId)
      const application = await getApplicationById(selectedConversation);
      if (!application || !application.candidateId) {
        alert('Erreur: impossible de trouver le candidat');
        return;
      }

      const newMessage = await createMessage(
        selectedConversation,
        company.id,
        application.candidateId,
        messageText
      );

      if (newMessage) {
        setMessageText('');
        // Recharger les messages
        const msgs = await getMessages(selectedConversation);
        setMessages(msgs);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des conversations...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const [showConversations, setShowConversations] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (window.innerWidth >= 768) {
        setShowConversations(true);
      } else {
        // Sur mobile, afficher la liste si aucune conversation n'est sélectionnée
        setShowConversations(!selectedConversation);
      }
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, [selectedConversation]);

  // Sur mobile, afficher la liste si aucune conversation n'est sélectionnée
  useEffect(() => {
    if (isMobile && !selectedConversation && conversations.length > 0) {
      setShowConversations(true);
    }
  }, [selectedConversation, conversations.length, isMobile]);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-180px)] sm:min-h-[calc(100vh-200px)] gap-4">
        {/* Conversations List */}
        <Card className={`${showConversations ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 lg:w-1/4 flex-col max-h-[calc(100vh-200px)] md:max-h-none`}>
          <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl md:text-2xl">Messages</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConversations(false)}
              className="md:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune conversation</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => {
                    setSelectedConversation(conversation.id);
                    if (isMobile) {
                      setShowConversations(false);
                    }
                  }}
                  className={`w-full p-3 sm:p-4 text-left hover:bg-muted transition border-b border-border ${
                    selectedConversation === conversation.id ? 'bg-accent/50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-semibold text-foreground text-sm sm:text-base break-words flex-1">{conversation.jobTitle}</h3>
                    {conversation.unread > 0 && (
                      <Badge variant="destructive" className="ml-2 flex-shrink-0 text-xs">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 line-clamp-1">{conversation.company}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{conversation.lastMessage}</p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className={`flex-1 flex flex-col min-h-0 ${!selectedConv && isMobile ? 'hidden' : ''}`}>
          {selectedConv ? (
            <>
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4 p-4 sm:p-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConversations(true)}
                      className="md:hidden -ml-2 flex-shrink-0"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <CardTitle className="text-base sm:text-lg md:text-xl break-words">{selectedConv.jobTitle}</CardTitle>
                  </div>
                  <CardDescription className="text-xs sm:text-sm break-words">{selectedConv.company}</CardDescription>
                  <CardDescription className="text-xs mt-2">
                    💬 Communication anonyme - L'identité du candidat reste protégée
                  </CardDescription>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucun message dans cette conversation</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === company?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <Card
                        className={`max-w-[85%] sm:max-w-[70%] ${
                          message.senderId === company?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card'
                        }`}
                      >
                        <CardContent className="p-3 sm:p-4">
                          <p className="text-xs sm:text-sm break-words">{message.content}</p>
                          <p
                            className={`text-xs mt-2 ${
                              message.senderId === company?.id
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleString('fr-FR')}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ))
                )}
              </CardContent>
              <Separator />
              <CardContent className="p-3 sm:p-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
                    placeholder="Tapez votre message..."
                    disabled={sending}
                    className="text-sm sm:text-base"
                  />
                  <Button onClick={handleSendMessage} size="icon" disabled={sending || !messageText.trim()} className="flex-shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-sm sm:text-base mb-4">Sélectionnez une conversation</p>
                {conversations.length === 0 && (
                  <p className="text-xs sm:text-sm text-muted-foreground">Aucune conversation disponible</p>
                )}
                {isMobile && conversations.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setShowConversations(true)}
                    className="mt-4"
                  >
                    Voir les conversations
                  </Button>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </Layout>
  );
};

