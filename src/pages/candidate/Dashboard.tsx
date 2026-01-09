import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Search, CheckCircle, Shield, Lock, Users } from 'lucide-react';
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
      <div className="space-y-8 min-h-screen bg-gradient-to-b from-background via-background to-muted/20 pb-12">
        {/* Header amélioré */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4 sm:p-6 md:p-8 mb-6 md:mb-8">
          {/* Effets de fond */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                Bienvenue{candidate?.firstName ? `, ${candidate.firstName}` : ''}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                Retrouvez vos opportunités et suivez vos candidatures
              </p>
            </div>
            {candidate?.certified && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 hover:border-primary/50 hover:bg-primary/20 transition-all duration-300 shadow-md hover:shadow-lg rounded-xl"
              >
                <Lock className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">Profil certifié</span>
              </Button>
            )}
          </div>
        </div>

        {/* Stats - Design amélioré */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
              <CardTitle className="text-base font-semibold text-foreground">Candidatures</CardTitle>
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                <Briefcase className="h-7 w-7 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-10 w-20 bg-muted rounded"></div>
                </div>
              ) : (
                <div className="text-4xl font-bold text-foreground mb-1">{stats.applications}</div>
              )}
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-2 border-border hover:border-green-500/50 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
              <CardTitle className="text-base font-semibold text-foreground">Entretiens</CardTitle>
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors duration-300">
                <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-10 w-20 bg-muted rounded"></div>
                </div>
              ) : (
                <div className="text-4xl font-bold text-foreground mb-1">{stats.interviews}</div>
              )}
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-2 border-border hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6">
              <CardTitle className="text-base font-semibold text-foreground">Correspondances</CardTitle>
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors duration-300">
                <Users className="h-7 w-7 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-10 w-20 bg-muted rounded"></div>
                </div>
              ) : (
                <div className="text-4xl font-bold text-foreground mb-1">{stats.matches}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Design amélioré */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-primary rounded-full"></div>
            <h2 className="text-2xl font-bold text-foreground">Actions rapides</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Link to="/candidate/jobs" className="block group">
              <Card className="relative overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl cursor-pointer h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-8 relative">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 mb-2">
                      <Search className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        Rechercher un emploi
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Trouvez des offres adaptées
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/candidate/applications" className="block group">
              <Card className="relative overflow-hidden border-2 border-border hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl cursor-pointer h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardContent className="p-8 relative">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300 mb-2">
                      <Briefcase className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        Mes candidatures
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Suivez vos postulations
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            {!candidate?.certified && (
              <Link to="/candidate/verification" className="block group md:col-span-1">
                <Card className="relative overflow-hidden border-2 border-yellow-300 dark:border-yellow-700 hover:border-yellow-400 dark:hover:border-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl rounded-xl cursor-pointer bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/30 dark:to-yellow-900/20 h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-8 relative">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-100 dark:bg-yellow-900/50 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/70 transition-colors duration-300 mb-2">
                        <Shield className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xl font-bold text-foreground group-hover:text-yellow-700 dark:group-hover:text-yellow-300 transition-colors duration-300">
                          Certifier mon profil
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Vérifiez votre identité
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
