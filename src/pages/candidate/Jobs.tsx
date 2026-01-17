import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Search, MapPin, Briefcase, DollarSign, Bookmark, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { JobOnboarding } from '@/components/JobOnboarding';
import { getJobOffers, addFavoriteJob, removeFavoriteJob, getFavoriteJobIds } from '@/lib/supabase';
import { JobOffer } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { cn } from '@/lib/utils';

export const CandidateJobs = () => {
  const navigate = useNavigate();
  const { candidate } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [isPageAnimating, setIsPageAnimating] = useState(false);
  const [jobsLoaded, setJobsLoaded] = useState(false);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 1024);
      }
    };
    
    if (typeof window !== 'undefined') {
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Note: On garde le Sheet ouvert même en mode desktop pour l'expérience immersive
  // Le Sheet fonctionne maintenant sur mobile et desktop

  // Charger les offres depuis Supabase avec recherche
  const loadJobs = async () => {
    if (!searchQuery.trim() && !location.trim()) {
      setJobs([]);
      setHasSearched(false);
      setJobsLoaded(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setJobsLoaded(false);
    try {
      const jobOffers = await getJobOffers({
        search: searchQuery || undefined,
        location: location || undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
      });
      setJobs(jobOffers);
      if (jobOffers.length > 0) {
        setSelectedJob(jobOffers[0]);
      }
      setJobsLoaded(true);
    } catch (error) {
      console.error('Error loading jobs:', error);
      setJobs([]);
      setJobsLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  // Recherche au clic sur le bouton ou Enter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPageAnimating) {
      setIsPageAnimating(true);
      setTimeout(() => {
        loadJobs();
        setIsPageAnimating(false);
      }, 500);
    }
  };

  // Charger les favoris au démarrage
  useEffect(() => {
    const loadFavorites = async () => {
      if (candidate?.id) {
        const favoriteIds = await getFavoriteJobIds(candidate.id);
        setSavedJobs(favoriteIds);
      }
    };
    loadFavorites();
  }, [candidate?.id]);

  // Recherche automatique lors du changement des filtres (si on a déjà fait une recherche)
  useEffect(() => {
    if (hasSearched && (searchQuery.trim() || location.trim())) {
      loadJobs();
    }
  }, [selectedType, selectedCategory]);

  const toggleSaveJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!candidate?.id) {
      alert('Veuillez vous connecter pour sauvegarder des favoris');
      return;
    }

    const isCurrentlySaved = savedJobs.has(jobId);
    
    // Mise à jour optimiste de l'UI
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (isCurrentlySaved) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });

    // Sauvegarder dans Supabase
    try {
      if (isCurrentlySaved) {
        await removeFavoriteJob(candidate.id, jobId);
      } else {
        await addFavoriteJob(candidate.id, jobId);
      }
    } catch (error) {
      // En cas d'erreur, restaurer l'état précédent
      setSavedJobs((prev) => {
        const newSet = new Set(prev);
        if (isCurrentlySaved) {
          newSet.add(jobId);
        } else {
          newSet.delete(jobId);
        }
        return newSet;
      });
      console.error('Error toggling favorite:', error);
      alert('Erreur lors de la sauvegarde du favori');
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
      <style>{`
        @keyframes pageSearchTransition3D {
          0% {
            transform: perspective(1200px) rotateY(0deg) rotateX(0deg) scale(1);
            opacity: 1;
          }
          30% {
            transform: perspective(1200px) rotateY(-12deg) rotateX(6deg) scale(0.94);
            opacity: 0.85;
          }
          60% {
            transform: perspective(1200px) rotateY(12deg) rotateX(-6deg) scale(0.96);
            opacity: 0.75;
          }
          100% {
            transform: perspective(1200px) rotateY(0deg) rotateX(0deg) scale(1);
            opacity: 1;
          }
        }
        .page-search-transition-3d {
          animation: pageSearchTransition3D 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transform-style: preserve-3d;
          transform-origin: center center;
          backface-visibility: hidden;
        }
        @keyframes jobCardEnter3D {
          0% {
            transform: perspective(800px) rotateY(-15deg) rotateX(10deg) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: perspective(800px) rotateY(5deg) rotateX(-5deg) scale(1.02);
            opacity: 0.7;
          }
          100% {
            transform: perspective(800px) rotateY(0deg) rotateX(0deg) scale(1);
            opacity: 1;
          }
        }
        .job-card-enter-3d {
          animation: jobCardEnter3D 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
      `}</style>
      <div className={cn("space-y-8 min-h-screen bg-gradient-to-b from-background via-background to-muted/20", isPageAnimating && "page-search-transition-3d")}>
        {/* Hero Search Section - Style moderne avec animations */}
        <div className="relative bg-gradient-to-br from-primary/10 via-background to-background py-16 overflow-hidden">
          {/* Effets de fond animés */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full text-primary">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-semibold">Trouvez votre emploi idéal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Recherche d'emplois
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Découvrez des opportunités passionnantes et faites le premier pas vers votre carrière de rêve
              </p>
            </div>

            {/* Search Bar - Style moderne avec animations */}
            <Card className="max-w-4xl mx-auto shadow-2xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSearch}>
                  <div className="flex flex-col md:flex-row gap-3">
                    {/* Job Title Input */}
                    <div className="flex-1 relative group">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors duration-200" />
                      <Input
                        type="text"
                        placeholder="Métier, compétences, entreprise..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-14 text-base border-2 focus:border-primary transition-all duration-200"
                      />
                    </div>

                    {/* Location Input */}
                    <div className="flex-1 relative group">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors duration-200" />
                      <Input
                        type="text"
                        placeholder="Ville, région ou télétravail"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="pl-12 h-14 text-base border-2 focus:border-primary transition-all duration-200"
                      />
                    </div>

                    {/* Search Button */}
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="h-14 px-8 text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Recherche...
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5 mr-2" />
                          Rechercher
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Advanced Filters - Avec animation */}
                  <div className="mt-6 pt-6">
                    <Separator className="mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          Type de contrat
                        </Label>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                          <SelectTrigger className="h-11 border-2 hover:border-primary/50 transition-colors">
                            <SelectValue placeholder="Tous les types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous les types</SelectItem>
                            <SelectItem value="full-time">Temps plein</SelectItem>
                            <SelectItem value="part-time">Temps partiel</SelectItem>
                            <SelectItem value="contract">Contrat</SelectItem>
                            <SelectItem value="internship">Stage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Catégorie
                        </Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="h-11 border-2 hover:border-primary/50 transition-colors">
                            <SelectValue placeholder="Toutes les catégories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Toutes les catégories</SelectItem>
                            <SelectItem value="Développement">Développement</SelectItem>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Management">Management</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Results Section - Style Indeed avec deux colonnes amélioré */}
        {hasSearched && (
          <div className="container mx-auto px-4 pb-12 min-h-screen">
            {loading ? (
            <Card className="max-w-2xl mx-auto shadow-lg">
              <CardContent className="pt-12 pb-12 space-y-4">
                <div className="space-y-3">
                  <Skeleton className="h-8 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
                <div className="space-y-3 pt-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4 animate-in fade-in duration-500">
              {/* Liste des offres - Colonne gauche */}
              <div className="w-full lg:w-2/5 space-y-4 min-w-0">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                      {jobs.length} offre{jobs.length > 1 ? 's' : ''} trouvée{jobs.length > 1 ? 's' : ''}
                    </h2>
                  </div>
                </div>
                <div className="space-y-3">
                  {jobs.map((job, index) => {
                    return (
                    <Card
                      key={job.id}
                        className={cn(
                          "relative cursor-pointer transition-all duration-300 bg-gradient-to-br from-card via-card to-card/95 rounded-xl border-2 overflow-hidden group",
                          selectedJob?.id === job.id 
                            ? 'border-primary shadow-xl bg-gradient-to-br from-primary/10 via-primary/5 to-card ring-2 ring-primary/20' 
                            : 'border-border/60 hover:border-primary/60 shadow-lg hover:shadow-xl hover:scale-[1.02]',
                          jobsLoaded && "job-card-enter-3d"
                        )}
                        style={{
                          animationDelay: `${index * 0.1}s`
                        }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedJob(job);
                        // Ouvrir le panel immersif (mobile et desktop)
                        setIsMobileSheetOpen(true);
                      }}
                    >
                      {/* Effet de brillance au survol */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                        <CardHeader className="pb-4 pt-5 px-6 relative z-10">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0 space-y-3">
                              {/* Titre de l'offre - Plus visible */}
                              <div>
                                <CardTitle className={`text-lg sm:text-xl font-bold text-foreground line-clamp-2 mb-2 hover:text-primary transition-colors leading-tight ${
                                  selectedJob?.id === job.id ? 'text-primary' : ''
                                }`}>
                                {job.title}
                              </CardTitle>
                            </div>
                              
                              {/* Entreprise */}
                            {job.company && (
                                <CardDescription className="text-base font-semibold text-foreground/90 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                {job.company.name}
                              </CardDescription>
                            )}
                              
                              {/* Location */}
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 flex-shrink-0 text-primary/70" />
                                <span>{job.location}</span>
                              </p>

                              {/* Badges d'informations clés */}
                              <div className="flex flex-wrap gap-2 pt-1">
                                {job.salary && (
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 shadow-sm">
                                    <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                                    {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                                  </span>
                                )}
                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-br from-muted to-muted/80 text-foreground border border-border/60 shadow-sm">
                                  <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                                  {getTypeLabel(job.type)}
                                </span>
                                {job.benefits && (
                                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-br from-primary/10 to-primary/5 text-primary border border-primary/20 shadow-sm">
                                    {job.benefits.split('.')[0]}
                                  </span>
                                )}
                              </div>

                              {/* Description */}
                              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed pt-1">
                              {job.description}
                            </p>

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
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleSaveJob(job.id, e);
                            }}
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

              {/* Détails de l'offre - Colonne droite - Amélioré - Desktop uniquement */}
              <div className="hidden lg:block w-full lg:w-3/5 min-w-0">
                {selectedJob ? (
                  <Card className="lg:sticky lg:top-6 bg-gradient-to-br from-card via-card to-card/95 rounded-xl border-2 border-primary/20 shadow-2xl ring-2 ring-primary/10">
                    <CardHeader className="pb-5 pt-6 px-4 sm:px-6 border-b-2 border-primary/10 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <CardTitle className="text-xl sm:text-2xl font-bold text-foreground break-words">
                              {selectedJob.title}
                            </CardTitle>
                            {/* Badge "Nouveau" pour l'offre sélectionnée */}
                            {selectedJob.createdAt && (new Date().getTime() - new Date(selectedJob.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000 && (
                              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                                Nouveau
                              </span>
                            )}
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
                      {/* Détails de l'emploi - Amélioré */}
                      <div className="space-y-5">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-1.5 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
                          <h3 className="text-xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Informations clés</h3>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          {selectedJob.salary && (
                            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-xl border-2 border-green-200/50 dark:border-green-800/30 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-800/20 flex-shrink-0">
                                <DollarSign className="w-5 h-5 text-green-700 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-foreground mb-1">Salaire</p>
                                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                                  {formatSalary(selectedJob.salary.min, selectedJob.salary.max, selectedJob.salary.currency)}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-muted/80 to-muted/50 rounded-xl border-2 border-border/60 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-muted to-muted/80 flex-shrink-0">
                              <Briefcase className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground mb-1">Type de poste</p>
                              <p className="text-sm font-semibold text-foreground">
                                {getTypeLabel(selectedJob.type)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-muted/80 to-muted/50 rounded-xl border-2 border-border/60 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-muted to-muted/80 flex-shrink-0">
                              <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground mb-1">Lieu de l'emploi</p>
                              <p className="text-sm font-semibold text-foreground">
                                {selectedJob.location}
                              </p>
                            </div>
                          </div>
                          {selectedJob.benefits && (
                            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0">
                                <Sparkles className="w-5 h-5 text-primary" />
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

                      {/* Sections de contenu - Amélioré */}
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
                              <div className="w-1.5 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
                              <h3 className="text-lg font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{section.title}</h3>
                            </div>
                            <div className="bg-gradient-to-br from-muted/60 to-muted/40 rounded-xl border-2 border-border/60 p-5 shadow-sm hover:shadow-md transition-shadow">
                              <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                              {section.content}
                            </p>
                            </div>
                          </div>
                        ) : null
                      )}

                      {/* Compétences requises - Amélioré */}
                      {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
                            <h3 className="text-lg font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Compétences requises</h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedJob.requirements.map((req, idx) => (
                              <Badge 
                                key={idx} 
                                variant="secondary" 
                                className="px-3 py-1.5 text-sm font-semibold bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/15 transition-all duration-200 rounded-lg shadow-sm"
                              >
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions - Amélioré */}
                      <div className="pt-6 border-t-2 border-border space-y-3">
                        <Button
                          variant="outline"
                          className="w-full border-2 hover:border-destructive/50 hover:text-destructive hover:bg-destructive/5 transition-all duration-200 font-semibold h-12 rounded-xl"
                          onClick={() => {
                            if (confirm('Voulez-vous signaler cette offre ?')) {
                              alert('Offre signalée. Merci pour votre contribution.');
                            }
                          }}
                        >
                          Signaler l'offre
                        </Button>
                        <Button
                          size="lg"
                          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 font-bold h-14 text-base rounded-xl"
                          onClick={() => {
                            setSelectedJob(selectedJob);
                            setIsMobileSheetOpen(true);
                          }}
                        >
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                          Voir les détails et postuler
                          </span>
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
        )}

        {/* Onboarding immersif pour présenter l'offre */}
        <JobOnboarding
          job={selectedJob}
          open={isMobileSheetOpen}
          onClose={() => setIsMobileSheetOpen(false)}
          onApply={() => {
            if (selectedJob) {
              setIsMobileSheetOpen(false);
              navigate(`/candidate/jobs/${selectedJob.id}`);
            }
          }}
          onFavorite={(jobId) => {
            const event = new Event('click') as any;
            toggleSaveJob(jobId, event);
          }}
          isFavorite={selectedJob ? savedJobs.has(selectedJob.id) : false}
        />
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted) / 0.2);
          border-radius: 10px;
          margin: 8px 0;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.3);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.5);
          background-clip: padding-box;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-in-from-top-4 {
          from {
            transform: translateY(-1rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slide-in-from-bottom-4 {
          from {
            transform: translateY(1rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slide-in-from-left-4 {
          from {
            transform: translateX(-1rem);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slide-in-from-right-4 {
          from {
            transform: translateX(1rem);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slide-in-from-bottom-2 {
          from {
            transform: translateY(0.5rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .slide-in-from-top-4 {
          animation: slide-in-from-top-4 0.7s ease-out;
        }
        .slide-in-from-bottom-4 {
          animation: slide-in-from-bottom-4 0.7s ease-out;
        }
        .slide-in-from-left-4 {
          animation: slide-in-from-left-4 0.5s ease-out;
        }
        .slide-in-from-right-4 {
          animation: slide-in-from-right-4 0.5s ease-out;
        }
        .slide-in-from-bottom-2 {
          animation: slide-in-from-bottom-2 0.5s ease-out;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </Layout>
  );
};
