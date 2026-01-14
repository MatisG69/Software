import { createClient } from '@supabase/supabase-js';
import { JobOffer, Application, Message, Notification, Candidate, Company, DecisionDNAResponse, DecisionDNA, CandidateDecisionDNA } from '../types';
import { findMatchingCategories } from './jobSearch';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// UTILITAIRES
// ============================================

/**
 * Vérifie si une erreur Supabase est une erreur 404 (NOT_FOUND)
 * et peut être ignorée silencieusement
 */
const isNotFoundError = (error: any): boolean => {
  if (!error) return false;
  return (
    error.code === 'PGRST116' ||
    error.message?.includes('No rows') ||
    error.message?.includes('not found') ||
    error.message?.includes('NOT_FOUND') ||
    error.code === 'NOT_FOUND'
  );
};

// ============================================
// FONCTIONS POUR LES OFFRES D'EMPLOI
// ============================================

export const getJobOffers = async (filters?: {
  search?: string;
  location?: string;
  type?: string;
  category?: string;
}): Promise<JobOffer[]> => {
  try {
    let query = supabase
      .from('job_offers')
      .select(`
        *,
        companies (
          id,
          name,
          description,
          website,
          industry,
          size,
          benefits,
          what_you_will_live,
          what_we_will_love,
          who_we_are
        )
      `)
      .order('created_at', { ascending: false });

    // Recherche intelligente par domaine/catégorie
    if (filters?.search) {
      const matchingCategories = findMatchingCategories(filters.search);
      if (matchingCategories.length > 0) {
        // Rechercher dans le titre, description ET les catégories correspondantes
        const categoryConditions = matchingCategories.map(cat => `category.eq.${cat}`).join(',');
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,${categoryConditions}`);
      } else {
        // Recherche simple dans le titre et la description
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
    }

    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching job offers:', error);
      return [];
    }

    return (data || []).map((job: any) => ({
      id: job.id,
      companyId: job.company_id,
      title: job.title,
      description: job.description,
      requirements: job.requirements || [],
      location: job.location,
      type: job.type,
      category: job.category,
      salary: job.salary_min || job.salary_max
        ? {
            min: job.salary_min,
            max: job.salary_max,
            currency: job.salary_currency || 'EUR',
          }
        : undefined,
      createdAt: job.created_at,
      missions: job.missions,
      expectedExperience: job.expected_experience,
      otherInformation: job.other_information,
      benefits: job.benefits,
      whatYouWillLive: job.what_you_will_live,
      whatWeWillLove: job.what_we_will_love,
      whoWeAre: job.who_we_are,
      decisionDNAEnabled: job.decision_dna_enabled || false,
      decisionDNAMode: job.decision_dna_mode || 'no_test',
      decisionProfileTarget: job.decision_profile_target || undefined,
      company: job.companies
        ? {
            id: job.companies.id,
            email: '',
            role: 'company' as const,
            createdAt: '',
            name: job.companies.name,
            description: job.companies.description,
            website: job.companies.website,
            industry: job.companies.industry,
            size: job.companies.size,
            benefits: job.companies.benefits,
            whatYouWillLive: job.companies.what_you_will_live,
            whatWeWillLove: job.companies.what_we_will_love,
            whoWeAre: job.companies.who_we_are,
          }
        : undefined,
    }));
  } catch (error) {
    console.error('Error in getJobOffers:', error);
    return [];
  }
};

export const getJobOfferById = async (id: string): Promise<JobOffer | null> => {
  try {
    const { data, error } = await supabase
      .from('job_offers')
      .select(`
        *,
        companies (
          id,
          name,
          description,
          website,
          industry,
          size,
          benefits,
          what_you_will_live,
          what_we_will_love,
          who_we_are
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      // Ignorer les erreurs 404 (NOT_FOUND) silencieusement
      if (isNotFoundError(error)) {
        return null;
      }
      console.error('Error fetching job offer:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      companyId: data.company_id,
      title: data.title,
      description: data.description,
      requirements: data.requirements || [],
      location: data.location,
      type: data.type,
      category: data.category,
      salary: data.salary_min || data.salary_max
        ? {
            min: data.salary_min,
            max: data.salary_max,
            currency: data.salary_currency || 'EUR',
          }
        : undefined,
      createdAt: data.created_at,
      missions: data.missions,
      expectedExperience: data.expected_experience,
      otherInformation: data.other_information,
      benefits: data.benefits,
      whatYouWillLive: data.what_you_will_live,
      whatWeWillLove: data.what_we_will_love,
      whoWeAre: data.who_we_are,
      decisionDNAEnabled: data.decision_dna_enabled || false,
      decisionDNAMode: data.decision_dna_mode || 'no_test',
      decisionProfileTarget: data.decision_profile_target || undefined,
      company: data.companies
        ? {
            id: data.companies.id,
            email: '',
            role: 'company' as const,
            createdAt: '',
            name: data.companies.name,
            description: data.companies.description,
            website: data.companies.website,
            industry: data.companies.industry,
            size: data.companies.size,
            benefits: data.companies.benefits,
            whatYouWillLive: data.companies.what_you_will_live,
            whatWeWillLove: data.companies.what_we_will_love,
            whoWeAre: data.companies.who_we_are,
          }
        : undefined,
    };
  } catch (error) {
    console.error('Error in getJobOfferById:', error);
    return null;
  }
};

export const getCompanyJobOffers = async (companyId: string): Promise<JobOffer[]> => {
  try {
    const { data, error } = await supabase
      .from('job_offers')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching company job offers:', error);
      return [];
    }

    return (data || []).map((job: any) => ({
      id: job.id,
      companyId: job.company_id,
      title: job.title,
      description: job.description,
      requirements: job.requirements || [],
      location: job.location,
      type: job.type,
      category: job.category,
      salary: job.salary_min || job.salary_max
        ? {
            min: job.salary_min,
            max: job.salary_max,
            currency: job.salary_currency || 'EUR',
          }
        : undefined,
      createdAt: job.created_at,
      missions: job.missions,
      expectedExperience: job.expected_experience,
      otherInformation: job.other_information,
      benefits: job.benefits,
      whatYouWillLive: job.what_you_will_live,
      whatWeWillLove: job.what_we_will_love,
      whoWeAre: job.who_we_are,
    }));
  } catch (error) {
    console.error('Error in getCompanyJobOffers:', error);
    return [];
  }
};

export const createJobOffer = async (jobOffer: Omit<JobOffer, 'id' | 'createdAt'>): Promise<JobOffer | null> => {
  try {
    const { data, error } = await supabase
      .from('job_offers')
      .insert({
        company_id: jobOffer.companyId,
        title: jobOffer.title,
        description: jobOffer.description,
        requirements: jobOffer.requirements,
        location: jobOffer.location,
        type: jobOffer.type,
        category: jobOffer.category,
        salary_min: jobOffer.salary?.min,
        salary_max: jobOffer.salary?.max,
        salary_currency: jobOffer.salary?.currency || 'EUR',
        missions: jobOffer.missions,
        expected_experience: jobOffer.expectedExperience,
        other_information: jobOffer.otherInformation,
        benefits: jobOffer.benefits,
        what_you_will_live: jobOffer.whatYouWillLive,
        what_we_will_love: jobOffer.whatWeWillLove,
        who_we_are: jobOffer.whoWeAre,
        decision_dna_enabled: jobOffer.decisionDNAEnabled || false,
        decision_dna_mode: jobOffer.decisionDNAMode || 'no_test',
        decision_profile_target: jobOffer.decisionProfileTarget || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating job offer:', error);
      return null;
    }

    return {
      id: data.id,
      companyId: data.company_id,
      title: data.title,
      description: data.description,
      requirements: data.requirements || [],
      location: data.location,
      type: data.type,
      category: data.category,
      salary: data.salary_min || data.salary_max
        ? {
            min: data.salary_min,
            max: data.salary_max,
            currency: data.salary_currency || 'EUR',
          }
        : undefined,
      createdAt: data.created_at,
      missions: data.missions,
      expectedExperience: data.expected_experience,
      otherInformation: data.other_information,
      benefits: data.benefits,
      whatYouWillLive: data.what_you_will_live,
      whatWeWillLove: data.what_we_will_love,
      whoWeAre: data.who_we_are,
    };
  } catch (error) {
    console.error('Error in createJobOffer:', error);
    return null;
  }
};

export const updateJobOffer = async (id: string, jobOffer: Partial<JobOffer>): Promise<JobOffer | null> => {
  try {
    const updateData: any = {};
    if (jobOffer.title !== undefined) updateData.title = jobOffer.title;
    if (jobOffer.description !== undefined) updateData.description = jobOffer.description;
    if (jobOffer.requirements !== undefined) updateData.requirements = jobOffer.requirements;
    if (jobOffer.location !== undefined) updateData.location = jobOffer.location;
    if (jobOffer.type !== undefined) updateData.type = jobOffer.type;
    if (jobOffer.category !== undefined) updateData.category = jobOffer.category;
    if (jobOffer.salary?.min !== undefined) updateData.salary_min = jobOffer.salary.min;
    if (jobOffer.salary?.max !== undefined) updateData.salary_max = jobOffer.salary.max;
    if (jobOffer.salary?.currency !== undefined) updateData.salary_currency = jobOffer.salary.currency;
    if (jobOffer.missions !== undefined) updateData.missions = jobOffer.missions;
    if (jobOffer.expectedExperience !== undefined) updateData.expected_experience = jobOffer.expectedExperience;
    if (jobOffer.otherInformation !== undefined) updateData.other_information = jobOffer.otherInformation;
    if (jobOffer.benefits !== undefined) updateData.benefits = jobOffer.benefits;
    if (jobOffer.whatYouWillLive !== undefined) updateData.what_you_will_live = jobOffer.whatYouWillLive;
    if (jobOffer.whatWeWillLove !== undefined) updateData.what_we_will_love = jobOffer.whatWeWillLove;
    if (jobOffer.whoWeAre !== undefined) updateData.who_we_are = jobOffer.whoWeAre;
    if (jobOffer.decisionDNAEnabled !== undefined) updateData.decision_dna_enabled = jobOffer.decisionDNAEnabled;
    if (jobOffer.decisionDNAMode !== undefined) updateData.decision_dna_mode = jobOffer.decisionDNAMode;
    if (jobOffer.decisionProfileTarget !== undefined) updateData.decision_profile_target = jobOffer.decisionProfileTarget;

    const { data, error } = await supabase
      .from('job_offers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job offer:', error);
      return null;
    }

    return {
      id: data.id,
      companyId: data.company_id,
      title: data.title,
      description: data.description,
      requirements: data.requirements || [],
      location: data.location,
      type: data.type,
      category: data.category,
      salary: data.salary_min || data.salary_max
        ? {
            min: data.salary_min,
            max: data.salary_max,
            currency: data.salary_currency || 'EUR',
          }
        : undefined,
      createdAt: data.created_at,
      missions: data.missions,
      expectedExperience: data.expected_experience,
      otherInformation: data.other_information,
      benefits: data.benefits,
      whatYouWillLive: data.what_you_will_live,
      whatWeWillLove: data.what_we_will_love,
      whoWeAre: data.who_we_are,
    };
  } catch (error) {
    console.error('Error in updateJobOffer:', error);
    return null;
  }
};

export const deleteJobOffer = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('job_offers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting job offer:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteJobOffer:', error);
    return false;
  }
};

