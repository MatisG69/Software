// Système RAG : Indexation des données pour contexte enrichi
import { RAGDocument } from './types';
import {
  getJobOffers,
  getCandidateProfile,
  getCompanyProfile,
  getCandidateApplications,
  getFavoriteJobs,
  getCandidateDecisionDNA,
} from '@/lib/supabase';
import { AgentContext } from './types';

// Indexer les offres d'emploi
export const indexJobOffers = async (filters?: any): Promise<RAGDocument[]> => {
  try {
    const jobs = await getJobOffers(filters);
    return jobs.map(job => ({
      id: `job_${job.id}`,
      type: 'job_offer' as const,
      content: `
        Offre: ${job.title}
        Entreprise: ${job.company?.name || 'Entreprise anonyme'}
        Localisation: ${job.location}
        Type: ${job.type}
        Catégorie: ${job.category}
        Description: ${job.description}
        ${job.requirements ? `Compétences requises: ${job.requirements.join(', ')}` : ''}
        ${job.salary ? `Salaire: ${job.salary.min}-${job.salary.max} ${job.salary.currency}` : ''}
        ${job.missions ? `Missions: ${job.missions}` : ''}
        ${job.benefits ? `Avantages: ${job.benefits}` : ''}
      `.trim(),
      metadata: {
        jobId: job.id,
        title: job.title,
        companyId: job.companyId,
        companyName: job.company?.name,
        location: job.location,
        type: job.type,
        category: job.category,
        createdAt: job.createdAt,
      },
      timestamp: new Date(job.createdAt || Date.now()),
    }));
  } catch (error) {
    console.error('Error indexing job offers:', error);
    return [];
  }
};

// Indexer le profil utilisateur
export const indexUserProfile = async (context: AgentContext): Promise<RAGDocument[]> => {
  try {
    if (context.userRole === 'candidate' && context.candidateId) {
      const profile = await getCandidateProfile(context.candidateId);
      if (!profile) return [];

      return [{
        id: `profile_${context.candidateId}`,
        type: 'user_profile' as const,
        content: `
          Profil candidat
          Compétences: ${profile.skills?.join(', ') || 'Non spécifiées'}
          Expérience: ${profile.experience || 'Non spécifiée'}
          Formation: ${profile.education || 'Non spécifiée'}
          Localisation: ${profile.location || 'Non spécifiée'}
          Bio: ${profile.bio || 'Non spécifiée'}
          Statut vérification: ${profile.verificationStatus}
          Certifié: ${profile.certified ? 'Oui' : 'Non'}
        `.trim(),
        metadata: {
          userId: context.candidateId,
          email: profile.email,
          skills: profile.skills,
          location: profile.location,
          certified: profile.certified,
          verificationStatus: profile.verificationStatus,
        },
        timestamp: new Date(),
      }];
    } else if (context.userRole === 'company' && context.companyId) {
      const profile = await getCompanyProfile(context.companyId);
      if (!profile) return [];

      return [{
        id: `company_${context.companyId}`,
        type: 'company' as const,
        content: `
          Entreprise: ${profile.name}
          Description: ${profile.description || 'Non spécifiée'}
          Site web: ${profile.website || 'Non spécifié'}
          Industrie: ${profile.industry || 'Non spécifiée'}
          Taille: ${profile.size || 'Non spécifiée'}
        `.trim(),
        metadata: {
          companyId: context.companyId,
          name: profile.name,
          industry: profile.industry,
          size: profile.size,
        },
        timestamp: new Date(),
      }];
    }
    return [];
  } catch (error) {
    console.error('Error indexing user profile:', error);
    return [];
  }
};

// Indexer les candidatures
export const indexApplications = async (context: AgentContext): Promise<RAGDocument[]> => {
  try {
    if (context.userRole === 'candidate' && context.candidateId) {
      const applications = await getCandidateApplications(context.candidateId);
      return applications.map((app: any) => ({
        id: `app_${app.id}`,
        type: 'application' as const,
        content: `
          Candidature pour: ${app.job_offers?.title || 'Offre supprimée'}
          Entreprise: ${app.job_offers?.companies?.name || 'Entreprise anonyme'}
          Statut: ${app.status}
          Date: ${new Date(app.created_at).toLocaleDateString('fr-FR')}
        `.trim(),
        metadata: {
          applicationId: app.id,
          jobId: app.job_offer_id,
          jobTitle: app.job_offers?.title,
          companyName: app.job_offers?.companies?.name,
          status: app.status,
          createdAt: app.created_at,
        },
        timestamp: new Date(app.created_at),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error indexing applications:', error);
    return [];
  }
};

// Indexer les favoris
export const indexFavorites = async (context: AgentContext): Promise<RAGDocument[]> => {
  try {
    if (context.userRole === 'candidate' && context.candidateId) {
      const favorites = await getFavoriteJobs(context.candidateId);
      return favorites.map(job => ({
        id: `fav_${job.id}`,
        type: 'favorite' as const,
        content: `
          Offre favorite: ${job.title}
          Entreprise: ${job.company?.name || 'Entreprise anonyme'}
          Localisation: ${job.location}
        `.trim(),
        metadata: {
          jobId: job.id,
          title: job.title,
          companyName: job.company?.name,
          location: job.location,
        },
        timestamp: new Date(),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error indexing favorites:', error);
    return [];
  }
};

// Indexer le Decision DNA
export const indexDecisionDNA = async (context: AgentContext, applicationId?: string): Promise<RAGDocument[]> => {
  try {
    if (context.userRole === 'candidate' && applicationId) {
      const decisionDNA = await getCandidateDecisionDNA(applicationId);
      if (!decisionDNA) return [];

      const dna = decisionDNA.decisionDNA;
      return [{
        id: `dna_${applicationId}`,
        type: 'decision_dna' as const,
        content: `
          Decision DNA pour candidature ${applicationId}:
          Tolérance au risque: ${(dna.risk_tolerance * 100).toFixed(0)}%
          Vitesse de décision: ${(dna.decision_speed * 100).toFixed(0)}%
          Cohérence: ${(dna.consistency * 100).toFixed(0)}%
          Adaptabilité: ${(dna.adaptability * 100).toFixed(0)}%
          Pensée long terme: ${(dna.long_term_thinking * 100).toFixed(0)}%
          Priorisation: ${(dna.prioritization * 100).toFixed(0)}%
          Réaction au stress: ${(dna.stress_reaction * 100).toFixed(0)}%
        `.trim(),
        metadata: {
          applicationId,
          decisionDNA: dna,
        },
        timestamp: new Date(),
      }];
    }
    return [];
  } catch (error) {
    console.error('Error indexing Decision DNA:', error);
    return [];
  }
};

// Indexer toutes les données pertinentes pour un utilisateur
export const indexAllUserData = async (context: AgentContext): Promise<RAGDocument[]> => {
  const documents: RAGDocument[] = [];

  // Indexer le profil
  const profileDocs = await indexUserProfile(context);
  documents.push(...profileDocs);

  // Indexer les candidatures
  const appDocs = await indexApplications(context);
  documents.push(...appDocs);

  // Indexer les favoris
  const favDocs = await indexFavorites(context);
  documents.push(...favDocs);

  return documents;
};

// Indexer les offres d'emploi (données globales)
export const indexAllJobOffers = async (limit: number = 100): Promise<RAGDocument[]> => {
  return await indexJobOffers();
};
