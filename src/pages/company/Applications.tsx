import { useEffect, useState, useMemo } from 'react';
import { Layout } from '../../components/Layout';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, MessageSquare, User, BarChart3, Award, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '../../context/AuthContext';
import { getCompanyApplications, updateApplicationStatus } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

export const CompanyApplications = () => {
  const { company } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      if (!company?.id) return;
      setLoading(true);
      try {
        const apps = await getCompanyApplications(company.id);
        console.log('Loaded applications:', apps);
        // Log pour déboguer les Decision DNA
        apps.forEach((app: any) => {
          if (app.decisionDNA) {
            console.log(`Application ${app.id} - Decision DNA:`, app.decisionDNA);
          }
        });
        setApplications(apps);
      } catch (error) {
        console.error('Error loading applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [company?.id]);

  const handleStatusChange = async (id: string, newStatus: 'pending' | 'reviewed' | 'accepted' | 'rejected') => {
    const success = await updateApplicationStatus(id, newStatus);
    if (success) {
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
    } else {
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  // Grouper les candidatures par offre d'emploi
  const applicationsByJob = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    applications.forEach((app) => {
      const jobId = app.jobOfferId || 'unknown';
      if (!grouped[jobId]) {
        grouped[jobId] = [];
      }
      grouped[jobId].push(app);
    });
    return grouped;
  }, [applications]);

  // Obtenir les offres avec Decision DNA activé
  const jobsWithDecisionDNA = useMemo(() => {
    return Object.entries(applicationsByJob)
      .filter(([_, apps]) => {
        const firstApp = apps[0];
        return firstApp?.jobOffer?.decisionDNAEnabled && firstApp?.jobOffer?.decisionDNAMode !== 'no_test';
      })
      .map(([jobId, apps]) => ({
        jobId,
        jobTitle: apps[0]?.jobOffer?.title || 'Offre inconnue',
        applications: apps
          .filter((app) => app.decisionDNA?.compatibilityScore !== undefined)
          .sort((a, b) => {
            const scoreA = a.decisionDNA?.compatibilityScore || 0;
            const scoreB = b.decisionDNA?.compatibilityScore || 0;
            return scoreB - scoreA; // Tri décroissant
          }),
      }))
      .filter((job) => job.applications.length > 0);
  }, [applicationsByJob]);

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
        return 'En attente';
      case 'reviewed':
        return 'Entretien';
      case 'accepted':
        return 'Acceptée';
      case 'rejected':
        return 'Refusée';
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

  const formatCompatibilityScore = (score: number | undefined): string => {
    if (score === undefined || score === null) return 'N/A';
    return `${Math.round(score * 100)}%`;
  };

  const getScoreColor = (score: number | undefined): string => {
    if (score === undefined || score === null) return 'text-muted-foreground';
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-blue-600';
    if (score >= 0.4) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <CardTitle className="text-2xl sm:text-3xl">Candidatures</CardTitle>

        <Alert>
          <AlertDescription>
            🔒 <strong>Anonymat des candidats :</strong> Les informations personnelles des candidats
            sont masquées. Vous ne voyez que leurs compétences, expérience et formation pour un
            recrutement équitable.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="text-xs sm:text-sm">Liste des candidatures</TabsTrigger>
            <TabsTrigger value="ranking" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Classement Decision DNA</span>
              <span className="sm:hidden">Classement</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6 space-y-4">
                      <Skeleton className="h-6 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : applications.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune candidature pour le moment</p>
                </CardContent>
              </Card>
            ) : (
              applications.map((application) => (
                <Card key={application.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                          <CardTitle className="text-lg sm:text-xl break-words">{application.jobOffer?.title}</CardTitle>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={getStatusVariant(application.status)} className="flex items-center gap-1 sm:gap-2 text-xs">
                            {getStatusIcon(application.status)}
                            {getStatusLabel(application.status)}
                          </Badge>
                          {application.candidate?.certified && (
                              <Badge variant="default" className="bg-green-100 text-green-700 text-xs">
                              ✓ Certifié
                            </Badge>
                          )}
                          {application.decisionDNA?.compatibilityScore !== undefined && (
                              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                              <Target className="w-3 h-3" />
                                <span className="hidden sm:inline">Compatibilité: {formatCompatibilityScore(application.decisionDNA.compatibilityScore)}</span>
                                <span className="sm:hidden">{formatCompatibilityScore(application.decisionDNA.compatibilityScore)}</span>
                            </Badge>
                          )}
                          </div>
                        </div>
                        <CardDescription className="mb-4 text-sm">
                          Candidature reçue le{' '}
                          {new Date(application.createdAt).toLocaleDateString('fr-FR')}
                        </CardDescription>

                        {/* Candidate Info (Anonymized) */}
                        {application.candidate && (
                          <Card className="bg-muted mb-4">
                            <CardContent className="pt-4 sm:pt-6">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <CardDescription className="text-xs sm:text-sm font-semibold mb-2">Expérience</CardDescription>
                                  <p className="text-foreground text-sm sm:text-base">{application.candidate.experience} ans</p>
                                </div>
                                <div>
                                  <CardDescription className="text-xs sm:text-sm font-semibold mb-2">Formation</CardDescription>
                                  <p className="text-foreground text-sm sm:text-base break-words">{application.candidate.education}</p>
                                </div>
                                <div className="sm:col-span-2">
                                  <CardDescription className="text-xs sm:text-sm font-semibold mb-2">Compétences</CardDescription>
                                  <div className="flex flex-wrap gap-2">
                                    {application.skills && application.skills.length > 0 ? (
                                      application.skills.map((skill: string, idx: number) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                          {skill}
                                        </Badge>
                                      ))
                                    ) : (
                                      <p className="text-xs sm:text-sm text-muted-foreground">Aucune compétence spécifiée</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                      <Button
                        variant={application.status === 'pending' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(application.id, 'pending')}
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        En attente
                      </Button>
                      <Button
                        variant={application.status === 'reviewed' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(application.id, 'reviewed')}
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        Entretien
                      </Button>
                      <Button
                        variant={application.status === 'rejected' ? 'destructive' : 'outline'}
                        onClick={() => handleStatusChange(application.id, 'rejected')}
                        size="sm"
                        className="w-full sm:w-auto"
                      >
                        Refuser
                      </Button>
                      <Button variant="outline" asChild size="sm" className="w-full sm:w-auto">
                        <Link to={`/company/messages?application=${application.id}`} className="flex items-center justify-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>Messages</span>
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="ranking" className="space-y-6">
            {loading ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Chargement du classement...</p>
                </CardContent>
              </Card>
            ) : jobsWithDecisionDNA.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">Aucun classement Decision DNA disponible</p>
                  <p className="text-sm text-muted-foreground">
                    Les classements apparaissent uniquement pour les offres avec Decision DNA activé et ayant reçu des candidatures avec test complété.
                  </p>
                </CardContent>
              </Card>
            ) : (
              jobsWithDecisionDNA.map((job) => (
                <Card key={job.jobId} className="border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Award className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                        <CardTitle className="text-lg sm:text-2xl break-words">{job.jobTitle}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs sm:text-sm w-fit">
                        {job.applications.length} candidat{job.applications.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2 text-xs sm:text-sm">
                      Classement basé sur la compatibilité Decision DNA avec le profil cible du poste
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {job.applications.map((application, index) => {
                        const score = application.decisionDNA?.compatibilityScore || 0;
                        return (
                          <Card
                            key={application.id}
                            className={`transition-all hover:shadow-md ${
                              index === 0 ? 'border-2 border-primary bg-primary/5' : 'border'
                            }`}
                          >
                            <CardContent className="pt-4 sm:pt-6">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary font-bold text-base sm:text-lg flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                                      <Badge variant={getStatusVariant(application.status)} className="flex items-center gap-1 sm:gap-2 text-xs">
                                        {getStatusIcon(application.status)}
                                        {getStatusLabel(application.status)}
                                      </Badge>
                                      {application.candidate?.certified && (
                                        <Badge variant="default" className="bg-green-100 text-green-700 text-xs">
                                          ✓ Certifié
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Candidate Info (Anonymized) */}
                                    {application.candidate && (
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                                        <div>
                                          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Expérience</p>
                                          <p className="font-medium text-sm sm:text-base">{application.candidate.experience} ans</p>
                                        </div>
                                        <div>
                                          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Formation</p>
                                          <p className="font-medium text-sm sm:text-base break-words">{application.candidate.education}</p>
                                        </div>
                                        <div>
                                          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Compétences</p>
                                          <div className="flex flex-wrap gap-1">
                                            {application.skills && application.skills.length > 0 ? (
                                              <>
                                                {application.skills.slice(0, 3).map((skill: string, idx: number) => (
                                                  <Badge key={idx} variant="secondary" className="text-xs">
                                                    {skill}
                                                  </Badge>
                                                ))}
                                                {application.skills.length > 3 && (
                                                  <Badge variant="secondary" className="text-xs">
                                                    +{application.skills.length - 3}
                                                  </Badge>
                                                )}
                                              </>
                                            ) : (
                                              <p className="text-xs text-muted-foreground">Aucune compétence spécifiée</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Decision DNA Score */}
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs sm:text-sm font-semibold">Score de compatibilité</span>
                                        <span className={`text-base sm:text-lg font-bold ${getScoreColor(score)}`}>
                                          {formatCompatibilityScore(score)}
                                        </span>
                                      </div>
                                      <Progress value={score * 100} className="h-2" />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-row sm:flex-col gap-2 sm:min-w-[200px]">
                                  <Button
                                    variant={application.status === 'reviewed' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleStatusChange(application.id, 'reviewed')}
                                    className="flex-1 sm:w-full"
                                  >
                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Entretien</span>
                                    <span className="sm:hidden">Entretien</span>
                                  </Button>
                                  <Button
                                    variant={application.status === 'rejected' ? 'destructive' : 'outline'}
                                    size="sm"
                                    onClick={() => handleStatusChange(application.id, 'rejected')}
                                    className="flex-1 sm:w-full"
                                  >
                                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Refuser</span>
                                    <span className="sm:hidden">Refuser</span>
                                  </Button>
                                  <Button variant="outline" size="sm" asChild className="flex-1 sm:w-full">
                                    <Link to={`/company/messages?application=${application.id}`} className="flex items-center justify-center">
                                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                      <span className="hidden sm:inline">Messages</span>
                                      <span className="sm:hidden">Msg</span>
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};
