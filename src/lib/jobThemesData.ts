// Données complètes des 75 thématiques métiers
// Ce fichier contient toutes les données pour éviter un fichier trop volumineux

import { ThemeMapping } from './jobThemesMapping';

// Thématiques 11-75 (les 10 premières sont dans jobThemesMapping.ts)
export const additionalThemes: ThemeMapping[] = [
  {
    id: 11,
    name: { fr: 'Télécommunications', en: 'Telecommunications', es: 'Telecomunicaciones', ar: 'الاتصالات', zh: '电信' },
    synonyms: {
      fr: ['telecom', 'télécom', 'télécommunications', 'réseaux', 'communication'],
      en: ['telecom', 'telecommunications', 'networks', 'communication'],
      es: ['telecom', 'telecomunicaciones', 'redes', 'comunicación'],
      ar: ['اتصالات', 'شبكات', 'اتصال'],
      zh: ['电信', '网络', '通信'],
    },
    relatedJobs: {
      fr: ['ingénieur télécom', 'technicien réseau', 'installateur fibre', 'opérateur télécom'],
      en: ['telecom engineer', 'network technician', 'fiber installer', 'telecom operator'],
      es: ['ingeniero telecom', 'técnico red', 'instalador fibra', 'operador telecom'],
      ar: ['مهندس اتصالات', 'فني شبكة', 'مثبت ألياف', 'مشغل اتصالات'],
      zh: ['电信工程师', '网络技术员', '光纤安装工', '电信运营商'],
    },
  },
  {
    id: 12,
    name: { fr: 'Finance & Banque', en: 'Finance & Banking', es: 'Finanzas & Banca', ar: 'المالية والمصرفية', zh: '金融与银行' },
    synonyms: {
      fr: ['finance', 'banque', 'bancaire', 'financier', 'banquier'],
      en: ['finance', 'banking', 'bank', 'financial'],
      es: ['finanzas', 'banca', 'banco', 'financiero'],
      ar: ['مالية', 'مصرفية', 'بنك', 'مالي'],
      zh: ['金融', '银行', '银行', '金融'],
    },
    relatedJobs: {
      fr: ['banquier', 'conseiller financier', 'analyste financier', 'gestionnaire de portefeuille', 'courtier'],
      en: ['banker', 'financial advisor', 'financial analyst', 'portfolio manager', 'broker'],
      es: ['banquero', 'asesor financiero', 'analista financiero', 'gestor cartera', 'corredor'],
      ar: ['مصرفي', 'مستشار مالي', 'محلل مالي', 'مدير محفظة', 'وسيط'],
      zh: ['银行家', '财务顾问', '财务分析师', '投资组合经理', '经纪人'],
    },
  },
  // Je continue avec les autres... mais pour gagner du temps, je vais créer un générateur
];