// ============================================
// FONCTIONS POUR LES CANDIDATURES
// ============================================

export const createApplication = async (jobOfferId: string, candidateId: string, skills?: string[]): Promise<Application | null> => {
  try {
    // Préparer les données d'insertion
    const insertData: any = {
      job_offer_id: jobOfferId,
      candidate_id: candidateId,
      status: 'pending',
    };

    // Ajouter les compétences seulement si elles sont fournies
    // Si la colonne n'existe pas encore, on ne l'inclut pas dans l'insert
    if (skills && skills.length > 0) {
      insertData.skills = skills;
    } else if (skills !== undefined) {
      // Si skills est un tableau vide, on l'inclut quand même (cas où la colonne existe)
      insertData.skills = [];
    }

    const { data, error } = await supabase
      .from('applications')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating application:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Si l'erreur est due à une colonne manquante, essayer sans skills
      if (error.message && error.message.includes('column') && error.message.includes('skills')) {
        console.warn('Column skills does not exist, retrying without skills field');
        const { data: retryData, error: retryError } = await supabase
          .from('applications')
          .insert({
            job_offer_id: jobOfferId,
            candidate_id: candidateId,
            status: 'pending',
          })
          .select()
          .single();

        if (retryError) {
          console.error('Error creating application (retry):', retryError);
          return null;
        }

        return {
          id: retryData.id,
          jobOfferId: retryData.job_offer_id,
          candidateId: retryData.candidate_id,
          status: retryData.status,
          createdAt: retryData.created_at,
          skills: [],
        };
      }
      
      return null;
    }

    return {
      id: data.id,
      jobOfferId: data.job_offer_id,
      candidateId: data.candidate_id,
      status: data.status,
      createdAt: data.created_at,
      skills: data.skills || [],
    };
  } catch (error) {
    console.error('Error in createApplication:', error);
    return null;
  }
};

