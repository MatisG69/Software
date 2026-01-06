import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Search, CheckCircle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { getCandidateStats } from '@/lib/supabase';

export const CandidateDashboard = () => {
  const { candidate } = useAuth();
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    matches: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!candidate?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const candidateStats = await getCandidateStats(candidate.id);
        setStats({
          applications: candidateStats.totalApplications,
          interviews: candidateStats.interviews,
          matches: candidateStats.matches,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [candidate?.id]);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Bienvenue{candidate?.firstName ? `, ${candidate.firstName}` : ''}
            </h1>
            <p className="text-muted-foreground mt-2">
              Retrouvez vos opportunités et suivez vos candidatures
            </p>
          </div>
          {candidate?.certified && (
            <Badge variant="default" className="flex items-center gap-2 px-4 py-2 text-sm">
              <Shield className="w-4 h-4" />
              <span>Profil certifié</span>
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Candidatures</CardTitle>
              <Briefcase className="h-12 w-12 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-muted rounded"></div>
                </div>
              ) : (
                <div className="text-3xl font-bold text-foreground">{stats.applications}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Entretiens</CardTitle>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-muted rounded"></div>
                </div>
              ) : (
                <div className="text-3xl font-bold text-foreground">{stats.interviews}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Correspondances</CardTitle>
              <CheckCircle className="h-12 w-12 text-purple-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-16 bg-muted rounded"></div>
                </div>
              ) : (
                <div className="text-3xl font-bold text-foreground">{stats.matches}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" asChild className="h-auto flex-col items-start p-6">
                <Link to="/candidate/jobs" className="flex items-center gap-3">
                  <Search className="w-6 h-6 text-primary" />
                  <div className="text-left">
                    <p className="font-semibold">Rechercher un emploi</p>
                    <p className="text-sm text-muted-foreground">Trouvez des offres adaptées</p>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-auto flex-col items-start p-6">
                <Link to="/candidate/applications" className="flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-primary" />
                  <div className="text-left">
                    <p className="font-semibold">Mes candidatures</p>
                    <p className="text-sm text-muted-foreground">Suivez vos postulations</p>
                  </div>
                </Link>
              </Button>
              {!candidate?.certified && (
                <Button variant="outline" asChild className="h-auto flex-col items-start p-6 border-yellow-200 bg-yellow-50 hover:bg-yellow-100">
                  <Link to="/candidate/verification" className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-yellow-600" />
                    <div className="text-left">
                      <p className="font-semibold">Certifier mon profil</p>
                      <p className="text-sm text-muted-foreground">Vérifiez votre identité</p>
                    </div>
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
