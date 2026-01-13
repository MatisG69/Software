import { Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const { user, signOut, candidate, company } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <>
      <nav className="bg-card/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link 
              to={candidate ? '/candidate/dashboard' : '/company/dashboard'} 
              className="text-lg sm:text-xl font-serif font-semibold text-foreground hover:text-primary transition-colors"
            >
              <span className="hidden sm:inline">ELYNDRA · TRAJECTORY OS</span>
              <span className="sm:hidden">ELYNDRA</span>
            </Link>

            {/* Menu Button pour candidats */}
            {candidate && (
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMenu}
                  aria-label="Toggle menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Menu Dropdown pour entreprises */}
            {company && (
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/company/jobs" className="cursor-pointer">
                        Mes offres
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/company/applications" className="cursor-pointer">
                        Candidatures
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/company/messages" className="cursor-pointer">
                        Messages
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/company/profile" className="cursor-pointer">
                        Mon profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Menu Sheet pour candidats */}
      {candidate && (
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetContent side="left" className="w-full sm:w-80 p-0">
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle className="text-left">
                <Link 
                  to="/candidate/dashboard" 
                  onClick={toggleMenu}
                  className="text-lg font-serif font-semibold text-foreground hover:text-primary transition-colors"
                >
                  ELYNDRA · TRAJECTORY OS
                </Link>
              </SheetTitle>
            </SheetHeader>
            
            <nav className="flex flex-col py-4">
              {candidateMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = window.location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={toggleMenu}
                    className={cn(
                      "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors",
                      "hover:bg-muted/50",
                      isActive ? "bg-muted/50 text-primary border-r-2 border-primary" : "text-foreground"
                    )}
                  >
                    <Icon className={cn(
                      "w-5 h-5",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge variant="destructive" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}

              <Separator className="my-4" />

              <button
                onClick={() => {
                  toggleMenu();
                  handleSignOut();
                }}
                className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </nav>

            {candidate?.certified && (
              <div className="absolute bottom-0 left-0 right-0 border-t p-4">
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">Profil certifié</span>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};
