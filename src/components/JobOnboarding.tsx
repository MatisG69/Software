import { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Send, MapPin, Briefcase, DollarSign, ChevronRight, ChevronLeft, Heart, ArrowRight, Sparkles, CheckCircle2, Building2, Users, Target, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { JobOffer, JobOfferMedia } from '@/types';
import { cn } from '@/lib/utils';

interface JobOnboardingProps {
  job: JobOffer | null;
  open: boolean;
  onClose: () => void;
  onApply?: () => void;
  onFavorite?: (jobId: string) => void;
  isFavorite?: boolean;
}

export const JobOnboarding = ({ 
  job, 
  open, 
  onClose, 
  onApply,
  onFavorite,
  isFavorite = false
}: JobOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Organiser les médias
  const featuredVideo = job?.featuredVideo;
  const featuredImage = job?.featuredImage;
  
  // Debug: afficher les médias dans la console
  useEffect(() => {
    if (job && open) {
      console.log('🔍 Job media debug:', {
        featuredVideo: job.featuredVideo,
        featuredImage: job.featuredImage,
        hasVideo: !!job.featuredVideo,
        hasImage: !!job.featuredImage,
        videoUrl: job.featuredVideo,
        imageUrl: job.featuredImage,
      });
    }
  }, [job, open]);

  const currentMedia = featuredVideo 
    ? { type: 'video' as const, url: featuredVideo, thumbnail: featuredImage }
    : featuredImage 
    ? { type: 'image' as const, url: featuredImage }
    : null;

  // Debug: afficher le média sélectionné
  useEffect(() => {
    if (currentMedia && open) {
      console.log('📹 Current media:', currentMedia);
    } else if (open && job) {
      console.log('⚠️ No media found for job:', job.id, {
        featuredVideo,
        featuredImage,
        currentMedia
      });
    }
  }, [currentMedia, open, job, featuredVideo, featuredImage]);

  // Étapes de l'onboarding
  const steps = [
    { id: 'hero', title: 'Découvrez l\'offre', icon: Sparkles },
    { id: 'company', title: 'L\'entreprise', icon: Building2 },
    { id: 'mission', title: 'Vos missions', icon: Target },
    { id: 'culture', title: 'Notre culture', icon: Users },
    { id: 'requirements', title: 'Compétences', icon: Award },
    { id: 'apply', title: 'Postuler', icon: Send },
  ];

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setIsAnimating(false);
    }
  }, [open]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const goToStep = (stepIndex: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(stepIndex);
      setIsAnimating(false);
    }, 300);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'full-time': return 'Temps plein';
      case 'part-time': return 'Temps partiel';
      case 'contract': return 'Contrat';
      case 'internship': return 'Stage';
      default: return type;
    }
  };

  if (!open || !job) return null;

  const StepIcon = steps[currentStep].icon;
  const companyInitial = job.company?.name?.charAt(0).toUpperCase() || 'E';

  return (
    <div className={cn(
      "fixed inset-0 z-[100] bg-background/95 backdrop-blur-md transition-opacity duration-500",
      open ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      {/* Header avec icône, nom entreprise et titre étape */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          {/* Ligne 1: Icône entreprise + nom + titre étape */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Icône circulaire avec initiale */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center shadow-sm">
                <span className="text-primary font-bold text-sm">
                  {companyInitial}
                </span>
              </div>
              <div>
                <p className="text-foreground font-semibold text-sm leading-tight">{job.company?.name || 'Entreprise'}</p>
                <p className="text-muted-foreground text-xs leading-tight flex items-center gap-1.5">
                  <StepIcon className="w-3 h-3" />
                  {steps[currentStep].title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onFavorite?.(job.id)}
              >
                <Heart className={cn("w-4 h-4 transition-all", isFavorite && "fill-red-500 text-red-500")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Barre de progression avec marqueurs circulaires */}
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    idx <= currentStep
                      ? "bg-primary scale-125"
                      : "bg-muted/30 scale-100"
                  )}
                />
              ))}
            </div>
            {/* Barre de progression linéaire */}
            <div className="relative h-1 bg-muted/20 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Onglets de navigation */}
          <div className="flex items-center justify-center gap-1 flex-wrap">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(idx)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                    idx === currentStep
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  <span>{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="h-full pt-40 pb-20 overflow-y-auto custom-scrollbar">
        <div 
          className={cn(
            "container mx-auto px-6 transition-all duration-300 ease-out",
            isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          )}
        >
          {/* Étape 0: Hero avec média */}
          {currentStep === 0 && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Zone média principale */}
              <Card className="overflow-hidden border-2 shadow-xl bg-card/60 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="relative w-full aspect-video">
                    {currentMedia?.type === 'video' ? (
                      <div className="relative w-full h-full group">
                        <video
                          ref={videoRef}
                          src={currentMedia.url}
                          className="w-full h-full object-cover"
                          onTimeUpdate={handleTimeUpdate}
                          onLoadedMetadata={handleTimeUpdate}
                          onEnded={() => setIsPlaying(false)}
                          muted={isMuted}
                          playsInline
                        />
                        {!isPlaying && (
                          <div 
                            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer z-40"
                            onClick={handlePlayPause}
                          >
                            <div className="relative">
                              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
                              <div className="relative w-20 h-20 rounded-full bg-primary/25 backdrop-blur-md flex items-center justify-center hover:bg-primary/35 hover:scale-110 transition-all shadow-2xl border-2 border-primary/30">
                                <Play className="w-10 h-10 text-primary-foreground ml-1" fill="currentColor" />
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Contrôles vidéo */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white hover:bg-white/20 w-9 h-9 rounded-full"
                              onClick={handlePlayPause}
                            >
                              {isPlaying ? <Pause className="w-4 h-4" fill="white" /> : <Play className="w-4 h-4 ml-0.5" fill="white" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white hover:bg-white/20 w-9 h-9 rounded-full"
                              onClick={() => setIsMuted(!isMuted)}
                            >
                              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </Button>
                            <div className="text-white text-xs font-medium">
                              {formatTime(currentTime)} / {formatTime(duration)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : currentMedia?.type === 'image' ? (
                      <img
                        src={currentMedia.url}
                        alt={job.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('❌ Error loading image:', currentMedia.url);
                          console.error('Image URL details:', {
                            url: currentMedia.url,
                            isValid: currentMedia.url?.startsWith('http'),
                            jobId: job.id
                          });
                          // Afficher un message d'erreur
                          e.currentTarget.parentElement?.insertAdjacentHTML('afterbegin', 
                            `<div class="absolute inset-0 flex items-center justify-center bg-red-500/10 text-red-500 text-sm p-4">
                              <p>Erreur de chargement de l'image</p>
                              <p class="text-xs mt-2">${currentMedia.url}</p>
                            </div>`
                          );
                        }}
                        onLoad={() => {
                          console.log('✅ Image loaded successfully:', currentMedia.url);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-8">
                        <Briefcase className="w-24 h-24 text-primary/30 mb-4" />
                        <p className="text-muted-foreground text-sm text-center">
                          {job.featuredImage || job.featuredVideo 
                            ? 'Chargement du média...' 
                            : 'Aucun média disponible pour cette offre'}
                        </p>
                        {(job.featuredImage || job.featuredVideo) && (
                          <div className="mt-4 space-y-3 text-xs text-muted-foreground max-w-md">
                            <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                              <p className="font-semibold text-foreground">État des médias :</p>
                              <p>Image: {job.featuredImage ? '✅ Présente' : '❌ Absente'}</p>
                              <p>Vidéo: {job.featuredVideo ? '✅ Présente' : '❌ Absente'}</p>
                            </div>
                            {job.featuredImage && (
                              <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="font-semibold mb-1 text-foreground">URL Image:</p>
                                <p className="text-[10px] break-all text-primary mb-2">
                                  {job.featuredImage}
                                </p>
                                <a 
                                  href={job.featuredImage} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  🔗 Tester l'URL dans un nouvel onglet →
                                </a>
                              </div>
                            )}
                            {job.featuredVideo && (
                              <div className="bg-muted/50 p-3 rounded-lg">
                                <p className="font-semibold mb-1 text-foreground">URL Vidéo:</p>
                                <p className="text-[10px] break-all text-primary mb-2">
                                  {job.featuredVideo}
                                </p>
                                <a 
                                  href={job.featuredVideo} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  🔗 Tester l'URL dans un nouvel onglet →
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Titre et infos principales */}
              <div className="text-center space-y-4">
                <Card className="bg-card/60 backdrop-blur-sm border-2">
                  <CardHeader>
                    <CardTitle className="text-3xl md:text-4xl font-bold mb-3">
                      {job.title}
                    </CardTitle>
                    <CardDescription className="flex items-center justify-center gap-3 flex-wrap">
                      <Badge variant="secondary" className="gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </Badge>
                      <Badge variant="secondary" className="gap-1.5">
                        <Briefcase className="w-3.5 h-3.5" />
                        {getTypeLabel(job.type)}
                      </Badge>
                      {job.salary && (
                        <Badge variant="secondary" className="gap-1.5 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                          <DollarSign className="w-3.5 h-3.5" />
                          {job.salary.min?.toLocaleString()} - {job.salary.max?.toLocaleString()} {job.salary.currency}/an
                        </Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {job.description.substring(0, 200)}...
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Étape 1: L'entreprise */}
          {currentStep === 1 && (
            <div className="max-w-4xl mx-auto space-y-4">
              <Card className="bg-card/60 backdrop-blur-sm border-2">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-3xl">L'entreprise</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.company && (
                    <>
                      {/* Card avec nom entreprise */}
                      <Card className="bg-muted/30 border border-border/50">
                        <CardContent className="p-4">
                          <h3 className="text-xl font-bold">{job.company.name}</h3>
                        </CardContent>
                      </Card>
                      
                      {/* Card "Qui sommes-nous ?" */}
                      {job.whoWeAre && (
                        <Card className="bg-muted/30 border border-border/50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Qui sommes-nous ?</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                              {job.whoWeAre || 'Découvrez notre histoire et nos valeurs.'}
                            </p>
                          </CardContent>
                        </Card>
                      )}

                      {/* Card "Engagement et Innovation" */}
                      {job.company.description && (
                        <Card className="bg-muted/30 border border-border/50">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Engagement et Innovation</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                              {job.company.description}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Étape 2: Vos missions */}
          {currentStep === 2 && (
            <div className="max-w-4xl mx-auto space-y-4">
              <Card className="bg-card/60 backdrop-blur-sm border-2">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-3xl">Vos missions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.missions && (
                    <Card className="bg-muted/30 border border-border/50">
                      <CardContent className="p-4">
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{job.missions}</p>
                      </CardContent>
                    </Card>
                  )}
                  {job.expectedExperience && (
                    <Card className="bg-muted/30 border border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Award className="w-5 h-5 text-primary" />
                          Expérience attendue
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{job.expectedExperience}</p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Étape 3: Culture */}
          {currentStep === 3 && (
            <div className="max-w-4xl mx-auto space-y-4">
              <Card className="bg-card/60 backdrop-blur-sm border-2">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-3xl">Notre culture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.whatYouWillLive && (
                    <Card className="bg-muted/30 border border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-primary" />
                          Ce que vous allez vivre chez nous
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{job.whatYouWillLive}</p>
                      </CardContent>
                    </Card>
                  )}
                  {job.whatWeWillLove && (
                    <Card className="bg-muted/30 border border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Ce que nous allons aimer chez vous</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{job.whatWeWillLove}</p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Étape 4: Compétences */}
          {currentStep === 4 && (
            <div className="max-w-4xl mx-auto space-y-4">
              <Card className="bg-card/60 backdrop-blur-sm border-2">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-3xl">Compétences requises</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.requirements && job.requirements.length > 0 && (
                    <Card className="bg-muted/30 border border-border/50">
                      <CardContent className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.map((req, idx) => (
                            <Badge 
                              key={idx} 
                              variant="secondary" 
                              className="px-3 py-1.5 text-sm bg-primary/10 text-primary border-primary/20"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {job.benefits && (
                    <Card className="bg-muted/30 border border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Avantages</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">{job.benefits}</p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Étape 5: Postuler */}
          {currentStep === 5 && (
            <div className="max-w-2xl mx-auto">
              <Card className="bg-card/60 backdrop-blur-sm border-2">
                <CardHeader className="text-center pb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Send className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-3xl mb-2">Prêt à postuler ?</CardTitle>
                  <CardDescription className="text-base">
                    Rejoignez {job.company?.name || 'cette entreprise'} et faites partie de l'aventure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                      <span className="text-muted-foreground">Poste</span>
                      <span className="font-semibold">{job.title}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                      <span className="text-muted-foreground">Localisation</span>
                      <span className="font-semibold">{job.location}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <span className="text-muted-foreground">Salaire</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {job.salary.min?.toLocaleString()} - {job.salary.max?.toLocaleString()} {job.salary.currency}/an
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={onApply}
                    size="lg"
                    className="w-full h-12 text-base font-bold shadow-lg"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Postuler maintenant
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>
            <div className="text-muted-foreground text-sm font-medium">
              {currentStep + 1} / {steps.length}
            </div>
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={nextStep}
                className="gap-2"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={onApply}
                className="gap-2 shadow-lg"
              >
                Postuler
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: hsl(var(--muted) / 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.7);
        }
      `}</style>
    </div>
  );
};
