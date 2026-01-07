import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animation d'entrée du contenu
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 200);

    const startTime = Date.now();
    const duration = 6000; // 6 secondes exactement
    let animationFrameId: number;

    // Animation fluide avec requestAnimationFrame
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      
      let newProgress = 0;
      
      if (progressRatio < 0.96) {
        // Progression normale jusqu'à 96%
        newProgress = progressRatio * 96;
      } else {
        // Ralentissement significatif à partir de 96%
        // Les 4% restants prennent le temps restant
        const remainingRatio = (progressRatio - 0.96) / 0.04;
        newProgress = 96 + (remainingRatio * 4);
      }
      
      newProgress = Math.min(newProgress, 100);
      setProgress(newProgress);
      
      if (newProgress < 100) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Petite pause avant l'animation de sortie
        setTimeout(() => {
          setIsExiting(true);
          // Attendre la fin de l'animation avant de compléter
          setTimeout(() => {
            onComplete();
          }, 800);
        }, 200);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      clearTimeout(timer);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [onComplete]);

  // La couche noire monte progressivement et le pourcentage suit
  // La couche noire part du bas (bottom: 100%) et monte jusqu'en haut (bottom: 0%)
  // Le pourcentage reflète cette montée (0% = en bas, 100% = complètement en haut)
  const blackBottom = `${100 - progress}%`;

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#1a1a1a]"
    >
      {/* Couche grise (fond) - reste en place */}
      <div 
        className="absolute inset-0 bg-[#1a1a1a]"
        style={{
          zIndex: 1
        }}
      />
      
      {/* Couche noire qui monte progressivement depuis le bas jusqu'en haut */}
      <div 
        className="absolute left-0 right-0 bg-black"
        style={{
          bottom: blackBottom,
          height: '100%',
          zIndex: 2,
          willChange: 'bottom',
          transition: 'none' // Pas de transition CSS, on contrôle tout avec JS
        }}
      />

      {/* Contenu de chargement (au-dessus) */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          zIndex: 3,
          transition: 'opacity 0.5s ease-in',
          transform: isExiting ? 'translateY(-30px) scale(0.95)' : 'translateY(0) scale(1)',
          transitionProperty: isExiting ? 'opacity, transform' : 'opacity',
          transitionDuration: isExiting ? '0.8s' : '0.5s',
          transitionTimingFunction: isExiting ? 'cubic-bezier(0.4, 0, 0.2, 1)' : 'ease-in',
          willChange: isExiting ? 'transform, opacity' : 'opacity'
        }}
      >
        <div className="flex flex-col items-center justify-center h-full">
          {/* Pourcentage - style The Goonies - centré verticalement */}
          <div className="mb-auto mt-auto">
            <span 
              className="text-[140px] md:text-[180px] font-extralight text-white tracking-[-0.05em] leading-none select-none"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontWeight: 200,
                letterSpacing: '-0.05em'
              }}
            >
              {Math.round(progress)}%
            </span>
          </div>
          
          {/* Texte Loading et point clignotant - en bas */}
          <div className="mb-8 flex flex-col items-center">
            <div 
              className="text-white text-sm md:text-base font-light tracking-[0.2em] uppercase select-none mb-2"
              style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                letterSpacing: '0.2em'
              }}
            >
              Loading
            </div>
            {/* Point blanc clignotant */}
            <div 
              className="w-1 h-1 bg-white rounded-full animate-pulse-slow"
              style={{
                animation: 'pulse-slow 1.5s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      </div>

      {/* Styles d'animation pour le point clignotant */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
};

