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
      <div className="space-y-6">
        <CardTitle className="text-3xl">Candidatures</CardTitle>

        <Alert>
          <AlertDescription>
            🔒 <strong>Anonymat des candidats :</strong> Les informations personnelles des candidats
            sont masquées. Vous ne voyez que leurs compétences, expérience et formation pour un
            recrutement équitable.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Liste des candidatures</TabsTrigger>
            <TabsTrigger value="ranking" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Classement Decision DNA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
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
                  <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune candidature pour le moment</p>
                </CardContent>
              </Card>
            ) : (
              applications.map((application) => (
                <Card key={application.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <CardTitle className="text-xl">{application.jobOffer?.title}</CardTitle>
                          <Badge variant={getStatusVariant(application.status)} className="flex items-center gap-2">
                            {getStatusIcon(application.status)}
                            {getStatusLabel(application.status)}
                          </Badge>
                          {application.candidate?.certified && (
                            <Badge variant="default" className="bg-green-100 text-green-700">
                              ✓ Certifié
                            </Badge>
                          )}
                          {application.decisionDNA?.compatibilityScore !== undefined && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              Compatibilité: {formatCompatibilityScore(application.decisionDNA.compatibilityScore)}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mb-4">
                          Candidature reçue le{' '}
                          {new Date(application.createdAt).toLocaleDateString('fr-FR')}
                        </CardDescription>

                        {/* Candidate Info (Anonymized) */}
                        {application.candidate && (
                          <Card className="bg-muted mb-4">
                            <CardContent className="pt-6">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <CardDescription className="text-sm font-semibold mb-2">Expérience</CardDescription>
                                  <p className="text-foreground">{application.candidate.experience} ans</p>
                                </div>
                                <div>
                                  <CardDescription className="text-sm font-semibold mb-2">Formation</CardDescription>
                                  <p className="text-foreground">{application.candidate.education}</p>
                                </div>
                                <div className="md:col-span-2">
                                  <CardDescription className="text-sm font-semibold mb-2">Compétences</CardDescription>
                                  <div className="flex flex-wrap gap-2">
                                    {application.skills && application.skills.length > 0 ? (
                                      application.skills.map((skill: string, idx: number) => (
                                        <Badge key={idx} variant="secondary">
                                          {skill}
                                        </Badge>
                                      ))
                                    ) : (
                                      <p className="text-sm text-muted-foreground">Aucune compétence spécifiée</p>
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
                    <div className="flex justify-end gap-2 flex-wrap">
                      <Button
                        variant={application.status === 'pending' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(application.id, 'pending')}
                      >
                        En attente
                      </Button>
                      <Button
                        variant={application.status === 'reviewed' ? 'default' : 'outline'}
                        onClick={() => handleStatusChange(application.id, 'reviewed')}
                      >
                        Entretien
                      </Button>
                      <Button
                        variant={application.status === 'rejected' ? 'destructive' : 'outline'}
                        onClick={() => handleStatusChange(application.id, 'rejected')}
                      >
                        Refuser
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to={`/company/messages?application=${application.id}`} className="flex items-center gap-2">
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Award className="w-6 h-6 text-primary" />
                        <CardTitle className="text-2xl">{job.jobTitle}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-sm">
                        {job.applications.length} candidat{job.applications.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">
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
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1">
                                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                      <Badge variant={getStatusVariant(application.status)} className="flex items-center gap-2">
                                        {getStatusIcon(application.status)}
                                        {getStatusLabel(application.status)}
                                      </Badge>
                                      {application.candidate?.certified && (
                                        <Badge variant="default" className="bg-green-100 text-green-700">
                                          ✓ Certifié
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Candidate Info (Anonymized) */}
                                    {application.candidate && (
                                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                          <p className="text-sm text-muted-foreground mb-1">Expérience</p>
                                          <p className="font-medium">{application.candidate.experience} ans</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground mb-1">Formation</p>
                                          <p className="font-medium">{application.candidate.education}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-muted-foreground mb-1">Compétences</p>
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
                                        <span className="text-sm font-semibold">Score de compatibilité</span>
                                        <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                                          {formatCompatibilityScore(score)}
                                        </span>
                                      </div>
                                      <Progress value={score * 100} className="h-2" />
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-2 min-w-[200px]">
                                  <Button
                                    variant={application.status === 'reviewed' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handleStatusChange(application.id, 'reviewed')}
                                    className="w-full"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Entretien
                                  </Button>
                                  <Button
                                    variant={application.status === 'rejected' ? 'destructive' : 'outline'}
                                    size="sm"
                                    onClick={() => handleStatusChange(application.id, 'rejected')}
                                    className="w-full"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Refuser
                                  </Button>
                                  <Button variant="outline" size="sm" asChild className="w-full">
                                    <Link to={`/company/messages?application=${application.id}`}>
                                      <MessageSquare className="w-4 h-4 mr-2" />
                                      Messages
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
