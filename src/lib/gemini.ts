// API Generative AI (Gemini) pour le ChatBox
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_NANO_BANANA_API_KEY || 'AIzaSyBEj1CLI1WZ5M5ts7roLXT8F0THYSQ0Nqk';
// Modèles Gemini disponibles - essayer différents noms de modèles
// Prioriser les modèles récents détectés automatiquement
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
];
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
}

// Convertir les messages au format Gemini
const convertMessagesToGemini = (messages: ChatMessage[]): { contents: any[], systemInstruction?: string } => {
  const geminiContents: any[] = [];
  let systemInstruction = '';
  
  for (const msg of messages) {
    if (msg.role === 'system') {
      systemInstruction = msg.content;
      continue;
    }
    
    if (msg.role === 'user') {
      const parts: any[] = [{ text: msg.content }];
      geminiContents.push({
        role: 'user',
        parts,
      });
    } else if (msg.role === 'assistant') {
      const parts: any[] = [];
      
      // Ajouter le texte si présent
      if (msg.content) {
        parts.push({ text: msg.content });
      }
      
      // Ajouter les tool calls si présents
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        for (const toolCall of msg.tool_calls) {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            parts.push({
              functionCall: {
                name: toolCall.function.name,
                args: args,
              },
            });
          } catch (e) {
            console.error('Error parsing tool arguments:', e);
          }
        }
      }
      
      if (parts.length > 0) {
        geminiContents.push({
          role: 'model',
          parts,
        });
      }
    } else if (msg.role === 'tool' && msg.tool_call_id) {
      // Les réponses de tools sont envoyées comme messages user avec functionResponse
      try {
        const response = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
        geminiContents.push({
          role: 'user',
          parts: [{
            functionResponse: {
              name: msg.tool_call_id, // Dans Gemini, le tool_call_id est le nom de la fonction
              response: response,
            },
          }],
        });
      } catch (e) {
        // Si le parsing échoue, essayer avec le contenu brut
        geminiContents.push({
          role: 'user',
          parts: [{
            functionResponse: {
              name: msg.tool_call_id,
              response: { result: msg.content },
            },
          }],
        });
      }
    }
  }
  
  return { contents: geminiContents, systemInstruction: systemInstruction || undefined };
};

// Fonction pour lister les modèles disponibles
export const listAvailableModels = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${GEMINI_API_BASE}/models?key=${GEMINI_API_KEY}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Erreur lors de la récupération des modèles:', errorData);
      return [];
    }
    const data = await response.json();
    const models = data.models?.map((m: any) => m.name?.replace('models/', '') || m.name) || [];
    console.log('✅ Modèles Gemini disponibles:', models);
    return models;
  } catch (error) {
    console.error('Error listing models:', error);
    return [];
  }
};

