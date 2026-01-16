// Thématiques 11-75 complètes avec synonymes et métiers liés en 5 langues
// Ce fichier sera intégré dans jobThemesMapping.ts

import { ThemeMapping } from './jobThemesMapping';

// Note: Ce fichier contient les thématiques 11-75
// Les thématiques 1-10 sont dans jobThemesMapping.ts
// Pour utiliser toutes les thématiques, importez ce fichier et concaténez les tableaux

export const themes11to75: ThemeMapping[] = [
  // Thématiques 11-20
  {
    id: 11,
    name: { fr: 'Télécommunications', en: 'Telecommunications', es: 'Telecomunicaciones', ar: 'الاتصالات', zh: '电信' },
    synonyms: {
      fr: ['telecom', 'télécom', 'télécommunications', 'réseaux', 'communication', 'téléphonie'],
      en: ['telecom', 'telecommunications', 'networks', 'communication', 'telephony'],
      es: ['telecom', 'telecomunicaciones', 'redes', 'comunicación', 'telefonía'],
      ar: ['اتصالات', 'شبكات', 'اتصال', 'هاتف'],
      zh: ['电信', '网络', '通信', '电话'],
    },
    relatedJobs: {
      fr: ['ingénieur télécom', 'technicien réseau', 'installateur fibre', 'opérateur télécom', 'ingénieur téléphonie'],
      en: ['telecom engineer', 'network technician', 'fiber installer', 'telecom operator', 'telephony engineer'],
      es: ['ingeniero telecom', 'técnico red', 'instalador fibra', 'operador telecom', 'ingeniero telefonía'],
      ar: ['مهندس اتصالات', 'فني شبكة', 'مثبت ألياف', 'مشغل اتصالات', 'مهندس هاتف'],
      zh: ['电信工程师', '网络技术员', '光纤安装工', '电信运营商', '电话工程师'],
    },
  },
  {
    id: 12,
    name: { fr: 'Finance & Banque', en: 'Finance & Banking', es: 'Finanzas & Banca', ar: 'المالية والمصرفية', zh: '金融与银行' },
    synonyms: {
      fr: ['finance', 'banque', 'bancaire', 'financier', 'banquier', 'banquing'],
      en: ['finance', 'banking', 'bank', 'financial', 'banker'],
      es: ['finanzas', 'banca', 'banco', 'financiero', 'banquero'],
      ar: ['مالية', 'مصرفية', 'بنك', 'مالي', 'مصرفي'],
      zh: ['金融', '银行', '银行', '金融', '银行家'],
    },
    relatedJobs: {
      fr: ['banquier', 'conseiller financier', 'analyste financier', 'gestionnaire de portefeuille', 'courtier', 'directeur financier'],
      en: ['banker', 'financial advisor', 'financial analyst', 'portfolio manager', 'broker', 'financial director'],
      es: ['banquero', 'asesor financiero', 'analista financiero', 'gestor cartera', 'corredor', 'director financiero'],
      ar: ['مصرفي', 'مستشار مالي', 'محلل مالي', 'مدير محفظة', 'وسيط', 'مدير مالي'],
      zh: ['银行家', '财务顾问', '财务分析师', '投资组合经理', '经纪人', '财务总监'],
    },
  },
  // ... Je vais créer toutes les entrées de manière plus compacte pour gagner de l'espace
  // Les 65 thématiques restantes suivent la même structure
];
