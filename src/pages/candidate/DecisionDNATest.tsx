import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '../../context/AuthContext';
import { MicroScenario, DecisionDNAResponse } from '../../types';
import { extractDecisionDNA, calculateCompatibility } from '@/lib/decisionDNA';
import { generateFirstScenario, generateNextScenario } from '@/lib/openai';
import { saveDecisionDNAResponses, saveCandidateDecisionDNA, createApplication, getJobOfferById } from '@/lib/supabase';
import { Loader2, CheckCircle, Sparkles, Brain, ArrowRight, Zap } from 'lucide-react';

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

    // Attendre un peu pour l'animation
    await new Promise(resolve => setTimeout(resolve, 400));

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
      setCurrentScenarioIndex(currentScenarioIndex + 1);
      setCurrentContext({
        ...newContext,
        ...nextScenario.context_state,
      });
      setSelectedOptionId(null);
      setScenarioTransition(false);
      setGeneratingScenarios(false);
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
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 rounded-full p-6 border border-primary/20">
              <Brain className="w-12 h-12 text-primary animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-3 max-w-md">
            <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              Génération du scénario personnalisé...
            </h3>
            <p className="text-sm text-muted-foreground">
              L'IA crée une situation unique basée sur vos décisions précédentes
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Analyse du contexte...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (completed) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto mt-8 animate-fade-in">
          <Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-background to-primary/5">
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-500/30 rounded-full blur-2xl animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full p-4 shadow-lg">
                    <CheckCircle className="w-16 h-16 text-white animate-scale-in" />
                  </div>
                </div>
                <div className="space-y-3 animate-slide-in-from-bottom-4">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Test terminé !
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Votre profil décisionnel a été enregistré avec succès.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Votre candidature a été soumise et sera analysée par l'entreprise.
                  </p>
                </div>
                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground animate-fade-in delay-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Redirection en cours...</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
      <div className="max-w-4xl mx-auto mt-6 mb-8">
        {/* Header avec animation */}
        <div className={`mb-6 animate-slide-in-from-top-4 ${scenarioTransition ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-300`}>
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-3xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Decision DNA
                </CardTitle>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Répondez aux questions suivantes. Il n'y a pas de bonne ou mauvaise réponse.
                Chaque décision modifie le contexte des questions suivantes de manière unique.
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Question {currentScenarioIndex + 1} sur {totalScenarios}
                  </span>
                  <span className="font-semibold text-primary">{Math.round(progress)}%</span>
                </div>
                <Progress 
                  value={progress} 
                  className="h-3 bg-muted/50"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scénario principal avec animation */}
        <div className={`animate-fade-in ${scenarioTransition ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'} transition-all duration-500`}>
          <Card className="border-2 border-border shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="pt-8 pb-8">
              {/* Question */}
              <div className="mb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                    <span className="text-xl font-bold text-primary">{currentScenarioIndex + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold leading-relaxed text-foreground mb-3">
                      {currentScenario.decision_prompt}
                    </h3>
                    <Alert className="bg-primary/5 border-primary/20">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <AlertDescription className="text-sm">
                        <strong>Contexte dynamique :</strong> Cette situation évolue selon vos décisions précédentes.
                        Choisissez l'option qui correspond le mieux à votre approche professionnelle.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>

              {/* Options avec animations */}
              <div className="space-y-4 mb-6">
                {currentScenario.options.map((option, index) => {
                  const isSelected = selectedOptionId === option.id;
                  return (
                    <div
                      key={option.id}
                      className={`animate-slide-in-from-bottom-2 delay-${index * 100}`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        className={`
                          w-full justify-start text-left h-auto py-6 px-6 
                          transition-all duration-300 transform
                          ${isSelected 
                            ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg scale-105 border-primary' 
                            : 'hover:bg-primary/10 hover:border-primary hover:shadow-md hover:scale-[1.02] border-2'
                          }
                          ${submitting || generatingScenarios ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        onClick={() => handleOptionSelect(option.id)}
                        disabled={submitting || generatingScenarios || !!selectedOptionId}
                      >
                        <div className="flex items-start gap-4 w-full">
                          <div className={`
                            flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg
                            ${isSelected 
                              ? 'bg-primary-foreground/20 text-primary-foreground' 
                              : 'bg-primary/10 text-primary'
                            }
                            transition-all duration-300
                          `}>
                            {option.id}
                          </div>
                          <span className="flex-1 text-base leading-relaxed font-medium">
                            {option.label}
                          </span>
                          {isSelected && (
                            <ArrowRight className="w-5 h-5 flex-shrink-0 animate-slide-in-from-right-4" />
                          )}
                        </div>
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Indicateur de génération */}
              {generatingScenarios && (
                <div className="flex items-center justify-center gap-3 py-6 animate-fade-in">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse"></div>
                    <Loader2 className="w-6 h-6 animate-spin text-primary relative" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Génération du prochain scénario...</p>
                    <p className="text-xs text-muted-foreground mt-1">Analyse de votre décision en cours</p>
                  </div>
                </div>
              )}

              {/* Temps recommandé */}
              {currentScenario.time_limit && !generatingScenarios && !selectedOptionId && (
                <div className="text-center pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <span>⏱️</span>
                    <span>Temps recommandé : {currentScenario.time_limit} secondes</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Styles d'animation */}
      <style>{`
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
        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-in-from-top-4 {
          animation: slide-in-from-top-4 0.7s ease-out;
        }
        .animate-slide-in-from-bottom-2 {
          animation: slide-in-from-bottom-2 0.5s ease-out;
          animation-fill-mode: both;
        }
        .animate-slide-in-from-bottom-4 {
          animation: slide-in-from-bottom-4 0.7s ease-out;
        }
        .animate-slide-in-from-right-4 {
          animation: slide-in-from-right-4 0.4s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        .delay-100 {
          animation-delay: 100ms;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
        .delay-500 {
          animation-delay: 500ms;
        }
      `}</style>
    </Layout>
  );
};

