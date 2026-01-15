// Types pour le système d'agent ChatBox

export interface AgentContext {
  userId: string;
  userRole: 'candidate' | 'company';
  sessionId: string;
  candidateId?: string;
  companyId?: string;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
  execute: (params: any, context: AgentContext) => Promise<any>;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export interface ToolResponse {
  tool_call_id: string;
  role: 'tool';
  content: string; // JSON string du résultat
}

export interface RAGDocument {
  id: string;
  type: 'job_offer' | 'user_profile' | 'application' | 'message' | 'favorite' | 'decision_dna' | 'company';
  content: string;
  metadata: Record<string, any>;
  timestamp: Date;
  relevanceScore?: number;
}

export interface UserPreference {
  preference_type: string;
  preference_value: any;
  confidence_score: number;
  learned_from: 'explicit' | 'implicit' | 'behavior';
}

export interface BehaviorPattern {
  pattern_type: 'search_pattern' | 'application_pattern' | 'message_pattern' | 'favorite_pattern';
  pattern_data: Record<string, any>;
  frequency: number;
  last_observed: Date;
}

export interface ChatboxMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  rag_context?: RAGDocument[];
  tools_called?: string[];
}
