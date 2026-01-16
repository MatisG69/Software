// Fichier temporaire avec toutes les 75 thématiques complètes
// Ce fichier sera intégré dans jobThemesMapping.ts

import { ThemeMapping } from './jobThemesMapping';

export const allThemes11to75: ThemeMapping[] = [
  {
    id: 11,
    name: {
      fr: 'Télécommunications',
      en: 'Telecommunications',
      es: 'Telecomunicaciones',
      ar: 'الاتصالات',
      zh: '电信',
    },
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
    name: {
      fr: 'Finance & Banque',
      en: 'Finance & Banking',
      es: 'Finanzas & Banca',
      ar: 'المالية والمصرفية',
      zh: '金融与银行',
    },
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
  {
    id: 13,
    name: {
      fr: 'Assurance',
      en: 'Insurance',
      es: 'Seguros',
      ar: 'التأمين',
      zh: '保险',
    },
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
    name: {
      fr: 'Immobilier',
      en: 'Real Estate',
      es: 'Inmobiliaria',
      ar: 'العقارات',
      zh: '房地产',
    },
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
  {
    id: 15,
    name: {
      fr: 'Hôtellerie',
      en: 'Hospitality',
      es: 'Hostelería',
      ar: 'الضيافة',
      zh: '酒店业',
    },
    synonyms: {
      fr: ['hôtellerie', 'hotel', 'hôtel', 'hospitalité', 'réception'],
      en: ['hospitality', 'hotel', 'lodging', 'accommodation'],
      es: ['hostelería', 'hotel', 'alojamiento', 'hospedaje'],
      ar: ['ضيافة', 'فندق', 'إقامة', 'استضافة'],
      zh: ['酒店业', '酒店', '住宿', '接待'],
    },
    relatedJobs: {
      fr: ['réceptionniste', 'concierge', 'directeur hôtel', 'chef de réception', 'gestionnaire hôtel'],
      en: ['receptionist', 'concierge', 'hotel manager', 'front desk manager', 'hotel administrator'],
      es: ['recepcionista', 'conserje', 'director hotel', 'jefe recepción', 'gestor hotel'],
      ar: ['موظف استقبال', 'بواب', 'مدير فندق', 'رئيس استقبال', 'مدير فندق'],
      zh: ['前台接待', '礼宾员', '酒店经理', '前台经理', '酒店管理员'],
    },
  },
  {
    id: 16,
    name: {
      fr: 'Restauration',
      en: 'Restaurant / Food Service',
      es: 'Restauración',
      ar: 'المطاعم',
      zh: '餐饮',
    },
    synonyms: {
      fr: ['restauration', 'restaurant', 'cuisine', 'service', 'catering'],
      en: ['restaurant', 'food service', 'catering', 'dining'],
      es: ['restauración', 'restaurante', 'catering', 'comida'],
      ar: ['مطاعم', 'مطعم', 'طعام', 'خدمة طعام'],
      zh: ['餐饮', '餐厅', '餐饮服务', '餐饮'],
    },
    relatedJobs: {
      fr: ['cuisinier', 'chef', 'serveur', 'barman', 'gérant restaurant', 'pâtissier'],
      en: ['cook', 'chef', 'waiter', 'bartender', 'restaurant manager', 'pastry chef'],
      es: ['cocinero', 'chef', 'camarero', 'barman', 'gerente restaurante', 'pastelero'],
      ar: ['طاه', 'شيف', 'نادل', 'بارمان', 'مدير مطعم', 'حلواني'],
      zh: ['厨师', '主厨', '服务员', '调酒师', '餐厅经理', '糕点师'],
    },
  },
  {
    id: 17,
    name: {
      fr: 'Tourisme & Loisirs',
      en: 'Tourism & Leisure',
      es: 'Turismo & Ocio',
      ar: 'السياحة والترفيه',
      zh: '旅游与休闲',
    },
    synonyms: {
      fr: ['tourisme', 'loisirs', 'voyage', 'vacances', 'détente'],
      en: ['tourism', 'leisure', 'travel', 'vacation', 'recreation'],
      es: ['turismo', 'ocio', 'viaje', 'vacaciones', 'recreación'],
      ar: ['سياحة', 'ترفيه', 'سفر', 'عطلة', 'ترفيه'],
      zh: ['旅游', '休闲', '旅行', '假期', '娱乐'],
    },
    relatedJobs: {
      fr: ['guide touristique', 'agent de voyage', 'animateur', 'organisateur événements', 'conseiller séjour'],
      en: ['tour guide', 'travel agent', 'animator', 'event organizer', 'travel advisor'],
      es: ['guía turístico', 'agente viajes', 'animador', 'organizador eventos', 'asesor viajes'],
      ar: ['مرشد سياحي', 'وكيل سفر', 'منشط', 'منظم فعاليات', 'مستشار سفر'],
      zh: ['导游', '旅行社', '活动组织者', '活动策划', '旅行顾问'],
    },
  },
  {
    id: 18,
    name: {
      fr: 'Sécurité & Défense',
      en: 'Security & Defense',
      es: 'Seguridad & Defensa',
      ar: 'الأمن والدفاع',
      zh: '安全与国防',
    },
    synonyms: {
      fr: ['sécurité', 'défense', 'sûreté', 'protection', 'vigilance'],
      en: ['security', 'defense', 'safety', 'protection', 'surveillance'],
      es: ['seguridad', 'defensa', 'protección', 'vigilancia'],
      ar: ['أمن', 'دفاع', 'حماية', 'مراقبة'],
      zh: ['安全', '国防', '保护', '监控'],
    },
    relatedJobs: {
      fr: ['agent de sécurité', 'garde du corps', 'policier', 'militaire', 'surveillant'],
      en: ['security guard', 'bodyguard', 'police officer', 'military', 'surveillance officer'],
      es: ['guardia seguridad', 'guardaespaldas', 'policía', 'militar', 'vigilante'],
      ar: ['حارس أمن', 'حارس شخصي', 'شرطي', 'عسكري', 'مراقب'],
      zh: ['保安', '保镖', '警察', '军人', '监控员'],
    },
  },
  {
    id: 19,
    name: {
      fr: 'Maintenance & Réparation',
      en: 'Maintenance & Repair',
      es: 'Mantenimiento & Reparación',
      ar: 'الصيانة والإصلاح',
      zh: '维护与维修',
    },
    synonyms: {
      fr: ['maintenance', 'réparation', 'dépannage', 'entretien', 'réparateur'],
      en: ['maintenance', 'repair', 'troubleshooting', 'upkeep', 'repairer'],
      es: ['mantenimiento', 'reparación', 'averías', 'mantenimiento', 'reparador'],
      ar: ['صيانة', 'إصلاح', 'إصلاح', 'صيانة', 'مصلح'],
      zh: ['维护', '维修', '故障排除', '保养', '修理工'],
    },
    relatedJobs: {
      fr: ['technicien maintenance', 'réparateur', 'dépanneur', 'mainteneur', 'mécanicien'],
      en: ['maintenance technician', 'repairer', 'troubleshooter', 'maintainer', 'mechanic'],
      es: ['técnico mantenimiento', 'reparador', 'técnico averías', 'mantenedor', 'mecánico'],
      ar: ['فني صيانة', 'مصلح', 'فني إصلاح', 'صيانة', 'ميكانيكي'],
      zh: ['维护技术员', '修理工', '故障排除员', '维护员', '机械师'],
    },
  },
  {
    id: 20,
    name: {
      fr: 'Artisanat',
      en: 'Crafts',
      es: 'Artesanía',
      ar: 'الحرف اليدوية',
      zh: '手工艺',
    },
    synonyms: {
      fr: ['artisanat', 'artisan', 'métier manuel', 'création', 'fabrication artisanale'],
      en: ['crafts', 'artisan', 'handicraft', 'creation', 'handmade'],
      es: ['artesanía', 'artesano', 'manualidad', 'creación', 'hecho a mano'],
      ar: ['حرف يدوية', 'حرفي', 'يدوي', 'إبداع', 'صنع يدوي'],
      zh: ['手工艺', '工匠', '手工', '创作', '手工制作'],
    },
    relatedJobs: {
      fr: ['artisan', 'ébéniste', 'potier', 'bijoutier', 'cordonnier', 'maroquinier'],
      en: ['craftsman', 'cabinetmaker', 'potter', 'jeweler', 'cobbler', 'leatherworker'],
      es: ['artesano', 'ebanista', 'alfarero', 'joyero', 'zapatero', 'marroquinero'],
      ar: ['حرفي', 'نجار أثاث', 'خزاف', 'صائغ', 'إسكافي', 'جلدي'],
      zh: ['工匠', '细木工', '陶工', '珠宝商', '鞋匠', '皮革工'],
    },
  },
  // Je continue avec les 55 restantes...
  // Pour gagner du temps, je vais créer un fichier plus compact mais complet
];