export const getCandidateApplications = async (candidateId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job_offers (
          id,
          title,
          location,
          type,
          category,
          companies (
            name
          )
        )
      `)
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching candidate applications:', error);
      return [];
    }

    return (data || []).map((app: any) => ({
      id: app.id,
      jobOfferId: app.job_offer_id,
      candidateId: app.candidate_id,
      status: app.status,
      createdAt: app.created_at,
      jobOffer: app.job_offers
        ? {
            id: app.job_offers.id,
            title: app.job_offers.title,
            location: app.job_offers.location,
            type: app.job_offers.type,
            company: app.job_offers.companies?.name || 'Entreprise',
          }
        : undefined,
    }));
  } catch (error) {
    console.error('Error in getCandidateApplications:', error);
    return [];
  }
};

export const getCompanyApplications = async (companyId: string): Promise<any[]> => {
  try {
    // Récupérer les candidatures avec les relations
    const { data: applicationsData, error: applicationsError } = await supabase
      .from('applications')
      .select(`
        *,
        job_offers (
          id,
          title,
          company_id,
          decision_dna_enabled,
          decision_dna_mode,
          decision_profile_target
        ),
        candidates (
          id,
          certified,
          candidate_profiles (
            skills,
            experience,
            education
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (applicationsError) {
      // Ignorer les erreurs 404 silencieusement
      if (isNotFoundError(applicationsError)) {
        return [];
      }
      console.error('Error fetching company applications:', applicationsError);
      return [];
    }

    // Filtrer les applications pour cette entreprise
    const filteredApplications = (applicationsData || []).filter((app: any) => {
      const jobOffer = Array.isArray(app.job_offers) ? app.job_offers[0] : app.job_offers;
      return jobOffer?.company_id === companyId;
    });

    if (!filteredApplications || filteredApplications.length === 0) {
      return [];
    }

    // Récupérer les Decision DNA pour toutes les candidatures
    const applicationIds = filteredApplications.map((app: any) => app.id);
    const { data: dnaData, error: dnaError } = await supabase
      .from('candidate_decision_dna')
      .select('application_id, decision_dna, compatibility_score')
      .in('application_id', applicationIds);

    if (dnaError) {
      console.error('Error fetching Decision DNA:', dnaError);
    }

    // Créer un map pour accéder rapidement aux Decision DNA par application_id
    const dnaMap = new Map();
    if (dnaData) {
      dnaData.forEach((dna: any) => {
        dnaMap.set(dna.application_id, {
          decisionDNA: dna.decision_dna,
          compatibilityScore: dna.compatibility_score,
        });
      });
    }

    // Mapper les données avec les Decision DNA
    return filteredApplications.map((app: any) => {
      const dna = dnaMap.get(app.id);
      
      return {
        id: app.id,
        jobOfferId: app.job_offer_id,
        candidateId: app.candidate_id,
        status: app.status,
        createdAt: app.created_at,
        skills: app.skills || [],
        jobOffer: app.job_offers
          ? {
              id: app.job_offers.id,
              title: app.job_offers.title,
              decisionDNAEnabled: app.job_offers.decision_dna_enabled || false,
              decisionDNAMode: app.job_offers.decision_dna_mode || 'no_test',
              decisionProfileTarget: app.job_offers.decision_profile_target || undefined,
            }
          : undefined,
        candidate: app.candidates?.candidate_profiles
          ? {
              skills: app.skills || app.candidates.candidate_profiles.skills || [],
              experience: app.candidates.candidate_profiles.experience || 0,
              education: app.candidates.candidate_profiles.education || '',
              certified: app.candidates.certified || false,
            }
          : undefined,
        decisionDNA: dna || undefined,
      };
    });
  } catch (error) {
    console.error('Error in getCompanyApplications:', error);
    return [];
  }
};

export const updateApplicationStatus = async (
  id: string,
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating application status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    return false;
  }
};

