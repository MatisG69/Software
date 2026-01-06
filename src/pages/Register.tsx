import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Lock, User, Building2, Sparkles, Shield, CheckCircle2, XCircle } from 'lucide-react';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('candidate');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 6) strength += 1;
    if (pwd.length >= 8) strength += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 1;
    if (/\d/.test(pwd)) strength += 1;
    if (/[^a-zA-Z\d]/.test(pwd)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (role === 'company' && !companyName) {
      setError('Veuillez entrer le nom de l\'entreprise');
      return;
    }

    setLoading(true);

    try {
      const additionalData = role === 'company' ? { companyName } : {};
      await signUp(email, password, role, additionalData);
      if (role === 'candidate') {
        navigate('/candidate/verification');
      } else {
        navigate('/company/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const passwordMatches = password && confirmPassword && password === confirmPassword;
  const passwordMismatch = confirmPassword && password !== confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <Card className="border-2 border-primary/20 shadow-2xl bg-gradient-to-br from-card to-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Inscription
              </CardTitle>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Rejoignez la plateforme de recrutement anonyme
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs 
              value={role} 
              onValueChange={(value) => setRole(value as UserRole)} 
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
                <TabsTrigger 
                  value="candidate" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  <User className="w-4 h-4" />
                  Candidat
                </TabsTrigger>
                <TabsTrigger 
                  value="company"
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  <Building2 className="w-4 h-4" />
                  Entreprise
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-5 animate-slide-in-from-bottom-4">
              {error && (
                <Alert variant="destructive" className="animate-slide-in-from-top-4 border-2">
                  <AlertDescription className="font-medium">{error}</AlertDescription>
                </Alert>
              )}

              {role === 'company' && (
                <div className="space-y-2 animate-slide-in-from-bottom-4">
                  <Label htmlFor="companyName" className="flex items-center gap-2 text-sm font-semibold">
                    <Building2 className="w-4 h-4 text-primary" />
                    Nom de l'entreprise
                  </Label>
                  <div className="relative">
                    <Input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="pl-10 h-12 border-2 focus:border-primary transition-all"
                      placeholder="Nom de votre entreprise"
                    />
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 border-2 focus:border-primary transition-all"
                    placeholder="votre@email.com"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold">
                  <Lock className="w-4 h-4 text-primary" />
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    className="pl-10 h-12 border-2 focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
                {password && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex gap-1 h-1.5">
                      {[0, 1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 rounded-full transition-all ${
                            level < passwordStrength
                              ? passwordStrength <= 2
                                ? 'bg-red-500'
                                : passwordStrength <= 3
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {passwordStrength <= 2 && 'Faible'}
                      {passwordStrength === 3 && 'Moyen'}
                      {passwordStrength >= 4 && 'Fort'}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-semibold">
                  <Lock className="w-4 h-4 text-primary" />
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`pl-10 pr-10 h-12 border-2 transition-all ${
                      passwordMismatch
                        ? 'border-red-500 focus:border-red-500'
                        : passwordMatches
                        ? 'border-green-500 focus:border-green-500'
                        : 'focus:border-primary'
                    }`}
                    placeholder="••••••••"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  {confirmPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {passwordMatches ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : passwordMismatch ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : null}
                    </div>
                  )}
                </div>
                {passwordMismatch && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    Les mots de passe ne correspondent pas
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
                disabled={loading || !!passwordMismatch}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Inscription en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    S'inscrire
                  </span>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Déjà membre ?</span>
              </div>
            </div>

            <p className="text-center text-sm">
              <span className="text-muted-foreground">Déjà un compte ?</span>{' '}
              <Link 
                to="/login" 
                className="text-primary hover:text-primary/80 font-semibold hover:underline transition-all inline-flex items-center gap-1"
              >
                Se connecter
                <span className="text-primary">→</span>
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Styles d'animation */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-in-from-bottom-4 {
          from {
            transform: translateY(1rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slide-in-from-top-4 {
          from {
            transform: translateY(-1rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-in-from-bottom-4 {
          animation: slide-in-from-bottom-4 0.5s ease-out;
        }
        .animate-slide-in-from-top-4 {
          animation: slide-in-from-top-4 0.4s ease-out;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
};
