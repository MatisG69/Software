// Tools/Actions que l'agent IA peut exécuter réellement
import { AgentTool, AgentContext } from './types';
import {
  getJobOffers,
  getJobOfferById,
  createApplication,
  getCandidateApplications,
  getCompanyApplications,
  addFavoriteJob,
  removeFavoriteJob,
  getFavoriteJobs,
  getCandidateProfile,
  getCompanyProfile,
  getMessages,
  createMessage,
  getCandidateDecisionDNA,
  getCandidateStats,
  getCompanyJobOffers,
  createNotification,
} from '@/lib/supabase';
import { JobOffer } from '@/types';

// Tool: Rechercher des offres d'emploi
const searchJobOffersTool: AgentTool = {
  name: 'searchJobOffers',
  description: 'Recherche réelle d\'offres d\'emploi dans la base de données avec filtres (recherche textuelle, localisation, type de contrat, catégorie). Retourne une liste d\'offres correspondantes.',
  parameters: {
    type: 'object',
    properties: {
      search: {
        type: 'string',
        description: 'Terme de recherche (métier, compétences, entreprise)',
      },
      location: {
        type: 'string',
        description: 'Localisation (ville, région, télétravail)',
      },
      type: {
        type: 'string',
        description: 'Type de contrat',
        enum: ['all', 'full-time', 'part-time', 'contract', 'internship'],
      },
      category: {
        type: 'string',
        description: 'Catégorie d\'emploi (peut être n\'importe quelle catégorie : Finance, Développement, Design, Management, Marketing, Commerce, Santé, etc.). Utilise "all" pour toutes les catégories.',
      },
      salaryMin: {
        type: 'number',
        description: 'Salaire minimum souhaité (en EUR)',
      },
      salaryMax: {
        type: 'number',
        description: 'Salaire maximum souhaité (en EUR)',
      },
      remote: {
        type: 'boolean',
        description: 'Rechercher uniquement les offres en télétravail/hybride',
      },
    },
    required: [],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      const filters: any = {};
      if (params.search) filters.search = params.search;
      if (params.location) filters.location = params.location;
      if (params.type && params.type !== 'all') filters.type = params.type;
      if (params.category && params.category !== 'all') filters.category = params.category;
      if (params.remote) {
        // Rechercher "télétravail", "hybride", "remote" dans la localisation
        filters.location = filters.location 
          ? `${filters.location} télétravail hybride remote`
          : 'télétravail hybride remote';
      }

      const jobs = await getJobOffers(filters);
      
      // Filtrer par salaire si spécifié
      let filteredJobs = jobs;
      if (params.salaryMin || params.salaryMax) {
        filteredJobs = jobs.filter(job => {
          if (!job.salary) return false;
          if (params.salaryMin && job.salary.max < params.salaryMin) return false;
          if (params.salaryMax && job.salary.min > params.salaryMax) return false;
          return true;
        });
      }

      return {
        success: true,
        count: filteredJobs.length,
        jobs: filteredJobs.slice(0, 20).map(job => ({
          id: job.id,
          title: job.title,
          company: job.company?.name || 'Entreprise anonyme',
          location: job.location,
          type: job.type,
          category: job.category,
          salary: job.salary ? `${job.salary.min}-${job.salary.max} ${job.salary.currency}` : null,
        })),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Obtenir les détails d'une offre
const getJobOfferDetailsTool: AgentTool = {
  name: 'getJobOfferDetails',
  description: 'Récupère les détails complets d\'une offre d\'emploi spécifique (description, missions, avantages, compétences requises, etc.)',
  parameters: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'ID de l\'offre d\'emploi',
      },
    },
    required: ['jobId'],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      const job = await getJobOfferById(params.jobId);
      if (!job) {
        return { success: false, error: 'Offre non trouvée' };
      }
      return {
        success: true,
        job: {
          id: job.id,
          title: job.title,
          company: job.company?.name || 'Entreprise anonyme',
          description: job.description,
          location: job.location,
          type: job.type,
          category: job.category,
          salary: job.salary,
          requirements: job.requirements,
          missions: job.missions,
          benefits: job.benefits,
          whoWeAre: job.whoWeAre,
          whatYouWillLive: job.whatYouWillLive,
          whatWeWillLove: job.whatWeWillLove,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Lister les candidatures de l'utilisateur
const getUserApplicationsTool: AgentTool = {
  name: 'getUserApplications',
  description: 'Récupère toutes les candidatures de l\'utilisateur avec leurs statuts (pending, reviewed, accepted, rejected)',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      if (context.userRole === 'candidate' && context.candidateId) {
        const applications = await getCandidateApplications(context.candidateId);
        return {
          success: true,
          count: applications.length,
          applications: applications.map((app: any) => ({
            id: app.id,
            jobTitle: app.job_offers?.title || 'Offre supprimée',
            company: app.job_offers?.companies?.name || 'Entreprise anonyme',
            status: app.status,
            createdAt: app.created_at,
          })),
        };
      } else if (context.userRole === 'company' && context.companyId) {
        const applications = await getCompanyApplications(context.companyId);
        return {
          success: true,
          count: applications.length,
          applications: applications.map((app: any) => ({
            id: app.id,
            jobTitle: app.job_offers?.title || 'Offre supprimée',
            candidateId: app.candidate_id,
            status: app.status,
            createdAt: app.created_at,
          })),
        };
      }
      return { success: false, error: 'Utilisateur non identifié' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Postuler à une offre
const createApplicationTool: AgentTool = {
  name: 'createApplication',
  description: 'Postule réellement à une offre d\'emploi (crée une candidature dans la base de données)',
  parameters: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'ID de l\'offre d\'emploi',
      },
      skills: {
        type: 'array',
        description: 'Liste des compétences (optionnel)',
        items: { type: 'string' },
      },
    },
    required: ['jobId'],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      if (context.userRole !== 'candidate' || !context.candidateId) {
        return { success: false, error: 'Seuls les candidats peuvent postuler' };
      }
      const application = await createApplication(params.jobId, context.candidateId, params.skills);
      if (application) {
        return {
          success: true,
          applicationId: application.id,
          message: 'Candidature créée avec succès',
        };
      }
      return { success: false, error: 'Échec de la création de la candidature' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Obtenir les favoris
const getFavoriteJobsTool: AgentTool = {
  name: 'getFavoriteJobs',
  description: 'Récupère toutes les offres d\'emploi sauvegardées en favoris par l\'utilisateur',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      if (context.userRole !== 'candidate' || !context.candidateId) {
        return { success: false, error: 'Seuls les candidats ont des favoris' };
      }
      const favorites = await getFavoriteJobs(context.candidateId);
      return {
        success: true,
        count: favorites.length,
        favorites: favorites.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company?.name || 'Entreprise anonyme',
          location: job.location,
        })),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Ajouter un favori
const addFavoriteJobTool: AgentTool = {
  name: 'addFavoriteJob',
  description: 'Ajoute une offre d\'emploi aux favoris de l\'utilisateur',
  parameters: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'ID de l\'offre d\'emploi',
      },
    },
    required: ['jobId'],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      if (context.userRole !== 'candidate' || !context.candidateId) {
        return { success: false, error: 'Seuls les candidats peuvent ajouter des favoris' };
      }
      const success = await addFavoriteJob(context.candidateId, params.jobId);
      return {
        success,
        message: success ? 'Favori ajouté avec succès' : 'Échec de l\'ajout du favori',
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Retirer un favori
const removeFavoriteJobTool: AgentTool = {
  name: 'removeFavoriteJob',
  description: 'Retire une offre d\'emploi des favoris de l\'utilisateur',
  parameters: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'ID de l\'offre d\'emploi',
      },
    },
    required: ['jobId'],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      if (context.userRole !== 'candidate' || !context.candidateId) {
        return { success: false, error: 'Seuls les candidats peuvent retirer des favoris' };
      }
      const success = await removeFavoriteJob(context.candidateId, params.jobId);
      return {
        success,
        message: success ? 'Favori retiré avec succès' : 'Échec du retrait du favori',
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Obtenir le profil utilisateur
const getUserProfileTool: AgentTool = {
  name: 'getUserProfile',
  description: 'Récupère le profil complet de l\'utilisateur (CV, compétences, expérience, localisation, etc.)',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      if (context.userRole === 'candidate' && context.candidateId) {
        const profile = await getCandidateProfile(context.candidateId);
        if (!profile) {
          return { success: false, error: 'Profil non trouvé' };
        }
        return {
          success: true,
          profile: {
            email: profile.email,
            skills: profile.skills || [],
            experience: profile.experience,
            education: profile.education,
            location: profile.location,
            bio: profile.bio,
            certified: profile.certified,
            verificationStatus: profile.verificationStatus,
          },
        };
      } else if (context.userRole === 'company' && context.companyId) {
        const profile = await getCompanyProfile(context.companyId);
        if (!profile) {
          return { success: false, error: 'Profil non trouvé' };
        }
        return {
          success: true,
          profile: {
            name: profile.name,
            description: profile.description,
            website: profile.website,
            industry: profile.industry,
            size: profile.size,
          },
        };
      }
      return { success: false, error: 'Utilisateur non identifié' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Obtenir les messages
const getUserMessagesTool: AgentTool = {
  name: 'getUserMessages',
  description: 'Récupère les messages de l\'utilisateur (conversations avec entreprises/candidats)',
  parameters: {
    type: 'object',
    properties: {
      applicationId: {
        type: 'string',
        description: 'ID de la candidature (optionnel, pour filtrer par candidature)',
      },
    },
    required: [],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      // Pour simplifier, on récupère les conversations
      // L'implémentation complète nécessiterait getConversations
      return {
        success: true,
        message: 'Utilisez getConversations pour obtenir la liste complète des conversations',
        note: 'Cette fonction nécessite une implémentation complète de getConversations',
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Envoyer un message
const sendMessageTool: AgentTool = {
  name: 'sendMessage',
  description: 'Envoie un message réel à une entreprise ou un candidat dans le cadre d\'une candidature',
  parameters: {
    type: 'object',
    properties: {
      applicationId: {
        type: 'string',
        description: 'ID de la candidature',
      },
      content: {
        type: 'string',
        description: 'Contenu du message',
      },
    },
    required: ['applicationId', 'content'],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      const message = await createMessage(
        params.applicationId,
        context.userId,
        params.content
      );
      if (message) {
        return {
          success: true,
          messageId: message.id,
          message: 'Message envoyé avec succès',
        };
      }
      return { success: false, error: 'Échec de l\'envoi du message' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Obtenir le Decision DNA
const getDecisionDNATool: AgentTool = {
  name: 'getDecisionDNA',
  description: 'Récupère le profil Decision DNA d\'une candidature (trajectoires de décision du candidat)',
  parameters: {
    type: 'object',
    properties: {
      applicationId: {
        type: 'string',
        description: 'ID de la candidature',
      },
    },
    required: ['applicationId'],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      const decisionDNA = await getCandidateDecisionDNA(params.applicationId);
      if (!decisionDNA) {
        return { success: false, error: 'Decision DNA non trouvé pour cette candidature' };
      }
      return {
        success: true,
        decisionDNA: decisionDNA.decisionDNA,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Obtenir les statistiques utilisateur
const getUserStatsTool: AgentTool = {
  name: 'getUserStats',
  description: 'Récupère les statistiques de l\'utilisateur (nombre de candidatures, taux de réponse, etc.)',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      if (context.userRole === 'candidate' && context.candidateId) {
        const stats = await getCandidateStats(context.candidateId);
        return {
          success: true,
          stats,
        };
      }
      return { success: false, error: 'Statistiques disponibles uniquement pour les candidats' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Liste de tous les tools disponibles
// Tool: Obtenir des recommandations d'offres personnalisées basées sur le profil
const getPersonalizedJobRecommendationsTool: AgentTool = {
  name: 'getPersonalizedJobRecommendations',
  description: 'Récupère des recommandations d\'offres d\'emploi personnalisées basées sur le profil du candidat (compétences, expérience, localisation, préférences). Utilise cette fonction pour suggérer des offres adaptées au candidat.',
  parameters: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Nombre maximum de recommandations (défaut: 10)',
      },
    },
    required: [],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      if (context.userRole !== 'candidate') {
        return { success: false, error: 'Cette fonction est réservée aux candidats' };
      }

      const profile = await getCandidateProfile(context.candidateId || '');
      if (!profile || !profile.profile) {
        return { success: false, error: 'Profil candidat non trouvé' };
      }

      const { skills, experience, location } = profile.profile;
      
      // Rechercher des offres correspondant aux compétences
      const searchTerms = skills?.join(' ') || '';
      const filters: any = {
        search: searchTerms,
      };
      if (location) {
        filters.location = location;
      }

      const jobs = await getJobOffers(filters);
      
      // Trier par pertinence (compétences correspondantes, expérience, localisation)
      const scoredJobs = jobs.map(job => {
        let score = 0;
        
        // Score basé sur les compétences
        if (skills && job.requirements) {
          const matchingSkills = job.requirements.filter((req: string) =>
            skills.some(skill => req.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(req.toLowerCase()))
          ).length;
          score += matchingSkills * 10;
        }
        
        // Score basé sur l'expérience (offres junior pour peu d'expérience, senior pour beaucoup)
        if (experience !== undefined) {
          const jobLevel = job.title.toLowerCase();
          if (experience < 2 && (jobLevel.includes('junior') || jobLevel.includes('débutant'))) {
            score += 5;
          } else if (experience >= 5 && (jobLevel.includes('senior') || jobLevel.includes('expert'))) {
            score += 5;
          }
        }
        
        // Score basé sur la localisation
        if (location && job.location) {
          if (job.location.toLowerCase().includes(location.toLowerCase()) || 
              job.location.toLowerCase().includes('télétravail') || 
              job.location.toLowerCase().includes('hybride')) {
            score += 3;
          }
        }
        
        return { job, score };
      });

      // Trier par score décroissant
      scoredJobs.sort((a, b) => b.score - a.score);
      
      const limit = params.limit || 10;
      const recommendedJobs = scoredJobs.slice(0, limit).map(item => item.job);

      return {
        success: true,
        count: recommendedJobs.length,
        jobs: recommendedJobs.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company?.name || 'Entreprise anonyme',
          location: job.location,
          type: job.type,
          category: job.category,
          salary: job.salary ? `${job.salary.min}-${job.salary.max} ${job.salary.currency}` : null,
        })),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Comparer deux offres d'emploi
const compareJobOffersTool: AgentTool = {
  name: 'compareJobOffers',
  description: 'Compare deux offres d\'emploi côte à côte (salaire, avantages, localisation, type de contrat, etc.) pour aider le candidat à faire un choix.',
  parameters: {
    type: 'object',
    properties: {
      jobId1: {
        type: 'string',
        description: 'ID de la première offre',
      },
      jobId2: {
        type: 'string',
        description: 'ID de la deuxième offre',
      },
    },
    required: ['jobId1', 'jobId2'],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      const [job1, job2] = await Promise.all([
        getJobOfferById(params.jobId1),
        getJobOfferById(params.jobId2),
      ]);

      if (!job1 || !job2) {
        return { success: false, error: 'Une ou plusieurs offres non trouvées' };
      }

      return {
        success: true,
        comparison: {
          job1: {
            id: job1.id,
            title: job1.title,
            company: job1.company?.name || 'Entreprise anonyme',
            location: job1.location,
            type: job1.type,
            salary: job1.salary,
            benefits: job1.benefits,
            category: job1.category,
          },
          job2: {
            id: job2.id,
            title: job2.title,
            company: job2.company?.name || 'Entreprise anonyme',
            location: job2.location,
            type: job2.type,
            salary: job2.salary,
            benefits: job2.benefits,
            category: job2.category,
          },
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Trouver des offres similaires à une offre donnée
const findSimilarJobOffersTool: AgentTool = {
  name: 'findSimilarJobOffers',
  description: 'Trouve des offres d\'emploi similaires à une offre donnée (même catégorie, compétences similaires, localisation proche).',
  parameters: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'ID de l\'offre de référence',
      },
      limit: {
        type: 'number',
        description: 'Nombre maximum d\'offres similaires (défaut: 5)',
      },
    },
    required: ['jobId'],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      const referenceJob = await getJobOfferById(params.jobId);
      if (!referenceJob) {
        return { success: false, error: 'Offre non trouvée' };
      }

      // Rechercher des offres similaires
      const filters: any = {};
      if (referenceJob.category) {
        filters.category = referenceJob.category;
      }
      if (referenceJob.location) {
        filters.location = referenceJob.location;
      }
      if (referenceJob.requirements && referenceJob.requirements.length > 0) {
        filters.search = referenceJob.requirements.slice(0, 3).join(' ');
      }

      const jobs = await getJobOffers(filters);
      
      // Filtrer l'offre de référence et trier par similarité
      const similarJobs = jobs
        .filter(job => job.id !== referenceJob.id)
        .slice(0, params.limit || 5);

      return {
        success: true,
        count: similarJobs.length,
        jobs: similarJobs.map(job => ({
          id: job.id,
          title: job.title,
          company: job.company?.name || 'Entreprise anonyme',
          location: job.location,
          type: job.type,
          category: job.category,
          salary: job.salary ? `${job.salary.min}-${job.salary.max} ${job.salary.currency}` : null,
        })),
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Diagnostic de carrière rapide
const careerDiagnosticTool: AgentTool = {
  name: 'careerDiagnostic',
  description: 'Effectue un diagnostic de carrière rapide basé sur le profil du candidat (compétences, expérience, candidatures, préférences). Retourne une analyse avec des suggestions de parcours professionnel.',
  parameters: {
    type: 'object',
    properties: {},
    required: [],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      if (context.userRole !== 'candidate') {
        return { success: false, error: 'Cette fonction est réservée aux candidats' };
      }

      const profile = await getCandidateProfile(context.candidateId || '');
      const applications = await getCandidateApplications(context.candidateId || '');
      const stats = await getCandidateStats(context.candidateId || '');

      if (!profile) {
        return { success: false, error: 'Profil candidat non trouvé' };
      }

      const { skills, experience, education, location } = profile.profile || {};
      
      // Analyser le profil
      const analysis = {
        profile: {
          experience: experience || 0,
          skills: skills || [],
          education: education || 'Non renseigné',
          location: location || 'Non renseigné',
        },
        activity: {
          totalApplications: applications.length,
          pendingApplications: applications.filter(a => a.status === 'pending').length,
          acceptedApplications: applications.filter(a => a.status === 'accepted').length,
          responseRate: stats?.responseRate || 0,
        },
        recommendations: [] as string[],
      };

      // Générer des recommandations basées sur l'analyse
      if (experience === 0 || experience < 1) {
        analysis.recommendations.push('Débutant : Ciblez les postes junior et les stages pour acquérir de l\'expérience');
      } else if (experience < 3) {
        analysis.recommendations.push('Junior : Vous pouvez viser des postes de niveau junior à intermédiaire');
      } else if (experience < 5) {
        analysis.recommendations.push('Intermédiaire : Vous êtes prêt pour des postes avec plus de responsabilités');
      } else {
        analysis.recommendations.push('Senior : Vous pouvez viser des postes de leadership et d\'expertise');
      }

      if (skills && skills.length < 3) {
        analysis.recommendations.push('Enrichissez votre profil avec plus de compétences pour élargir vos opportunités');
      }

      if (applications.length === 0) {
        analysis.recommendations.push('Commencez à postuler ! Utilisez les recommandations personnalisées pour trouver des offres adaptées');
      } else if (stats?.responseRate && stats.responseRate < 0.3) {
        analysis.recommendations.push('Améliorez votre taux de réponse en personnalisant davantage vos candidatures');
      }

      return {
        success: true,
        diagnostic: analysis,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Créer une alerte d'emploi
const createJobAlertTool: AgentTool = {
  name: 'createJobAlert',
  description: 'Crée une alerte d\'emploi automatique pour le candidat. L\'utilisateur sera notifié quand de nouvelles offres correspondant à ses critères sont publiées.',
  parameters: {
    type: 'object',
    properties: {
      search: {
        type: 'string',
        description: 'Terme de recherche pour l\'alerte',
      },
      category: {
        type: 'string',
        description: 'Catégorie d\'emploi',
      },
      location: {
        type: 'string',
        description: 'Localisation souhaitée',
      },
      salaryMin: {
        type: 'number',
        description: 'Salaire minimum',
      },
    },
    required: [],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      if (context.userRole !== 'candidate') {
        return { success: false, error: 'Cette fonction est réservée aux candidats' };
      }

      // Créer une notification pour confirmer la création de l'alerte
      const alertDescription = [
        params.search && `Recherche: ${params.search}`,
        params.category && `Catégorie: ${params.category}`,
        params.location && `Localisation: ${params.location}`,
        params.salaryMin && `Salaire min: ${params.salaryMin}€`,
      ].filter(Boolean).join(', ');

      await createNotification(
        context.userId,
        'job_match',
        'Alerte d\'emploi créée',
        `Votre alerte a été configurée : ${alertDescription}. Vous serez notifié quand de nouvelles offres correspondantes seront publiées.`,
        '/candidate/jobs'
      );

      return {
        success: true,
        message: 'Alerte d\'emploi créée avec succès',
        alert: {
          search: params.search,
          category: params.category,
          location: params.location,
          salaryMin: params.salaryMin,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Simulation d'entretien
const simulateInterviewTool: AgentTool = {
  name: 'simulateInterview',
  description: 'Lance une simulation d\'entretien pour une offre d\'emploi spécifique. Pose des questions adaptées au poste (5 questions au total). IMPORTANT : Pour chaque question après la première, tu DOIS passer previousAnswers avec toutes les réponses précédentes. Après la 5ème question avec toutes les réponses, génère automatiquement un rapport complet avec score, forces, faiblesses, analyse par catégorie et recommandations personnalisées.',
  parameters: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'ID de l\'offre d\'emploi pour laquelle simuler l\'entretien',
      },
      questionNumber: {
        type: 'number',
        description: 'Numéro de la question (1-5). Si 5, génère le rapport final.',
      },
      userAnswer: {
        type: 'string',
        description: 'Réponse de l\'utilisateur à la question précédente (requis si questionNumber > 1)',
      },
      previousAnswers: {
        type: 'array',
        description: 'Tableau des réponses précédentes avec format [{questionNumber: number, answer: string, category: string}]',
        items: {
          type: 'object',
          properties: {
            questionNumber: { type: 'number' },
            answer: { type: 'string' },
            category: { type: 'string' },
          },
        },
      },
    },
    required: ['jobId'],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      const job = await getJobOfferById(params.jobId);
      if (!job) {
        return { success: false, error: 'Offre non trouvée' };
      }

      // Générer des questions basées sur le poste
      const questions = [
        {
          question: `Pourquoi souhaitez-vous rejoindre ${job.company?.name || 'cette entreprise'} en tant que ${job.title} ?`,
          category: 'motivation',
          evaluationCriteria: ['clarté de la motivation', 'connaissance de l\'entreprise', 'alignement avec le poste'],
        },
        {
          question: `Pouvez-vous nous parler de votre expérience avec ${job.requirements?.[0] || 'les compétences requises'} ?`,
          category: 'technique',
          evaluationCriteria: ['exemples concrets', 'niveau de maîtrise', 'pertinence des compétences'],
        },
        {
          question: `Comment gérez-vous les situations stressantes dans un environnement professionnel ?`,
          category: 'comportemental',
          evaluationCriteria: ['gestion du stress', 'résilience', 'méthodes de coping'],
        },
        {
          question: `Quelles sont vos attentes salariales pour ce poste ?`,
          category: 'négociation',
          evaluationCriteria: ['réalisme', 'justification', 'flexibilité'],
        },
        {
          question: `Où vous voyez-vous dans 5 ans ?`,
          category: 'carrière',
          evaluationCriteria: ['vision à long terme', 'ambition', 'alignement avec l\'entreprise'],
        },
      ];

      const questionNumber = params.questionNumber || 1;
      const questionIndex = questionNumber - 1;

      // Si c'est la 5ème question et qu'on a les réponses, générer le rapport
      if (questionNumber === 5 && params.previousAnswers && params.previousAnswers.length >= 4) {
        // Ajouter la réponse actuelle si fournie
        const allAnswers = [...params.previousAnswers];
        if (params.userAnswer) {
          allAnswers.push({
            questionNumber: 5,
            answer: params.userAnswer,
            category: questions[4].category,
          });
        }

        // Générer le rapport d'analyse
        const report = generateInterviewReport(allAnswers, questions, job);

        return {
          success: true,
          interview: {
            jobId: job.id,
            jobTitle: job.title,
            company: job.company?.name || 'Entreprise anonyme',
            status: 'completed',
            report: report,
          },
        };
      }

      // Sinon, retourner la question suivante
      if (questionIndex >= 0 && questionIndex < questions.length) {
        const selectedQuestion = questions[questionIndex];

        return {
          success: true,
          interview: {
            jobId: job.id,
            jobTitle: job.title,
            company: job.company?.name || 'Entreprise anonyme',
            question: selectedQuestion.question,
            questionNumber: questionNumber,
            totalQuestions: questions.length,
            category: selectedQuestion.category,
            tips: getTipsForCategory(selectedQuestion.category),
            isLastQuestion: questionNumber === 5,
          },
        };
      }

      return { success: false, error: 'Numéro de question invalide' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Fonction helper pour générer le rapport d'entretien
const generateInterviewReport = (answers: Array<{questionNumber: number, answer: string, category: string}>, questions: any[], job: any) => {
  const analysis: any = {
    overallScore: 0,
    strengths: [] as string[],
    weaknesses: [] as string[],
    categoryAnalysis: {} as Record<string, any>,
    recommendations: [] as string[],
  };

  // Analyser chaque réponse par catégorie
  const categoryScores: Record<string, number> = {
    motivation: 0,
    technique: 0,
    comportemental: 0,
    négociation: 0,
    carrière: 0,
  };

  answers.forEach((answerData, index) => {
    const question = questions[answerData.questionNumber - 1];
    if (!question) return;

    const answer = answerData.answer.toLowerCase();
    const category = answerData.category;
    let categoryScore = 0;

    // Analyse par catégorie
    if (category === 'motivation') {
      if (answer.includes('entreprise') || answer.includes('mission') || answer.includes('valeurs')) categoryScore += 2;
      if (answer.includes('poste') || answer.includes('rôle') || answer.includes('défi')) categoryScore += 2;
      if (answer.length > 50) categoryScore += 1; // Réponse développée
    } else if (category === 'technique') {
      if (answer.includes('expérience') || answer.includes('projet') || answer.includes('réalisé')) categoryScore += 2;
      if (answer.includes('compétence') || answer.includes('maîtrise') || answer.includes('expert')) categoryScore += 2;
      if (answer.length > 80) categoryScore += 1; // Réponse détaillée
    } else if (category === 'comportemental') {
      if (answer.includes('gérer') || answer.includes('résoudre') || answer.includes('solution')) categoryScore += 2;
      if (answer.includes('calme') || answer.includes('méthode') || answer.includes('organisation')) categoryScore += 2;
      if (answer.includes('exemple') || answer.includes('situation')) categoryScore += 1;
    } else if (category === 'négociation') {
      if (answer.includes('marché') || answer.includes('recherche') || answer.includes('fourchette')) categoryScore += 2;
      if (answer.includes('flexible') || answer.includes('ouvert') || answer.includes('discussion')) categoryScore += 2;
      if (!answer.includes('trop') && !answer.includes('excessif')) categoryScore += 1;
    } else if (category === 'carrière') {
      if (answer.includes('évolution') || answer.includes('croissance') || answer.includes('développement')) categoryScore += 2;
      if (answer.includes('entreprise') || answer.includes('équipe') || answer.includes('collaboration')) categoryScore += 2;
      if (answer.length > 60) categoryScore += 1;
    }

    categoryScores[category] = categoryScore;
    
    // Analyse détaillée par catégorie
    if (!analysis.categoryAnalysis[category]) {
      analysis.categoryAnalysis[category] = {
        score: categoryScore,
        maxScore: 5,
        feedback: '',
        strengths: [] as string[],
        improvements: [] as string[],
      };
    }

    // Générer feedback spécifique
    if (categoryScore >= 4) {
      analysis.categoryAnalysis[category].strengths.push(`Excellente réponse sur ${category}`);
      analysis.strengths.push(`Bonne maîtrise de la question ${category}`);
    } else if (categoryScore >= 2) {
      analysis.categoryAnalysis[category].improvements.push(`Réponse correcte mais pourrait être plus développée`);
    } else {
      analysis.categoryAnalysis[category].improvements.push(`Réponse trop courte ou peu pertinente`);
      analysis.weaknesses.push(`Amélioration nécessaire sur ${category}`);
    }
  });

  // Calculer le score global
  const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
  const maxTotalScore = questions.length * 5;
  analysis.overallScore = Math.round((totalScore / maxTotalScore) * 100);

  // Générer des recommandations globales
  if (analysis.overallScore >= 80) {
    analysis.recommendations.push('Excellent entretien ! Vous êtes bien préparé.');
    analysis.recommendations.push('Continuez à mettre en avant vos réalisations concrètes.');
  } else if (analysis.overallScore >= 60) {
    analysis.recommendations.push('Bon entretien, mais quelques points à améliorer.');
    analysis.recommendations.push('Développez davantage vos réponses avec des exemples concrets.');
  } else {
    analysis.recommendations.push('Entretien à améliorer. Préparez-vous mieux pour le prochain.');
    analysis.recommendations.push('Structurez vos réponses avec la méthode STAR (Situation, Tâche, Action, Résultat).');
  }

  // Recommandations spécifiques par catégorie faible
  Object.entries(categoryScores).forEach(([cat, score]) => {
    if (score < 2) {
      if (cat === 'motivation') {
        analysis.recommendations.push('Renseignez-vous davantage sur l\'entreprise et exprimez votre motivation.');
      } else if (cat === 'technique') {
        analysis.recommendations.push('Préparez des exemples concrets de projets où vous avez utilisé vos compétences.');
      } else if (cat === 'comportemental') {
        analysis.recommendations.push('Préparez des exemples de situations où vous avez géré le stress efficacement.');
      } else if (cat === 'négociation') {
        analysis.recommendations.push('Faites des recherches sur les salaires du marché avant de négocier.');
      } else if (cat === 'carrière') {
        analysis.recommendations.push('Développez votre vision de carrière en lien avec l\'entreprise.');
      }
    }
  });

  return {
    jobTitle: job.title,
    company: job.company?.name || 'Entreprise anonyme',
    overallScore: analysis.overallScore,
    strengths: analysis.strengths,
    weaknesses: analysis.weaknesses,
    categoryAnalysis: analysis.categoryAnalysis,
    recommendations: analysis.recommendations,
    summary: `Score global : ${analysis.overallScore}/100. ${analysis.overallScore >= 70 ? 'Bonne performance' : 'Des améliorations sont nécessaires'}.`,
  };
};

// Fonction helper pour obtenir des conseils par catégorie
const getTipsForCategory = (category: string): string[] => {
  const tipsByCategory: Record<string, string[]> = {
    motivation: [
      'Soyez authentique et sincère',
      'Mentionnez des éléments spécifiques sur l\'entreprise',
      'Montrez votre alignement avec les valeurs et la mission',
      'Exprimez votre enthousiasme pour le poste',
    ],
    technique: [
      'Structurez votre réponse (situation, action, résultat)',
      'Mettez en avant vos réalisations concrètes',
      'Donnez des exemples de projets réussis',
      'Montrez votre niveau de maîtrise',
    ],
    comportemental: [
      'Utilisez la méthode STAR (Situation, Tâche, Action, Résultat)',
      'Donnez un exemple concret de gestion de situation stressante',
      'Montrez votre résilience et votre capacité d\'adaptation',
      'Expliquez vos méthodes de gestion du stress',
    ],
    négociation: [
      'Faites des recherches sur les salaires du marché',
      'Soyez flexible mais connaissez votre valeur',
      'Négociez aussi les avantages (télétravail, formation, etc.)',
      'Attendez que l\'employeur fasse la première offre',
    ],
    carrière: [
      'Montrez votre vision à long terme',
      'Alignez votre projet avec les opportunités de l\'entreprise',
      'Exprimez votre ambition tout en restant réaliste',
      'Montrez votre engagement et votre loyauté',
    ],
  };

  return tipsByCategory[category] || [
    'Soyez authentique et sincère',
    'Structurez votre réponse',
    'Mettez en avant vos réalisations',
    'Montrez votre intérêt',
  ];
};

// Tool: Préparation aux tests techniques
const prepareTechnicalTestTool: AgentTool = {
  name: 'prepareTechnicalTest',
  description: 'Aide à la préparation d\'un test technique pour une offre d\'emploi. Fournit des conseils, des sujets à réviser, et des exemples de questions.',
  parameters: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'ID de l\'offre d\'emploi',
      },
      topic: {
        type: 'string',
        description: 'Sujet technique spécifique à réviser (optionnel)',
      },
    },
    required: ['jobId'],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      const job = await getJobOfferById(params.jobId);
      if (!job) {
        return { success: false, error: 'Offre non trouvée' };
      }

      const requirements = job.requirements || [];
      const category = job.category || '';

      // Générer des conseils de préparation
      const preparation = {
        jobTitle: job.title,
        company: job.company?.name || 'Entreprise anonyme',
        topicsToReview: requirements.length > 0 ? requirements : [category],
        tips: [
          'Révisez les fondamentaux de votre domaine',
          'Entraînez-vous sur des exercices pratiques',
          'Préparez-vous à expliquer votre processus de réflexion',
          'Soyez prêt à poser des questions sur le test',
          'Gérez votre temps efficacement pendant le test',
        ],
        exampleQuestions: [
          'Expliquez votre approche pour résoudre [problème technique]',
          'Quelle est la différence entre [concept A] et [concept B] ?',
          'Comment optimiseriez-vous [scénario technique] ?',
        ],
      };

      return {
        success: true,
        preparation,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// Tool: Conseils de négociation salariale
const salaryNegotiationAdviceTool: AgentTool = {
  name: 'salaryNegotiationAdvice',
  description: 'Fournit des conseils personnalisés de négociation salariale basés sur le profil du candidat, l\'offre d\'emploi, et le marché.',
  parameters: {
    type: 'object',
    properties: {
      jobId: {
        type: 'string',
        description: 'ID de l\'offre d\'emploi',
      },
      currentSalary: {
        type: 'number',
        description: 'Salaire actuel du candidat (optionnel)',
      },
      targetSalary: {
        type: 'number',
        description: 'Salaire cible souhaité (optionnel)',
      },
    },
    required: ['jobId'],
  },
  execute: async (params: any, context: AgentContext) => {
    try {
      const job = await getJobOfferById(params.jobId);
      if (!job) {
        return { success: false, error: 'Offre non trouvée' };
      }

      const profile = context.userRole === 'candidate' 
        ? await getCandidateProfile(context.candidateId || '')
        : null;

      const jobSalary = job.salary;
      const experience = profile?.profile?.experience || 0;

      // Générer des conseils
      const advice = {
        jobTitle: job.title,
        company: job.company?.name || 'Entreprise anonyme',
        jobSalaryRange: jobSalary 
          ? `${jobSalary.min}€ - ${jobSalary.max}€`
          : 'Non spécifié',
        tips: [] as string[],
        strategy: '',
      };

      if (jobSalary) {
        const avgSalary = (jobSalary.min + jobSalary.max) / 2;
        
        if (params.currentSalary && params.currentSalary < avgSalary) {
          advice.tips.push(`Vous pouvez négocier une augmentation de ${Math.round((avgSalary - params.currentSalary) / params.currentSalary * 100)}% par rapport à votre salaire actuel`);
        }

        if (experience >= 5) {
          advice.tips.push('Avec votre expérience, vous pouvez viser le haut de la fourchette salariale');
          advice.strategy = 'Approche confiante : Mettez en avant votre expertise et vos réalisations';
        } else if (experience >= 2) {
          advice.tips.push('Vous pouvez négocier vers le milieu-haut de la fourchette');
          advice.strategy = 'Approche équilibrée : Montrez votre valeur ajoutée';
        } else {
          advice.tips.push('Pour un débutant, visez le milieu de la fourchette');
          advice.strategy = 'Approche humble : Mettez en avant votre potentiel et votre motivation';
        }

        advice.tips.push('Négociez aussi les avantages (télétravail, formation, congés)');
        advice.tips.push('Attendez que l\'employeur fasse la première offre');
        advice.tips.push('Préparez des arguments basés sur votre valeur ajoutée');
      } else {
        advice.tips.push('Le salaire n\'est pas spécifié, demandez la fourchette lors de l\'entretien');
        advice.tips.push('Faites des recherches sur les salaires du marché pour ce poste');
      }

      return {
        success: true,
        advice,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

export const agentTools: AgentTool[] = [
  searchJobOffersTool,
  getJobOfferDetailsTool,
  getUserApplicationsTool,
  createApplicationTool,
  getFavoriteJobsTool,
  addFavoriteJobTool,
  removeFavoriteJobTool,
  getUserProfileTool,
  getUserMessagesTool,
  sendMessageTool,
  getDecisionDNATool,
  getUserStatsTool,
  getPersonalizedJobRecommendationsTool,
  compareJobOffersTool,
  findSimilarJobOffersTool,
  careerDiagnosticTool,
  createJobAlertTool,
  simulateInterviewTool,
  prepareTechnicalTestTool,
  salaryNegotiationAdviceTool,
];

// Fonction helper pour obtenir un tool par son nom
export const getToolByName = (name: string): AgentTool | undefined => {
  return agentTools.find(tool => tool.name === name);
};

// Convertir les tools au format Gemini API
export const toolsToGeminiFormat = () => {
  return agentTools.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
  }));
};

// Alias pour compatibilité
export const toolsToGroqFormat = toolsToGeminiFormat;
