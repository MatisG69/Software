import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Plus, Edit, Trash2, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../context/AuthContext';
import { getCompanyJobOffers, deleteJobOffer } from '@/lib/supabase';
import { JobOffer } from '../../types';

export const CompanyJobs = () => {
  const { company } = useAuth();
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      if (!company?.id) return;
      setLoading(true);
      try {
        const jobOffers = await getCompanyJobOffers(company.id);
        setJobs(jobOffers);
      } catch (error) {
        console.error('Error loading jobs:', error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [company?.id]);

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      const success = await deleteJobOffer(id);
      if (success) {
        setJobs(jobs.filter((job) => job.id !== id));
      } else {
        alert('Erreur lors de la suppression de l\'offre');
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle className="text-2xl sm:text-3xl">Mes offres d'emploi</CardTitle>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/company/jobs/new">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Nouvelle offre
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Chargement des offres...</p>
              </CardContent>
            </Card>
          ) : jobs.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Aucune offre publiée</p>
                <Button asChild>
                  <Link to="/company/jobs/new">Créer une offre</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                        <CardTitle className="text-lg sm:text-xl break-words">{job.title}</CardTitle>
                        <Badge variant="outline" className="w-fit">{job.category}</Badge>
                      </div>
                      <CardDescription className="line-clamp-2 mb-4 text-sm">{job.description}</CardDescription>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                        <span>{job.location}</span>
                        </span>
                        <span className="flex items-center gap-1">
                        <span>{job.type}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:ml-6">
                      <Button variant="outline" size="icon" asChild className="flex-shrink-0">
                        <Link to={`/company/jobs/${job.id}/edit`}>
                          <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(job.id)}
                        className="border-destructive/30 hover:bg-destructive/10 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};
