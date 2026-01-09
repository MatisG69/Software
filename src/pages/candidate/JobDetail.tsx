import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { MapPin, Briefcase, DollarSign, Send, ArrowLeft, Flag, X, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getJobOfferById, createApplication, getCandidateProfile } from '@/lib/supabase';
import { JobOffer } from '../../types';

export const JobDetail = () => {
  const { id } = useParams();
  const { candidate } = useAuth();
  const navigate = useNavigate();
  const [applying, setApplying] = useState(false);
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSkillsForm, setShowSkillsForm] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [profileSkills, setProfileSkills] = useState<string[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const jobData = await getJobOfferById(id);
        setJob(jobData);
      } catch (error) {
        console.error('Error loading job:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  useEffect(() => {
    const loadProfileSkills = async () => {
      if (!candidate?.id) return;
      try {
        const profile = await getCandidateProfile(candidate.id);
        if (profile?.profile?.skills) {
          setProfileSkills(profile.profile.skills);
        }
      } catch (error) {
        console.error('Error loading profile skills:', error);
      }
    };

    loadProfileSkills();
  }, [candidate?.id]);

  const handleApplyClick = () => {
    if (!candidate?.certified) {
      if (confirm('Vous devez vérifier votre identité avant de postuler. Souhaitez-vous être redirigé vers la page de vérification ?')) {
        navigate('/candidate/verification');
      }
      return;
    }

    if (!id || !candidate?.id || !job) return;

    // Si l'offre a Decision DNA activé, rediriger vers le test
    if (job.decisionDNAEnabled && job.decisionDNAMode !== 'no_test') {
      navigate(`/candidate/decision-dna/${id}`);
      return;
    }

    // Afficher le formulaire de compétences
    setShowSkillsForm(true);
  };

  const handleApply = async () => {
    if (selectedSkills.length === 0) {
      alert('Veuillez sélectionner au moins une compétence');
      return;
    }

    if (!id || !candidate?.id || !job) return;

    setApplying(true);
    try {
      const application = await createApplication(id, candidate.id, selectedSkills);
      if (application) {
        setShowSuccessDialog(true);
        // Rediriger après 3 secondes
        setTimeout(() => {
          setShowSuccessDialog(false);
          navigate('/candidate/applications');
        }, 3000);
      } else {
        alert('Erreur lors de l\'envoi de la candidature');
      }
    } catch (error) {
      console.error('Error applying:', error);
      alert('Erreur lors de l\'envoi de la candidature');
    } finally {
      setApplying(false);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addNewSkill = () => {
    const trimmedSkill = newSkill.trim();
    if (trimmedSkill && !selectedSkills.includes(trimmedSkill) && !profileSkills.includes(trimmedSkill)) {
      setSelectedSkills([...selectedSkills, trimmedSkill]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'Temps plein';
      case 'part-time':
        return 'Temps partiel';
      case 'contract':
        return 'Contrat';
      case 'internship':
        return 'Stage';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de l'offre...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!job) {
    return (
      <Layout>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">Offre d'emploi introuvable</p>
            <Button asChild className="mt-4">
              <Link to="/candidate/jobs">Retour aux offres</Link>
            </Button>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/candidate/jobs" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux offres</span>
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl sm:text-3xl mb-2 break-words">{job.title}</CardTitle>
                {job.company && (
                  <CardDescription className="text-xl mb-4">{job.company.name}</CardDescription>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm('Voulez-vous signaler cette offre ?')) {
                    alert('Offre signalée. Merci pour votre contribution.');
                  }
                }}
              >
                <Flag className="w-4 h-4 mr-2" />
                Signaler l'offre
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Détails de l'emploi */}
            <div>
              <h2 className="text-xl font-bold mb-4">Détails de l'emploi</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {job.salary && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Salaire</p>
                      <p className="text-sm text-muted-foreground">
                        {job.salary.min?.toLocaleString()} - {job.salary.max?.toLocaleString()} {job.salary.currency}/an
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Type de poste</p>
                    <p className="text-sm text-muted-foreground">
                      {getTypeLabel(job.type)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Lieu de l'emploi</p>
                    <p className="text-sm text-muted-foreground">
                      {job.location}
                    </p>
                  </div>
                </div>
                {job.benefits && (
                  <div className="flex items-start gap-3">
                    <Badge className="w-5 h-5 mt-0.5" />
                    <div>
                      <p className="font-medium">Avantages</p>
                      <p className="text-sm text-muted-foreground">
                        {job.benefits}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Titre: Description du poste */}
            <div>
              <h2 className="text-xl font-bold mb-4">Description du poste</h2>
              <p className="text-foreground whitespace-pre-line">{job.description}</p>
            </div>

            {/* Qui sommes-nous */}
            {job.whoWeAre && (
              <div>
                <h2 className="text-xl font-bold mb-4">Qui sommes-nous</h2>
                <p className="text-foreground whitespace-pre-line">{job.whoWeAre}</p>
              </div>
            )}

            {/* Vos missions */}
            {job.missions && (
              <div>
                <h2 className="text-xl font-bold mb-4">Vos missions</h2>
                <p className="text-foreground whitespace-pre-line">{job.missions}</p>
              </div>
            )}

            {/* Ce que vous allez vivre chez nous */}
            {job.whatYouWillLive && (
              <div>
                <h2 className="text-xl font-bold mb-4">Ce que vous allez vivre chez nous</h2>
                <p className="text-foreground whitespace-pre-line">{job.whatYouWillLive}</p>
              </div>
            )}

            {/* Ce que nous allons aimer chez vous */}
            {job.whatWeWillLove && (
              <div>
                <h2 className="text-xl font-bold mb-4">Ce que nous allons aimer chez vous</h2>
                <p className="text-foreground whitespace-pre-line">{job.whatWeWillLove}</p>
              </div>
            )}

            {/* Expériences attendues */}
            {job.expectedExperience && (
              <div>
                <h2 className="text-xl font-bold mb-4">Expériences attendues</h2>
                <p className="text-foreground whitespace-pre-line">{job.expectedExperience}</p>
              </div>
            )}

            {/* Autres informations */}
            {job.otherInformation && (
              <div>
                <h2 className="text-xl font-bold mb-4">Autres informations</h2>
                <p className="text-foreground whitespace-pre-line">{job.otherInformation}</p>
              </div>
            )}

            {/* Exigences */}
            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Compétences requises</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.map((req, idx) => (
                    <Badge key={idx} variant="secondary">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Alert>
              <AlertDescription>
                🔒 <strong>Postulation anonyme :</strong> Votre identité restera cachée jusqu'à ce que
                vous acceptiez de la révéler. L'entreprise verra uniquement vos compétences et votre
                expérience.
              </AlertDescription>
            </Alert>

            {!showSkillsForm ? (
              <Button
                onClick={handleApplyClick}
                disabled={applying}
                size="lg"
                className="w-full md:w-auto"
              >
                <Send className="w-5 h-5 mr-2" />
                Postuler maintenant
              </Button>
            ) : (
              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle>Sélectionnez vos compétences</CardTitle>
                  <CardDescription>
                    Choisissez les compétences que vous souhaitez mettre en avant pour cette candidature
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileSkills.length > 0 && (
                    <div>
                      <Label className="mb-2 block">Compétences de votre profil</Label>
                      <div className="flex flex-wrap gap-2">
                        {profileSkills.map((skill) => (
                          <Badge
                            key={skill}
                            variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleSkill(skill)}
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="mb-2 block">Ajouter une compétence</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addNewSkill();
                          }
                        }}
                        placeholder="Ex: React, Python, Gestion de projet..."
                      />
                      <Button onClick={addNewSkill} variant="outline">
                        Ajouter
                      </Button>
                    </div>
                  </div>

                  {selectedSkills.length > 0 && (
                    <div>
                      <Label className="mb-2 block">Compétences sélectionnées ({selectedSkills.length})</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedSkills.map((skill) => (
                          <Badge key={skill} variant="default" className="flex items-center gap-1">
                            {skill}
                            <X
                              className="w-3 h-3 cursor-pointer"
                              onClick={() => removeSkill(skill)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleApply}
                      disabled={applying || selectedSkills.length === 0}
                      size="lg"
                      className="flex-1"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      {applying ? 'Envoi...' : 'Envoyer la candidature'}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowSkillsForm(false);
                        setSelectedSkills([]);
                      }}
                      variant="outline"
                      size="lg"
                    >
                      Annuler
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de succès */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full p-4 shadow-lg">
                  <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-center mt-4">
              Candidature envoyée avec succès !
            </DialogTitle>
            <DialogDescription className="text-center mt-2 space-y-2">
              <p className="text-base">
                Votre candidature pour <strong>{job?.title}</strong> a été transmise à l'entreprise.
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Vous serez redirigé vers vos candidatures dans quelques instants...
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                navigate('/candidate/applications');
              }}
              className="min-w-[120px]"
            >
              Voir mes candidatures
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};
