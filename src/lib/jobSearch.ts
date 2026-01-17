// Import du nouveau système de mapping des thématiques
import { findMatchingThemes, normalizeText, getSearchTermsForTheme } from './jobThemesMapping';

// Mapping des domaines pour la recherche intelligente (conservé pour compatibilité)
// IMPORTANT: Chaque terme doit mapper vers UNE SEULE catégorie principale pour éviter les résultats hors catégorie
export const domainMapping: { [key: string]: string[] } = {
  // Informatique et développement - UNIQUEMENT Développement
  'informatique': ['Développement'],
  'info': ['Développement'],
  'it': ['Développement'],
  'tech': ['Développement'],
  'développement': ['Développement'],
  'developpement': ['Développement'],
  'développeur': ['Développement'],
  'developpeur': ['Développement'], // Sans accent - tolérance aux fautes
  'programmeur': ['Développement'],
  'code': ['Développement'],
  'programmation': ['Développement'],
  'web': ['Développement'],
  'frontend': ['Développement'],
  'backend': ['Développement'],
  'fullstack': ['Développement'],
  'full-stack': ['Développement'],
  'software': ['Développement'],
  'logiciel': ['Développement'],
  // Design - UNIQUEMENT Design
  'design': ['Design'],
  'designer': ['Design'],
  'ux': ['Design'],
  'ui': ['Design'],
  'graphique': ['Design'],
  'graphisme': ['Design'],
  // Management - UNIQUEMENT Management
  'management': ['Management'],
  'manager': ['Management'],
  'product': ['Management'],
  'product manager': ['Management'],
  // Marketing - UNIQUEMENT Marketing
  'marketing': ['Marketing'],
  'marketeur': ['Marketing'],
  'communication': ['Marketing'],
  // Commercial/Vente - UNIQUEMENT Sales
  'commercial': ['Sales'],
  'vente': ['Sales'],
  'sales': ['Sales'],
  'commerce': ['Sales'],
  'business': ['Sales'],
  // Autres catégories
  'batiment': ['Other'],
  'construction': ['Other'],
  'agriculture': ['Other'],
  'sante': ['Other'],
  'santé': ['Other'],
  'education': ['Other'],
  'éducation': ['Other'],
};

// Export de la fonction de normalisation
export { normalizeText };

// Fonction pour trouver les catégories correspondantes à un terme de recherche
// Améliorée avec tolérance aux accents et synonymes
// IMPORTANT: Retourne une seule catégorie principale pour éviter les résultats hors catégorie
export const findMatchingCategories = (searchTerm: string): string[] => {
  const normalizedSearch = normalizeText(searchTerm);
  
  // Si le terme correspond exactement à une catégorie (avec normalisation)
  const categories = ['Développement', 'Design', 'Management', 'Marketing', 'Sales', 'Other'];
  const exactMatch = categories.find(cat => normalizeText(cat) === normalizedSearch);
  if (exactMatch) {
    return [exactMatch];
  }
  
  // Chercher dans le mapping classique (avec normalisation) - PRIORITÉ
  // On cherche d'abord une correspondance exacte ou très proche
  for (const [key, values] of Object.entries(domainMapping)) {
    const normalizedKey = normalizeText(key);
    // Correspondance exacte ou le terme recherché contient la clé
    if (normalizedSearch === normalizedKey || 
        normalizedSearch.includes(normalizedKey) || 
        normalizedKey.includes(normalizedSearch)) {
      // Retourner uniquement la première catégorie pour éviter les résultats mixtes
      return [values[0]];
    }
  }
  
  // Chercher dans le nouveau système de thématiques
  const matchingThemes = findMatchingThemes(searchTerm, 'fr');
  if (matchingThemes.length > 0) {
    // Mapper les thématiques aux catégories
    const theme = matchingThemes[0];
    const themeName = normalizeText(theme.name.fr);
    
    // Mapping spécifique pour les thématiques connues
    if (themeName.includes('informatique') || themeName.includes('développement') || themeName.includes('logiciel')) {
      return ['Développement'];
    }
    if (themeName.includes('design') || themeName.includes('création graphique')) {
      return ['Design'];
    }
    if (themeName.includes('management') || themeName.includes('direction')) {
      return ['Management'];
    }
    if (themeName.includes('marketing') || themeName.includes('publicité')) {
      return ['Marketing'];
    }
    if (themeName.includes('commerce') || themeName.includes('vente')) {
      return ['Sales'];
    }
    
    // Par défaut, retourner 'Other' pour les nouvelles thématiques
    return ['Other'];
  }
  
  // Recherche partielle dans les catégories (avec normalisation) - DERNIER RECOURS
  const matchingCategories = categories.filter(cat => {
    const normalizedCat = normalizeText(cat);
    return normalizedCat.includes(normalizedSearch) || normalizedSearch.includes(normalizedCat);
  });
  
  // Retourner uniquement la première catégorie trouvée
  return matchingCategories.length > 0 ? [matchingCategories[0]] : [];
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