// Fonction simple sans function calling
export const sendMessageToGemini = async (
  messages: ChatMessage[],
  systemPrompt?: string
): Promise<string> => {
  // Essayer chaque modèle jusqu'à ce qu'un fonctionne
  let lastError: Error | null = null;
  
  for (const model of GEMINI_MODELS) {
    try {
      const { contents, systemInstruction } = convertMessagesToGemini(messages);
      const finalSystemPrompt = systemPrompt || systemInstruction;

      const requestBody: any = {
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      };

      if (finalSystemPrompt) {
        requestBody.systemInstruction = {
          parts: [{ text: finalSystemPrompt }],
        };
      }

      // Nettoyer le nom du modèle (enlever "models/" si présent)
      const cleanModel = model.startsWith('models/') ? model : `models/${model}`;

      const response = await fetch(`${GEMINI_API_BASE}/${cleanModel}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || `Gemini API error: ${response.status}`;
        
        // Si le modèle n'est pas trouvé, essayer le suivant
        if (response.status === 404 || errorMsg.includes('not found') || errorMsg.includes('is not supported')) {
          console.warn(`Modèle ${model} non disponible, essai suivant...`);
          lastError = new Error(errorMsg);
          continue;
        }
        
        lastError = new Error(errorMsg);
        continue;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        lastError = new Error('No response from Gemini');
        continue;
      }

      console.log(`✅ Modèle Gemini utilisé: ${model}`);
      return text;
    } catch (error: any) {
      console.error(`Erreur avec le modèle ${model}:`, error);
      lastError = error;
      continue;
    }
  }
  
  // Si aucun modèle n'a fonctionné, essayer de lister les modèles disponibles
  console.warn('Aucun modèle ne fonctionne, tentative de lister les modèles disponibles...');
  const availableModels = await listAvailableModels();
  if (availableModels.length > 0) {
    console.log('Modèles disponibles détectés:', availableModels);
    
    // Filtrer pour ne garder que les modèles Gemini de génération de texte (pas embedding, image, etc.)
    const textGenerationModels = availableModels.filter(model => 
      model.startsWith('gemini-') && 
      !model.includes('embedding') && 
      !model.includes('imagen') && 
      !model.includes('veo') &&
      !model.includes('aqa') &&
      !model.includes('robotics') &&
      !model.includes('computer-use') &&
      !model.includes('deep-research')
    );
    
    // Prioriser les modèles récents
    const prioritizedModels = [
      ...textGenerationModels.filter(m => m.includes('2.5') || m.includes('2.0')),
      ...textGenerationModels.filter(m => m.includes('latest')),
      ...textGenerationModels.filter(m => m.includes('flash')),
      ...textGenerationModels.filter(m => m.includes('pro')),
      ...textGenerationModels,
    ];
    
    // Essayer avec les modèles filtrés et priorisés
    for (const model of prioritizedModels.slice(0, 5)) { // Essayer les 5 premiers
      try {
        const { contents, systemInstruction } = convertMessagesToGemini(messages);
        const finalSystemPrompt = systemPrompt || systemInstruction;

        const requestBody: any = {
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        };

        if (finalSystemPrompt) {
          requestBody.systemInstruction = {
            parts: [{ text: finalSystemPrompt }],
          };
        }

        const cleanModel = model.startsWith('models/') ? model : `models/${model}`;
        
        const response = await fetch(`${GEMINI_API_BASE}/${cleanModel}:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            console.log(`✅ Modèle Gemini utilisé (détecté automatiquement): ${model}`);
            return text;
          }
        }
      } catch (error) {
        console.warn(`Erreur avec le modèle ${model}:`, error);
        continue;
      }
    }
  }
  
  // Si aucun modèle n'a fonctionné
  console.error('Aucun modèle Gemini disponible. Erreur:', lastError);
  throw lastError || new Error('Aucun modèle Gemini disponible. Vérifiez votre clé API et que l\'API Generative AI est activée dans Google Cloud Console.');
};

