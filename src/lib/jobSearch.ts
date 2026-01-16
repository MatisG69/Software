// Import du nouveau système de mapping des thématiques
import { findMatchingThemes, normalizeText, getSearchTermsForTheme } from './jobThemesMapping';

// Mapping des domaines pour la recherche intelligente (conservé pour compatibilité)
export const domainMapping: { [key: string]: string[] } = {
  'informatique': ['Développement', 'Design', 'Management'],
  'info': ['Développement', 'Design', 'Management'],
  'tech': ['Développement', 'Design'],
  'développement': ['Développement'],
  'développeur': ['Développement'],
  'developpeur': ['Développement'], // Sans accent - tolérance aux fautes
  'programmeur': ['Développement'],
  'code': ['Développement'],
  'programmation': ['Développement'],
  'web': ['Développement'],
  'frontend': ['Développement'],
  'backend': ['Développement'],
  'fullstack': ['Développement'],
  'design': ['Design'],
  'designer': ['Design'],
  'ux': ['Design'],
  'ui': ['Design'],
  'graphique': ['Design'],
  'management': ['Management'],
  'manager': ['Management'],
  'product': ['Management'],
  'marketing': ['Marketing'],
  'commercial': ['Sales'],
  'vente': ['Sales'],
  'sales': ['Sales'],
  'commerce': ['Sales'],
  // Ajout des variantes sans accents pour tolérance
  'batiment': ['Other'],
  'construction': ['Other'],
  'agriculture': ['Other'],
  'sante': ['Other'],
  'education': ['Other'],
};

// Export de la fonction de normalisation
export { normalizeText };

// Fonction pour trouver les catégories correspondantes à un terme de recherche
// Améliorée avec tolérance aux accents et synonymes
export const findMatchingCategories = (searchTerm: string): string[] => {
  const normalizedSearch = normalizeText(searchTerm);
  
  // Si le terme correspond exactement à une catégorie (avec normalisation)
  const categories = ['Développement', 'Design', 'Management', 'Marketing', 'Sales', 'Other'];
  const exactMatch = categories.find(cat => normalizeText(cat) === normalizedSearch);
  if (exactMatch) {
    return [exactMatch];
  }
  
  // Chercher dans le nouveau système de thématiques
  const matchingThemes = findMatchingThemes(searchTerm, 'fr');
  if (matchingThemes.length > 0) {
    // Pour l'instant, on retourne 'Other' pour les nouvelles thématiques
    // On pourrait mapper les thématiques aux catégories existantes
    return ['Other'];
  }
  
  // Chercher dans le mapping classique (avec normalisation)
  for (const [key, values] of Object.entries(domainMapping)) {
    const normalizedKey = normalizeText(key);
    if (normalizedSearch.includes(normalizedKey) || normalizedKey.includes(normalizedSearch)) {
      return values;
    }
  }
  
  // Recherche partielle dans les catégories (avec normalisation)
  const matchingCategories = categories.filter(cat => {
    const normalizedCat = normalizeText(cat);
    return normalizedCat.includes(normalizedSearch) || normalizedSearch.includes(normalizedCat);
  });
  
  return matchingCategories.length > 0 ? matchingCategories : [];
};

// Fonction pour obtenir tous les termes de recherche possibles pour une recherche
// Inclut les synonymes et métiers liés
export const getSearchTerms = (searchTerm: string): string[] => {
  const terms: string[] = [searchTerm];
  const normalizedSearch = normalizeText(searchTerm);
  
  // Ajouter la version normalisée
  if (normalizedSearch !== searchTerm.toLowerCase()) {
    terms.push(normalizedSearch);
  }
  
  // Trouver les thématiques correspondantes et ajouter leurs synonymes
  const matchingThemes = findMatchingThemes(searchTerm, 'fr');
  for (const theme of matchingThemes) {
    const themeTerms = getSearchTermsForTheme(theme, 'fr');
    terms.push(...themeTerms);
  }
  
  return [...new Set(terms)]; // Supprimer les doublons
};
