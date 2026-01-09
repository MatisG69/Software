import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, MessageSquare, MapPin, Briefcase, Building2, Calendar, ExternalLink, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../context/AuthContext';
import { getCandidateApplications } from '@/lib/supabase';

export const CandidateApplications = () => {
  const { candidate } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      if (!candidate?.id) return;
      setLoading(true);
      try {
        const apps = await getCandidateApplications(candidate.id);
        setApplications(apps);
      } catch (error) {
        console.error('Error loading applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [candidate?.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'reviewed':
        return <CheckCircle className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Candidature envoyée';
      case 'reviewed':
        return 'Entretien';
      case 'accepted':
        return 'Accepté';
      case 'rejected':
        return 'Refusé';
      default:
        return status;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'reviewed':
        return 'default';
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'reviewed':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'accepted':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header amélioré */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Mes candidatures</h1>
          </div>
          <p className="text-muted-foreground">
            Suivez l'état de vos candidatures et restez en contact avec les entreprises
          </p>
        </div>

        {/* Statistiques rapides */}
        {!loading && applications.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-2">
              <CardContent className="pt-4 pb-4">
                <div className="text-2xl font-bold text-foreground">{applications.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-yellow-500/20">
              <CardContent className="pt-4 pb-4">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {applications.filter(a => a.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">En attente</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-blue-500/20">
              <CardContent className="pt-4 pb-4">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {applications.filter(a => a.status === 'reviewed').length}
                </div>
                <div className="text-sm text-muted-foreground">Entretiens</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-green-500/20">
              <CardContent className="pt-4 pb-4">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {applications.filter(a => a.status === 'accepted').length}
                </div>
                <div className="text-sm text-muted-foreground">Acceptées</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <Card className="border-2">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground font-medium">Chargement des candidatures...</p>
              </CardContent>
            </Card>
          ) : applications.length === 0 ? (
            <Card className="border-2">
              <CardContent className="pt-16 pb-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                  <FileText className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Aucune candidature pour le moment</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Commencez votre recherche d'emploi et postulez aux offres qui vous intéressent.
                </p>
                <Button asChild size="lg">
                  <Link to="/candidate/jobs" className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Rechercher des emplois
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            applications.map((application) => (
              <Card 
                key={application.id} 
                className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 group"
              >
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Titre et badge de statut */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 md:gap-4">
                        <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold group-hover:text-primary transition-colors break-words">
                          {application.jobOffer?.title}
                        </CardTitle>
                        <Badge 
                          variant={getStatusVariant(application.status)} 
                          className={`flex items-center gap-1.5 w-fit ${getStatusColor(application.status)} border`}
                        >
                          {getStatusIcon(application.status)}
                          {getStatusLabel(application.status)}
                        </Badge>
                      </div>

                      {/* Informations de l'offre */}
                      {application.jobOffer && (
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-foreground">{application.jobOffer.company}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{application.jobOffer.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Briefcase className="w-4 h-4 text-primary" />
                            <span>{application.jobOffer.type}</span>
                          </div>
                        </div>
                      )}

                      {/* Date de candidature */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Candidature envoyée le{' '}
                          <span className="font-medium text-foreground">
                            {new Date(application.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" asChild className="flex-1 sm:flex-initial group/btn">
                      <Link to={`/candidate/jobs/${application.jobOfferId}`} className="flex items-center justify-center gap-2">
                        <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        Voir l'offre
                      </Link>
                    </Button>
                    {application.status !== 'rejected' && (
                      <Button asChild className="flex-1 sm:flex-initial">
                        <Link to={`/candidate/messages?application=${application.id}`} className="flex items-center justify-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Messages
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};