// Fonction avec support function calling
export const sendMessageWithTools = async (
  messages: ChatMessage[],
  tools: Array<{
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required: string[];
    };
  }>,
  systemPrompt?: string
): Promise<{
  content?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}> => {
  // Essayer chaque modèle jusqu'à ce qu'un fonctionne
  let lastError: Error | null = null;
  
  for (const model of GEMINI_MODELS) {
    try {
      const { contents, systemInstruction } = convertMessagesToGemini(messages);
      const finalSystemPrompt = systemPrompt || systemInstruction;

      // Convertir les tools au format Gemini
      const functionDeclarations = tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        parameters: {
          type: 'object',
          properties: tool.parameters.properties,
          required: tool.parameters.required || [],
        },
      }));

      const requestBody: any = {
        contents,
        tools: [{
          functionDeclarations,
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      };

      if (finalSystemPrompt) {
        requestBody.systemInstruction = {
          parts: [{ text: finalSystemPrompt }],
        };
      }

      // Nettoyer le nom du modèle (enlever "models/" si présent)
      const cleanModel = model.startsWith('models/') ? model : `models/${model}`;

      const response = await fetch(`${GEMINI_API_BASE}/${cleanModel}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || `Gemini API error: ${response.status}`;
        
        // Si le modèle n'est pas trouvé, essayer le suivant
        if (response.status === 404 || errorMsg.includes('not found') || errorMsg.includes('is not supported')) {
          console.warn(`Modèle ${model} non disponible pour function calling, essai suivant...`);
          lastError = new Error(errorMsg);
          continue;
        }
        
        lastError = new Error(errorMsg);
        continue;
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      
      if (!candidate) {
        lastError = new Error('No response from Gemini');
        continue;
      }

      const parts = candidate.content?.parts || [];
      let content = '';
      const toolCalls: Array<{
        id: string;
        type: 'function';
        function: {
          name: string;
          arguments: string;
        };
      }> = [];

      for (const part of parts) {
        if (part.text) {
          content += part.text;
        }
        if (part.functionCall) {
          toolCalls.push({
            id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'function',
            function: {
              name: part.functionCall.name,
              arguments: JSON.stringify(part.functionCall.args || {}),
            },
          });
        }
      }

      console.log(`✅ Modèle Gemini utilisé: ${model}`);
      return {
        content: content || undefined,
        tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
      };
    } catch (error: any) {
      console.error(`Erreur avec le modèle ${model}:`, error);
      lastError = error;
      continue;
    }
  }
  
  // Si aucun modèle n'a fonctionné, essayer de lister les modèles disponibles
  console.warn('Aucun modèle ne fonctionne avec function calling, tentative de lister les modèles disponibles...');
  const availableModels = await listAvailableModels();
  if (availableModels.length > 0) {
    console.log('Modèles disponibles détectés:', availableModels);
    
    // Filtrer pour ne garder que les modèles Gemini de génération de texte (pas embedding, image, etc.)
    const textGenerationModels = availableModels.filter(model => 
      model.startsWith('gemini-') && 
      !model.includes('embedding') && 
      !model.includes('imagen') && 
      !model.includes('veo') &&
      !model.includes('aqa') &&
      !model.includes('robotics') &&
      !model.includes('computer-use') &&
      !model.includes('deep-research')
    );
    
    // Prioriser les modèles récents
    const prioritizedModels = [
      ...textGenerationModels.filter(m => m.includes('2.5') || m.includes('2.0')),
      ...textGenerationModels.filter(m => m.includes('latest')),
      ...textGenerationModels.filter(m => m.includes('flash')),
      ...textGenerationModels.filter(m => m.includes('pro')),
      ...textGenerationModels,
    ];
    
    // Essayer avec les modèles filtrés et priorisés
    for (const model of prioritizedModels.slice(0, 5)) { // Essayer les 5 premiers
      try {
        const { contents, systemInstruction } = convertMessagesToGemini(messages);
        const finalSystemPrompt = systemPrompt || systemInstruction;

        const functionDeclarations = tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          parameters: {
            type: 'object',
            properties: tool.parameters.properties,
            required: tool.parameters.required || [],
          },
        }));

        const requestBody: any = {
          contents,
          tools: [{
            functionDeclarations,
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        };

        if (finalSystemPrompt) {
          requestBody.systemInstruction = {
            parts: [{ text: finalSystemPrompt }],
          };
        }

        const cleanModel = model.startsWith('models/') ? model : `models/${model}`;
        
        const response = await fetch(`${GEMINI_API_BASE}/${cleanModel}:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();
          const candidate = data.candidates?.[0];
          if (candidate) {
            const parts = candidate.content?.parts || [];
            let content = '';
            const toolCalls: Array<{
              id: string;
              type: 'function';
              function: {
                name: string;
                arguments: string;
              };
            }> = [];

            for (const part of parts) {
              if (part.text) {
                content += part.text;
              }
              if (part.functionCall) {
                toolCalls.push({
                  id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  type: 'function',
                  function: {
                    name: part.functionCall.name,
                    arguments: JSON.stringify(part.functionCall.args || {}),
                  },
                });
              }
            }

            console.log(`✅ Modèle Gemini utilisé (détecté automatiquement): ${model}`);
            return {
              content: content || undefined,
              tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
            };
          }
        }
      } catch (error) {
        console.warn(`Erreur avec le modèle ${model}:`, error);
        continue;
      }
    }
  }
  
  // Si aucun modèle n'a fonctionné
  console.error('Aucun modèle Gemini disponible avec function calling. Erreur:', lastError);
  throw lastError || new Error('Aucun modèle Gemini disponible avec function calling. Vérifiez votre clé API et que l\'API Generative AI est activée dans Google Cloud Console.');
};
