import { MicroScenario, DecisionOption, TradeoffVector, DecisionDNAResponse, DecisionDNA, DecisionProfileTarget } from '../types';

// ============================================
// GÉNÉRATION DE MICRO-SCÉNARIOS STANDARDS
// ============================================

const standardScenarios: Array<{
  context: Record<string, any>;
  prompt: string;
  options: Array<{ label: string; tradeoff: TradeoffVector }>;
}> = [
  {
    context: { budget: 1000, deadline: 'tight', team_size: 3 },
    prompt: 'Votre équipe a un budget limité et un délai serré. Vous devez choisir :',
    options: [
      {
        label: 'A) Réduire la portée pour respecter le budget et le délai',
        tradeoff: { risk_tolerance: -0.3, decision_speed: 0.5, consistency: 0.2, adaptability: -0.4 },
      },
      {
        label: 'B) Négocier plus de budget pour maintenir la qualité',
        tradeoff: { risk_tolerance: 0.4, decision_speed: -0.3, consistency: 0.5, adaptability: 0.3 },
      },
    ],
  },
  {
    context: { project_status: 'behind_schedule', quality_issues: true },
    prompt: 'Le projet prend du retard et des problèmes de qualité apparaissent. Vous :',
    options: [
      {
        label: 'A) Accélérer le rythme pour rattraper le retard',
        tradeoff: { risk_tolerance: 0.6, decision_speed: 0.8, consistency: -0.5, adaptability: 0.4 },
      },
      {
        label: 'B) Prendre le temps de corriger les problèmes avant de continuer',
        tradeoff: { risk_tolerance: -0.4, decision_speed: -0.6, consistency: 0.7, long_term_thinking: 0.6 },
      },
    ],
  },
  {
    context: { client_request: 'urgent_change', current_plan: 'solid' },
    prompt: 'Un client demande un changement urgent qui remet en question votre plan actuel. Vous :',
    options: [
      {
        label: 'A) Adapter rapidement le plan pour répondre à la demande',
        tradeoff: { adaptability: 0.7, decision_speed: 0.6, consistency: -0.5, risk_tolerance: 0.3 },
      },
      {
        label: 'B) Analyser l\'impact avant de modifier le plan',
        tradeoff: { adaptability: -0.3, decision_speed: -0.5, consistency: 0.6, long_term_thinking: 0.7 },
      },
    ],
  },
  {
    context: { opportunity: 'new_market', resources: 'limited' },
    prompt: 'Une opportunité de marché apparaît mais vos ressources sont limitées. Vous :',
    options: [
      {
        label: 'A) Réallouer les ressources pour saisir l\'opportunité',
        tradeoff: { risk_tolerance: 0.7, adaptability: 0.6, decision_speed: 0.5, consistency: -0.4 },
      },
      {
        label: 'B) Maintenir le cap actuel et évaluer plus tard',
        tradeoff: { risk_tolerance: -0.5, adaptability: -0.3, decision_speed: -0.4, consistency: 0.7 },
      },
    ],
  },
  {
    context: { team_conflict: true, deadline: 'approaching' },
    prompt: 'Un conflit d\'équipe émerge alors qu\'une échéance approche. Vous :',
    options: [
      {
        label: 'A) Résoudre le conflit immédiatement même si cela retarde le travail',
        tradeoff: { decision_speed: -0.4, consistency: 0.5, long_term_thinking: 0.6, adaptability: 0.3 },
      },
      {
        label: 'B) Prioriser le travail et gérer le conflit après',
        tradeoff: { decision_speed: 0.6, consistency: 0.3, long_term_thinking: -0.4, adaptability: -0.2 },
      },
    ],
  },
  {
    context: { data: 'incomplete', decision_needed: 'now' },
    prompt: 'Vous devez prendre une décision importante mais les données sont incomplètes. Vous :',
    options: [
      {
        label: 'A) Prendre la décision avec les informations disponibles',
        tradeoff: { risk_tolerance: 0.5, decision_speed: 0.7, consistency: -0.3, adaptability: 0.4 },
      },
      {
        label: 'B) Attendre d\'avoir plus d\'informations',
        tradeoff: { risk_tolerance: -0.6, decision_speed: -0.7, consistency: 0.5, long_term_thinking: 0.6 },
      },
    ],
  },
  {
    context: { success_rate: 'high', innovation_opportunity: true },
    prompt: 'Votre approche actuelle fonctionne bien, mais une innovation prometteuse apparaît. Vous :',
    options: [
      {
        label: 'A) Tester l\'innovation malgré le risque',
        tradeoff: { risk_tolerance: 0.8, adaptability: 0.7, decision_speed: 0.4, consistency: -0.6 },
      },
      {
        label: 'B) Continuer avec l\'approche éprouvée',
        tradeoff: { risk_tolerance: -0.5, adaptability: -0.4, decision_speed: 0.3, consistency: 0.8 },
      },
    ],
  },
  {
    context: { stakeholder_pressure: 'high', quality_standards: 'strict' },
    prompt: 'Les parties prenantes font pression pour livrer rapidement, mais les standards de qualité sont stricts. Vous :',
    options: [
      {
        label: 'A) Trouver un équilibre en communiquant les contraintes',
        tradeoff: { adaptability: 0.5, consistency: 0.4, long_term_thinking: 0.6, decision_speed: -0.2 },
      },
      {
        label: 'B) Respecter les standards même sous pression',
        tradeoff: { adaptability: -0.3, consistency: 0.8, long_term_thinking: 0.7, decision_speed: -0.5 },
      },
    ],
  },
  {
    context: { previous_failure: true, new_attempt: 'similar' },
    prompt: 'Vous avez échoué sur un projet similaire. Vous devez recommencer. Vous :',
    options: [
      {
        label: 'A) Changer complètement d\'approche',
        tradeoff: { adaptability: 0.8, risk_tolerance: 0.6, consistency: -0.7, decision_speed: 0.3 },
      },
      {
        label: 'B) Ajuster l\'approche précédente en apprenant des erreurs',
        tradeoff: { adaptability: 0.4, risk_tolerance: -0.3, consistency: 0.6, long_term_thinking: 0.7 },
      },
    ],
  },
  {
    context: { team_expertise: 'mixed', task_complexity: 'high' },
    prompt: 'Une tâche complexe arrive et votre équipe a des niveaux d\'expertise variés. Vous :',
    options: [
      {
        label: 'A) Distribuer les tâches selon les compétences actuelles',
        tradeoff: { decision_speed: 0.5, consistency: 0.4, adaptability: -0.3, long_term_thinking: 0.2 },
      },
      {
        label: 'B) Former l\'équipe avant de commencer',
        tradeoff: { decision_speed: -0.6, consistency: 0.6, adaptability: 0.3, long_term_thinking: 0.8 },
      },
    ],
  },
];

