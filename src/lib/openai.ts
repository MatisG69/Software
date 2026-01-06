import { MicroScenario, DecisionOption } from '../types';

// Utiliser le proxy pour éviter les problèmes CORS
// En dev: utiliser le proxy Vite qui redirige vers Anthropic
// En prod: utiliser Supabase Edge Function (recommandé)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const isDev = import.meta.env.DEV;
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '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';

// En développement: utiliser directement avec header spécial (le proxy Vite peut avoir des problèmes CORS)
// En production: utiliser Supabase Edge Function si disponible
// Fallback: appel direct avec header spécial (non recommandé)
const ANTHROPIC_PROXY_URL = isDev
  ? 'https://api.anthropic.com/v1/messages' // Direct en dev avec header spécial (plus fiable que le proxy)
  : SUPABASE_URL 
    ? `${SUPABASE_URL}/functions/v1/anthropic-proxy` // Supabase Edge Function en production
    : 'https://api.anthropic.com/v1/messages'; // Fallback direct (nécessite header spécial)

interface ScenarioGenerationContext {
  previousResponses: Array<{
    scenario_order: number;
    selected_option_id: string;
    context_state_before: Record<string, any>;
  }>;
  currentContext: Record<string, any>;
  jobCategory?: string;
  scenarioOrder: number;
  totalScenarios: number;
}

/**
 * Génère un micro-scénario unique via Claude (Anthropic)
 * L'IA ne fait QUE générer le scénario, pas d'évaluation ni de scoring
 */
