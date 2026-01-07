import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '../../context/AuthContext';
import { MicroScenario, DecisionDNAResponse } from '../../types';
import { extractDecisionDNA, calculateCompatibility } from '@/lib/decisionDNA';
import { generateFirstScenario, generateNextScenario } from '@/lib/openai';
import { saveDecisionDNAResponses, saveCandidateDecisionDNA, createApplication, getJobOfferById } from '@/lib/supabase';
import { Loader2, CheckCircle, Sparkles, Brain, Clock, ChevronRight } from 'lucide-react';

export const DecisionDNATest = () => {
  const { id } = useParams<{ id: string }>();
  const { candidate } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState<MicroScenario[]>([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [responses, setResponses] = useState<DecisionDNAResponse[]>([]);
  const [currentContext, setCurrentContext] = useState<Record<string, any>>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [jobOffer, setJobOffer] = useState<any>(null);
  const [generatingScenarios, setGeneratingScenarios] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [scenarioTransition, setScenarioTransition] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const loadJobAndGenerateScenarios = async () => {
      if (!id || !candidate?.id) {
        navigate('/candidate/jobs');
        return;
      }

      try {
        const job = await getJobOfferById(id);
        if (!job) {
          navigate('/candidate/jobs');
          return;
        }

        setJobOffer(job);

        // Générer le premier scénario avec GPT-4
        setGeneratingScenarios(true);
        const scenarioCount = 20; // 15-30 scénarios
        
        const firstScenario = await generateFirstScenario(
          { 
            job_category: job.category, 
            job_title: job.title,
            initial_context: 'candidature_anonyme'
          },
          job.category,
          scenarioCount
        );

        if (!firstScenario) {
          alert('Erreur lors de la génération du premier scénario. Veuillez réessayer.');
          navigate('/candidate/jobs');
          return;
        }

        // Initialiser avec le premier scénario
        // Les scénarios suivants seront générés dynamiquement après chaque réponse
        setScenarios([firstScenario]);
        setCurrentContext(firstScenario.context_state);
        setGeneratingScenarios(false);
        setLoading(false);
      } catch (error) {
        console.error('Error loading job or generating scenarios:', error);
        navigate('/candidate/jobs');
      }
    };

    loadJobAndGenerateScenarios();
  }, [id, candidate?.id, navigate]);

  const handleOptionSelect = async (optionId: string) => {
    if (!startTime) {
      setStartTime(Date.now());
    }

    const currentScenario = scenarios[currentScenarioIndex];
    if (!currentScenario) return;

    // Animation de sélection
    setSelectedOptionId(optionId);
    setScenarioTransition(true);
    setIsTransitioning(true);

    // Animation ralentie : attendre plus longtemps pour une transition fluide
    await new Promise(resolve => setTimeout(resolve, 800));

    const responseTime = startTime ? Date.now() - startTime : undefined;
    
    // Créer la réponse
    const response: DecisionDNAResponse = {
      scenario_order: currentScenario.scenario_order,
      selected_option_id: optionId,
      context_state_before: { ...currentContext },
      context_state_after: { ...currentContext, last_choice: optionId },
      response_time_ms: responseTime,
    };

    // Mettre à jour le contexte pour le prochain scénario
    const selectedOption = currentScenario.options.find(opt => opt.id === optionId);
    const newContext = {
      ...currentContext,
      ...currentScenario.context_state,
      last_choice: optionId,
      last_tradeoff: selectedOption?.tradeoff_vector,
    };

    const updatedResponses = [...responses, response];
    setResponses(updatedResponses);
    setCurrentContext(newContext);
    setStartTime(null);

    // Vérifier si on a atteint le nombre total de scénarios
    const totalScenarios = 20;
    if (currentScenarioIndex + 1 >= totalScenarios) {
      // Tous les scénarios sont terminés
      handleComplete();
      return;
    }

    // Générer le scénario suivant dynamiquement
    setGeneratingScenarios(true);
    try {
      const nextScenario = await generateNextScenario(
        updatedResponses,
        newContext,
        jobOffer?.category,
        currentScenarioIndex + 1,
        totalScenarios
      );

      if (!nextScenario) {
        alert('Erreur lors de la génération du scénario suivant. Le test sera terminé.');
        handleComplete();
        return;
      }

      // Ajouter le nouveau scénario et passer au suivant
      const updatedScenarios = [...scenarios, nextScenario];
      setScenarios(updatedScenarios);
      
      // Animation de transition avant de changer de scénario
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setCurrentScenarioIndex(currentScenarioIndex + 1);
      setCurrentContext({
        ...newContext,
        ...nextScenario.context_state,
      });
      setSelectedOptionId(null);
      setScenarioTransition(false);
      setGeneratingScenarios(false);
      
      // Animation d'entrée du nouveau scénario
      await new Promise(resolve => setTimeout(resolve, 200));
      setIsTransitioning(false);
    } catch (error) {
      console.error('Error generating next scenario:', error);
      alert('Erreur lors de la génération du scénario suivant. Le test sera terminé.');
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!id || !candidate?.id || !jobOffer) return;

    setSubmitting(true);

    try {
      // Créer la candidature d'abord
      const application = await createApplication(id, candidate.id);
      if (!application) {
        alert('Erreur lors de la création de la candidature');
        setSubmitting(false);
        return;
      }

      // Sauvegarder les réponses (avec les contextes évolutifs)
      await saveDecisionDNAResponses(application.id, responses);

      // Extraire le Decision DNA
      const decisionDNA = extractDecisionDNA(responses, scenarios);

      // Calculer le score de compatibilité si un profil cible existe
      let compatibilityScore: number | undefined;
      if (jobOffer.decisionProfileTarget) {
        compatibilityScore = calculateCompatibility(decisionDNA, jobOffer.decisionProfileTarget);
      }

      // Sauvegarder le Decision DNA
      await saveCandidateDecisionDNA(application.id, decisionDNA, compatibilityScore);

      setCompleted(true);

      // Rediriger après 2 secondes
      setTimeout(() => {
        navigate('/candidate/applications');
      }, 2000);
    } catch (error) {
      console.error('Error completing Decision DNA test:', error);
      alert('Erreur lors de la soumission du test');
      setSubmitting(false);
    }
  };

  if (loading || generatingScenarios) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center relative overflow-hidden">
          {/* Background avec effets visuels */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center space-y-8 max-w-lg mx-auto px-4 animate-fade-in">
            {/* Icône principale avec effet glassmorphism */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 rounded-3xl blur-2xl scale-150 animate-pulse-slow"></div>
              <div className="relative bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl rounded-3xl p-8 border border-primary/20 shadow-2xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
                  <Brain className="w-16 h-16 text-primary relative z-10 animate-float" />
                </div>
              </div>
            </div>

            {/* Contenu textuel */}
            <div className="text-center space-y-4 animate-slide-up">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent flex items-center justify-center gap-3">
                  <Sparkles className="w-6 h-6 text-primary animate-sparkle" />
                  Génération du scénario personnalisé
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Notre IA analyse votre profil et crée une situation unique<br />
                  adaptée à vos décisions précédentes
                </p>
              </div>

              {/* Indicateur de chargement moderne */}
              <div className="flex flex-col items-center gap-3 pt-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <span>Analyse du contexte en cours...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (completed) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center relative overflow-hidden">
          {/* Background avec effets visuels */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto px-4 animate-fade-in">
            <Card className="border-2 border-green-500/30 shadow-2xl bg-gradient-to-br from-card/95 via-card/90 to-card/95 backdrop-blur-xl overflow-hidden">
              {/* Effet de brillance animé */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
              
              <CardContent className="pt-16 pb-16 relative">
                <div className="text-center space-y-8">
                  {/* Icône de succès avec animation */}
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-green-500/40 rounded-full blur-3xl scale-150 animate-pulse-slow"></div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-full blur-xl"></div>
                      <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full p-6 shadow-2xl border-4 border-white/20">
                        <CheckCircle className="w-20 h-20 text-white animate-scale-bounce" />
                      </div>
                    </div>
                  </div>

                  {/* Contenu textuel */}
                  <div className="space-y-4 animate-slide-up">
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-primary to-green-600 bg-clip-text text-transparent animate-gradient">
                      Test terminé avec succès !
                    </h2>
                    <div className="space-y-2">
                      <p className="text-lg text-foreground/90 font-medium">
                        Votre profil décisionnel a été enregistré
                      </p>
                      <p className="text-muted-foreground">
                        Votre candidature a été soumise et sera analysée par l'entreprise.
                      </p>
                    </div>
                  </div>

                  {/* Indicateur de redirection */}
                  <div className="pt-6 animate-fade-in delay-500">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-full border border-primary/20">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-sm font-medium text-foreground">Redirection en cours...</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const currentScenario = scenarios[currentScenarioIndex];
  const totalScenarios = 20;
  const progress = ((currentScenarioIndex + 1) / totalScenarios) * 100;

  if (!currentScenario) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background avec effets visuels subtils */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-float-slow delay-2000"></div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Indicateur de progression en haut (style onboarding photo) */}
          <div className="w-full px-6 py-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                {/* Points de progression */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalScenarios }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-500 ${
                        index < currentScenarioIndex + 1
                          ? 'bg-primary scale-125'
                          : index === currentScenarioIndex
                          ? 'bg-primary/50 scale-110'
                          : 'bg-muted/30'
                      }`}
                    />
                  ))}
                </div>
                {/* Texte de progression */}
                <div className="text-sm font-semibold text-muted-foreground">
                  {currentScenarioIndex + 1}/{totalScenarios} {Math.round(progress)}%
                </div>
              </div>
              {/* Barre de progression */}
              <div className="relative h-1 bg-muted/20 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Contenu principal centré (style onboarding photo) */}
          <div className="flex-1 flex items-center justify-center px-4 py-8">
            <div className={`w-full max-w-3xl transition-all duration-700 ease-in-out ${
              isTransitioning || scenarioTransition 
                ? 'opacity-0 translate-y-8 scale-95' 
                : 'opacity-100 translate-y-0 scale-100'
            }`}>
              <Card className="border border-border/50 bg-card shadow-2xl overflow-hidden">
                {/* Effet de brillance subtil */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/3 to-transparent -translate-x-full animate-shimmer-slow"></div>
                
                <CardHeader className="pb-6 relative">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg"></div>
                      <div className="relative p-2.5 bg-primary/10 rounded-xl border border-primary/20">
                        <Brain className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-foreground">
                        Decision DNA
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        Profil décisionnel comportemental
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-4">
                    Répondez aux questions suivantes. Il n'y a pas de bonne ou mauvaise réponse.
                    Chaque décision modifie le contexte des questions suivantes de manière unique.
                  </p>
                </CardHeader>

                <CardContent className="pt-6 pb-8 px-8 relative">
                  {/* Question avec design moderne */}
                  <div className="mb-8">
                    <div className="flex items-start gap-5 mb-6">
                      <div className="flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg"></div>
                        <div className="relative w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <span className="text-lg font-bold text-primary">{currentScenarioIndex + 1}</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <h3 className="text-2xl font-bold leading-tight text-foreground">
                          {currentScenario.decision_prompt}
                        </h3>
                        <Alert className="bg-primary/5 border border-primary/20 rounded-lg">
                          <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                          <AlertDescription className="text-xs leading-relaxed">
                            <strong className="text-foreground">Contexte dynamique :</strong> Cette situation évolue selon vos décisions précédentes.
                            Choisissez l'option qui correspond le mieux à votre approche professionnelle.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </div>

                  {/* Options avec design premium */}
                  <div className="space-y-3 mb-6">
                    {currentScenario.options.map((option, index) => {
                      const isSelected = selectedOptionId === option.id;
                      return (
                        <div
                          key={option.id}
                          className="animate-slide-in-from-bottom"
                          style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                        >
                          <button
                            onClick={() => !submitting && !generatingScenarios && !selectedOptionId && handleOptionSelect(option.id)}
                            disabled={submitting || generatingScenarios || !!selectedOptionId}
                            className={`
                              w-full group relative overflow-hidden
                              text-left h-auto py-5 px-5 rounded-lg
                              transition-all duration-500 transform
                              ${isSelected 
                                ? 'bg-primary text-primary-foreground shadow-lg scale-[1.01] border-2 border-primary' 
                                : 'bg-card hover:bg-primary/5 border-2 border-border hover:border-primary/30 hover:shadow-md'
                              }
                              ${submitting || generatingScenarios ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                          >
                            {/* Effet de brillance au hover */}
                            {!isSelected && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            )}
                            
                            <div className="relative flex items-center gap-4 w-full">
                              {/* Badge de l'option */}
                              <div className={`
                                flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base
                                transition-all duration-300
                                ${isSelected 
                                  ? 'bg-primary-foreground/20 text-primary-foreground' 
                                  : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                                }
                              `}>
                                {option.id}
                              </div>
                              
                              {/* Texte de l'option */}
                              <span className={`
                                flex-1 text-base leading-relaxed font-medium
                                ${isSelected ? 'text-primary-foreground' : 'text-foreground'}
                              `}>
                                {option.label}
                              </span>
                              
                              {/* Icône de sélection */}
                              {isSelected && (
                                <div className="flex-shrink-0 animate-slide-in-from-right">
                                  <ChevronRight className="w-5 h-5 text-primary-foreground" />
                                </div>
                              )}
                              
                              {/* Indicateur hover */}
                              {!isSelected && !submitting && !generatingScenarios && !selectedOptionId && (
                                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ChevronRight className="w-5 h-5 text-primary/50" />
                                </div>
                              )}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Indicateur de génération avec design moderne */}
                  {generatingScenarios && (
                    <div className="flex flex-col items-center justify-center gap-4 py-6 animate-fade-in">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse-slow"></div>
                        <div className="relative w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        </div>
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-sm font-semibold text-foreground flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                          Génération du prochain scénario...
                        </p>
                        <p className="text-xs text-muted-foreground">Analyse de votre décision en cours</p>
                      </div>
                    </div>
                  )}

                  {/* Temps recommandé avec design moderne */}
                  {currentScenario.time_limit && !generatingScenarios && !selectedOptionId && (
                    <div className="text-center pt-4 border-t border-border/50">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          Temps recommandé : <span className="text-foreground font-medium">{currentScenario.time_limit}s</span>
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Styles d'animation modernes */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-up {
          from {
            transform: translateY(1rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slide-in-from-bottom {
          from {
            transform: translateY(0.75rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fade-out-up {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(-2rem) scale(0.95);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(2rem) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes slide-in-from-right {
          from {
            transform: translateX(1rem);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes scale-bounce {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(10px) translateX(-10px);
          }
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes shimmer-slow {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        @keyframes sparkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.1);
          }
        }
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.7s ease-out;
        }
        .animate-slide-in-from-bottom {
          animation: slide-in-from-bottom 0.5s ease-out;
        }
        .animate-fade-out-up {
          animation: fade-out-up 0.7s ease-in-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.7s ease-in-out;
        }
        .animate-slide-in-from-right {
          animation: slide-in-from-right 0.4s ease-out;
        }
        .animate-scale-bounce {
          animation: scale-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-shimmer-slow {
          animation: shimmer-slow 4s infinite;
        }
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
        .delay-2000 {
          animation-delay: 2000ms;
        }
      `}</style>
    </Layout>
  );
};

