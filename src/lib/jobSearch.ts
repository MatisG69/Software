// Mapping des domaines pour la recherche intelligente
export const domainMapping: { [key: string]: string[] } = {
  'informatique': ['Développement', 'Design', 'Management'],
  'info': ['Développement', 'Design', 'Management'],
  'tech': ['Développement', 'Design'],
  'développement': ['Développement'],
  'développeur': ['Développement'],
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
};

// Fonction pour trouver les catégories correspondantes à un terme de recherche
export const findMatchingCategories = (searchTerm: string): string[] => {
  const lowerSearch = searchTerm.toLowerCase().trim();
  
  // Si le terme correspond exactement à une catégorie
  const categories = ['Développement', 'Design', 'Management', 'Marketing', 'Sales', 'Other'];
  const exactMatch = categories.find(cat => cat.toLowerCase() === lowerSearch);
  if (exactMatch) {
    return [exactMatch];
  }
  
  // Chercher dans le mapping
  for (const [key, values] of Object.entries(domainMapping)) {
    if (lowerSearch.includes(key) || key.includes(lowerSearch)) {
      return values;
    }
  }
  
  // Recherche partielle dans les catégories
  const matchingCategories = categories.filter(cat => 
    cat.toLowerCase().includes(lowerSearch) || lowerSearch.includes(cat.toLowerCase())
  );
  
  return matchingCategories.length > 0 ? matchingCategories : [];
};