export const generateMicroScenarioWithGPT = async (
  context: ScenarioGenerationContext
): Promise<MicroScenario | null> => {
  try {
    // Construire le prompt pour Claude
    const contextDescription = Object.entries(context.currentContext)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    const previousDecisionsSummary = context.previousResponses
      .slice(-3) // Dernières 3 décisions pour contexte
      .map((r) => `Décision ${r.scenario_order}: choix ${r.selected_option_id}`)
      .join('; ');

    const systemPrompt = `Tu es un générateur de micro-scénarios de décision pour un système de recrutement anonyme.

RÔLE STRICT : Tu génères UNIQUEMENT des situations de décision courtes et contextuelles. Tu ne juges pas, tu ne scores pas, tu ne classes pas, tu ne donnes pas de "bonne réponse".

RÈGLES ABSOLUES :
1. Crée un scénario professionnel court (2-3 phrases max), adapté au contexte du poste
2. Propose EXACTEMENT 2 options (A et B) avec des compromis implicites différents
3. Chaque option doit avoir un tradeoff_vector avec des valeurs entre -1 et 1 pour :
   - risk_tolerance : -1 (très prudent) à +1 (très risqué)
   - decision_speed : -1 (lent) à +1 (rapide)
   - consistency : -1 (incohérent) à +1 (très cohérent)
   - adaptability : -1 (rigide) à +1 (très adaptable)
   - long_term_thinking : -1 (court terme) à +1 (long terme)
4. Le scénario DOIT évoluer selon le contexte actuel et les décisions précédentes
5. Aucune "bonne réponse" - chaque option a des avantages et inconvénients
6. Les scénarios doivent être uniques et non répétables
7. Le contexte évolue dynamiquement : introduis de nouvelles contraintes ou opportunités basées sur les choix précédents

EXEMPLES DE COMPROMIS :
- Option rapide mais risquée : decision_speed: 0.7, risk_tolerance: 0.6, consistency: -0.3
- Option prudente mais lente : decision_speed: -0.5, risk_tolerance: -0.6, consistency: 0.5
- Option adaptable mais moins cohérente : adaptability: 0.7, consistency: -0.4, risk_tolerance: 0.3

Format de réponse JSON strict (OBLIGATOIRE) :
{
  "decision_prompt": "Question courte et contextuelle (2-3 phrases max)",
  "options": [
    {
      "id": "A",
      "label": "Option A avec compromis clair",
      "tradeoff_vector": {
        "risk_tolerance": 0.3,
        "decision_speed": 0.5,
        "consistency": -0.2,
        "adaptability": 0.4,
        "long_term_thinking": -0.3
      }
    },
    {
      "id": "B",
      "label": "Option B avec compromis différent",
      "tradeoff_vector": {
        "risk_tolerance": -0.4,
        "decision_speed": -0.3,
        "consistency": 0.6,
        "adaptability": -0.2,
        "long_term_thinking": 0.7
      }
    }
  ],
  "context_evolution": {
    "nouvelle_variable": "valeur qui évolue selon le choix"
  }
}`;

    const userPrompt = `Génère le micro-scénario ${context.scenarioOrder + 1}/${context.totalScenarios}.

CONTEXTE ACTUEL :
${contextDescription || 'Aucun contexte initial - début du test'}

${previousDecisionsSummary ? `DÉCISIONS RÉCENTES (influencent le contexte) :\n${previousDecisionsSummary}` : 'Première décision du test'}

${context.jobCategory ? `CATÉGORIE DU POSTE : ${context.jobCategory}` : ''}

INSTRUCTIONS :
1. Crée un scénario professionnel adapté à la catégorie du poste
2. Le scénario doit être influencé par les décisions précédentes (si elles existent)
3. Introduis de nouvelles contraintes ou opportunités basées sur l'évolution du contexte
4. Les deux options doivent avoir des compromis clairs mais opposés
5. Le contexte doit évoluer : ajoute des variables qui changeront selon le choix fait

IMPORTANT : Le scénario doit être unique et impossible à prévoir sans connaître les décisions précédentes.`;

    // Construire le prompt complet pour Claude (system + user)
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}\n\nIMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide, sans texte supplémentaire avant ou après.`;

    const requestBody = {
      model: 'claude-3-sonnet-20240229', // Modèle Claude standard (plus compatible)
      max_tokens: 1024,
      temperature: 0.9, // Créativité élevée pour varier les scénarios
      messages: [
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
    };

    // Utiliser le proxy Supabase si disponible, sinon essayer directement
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // En dev: utiliser directement avec header spécial (plus fiable)
    // En prod avec Supabase: le proxy gère les headers
    // En prod sans Supabase: utiliser directement avec header spécial
    if (isDev || !SUPABASE_URL) {
      // Appel direct - nécessite le header spécial pour CORS
      headers['x-api-key'] = ANTHROPIC_API_KEY;
      headers['anthropic-version'] = '2023-06-01';
      // Header requis pour les requêtes CORS directes depuis le navigateur
      // ATTENTION: En dev c'est OK, mais en prod il faudrait utiliser Supabase Edge Function
      headers['anthropic-dangerous-direct-browser-access'] = 'true';
    }

    const response = await fetch(ANTHROPIC_PROXY_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', errorData);
      
      // Si le modèle n'est pas disponible, essayer avec claude-3-sonnet en fallback
      if (errorData.includes('model_not_found') || errorData.includes('does not exist') || errorData.includes('invalid_model') || errorData.includes('not_found_error')) {
        console.warn('Modèle claude-3-sonnet non disponible, tentative avec claude-3-haiku-20240307...');
        return await generateMicroScenarioWithClaudeFallback(context);
      }
      
      return null;
    }

    const data = await response.json();
    // Claude retourne le contenu dans data.content[0].text
    const responseText = data.content?.[0]?.text || '';
    
    // Extraire le JSON de la réponse (Claude peut ajouter du texte autour)
    let content;
    try {
      // Essayer de parser directement
      content = JSON.parse(responseText);
    } catch (e) {
      // Si échec, essayer d'extraire le JSON avec regex
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = JSON.parse(jsonMatch[0]);
      } else {
        console.error('Impossible d\'extraire le JSON de la réponse Claude:', responseText);
        return null;
      }
    }

    // Valider et structurer la réponse
    if (!content.decision_prompt || !content.options || !Array.isArray(content.options) || content.options.length !== 2) {
      console.error('Invalid response format from Claude:', content);
      return null;
    }

    // Construire le scénario avec validation et normalisation
    const options: DecisionOption[] = content.options.map((opt: any, index: number) => {
      const tradeoff = opt.tradeoff_vector || {};
      return {
        id: opt.id || (index === 0 ? 'A' : 'B'),
        label: opt.label || `Option ${opt.id || (index === 0 ? 'A' : 'B')}`,
        tradeoff_vector: {
          risk_tolerance: Math.max(-1, Math.min(1, tradeoff.risk_tolerance || 0)),
          decision_speed: Math.max(-1, Math.min(1, tradeoff.decision_speed || 0)),
          consistency: Math.max(-1, Math.min(1, tradeoff.consistency || 0)),
          adaptability: Math.max(-1, Math.min(1, tradeoff.adaptability || 0)),
          long_term_thinking: Math.max(-1, Math.min(1, tradeoff.long_term_thinking || 0)),
        },
      };
    });

    // Évoluer le contexte
    const evolvedContext = {
      ...context.currentContext,
      ...(content.context_evolution || {}),
      scenario_order: context.scenarioOrder,
    };

    return {
      scenario_order: context.scenarioOrder,
      context_state: evolvedContext,
      decision_prompt: content.decision_prompt,
      options,
      time_limit: 60, // 60 secondes par défaut
    };
  } catch (error) {
    console.error('Error generating scenario with Claude:', error);
    return null;
  }
};

/**
 * Fallback : génère un scénario avec claude-3-opus si claude-3-5-sonnet n'est pas disponible
 */
const generateMicroScenarioWithClaudeFallback = async (
  context: ScenarioGenerationContext
): Promise<MicroScenario | null> => {
  try {
    const contextDescription = Object.entries(context.currentContext)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    const previousDecisionsSummary = context.previousResponses
      .slice(-3)
      .map((r) => `Décision ${r.scenario_order}: choix ${r.selected_option_id}`)
      .join('; ');

    const systemPrompt = `Tu es un générateur de micro-scénarios de décision pour un système de recrutement anonyme.

RÔLE STRICT : Tu génères UNIQUEMENT des situations de décision courtes et contextuelles. Tu ne juges pas, tu ne scores pas, tu ne classes pas, tu ne donnes pas de "bonne réponse".

RÈGLES ABSOLUES :
1. Crée un scénario professionnel court (2-3 phrases max), adapté au contexte du poste
2. Propose EXACTEMENT 2 options (A et B) avec des compromis implicites différents
3. Chaque option doit avoir un tradeoff_vector avec des valeurs entre -1 et 1 pour :
   - risk_tolerance : -1 (très prudent) à +1 (très risqué)
   - decision_speed : -1 (lent) à +1 (rapide)
   - consistency : -1 (incohérent) à +1 (très cohérent)
   - adaptability : -1 (rigide) à +1 (très adaptable)
   - long_term_thinking : -1 (court terme) à +1 (long terme)
4. Le scénario DOIT évoluer selon le contexte actuel et les décisions précédentes
5. Aucune "bonne réponse" - chaque option a des avantages et inconvénients
6. Les scénarios doivent être uniques et non répétables
7. Le contexte évolue dynamiquement : introduis de nouvelles contraintes ou opportunités basées sur les choix précédents

Format de réponse JSON strict (OBLIGATOIRE) :
{
  "decision_prompt": "Question courte et contextuelle (2-3 phrases max)",
  "options": [
    {
      "id": "A",
      "label": "Option A avec compromis clair",
      "tradeoff_vector": {
        "risk_tolerance": 0.3,
        "decision_speed": 0.5,
        "consistency": -0.2,
        "adaptability": 0.4,
        "long_term_thinking": -0.3
      }
    },
    {
      "id": "B",
      "label": "Option B avec compromis différent",
      "tradeoff_vector": {
        "risk_tolerance": -0.4,
        "decision_speed": -0.3,
        "consistency": 0.6,
        "adaptability": -0.2,
        "long_term_thinking": 0.7
      }
    }
  ],
  "context_evolution": {
    "nouvelle_variable": "valeur qui évolue selon le choix"
  }
}`;

    const userPrompt = `Génère le micro-scénario ${context.scenarioOrder + 1}/${context.totalScenarios}.

CONTEXTE ACTUEL :
${contextDescription || 'Aucun contexte initial - début du test'}

${previousDecisionsSummary ? `DÉCISIONS RÉCENTES (influencent le contexte) :\n${previousDecisionsSummary}` : 'Première décision du test'}

${context.jobCategory ? `CATÉGORIE DU POSTE : ${context.jobCategory}` : ''}

INSTRUCTIONS :
1. Crée un scénario professionnel adapté à la catégorie du poste
2. Le scénario doit être influencé par les décisions précédentes (si elles existent)
3. Introduis de nouvelles contraintes ou opportunités basées sur l'évolution du contexte
4. Les deux options doivent avoir des compromis clairs mais opposés
5. Le contexte doit évoluer : ajoute des variables qui changeront selon le choix fait

IMPORTANT : Le scénario doit être unique et impossible à prévoir sans connaître les décisions précédentes.`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}\n\nIMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide, sans texte supplémentaire avant ou après.`;

    const requestBody = {
      model: 'claude-3-haiku-20240307', // Fallback vers claude-3-haiku (plus léger et disponible)
      max_tokens: 1024,
      temperature: 0.9,
      messages: [
        {
          role: 'user',
          content: fullPrompt,
        },
      ],
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Même logique que pour la fonction principale
    if (isDev || !SUPABASE_URL) {
      headers['x-api-key'] = ANTHROPIC_API_KEY;
      headers['anthropic-version'] = '2023-06-01';
      headers['anthropic-dangerous-direct-browser-access'] = 'true';
    }

    const response = await fetch(ANTHROPIC_PROXY_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error (fallback):', errorData);
      return null;
    }

    const data = await response.json();
    const responseText = data.content?.[0]?.text || '';
    
    let content;
    try {
      content = JSON.parse(responseText);
    } catch (e) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = JSON.parse(jsonMatch[0]);
      } else {
        console.error('Impossible d\'extraire le JSON de la réponse Claude (fallback):', responseText);
        return null;
      }
    }

    if (!content.decision_prompt || !content.options || !Array.isArray(content.options) || content.options.length !== 2) {
      console.error('Invalid response format from Claude (fallback):', content);
      return null;
    }

    const options: DecisionOption[] = content.options.map((opt: any, index: number) => {
      const tradeoff = opt.tradeoff_vector || {};
      return {
        id: opt.id || (index === 0 ? 'A' : 'B'),
        label: opt.label || `Option ${opt.id || (index === 0 ? 'A' : 'B')}`,
        tradeoff_vector: {
          risk_tolerance: Math.max(-1, Math.min(1, tradeoff.risk_tolerance || 0)),
          decision_speed: Math.max(-1, Math.min(1, tradeoff.decision_speed || 0)),
          consistency: Math.max(-1, Math.min(1, tradeoff.consistency || 0)),
          adaptability: Math.max(-1, Math.min(1, tradeoff.adaptability || 0)),
          long_term_thinking: Math.max(-1, Math.min(1, tradeoff.long_term_thinking || 0)),
        },
      };
    });

    const evolvedContext = {
      ...context.currentContext,
      ...(content.context_evolution || {}),
      scenario_order: context.scenarioOrder,
    };

    return {
      scenario_order: context.scenarioOrder,
      context_state: evolvedContext,
      decision_prompt: content.decision_prompt,
      options,
      time_limit: 60,
    };
  } catch (error) {
    console.error('Error generating scenario with Claude (fallback):', error);
    return null;
  }
};

