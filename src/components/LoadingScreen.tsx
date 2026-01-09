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

  // La couche noire descend progressivement depuis le haut et le pourcentage suit
  // La couche noire part du haut (top: 0%) et descend jusqu'en bas (top: 100%)
  // Le pourcentage reflète cette descente (0% = en haut, 100% = complètement en bas)
  const blackTop = `${progress}%`;

  return (
    <div 
      className="fixed inset-0 z-[9999] overflow-hidden bg-black"
    >
      {/* Effet de particules animées spectaculaires sur fond noir */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at ${20 + progress * 0.1}% ${30 + progress * 0.2}%, hsl(var(--primary) / 0.25) 0%, transparent 40%),
            radial-gradient(circle at ${80 - progress * 0.1}% ${70 - progress * 0.2}%, hsl(var(--primary) / 0.2) 0%, transparent 50%),
            radial-gradient(circle at ${50 + Math.sin(progress * 0.1) * 10}% ${50 + Math.cos(progress * 0.1) * 10}%, hsl(var(--primary) / 0.15) 0%, transparent 60%)
          `,
          zIndex: 1,
          animation: 'particle-float 8s ease-in-out infinite'
        }}
      />
      
      {/* Couche de fond noir avec légers gradients */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, 
            #000000 0%, 
            #0a0a0a 50%,
            #000000 100%)`,
          zIndex: 2
        }}
      />
      
      {/* Couche qui descend avec gradient spectaculaire et effets */}
      <div 
        className="absolute left-0 right-0"
        style={{
          top: blackTop,
          height: '100%',
          background: `linear-gradient(180deg, 
            hsl(var(--primary) / 0.98) 0%, 
            hsl(var(--primary) / 0.95) 30%,
            hsl(var(--foreground) / 0.92) 70%,
            hsl(var(--foreground) / 0.95) 100%)`,
          zIndex: 3,
          willChange: 'top',
          transition: 'none',
          boxShadow: `
            0 -20px 60px -15px hsl(var(--primary) / 0.5),
            0 -10px 30px -10px hsl(var(--primary) / 0.3),
            inset 0 0 100px hsl(var(--primary) / 0.1)
          `,
          backdropFilter: 'blur(2px)',
          borderBottom: `3px solid hsl(var(--primary) / 0.8)`
        }}
      />
      
      {/* Ligne de séparation spectaculaire avec glow intense */}
      <div 
        className="absolute left-0 right-0"
        style={{
          top: blackTop,
          height: '4px',
          background: `linear-gradient(90deg, 
            transparent 0%, 
            hsl(var(--primary) / 0.8) 20%,
            hsl(var(--primary)) 50%, 
            hsl(var(--primary) / 0.8) 80%,
            transparent 100%)`,
          zIndex: 4,
          willChange: 'top',
          transition: 'none',
          boxShadow: `
            0 0 30px hsl(var(--primary) / 0.8),
            0 0 60px hsl(var(--primary) / 0.5),
            0 0 90px hsl(var(--primary) / 0.3)
          `,
          filter: 'blur(0.5px)'
        }}
      />
      
      {/* Effet de lumière qui suit la ligne */}
      <div 
        className="absolute left-0 right-0"
        style={{
          top: blackTop,
          height: '1px',
          background: `linear-gradient(90deg, 
            transparent 0%, 
            hsl(var(--primary)) 50%, 
            transparent 100%)`,
          zIndex: 5,
          willChange: 'top',
          transition: 'none',
          boxShadow: '0 0 40px hsl(var(--primary))',
          filter: 'blur(2px)'
        }}
      />

      {/* Contenu de chargement (au-dessus) */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          zIndex: 5,
          transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isExiting ? 'translateY(-20px) scale(0.98)' : 'translateY(0) scale(1)',
          transitionProperty: isExiting ? 'opacity, transform' : 'opacity',
          transitionDuration: isExiting ? '0.8s' : '0.6s',
          transitionTimingFunction: isExiting ? 'cubic-bezier(0.4, 0, 0.2, 1)' : 'cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: isExiting ? 'transform, opacity' : 'opacity'
        }}
      >
        <div className="flex flex-col items-center justify-center h-full relative">
          {/* Effet de glow spectaculaire autour du pourcentage - réduit */}
          <div 
            className="absolute mb-auto mt-auto"
            style={{
              width: '250px',
              height: '250px',
              background: `radial-gradient(circle, 
                hsl(var(--primary) / 0.4) 0%, 
                hsl(var(--primary) / 0.3) 30%,
                hsl(var(--primary) / 0.15) 50%,
                transparent 70%)`,
              filter: 'blur(50px)',
              opacity: 0.7 + (progress / 100) * 0.3,
              transform: `translateY(0) scale(${1 + (progress / 100) * 0.15})`,
              zIndex: 0,
              animation: 'glow-pulse 3s ease-in-out infinite'
            }}
          />
          
          {/* Pourcentage - style The Goonies avec police système */}
          <div className="mb-auto mt-auto relative z-10">
            <span 
              className="text-[80px] md:text-[100px] font-extralight tracking-[-0.02em] leading-none select-none"
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 200,
                letterSpacing: '-0.02em',
                color: `hsl(var(--primary))`,
                textShadow: `
                  0 0 20px hsl(var(--primary) / 0.8),
                  0 0 40px hsl(var(--primary) / 0.6),
                  0 0 60px hsl(var(--primary) / 0.4)
                `,
                filter: 'drop-shadow(0 2px 4px hsl(var(--primary) / 0.3))'
              }}
            >
              {Math.round(progress)}%
            </span>
          </div>
          
          {/* Texte Loading avec design créatif - en bas */}
          <div className="mb-10 flex flex-col items-center relative z-10">
            {/* Barre de progression visuelle créative */}
            <div className="mb-4 w-32 h-0.5 bg-foreground/20 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, 
                    hsl(var(--primary)) 0%, 
                    hsl(var(--primary) / 0.8) 50%,
                    hsl(var(--primary)) 100%)`,
                  boxShadow: `
                    0 0 10px hsl(var(--primary) / 0.8),
                    0 0 20px hsl(var(--primary) / 0.5)
                  `,
                  transition: 'width 0.1s linear'
                }}
              />
            </div>
            
            <div 
              className="text-xs md:text-sm font-light tracking-[0.25em] uppercase select-none mb-3"
              style={{
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.25em',
                fontWeight: 300,
                color: `hsl(var(--primary))`,
                textShadow: `
                  0 0 8px hsl(var(--primary) / 0.9),
                  0 0 16px hsl(var(--primary) / 0.6),
                  0 0 24px hsl(var(--primary) / 0.3)
                `,
                filter: 'drop-shadow(0 1px 2px hsl(var(--primary) / 0.4))',
                opacity: 0.9
              }}
            >
              Loading
            </div>
            
            {/* Indicateur de progression créatif avec animation en vague */}
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="rounded-full"
                  style={{
                    width: '6px',
                    height: '6px',
                    background: `radial-gradient(circle, 
                      hsl(var(--primary)) 0%, 
                      hsl(var(--primary) / 0.7) 50%,
                      hsl(var(--primary) / 0.4) 100%)`,
                    boxShadow: `
                      0 0 8px hsl(var(--primary) / 0.9),
                      0 0 16px hsl(var(--primary) / 0.6),
                      inset 0 0 8px hsl(var(--primary) / 0.4)
                    `,
                    animation: `wave-pulse 1.8s ease-in-out infinite`,
                    animationDelay: `${index * 0.15}s`,
                    filter: 'blur(0.3px)',
                    transform: `scale(${1 + Math.sin((progress / 10) + index) * 0.2})`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Styles d'animation spectaculaires et créatifs */}
      <style>{`
        @keyframes wave-pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.8) translateY(0);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) translateY(-4px);
          }
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.7;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }
        
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes particle-float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(10px) translateX(-10px);
          }
        }
      `}</style>
    </div>
  );
};

