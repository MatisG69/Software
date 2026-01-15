// Système RAG : Recherche dans les documents indexés
import { RAGDocument } from './types';

// Recherche textuelle simple dans les documents
export const searchRAGDocuments = (
  documents: RAGDocument[],
  query: string,
  options?: {
    limit?: number;
    types?: RAGDocument['type'][];
    metadataFilter?: Record<string, any>;
  }
): RAGDocument[] => {
  const limit = options?.limit || 5;
  const types = options?.types;
  const metadataFilter = options?.metadataFilter;

  // Filtrer par type si spécifié
  let filtered = documents;
  if (types && types.length > 0) {
    filtered = documents.filter(doc => types.includes(doc.type));
  }

  // Filtrer par métadonnées si spécifié
  if (metadataFilter) {
    filtered = filtered.filter(doc => {
      return Object.entries(metadataFilter).every(([key, value]) => {
        return doc.metadata[key] === value;
      });
    });
  }

  // Recherche textuelle simple (peut être améliorée avec embedding)
  const queryLower = query.toLowerCase();
  const scored = filtered.map(doc => {
    const contentLower = doc.content.toLowerCase();
    let score = 0;

    // Score basé sur la présence des mots-clés
    const queryWords = queryLower.split(/\s+/);
    queryWords.forEach(word => {
      if (contentLower.includes(word)) {
        score += 1;
      }
    });

    // Bonus si le titre/description commence par le query
    if (doc.metadata.title && doc.metadata.title.toLowerCase().includes(queryLower)) {
      score += 2;
    }

    // Bonus si le query est dans les métadonnées importantes
    if (doc.metadata.location && doc.metadata.location.toLowerCase().includes(queryLower)) {
      score += 1.5;
    }
    if (doc.metadata.category && doc.metadata.category.toLowerCase().includes(queryLower)) {
      score += 1.5;
    }

    return { ...doc, relevanceScore: score };
  });

  // Trier par score et limiter
  return scored
    .filter(doc => doc.relevanceScore > 0)
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
    .slice(0, limit);
};

// Recherche par type de document
export const searchByType = (
  documents: RAGDocument[],
  type: RAGDocument['type'],
  limit?: number
): RAGDocument[] => {
  return documents
    .filter(doc => doc.type === type)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit || 10);
};

// Recherche dans les métadonnées
export const searchByMetadata = (
  documents: RAGDocument[],
  metadataKey: string,
  metadataValue: any
): RAGDocument[] => {
  return documents.filter(doc => doc.metadata[metadataKey] === metadataValue);
};

// Formater le contexte RAG pour injection dans le prompt
export const formatRAGContext = (documents: RAGDocument[]): string => {
  if (documents.length === 0) {
    return '';
  }

  const sections = documents.map((doc, index) => {
    return `[Document ${index + 1} - Type: ${doc.type}]
${doc.content}
Métadonnées: ${JSON.stringify(doc.metadata, null, 2)}
---`;
  });

  return `
CONTEXTE RAG (Données réelles de la plateforme):
${sections.join('\n\n')}
`;
};
