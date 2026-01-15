import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  User,
  LogOut,
  Search,
  Menu,
  Home,
  FileText,
  Shield,
  Bookmark,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const { user, signOut, candidate, company } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      setIsClosing(true);
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsClosing(false);
      }, 700);
    } else {
      setIsClosing(false);
      setIsMenuOpen(true);
    }
  };
  
  const [logoPosition, setLogoPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const updateLogoPosition = () => {
      if (logoRef.current) {
        const rect = logoRef.current.getBoundingClientRect();
        setLogoPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    };
    
    updateLogoPosition();
    window.addEventListener('resize', updateLogoPosition);
    return () => window.removeEventListener('resize', updateLogoPosition);
  }, []);

  if (!user) {
    return (
      <nav className="bg-card/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-serif font-semibold text-foreground hover:text-primary transition-colors">
              ELYNDRA · TRAJECTORY OS
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" asChild size="sm">
                <Link to="/login">Connexion</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Inscription</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Menu items pour candidats
  const candidateMenuItems = [
    { icon: Home, label: 'Tableau de bord', path: '/candidate/dashboard' },
    { icon: Search, label: 'Recherche d\'emplois', path: '/candidate/jobs' },
    { icon: FileText, label: 'Mes candidatures', path: '/candidate/applications' },
    { icon: Bookmark, label: 'Mes Favoris', path: '/candidate/favorites' },
    { icon: MessageSquare, label: 'Messages', path: '/candidate/messages' },
    { icon: User, label: 'Mon profil', path: '/candidate/profile' },
  ];

  // Menu items pour entreprises (admin)
  const companyMenuItems = [
    { icon: Home, label: 'Tableau de bord', path: '/company/dashboard' },
    { icon: FileText, label: 'Mes offres', path: '/company/jobs' },
    { icon: User, label: 'Candidatures', path: '/company/applications' },
    { icon: MessageSquare, label: 'Messages', path: '/company/messages' },
    { icon: Shield, label: 'Mon profil', path: '/company/profile' },
  ];

  return (
    <>
      <nav className="bg-card/98 backdrop-blur-md border-b border-border/60 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-5">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <Link 
              ref={logoRef}
              to={candidate ? '/candidate/dashboard' : '/company/dashboard'} 
              className="group relative text-base sm:text-lg font-serif font-semibold text-foreground transition-all duration-200 hover:text-primary"
            >
              <span className="hidden sm:inline relative">
                ELYNDRA · TRAJECTORY OS
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </span>
              <span className="sm:hidden relative">
                ELYNDRA
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>

            {/* Menu Button pour candidats et entreprises */}
            {(candidate || company) && (
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMenu}
                  aria-label="Toggle menu"
                  className="h-9 w-9 hover:bg-muted/80 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Menu Fullscreen pour candidats et entreprises */}
      {(candidate || company) && (
        <>
          <div
            ref={menuRef}
            className={cn(
              "fixed inset-0 z-50 bg-background flex flex-col overflow-hidden",
              !isMenuOpen && !isClosing && "pointer-events-none"
            )}
            style={{
              clipPath: isMenuOpen && !isClosing 
                ? `circle(200% at ${logoPosition.x}px ${logoPosition.y}px)` 
                : `circle(0% at ${logoPosition.x}px ${logoPosition.y}px)`,
              transition: (isMenuOpen || isClosing)
                ? 'clip-path 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease-out'
                : 'none',
              opacity: (isMenuOpen || isClosing) ? 1 : 0,
              pointerEvents: isMenuOpen && !isClosing ? 'auto' : 'none'
            }}
          >
            <div className="h-full flex flex-col overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center px-8 sm:px-12 pt-8 pb-6">
                <Link 
                  to={candidate ? '/candidate/dashboard' : '/company/dashboard'} 
                  onClick={toggleMenu}
                  className="text-xl font-serif font-semibold text-foreground hover:text-primary transition-colors tracking-tight"
                >
                  ELYNDRA · TRAJECTORY OS
                </Link>
                <Button
                  variant="ghost"
                  onClick={toggleMenu}
                  className="h-10 px-6 rounded-none bg-foreground text-background hover:bg-foreground/90 transition-colors font-medium"
                >
                  Close
                </Button>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col lg:flex-row px-8 sm:px-12 pb-12">
                {/* Left Column - Navigation */}
                <nav className="flex-1 lg:max-w-xl pt-8 lg:pt-16">
                  <div className="space-y-2">
                    {(candidate ? candidateMenuItems : companyMenuItems).map((item) => {
                      const isActive = location.pathname === item.path;
                      
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={toggleMenu}
                          className={cn(
                            "block py-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight transition-colors duration-200 uppercase relative overflow-hidden group",
                            isActive 
                              ? "text-primary" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <span className="relative z-10 inline-block">{item.label}</span>
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
                        </Link>
                      );
                    })}
                    <button
                      onClick={() => {
                        toggleMenu();
                        handleSignOut();
                      }}
                      className="block py-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-muted-foreground hover:text-foreground transition-colors duration-200 uppercase w-full text-left relative overflow-hidden group"
                    >
                      <span className="relative z-10 inline-block">Déconnexion</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
                    </button>
                  </div>
                </nav>

                {/* Right Column - Additional Info */}
                <div className="lg:w-80 lg:pt-16 space-y-12 mt-12 lg:mt-0">
                  {/* Profil Certifié pour candidats */}
                  {candidate?.certified && (
                    <div className="space-y-4">
                      <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                        Statut
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Profil certifié</span>
                      </div>
                    </div>
                  )}

                  {/* Info entreprise */}
                  {company && (
                    <div className="space-y-4">
                      <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                        Entreprise
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">{company.name}</span>
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  <div className="space-y-4">
                    <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                      Contact
                    </div>
                    <div className="space-y-3 text-sm font-medium text-foreground">
                      <div>Support</div>
                      <div className="text-muted-foreground">support@elyndra.com</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
