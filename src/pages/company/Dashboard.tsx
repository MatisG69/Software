import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Users, MessageSquare, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { getCompanyJobOffers, getCompanyApplications } from '@/lib/supabase';

export const CompanyDashboard = () => {
  const { company } = useAuth();
  const [stats, setStats] = useState({
    activeJobs: 0,
    applications: 0,
    interviews: 0,
    newMessages: 0,
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!company?.id) return;
      setLoading(true);
      try {
        // Charger les offres
        const jobs = await getCompanyJobOffers(company.id);
        
        // Charger les candidatures
        const applications = await getCompanyApplications(company.id);
        
        // Calculer les statistiques
        setStats({
          activeJobs: jobs.length,
          applications: applications.length,
          interviews: applications.filter((app) => app.status === 'reviewed' || app.status === 'accepted').length,
          newMessages: 0, // TODO: implémenter avec les messages
        });

        // Prendre les 3 candidatures les plus récentes
        setRecentApplications(applications.slice(0, 3));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [company?.id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl sm:text-3xl">
              Bienvenue, {company?.name}
            </CardTitle>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Gérez vos offres d'emploi et vos candidatures
            </p>
          </div>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/company/jobs/new">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Nouvelle offre
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Offres actives</CardTitle>
              <Briefcase className="h-8 w-8 sm:h-12 sm:w-12 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.activeJobs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Candidatures</CardTitle>
              <Users className="h-8 w-8 sm:h-12 sm:w-12 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.applications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Entretiens</CardTitle>
              <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.interviews}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Nouveaux messages</CardTitle>
              <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.newMessages}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-xl sm:text-2xl">Candidatures récentes</CardTitle>
            <Button variant="ghost" asChild className="w-full sm:w-auto">
              <Link to="/company/applications">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm sm:text-base">Aucune candidature pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {recentApplications.map((application) => (
                  <Button
                    key={application.id}
                    variant="ghost"
                    asChild
                    className="w-full justify-between h-auto p-3 sm:p-4"
                  >
                    <Link to={`/company/applications`} className="flex w-full flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1 text-left w-full">
                        <h3 className="font-bold text-base sm:text-lg text-foreground break-words">{application.jobOffer?.title}</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                          Candidature reçue le{' '}
                          {new Date(application.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                        <Badge
                          variant={application.status === 'pending' ? 'outline' : 'default'}
                          className="mt-2 text-xs"
                        >
                          {application.status === 'pending' ? 'En attente' : 
                           application.status === 'reviewed' ? 'Examinée' :
                           application.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                        </Badge>
                      </div>
                    </Link>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
