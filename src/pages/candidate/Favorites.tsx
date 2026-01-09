import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { MapPin, Briefcase, DollarSign, Bookmark, Clock, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getFavoriteJobs, removeFavoriteJob, getFavoriteJobIds } from '@/lib/supabase';
import { JobOffer } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const Favorites = () => {
  const navigate = useNavigate();
  const { candidate } = useAuth();
  const [loading, setLoading] = useState(true);
  const [favoriteJobs, setFavoriteJobs] = useState<JobOffer[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const loadFavorites = async () => {
    if (!candidate?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const jobs = await getFavoriteJobs(candidate.id);
      setFavoriteJobs(jobs);
      const favoriteIds = await getFavoriteJobIds(candidate.id);
      setSavedJobs(favoriteIds);
      if (jobs.length > 0) {
        setSelectedJob(jobs[0]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavoriteJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [candidate?.id]);

  const toggleSaveJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!candidate?.id) {
      alert('Veuillez vous connecter pour gérer vos favoris');
      return;
    }

    const isCurrentlySaved = savedJobs.has(jobId);
    
    // Mise à jour optimiste
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (isCurrentlySaved) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });

    // Retirer de la liste si on retire le favori
    if (isCurrentlySaved) {
      setFavoriteJobs((prev) => prev.filter((job) => job.id !== jobId));
      if (selectedJob?.id === jobId) {
        const remainingJobs = favoriteJobs.filter((job) => job.id !== jobId);
        setSelectedJob(remainingJobs.length > 0 ? remainingJobs[0] : null);
      }
    }

    // Sauvegarder dans Supabase
    try {
      if (isCurrentlySaved) {
        await removeFavoriteJob(candidate.id, jobId);
      }
    } catch (error) {
      // Restaurer en cas d'erreur
      await loadFavorites();
      console.error('Error removing favorite:', error);
      alert('Erreur lors de la suppression du favori');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'Temps plein';
      case 'part-time':
        return 'Temps partiel';
      case 'contract':
        return 'Contrat';
      case 'internship':
        return 'Stage';
      default:
        return type;
    }
  };

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return null;
    const minStr = min?.toLocaleString('fr-FR') || '';
    const maxStr = max?.toLocaleString('fr-FR') || '';
    return `${minStr}${min && max ? ' - ' : ''}${maxStr} ${currency || 'EUR'}/an`;
  };

  return (
    <Layout>
      <div className="space-y-8 min-h-screen">
        {/* Header */}
        <div className="container mx-auto px-4 pt-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Mes Favoris</h1>
          </div>
          <p className="text-muted-foreground">
            Retrouvez toutes vos offres d'emploi sauvegardées
          </p>
        </div>

        {/* Contenu */}
        <div className="container mx-auto px-4 pb-12">
          {loading ? (
            <Card className="max-w-2xl mx-auto shadow-lg">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-lg font-semibold text-foreground mb-2">Chargement...</p>
                <p className="text-sm text-muted-foreground">Récupération de vos favoris</p>
              </CardContent>
            </Card>
          ) : favoriteJobs.length === 0 ? (
            <Card className="max-w-2xl mx-auto shadow-lg">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                  <Heart className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Aucun favori</h3>
                <p className="text-muted-foreground mb-6">
                  Vous n'avez pas encore sauvegardé d'offres d'emploi
                </p>
                <Button onClick={() => navigate('/candidate/jobs')}>
                  Rechercher des offres
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4 animate-in fade-in duration-500">
              {/* Liste des favoris - Colonne gauche */}
              <div className="lg:w-2/5 space-y-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      {favoriteJobs.length} favori{favoriteJobs.length > 1 ? 's' : ''}
                    </h2>
                  </div>
                </div>
                <div className="space-y-2">
                  {favoriteJobs.map((job, index) => {
                    return (
                      <Card
                        key={job.id}
                        className={`relative cursor-pointer transition-all duration-200 bg-card rounded-xl border-2 ${
                          selectedJob?.id === job.id 
                            ? 'border-primary shadow-lg bg-primary/5' 
                            : 'border-border hover:border-primary/50 shadow-md hover:shadow-lg'
                        }`}
                        onClick={() => setSelectedJob(job)}
                      >
                        <CardHeader className="pb-4 pt-5 px-6">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0 space-y-3">
                              {/* Titre de l'offre */}
                              <div>
                                <CardTitle className={`text-lg font-bold text-foreground line-clamp-2 mb-2 hover:text-primary transition-colors leading-tight ${
                                  selectedJob?.id === job.id ? 'text-primary' : ''
                                }`}>
                                  {job.title}
                                </CardTitle>
                              </div>
                              
                              {/* Entreprise */}
                              {job.company && (
                                <CardDescription className="text-base font-semibold text-foreground/90">
                                  {job.company.name}
                                </CardDescription>
                              )}
                              
                              {/* Location */}
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                <span>{job.location}</span>
                              </p>

                              {/* Badges d'informations clés */}
                              <div className="flex flex-wrap gap-2 pt-1">
                                {job.salary && (
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                                    <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                                    {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                                  </span>
                                )}
                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-foreground border border-border">
                                  <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                                  {getTypeLabel(job.type)}
                                </span>
                              </div>

                              {/* Date de publication */}
                              {job.createdAt && (
                                <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5 pt-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {new Date(job.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                            </div>
                            
                            {/* Bouton bookmark */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`flex-shrink-0 h-9 w-9 rounded-lg transition-colors ${
                                savedJobs.has(job.id)
                                  ? 'text-primary bg-primary/10 hover:bg-primary/20'
                                  : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                              }`}
                              onClick={(e) => toggleSaveJob(job.id, e)}
                            >
                              <Bookmark 
                                className={`w-4 h-4 ${
                                  savedJobs.has(job.id) ? 'fill-current' : ''
                                }`} 
                              />
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Détails de l'offre - Colonne droite */}
              <div className="lg:w-3/5">
                {selectedJob ? (
                  <Card className="sticky top-6 bg-card rounded-xl border-2 border-border shadow-lg">
                    <CardHeader className="pb-5 pt-6 px-6 border-b border-border">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-2xl font-bold text-foreground">
                              {selectedJob.title}
                            </CardTitle>
                          </div>
                          {selectedJob.company && (
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                              <CardDescription className="text-lg font-semibold text-foreground/90">
                                {selectedJob.company.name}
                              </CardDescription>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {selectedJob.location}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {selectedJob.salary && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-muted text-foreground border border-border">
                                <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                                {formatSalary(selectedJob.salary.min, selectedJob.salary.max, selectedJob.salary.currency)}
                              </span>
                            )}
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-foreground border border-border">
                              <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                              {getTypeLabel(selectedJob.type)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`flex-shrink-0 h-10 w-10 rounded-lg transition-colors ${
                            savedJobs.has(selectedJob.id)
                              ? 'text-primary bg-primary/10 hover:bg-primary/20'
                              : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                          }`}
                          onClick={(e) => toggleSaveJob(selectedJob.id, e)}
                        >
                          <Bookmark 
                            className={`w-5 h-5 ${
                              savedJobs.has(selectedJob.id) ? 'fill-current' : ''
                            }`} 
                          />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6 px-6 max-h-[calc(100vh-350px)] overflow-y-auto custom-scrollbar">
                      {/* Détails de l'emploi */}
                      <div className="space-y-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                          <h3 className="text-xl font-bold text-foreground">Informations clés</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          {selectedJob.salary && (
                            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl border-2 border-border">
                              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted flex-shrink-0">
                                <DollarSign className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-foreground mb-1">Salaire</p>
                                <p className="text-sm font-semibold text-foreground">
                                  {formatSalary(selectedJob.salary.min, selectedJob.salary.max, selectedJob.salary.currency)}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl border-2 border-border">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted flex-shrink-0">
                              <Briefcase className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground mb-1">Type de poste</p>
                              <p className="text-sm font-semibold text-foreground">
                                {getTypeLabel(selectedJob.type)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl border-2 border-border">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted flex-shrink-0">
                              <MapPin className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground mb-1">Lieu de l'emploi</p>
                              <p className="text-sm font-semibold text-foreground">
                                {selectedJob.location}
                              </p>
                            </div>
                          </div>
                          {selectedJob.benefits && (
                            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl border-2 border-border">
                              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted flex-shrink-0">
                                <Clock className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-foreground mb-1">Avantages</p>
                                <p className="text-sm font-medium text-foreground line-clamp-2">
                                  {selectedJob.benefits}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sections de contenu */}
                      {[
                        { title: 'Description du poste', content: selectedJob.description },
                        { title: 'Qui sommes-nous', content: selectedJob.whoWeAre },
                        { title: 'Vos missions', content: selectedJob.missions },
                        { title: 'Ce que vous allez vivre chez nous', content: selectedJob.whatYouWillLive },
                        { title: 'Ce que nous allons aimer chez vous', content: selectedJob.whatWeWillLove },
                        { title: 'Expériences attendues', content: selectedJob.expectedExperience },
                        { title: 'Autres informations', content: selectedJob.otherInformation },
                      ].map((section, idx) => 
                        section.content ? (
                          <div key={idx} className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                              <h3 className="text-lg font-bold text-foreground">{section.title}</h3>
                            </div>
                            <div className="bg-muted/50 rounded-xl border-2 border-border p-5">
                              <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                                {section.content}
                              </p>
                            </div>
                          </div>
                        ) : null
                      )}

                      {/* Compétences requises */}
                      {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h3 className="text-lg font-bold text-foreground">Compétences requises</h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedJob.requirements.map((req, idx) => (
                              <Button
                                key={idx}
                                variant="secondary"
                                className="px-3 py-1.5 text-sm font-semibold bg-muted border-2 border-border hover:border-border transition-all duration-200 rounded-lg"
                              >
                                {req}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-6 border-t-2 border-border space-y-3">
                        <Button
                          size="lg"
                          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 font-bold h-14 text-base rounded-xl"
                          onClick={() => navigate(`/candidate/jobs/${selectedJob.id}`)}
                        >
                          Voir les détails et postuler
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-card border-2 border-border rounded-xl shadow-lg">
                    <CardContent className="pt-12 pb-12 text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                        <Briefcase className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <p className="text-lg font-semibold text-foreground mb-2">Sélectionnez une offre</p>
                      <p className="text-sm text-muted-foreground">Cliquez sur une offre à gauche pour voir les détails</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
