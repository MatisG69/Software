import { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { Shield, CheckCircle, XCircle, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getCandidateProfile, updateCandidateProfile } from '@/lib/supabase';

export const CandidateProfile = () => {
  const { candidate } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    experience: 0,
    education: '',
    skills: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!candidate?.id) return;
      setProfileLoading(true);
      try {
        const profile = await getCandidateProfile(candidate.id);
        if (profile) {
          setFormData({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            bio: profile.profile?.bio || '',
            location: profile.profile?.location || '',
            experience: profile.profile?.experience || 0,
            education: profile.profile?.education || '',
            skills: profile.profile?.skills?.join(', ') || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [candidate?.id]);

  const handleSave = async () => {
    if (!candidate?.id) return;

    setLoading(true);
    try {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const success = await updateCandidateProfile(candidate.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        profile: {
          bio: formData.bio,
          location: formData.location,
          experience: formData.experience,
          education: formData.education,
          skills: skillsArray,
        },
      });

      if (success) {
        setEditing(false);
        // Recharger le profil
        const profile = await getCandidateProfile(candidate.id);
        if (profile) {
          setFormData({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            bio: profile.profile?.bio || '',
            location: profile.profile?.location || '',
            experience: profile.profile?.experience || 0,
            education: profile.profile?.education || '',
            skills: profile.profile?.skills?.join(', ') || '',
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <CardTitle className="text-3xl">Mon profil</CardTitle>
          {!editing ? (
            <Button onClick={() => setEditing(true)}>
              Modifier
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          )}
        </div>

        {/* Verification Status */}
        {candidate?.certified ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-green-900 flex items-center gap-2 mb-1">
                    <Shield className="w-5 h-5" />
                    Profil certifié
                  </h3>
                  <p className="text-green-700">
                    Votre identité a été vérifiée. Les entreprises savent que votre profil est authentique.
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-yellow-200 bg-yellow-50">
            <XCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-yellow-900 mb-1">Profil non certifié</h3>
                  <p className="text-yellow-700 mb-4">
                    Vérifiez votre identité pour obtenir un badge de certification et augmenter vos chances.
                  </p>
                  <Button asChild variant="outline" className="border-yellow-600 text-yellow-900 hover:bg-yellow-100">
                    <Link to="/candidate/verification">Vérifier mon identité</Link>
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                {editing ? (
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="mt-2"
                  />
                ) : (
                  <p className="px-4 py-2 bg-muted rounded-lg mt-2">{formData.firstName || 'Non renseigné'}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                {editing ? (
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="mt-2"
                  />
                ) : (
                  <p className="px-4 py-2 bg-muted rounded-lg mt-2">{formData.lastName || 'Non renseigné'}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <p className="px-4 py-2 bg-muted rounded-lg mt-2">{candidate?.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  💡 L'email n'est jamais partagé avec les entreprises pour préserver votre anonymat
                </p>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="location">Localisation</Label>
                {editing ? (
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-2"
                  />
                ) : (
                  <p className="px-4 py-2 bg-muted rounded-lg mt-2">{formData.location || 'Non renseigné'}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="bio">Biographie</Label>
                {editing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="mt-2"
                  />
                ) : (
                  <p className="px-4 py-2 bg-muted rounded-lg mt-2 min-h-[100px]">
                    {formData.bio || 'Aucune biographie'}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="experience">Années d'expérience</Label>
                {editing ? (
                  <Input
                    id="experience"
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                    className="mt-2"
                  />
                ) : (
                  <p className="px-4 py-2 bg-muted rounded-lg mt-2">{formData.experience} ans</p>
                )}
              </div>
              <div>
                <Label htmlFor="education">Formation</Label>
                {editing ? (
                  <Input
                    id="education"
                    type="text"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className="mt-2"
                  />
                ) : (
                  <p className="px-4 py-2 bg-muted rounded-lg mt-2">{formData.education || 'Non renseigné'}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="skills">Compétences</Label>
                {editing ? (
                  <Input
                    id="skills"
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="Séparez les compétences par des virgules"
                    className="mt-2"
                  />
                ) : (
                  <div className="px-4 py-2 bg-muted rounded-lg mt-2">
                    {formData.skills ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.split(', ').map((skill, idx) => (
                          <Badge key={idx} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p>Aucune compétence renseignée</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};