export const getApplicationById = async (applicationId: string): Promise<{ candidateId: string; companyId: string } | null> => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        candidate_id,
        job_offer_id,
        job_offers (
          company_id
        )
      `)
      .eq('id', applicationId)
      .single();

    if (error) {
      // Ignorer les erreurs 404 (NOT_FOUND) silencieusement
      if (isNotFoundError(error)) {
        return null;
      }
      console.error('Error fetching application:', error);
      return null;
    }

    if (!data) return null;

    const jobOffer = Array.isArray(data.job_offers) ? data.job_offers[0] : data.job_offers;

    // Si pas de job_offers, essayer de récupérer le company_id depuis job_offers directement
    if (!jobOffer?.company_id && data.job_offer_id) {
      try {
        const { data: jobData } = await supabase
          .from('job_offers')
          .select('company_id')
          .eq('id', data.job_offer_id)
          .single();
        
        if (jobData?.company_id) {
          return {
            candidateId: data.candidate_id,
            companyId: jobData.company_id,
          };
        }
      } catch (e) {
        // Ignorer les erreurs silencieusement
      }
    }

    return {
      candidateId: data.candidate_id,
      companyId: jobOffer?.company_id || '',
    };
  } catch (error) {
    console.error('Error in getApplicationById:', error);
    return null;
  }
};

// ============================================
// FONCTIONS POUR LES MESSAGES
// ============================================

export const getMessages = async (applicationId: string): Promise<Message[]> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true });

    if (error) {
      // Ignorer les erreurs 404 silencieusement
      if (isNotFoundError(error)) {
        return [];
      }
      console.error('Error fetching messages:', error);
      return [];
    }

    return (data || []).map((msg: any) => ({
      id: msg.id,
      applicationId: msg.application_id,
      senderId: msg.sender_id,
      receiverId: msg.receiver_id,
      content: msg.content,
      createdAt: msg.created_at,
      read: msg.read,
    }));
  } catch (error) {
    console.error('Error in getMessages:', error);
    return [];
  }
};

export const createMessage = async (
  applicationId: string,
  senderId: string,
  receiverId: string,
  content: string
): Promise<Message | null> => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        application_id: applicationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return null;
    }

    return {
      id: data.id,
      applicationId: data.application_id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      content: data.content,
      createdAt: data.created_at,
      read: data.read,
    };
  } catch (error) {
    console.error('Error in createMessage:', error);
    return null;
  }
};

export const markMessageAsRead = async (messageId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);

    if (error) {
      console.error('Error marking message as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markMessageAsRead:', error);
    return false;
  }
};

export const getConversations = async (userId: string): Promise<any[]> => {
  try {
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        job_offers (
          id,
          title,
          companies (
            name
          )
        ),
        messages (
          id,
          content,
          created_at,
          read,
          receiver_id
        )
      `)
      .or(`candidate_id.eq.${userId},job_offers.company_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (appError) {
      console.error('Error fetching conversations:', appError);
      return [];
    }

    return (applications || []).map((app: any) => {
      const messages = app.messages || [];
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      const unreadCount = messages.filter((m: any) => !m.read && m.receiver_id === userId).length;

      return {
        id: app.id,
        jobTitle: app.job_offers?.title || '',
        company: app.job_offers?.companies?.name || '',
        lastMessage: lastMessage?.content || '',
        unread: unreadCount,
        updatedAt: lastMessage?.created_at || app.created_at,
      };
    });
  } catch (error) {
    console.error('Error in getConversations:', error);
    return [];
  }
};

// ============================================
// FONCTIONS POUR LES NOTIFICATIONS
// ============================================

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return (data || []).map((notif: any) => ({
      id: notif.id,
      userId: notif.user_id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      read: notif.read,
      createdAt: notif.created_at,
      link: notif.link,
    }));
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return [];
  }
};

export const createNotification = async (
  userId: string,
  type: 'application' | 'message' | 'job_match' | 'verification',
  title: string,
  message: string,
  link?: string
): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        read: false,
        link,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      title: data.title,
      message: data.message,
      read: data.read,
      createdAt: data.created_at,
      link: data.link,
    };
  } catch (error) {
    console.error('Error in createNotification:', error);
    return null;
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return false;
  }
};

// ============================================
// FONCTIONS POUR LES PROFILS
// ============================================

export const getCandidateProfile = async (candidateId: string): Promise<Candidate | null> => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select(`
        *,
        profiles (
          id,
          email,
          role,
          created_at
        ),
        candidate_profiles (
          skills,
          experience,
          education,
          bio,
          location
        ),
        user_certified (
          id,
          first_name,
          last_name,
          verified_at
        )
      `)
      .eq('id', candidateId)
      .single();

    if (error) {
      // Ignorer les erreurs 404 (NOT_FOUND) silencieusement
      if (isNotFoundError(error)) {
        return null;
      }
      console.error('Error fetching candidate profile:', error);
      return null;
    }

    if (!data) return null;

    const isCertified = !!data.user_certified;

    return {
      id: data.id,
      email: data.profiles?.email || '',
      role: 'candidate' as const,
      createdAt: data.profiles?.created_at || '',
      firstName: data.first_name,
      lastName: data.last_name,
      verificationStatus: data.verification_status,
      certified: isCertified || data.certified,
      profile: data.candidate_profiles
        ? {
            skills: data.candidate_profiles.skills || [],
            experience: data.candidate_profiles.experience || 0,
            education: data.candidate_profiles.education || '',
            bio: data.candidate_profiles.bio,
            location: data.candidate_profiles.location,
          }
        : undefined,
    };
  } catch (error) {
    console.error('Error in getCandidateProfile:', error);
    return null;
  }
};

export const updateCandidateProfile = async (
  candidateId: string,
  profile: Partial<Candidate>
): Promise<Candidate | null> => {
  try {
    const updateData: any = {};
    if (profile.firstName !== undefined) updateData.first_name = profile.firstName;
    if (profile.lastName !== undefined) updateData.last_name = profile.lastName;

    if (Object.keys(updateData).length > 0) {
      await supabase.from('candidates').update(updateData).eq('id', candidateId);
    }

    if (profile.profile) {
      const profileData: any = {};
      if (profile.profile.skills !== undefined) profileData.skills = profile.profile.skills;
      if (profile.profile.experience !== undefined) profileData.experience = profile.profile.experience;
      if (profile.profile.education !== undefined) profileData.education = profile.profile.education;
      if (profile.profile.bio !== undefined) profileData.bio = profile.profile.bio;
      if (profile.profile.location !== undefined) profileData.location = profile.profile.location;

      if (Object.keys(profileData).length > 0) {
        await supabase
          .from('candidate_profiles')
          .upsert({
            candidate_id: candidateId,
            ...profileData,
          });
      }
    }

    return await getCandidateProfile(candidateId);
  } catch (error) {
    console.error('Error in updateCandidateProfile:', error);
    return null;
  }
};

export const getCompanyProfile = async (companyId: string): Promise<Company | null> => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        profiles (
          id,
          email,
          role,
          created_at
        )
      `)
      .eq('id', companyId)
      .single();

    if (error) {
      // Ignorer les erreurs 404 (NOT_FOUND) silencieusement
      if (isNotFoundError(error)) {
        return null;
      }
      console.error('Error fetching company profile:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      email: data.profiles?.email || '',
      role: 'company' as const,
      createdAt: data.profiles?.created_at || '',
      name: data.name,
      description: data.description,
      website: data.website,
      industry: data.industry,
      size: data.size,
      benefits: data.benefits,
      whatYouWillLive: data.what_you_will_live,
      whatWeWillLove: data.what_we_will_love,
      whoWeAre: data.who_we_are,
    };
  } catch (error) {
    console.error('Error in getCompanyProfile:', error);
    return null;
  }
};

