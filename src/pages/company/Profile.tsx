import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { Save } from 'lucide-react';
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
import { getCompanyProfile, updateCompanyProfile } from '@/lib/supabase';

export const CompanyProfile = () => {
  const { company } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    size: '',
    benefits: '',
    whatYouWillLive: '',
    whatWeWillLove: '',
    whoWeAre: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!company?.id) return;
      setProfileLoading(true);
      try {
        const profile = await getCompanyProfile(company.id);
        if (profile) {
          setFormData({
            name: profile.name || '',
            description: profile.description || '',
            website: profile.website || '',
            industry: profile.industry || '',
            size: profile.size || '',
            benefits: profile.benefits || '',
            whatYouWillLive: profile.whatYouWillLive || '',
            whatWeWillLove: profile.whatWeWillLove || '',
            whoWeAre: profile.whoWeAre || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [company?.id]);

  const handleSave = async () => {
    if (!company?.id) return;

    setLoading(true);
    try {
      const success = await updateCompanyProfile(company.id, {
        name: formData.name,
        description: formData.description,
        website: formData.website,
        industry: formData.industry,
        size: formData.size,
        benefits: formData.benefits,
        whatYouWillLive: formData.whatYouWillLive,
        whatWeWillLove: formData.whatWeWillLove,
        whoWeAre: formData.whoWeAre,
      });

      if (success) {
        setEditing(false);
        // Recharger le profil
        const profile = await getCompanyProfile(company.id);
        if (profile) {
          setFormData({
            name: profile.name || '',
            description: profile.description || '',
            website: profile.website || '',
            industry: profile.industry || '',
            size: profile.size || '',
            benefits: profile.benefits || '',
            whatYouWillLive: profile.whatYouWillLive || '',
            whatWeWillLove: profile.whatWeWillLove || '',
            whoWeAre: profile.whoWeAre || '',
          });
        }
      } else {
        alert('Erreur lors de la sauvegarde du profil');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Erreur lors de la sauvegarde du profil');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement du profil...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle className="text-2xl sm:text-3xl">Profil de l'entreprise</CardTitle>
          {!editing ? (
            <Button onClick={() => setEditing(true)} className="w-full sm:w-auto">
              Modifier
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Informations de l'entreprise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label htmlFor="name">Nom de l'entreprise</Label>
                  {editing ? (
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-2"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-muted rounded-lg mt-2">{formData.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <p className="px-4 py-2 bg-muted rounded-lg mt-2">{company?.email}</p>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  {editing ? (
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="mt-2"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-muted rounded-lg mt-2 min-h-[100px]">
                      {formData.description || 'Aucune description'}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="website">Site web</Label>
                  {editing ? (
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="mt-2"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-muted rounded-lg mt-2">
                      {formData.website || 'Non renseigné'}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="industry">Industrie</Label>
                  {editing ? (
                    <Input
                      id="industry"
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="mt-2"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-muted rounded-lg mt-2">
                      {formData.industry || 'Non renseigné'}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="size">Taille de l'entreprise</Label>
                  {editing ? (
                    <Select
                      value={formData.size}
                      onValueChange={(value) => setFormData({ ...formData, size: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Sélectionnez" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employés</SelectItem>
                        <SelectItem value="11-50">11-50 employés</SelectItem>
                        <SelectItem value="51-200">51-200 employés</SelectItem>
                        <SelectItem value="201-500">201-500 employés</SelectItem>
                        <SelectItem value="500+">500+ employés</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="px-4 py-2 bg-muted rounded-lg mt-2">
                      {formData.size || 'Non renseigné'}
                    </p>
                  )}
                </div>
              </div>

              {/* Nouveaux champs pour le profil entreprise */}
              <div className="pt-6 space-y-6">
                <Separator className="mb-6" />
                <div>
                  <Label htmlFor="whoWeAre">Qui sommes-nous</Label>
                  {editing ? (
                    <Textarea
                      id="whoWeAre"
                      value={formData.whoWeAre}
                      onChange={(e) => setFormData({ ...formData, whoWeAre: e.target.value })}
                      rows={4}
                      className="mt-2"
                      placeholder="Présentez votre entreprise..."
                    />
                  ) : (
                    <p className="px-4 py-2 bg-muted rounded-lg mt-2 min-h-[100px]">
                      {formData.whoWeAre || 'Non renseigné'}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="benefits">Avantages</Label>
                  {editing ? (
                    <Textarea
                      id="benefits"
                      value={formData.benefits}
                      onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                      rows={3}
                      className="mt-2"
                      placeholder="Listez les avantages offerts par votre entreprise..."
                    />
                  ) : (
                    <p className="px-4 py-2 bg-muted rounded-lg mt-2 min-h-[80px]">
                      {formData.benefits || 'Non renseigné'}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="whatYouWillLive">Ce que vous allez vivre chez nous</Label>
                  {editing ? (
                    <Textarea
                      id="whatYouWillLive"
                      value={formData.whatYouWillLive}
                      onChange={(e) => setFormData({ ...formData, whatYouWillLive: e.target.value })}
                      rows={3}
                      className="mt-2"
                      placeholder="Décrivez l'expérience de travail dans votre entreprise..."
                    />
                  ) : (
                    <p className="px-4 py-2 bg-muted rounded-lg mt-2 min-h-[80px]">
                      {formData.whatYouWillLive || 'Non renseigné'}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="whatWeWillLove">Ce que nous allons aimer chez vous</Label>
                  {editing ? (
                    <Textarea
                      id="whatWeWillLove"
                      value={formData.whatWeWillLove}
                      onChange={(e) => setFormData({ ...formData, whatWeWillLove: e.target.value })}
                      rows={3}
                      className="mt-2"
                      placeholder="Décrivez ce que vous recherchez chez vos candidats..."
                    />
                  ) : (
                    <p className="px-4 py-2 bg-muted rounded-lg mt-2 min-h-[80px]">
                      {formData.whatWeWillLove || 'Non renseigné'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
