import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '../../context/AuthContext';
import { createJobOffer, updateJobOffer, getJobOfferById, getCompanyProfile } from '@/lib/supabase';

export const CompanyJobForm = () => {
  const { id } = useParams();
  const { company } = useAuth();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(isEdit);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship',
    category: '',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'EUR',
    missions: '',
    expectedExperience: '',
    otherInformation: '',
    benefits: '',
    whatYouWillLive: '',
    whatWeWillLove: '',
    whoWeAre: '',
    // Decision DNA
    decisionDNAEnabled: false,
    decisionDNAMode: 'no_test' as 'standard_decision_dna' | 'custom_company_test' | 'no_test',
    decisionProfileTarget: {
      rapidité: 'moyen' as 'faible' | 'moyen' | 'élevé',
      prudence: 'moyen' as 'faible' | 'moyen' | 'élevé',
      optimisation_long_terme: 'moyen' as 'faible' | 'moyen' | 'élevé',
      tolérance_au_risque: 'moyen' as 'faible' | 'moyen' | 'élevé',
    },
  });

  // Charger le profil entreprise pour pré-remplir les champs
  useEffect(() => {
    const loadCompanyProfile = async () => {
      if (!company?.id) return;
      try {
        const profile = await getCompanyProfile(company.id);
        if (profile && !isEdit) {
          // Pré-remplir avec les données du profil entreprise lors de la création
          setFormData((prev) => ({
            ...prev,
            benefits: profile.benefits || '',
            whatYouWillLive: profile.whatYouWillLive || '',
            whatWeWillLove: profile.whatWeWillLove || '',
            whoWeAre: profile.whoWeAre || '',
          }));
        }
      } catch (error) {
        console.error('Error loading company profile:', error);
      }
    };
    loadCompanyProfile();
  }, [company?.id, isEdit]);

  useEffect(() => {
    if (isEdit && id) {
      const loadJob = async () => {
        setFormLoading(true);
        try {
          const job = await getJobOfferById(id);
          if (job) {
            setFormData((prev) => ({
              ...prev,
              title: job.title,
              description: job.description,
              requirements: job.requirements.join(', '),
              location: job.location,
              type: job.type,
              category: job.category,
              salaryMin: job.salary?.min?.toString() || '',
              salaryMax: job.salary?.max?.toString() || '',
              salaryCurrency: job.salary?.currency || 'EUR',
              missions: job.missions || '',
              expectedExperience: job.expectedExperience || '',
              otherInformation: job.otherInformation || '',
              benefits: job.benefits || '',
              whatYouWillLive: job.whatYouWillLive || '',
              whatWeWillLove: job.whatWeWillLove || '',
              whoWeAre: job.whoWeAre || '',
              decisionDNAEnabled: job.decisionDNAEnabled || false,
              decisionDNAMode: (job.decisionDNAMode || 'no_test') as 'standard_decision_dna' | 'custom_company_test' | 'no_test',
              decisionProfileTarget: {
                rapidité: (job.decisionProfileTarget?.rapidité || 'moyen') as 'faible' | 'moyen' | 'élevé',
                prudence: (job.decisionProfileTarget?.prudence || 'moyen') as 'faible' | 'moyen' | 'élevé',
                optimisation_long_terme: (job.decisionProfileTarget?.optimisation_long_terme || 'moyen') as 'faible' | 'moyen' | 'élevé',
                tolérance_au_risque: (job.decisionProfileTarget?.tolérance_au_risque || 'moyen') as 'faible' | 'moyen' | 'élevé',
              },
            }));
          }
        } catch (error) {
          console.error('Error loading job:', error);
        } finally {
          setFormLoading(false);
        }
      };
      loadJob();
    }
  }, [isEdit, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company?.id) return;

    setLoading(true);

    try {
      const requirementsArray = formData.requirements
        .split(',')
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      if (isEdit && id) {
        const updated = await updateJobOffer(id, {
          title: formData.title,
          description: formData.description,
          requirements: requirementsArray,
          location: formData.location,
          type: formData.type,
          category: formData.category,
          salary: formData.salaryMin || formData.salaryMax ? {
            min: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
            max: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
            currency: formData.salaryCurrency || 'EUR',
          } : undefined,
          missions: formData.missions || undefined,
          expectedExperience: formData.expectedExperience || undefined,
          otherInformation: formData.otherInformation || undefined,
          benefits: formData.benefits || undefined,
          whatYouWillLive: formData.whatYouWillLive || undefined,
          whatWeWillLove: formData.whatWeWillLove || undefined,
          whoWeAre: formData.whoWeAre || undefined,
          decisionDNAEnabled: formData.decisionDNAEnabled,
          decisionDNAMode: formData.decisionDNAMode,
          decisionProfileTarget: formData.decisionDNAEnabled ? formData.decisionProfileTarget : undefined,
        });

        if (updated) {
          navigate('/company/jobs');
        } else {
          alert('Erreur lors de la mise à jour de l\'offre');
        }
      } else {
        const created = await createJobOffer({
          companyId: company.id,
          title: formData.title,
          description: formData.description,
          requirements: requirementsArray,
          location: formData.location,
          type: formData.type,
          category: formData.category,
          salary: formData.salaryMin || formData.salaryMax ? {
            min: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
            max: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
            currency: formData.salaryCurrency || 'EUR',
          } : undefined,
          missions: formData.missions || undefined,
          expectedExperience: formData.expectedExperience || undefined,
          otherInformation: formData.otherInformation || undefined,
          benefits: formData.benefits || undefined,
          whatYouWillLive: formData.whatYouWillLive || undefined,
          whatWeWillLove: formData.whatWeWillLove || undefined,
          whoWeAre: formData.whoWeAre || undefined,
          decisionDNAEnabled: formData.decisionDNAEnabled,
          decisionDNAMode: formData.decisionDNAMode,
          decisionProfileTarget: formData.decisionDNAEnabled ? formData.decisionProfileTarget : undefined,
        });

        if (created) {
          navigate('/company/jobs');
        } else {
          alert('Erreur lors de la création de l\'offre');
        }
      }
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (formLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/company/jobs" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux offres</span>
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              {isEdit ? 'Modifier l\'offre' : 'Nouvelle offre d\'emploi'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Titre du poste *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description du poste *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="missions">Vos missions *</Label>
                <Textarea
                  id="missions"
                  value={formData.missions}
                  onChange={(e) => setFormData({ ...formData, missions: e.target.value })}
                  required
                  rows={4}
                  placeholder="Décrivez les missions principales du poste..."
                />
              </div>

              <div>
                <Label htmlFor="requirements">Expériences attendues / Compétences (séparées par des virgules) *</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  required
                  rows={3}
                  placeholder="React, Node.js, TypeScript, 3 ans d'expérience..."
                />
              </div>

              <div>
                <Label htmlFor="expectedExperience">Expériences attendues (détails) *</Label>
                <Textarea
                  id="expectedExperience"
                  value={formData.expectedExperience}
                  onChange={(e) => setFormData({ ...formData, expectedExperience: e.target.value })}
                  required
                  rows={4}
                  placeholder="Décrivez en détail les expériences et compétences attendues..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="location">Lieu de l'emploi *</Label>
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    placeholder="Paris, Lyon, Remote..."
                  />
                </div>

                <div>
                  <Label htmlFor="type">Type de poste *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        type: value as typeof formData.type,
                      })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Temps plein</SelectItem>
                      <SelectItem value="part-time">Temps partiel</SelectItem>
                      <SelectItem value="contract">Contrat</SelectItem>
                      <SelectItem value="internship">Stage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Développement">Développement</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Ventes</SelectItem>
                      <SelectItem value="Other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Salaire (optionnel)</Label>
                <div className="grid md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <Input
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                      placeholder="Minimum"
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      value={formData.salaryMax}
                      onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                      placeholder="Maximum"
                    />
                  </div>
                  <div>
                    <Select
                      value={formData.salaryCurrency}
                      onValueChange={(value) => setFormData({ ...formData, salaryCurrency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Champs pré-remplis depuis le profil mais modifiables */}
              <div className="border-t border-border pt-6 space-y-6">
                <Alert>
                  <AlertDescription>
                    💡 Ces champs sont pré-remplis depuis votre profil entreprise mais vous pouvez les modifier pour cette offre spécifique.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="whoWeAre">Qui sommes-nous</Label>
                  <Textarea
                    id="whoWeAre"
                    value={formData.whoWeAre}
                    onChange={(e) => setFormData({ ...formData, whoWeAre: e.target.value })}
                    rows={4}
                    placeholder="Présentez votre entreprise..."
                  />
                </div>

                <div>
                  <Label htmlFor="benefits">Avantages</Label>
                  <Textarea
                    id="benefits"
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    rows={3}
                    placeholder="Listez les avantages offerts..."
                  />
                </div>

                <div>
                  <Label htmlFor="whatYouWillLive">Ce que vous allez vivre chez nous</Label>
                  <Textarea
                    id="whatYouWillLive"
                    value={formData.whatYouWillLive}
                    onChange={(e) => setFormData({ ...formData, whatYouWillLive: e.target.value })}
                    rows={3}
                    placeholder="Décrivez l'expérience de travail dans votre entreprise..."
                  />
                </div>

                <div>
                  <Label htmlFor="whatWeWillLove">Ce que nous allons aimer chez vous</Label>
                  <Textarea
                    id="whatWeWillLove"
                    value={formData.whatWeWillLove}
                    onChange={(e) => setFormData({ ...formData, whatWeWillLove: e.target.value })}
                    rows={3}
                    placeholder="Décrivez ce que vous recherchez chez vos candidats..."
                  />
                </div>

                <div>
                  <Label htmlFor="otherInformation">Autres informations</Label>
                  <Textarea
                    id="otherInformation"
                    value={formData.otherInformation}
                    onChange={(e) => setFormData({ ...formData, otherInformation: e.target.value })}
                    rows={3}
                    placeholder="Toute autre information pertinente..."
                  />
                </div>
              </div>

              {/* Section Decision DNA */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Decision DNA</h3>
                    <p className="text-sm text-muted-foreground">
                      Activez un test de profil décisionnel pour évaluer la compatibilité comportementale
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="decisionDNAEnabled"
                      checked={formData.decisionDNAEnabled}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          decisionDNAEnabled: e.target.checked,
                          decisionDNAMode: e.target.checked ? 'standard_decision_dna' : 'no_test',
                        })
                      }
                      className="w-4 h-4"
                    />
                    <Label htmlFor="decisionDNAEnabled" className="cursor-pointer">
                      Activer Decision DNA
                    </Label>
                  </div>
                </div>

                {formData.decisionDNAEnabled && (
                  <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                    <div>
                      <Label>Mode de test</Label>
                      <Select
                        value={formData.decisionDNAMode}
                        onValueChange={(value: any) =>
                          setFormData({
                            ...formData,
                            decisionDNAMode: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard_decision_dna">Test standard Decision DNA</SelectItem>
                          <SelectItem value="custom_company_test">Test personnalisé (à venir)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.decisionDNAMode === 'standard_decision_dna' && (
                      <div className="space-y-4">
                        <div>
                          <Label>Profil décisionnel cible</Label>
                          <p className="text-sm text-muted-foreground mb-4">
                            Définissez les caractéristiques comportementales recherchées pour ce poste
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="rapidité">Rapidité de décision</Label>
                            <Select
                              value={formData.decisionProfileTarget.rapidité}
                              onValueChange={(value: any) =>
                                setFormData({
                                  ...formData,
                                  decisionProfileTarget: {
                                    ...formData.decisionProfileTarget,
                                    rapidité: value,
                                  },
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="faible">Faible</SelectItem>
                                <SelectItem value="moyen">Moyen</SelectItem>
                                <SelectItem value="élevé">Élevé</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="prudence">Prudence</Label>
                            <Select
                              value={formData.decisionProfileTarget.prudence}
                              onValueChange={(value: any) =>
                                setFormData({
                                  ...formData,
                                  decisionProfileTarget: {
                                    ...formData.decisionProfileTarget,
                                    prudence: value,
                                  },
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="faible">Faible</SelectItem>
                                <SelectItem value="moyen">Moyen</SelectItem>
                                <SelectItem value="élevé">Élevé</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="optimisation_long_terme">Optimisation long terme</Label>
                            <Select
                              value={formData.decisionProfileTarget.optimisation_long_terme}
                              onValueChange={(value: any) =>
                                setFormData({
                                  ...formData,
                                  decisionProfileTarget: {
                                    ...formData.decisionProfileTarget,
                                    optimisation_long_terme: value,
                                  },
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="faible">Faible</SelectItem>
                                <SelectItem value="moyen">Moyen</SelectItem>
                                <SelectItem value="élevé">Élevé</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="tolérance_au_risque">Tolérance au risque</Label>
                            <Select
                              value={formData.decisionProfileTarget.tolérance_au_risque}
                              onValueChange={(value: any) =>
                                setFormData({
                                  ...formData,
                                  decisionProfileTarget: {
                                    ...formData.decisionProfileTarget,
                                    tolérance_au_risque: value,
                                  },
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="faible">Faible</SelectItem>
                                <SelectItem value="moyen">Moyen</SelectItem>
                                <SelectItem value="élevé">Élevé</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Alert>
                          <AlertDescription>
                            Les candidats passeront un test de 20 questions basé sur des micro-décisions.
                            Le système calculera automatiquement leur compatibilité avec ce profil cible.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Alert>
                <AlertDescription>
                  💡 <strong>Anonymat des candidats :</strong> Les candidats postulent de manière
                  anonyme. Vous verrez uniquement leurs compétences et leur expérience, sans leurs
                  informations personnelles, pour garantir un recrutement équitable.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" asChild>
                  <Link to="/company/jobs">Annuler</Link>
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Publier'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
