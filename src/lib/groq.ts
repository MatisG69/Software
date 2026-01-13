const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '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';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const sendMessageToGroq = async (
  messages: ChatMessage[],
  model: string = 'llama-3.1-8b-instant'
): Promise<string> => {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.';
  } catch (error: any) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
};
