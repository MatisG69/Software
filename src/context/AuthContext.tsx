import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { User, Candidate, Company, UserRole } from '../types';
import { supabase, getCandidateProfile, getCompanyProfile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  candidate: Candidate | null;
  company: Company | null;
  loading: boolean;
  signIn: (email: string, password: string, role?: UserRole) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, additionalData?: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);

  const loadUserData = useCallback(async (userId: string) => {
    // Éviter les appels multiples simultanés
    if (loadingRef.current) {
      return;
    }
    
    loadingRef.current = true;
    setLoading(true);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        const role = session.session.user.user_metadata?.role || 'candidate';
        
        if (role === 'candidate') {
          // Récupérer les données du candidat depuis Supabase
          const candidateData = await getCandidateProfile(userId);
          if (candidateData) {
            setCandidate(candidateData);
            setUser(candidateData);
          } else {
            // Fallback si le profil n'existe pas encore
            const fallbackCandidate: Candidate = {
              id: userId,
              email: session.session.user.email || '',
              role: 'candidate',
              createdAt: session.session.user.created_at,
              verificationStatus: 'pending',
              certified: false,
            };
            setCandidate(fallbackCandidate);
            setUser(fallbackCandidate);
          }
        } else {
          // Récupérer les données de l'entreprise depuis Supabase
          const companyData = await getCompanyProfile(userId);
          if (companyData) {
            setCompany(companyData);
            setUser(companyData);
          } else {
            // Fallback si le profil n'existe pas encore
            const fallbackCompany: Company = {
              id: userId,
              email: session.session.user.email || '',
              role: 'company',
              name: session.session.user.user_metadata?.companyName || '',
              createdAt: session.session.user.created_at,
            };
            setCompany(fallbackCompany);
            setUser(fallbackCompany);
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    // Récupérer la session au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        if (session?.user) {
          loadUserData(session.user.id);
        } else {
          setLoading(false);
        }
      }
    });

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      
      if (session?.user) {
        if (!loadingRef.current) {
          setLoading(true);
          loadUserData(session.user.id);
        }
      } else {
        setUser(null);
        setCandidate(null);
        setCompany(null);
        setLoading(false);
        loadingRef.current = false;
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  const signIn = async (email: string, password: string, _role?: UserRole) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (data.user && !loadingRef.current) {
      await loadUserData(data.user.id);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    additionalData?: any
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          ...additionalData,
        },
      },
    });

    if (error) throw error;
    // Ne pas appeler loadUserData ici car onAuthStateChange le fera si la session est créée
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setCandidate(null);
    setCompany(null);
  };

  const refreshUserData = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (session?.session?.user && !loadingRef.current) {
      await loadUserData(session.session.user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        candidate,
        company,
        loading,
        signIn,
        signUp,
        signOut,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