/**
 * Génère le premier scénario d'une séquence
 * Les scénarios suivants seront générés dynamiquement après chaque réponse
 */
export const generateFirstScenario = async (
  initialContext: Record<string, any> = {},
  jobCategory?: string,
  totalScenarios: number = 20
): Promise<MicroScenario | null> => {
  return await generateMicroScenarioWithGPT({
    previousResponses: [],
    currentContext: initialContext,
    jobCategory,
    scenarioOrder: 0,
    totalScenarios,
  });
};

/**
 * Génère le scénario suivant basé sur les réponses précédentes
 * Le contexte évolue dynamiquement selon les choix du candidat
 */
export const generateNextScenario = async (
  previousResponses: Array<{
    scenario_order: number;
    selected_option_id: string;
    context_state_before: Record<string, any>;
    context_state_after: Record<string, any>;
  }>,
  currentContext: Record<string, any>,
  jobCategory?: string,
  scenarioOrder: number = 0,
  totalScenarios: number = 20
): Promise<MicroScenario | null> => {
  return await generateMicroScenarioWithGPT({
    previousResponses: previousResponses.map(r => ({
      scenario_order: r.scenario_order,
      selected_option_id: r.selected_option_id,
      context_state_before: r.context_state_before,
    })),
    currentContext,
    jobCategory,
    scenarioOrder,
    totalScenarios,
  });
};

/**
 * Génère une séquence complète de scénarios avec Claude (pour pré-génération optionnelle)
 * Chaque scénario évolue dynamiquement selon les réponses précédentes
 */
export const generateDynamicScenarioSequence = async (
  totalScenarios: number = 20,
  initialContext: Record<string, any> = {},
  jobCategory?: string,
  onProgress?: (current: number, total: number) => void
): Promise<MicroScenario[]> => {
  const scenarios: MicroScenario[] = [];
  let currentContext = { ...initialContext };
  const previousResponses: Array<{
    scenario_order: number;
    selected_option_id: string;
    context_state_before: Record<string, any>;
  }> = [];

  for (let i = 0; i < totalScenarios; i++) {
    onProgress?.(i + 1, totalScenarios);

    const scenario = await generateMicroScenarioWithGPT({
      previousResponses,
      currentContext,
      jobCategory,
      scenarioOrder: i,
      totalScenarios,
    });

    if (!scenario) {
      console.error(`Failed to generate scenario ${i + 1}`);
      // Continuer avec un scénario de fallback si nécessaire
      continue;
    }

    scenarios.push(scenario);
    
    // Mettre à jour le contexte pour le prochain scénario
    currentContext = { ...scenario.context_state };
  }

  return scenarios;
};

