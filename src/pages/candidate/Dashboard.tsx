import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Search, CheckCircle, Shield, Lock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { getCandidateStats } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export const CandidateDashboard = () => {
  const { candidate } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    matches: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

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
      <style>{`
        @keyframes pageTransition3D {
          0% {
            transform: perspective(1200px) rotateY(0deg) rotateX(0deg) scale(1);
            opacity: 1;
          }
          30% {
            transform: perspective(1200px) rotateY(-15deg) rotateX(8deg) scale(0.92);
            opacity: 0.9;
          }
          60% {
            transform: perspective(1200px) rotateY(15deg) rotateX(-8deg) scale(0.95);
            opacity: 0.7;
          }
          100% {
            transform: perspective(1200px) rotateY(0deg) rotateX(0deg) scale(0.85);
            opacity: 0;
          }
        }
        .page-transition-3d {
          animation: pageTransition3D 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transform-style: preserve-3d;
          transform-origin: center center;
          backface-visibility: hidden;
        }
      `}</style>
      <div className={cn("space-y-8 pb-12", isAnimating && "page-transition-3d")}>
        {/* Header */}
        <Card className="border-0 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Bienvenue{candidate?.firstName ? `, ${candidate.firstName}` : ''}
                </h1>
                <p className="text-muted-foreground text-lg">
                  Retrouvez vos opportunités et suivez vos candidatures
                </p>
              </div>
              {candidate?.certified && (
                <Badge variant="secondary" className="gap-2 px-4 py-2 text-sm w-fit">
                  <Lock className="w-4 h-4" />
                  Profil certifié
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="relative overflow-hidden border-2 transition-all hover:shadow-lg hover:border-primary/20 group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium">Candidatures</CardTitle>
              <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              {loading ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <div className="text-3xl font-bold">{stats.applications}</div>
              )}
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-2 transition-all hover:shadow-lg hover:border-green-500/20 group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium">Entretiens</CardTitle>
              <div className="rounded-lg bg-green-500/10 p-2 group-hover:bg-green-500/20 transition-colors">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              {loading ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <div className="text-3xl font-bold">{stats.interviews}</div>
              )}
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-2 transition-all hover:shadow-lg hover:border-purple-500/20 group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
              <CardTitle className="text-sm font-medium">Correspondances</CardTitle>
              <div className="rounded-lg bg-purple-500/10 p-2 group-hover:bg-purple-500/20 transition-colors">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              {loading ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <div className="text-3xl font-bold">{stats.matches}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Actions rapides</h2>
            <p className="text-sm text-muted-foreground mt-1">Accédez rapidement aux fonctionnalités principales</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card 
              className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-xl cursor-pointer"
              onClick={() => {
                if (!isAnimating) {
                  setIsAnimating(true);
                  setTimeout(() => {
                    navigate('/candidate/jobs');
                  }, 500);
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-4 group-hover:scale-110 transition-transform">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      Rechercher un emploi
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Trouvez des offres adaptées à votre profil
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
            
            <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-xl cursor-pointer">
              <Link to="/candidate/applications" className="block">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="relative">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-4 group-hover:scale-110 transition-transform">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        Mes candidatures
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Suivez l'état de vos postulations
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>
            
            {!candidate?.certified && (
              <Card className="group relative overflow-hidden border-2 border-amber-500/30 hover:border-amber-500/50 transition-all hover:shadow-xl cursor-pointer bg-gradient-to-br from-amber-500/5 to-transparent">
                <Link to="/candidate/verification" className="block">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="relative">
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-500/10 p-4 group-hover:scale-110 transition-transform">
                        <Shield className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <CardTitle className="text-lg group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          Certifier mon profil
                        </CardTitle>
                        <CardDescription className="text-sm">
                          Vérifiez votre identité et augmentez votre crédibilité
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Link>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