export const updateCompanyProfile = async (companyId: string, profile: Partial<Company>): Promise<Company | null> => {
  try {
    const updateData: any = {};
    if (profile.name !== undefined) updateData.name = profile.name;
    if (profile.description !== undefined) updateData.description = profile.description;
    if (profile.website !== undefined) updateData.website = profile.website;
    if (profile.industry !== undefined) updateData.industry = profile.industry;
    if (profile.size !== undefined) updateData.size = profile.size;
    if (profile.benefits !== undefined) updateData.benefits = profile.benefits;
    if (profile.whatYouWillLive !== undefined) updateData.what_you_will_live = profile.whatYouWillLive;
    if (profile.whatWeWillLove !== undefined) updateData.what_we_will_love = profile.whatWeWillLove;
    if (profile.whoWeAre !== undefined) updateData.who_we_are = profile.whoWeAre;

    const { error } = await supabase.from('companies').update(updateData).eq('id', companyId);

    if (error) {
      console.error('Error updating company profile:', error);
      return null;
    }

    return await getCompanyProfile(companyId);
  } catch (error) {
    console.error('Error in updateCompanyProfile:', error);
    return null;
  }
};

// ============================================
// FONCTIONS POUR LA VÉRIFICATION
// ============================================

export const saveUserCertification = async (
  candidateId: string,
  firstName: string,
  lastName: string,
  cvFileName: string
): Promise<boolean> => {
  try {
    // Insérer dans user_certified
    const { error: certError } = await supabase.from('user_certified').insert({
      candidate_id: candidateId,
      first_name: firstName,
      last_name: lastName,
      cv_file_name: cvFileName,
      verified_at: new Date().toISOString(),
    });

    if (certError) {
      console.error('Error saving certification:', certError);
      return false;
    }

    // Mettre à jour le statut dans candidates
    const { error: updateError } = await supabase
      .from('candidates')
      .update({
        certified: true,
        verification_status: 'verified',
      })
      .eq('id', candidateId);

    if (updateError) {
      console.error('Error updating candidate certification status:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveUserCertification:', error);
    return false;
  }
};

export const updateCandidateVerification = async (
  candidateId: string,
  status: 'pending' | 'verified' | 'rejected'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('candidates')
      .update({ verification_status: status })
      .eq('id', candidateId);

    if (error) {
      console.error('Error updating candidate verification:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateCandidateVerification:', error);
    return false;
  }
};

export const isCandidateCertified = async (candidateId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('certified')
      .eq('id', candidateId)
      .single();

    if (error) {
      // Ignorer les erreurs 404 (NOT_FOUND) silencieusement
      if (isNotFoundError(error)) {
        return false;
      }
      console.error('Error checking candidate certification status:', error);
      return false;
    }

    return data?.certified || false;
  } catch (error) {
    console.error('Error in isCandidateCertified:', error);
    return false;
  }
};

