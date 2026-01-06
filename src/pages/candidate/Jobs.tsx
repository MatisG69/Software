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
import { getJobOffers } from '@/lib/supabase';
import { JobOffer } from '../../types';

export const CandidateJobs = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  // Charger les offres depuis Supabase avec recherche
  const loadJobs = async () => {
    if (!searchQuery.trim() && !location.trim()) {
      setJobs([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
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
    } catch (error) {
      console.error('Error loading jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Recherche au clic sur le bouton ou Enter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  // Recherche automatique lors du changement des filtres (si on a déjà fait une recherche)
  useEffect(() => {
    if (hasSearched && (searchQuery.trim() || location.trim())) {
      loadJobs();
    }
  }, [selectedType, selectedCategory]);

  const toggleSaveJob = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
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
      <div className="space-y-8 min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
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
              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Recherche d'emplois
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Découvrez des opportunités passionnantes et faites le premier pas vers votre carrière de rêve
              </p>
            </div>

            {/* Search Bar - Style moderne avec animations */}
            <Card className="max-w-4xl mx-auto shadow-2xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <CardContent className="p-6">
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
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          Type de contrat
                        </label>
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
                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Catégorie
                        </label>
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
        <div className="container mx-auto px-4 pb-12">
          {!hasSearched ? (
            <Card className="max-w-2xl mx-auto shadow-lg animate-in fade-in duration-500">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 animate-pulse">
                  <Search className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Commencez votre recherche
                </h3>
                <p className="text-muted-foreground text-lg mb-2">
                  Entrez un métier et une localisation pour découvrir des offres d'emploi
                </p>
                <p className="text-sm text-muted-foreground">
                  💡 Utilisez des mots-clés précis pour des résultats optimaux
                </p>
              </CardContent>
            </Card>
          ) : loading ? (
            <Card className="max-w-2xl mx-auto shadow-lg">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-lg font-semibold text-foreground mb-2">Recherche en cours...</p>
                <p className="text-sm text-muted-foreground">Nous analysons les meilleures offres pour vous</p>
              </CardContent>
            </Card>
          ) : jobs.length === 0 ? (
            <Card className="max-w-2xl mx-auto shadow-lg animate-in fade-in duration-500">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                  <Briefcase className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Aucune offre trouvée</h3>
                <p className="text-muted-foreground mb-6">
                  Essayez de modifier vos critères de recherche ou d'élargir votre zone géographique
                </p>
                <Button onClick={() => { setSearchQuery(''); setLocation(''); setHasSearched(false); }}>
                  Réinitialiser la recherche
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
              {/* Liste des offres - Colonne gauche */}
              <div className="lg:w-2/5 space-y-4">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {jobs.length} offre{jobs.length > 1 ? 's' : ''}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Trouvée{jobs.length > 1 ? 's' : ''} pour votre recherche</p>
                  </div>
                </div>
                <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
                  {jobs.map((job, index) => (
                    <Card
                      key={job.id}
                      className={`cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                        selectedJob?.id === job.id 
                          ? 'border-2 border-primary shadow-lg bg-primary/5 scale-[1.02]' 
                          : 'border hover:border-primary/50 shadow-md'
                      } animate-in fade-in slide-in-from-left-4`}
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => setSelectedJob(job)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-2">
                              <CardTitle className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">
                                {job.title}
                              </CardTitle>
                            </div>
                            {job.company && (
                              <CardDescription className="text-base font-semibold mb-3 text-foreground/80">
                                {job.company.name}
                              </CardDescription>
                            )}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="font-medium">{job.location}</span>
                              </div>
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-md">
                                <Briefcase className="w-3.5 h-3.5" />
                                <span className="font-medium">{getTypeLabel(job.type)}</span>
                              </div>
                              {job.salary && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/20 rounded-md text-green-700 dark:text-green-400">
                                  <DollarSign className="w-3.5 h-3.5" />
                                  <span className="font-semibold">{formatSalary(job.salary.min, job.salary.max, job.salary.currency)}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {job.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{job.category}</Badge>
                              {job.createdAt && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(job.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`flex-shrink-0 transition-all duration-200 ${
                              savedJobs.has(job.id)
                                ? 'text-primary hover:text-primary/80'
                                : 'text-muted-foreground hover:text-primary'
                            }`}
                            onClick={(e) => toggleSaveJob(job.id, e)}
                          >
                            <Bookmark 
                              className={`w-5 h-5 transition-all duration-200 ${
                                savedJobs.has(job.id) ? 'fill-current' : ''
                              }`} 
                            />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Détails de l'offre - Colonne droite */}
              <div className="lg:w-3/5">
                {selectedJob ? (
                  <Card className="sticky top-6 shadow-2xl border-2 border-primary/20 animate-in fade-in slide-in-from-right-4 duration-500">
                    <CardHeader className="pb-4 border-b">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <CardTitle className="text-3xl font-bold">{selectedJob.title}</CardTitle>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`transition-all duration-200 ${
                                savedJobs.has(selectedJob.id)
                                  ? 'text-primary hover:text-primary/80'
                                  : 'text-muted-foreground hover:text-primary'
                              }`}
                              onClick={(e) => toggleSaveJob(selectedJob.id, e)}
                            >
                              <Bookmark 
                                className={`w-6 h-6 transition-all duration-200 ${
                                  savedJobs.has(selectedJob.id) ? 'fill-current' : ''
                                }`} 
                              />
                            </Button>
                          </div>
                          {selectedJob.company && (
                            <CardDescription className="text-xl font-semibold mb-4 text-foreground/80">
                              {selectedJob.company.name}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
                      {/* Détails de l'emploi */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <div className="w-1 h-6 bg-primary rounded-full"></div>
                          Détails de l'emploi
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {selectedJob.salary && (
                            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-lg border border-green-200 dark:border-green-800">
                              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-foreground mb-1">Salaire</p>
                                <p className="text-sm text-muted-foreground font-medium">
                                  {formatSalary(selectedJob.salary.min, selectedJob.salary.max, selectedJob.salary.currency)}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border">
                            <Briefcase className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-foreground mb-1">Type de poste</p>
                              <p className="text-sm text-muted-foreground font-medium">
                                {getTypeLabel(selectedJob.type)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border">
                            <MapPin className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-foreground mb-1">Lieu de l'emploi</p>
                              <p className="text-sm text-muted-foreground font-medium">
                                {selectedJob.location}
                              </p>
                            </div>
                          </div>
                          {selectedJob.benefits && (
                            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-lg border border-blue-200 dark:border-blue-800">
                              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-semibold text-foreground mb-1">Avantages</p>
                                <p className="text-sm text-muted-foreground font-medium line-clamp-2">
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
                          <div key={idx} className="space-y-3 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 100}ms` }}>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                              <div className="w-1 h-6 bg-primary rounded-full"></div>
                              {section.title}
                            </h3>
                            <p className="text-foreground whitespace-pre-line leading-relaxed bg-muted/30 p-4 rounded-lg border">
                              {section.content}
                            </p>
                          </div>
                        ) : null
                      )}

                      {/* Compétences requises */}
                      {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded-full"></div>
                            Compétences requises
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedJob.requirements.map((req, idx) => (
                              <Badge 
                                key={idx} 
                                variant="secondary" 
                                className="px-3 py-1.5 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-200 cursor-default"
                              >
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-6 border-t space-y-3 sticky bottom-0 bg-background pb-4">
                        <Button
                          variant="outline"
                          className="w-full border-2 hover:border-destructive hover:text-destructive transition-all duration-200"
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
                          className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          onClick={() => navigate(`/candidate/jobs/${selectedJob.id}`)}
                        >
                          Voir les détails et postuler
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="shadow-lg">
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

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
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
