import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Bell,
  User,
  LogOut,
  Search,
  Menu,
  X,
  Home,
  FileText,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const { user, signOut, candidate, company } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const notificationCount = 3; // This should come from Supabase

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!user) {
    return (
      <nav className="bg-card/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b-2 border-primary/20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="text-3xl font-serif font-bold text-primary relative group">
              <span className="relative z-10">AnonRecruit</span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="ghost" asChild className="font-serif">
                <Link to="/login">Connexion</Link>
              </Button>
              <Button asChild className="font-serif bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-500 shadow-lg hover:shadow-xl">
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
    { icon: MessageSquare, label: 'Messages', path: '/candidate/messages' },
    { icon: Bell, label: 'Notifications', path: '/candidate/notifications', badge: notificationCount },
    { icon: Shield, label: 'Vérification', path: '/candidate/verification' },
    { icon: User, label: 'Mon profil', path: '/candidate/profile' },
  ];

  return (
    <>
      <nav className="bg-card/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link 
              to={candidate ? '/candidate/dashboard' : '/company/dashboard'} 
              className="text-2xl font-serif font-medium text-foreground hover:text-primary transition-colors duration-500"
            >
              AnonRecruit
            </Link>

            {/* Menu Button - Hamburger style Cheval Blanc */}
            {candidate && (
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <button
                  onClick={toggleMenu}
                  className="relative w-10 h-10 flex flex-col justify-center items-center group transition-all duration-500"
                  aria-label="Toggle menu"
                >
                  {/* Hamburger Icon minimaliste style Cheval Blanc */}
                  <span
                    className={cn(
                      "absolute w-6 h-[1.5px] bg-foreground transition-all duration-700 ease-in-out",
                      isMenuOpen ? "rotate-45 translate-y-0" : "-translate-y-1.5"
                    )}
                  />
                  <span
                    className={cn(
                      "absolute w-6 h-[1.5px] bg-foreground transition-all duration-700 ease-in-out",
                      isMenuOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
                    )}
                  />
                  <span
                    className={cn(
                      "absolute w-6 h-[1.5px] bg-foreground transition-all duration-700 ease-in-out",
                      isMenuOpen ? "-rotate-45 translate-y-0" : "translate-y-1.5"
                    )}
                  />
                </button>
              </div>
            )}

            {company && (
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="font-serif">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="font-serif border-2 border-primary/20 shadow-xl">
                    <DropdownMenuItem asChild>
                      <Link to="/company/jobs">Mes offres</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/company/applications">Candidatures</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/company/messages">Messages</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/company/profile">Mon profil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Menu Overlay style Cheval Blanc - minimaliste */}
      {candidate && (
        <>
          {/* Overlay subtil */}
          <div
            className={cn(
              "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-all duration-1000 ease-in-out",
              isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
            )}
            onClick={toggleMenu}
          />

          {/* Menu Panel style Cheval Blanc - épuré et élégant */}
          <div
            className={cn(
              "fixed top-0 left-0 h-full w-80 lg:w-96 bg-card z-50 border-r border-border/50 transition-all duration-1000 ease-in-out transform",
              isMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            {/* Header minimaliste */}
            <div className="h-20 flex items-center justify-between px-8 border-b border-border/50">
              <Link 
                to="/candidate/dashboard" 
                onClick={toggleMenu}
                className="text-lg font-serif font-medium text-foreground hover:text-primary transition-colors duration-500"
              >
                <span className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  AnonRecruit
                </span>
              </Link>
              <button
                onClick={toggleMenu}
                className="relative w-8 h-8 flex items-center justify-center group transition-all duration-500"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-foreground group-hover:text-primary transition-colors duration-500" />
              </button>
            </div>

            {/* Menu Items style Cheval Blanc - liste verticale épurée */}
            <nav className="flex flex-col py-8 px-8 space-y-1 h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar">
              {candidateMenuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = window.location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={toggleMenu}
                    className={cn(
                      "group relative flex items-center justify-between px-4 py-4 text-left transition-all duration-500 ease-in-out",
                      "hover:bg-muted/30",
                      isActive && "text-primary"
                    )}
                    style={{
                      animationDelay: `${index * 60}ms`,
                      animation: isMenuOpen ? 'fadeInLeft 0.6s ease-out forwards' : 'none',
                      opacity: isMenuOpen ? 1 : 0,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className={cn(
                        "w-5 h-5 transition-all duration-500",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                      )} />
                      <span className={cn(
                        "font-serif text-base transition-all duration-500",
                        isActive ? "text-primary font-medium" : "text-foreground group-hover:text-primary"
                      )}>
                        {item.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Badge pour notifications */}
                      {item.badge && item.badge > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="text-xs h-5 px-1.5"
                        >
                          {item.badge}
                        </Badge>
                      )}

                      {/* Chevron droit style Cheval Blanc */}
                      <ChevronRight className={cn(
                        "w-4 h-4 transition-all duration-500",
                        isActive ? "text-primary translate-x-0" : "text-muted-foreground group-hover:text-primary group-hover:translate-x-1"
                      )} />
                    </div>
                  </Link>
                );
              })}

              {/* Séparateur élégant */}
              <div className="my-6 border-t border-border/50"></div>

              {/* Section déconnexion */}
              <button
                onClick={() => {
                  toggleMenu();
                  handleSignOut();
                }}
                className="group relative flex items-center justify-between px-4 py-4 text-left transition-all duration-500 ease-in-out hover:bg-muted/30 w-full"
                style={{
                  animationDelay: `${candidateMenuItems.length * 60}ms`,
                  animation: isMenuOpen ? 'fadeInLeft 0.6s ease-out forwards' : 'none',
                  opacity: isMenuOpen ? 1 : 0,
                }}
              >
                <div className="flex items-center gap-4">
                  <LogOut className="w-5 h-5 text-muted-foreground group-hover:text-destructive transition-colors duration-500" />
                  <span className="font-serif text-base text-foreground group-hover:text-destructive transition-colors duration-500">
                    Déconnexion
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-destructive group-hover:translate-x-1 transition-all duration-500" />
              </button>
            </nav>

            {/* Footer minimaliste */}
            {candidate?.certified && (
              <div className="absolute bottom-0 left-0 right-0 h-20 border-t border-border/50 flex items-center justify-center px-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="font-serif text-sm text-primary font-medium">Profil certifié</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-1rem);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.3);
        }
      `}</style>
    </>
  );
};
