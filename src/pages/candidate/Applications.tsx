import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
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
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'reviewed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
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

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Mes candidatures</h1>

        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement des candidatures...</p>
              </CardContent>
            </Card>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Aucune candidature pour le moment</p>
                <Button asChild>
                  <Link to="/candidate/jobs">Rechercher des emplois</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <CardTitle className="text-xl">{application.jobOffer?.title}</CardTitle>
                        <Badge variant={getStatusVariant(application.status)} className="flex items-center gap-2">
                          {getStatusIcon(application.status)}
                          {getStatusLabel(application.status)}
                        </Badge>
                      </div>
                      {application.jobOffer && (
                        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                          <span className="font-semibold">{application.jobOffer.company}</span>
                          <span>{application.jobOffer.location}</span>
                          <span>{application.jobOffer.type}</span>
                        </div>
                      )}
                      <CardDescription>
                        Candidature envoyée le{' '}
                        {new Date(application.createdAt).toLocaleDateString('fr-FR')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <Link to={`/candidate/jobs/${application.jobOfferId}`}>Voir l'offre</Link>
                    </Button>
                    {application.status !== 'rejected' && (
                      <Button asChild>
                        <Link to={`/candidate/messages?application=${application.id}`} className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>Messages</span>
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
