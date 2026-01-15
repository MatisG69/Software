// Contexte de l'agent ChatBox
import { useAuth } from '@/context/AuthContext';
import { AgentContext } from './types';

let currentContext: AgentContext | null = null;

export const createAgentContext = (userId: string, userRole: 'candidate' | 'company', candidateId?: string, companyId?: string): AgentContext => {
  const sessionId = `session_${userId}_${Date.now()}`;
  
  currentContext = {
    userId,
    userRole,
    sessionId,
    candidateId,
    companyId,
  };
  
  return currentContext;
};

export const getAgentContext = (): AgentContext | null => {
  return currentContext;
};

export const updateAgentContext = (updates: Partial<AgentContext>): void => {
  if (currentContext) {
    currentContext = { ...currentContext, ...updates };
  }
};

export const clearAgentContext = (): void => {
  currentContext = null;
};