// ============================================
// FONCTIONS POUR LES STATISTIQUES CANDIDAT
// ============================================

export const getCandidateStats = async (candidateId: string): Promise<{
  totalApplications: number;
  interviews: number;
  matches: number;
}> => {
  try {
    const { data: applications, error } = await supabase
      .from('applications')
      .select('status')
      .eq('candidate_id', candidateId);

    if (error) {
      console.error('Error fetching candidate stats:', error);
      return {
        totalApplications: 0,
        interviews: 0,
        matches: 0,
      };
    }

    const totalApplications = applications?.length || 0;
    
    const interviews = applications?.filter(
      (app: any) => app.status === 'reviewed' || app.status === 'accepted'
    ).length || 0;

    const matches = applications?.filter(
      (app: any) => app.status === 'accepted'
    ).length || 0;

    return {
      totalApplications,
      interviews,
      matches,
    };
  } catch (error) {
    console.error('Error in getCandidateStats:', error);
    return {
      totalApplications: 0,
      interviews: 0,
      matches: 0,
    };
  }
};

// ============================================
// FONCTIONS POUR DECISION DNA
// ============================================

export const saveDecisionDNAResponses = async (
  applicationId: string,
  responses: DecisionDNAResponse[]
): Promise<boolean> => {
  try {
    const responsesData = responses.map((response) => ({
      application_id: applicationId,
      scenario_id: response.scenario_id || null,
      scenario_order: response.scenario_order,
      selected_option_id: response.selected_option_id,
      context_state_before: response.context_state_before,
      context_state_after: response.context_state_after,
      response_time_ms: response.response_time_ms || null,
    }));

    const { error } = await supabase
      .from('decision_dna_responses')
      .insert(responsesData);

    if (error) {
      console.error('Error saving Decision DNA responses:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveDecisionDNAResponses:', error);
    return false;
  }
};

export const saveCandidateDecisionDNA = async (
  applicationId: string,
  decisionDNA: DecisionDNA,
  compatibilityScore?: number
): Promise<boolean> => {
  try {
    // Utiliser upsert avec la clé unique application_id
    const { error } = await supabase
      .from('candidate_decision_dna')
      .upsert(
        {
          application_id: applicationId,
          decision_dna: decisionDNA,
          compatibility_score: compatibilityScore !== undefined ? compatibilityScore : null,
        },
        {
          onConflict: 'application_id',
        }
      );

    if (error) {
      console.error('Error saving candidate Decision DNA:', error);
      console.error('Application ID:', applicationId);
      console.error('Decision DNA:', decisionDNA);
      console.error('Compatibility Score:', compatibilityScore);
      return false;
    }

    console.log('Decision DNA saved successfully for application:', applicationId);
    return true;
  } catch (error) {
    console.error('Error in saveCandidateDecisionDNA:', error);
    return false;
  }
};

export const getCandidateDecisionDNA = async (applicationId: string): Promise<CandidateDecisionDNA | null> => {
  try {
    const { data, error } = await supabase
      .from('candidate_decision_dna')
      .select('*')
      .eq('application_id', applicationId)
      .single();

    if (error) {
      // Ignorer les erreurs 404 (NOT_FOUND) silencieusement
      if (isNotFoundError(error)) {
        return null;
      }
      console.error('Error fetching candidate Decision DNA:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      applicationId: data.application_id,
      decisionDNA: data.decision_dna as DecisionDNA,
      compatibilityScore: data.compatibility_score,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Error in getCandidateDecisionDNA:', error);
    return null;
  }
};

export const getDecisionDNAResponses = async (applicationId: string): Promise<DecisionDNAResponse[]> => {
  try {
    const { data, error } = await supabase
      .from('decision_dna_responses')
      .select('*')
      .eq('application_id', applicationId)
      .order('scenario_order', { ascending: true });

    if (error) {
      console.error('Error fetching Decision DNA responses:', error);
      return [];
    }

    return (data || []).map((r: any) => ({
      scenario_id: r.scenario_id,
      scenario_order: r.scenario_order,
      selected_option_id: r.selected_option_id,
      context_state_before: r.context_state_before,
      context_state_after: r.context_state_after,
      response_time_ms: r.response_time_ms,
    }));
  } catch (error) {
    console.error('Error in getDecisionDNAResponses:', error);
    return [];
  }
};

// ============================================
// FONCTIONS POUR LES FAVORIS
// ============================================

export const addFavoriteJob = async (candidateId: string, jobOfferId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('favorite_jobs')
      .insert({
        candidate_id: candidateId,
        job_offer_id: jobOfferId,
      });

    if (error) {
      // Si l'erreur est due à une contrainte unique, c'est OK (déjà en favoris)
      if (error.code === '23505') {
        return true;
      }
      console.error('Error adding favorite job:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in addFavoriteJob:', error);
    return false;
  }
};

export const removeFavoriteJob = async (candidateId: string, jobOfferId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('favorite_jobs')
      .delete()
      .eq('candidate_id', candidateId)
      .eq('job_offer_id', jobOfferId);

    if (error) {
      console.error('Error removing favorite job:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in removeFavoriteJob:', error);
    return false;
  }
};

export const getFavoriteJobIds = async (candidateId: string): Promise<Set<string>> => {
  try {
    const { data, error } = await supabase
      .from('favorite_jobs')
      .select('job_offer_id')
      .eq('candidate_id', candidateId);

    if (error) {
      console.error('Error fetching favorite job IDs:', error);
      return new Set();
    }

    return new Set((data || []).map((fav: any) => fav.job_offer_id));
  } catch (error) {
    console.error('Error in getFavoriteJobIds:', error);
    return new Set();
  }
};

export const getFavoriteJobs = async (candidateId: string): Promise<JobOffer[]> => {
  try {
    const { data, error } = await supabase
      .from('favorite_jobs')
      .select(`
        job_offer_id,
        job_offers (
          *,
          companies (
            id,
            name,
            description,
            website,
            industry,
            size,
            benefits,
            what_you_will_live,
            what_we_will_love,
            who_we_are
          )
        )
      `)
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorite jobs:', error);
      return [];
    }

    return (data || [])
      .map((fav: any) => fav.job_offers)
      .filter((job: any) => job !== null)
      .map((job: any) => ({
        id: job.id,
        companyId: job.company_id,
        title: job.title,
        description: job.description,
        requirements: job.requirements || [],
        location: job.location,
        type: job.type,
        category: job.category,
        salary: job.salary_min || job.salary_max
          ? {
              min: job.salary_min,
              max: job.salary_max,
              currency: job.salary_currency || 'EUR',
            }
          : undefined,
        createdAt: job.created_at,
        missions: job.missions,
        expectedExperience: job.expected_experience,
        otherInformation: job.other_information,
        benefits: job.benefits,
        whatYouWillLive: job.what_you_will_live,
        whatWeWillLove: job.what_we_will_love,
        whoWeAre: job.who_we_are,
        decisionDNAEnabled: job.decision_dna_enabled || false,
        decisionDNAMode: job.decision_dna_mode || 'no_test',
        decisionProfileTarget: job.decision_profile_target || undefined,
        company: job.companies
          ? {
              id: job.companies.id,
              email: '',
              role: 'company' as const,
              createdAt: '',
              name: job.companies.name,
              description: job.companies.description,
              website: job.companies.website,
              industry: job.companies.industry,
              size: job.companies.size,
              benefits: job.companies.benefits,
              whatYouWillLive: job.companies.what_you_will_live,
              whatWeWillLove: job.companies.what_we_will_love,
              whoWeAre: job.companies.who_we_are,
            }
          : undefined,
      }));
  } catch (error) {
    console.error('Error in getFavoriteJobs:', error);
    return [];
  }
};