// Générer un scénario standard avec contexte évolutif
export const generateStandardScenario = (
  order: number,
  previousContext: Record<string, any> = {}
): MicroScenario => {
  // Sélectionner un scénario de base (rotation pour varier)
  const baseScenario = standardScenarios[order % standardScenarios.length];
  
  // Évoluer le contexte basé sur les réponses précédentes
  const evolvedContext = { ...baseScenario.context, ...previousContext };
  
  // Modifier légèrement les options basées sur le contexte évolué
  const options: DecisionOption[] = baseScenario.options.map((opt, idx) => ({
    id: String.fromCharCode(65 + idx), // A, B, etc.
    label: opt.label,
    tradeoff_vector: { ...opt.tradeoff },
  }));

  return {
    scenario_order: order,
    context_state: evolvedContext,
    decision_prompt: baseScenario.prompt,
    options,
    time_limit: 60, // 60 secondes par défaut
  };
};

// Générer une séquence de scénarios (15-30)
export const generateScenarioSequence = (
  count: number = 20,
  initialContext: Record<string, any> = {}
): MicroScenario[] => {
  const scenarios: MicroScenario[] = [];
  let currentContext = { ...initialContext };

  for (let i = 0; i < count; i++) {
    const scenario = generateStandardScenario(i, currentContext);
    scenarios.push(scenario);
    
    // Simuler une évolution du contexte (sera remplacé par les vraies réponses)
    // Pour l'instant, on fait évoluer le contexte de manière aléatoire
    if (i > 0 && Math.random() > 0.5) {
      currentContext = {
        ...currentContext,
        [`iteration_${i}`]: Math.random() > 0.5 ? 'positive' : 'challenging',
      };
    }
  }

  return scenarios;
};

// ============================================
// EXTRACTION DU DECISION DNA
// ============================================

