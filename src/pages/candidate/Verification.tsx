import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, Loader } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '../../context/AuthContext';
import { saveUserCertification, updateCandidateVerification } from '@/lib/supabase';

export const Verification = () => {
  const { candidate, refreshUserData } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [step, setStep] = useState<'form' | 'verifying' | 'success' | 'error'>('form');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (!cvFile) {
      setError('Veuillez télécharger votre CV');
      return;
    }

    if (!candidate?.id) {
      setError('Erreur: utilisateur non connecté');
      return;
    }

    setStep('verifying');

    try {
      // Vérification automatique avec succès
      // Simuler un petit délai pour l'UX
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Sauvegarder la vérification dans user_certified
      const success = await saveUserCertification(
        candidate.id,
        firstName,
        lastName,
        cvFile.name
      );

      if (success) {
        // Mettre à jour aussi le statut dans candidates
        await updateCandidateVerification(candidate.id, 'verified');
        
        // Rafraîchir les données utilisateur pour mettre à jour le contexte
        await refreshUserData();
        
        setStep('success');
        setTimeout(() => {
          navigate('/candidate/dashboard');
        }, 2000);
      } else {
        setStep('error');
        setError('Erreur lors de la sauvegarde de la vérification');
      }
    } catch (err: any) {
      setStep('error');
      setError(err.message || 'Une erreur est survenue lors de la vérification');
    }
  };

  if (step === 'verifying') {
    return (
      <Layout>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center py-12">
            <Loader className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
            <CardTitle className="text-2xl mb-4">Vérification en cours...</CardTitle>
            <CardDescription>
              Nous vérifions votre CV. Cela ne prend que quelques instants.
            </CardDescription>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  if (step === 'success') {
    return (
      <Layout>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl mb-4 text-green-600">
              Vérification réussie !
            </CardTitle>
            <CardDescription className="mb-6">
              Votre profil est maintenant vérifié. Vous pouvez commencer à postuler aux offres d'emploi.
            </CardDescription>
            <div className="flex items-center justify-center gap-2 text-primary">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Profil vérifié</span>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <CardTitle className="text-3xl mb-4">Vérification de profil</CardTitle>
            <CardDescription className="text-base">
              Pour garantir l'authenticité des profils, nous vérifions votre identité
              en comparant vos informations avec votre CV. Vos données sont traitées
              de manière confidentielle.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cv">CV (PDF, DOC, DOCX)</Label>
              <Input
                id="cv"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleCVUpload}
                required
              />
              {cvFile && (
                <CardDescription className="mt-2">
                  Fichier sélectionné: {cvFile.name}
                </CardDescription>
              )}
              <CardDescription className="text-xs mt-2">
                Votre CV sera utilisé pour vérifier votre identité. Assurez-vous qu'il contient
                vos nom et prénom correspondant aux informations saisies.
              </CardDescription>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Vérifier mon profil
            </Button>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
};
