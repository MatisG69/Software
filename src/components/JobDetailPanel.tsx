import { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, Send, MapPin, Briefcase, DollarSign, Clock, ChevronRight, Download, Share2, Edit, Heart, MoreVertical, Flag } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { JobOffer, JobOfferMedia } from '@/types';
import { cn } from '@/lib/utils';

// Styles pour la scrollbar personnalisée
const customScrollbarStyles = `
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
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--primary) / 0.7);
    background-clip: padding-box;
  }
`;

interface JobDetailPanelProps {
  job: JobOffer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply?: () => void;
  onFavorite?: (jobId: string) => void;
  isFavorite?: boolean;
}

export const JobDetailPanel = ({ 
  job, 
  open, 
  onOpenChange, 
  onApply,
  onFavorite,
  isFavorite = false
}: JobDetailPanelProps) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showAllMedia, setShowAllMedia] = useState(false);

  // Organiser les médias : vidéo principale + autres médias
  const featuredVideo = job?.featuredVideo || (job?.media?.find(m => m.type === 'video')?.url);
  const featuredImage = job?.featuredImage || (job?.media?.find(m => m.type === 'image')?.url);
  const otherMedia = job?.media?.filter((m, idx) => {
    if (m.url === featuredVideo || m.url === featuredImage) return false;
    return true;
  }) || [];

  const currentMedia = featuredVideo 
    ? { type: 'video' as const, url: featuredVideo, thumbnail: featuredImage }
    : featuredImage 
    ? { type: 'image' as const, url: featuredImage }
    : null;

  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.currentTime = currentTime;
    }
  }, [open, currentTime]);

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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMediaSelect = (index: number) => {
    setCurrentMediaIndex(index);
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
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

  if (!job) return null;

  return (
    <>
      <style>{customScrollbarStyles}</style>
      <Sheet open={open} onOpenChange={onOpenChange} modal={true}>
        <SheetContent 
          side="right" 
          className="w-full sm:w-[90vw] lg:w-[85vw] xl:w-[80vw] max-w-[1400px] p-0 overflow-hidden bg-black/98 backdrop-blur-2xl border-0"
        >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header avec infos de base - Style moderne et discret */}
          <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/70 to-transparent p-4 sm:p-6 backdrop-blur-md">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  {job.company && (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/20 border-2 border-primary/40 flex items-center justify-center shadow-lg">
                        <span className="text-primary font-bold text-base">
                          {job.company.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-semibold text-base">{job.company.name}</p>
                        <p className="text-white/70 text-xs">{new Date(job.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/15 rounded-lg transition-all"
                  onClick={() => onFavorite?.(job.id)}
                >
                  <Heart className={cn("w-5 h-5 transition-all", isFavorite && "fill-red-500 text-red-500 scale-110")} />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/15 rounded-lg transition-all">
                  <Download className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/15 rounded-lg transition-all">
                  <Share2 className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/15 rounded-lg transition-all">
                  <MoreVertical className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/15 rounded-lg transition-all"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Zone média principale - Design immersif */}
          <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
                
                {/* Overlay avec bouton play central - Style moderne */}
                {!isPlaying && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer z-40 transition-all group-hover:bg-black/30"
                    onClick={handlePlayPause}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse"></div>
                      <div className="relative w-24 h-24 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center hover:bg-white/35 hover:scale-110 transition-all shadow-2xl border-2 border-white/30">
                        <Play className="w-12 h-12 text-white ml-1" fill="white" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Miniatures des autres médias (coin supérieur droit) - Style moderne */}
                {otherMedia.length > 0 && (
                  <div className="absolute top-20 right-4 z-40 flex flex-col gap-3">
                    {otherMedia.slice(0, 2).map((media, idx) => (
                      <div
                        key={idx}
                        className="relative w-28 h-20 rounded-xl overflow-hidden border-2 border-white/40 cursor-pointer hover:border-white/80 hover:scale-105 transition-all shadow-2xl group"
                        onClick={() => handleMediaSelect(idx)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent z-10"></div>
                        {media.type === 'video' ? (
                          <video
                            src={media.url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={media.url}
                            alt={media.title || `Media ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                        {media.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all">
                              <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Contrôles vidéo en bas - Style moderne inspiré de la photo */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 sm:p-6 z-40 backdrop-blur-sm">
                  <div className="space-y-4">
                    {/* Barre de progression - Style moderne */}
                    <div className="flex items-center gap-4">
                      <div className="text-white text-xs font-medium min-w-[45px]">
                        {formatTime(currentTime)}
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-1 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #fff 0%, #fff ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) 100%)`
                        }}
                      />
                      <div className="text-white/70 text-xs min-w-[45px] text-right">
                        {formatTime(duration)}
                      </div>
                    </div>

                    {/* Contrôles - Style moderne */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20 w-12 h-12 rounded-full transition-all"
                          onClick={handlePlayPause}
                        >
                          {isPlaying ? (
                            <Pause className="w-6 h-6" fill="white" />
                          ) : (
                            <Play className="w-6 h-6 ml-0.5" fill="white" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20 w-10 h-10 rounded-full transition-all"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? (
                            <VolumeX className="w-5 h-5" />
                          ) : (
                            <Volume2 className="w-5 h-5" />
                          )}
                        </Button>
                        <div className="text-white/80 text-sm font-medium px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                          {playbackRate}x
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          className="text-white hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                          onClick={() => setShowAllMedia(!showAllMedia)}
                        >
                          All media
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-white hover:bg-white/20 w-10 h-10 rounded-full transition-all"
                        >
                          <Maximize2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : currentMedia?.type === 'image' ? (
              <div className="relative w-full h-full group">
                <img
                  src={currentMedia.url}
                  alt={job.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {otherMedia.length > 0 && (
                  <div className="absolute top-20 right-4 z-40 flex flex-col gap-3">
                    {otherMedia.slice(0, 2).map((media, idx) => (
                      <div
                        key={idx}
                        className="relative w-28 h-20 rounded-xl overflow-hidden border-2 border-white/40 cursor-pointer hover:border-white/80 hover:scale-105 transition-all shadow-2xl group/media"
                        onClick={() => handleMediaSelect(idx)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent z-10"></div>
                        {media.type === 'image' ? (
                          <img
                            src={media.url}
                            alt={media.title || `Media ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <video
                              src={media.url}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                            />
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover/media:bg-white/30 transition-all">
                                <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"></div>
                    <Briefcase className="w-24 h-24 text-primary/40 mx-auto relative z-10" />
                  </div>
                  <p className="text-white/60 text-lg font-medium">Aucun média disponible</p>
                  <p className="text-white/40 text-sm">L'entreprise n'a pas encore ajouté de contenu visuel</p>
                </div>
              </div>
            )}
          </div>

          {/* Contenu de l'offre (scrollable) - Style moderne */}
          <div className="bg-background border-t-2 border-primary/20 max-h-[40vh] overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-6">
              {/* Titre et infos principales */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{job.title}</h1>
                  {job.company && (
                    <p className="text-xl text-muted-foreground">{job.company.name}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary" className="gap-2">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </Badge>
                  <Badge variant="secondary" className="gap-2">
                    <Briefcase className="w-4 h-4" />
                    {getTypeLabel(job.type)}
                  </Badge>
                  {job.salary && (
                    <Badge variant="secondary" className="gap-2">
                      <DollarSign className="w-4 h-4" />
                      {job.salary.min?.toLocaleString()} - {job.salary.max?.toLocaleString()} {job.salary.currency}/an
                    </Badge>
                  )}
                  <Badge variant="secondary" className="gap-2">
                    <Clock className="w-4 h-4" />
                    Publié {new Date(job.createdAt).toLocaleDateString('fr-FR')}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h2 className="text-xl font-bold mb-3">Description du poste</h2>
                <p className="text-foreground whitespace-pre-line leading-relaxed">{job.description}</p>
              </div>

              {/* Missions */}
              {job.missions && (
                <div>
                  <h2 className="text-xl font-bold mb-3">Vos missions</h2>
                  <p className="text-foreground whitespace-pre-line leading-relaxed">{job.missions}</p>
                </div>
              )}

              {/* Compétences requises */}
              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-3">Compétences requises</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((req, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm">
                        {req}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Sections supplémentaires */}
              {job.whoWeAre && (
                <div>
                  <h2 className="text-xl font-bold mb-3">Qui sommes-nous</h2>
                  <p className="text-foreground whitespace-pre-line leading-relaxed">{job.whoWeAre}</p>
                </div>
              )}

              {job.whatYouWillLive && (
                <div>
                  <h2 className="text-xl font-bold mb-3">Ce que vous allez vivre chez nous</h2>
                  <p className="text-foreground whitespace-pre-line leading-relaxed">{job.whatYouWillLive}</p>
                </div>
              )}

              {job.whatWeWillLove && (
                <div>
                  <h2 className="text-xl font-bold mb-3">Ce que nous allons aimer chez vous</h2>
                  <p className="text-foreground whitespace-pre-line leading-relaxed">{job.whatWeWillLove}</p>
                </div>
              )}

              {/* Bouton Postuler - Style moderne et attractif */}
              <div className="sticky bottom-0 bg-background/95 backdrop-blur-md pt-4 pb-4 border-t-2 border-primary/20 shadow-2xl">
                <Button
                  onClick={onApply}
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary text-white shadow-2xl hover:shadow-primary/50 transition-all duration-300 font-bold h-14 text-base rounded-xl group"
                >
                  <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  Postuler maintenant
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
};
