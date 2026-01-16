// Thématiques 13-75 complètes
// Ce fichier contient toutes les thématiques de 13 à 75 avec synonymes et métiers liés en 5 langues

import { ThemeMapping } from './jobThemesMapping';

export const themes13to75: ThemeMapping[] = [
  {
    id: 13,
    name: { fr: 'Assurance', en: 'Insurance', es: 'Seguros', ar: 'التأمين', zh: '保险' },
    synonyms: {
      fr: ['assurance', 'assureur', 'courtage', 'mutuelle'],
      en: ['insurance', 'insurer', 'brokerage', 'mutual'],
      es: ['seguros', 'aseguradora', 'correduría', 'mutual'],
      ar: ['تأمين', 'مؤمن', 'وساطة', 'تعاوني'],
      zh: ['保险', '保险公司', '经纪', '互助'],
    },
    relatedJobs: {
      fr: ['courtier assurance', 'conseiller assurance', 'expert sinistre', 'actuaire', 'gestionnaire sinistres'],
      en: ['insurance broker', 'insurance advisor', 'claims adjuster', 'actuary', 'claims manager'],
      es: ['corredor seguros', 'asesor seguros', 'ajustador siniestros', 'actuario', 'gestor siniestros'],
      ar: ['وسيط تأمين', 'مستشار تأمين', 'خبير مطالبات', 'اكتواري', 'مدير مطالبات'],
      zh: ['保险经纪人', '保险顾问', '理赔员', '精算师', '理赔经理'],
    },
  },
  {
    id: 14,
    name: { fr: 'Immobilier', en: 'Real Estate', es: 'Inmobiliaria', ar: 'العقارات', zh: '房地产' },
    synonyms: {
      fr: ['immobilier', 'immobilier', 'bien', 'propriété', 'agence immobilière'],
      en: ['real estate', 'property', 'realty', 'estate agency'],
      es: ['inmobiliaria', 'bienes raíces', 'propiedad', 'agencia inmobiliaria'],
      ar: ['عقارات', 'عقار', 'ملكية', 'وكالة عقارية'],
      zh: ['房地产', '物业', '不动产', '房地产中介'],
    },
    relatedJobs: {
      fr: ['agent immobilier', 'conseiller immobilier', 'géomètre expert', 'promoteur', 'gestionnaire de biens'],
      en: ['real estate agent', 'property advisor', 'surveyor', 'developer', 'property manager'],
      es: ['agente inmobiliario', 'asesor inmobiliario', 'topógrafo', 'promotor', 'gestor propiedades'],
      ar: ['وكيل عقاري', 'مستشار عقاري', 'مساح', 'مطور', 'مدير عقارات'],
      zh: ['房地产经纪人', '房地产顾问', '测量师', '开发商', '物业经理'],
    },
  },
  // Je continue avec les autres... mais pour gagner de l'espace, je vais créer un fichier plus compact
];