export const extractDecisionDNA = (responses: DecisionDNAResponse[], scenarios: MicroScenario[]): DecisionDNA => {
  if (responses.length === 0) {
    return {
      risk_tolerance: 0.5,
      decision_speed: 0.5,
      consistency: 0.5,
      adaptability: 0.5,
      long_term_thinking: 0.5,
      prioritization: 0.5,
      stress_reaction: 0.5,
      rigidity: 0.5,
    };
  }

  // Trouver les options sélectionnées et leurs tradeoff vectors
  const selectedTradeoffs: TradeoffVector[] = [];
  const responseTimes: number[] = [];

  responses.forEach((response) => {
    const scenario = scenarios.find((s) => s.scenario_order === response.scenario_order);
    if (scenario) {
      const selectedOption = scenario.options.find((opt) => opt.id === response.selected_option_id);
      if (selectedOption) {
        selectedTradeoffs.push(selectedOption.tradeoff_vector);
      }
    }
    if (response.response_time_ms) {
      responseTimes.push(response.response_time_ms);
    }
  });

  // Calculer les dimensions du Decision DNA
  const calculateDimension = (key: string): number => {
    const values = selectedTradeoffs
      .map((t) => t[key as keyof TradeoffVector])
      .filter((v) => v !== undefined) as number[];
    
    if (values.length === 0) return 0.5;
    
    // Normaliser de [-1, 1] à [0, 1]
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return (avg + 1) / 2;
  };

  // Calculer la cohérence (variance des décisions similaires)
  const calculateConsistency = (): number => {
    if (selectedTradeoffs.length < 2) return 0.5;
    
    // Grouper par dimension et calculer la variance
    const dimensions = ['risk_tolerance', 'decision_speed', 'adaptability', 'long_term_thinking'];
    const variances: number[] = [];
    
    dimensions.forEach((dim) => {
      const values = selectedTradeoffs
        .map((t) => t[dim as keyof TradeoffVector])
        .filter((v) => v !== undefined) as number[];
      
      if (values.length > 1) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        variances.push(variance);
      }
    });
    
    // Cohérence inverse de la variance moyenne (normalisée)
    const avgVariance = variances.length > 0 ? variances.reduce((a, b) => a + b, 0) / variances.length : 0.5;
    return Math.max(0, Math.min(1, 1 - avgVariance / 2)); // Normaliser à [0, 1]
  };

  // Calculer la vitesse de décision (basée sur les temps de réponse)
  const calculateDecisionSpeed = (): number => {
    if (responseTimes.length === 0) return 0.5;
    
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    // Plus rapide = plus élevé (normaliser : < 5s = 1, > 30s = 0)
    const normalized = Math.max(0, Math.min(1, 1 - (avgTime / 1000 - 5) / 25));
    return normalized;
  };

  // Calculer la réaction au stress (variation des temps de réponse sous pression)
  const calculateStressReaction = (): number => {
    if (responseTimes.length < 3) return 0.5;
    
    // Plus la variance est élevée, plus la réaction au stress est variable
    const mean = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const variance = responseTimes.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / responseTimes.length;
    const stdDev = Math.sqrt(variance);
    
    // Normaliser (faible variance = bonne gestion du stress)
    return Math.max(0, Math.min(1, 1 - stdDev / (mean * 0.5)));
  };

  return {
    risk_tolerance: calculateDimension('risk_tolerance'),
    decision_speed: calculateDecisionSpeed(),
    consistency: calculateConsistency(),
    adaptability: calculateDimension('adaptability'),
    long_term_thinking: calculateDimension('long_term_thinking'),
    prioritization: calculateDimension('prioritization') || 0.5,
    stress_reaction: calculateStressReaction(),
    rigidity: 1 - calculateDimension('adaptability'), // Inverse de l'adaptabilité
  };
};

// ============================================
// CALCUL DE COMPATIBILITÉ
// ============================================

export const calculateCompatibility = (
  candidateDNA: DecisionDNA,
  targetProfile: DecisionProfileTarget
): number => {
  if (!targetProfile) return 0.5;

  const dimensionMapping: Record<string, keyof DecisionDNA> = {
    rapidité: 'decision_speed',
    prudence: 'risk_tolerance', // Inverse
    optimisation_long_terme: 'long_term_thinking',
    tolérance_au_risque: 'risk_tolerance',
  };

  const targetLevels: Record<string, number> = {
    faible: 0.33,
    moyen: 0.5,
    élevé: 0.67,
  };

  let totalScore = 0;
  let count = 0;

  Object.entries(targetProfile).forEach(([key, level]) => {
    if (level && dimensionMapping[key]) {
      const dimension = dimensionMapping[key];
      const candidateValue = candidateDNA[dimension];
      const targetValue = targetLevels[level];
      
      // Pour "prudence", inverser (prudence élevée = risk_tolerance faible)
      let adjustedCandidateValue = candidateValue;
      if (key === 'prudence') {
        adjustedCandidateValue = 1 - candidateValue;
      }
      
      // Calculer la distance (plus proche = meilleur score)
      const distance = Math.abs(adjustedCandidateValue - targetValue);
      const score = 1 - distance; // Score de 0 à 1
      
      totalScore += score;
      count++;
    }
  });

  return count > 0 ? totalScore / count : 0.5;
};

