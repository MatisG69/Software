import { Link } from 'react-router-dom';
import { Shield, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            Recrutement 100% Anonyme
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Postulez sans discrimination. Les entreprises évaluent uniquement vos compétences,
            jamais votre identité.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/register">
                Commencer maintenant
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link to="/login">
                Se connecter
              </Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-20">
          <Card>
            <CardHeader>
              <Shield className="w-12 h-12 text-primary mb-4" />
              <CardTitle>100% Anonyme</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Votre identité reste cachée jusqu'à ce que vous acceptiez de la révéler.
                Les entreprises ne voient que vos compétences.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Users className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Profil Certifié</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Vérifiez votre identité une seule fois via une API sécurisée pour
                obtenir un badge de certification.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Search className="w-12 h-12 text-primary mb-4" />
              <CardTitle>Recherche Intelligente</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Trouvez des emplois qui correspondent à vos compétences grâce à
                notre algorithme de matching avancé.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <Card className="mt-12 sm:mt-20">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl text-center">Comment ça fonctionne ?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h4 className="font-bold mb-2">Créez votre compte</h4>
                <p className="text-muted-foreground text-sm">
                  Inscrivez-vous en tant que candidat ou entreprise
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h4 className="font-bold mb-2">Vérifiez votre identité</h4>
                <p className="text-muted-foreground text-sm">
                  Obtenez votre certification via notre API sécurisée
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h4 className="font-bold mb-2">Postulez anonymement</h4>
                <p className="text-muted-foreground text-sm">
                  Trouvez et postulez aux offres qui vous intéressent
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h4 className="font-bold mb-2">Obtenez des réponses</h4>
                <p className="text-muted-foreground text-sm">
                  Communiquez avec les entreprises via notre système de messages
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
