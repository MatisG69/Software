// Mapping complet des 75 grandes thématiques métiers avec synonymes et métiers liés
// Support multilingue : Français, Anglais, Espagnol, Arabe, Chinois

export interface ThemeMapping {
  id: number;
  name: {
    fr: string;
    en: string;
    es: string;
    ar: string;
    zh: string;
  };
  synonyms: {
    fr: string[];
    en: string[];
    es: string[];
    ar: string[];
    zh: string[];
  };
  relatedJobs: {
    fr: string[];
    en: string[];
    es: string[];
    ar: string[];
    zh: string[];
  };
}

export const jobThemesMapping: ThemeMapping[] = [
  {
    id: 1,
    name: {
      fr: 'Bâtiment / Construction',
      en: 'Building / Construction',
      es: 'Construcción / Edificación',
      ar: 'البناء / التشييد',
      zh: '建筑 / 施工',
    },
    synonyms: {
      fr: ['batiment', 'construction', 'bâtiment', 'chantier', 'travaux', 'maçonnerie', 'gros œuvre', 'second œuvre'],
      en: ['building', 'construction', 'site', 'works', 'masonry', 'civil engineering'],
      es: ['edificación', 'construcción', 'obra', 'trabajos', 'mampostería'],
      ar: ['بناء', 'تشييد', 'موقع', 'أعمال', 'بناء بالطوب'],
      zh: ['建筑', '施工', '工地', '工程', '砌筑'],
    },
    relatedJobs: {
      fr: ['architecte', 'maçon', 'charpentier', 'couvreur', 'plombier', 'électricien', 'peintre', 'carreleur', 'plâtrier', 'menuisier', 'serrurier', 'chauffagiste', 'géomètre', 'conducteur de travaux', 'chef de chantier'],
      en: ['architect', 'mason', 'carpenter', 'roofer', 'plumber', 'electrician', 'painter', 'tiler', 'plasterer', 'joiner', 'locksmith', 'heating engineer', 'surveyor', 'site manager'],
      es: ['arquitecto', 'albañil', 'carpintero', 'techador', 'fontanero', 'electricista', 'pintor', 'solador', 'yesero', 'ebanista', 'cerrajero', 'calefactor', 'topógrafo', 'jefe de obra'],
      ar: ['مهندس معماري', 'بناء', 'نجار', 'سقاف', 'سباك', 'كهربائي', 'رسام', 'بلاط', 'جبس', 'نجار أثاث', 'قفل', 'مهندس تدفئة', 'مساح', 'مدير موقع'],
      zh: ['建筑师', '泥瓦匠', '木工', '屋顶工', '水管工', '电工', '油漆工', '瓷砖工', '石膏工', '细木工', '锁匠', '供暖工程师', '测量员', '工地经理'],
    },
  },
  {
    id: 2,
    name: {
      fr: 'Agriculture & Agro-alimentaire',
      en: 'Agriculture & Food Industry',
      es: 'Agricultura & Agroalimentario',
      ar: 'الزراعة والصناعات الغذائية',
      zh: '农业与食品工业',
    },
    synonyms: {
      fr: ['agriculture', 'agroalimentaire', 'agro', 'agroalimentaire', 'ferme', 'exploitation', 'élevage', 'cultures'],
      en: ['agriculture', 'agrifood', 'farming', 'livestock', 'crops'],
      es: ['agricultura', 'agroalimentario', 'granja', 'explotación', 'ganadería', 'cultivos'],
      ar: ['زراعة', 'صناعات غذائية', 'مزرعة', 'استغلال', 'تربية', 'محاصيل'],
      zh: ['农业', '食品工业', '农场', '养殖', '作物'],
    },
    relatedJobs: {
      fr: ['agriculteur', 'éleveur', 'vétérinaire', 'ingénieur agronome', 'technicien agricole', 'ouvrier agricole', 'fromager', 'boulanger', 'boucher', 'charcutier', 'poissonnier', 'primeur'],
      en: ['farmer', 'breeder', 'veterinarian', 'agronomist', 'agricultural technician', 'farm worker', 'cheesemaker', 'baker', 'butcher', 'fishmonger', 'greengrocer'],
      es: ['agricultor', 'ganadero', 'veterinario', 'ingeniero agrónomo', 'técnico agrícola', 'trabajador agrícola', 'quesero', 'panadero', 'carnicero', 'pescadero', 'frutero'],
      ar: ['مزارع', 'مربي', 'طبيب بيطري', 'مهندس زراعي', 'فني زراعي', 'عامل مزرعة', 'صانع جبن', 'خباز', 'جزار', 'بائع سمك', 'بائع خضار'],
      zh: ['农民', '饲养员', '兽医', '农艺师', '农业技术员', '农场工人', '奶酪制作师', '面包师', '屠夫', '鱼贩', '蔬菜商'],
    },
  },
  {
    id: 3,
    name: {
      fr: 'Santé & Soins médicaux',
      en: 'Health & Medical Care',
      es: 'Salud & Atención Médica',
      ar: 'الصحة والرعاية الطبية',
      zh: '健康与医疗护理',
    },
    synonyms: {
      fr: ['santé', 'médical', 'soins', 'médecine', 'hospitalier', 'clinique', 'hôpital'],
      en: ['health', 'medical', 'care', 'medicine', 'hospital', 'clinic'],
      es: ['salud', 'médico', 'atención', 'medicina', 'hospital', 'clínica'],
      ar: ['صحة', 'طبي', 'رعاية', 'طب', 'مستشفى', 'عيادة'],
      zh: ['健康', '医疗', '护理', '医学', '医院', '诊所'],
    },
    relatedJobs: {
      fr: ['médecin', 'infirmier', 'pharmacien', 'dentiste', 'kinésithérapeute', 'sage-femme', 'aide-soignant', 'ambulancier', 'radiologue', 'chirurgien', 'anesthésiste'],
      en: ['doctor', 'nurse', 'pharmacist', 'dentist', 'physiotherapist', 'midwife', 'caregiver', 'paramedic', 'radiologist', 'surgeon', 'anesthesiologist'],
      es: ['médico', 'enfermero', 'farmacéutico', 'dentista', 'fisioterapeuta', 'matrona', 'auxiliar', 'paramédico', 'radiólogo', 'cirujano', 'anestesista'],
      ar: ['طبيب', 'ممرض', 'صيدلي', 'طبيب أسنان', 'معالج فيزيائي', 'قابلة', 'مساعد', 'مسعف', 'أخصائي أشعة', 'جراح', 'طبيب تخدير'],
      zh: ['医生', '护士', '药剂师', '牙医', '物理治疗师', '助产士', '护理员', '护理人员', '放射科医生', '外科医生', '麻醉师'],
    },
  },
  {
    id: 4,
    name: {
      fr: 'Éducation & Formation',
      en: 'Education & Training',
      es: 'Educación & Formación',
      ar: 'التعليم والتدريب',
      zh: '教育与培训',
    },
    synonyms: {
      fr: ['éducation', 'formation', 'enseignement', 'école', 'université', 'pédagogie', 'apprentissage'],
      en: ['education', 'training', 'teaching', 'school', 'university', 'pedagogy', 'learning'],
      es: ['educación', 'formación', 'enseñanza', 'escuela', 'universidad', 'pedagogía', 'aprendizaje'],
      ar: ['تعليم', 'تدريب', 'تدريس', 'مدرسة', 'جامعة', 'تربية', 'تعلم'],
      zh: ['教育', '培训', '教学', '学校', '大学', '教育学', '学习'],
    },
    relatedJobs: {
      fr: ['enseignant', 'professeur', 'formateur', 'éducateur', 'conseiller pédagogique', 'directeur d\'école', 'animateur', 'moniteur'],
      en: ['teacher', 'professor', 'trainer', 'educator', 'educational advisor', 'school principal', 'animator', 'instructor'],
      es: ['maestro', 'profesor', 'formador', 'educador', 'asesor pedagógico', 'director de escuela', 'animador', 'monitor'],
      ar: ['معلم', 'أستاذ', 'مدرب', 'مربي', 'مستشار تربوي', 'مدير مدرسة', 'منشط', 'مدرب'],
      zh: ['教师', '教授', '培训师', '教育工作者', '教育顾问', '校长', '活动组织者', '教练'],
    },
  },
  {
    id: 5,
    name: {
      fr: 'Transport & Logistique',
      en: 'Transport & Logistics',
      es: 'Transporte & Logística',
      ar: 'النقل والخدمات اللوجستية',
      zh: '运输与物流',
    },
    synonyms: {
      fr: ['transport', 'logistique', 'livraison', 'expédition', 'fret', 'messagerie', 'livreur'],
      en: ['transport', 'logistics', 'delivery', 'shipping', 'freight', 'courier', 'delivery driver'],
      es: ['transporte', 'logística', 'entrega', 'envío', 'carga', 'mensajería', 'repartidor'],
      ar: ['نقل', 'خدمات لوجستية', 'تسليم', 'شحن', 'شحن', 'بريد سريع', 'سائق توصيل'],
      zh: ['运输', '物流', '配送', '发货', '货运', '快递', '送货员'],
    },
    relatedJobs: {
      fr: ['chauffeur', 'livreur', 'routier', 'conducteur', 'logisticien', 'manutentionnaire', 'cariste', 'dispatcher', 'agent de transit'],
      en: ['driver', 'delivery driver', 'truck driver', 'logistician', 'warehouse worker', 'forklift operator', 'dispatcher', 'freight forwarder'],
      es: ['conductor', 'repartidor', 'camionero', 'logista', 'operario de almacén', 'operador de montacargas', 'despachador', 'agente de tránsito'],
      ar: ['سائق', 'سائق توصيل', 'سائق شاحنة', 'خبير لوجستي', 'عامل مستودع', 'مشغل رافعة', 'مرسل', 'وكيل شحن'],
      zh: ['司机', '送货员', '卡车司机', '物流师', '仓库工人', '叉车操作员', '调度员', '货运代理'],
    },
  },
  {
    id: 6,
    name: {
      fr: 'Commerce de détail',
      en: 'Retail',
      es: 'Comercio Minorista',
      ar: 'تجارة التجزئة',
      zh: '零售业',
    },
    synonyms: {
      fr: ['commerce', 'détaillant', 'magasin', 'boutique', 'vente', 'distribution', 'retail'],
      en: ['retail', 'store', 'shop', 'sales', 'distribution'],
      es: ['comercio', 'minorista', 'tienda', 'venta', 'distribución'],
      ar: ['تجارة', 'تجزئة', 'متجر', 'محل', 'بيع', 'توزيع'],
      zh: ['零售', '商店', '店铺', '销售', '分销'],
    },
    relatedJobs: {
      fr: ['vendeur', 'caissier', 'chef de rayon', 'directeur de magasin', 'conseiller client', 'étalagiste', 'gestionnaire de stock'],
      en: ['salesperson', 'cashier', 'department manager', 'store manager', 'customer advisor', 'visual merchandiser', 'stock manager'],
      es: ['vendedor', 'cajero', 'jefe de sección', 'director de tienda', 'asesor de clientes', 'escaparatista', 'gestor de stock'],
      ar: ['بائع', 'أمين صندوق', 'مدير قسم', 'مدير متجر', 'مستشار عملاء', 'عرض واجهات', 'مدير مخزون'],
      zh: ['销售员', '收银员', '部门经理', '店长', '客户顾问', '视觉陈列师', '库存管理员'],
    },
  },
  {
    id: 7,
    name: {
      fr: 'Commerce de gros / Import-Export',
      en: 'Wholesale / Import-Export',
      es: 'Comercio Mayorista / Importación-Exportación',
      ar: 'تجارة الجملة / الاستيراد والتصدير',
      zh: '批发 / 进出口',
    },
    synonyms: {
      fr: ['gros', 'import', 'export', 'import-export', 'commerce international', 'négociant', 'grossiste'],
      en: ['wholesale', 'import', 'export', 'import-export', 'international trade', 'trader', 'wholesaler'],
      es: ['mayorista', 'importación', 'exportación', 'importación-exportación', 'comercio internacional', 'comerciante', 'mayorista'],
      ar: ['جملة', 'استيراد', 'تصدير', 'استيراد وتصدير', 'تجارة دولية', 'تاجر', 'تاجر جملة'],
      zh: ['批发', '进口', '出口', '进出口', '国际贸易', '贸易商', '批发商'],
    },
    relatedJobs: {
      fr: ['négociant', 'grossiste', 'importateur', 'exportateur', 'agent commercial', 'courtier', 'acheteur', 'chef de produit'],
      en: ['trader', 'wholesaler', 'importer', 'exporter', 'commercial agent', 'broker', 'buyer', 'product manager'],
      es: ['comerciante', 'mayorista', 'importador', 'exportador', 'agente comercial', 'corredor', 'comprador', 'jefe de producto'],
      ar: ['تاجر', 'تاجر جملة', 'مستورد', 'مصدر', 'وكيل تجاري', 'وسيط', 'مشتري', 'مدير منتج'],
      zh: ['贸易商', '批发商', '进口商', '出口商', '商业代理', '经纪人', '采购员', '产品经理'],
    },
  },
  {
    id: 8,
    name: {
      fr: 'Industrie manufacturière',
      en: 'Manufacturing Industry',
      es: 'Industria Manufacturera',
      ar: 'الصناعة التحويلية',
      zh: '制造业',
    },
    synonyms: {
      fr: ['industrie', 'manufacture', 'production', 'usine', 'fabrication', 'assemblage', 'transformation'],
      en: ['industry', 'manufacturing', 'production', 'factory', 'fabrication', 'assembly', 'processing'],
      es: ['industria', 'manufactura', 'producción', 'fábrica', 'fabricación', 'ensamblaje', 'transformación'],
      ar: ['صناعة', 'تصنيع', 'إنتاج', 'مصنع', 'تصنيع', 'تجميع', 'تحويل'],
      zh: ['工业', '制造业', '生产', '工厂', '制造', '装配', '加工'],
    },
    relatedJobs: {
      fr: ['opérateur de production', 'conducteur de machine', 'monteur', 'soudeur', 'ajusteur', 'contrôleur qualité', 'chef d\'atelier', 'ingénieur production'],
      en: ['production operator', 'machine operator', 'assembler', 'welder', 'fitter', 'quality controller', 'workshop supervisor', 'production engineer'],
      es: ['operario de producción', 'operador de máquina', 'montador', 'soldador', 'ajustador', 'controlador de calidad', 'jefe de taller', 'ingeniero de producción'],
      ar: ['عامل إنتاج', 'مشغل آلة', 'مجمّع', 'لحام', 'معدل', 'مراقب جودة', 'مشرف ورشة', 'مهندس إنتاج'],
      zh: ['生产操作员', '机器操作员', '装配工', '焊工', '装配工', '质量检验员', '车间主管', '生产工程师'],
    },
  },
  {
    id: 9,
    name: {
      fr: 'Énergie (pétrole, gaz, renouvelables)',
      en: 'Energy (Oil, Gas, Renewables)',
      es: 'Energía (Petróleo, Gas, Renovables)',
      ar: 'الطاقة (النفط والغاز والطاقات المتجددة)',
      zh: '能源（石油、天然气、可再生能源）',
    },
    synonyms: {
      fr: ['énergie', 'pétrole', 'gaz', 'renouvelable', 'solaire', 'éolien', 'nucléaire', 'électricité'],
      en: ['energy', 'oil', 'gas', 'renewable', 'solar', 'wind', 'nuclear', 'electricity'],
      es: ['energía', 'petróleo', 'gas', 'renovable', 'solar', 'eólico', 'nuclear', 'electricidad'],
      ar: ['طاقة', 'نفط', 'غاز', 'متجدد', 'شمسي', 'رياح', 'نووي', 'كهرباء'],
      zh: ['能源', '石油', '天然气', '可再生能源', '太阳能', '风能', '核能', '电力'],
    },
    relatedJobs: {
      fr: ['ingénieur énergie', 'technicien pétrolier', 'installateur solaire', 'électricien', 'opérateur de centrale', 'géologue pétrolier', 'ingénieur éolien'],
      en: ['energy engineer', 'petroleum technician', 'solar installer', 'electrician', 'power plant operator', 'petroleum geologist', 'wind engineer'],
      es: ['ingeniero de energía', 'técnico petrolero', 'instalador solar', 'electricista', 'operador de central', 'geólogo petrolero', 'ingeniero eólico'],
      ar: ['مهندس طاقة', 'فني نفط', 'مثبت طاقة شمسية', 'كهربائي', 'مشغل محطة', 'جيولوجي نفط', 'مهندس رياح'],
      zh: ['能源工程师', '石油技术员', '太阳能安装工', '电工', '发电厂操作员', '石油地质学家', '风能工程师'],
    },
  },
  {
    id: 10,
    name: {
      fr: 'Informatique & Développement logiciel',
      en: 'IT & Software Development',
      es: 'Informática & Desarrollo de Software',
      ar: 'تقنية المعلومات وتطوير البرمجيات',
      zh: '信息技术与软件开发',
    },
    synonyms: {
      fr: ['informatique', 'développement', 'logiciel', 'programmation', 'code', 'développeur', 'developpeur', 'dev', 'info', 'tech', 'it'],
      en: ['it', 'software', 'development', 'programming', 'code', 'developer', 'dev', 'tech'],
      es: ['informática', 'desarrollo', 'software', 'programación', 'código', 'desarrollador', 'dev', 'tecnología'],
      ar: ['معلوماتية', 'تطوير', 'برمجيات', 'برمجة', 'كود', 'مطور', 'تقنية'],
      zh: ['信息技术', '开发', '软件', '编程', '代码', '开发者', '技术'],
    },
    relatedJobs: {
      fr: ['développeur', 'programmeur', 'ingénieur logiciel', 'architecte logiciel', 'devops', 'testeur', 'chef de projet it', 'analyste'],
      en: ['developer', 'programmer', 'software engineer', 'software architect', 'devops', 'tester', 'it project manager', 'analyst'],
      es: ['desarrollador', 'programador', 'ingeniero de software', 'arquitecto de software', 'devops', 'tester', 'jefe de proyecto it', 'analista'],
      ar: ['مطور', 'مبرمج', 'مهندس برمجيات', 'مهندس معماري برمجيات', 'ديفوبس', 'مختبر', 'مدير مشروع تقنية', 'محلل'],
      zh: ['开发者', '程序员', '软件工程师', '软件架构师', '运维开发', '测试员', 'IT项目经理', '分析师'],
    },
  },
  // Thématiques 11-75 complètes avec synonymes et métiers liés
  // Note: Les entrées suivantes sont structurées de manière compacte mais complète
  // Chaque thématique inclut: id, name (5 langues), synonyms (5 langues), relatedJobs (5 langues)
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
  // Thématiques 13-75 complètes avec synonymes et métiers liés en 5 langues
  // Note: Les entrées suivantes incluent les synonymes de base et métiers liés principaux
  // Pour des raisons d'espace, certaines listes sont compactes mais fonctionnelles
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
      fr: ['immobilier', 'bien', 'propriété', 'agence immobilière'],
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
    name: { fr: 'Hôtellerie', en: 'Hospitality', es: 'Hostelería', ar: 'الضيافة', zh: '酒店业' },
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
    name: { fr: 'Restauration', en: 'Restaurant / Food Service', es: 'Restauración', ar: 'المطاعم', zh: '餐饮' },
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
    name: { fr: 'Tourisme & Loisirs', en: 'Tourism & Leisure', es: 'Turismo & Ocio', ar: 'السياحة والترفيه', zh: '旅游与休闲' },
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
    name: { fr: 'Sécurité & Défense', en: 'Security & Defense', es: 'Seguridad & Defensa', ar: 'الأمن والدفاع', zh: '安全与国防' },
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
    name: { fr: 'Maintenance & Réparation', en: 'Maintenance & Repair', es: 'Mantenimiento & Reparación', ar: 'الصيانة والإصلاح', zh: '维护与维修' },
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
    name: { fr: 'Artisanat', en: 'Crafts', es: 'Artesanía', ar: 'الحرف اليدوية', zh: '手工艺' },
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
  // Thématiques 21-75 complètes avec synonymes et métiers liés en 5 langues
  // Note: Les entrées incluent les synonymes de base et métiers principaux
  // Les listes peuvent être complétées progressivement selon les besoins
  {
    id: 21,
    name: { fr: 'Automobile & Mobilité', en: 'Automotive & Mobility', es: 'Automoción & Movilidad', ar: 'السيارات والتنقل', zh: '汽车与出行' },
    synonyms: {
      fr: ['automobile', 'auto', 'voiture', 'mobilité', 'transport'],
      en: ['automotive', 'car', 'vehicle', 'mobility', 'transport'],
      es: ['automoción', 'coche', 'vehículo', 'movilidad', 'transporte'],
      ar: ['سيارة', 'سيارات', 'تنقل', 'نقل'],
      zh: ['汽车', '车辆', '出行', '交通'],
    },
    relatedJobs: {
      fr: ['mécanicien auto', 'garagiste', 'vendeur automobile', 'expert automobile', 'carrossier'],
      en: ['auto mechanic', 'garage worker', 'car salesman', 'automotive expert', 'bodywork specialist'],
      es: ['mecánico auto', 'tallerista', 'vendedor auto', 'experto automoción', 'carrocero'],
      ar: ['ميكانيكي سيارات', 'عامل ورشة', 'بائع سيارات', 'خبير سيارات', 'صانع هيكل'],
      zh: ['汽车修理工', '修车工', '汽车销售', '汽车专家', '车身工'],
    },
  },
  {
    id: 22,
    name: { fr: 'Aéronautique & Spatial', en: 'Aerospace', es: 'Aeronáutica & Espacial', ar: 'الطيران والفضاء', zh: '航空航天' },
    synonyms: {
      fr: ['aéronautique', 'aérospatial', 'aviation', 'spatial', 'aéro'],
      en: ['aerospace', 'aviation', 'aircraft', 'space', 'aero'],
      es: ['aeronáutica', 'aeroespacial', 'aviación', 'espacial'],
      ar: ['طيران', 'فضاء', 'طائرات'],
      zh: ['航空航天', '航空', '航天', '飞机'],
    },
    relatedJobs: {
      fr: ['pilote', 'mécanicien aéronautique', 'ingénieur aérospatial', 'contrôleur aérien', 'technicien avion'],
      en: ['pilot', 'aeronautical mechanic', 'aerospace engineer', 'air traffic controller', 'aircraft technician'],
      es: ['piloto', 'mecánico aeronáutico', 'ingeniero aeroespacial', 'controlador aéreo', 'técnico avión'],
      ar: ['طيار', 'ميكانيكي طيران', 'مهندس طيران', 'مراقب جوي', 'فني طائرات'],
      zh: ['飞行员', '航空机械师', '航空航天工程师', '空中交通管制员', '飞机技术员'],
    },
  },
  {
    id: 23,
    name: { fr: 'Maritime & Ports', en: 'Maritime & Ports', es: 'Marítimo & Puertos', ar: 'البحرية والموانئ', zh: '海事与港口' },
    synonyms: {
      fr: ['maritime', 'marine', 'port', 'naval', 'mer'],
      en: ['maritime', 'marine', 'port', 'naval', 'sea'],
      es: ['marítimo', 'marina', 'puerto', 'naval'],
      ar: ['بحرية', 'موانئ', 'بحر'],
      zh: ['海事', '港口', '海运'],
    },
    relatedJobs: {
      fr: ['marin', 'capitaine', 'officier marine', 'portuaire', 'dockers'],
      en: ['sailor', 'captain', 'naval officer', 'port worker', 'docker'],
      es: ['marinero', 'capitán', 'oficial marina', 'portuario', 'estibador'],
      ar: ['بحار', 'قبطان', 'ضابط بحري', 'عامل ميناء', 'عامل رصيف'],
      zh: ['海员', '船长', '海军军官', '港口工人', '码头工人'],
    },
  },
  {
    id: 24,
    name: { fr: 'Mines & Extraction', en: 'Mining & Extraction', es: 'Minas & Extracción', ar: 'التعدين والاستخراج', zh: '采矿与开采' },
    synonyms: {
      fr: ['mines', 'extraction', 'minier', 'carrière', 'exploitation'],
      en: ['mining', 'extraction', 'quarry', 'excavation'],
      es: ['minas', 'extracción', 'cantera', 'explotación'],
      ar: ['تعدين', 'استخراج', 'مناجم'],
      zh: ['采矿', '开采', '矿业'],
    },
    relatedJobs: {
      fr: ['mineur', 'géologue', 'ingénieur mines', 'opérateur extraction', 'foreur'],
      en: ['miner', 'geologist', 'mining engineer', 'extraction operator', 'driller'],
      es: ['minero', 'geólogo', 'ingeniero minas', 'operador extracción', 'perforador'],
      ar: ['عامل منجم', 'جيولوجي', 'مهندس مناجم', 'مشغل استخراج', 'حفار'],
      zh: ['矿工', '地质学家', '采矿工程师', '开采操作员', '钻工'],
    },
  },
  {
    id: 25,
    name: { fr: 'Chimie & Pharmaceutique', en: 'Chemistry & Pharmaceutical', es: 'Química & Farmacéutica', ar: 'الكيمياء والصيدلة', zh: '化学与制药' },
    synonyms: {
      fr: ['chimie', 'pharmaceutique', 'pharma', 'laboratoire', 'recherche'],
      en: ['chemistry', 'pharmaceutical', 'pharma', 'laboratory', 'research'],
      es: ['química', 'farmacéutica', 'farma', 'laboratorio'],
      ar: ['كيمياء', 'صيدلة', 'مخبر'],
      zh: ['化学', '制药', '实验室'],
    },
    relatedJobs: {
      fr: ['chimiste', 'pharmacien', 'ingénieur pharma', 'technicien laboratoire', 'chercheur'],
      en: ['chemist', 'pharmacist', 'pharma engineer', 'laboratory technician', 'researcher'],
      es: ['químico', 'farmacéutico', 'ingeniero farma', 'técnico laboratorio', 'investigador'],
      ar: ['كيميائي', 'صيدلي', 'مهندس صيدلة', 'فني مخبر', 'باحث'],
      zh: ['化学家', '药剂师', '制药工程师', '实验室技术员', '研究员'],
    },
  },
  // Thématiques 26-75 complètes avec synonymes de base en 5 langues
  // Note: Les synonymes et métiers peuvent être complétés progressivement
  {
    id: 26,
    name: { fr: 'Textile & Mode', en: 'Textile & Fashion', es: 'Textil & Moda', ar: 'النسيج والأزياء', zh: '纺织与时尚' },
    synonyms: {
      fr: ['textile', 'mode', 'fashion', 'vêtement', 'habillement'],
      en: ['textile', 'fashion', 'clothing', 'apparel', 'garment'],
      es: ['textil', 'moda', 'ropa', 'vestimenta', 'prenda'],
      ar: ['نسيج', 'أزياء', 'ملابس', 'ثياب'],
      zh: ['纺织', '时尚', '服装', '服饰'],
    },
    relatedJobs: {
      fr: ['styliste', 'couturier', 'modéliste', 'tisserand', 'designer mode'],
      en: ['fashion designer', 'tailor', 'pattern maker', 'weaver', 'fashion designer'],
      es: ['diseñador moda', 'sastre', 'patronista', 'tejedor', 'diseñador moda'],
      ar: ['مصمم أزياء', 'خياط', 'نمط', 'نساج', 'مصمم أزياء'],
      zh: ['时装设计师', '裁缝', '制版师', '织工', '时尚设计师'],
    },
  },
  {
    id: 27,
    name: { fr: 'Beauté & Bien-être', en: 'Beauty & Wellness', es: 'Belleza & Bienestar', ar: 'الجمال والعافية', zh: '美容与健康' },
    synonyms: {
      fr: ['beauté', 'bien-être', 'cosmétique', 'esthétique', 'soin'],
      en: ['beauty', 'wellness', 'cosmetic', 'aesthetic', 'care'],
      es: ['belleza', 'bienestar', 'cosmética', 'estética', 'cuidado'],
      ar: ['جمال', 'عافية', 'مستحضرات', 'جمالية'],
      zh: ['美容', '健康', '化妆品', '美学'],
    },
    relatedJobs: {
      fr: ['esthéticienne', 'coiffeur', 'maquilleur', 'masseur', 'naturopathe'],
      en: ['esthetician', 'hairdresser', 'makeup artist', 'masseur', 'naturopath'],
      es: ['esteticista', 'peluquero', 'maquillador', 'masajista', 'naturopata'],
      ar: ['أخصائية تجميل', 'مصفف شعر', 'ماكياج', 'مدلك', 'معالج طبيعي'],
      zh: ['美容师', '发型师', '化妆师', '按摩师', '自然疗法师'],
    },
  },
  {
    id: 28,
    name: { fr: 'Nettoyage & Services à la personne', en: 'Cleaning & Personal Services', es: 'Limpieza & Servicios Personales', ar: 'التنظيف والخدمات الشخصية', zh: '清洁与个人服务' },
    synonyms: {
      fr: ['nettoyage', 'ménage', 'service', 'entretien', 'cleaning'],
      en: ['cleaning', 'housekeeping', 'service', 'maintenance', 'cleaning'],
      es: ['limpieza', 'limpieza', 'servicio', 'mantenimiento'],
      ar: ['تنظيف', 'خدمات', 'صيانة'],
      zh: ['清洁', '服务', '维护'],
    },
    relatedJobs: {
      fr: ['agent d\'entretien', 'femme de ménage', 'nettoyeur', 'aide à domicile', 'concierge'],
      en: ['cleaning agent', 'housekeeper', 'cleaner', 'home helper', 'concierge'],
      es: ['agente limpieza', 'limpiador', 'limpiador', 'ayuda doméstica', 'conserje'],
      ar: ['عامل نظافة', 'خادمة', 'منظف', 'مساعدة منزلية', 'بواب'],
      zh: ['清洁工', '管家', '清洁员', '家庭助手', '门卫'],
    },
  },
  {
    id: 29,
    name: { fr: 'Marketing & Publicité', en: 'Marketing & Advertising', es: 'Marketing & Publicidad', ar: 'التسويق والإعلان', zh: '营销与广告' },
    synonyms: {
      fr: ['marketing', 'publicité', 'pub', 'communication', 'promotion'],
      en: ['marketing', 'advertising', 'ad', 'communication', 'promotion'],
      es: ['marketing', 'publicidad', 'publicidad', 'comunicación'],
      ar: ['تسويق', 'إعلان', 'إشهار'],
      zh: ['营销', '广告', '宣传'],
    },
    relatedJobs: {
      fr: ['chef de produit', 'responsable marketing', 'publicitaire', 'community manager', 'chargé communication'],
      en: ['product manager', 'marketing manager', 'advertiser', 'community manager', 'communication officer'],
      es: ['jefe producto', 'responsable marketing', 'publicista', 'community manager', 'responsable comunicación'],
      ar: ['مدير منتج', 'مدير تسويق', 'إعلاني', 'مدير مجتمع', 'مسؤول اتصال'],
      zh: ['产品经理', '营销经理', '广告人', '社区经理', '传播负责人'],
    },
  },
  {
    id: 30,
    name: { fr: 'Communication & Relations publiques', en: 'Communication & Public Relations', es: 'Comunicación & Relaciones Públicas', ar: 'الاتصال والعلاقات العامة', zh: '传播与公共关系' },
    synonyms: {
      fr: ['communication', 'relations publiques', 'rp', 'média', 'presse'],
      en: ['communication', 'public relations', 'pr', 'media', 'press'],
      es: ['comunicación', 'relaciones públicas', 'rp', 'medios'],
      ar: ['اتصال', 'علاقات عامة', 'إعلام'],
      zh: ['传播', '公共关系', '媒体'],
    },
    relatedJobs: {
      fr: ['attaché de presse', 'responsable communication', 'chargé rp', 'journaliste', 'rédacteur'],
      en: ['press attaché', 'communication manager', 'pr officer', 'journalist', 'editor'],
      es: ['attaché prensa', 'responsable comunicación', 'oficial rp', 'periodista', 'redactor'],
      ar: ['ملحق صحفي', 'مسؤول اتصال', 'مسؤول علاقات عامة', 'صحفي', 'محرر'],
      zh: ['新闻专员', '传播经理', '公关专员', '记者', '编辑'],
    },
  },
  {
    id: 31,
    name: { fr: 'Médias & Journalisme', en: 'Media & Journalism', es: 'Medios & Periodismo', ar: 'الإعلام والصحافة', zh: '媒体与新闻' },
    synonyms: {
      fr: ['médias', 'journalisme', 'presse', 'information', 'actualité'],
      en: ['media', 'journalism', 'press', 'information', 'news'],
      es: ['medios', 'periodismo', 'prensa', 'información'],
      ar: ['إعلام', 'صحافة', 'أخبار'],
      zh: ['媒体', '新闻', '新闻'],
    },
    relatedJobs: {
      fr: ['journaliste', 'rédacteur', 'reporter', 'présentateur', 'photographe presse'],
      en: ['journalist', 'editor', 'reporter', 'presenter', 'press photographer'],
      es: ['periodista', 'redactor', 'reportero', 'presentador', 'fotógrafo prensa'],
      ar: ['صحفي', 'محرر', 'مراسل', 'مذيع', 'مصور صحفي'],
      zh: ['记者', '编辑', '通讯员', '主持人', '新闻摄影师'],
    },
  },
  {
    id: 32,
    name: { fr: 'Audiovisuel & Cinéma', en: 'Audiovisual & Cinema', es: 'Audiovisual & Cine', ar: 'الصوتي المرئي والسينما', zh: '视听与电影' },
    synonyms: {
      fr: ['audiovisuel', 'cinéma', 'film', 'vidéo', 'télévision'],
      en: ['audiovisual', 'cinema', 'film', 'video', 'television'],
      es: ['audiovisual', 'cine', 'película', 'video'],
      ar: ['صوتي مرئي', 'سينما', 'فيلم'],
      zh: ['视听', '电影', '视频'],
    },
    relatedJobs: {
      fr: ['réalisateur', 'caméraman', 'monteur', 'ingénieur son', 'producteur'],
      en: ['director', 'cameraman', 'editor', 'sound engineer', 'producer'],
      es: ['director', 'cámara', 'montador', 'ingeniero sonido', 'productor'],
      ar: ['مخرج', 'مصور', 'محرر', 'مهندس صوت', 'منتج'],
      zh: ['导演', '摄影师', '剪辑师', '音响工程师', '制片人'],
    },
  },
  {
    id: 33,
    name: { fr: 'Musique & Spectacle vivant', en: 'Music & Performing Arts', es: 'Música & Artes Escénicas', ar: 'الموسيقى والفنون المسرحية', zh: '音乐与表演艺术' },
    synonyms: {
      fr: ['musique', 'spectacle', 'théâtre', 'concert', 'artiste'],
      en: ['music', 'performing arts', 'theater', 'concert', 'artist'],
      es: ['música', 'artes escénicas', 'teatro', 'concierto'],
      ar: ['موسيقى', 'فنون مسرحية', 'مسرح'],
      zh: ['音乐', '表演艺术', '戏剧'],
    },
    relatedJobs: {
      fr: ['musicien', 'chanteur', 'comédien', 'danseur', 'metteur en scène'],
      en: ['musician', 'singer', 'actor', 'dancer', 'director'],
      es: ['músico', 'cantante', 'actor', 'bailarín', 'director'],
      ar: ['موسيقي', 'مغني', 'ممثل', 'راقص', 'مخرج'],
      zh: ['音乐家', '歌手', '演员', '舞蹈家', '导演'],
    },
  },
  {
    id: 34,
    name: { fr: 'Jeux vidéo & Esport', en: 'Video Games & Esports', es: 'Videojuegos & Esports', ar: 'ألعاب الفيديو والرياضات الإلكترونية', zh: '电子游戏与电子竞技' },
    synonyms: {
      fr: ['jeux vidéo', 'gaming', 'esport', 'jeu', 'vidéoludique'],
      en: ['video games', 'gaming', 'esports', 'game', 'gaming'],
      es: ['videojuegos', 'gaming', 'esports', 'juego'],
      ar: ['ألعاب فيديو', 'ألعاب', 'رياضات إلكترونية'],
      zh: ['电子游戏', '游戏', '电子竞技'],
    },
    relatedJobs: {
      fr: ['développeur jeux', 'game designer', 'testeur jeux', 'joueur esport', 'streamer'],
      en: ['game developer', 'game designer', 'game tester', 'esports player', 'streamer'],
      es: ['desarrollador juegos', 'diseñador juegos', 'tester juegos', 'jugador esports', 'streamer'],
      ar: ['مطور ألعاب', 'مصمم ألعاب', 'مختبر ألعاب', 'لاعب رياضات', 'بث مباشر'],
      zh: ['游戏开发者', '游戏设计师', '游戏测试员', '电子竞技选手', '主播'],
    },
  },
  {
    id: 35,
    name: { fr: 'Design & Création graphique', en: 'Design & Graphic Creation', es: 'Diseño & Creación Gráfica', ar: 'التصميم والإنشاء الرسومي', zh: '设计与平面创作' },
    synonyms: {
      fr: ['design', 'graphisme', 'création', 'graphique', 'visuel'],
      en: ['design', 'graphics', 'creation', 'graphic', 'visual'],
      es: ['diseño', 'gráfico', 'creación', 'gráfico'],
      ar: ['تصميم', 'رسومي', 'إنشاء'],
      zh: ['设计', '平面', '创作'],
    },
    relatedJobs: {
      fr: ['graphiste', 'designer', 'directeur artistique', 'illustrateur', 'web designer'],
      en: ['graphic designer', 'designer', 'art director', 'illustrator', 'web designer'],
      es: ['diseñador gráfico', 'diseñador', 'director artístico', 'ilustrador', 'diseñador web'],
      ar: ['مصمم رسومي', 'مصمم', 'مدير فني', 'رسام', 'مصمم ويب'],
      zh: ['平面设计师', '设计师', '艺术总监', '插画师', '网页设计师'],
    },
  },
  {
    id: 36,
    name: { fr: 'Architecture & Urbanisme', en: 'Architecture & Urban Planning', es: 'Arquitectura & Urbanismo', ar: 'الهندسة المعمارية والتخطيط الحضري', zh: '建筑与城市规划' },
    synonyms: {
      fr: ['architecture', 'urbanisme', 'bâtiment', 'construction', 'aménagement'],
      en: ['architecture', 'urban planning', 'building', 'construction', 'planning'],
      es: ['arquitectura', 'urbanismo', 'edificación', 'construcción'],
      ar: ['هندسة معمارية', 'تخطيط حضري', 'بناء'],
      zh: ['建筑', '城市规划', '建设'],
    },
    relatedJobs: {
      fr: ['architecte', 'urbaniste', 'paysagiste', 'dessinateur proj', 'maître d\'œuvre'],
      en: ['architect', 'urban planner', 'landscape architect', 'draftsman', 'project manager'],
      es: ['arquitecto', 'urbanista', 'paisajista', 'dibujante', 'director obra'],
      ar: ['مهندس معماري', 'مخطط حضري', 'مهندس مناظر', 'رسام', 'مدير مشروع'],
      zh: ['建筑师', '城市规划师', '景观设计师', '绘图员', '项目经理'],
    },
  },
  {
    id: 37,
    name: { fr: 'Recherche & Développement (R&D)', en: 'Research & Development (R&D)', es: 'Investigación & Desarrollo (I+D)', ar: 'البحث والتطوير', zh: '研发' },
    synonyms: {
      fr: ['recherche', 'développement', 'r&d', 'innovation', 'expérimentation'],
      en: ['research', 'development', 'r&d', 'innovation', 'experimentation'],
      es: ['investigación', 'desarrollo', 'i+d', 'innovación'],
      ar: ['بحث', 'تطوير', 'ابتكار'],
      zh: ['研究', '开发', '创新'],
    },
    relatedJobs: {
      fr: ['chercheur', 'ingénieur r&d', 'innovateur', 'scientifique', 'ingénieur recherche'],
      en: ['researcher', 'r&d engineer', 'innovator', 'scientist', 'research engineer'],
      es: ['investigador', 'ingeniero i+d', 'innovador', 'científico'],
      ar: ['باحث', 'مهندس بحث وتطوير', 'مبتكر', 'عالم'],
      zh: ['研究员', '研发工程师', '创新者', '科学家'],
    },
  },
  {
    id: 38,
    name: { fr: 'Sciences & Laboratoires', en: 'Sciences & Laboratories', es: 'Ciencias & Laboratorios', ar: 'العلوم والمختبرات', zh: '科学与实验室' },
    synonyms: {
      fr: ['sciences', 'laboratoire', 'recherche scientifique', 'expérimentation', 'analyse'],
      en: ['sciences', 'laboratory', 'scientific research', 'experimentation', 'analysis'],
      es: ['ciencias', 'laboratorio', 'investigación científica'],
      ar: ['علوم', 'مخبر', 'بحث علمي'],
      zh: ['科学', '实验室', '科学研究'],
    },
    relatedJobs: {
      fr: ['scientifique', 'chercheur', 'technicien laboratoire', 'analyste', 'biologiste'],
      en: ['scientist', 'researcher', 'laboratory technician', 'analyst', 'biologist'],
      es: ['científico', 'investigador', 'técnico laboratorio', 'analista'],
      ar: ['عالم', 'باحث', 'فني مخبر', 'محلل'],
      zh: ['科学家', '研究员', '实验室技术员', '分析师'],
    },
  },
  {
    id: 39,
    name: { fr: 'Environnement & Développement durable', en: 'Environment & Sustainable Development', es: 'Medio Ambiente & Desarrollo Sostenible', ar: 'البيئة والتنمية المستدامة', zh: '环境与可持续发展' },
    synonyms: {
      fr: ['environnement', 'développement durable', 'écologie', 'durable', 'vert'],
      en: ['environment', 'sustainable development', 'ecology', 'sustainable', 'green'],
      es: ['medio ambiente', 'desarrollo sostenible', 'ecología'],
      ar: ['بيئة', 'تنمية مستدامة', 'بيئة'],
      zh: ['环境', '可持续发展', '生态'],
    },
    relatedJobs: {
      fr: ['écologue', 'ingénieur environnement', 'consultant environnement', 'animateur nature', 'garde environnement'],
      en: ['ecologist', 'environmental engineer', 'environmental consultant', 'nature animator', 'environmental guard'],
      es: ['ecólogo', 'ingeniero medio ambiente', 'consultor medio ambiente', 'animador naturaleza'],
      ar: ['عالم بيئة', 'مهندس بيئة', 'مستشار بيئة', 'منشط طبيعة'],
      zh: ['生态学家', '环境工程师', '环境顾问', '自然活动组织者'],
    },
  },
  {
    id: 40,
    name: { fr: 'Gestion des déchets & Recyclage', en: 'Waste Management & Recycling', es: 'Gestión Residuos & Reciclaje', ar: 'إدارة النفايات وإعادة التدوير', zh: '废物管理与回收' },
    synonyms: {
      fr: ['déchets', 'recyclage', 'gestion déchets', 'valorisation', 'tri'],
      en: ['waste', 'recycling', 'waste management', 'valorization', 'sorting'],
      es: ['residuos', 'reciclaje', 'gestión residuos'],
      ar: ['نفايات', 'إعادة تدوير', 'إدارة نفايات'],
      zh: ['废物', '回收', '废物管理'],
    },
    relatedJobs: {
      fr: ['éboueur', 'tri déchets', 'technicien recyclage', 'gestionnaire déchets', 'opérateur tri'],
      en: ['waste collector', 'waste sorting', 'recycling technician', 'waste manager', 'sorting operator'],
      es: ['recolector basura', 'tri residuos', 'técnico reciclaje', 'gestor residuos'],
      ar: ['جامع قمامة', 'فرز نفايات', 'فني إعادة تدوير', 'مدير نفايات'],
      zh: ['垃圾收集员', '废物分类', '回收技术员', '废物管理员'],
    },
  },
  {
    id: 41,
    name: { fr: 'Administration publique', en: 'Public Administration', es: 'Administración Pública', ar: 'الإدارة العامة', zh: '公共管理' },
    synonyms: {
      fr: ['administration', 'publique', 'fonction publique', 'service public', 'état'],
      en: ['administration', 'public', 'civil service', 'public service', 'state'],
      es: ['administración', 'pública', 'función pública'],
      ar: ['إدارة', 'عامة', 'خدمة مدنية'],
      zh: ['管理', '公共', '公共服务'],
    },
    relatedJobs: {
      fr: ['fonctionnaire', 'agent administratif', 'secrétaire mairie', 'attaché territorial', 'directeur service'],
      en: ['civil servant', 'administrative agent', 'town hall secretary', 'territorial attaché', 'service director'],
      es: ['funcionario', 'agente administrativo', 'secretario ayuntamiento'],
      ar: ['موظف مدني', 'عامل إداري', 'سكرتير بلدية'],
      zh: ['公务员', '行政人员', '市政秘书'],
    },
  },
  {
    id: 42,
    name: { fr: 'Justice & Droit', en: 'Justice & Law', es: 'Justicia & Derecho', ar: 'العدالة والقانون', zh: '司法与法律' },
    synonyms: {
      fr: ['justice', 'droit', 'juridique', 'légal', 'avocat'],
      en: ['justice', 'law', 'legal', 'attorney', 'lawyer'],
      es: ['justicia', 'derecho', 'jurídico', 'legal'],
      ar: ['عدالة', 'قانون', 'قانوني'],
      zh: ['司法', '法律', '法律'],
    },
    relatedJobs: {
      fr: ['avocat', 'juge', 'notaire', 'huissier', 'juriste'],
      en: ['lawyer', 'judge', 'notary', 'bailiff', 'jurist'],
      es: ['abogado', 'juez', 'notario', 'alguacil'],
      ar: ['محام', 'قاضي', 'كاتب عدل', 'ناظر'],
      zh: ['律师', '法官', '公证人', '法警'],
    },
  },
  {
    id: 43,
    name: { fr: 'Ressources humaines', en: 'Human Resources', es: 'Recursos Humanos', ar: 'الموارد البشرية', zh: '人力资源' },
    synonyms: {
      fr: ['rh', 'ressources humaines', 'recrutement', 'gestion personnel', 'drh'],
      en: ['hr', 'human resources', 'recruitment', 'personnel management', 'hr director'],
      es: ['rr hh', 'recursos humanos', 'reclutamiento', 'gestión personal'],
      ar: ['موارد بشرية', 'توظيف', 'إدارة شؤون'],
      zh: ['人力资源', '招聘', '人事管理'],
    },
    relatedJobs: {
      fr: ['responsable rh', 'recruteur', 'gestionnaire paie', 'assistant rh', 'directeur rh'],
      en: ['hr manager', 'recruiter', 'payroll manager', 'hr assistant', 'hr director'],
      es: ['responsable rr hh', 'reclutador', 'gestor nómina', 'asistente rr hh'],
      ar: ['مدير موارد بشرية', 'مستشار توظيف', 'مدير رواتب', 'مساعد موارد بشرية'],
      zh: ['人力资源经理', '招聘人员', '薪资经理', '人力资源助理'],
    },
  },
  {
    id: 44,
    name: { fr: 'Management & Direction d\'entreprise', en: 'Management & Corporate Leadership', es: 'Gestión & Dirección Empresarial', ar: 'الإدارة وقيادة الشركات', zh: '管理与企业领导' },
    synonyms: {
      fr: ['management', 'direction', 'gestion', 'leadership', 'encadrement'],
      en: ['management', 'leadership', 'administration', 'corporate', 'executive'],
      es: ['gestión', 'dirección', 'liderazgo', 'empresarial'],
      ar: ['إدارة', 'قيادة', 'إدارة'],
      zh: ['管理', '领导', '企业管理'],
    },
    relatedJobs: {
      fr: ['directeur', 'manager', 'chef projet', 'cadre', 'p-dg'],
      en: ['director', 'manager', 'project manager', 'executive', 'ceo'],
      es: ['director', 'gerente', 'jefe proyecto', 'ejecutivo'],
      ar: ['مدير', 'مدير', 'مدير مشروع', 'تنفيذي'],
      zh: ['总监', '经理', '项目经理', '高管'],
    },
  },
  {
    id: 45,
    name: { fr: 'Entrepreneuriat & Startups', en: 'Entrepreneurship & Startups', es: 'Emprendimiento & Startups', ar: 'ريادة الأعمال والشركات الناشئة', zh: '创业与初创企业' },
    synonyms: {
      fr: ['entrepreneuriat', 'startup', 'création entreprise', 'business', 'innovation'],
      en: ['entrepreneurship', 'startup', 'business creation', 'business', 'innovation'],
      es: ['emprendimiento', 'startup', 'creación empresa'],
      ar: ['ريادة أعمال', 'شركة ناشئة', 'إنشاء شركة'],
      zh: ['创业', '初创企业', '企业创建'],
    },
    relatedJobs: {
      fr: ['entrepreneur', 'fondateur', 'créateur startup', 'business developer', 'co-fondateur'],
      en: ['entrepreneur', 'founder', 'startup creator', 'business developer', 'co-founder'],
      es: ['emprendedor', 'fundador', 'creador startup', 'desarrollador negocio'],
      ar: ['رائد أعمال', 'مؤسس', 'منشئ شركة', 'مطور أعمال'],
      zh: ['企业家', '创始人', '初创企业创建者', '业务开发'],
    },
  },
  {
    id: 46,
    name: { fr: 'Conseil & Stratégie', en: 'Consulting & Strategy', es: 'Consultoría & Estrategia', ar: 'الاستشارات والاستراتيجية', zh: '咨询与战略' },
    synonyms: {
      fr: ['conseil', 'stratégie', 'consulting', 'conseil entreprise', 'cabinet'],
      en: ['consulting', 'strategy', 'consultancy', 'business consulting', 'firm'],
      es: ['consultoría', 'estrategia', 'consultoría empresa'],
      ar: ['استشارات', 'استراتيجية', 'استشارات أعمال'],
      zh: ['咨询', '战略', '企业咨询'],
    },
    relatedJobs: {
      fr: ['consultant', 'conseiller stratégie', 'analyste conseil', 'directeur conseil', 'associé cabinet'],
      en: ['consultant', 'strategy advisor', 'consulting analyst', 'consulting director', 'partner firm'],
      es: ['consultor', 'asesor estrategia', 'analista consultoría', 'director consultoría'],
      ar: ['مستشار', 'مستشار استراتيجية', 'محلل استشارات', 'مدير استشارات'],
      zh: ['顾问', '战略顾问', '咨询分析师', '咨询总监'],
    },
  },
  {
    id: 47,
    name: { fr: 'Audit & Contrôle', en: 'Audit & Control', es: 'Auditoría & Control', ar: 'التدقيق والرقابة', zh: '审计与控制' },
    synonyms: {
      fr: ['audit', 'contrôle', 'vérification', 'comptabilité', 'révision'],
      en: ['audit', 'control', 'verification', 'accounting', 'review'],
      es: ['auditoría', 'control', 'verificación', 'contabilidad'],
      ar: ['تدقيق', 'رقابة', 'تحقق', 'محاسبة'],
      zh: ['审计', '控制', '验证', '会计'],
    },
    relatedJobs: {
      fr: ['auditeur', 'contrôleur gestion', 'expert comptable', 'commissaire comptes', 'inspecteur'],
      en: ['auditor', 'management controller', 'accountant', 'auditor', 'inspector'],
      es: ['auditor', 'controller gestión', 'contador', 'auditor'],
      ar: ['مدقق', 'مراقب إدارة', 'محاسب', 'مدقق'],
      zh: ['审计员', '管理控制员', '会计师', '审计员'],
    },
  },
  {
    id: 48,
    name: { fr: 'Achats & Supply chain', en: 'Procurement & Supply Chain', es: 'Compras & Cadena Suministro', ar: 'المشتريات وسلسلة التوريد', zh: '采购与供应链' },
    synonyms: {
      fr: ['achats', 'supply chain', 'approvisionnement', 'logistique', 'procurement'],
      en: ['procurement', 'supply chain', 'purchasing', 'logistics', 'procurement'],
      es: ['compras', 'cadena suministro', 'aprovisionamiento', 'logística'],
      ar: ['مشتريات', 'سلسلة توريد', 'تزويد'],
      zh: ['采购', '供应链', '供应'],
    },
    relatedJobs: {
      fr: ['acheteur', 'responsable achats', 'gestionnaire supply chain', 'logisticien', 'approvisionneur'],
      en: ['buyer', 'procurement manager', 'supply chain manager', 'logistician', 'supplier'],
      es: ['comprador', 'responsable compras', 'gestor cadena suministro', 'logista'],
      ar: ['مشتري', 'مسؤول مشتريات', 'مدير سلسلة توريد', 'خبير لوجستي'],
      zh: ['采购员', '采购经理', '供应链经理', '物流师'],
    },
  },
  {
    id: 49,
    name: { fr: 'Qualité, Sécurité, Environnement (QSE)', en: 'Quality, Safety, Environment (QSE)', es: 'Calidad, Seguridad, Medio Ambiente (QSE)', ar: 'الجودة والسلامة والبيئة', zh: '质量、安全、环境' },
    synonyms: {
      fr: ['qse', 'qualité', 'sécurité', 'environnement', 'hse'],
      en: ['qse', 'quality', 'safety', 'environment', 'hse'],
      es: ['qse', 'calidad', 'seguridad', 'medio ambiente'],
      ar: ['جودة', 'سلامة', 'بيئة'],
      zh: ['质量', '安全', '环境'],
    },
    relatedJobs: {
      fr: ['responsable qse', 'auditeur qualité', 'préventeur', 'technicien qse', 'animateur sécurité'],
      en: ['qse manager', 'quality auditor', 'preventer', 'qse technician', 'safety animator'],
      es: ['responsable qse', 'auditor calidad', 'preventor', 'técnico qse'],
      ar: ['مسؤول جودة', 'مدقق جودة', 'وقائي', 'فني جودة'],
      zh: ['质量安全环境经理', '质量审计员', '预防员', '质量安全环境技术员'],
    },
  },
  {
    id: 50,
    name: { fr: 'Data, IA & Analyse', en: 'Data, AI & Analytics', es: 'Datos, IA & Análisis', ar: 'البيانات والذكاء الاصطناعي والتحليل', zh: '数据、人工智能与分析' },
    synonyms: {
      fr: ['data', 'ia', 'intelligence artificielle', 'analyse', 'big data', 'machine learning'],
      en: ['data', 'ai', 'artificial intelligence', 'analytics', 'big data', 'machine learning'],
      es: ['datos', 'ia', 'inteligencia artificial', 'análisis'],
      ar: ['بيانات', 'ذكاء اصطناعي', 'تحليل'],
      zh: ['数据', '人工智能', '分析'],
    },
    relatedJobs: {
      fr: ['data scientist', 'data analyst', 'ingénieur ia', 'ml engineer', 'data engineer'],
      en: ['data scientist', 'data analyst', 'ai engineer', 'ml engineer', 'data engineer'],
      es: ['científico datos', 'analista datos', 'ingeniero ia', 'ingeniero ml'],
      ar: ['عالم بيانات', 'محلل بيانات', 'مهندس ذكاء اصطناعي'],
      zh: ['数据科学家', '数据分析师', '人工智能工程师'],
    },
  },
  {
    id: 51,
    name: { fr: 'Cybersécurité', en: 'Cybersecurity', es: 'Ciberseguridad', ar: 'الأمن السيبراني', zh: '网络安全' },
    synonyms: {
      fr: ['cybersécurité', 'sécurité informatique', 'sécurité it', 'hacking', 'protection'],
      en: ['cybersecurity', 'it security', 'information security', 'hacking', 'protection'],
      es: ['ciberseguridad', 'seguridad informática', 'seguridad it'],
      ar: ['أمن سيبراني', 'أمن معلومات', 'أمن تقنية'],
      zh: ['网络安全', '信息安全', 'IT安全'],
    },
    relatedJobs: {
      fr: ['expert cybersécurité', 'pentester', 'analyste sécurité', 'consultant sécurité', 'soc analyst'],
      en: ['cybersecurity expert', 'pentester', 'security analyst', 'security consultant', 'soc analyst'],
      es: ['experto ciberseguridad', 'pentester', 'analista seguridad', 'consultor seguridad'],
      ar: ['خبير أمن سيبراني', 'مختبر اختراق', 'محلل أمن', 'مستشار أمن'],
      zh: ['网络安全专家', '渗透测试员', '安全分析师', '安全顾问'],
    },
  },
  {
    id: 52,
    name: { fr: 'E-commerce', en: 'E-commerce', es: 'Comercio Electrónico', ar: 'التجارة الإلكترونية', zh: '电子商务' },
    synonyms: {
      fr: ['e-commerce', 'commerce en ligne', 'vente en ligne', 'ecommerce', 'online'],
      en: ['e-commerce', 'online commerce', 'online sales', 'ecommerce', 'online'],
      es: ['comercio electrónico', 'comercio online', 'venta online'],
      ar: ['تجارة إلكترونية', 'تجارة عبر الإنترنت', 'بيع إلكتروني'],
      zh: ['电子商务', '在线商务', '在线销售'],
    },
    relatedJobs: {
      fr: ['e-commerçant', 'responsable e-commerce', 'webmarketer', 'gestionnaire marketplace', 'community manager'],
      en: ['e-commerce manager', 'online sales manager', 'web marketer', 'marketplace manager', 'community manager'],
      es: ['e-comerciante', 'responsable comercio electrónico', 'webmarketer', 'gestor marketplace'],
      ar: ['تاجر إلكتروني', 'مسؤول تجارة إلكترونية', 'مسوق ويب', 'مدير سوق'],
      zh: ['电商经理', '在线销售经理', '网络营销', '市场经理'],
    },
  },
  {
    id: 53,
    name: { fr: 'Plateformes & Économie numérique', en: 'Platforms & Digital Economy', es: 'Plataformas & Economía Digital', ar: 'المنصات والاقتصاد الرقمي', zh: '平台与数字经济' },
    synonyms: {
      fr: ['plateforme', 'économie numérique', 'digital', 'numérique', 'tech'],
      en: ['platform', 'digital economy', 'digital', 'tech'],
      es: ['plataforma', 'economía digital', 'digital'],
      ar: ['منصة', 'اقتصاد رقمي', 'رقمي'],
      zh: ['平台', '数字经济', '数字'],
    },
    relatedJobs: {
      fr: ['product manager', 'platform manager', 'digital strategist', 'tech lead', 'head of digital'],
      en: ['product manager', 'platform manager', 'digital strategist', 'tech lead', 'head of digital'],
      es: ['product manager', 'gestor plataforma', 'estratega digital'],
      ar: ['مدير منتج', 'مدير منصة', 'استراتيجي رقمي'],
      zh: ['产品经理', '平台经理', '数字战略家'],
    },
  },
  {
    id: 54,
    name: { fr: 'Support client & Call centers', en: 'Customer Support & Call Centers', es: 'Atención Cliente & Centros Llamadas', ar: 'دعم العملاء ومراكز الاتصال', zh: '客户支持与呼叫中心' },
    synonyms: {
      fr: ['support client', 'call center', 'service client', 'assistance', 'sav'],
      en: ['customer support', 'call center', 'customer service', 'assistance', 'support'],
      es: ['atención cliente', 'call center', 'servicio cliente', 'asistencia'],
      ar: ['دعم عملاء', 'مركز اتصال', 'خدمة عملاء'],
      zh: ['客户支持', '呼叫中心', '客户服务'],
    },
    relatedJobs: {
      fr: ['conseiller client', 'téléconseiller', 'responsable support', 'superviseur call center', 'agent service'],
      en: ['customer advisor', 'teleadvisor', 'support manager', 'call center supervisor', 'service agent'],
      es: ['asesor cliente', 'teleconsejero', 'responsable soporte', 'supervisor call center'],
      ar: ['مستشار عملاء', 'مستشار هاتفي', 'مسؤول دعم', 'مشرف مركز اتصال'],
      zh: ['客户顾问', '电话顾问', '支持经理', '呼叫中心主管'],
    },
  },
  {
    id: 55,
    name: { fr: 'Traduction & Langues', en: 'Translation & Languages', es: 'Traducción & Idiomas', ar: 'الترجمة واللغات', zh: '翻译与语言' },
    synonyms: {
      fr: ['traduction', 'langues', 'interprétation', 'linguistique', 'traducteur'],
      en: ['translation', 'languages', 'interpretation', 'linguistics', 'translator'],
      es: ['traducción', 'idiomas', 'interpretación', 'lingüística'],
      ar: ['ترجمة', 'لغات', 'ترجمة فورية'],
      zh: ['翻译', '语言', '口译'],
    },
    relatedJobs: {
      fr: ['traducteur', 'interprète', 'linguiste', 'localisateur', 'réviseur traduction'],
      en: ['translator', 'interpreter', 'linguist', 'localizer', 'translation reviewer'],
      es: ['traductor', 'intérprete', 'lingüista', 'localizador'],
      ar: ['مترجم', 'مترجم فوري', 'لغوي', 'محلي'],
      zh: ['翻译员', '口译员', '语言学家', '本地化员'],
    },
  },
  {
    id: 56,
    name: { fr: 'Culture & Patrimoine', en: 'Culture & Heritage', es: 'Cultura & Patrimonio', ar: 'الثقافة والتراث', zh: '文化与遗产' },
    synonyms: {
      fr: ['culture', 'patrimoine', 'musée', 'art', 'histoire'],
      en: ['culture', 'heritage', 'museum', 'art', 'history'],
      es: ['cultura', 'patrimonio', 'museo', 'arte'],
      ar: ['ثقافة', 'تراث', 'متحف', 'فن'],
      zh: ['文化', '遗产', '博物馆', '艺术'],
    },
    relatedJobs: {
      fr: ['conservateur', 'guide musée', 'historien', 'archéologue', 'médiateur culturel'],
      en: ['curator', 'museum guide', 'historian', 'archaeologist', 'cultural mediator'],
      es: ['conservador', 'guía museo', 'historiador', 'arqueólogo'],
      ar: ['حافظ', 'مرشد متحف', 'مؤرخ', 'أثري'],
      zh: ['馆长', '博物馆导游', '历史学家', '考古学家'],
    },
  },
  {
    id: 57,
    name: { fr: 'Événementiel', en: 'Events', es: 'Eventos', ar: 'الفعاليات', zh: '活动策划' },
    synonyms: {
      fr: ['événementiel', 'événement', 'organisation', 'séminaire', 'congrès'],
      en: ['events', 'event', 'organization', 'seminar', 'congress'],
      es: ['eventos', 'evento', 'organización', 'seminario'],
      ar: ['فعاليات', 'حدث', 'تنظيم'],
      zh: ['活动', '活动策划', '组织'],
    },
    relatedJobs: {
      fr: ['organisateur événements', 'événementiel', 'chef projet événement', 'coordinateur', 'planner'],
      en: ['event organizer', 'events manager', 'event project manager', 'coordinator', 'planner'],
      es: ['organizador eventos', 'gestor eventos', 'jefe proyecto eventos'],
      ar: ['منظم فعاليات', 'مدير فعاليات', 'مدير مشروع فعاليات'],
      zh: ['活动组织者', '活动经理', '活动项目经理'],
    },
  },
  {
    id: 58,
    name: { fr: 'Sport & Fitness', en: 'Sports & Fitness', es: 'Deporte & Fitness', ar: 'الرياضة واللياقة البدنية', zh: '体育与健身' },
    synonyms: {
      fr: ['sport', 'fitness', 'sportif', 'entraînement', 'gym'],
      en: ['sports', 'fitness', 'athletic', 'training', 'gym'],
      es: ['deporte', 'fitness', 'deportivo', 'entrenamiento'],
      ar: ['رياضة', 'لياقة', 'رياضي'],
      zh: ['体育', '健身', '运动'],
    },
    relatedJobs: {
      fr: ['entraîneur', 'coach sportif', 'éducateur sportif', 'moniteur fitness', 'professeur sport'],
      en: ['trainer', 'sports coach', 'sports educator', 'fitness instructor', 'sports teacher'],
      es: ['entrenador', 'coach deportivo', 'educador deportivo', 'instructor fitness'],
      ar: ['مدرب', 'مدرب رياضي', 'مربي رياضي', 'مدرب لياقة'],
      zh: ['教练', '体育教练', '体育教育者', '健身教练'],
    },
  },
  {
    id: 59,
    name: { fr: 'Coaching & Accompagnement', en: 'Coaching & Support', es: 'Coaching & Acompañamiento', ar: 'التدريب والدعم', zh: '教练与支持' },
    synonyms: {
      fr: ['coaching', 'accompagnement', 'mentorat', 'développement personnel', 'coach'],
      en: ['coaching', 'support', 'mentoring', 'personal development', 'coach'],
      es: ['coaching', 'acompañamiento', 'mentoría', 'desarrollo personal'],
      ar: ['تدريب', 'دعم', 'إرشاد', 'تنمية شخصية'],
      zh: ['教练', '支持', '指导', '个人发展'],
    },
    relatedJobs: {
      fr: ['coach', 'coach professionnel', 'mentor', 'accompagnateur', 'consultant coaching'],
      en: ['coach', 'professional coach', 'mentor', 'facilitator', 'coaching consultant'],
      es: ['coach', 'coach profesional', 'mentor', 'facilitador'],
      ar: ['مدرب', 'مدرب مهني', 'مرشد', 'مسهل'],
      zh: ['教练', '职业教练', '导师', '促进者'],
    },
  },
  {
    id: 60,
    name: { fr: 'Psychologie & Santé mentale', en: 'Psychology & Mental Health', es: 'Psicología & Salud Mental', ar: 'علم النفس والصحة العقلية', zh: '心理学与心理健康' },
    synonyms: {
      fr: ['psychologie', 'santé mentale', 'psychologue', 'thérapie', 'psychiatrie'],
      en: ['psychology', 'mental health', 'psychologist', 'therapy', 'psychiatry'],
      es: ['psicología', 'salud mental', 'psicólogo', 'terapia'],
      ar: ['نفس', 'صحة عقلية', 'طبيب نفسي'],
      zh: ['心理学', '心理健康', '心理学家'],
    },
    relatedJobs: {
      fr: ['psychologue', 'psychothérapeute', 'psychiatre', 'thérapeute', 'psychanalyste'],
      en: ['psychologist', 'psychotherapist', 'psychiatrist', 'therapist', 'psychoanalyst'],
      es: ['psicólogo', 'psicoterapeuta', 'psiquiatra', 'terapeuta'],
      ar: ['طبيب نفسي', 'معالج نفسي', 'طبيب نفسي', 'معالج'],
      zh: ['心理学家', '心理治疗师', '精神科医生', '治疗师'],
    },
  },
  {
    id: 61,
    name: { fr: 'Spiritualité & Développement personnel', en: 'Spirituality & Personal Development', es: 'Espiritualidad & Desarrollo Personal', ar: 'الروحانية والتنمية الشخصية', zh: '灵性与个人发展' },
    synonyms: {
      fr: ['spiritualité', 'développement personnel', 'méditation', 'bien-être', 'zen'],
      en: ['spirituality', 'personal development', 'meditation', 'wellness', 'zen'],
      es: ['espiritualidad', 'desarrollo personal', 'meditación', 'bienestar'],
      ar: ['روحانية', 'تنمية شخصية', 'تأمل'],
      zh: ['灵性', '个人发展', '冥想'],
    },
    relatedJobs: {
      fr: ['coach développement', 'praticien bien-être', 'animateur méditation', 'thérapeute énergétique', 'guide spirituel'],
      en: ['development coach', 'wellness practitioner', 'meditation instructor', 'energy therapist', 'spiritual guide'],
      es: ['coach desarrollo', 'practicante bienestar', 'instructor meditación'],
      ar: ['مدرب تنمية', 'ممارس عافية', 'مدرب تأمل'],
      zh: ['发展教练', '健康实践者', '冥想指导'],
    },
  },
  {
    id: 62,
    name: { fr: 'ONG & Humanitaire', en: 'NGO & Humanitarian', es: 'ONG & Humanitario', ar: 'المنظمات غير الحكومية والإنسانية', zh: '非政府组织与人道主义' },
    synonyms: {
      fr: ['ong', 'humanitaire', 'bénévolat', 'solidarité', 'aide'],
      en: ['ngo', 'humanitarian', 'volunteering', 'solidarity', 'aid'],
      es: ['ong', 'humanitario', 'voluntariado', 'solidaridad'],
      ar: ['منظمة غير حكومية', 'إنساني', 'تطوع'],
      zh: ['非政府组织', '人道主义', '志愿服务'],
    },
    relatedJobs: {
      fr: ['coordinateur ong', 'responsable projet', 'bénévole', 'chargé mission', 'directeur association'],
      en: ['ngo coordinator', 'project manager', 'volunteer', 'mission officer', 'association director'],
      es: ['coordinador ong', 'responsable proyecto', 'voluntario', 'oficial misión'],
      ar: ['منسق منظمة', 'مسؤول مشروع', 'متطوع', 'مسؤول مهمة'],
      zh: ['非政府组织协调员', '项目经理', '志愿者', '项目官员'],
    },
  },
  {
    id: 63,
    name: { fr: 'Politique & Relations internationales', en: 'Politics & International Relations', es: 'Política & Relaciones Internacionales', ar: 'السياسة والعلاقات الدولية', zh: '政治与国际关系' },
    synonyms: {
      fr: ['politique', 'relations internationales', 'diplomatie', 'gouvernement', 'parlement'],
      en: ['politics', 'international relations', 'diplomacy', 'government', 'parliament'],
      es: ['política', 'relaciones internacionales', 'diplomacia'],
      ar: ['سياسة', 'علاقات دولية', 'دبلوماسية'],
      zh: ['政治', '国际关系', '外交'],
    },
    relatedJobs: {
      fr: ['diplomate', 'attaché politique', 'conseiller politique', 'député', 'ministre'],
      en: ['diplomat', 'political attaché', 'political advisor', 'deputy', 'minister'],
      es: ['diplomático', 'attaché político', 'asesor político'],
      ar: ['دبلوماسي', 'ملحق سياسي', 'مستشار سياسي'],
      zh: ['外交官', '政治专员', '政治顾问'],
    },
  },
  {
    id: 64,
    name: { fr: 'Sécurité privée & Surveillance', en: 'Private Security & Surveillance', es: 'Seguridad Privada & Vigilancia', ar: 'الأمن الخاص والمراقبة', zh: '私人安全与监控' },
    synonyms: {
      fr: ['sécurité privée', 'surveillance', 'vigilance', 'gardiennage', 'protection'],
      en: ['private security', 'surveillance', 'vigilance', 'security guard', 'protection'],
      es: ['seguridad privada', 'vigilancia', 'vigilancia', 'guardia seguridad'],
      ar: ['أمن خاص', 'مراقبة', 'حراسة'],
      zh: ['私人安全', '监控', '保安'],
    },
    relatedJobs: {
      fr: ['agent sécurité', 'vigile', 'surveillant', 'garde sécurité', 'chef sécurité'],
      en: ['security agent', 'watchman', 'surveillance officer', 'security guard', 'security chief'],
      es: ['agente seguridad', 'vigilante', 'oficial vigilancia', 'guardia seguridad'],
      ar: ['عامل أمن', 'حارس', 'مراقب', 'حارس أمن'],
      zh: ['安全员', '看守', '监控员', '保安'],
    },
  },
  {
    id: 65,
    name: { fr: 'Domotique & Smart buildings', en: 'Home Automation & Smart Buildings', es: 'Domótica & Edificios Inteligentes', ar: 'المنزل الذكي والمباني الذكية', zh: '智能家居与智能建筑' },
    synonyms: {
      fr: ['domotique', 'smart building', 'maison intelligente', 'automatisation', 'iot'],
      en: ['home automation', 'smart building', 'smart home', 'automation', 'iot'],
      es: ['domótica', 'edificio inteligente', 'casa inteligente'],
      ar: ['منزل ذكي', 'مبنى ذكي', 'أتمتة'],
      zh: ['智能家居', '智能建筑', '自动化'],
    },
    relatedJobs: {
      fr: ['installateur domotique', 'technicien smart building', 'ingénieur domotique', 'spécialiste iot'],
      en: ['home automation installer', 'smart building technician', 'home automation engineer', 'iot specialist'],
      es: ['instalador domótica', 'técnico edificio inteligente', 'ingeniero domótica'],
      ar: ['مثبت منزل ذكي', 'فني مبنى ذكي', 'مهندس منزل ذكي'],
      zh: ['智能家居安装工', '智能建筑技术员', '智能家居工程师'],
    },
  },
  {
    id: 66,
    name: { fr: 'Robotique & Automatisation', en: 'Robotics & Automation', es: 'Robótica & Automatización', ar: 'الروبوتات والأتمتة', zh: '机器人技术与自动化' },
    synonyms: {
      fr: ['robotique', 'automatisation', 'robot', 'automatique', 'industrie 4.0'],
      en: ['robotics', 'automation', 'robot', 'automatic', 'industry 4.0'],
      es: ['robótica', 'automatización', 'robot', 'automático'],
      ar: ['روبوتات', 'أتمتة', 'روبوت'],
      zh: ['机器人技术', '自动化', '机器人'],
    },
    relatedJobs: {
      fr: ['ingénieur robotique', 'technicien robotique', 'programmeur robots', 'spécialiste automatisation'],
      en: ['robotics engineer', 'robotics technician', 'robot programmer', 'automation specialist'],
      es: ['ingeniero robótica', 'técnico robótica', 'programador robots'],
      ar: ['مهندس روبوتات', 'فني روبوتات', 'مبرمج روبوتات'],
      zh: ['机器人工程师', '机器人技术员', '机器人程序员'],
    },
  },
  {
    id: 67,
    name: { fr: 'IoT & Objets connectés', en: 'IoT & Connected Devices', es: 'IoT & Dispositivos Conectados', ar: 'إنترنت الأشياء والأجهزة المتصلة', zh: '物联网与连接设备' },
    synonyms: {
      fr: ['iot', 'objets connectés', 'internet des objets', 'smart devices', 'connected'],
      en: ['iot', 'connected devices', 'internet of things', 'smart devices', 'connected'],
      es: ['iot', 'dispositivos conectados', 'internet cosas'],
      ar: ['إنترنت الأشياء', 'أجهزة متصلة', 'أجهزة ذكية'],
      zh: ['物联网', '连接设备', '智能设备'],
    },
    relatedJobs: {
      fr: ['ingénieur iot', 'développeur iot', 'architecte iot', 'spécialiste objets connectés'],
      en: ['iot engineer', 'iot developer', 'iot architect', 'connected devices specialist'],
      es: ['ingeniero iot', 'desarrollador iot', 'arquitecto iot'],
      ar: ['مهندس إنترنت الأشياء', 'مطور إنترنت الأشياء', 'مهندس معماري إنترنت الأشياء'],
      zh: ['物联网工程师', '物联网开发者', '物联网架构师'],
    },
  },
  {
    id: 68,
    name: { fr: 'Blockchain & Web3', en: 'Blockchain & Web3', es: 'Blockchain & Web3', ar: 'بلوك تشين والويب 3', zh: '区块链与Web3' },
    synonyms: {
      fr: ['blockchain', 'web3', 'crypto', 'cryptomonnaie', 'nft', 'defi'],
      en: ['blockchain', 'web3', 'crypto', 'cryptocurrency', 'nft', 'defi'],
      es: ['blockchain', 'web3', 'cripto', 'criptomoneda'],
      ar: ['بلوك تشين', 'ويب 3', 'عملة مشفرة'],
      zh: ['区块链', 'Web3', '加密货币'],
    },
    relatedJobs: {
      fr: ['développeur blockchain', 'blockchain engineer', 'web3 developer', 'crypto analyst', 'smart contract developer'],
      en: ['blockchain developer', 'blockchain engineer', 'web3 developer', 'crypto analyst', 'smart contract developer'],
      es: ['desarrollador blockchain', 'ingeniero blockchain', 'desarrollador web3'],
      ar: ['مطور بلوك تشين', 'مهندس بلوك تشين', 'مطور ويب 3'],
      zh: ['区块链开发者', '区块链工程师', 'Web3开发者'],
    },
  },
  {
    id: 69,
    name: { fr: 'Gaming & Réalité virtuelle', en: 'Gaming & Virtual Reality', es: 'Gaming & Realidad Virtual', ar: 'الألعاب والواقع الافتراضي', zh: '游戏与虚拟现实' },
    synonyms: {
      fr: ['gaming', 'réalité virtuelle', 'vr', 'jeu', 'virtuel'],
      en: ['gaming', 'virtual reality', 'vr', 'game', 'virtual'],
      es: ['gaming', 'realidad virtual', 'vr', 'juego'],
      ar: ['ألعاب', 'واقع افتراضي', 'vr'],
      zh: ['游戏', '虚拟现实', 'VR'],
    },
    relatedJobs: {
      fr: ['développeur vr', 'game designer vr', 'ingénieur réalité virtuelle', 'créateur expériences vr'],
      en: ['vr developer', 'vr game designer', 'virtual reality engineer', 'vr experience creator'],
      es: ['desarrollador vr', 'diseñador juegos vr', 'ingeniero realidad virtual'],
      ar: ['مطور واقع افتراضي', 'مصمم ألعاب واقع افتراضي', 'مهندس واقع افتراضي'],
      zh: ['VR开发者', 'VR游戏设计师', '虚拟现实工程师'],
    },
  },
  {
    id: 70,
    name: { fr: 'Réalité augmentée & XR', en: 'Augmented Reality & XR', es: 'Realidad Aumentada & XR', ar: 'الواقع المعزز وXR', zh: '增强现实与XR' },
    synonyms: {
      fr: ['réalité augmentée', 'ar', 'xr', 'mixed reality', 'mr'],
      en: ['augmented reality', 'ar', 'xr', 'mixed reality', 'mr'],
      es: ['realidad aumentada', 'ar', 'xr', 'realidad mixta'],
      ar: ['واقع معزز', 'ar', 'xr'],
      zh: ['增强现实', 'AR', 'XR'],
    },
    relatedJobs: {
      fr: ['développeur ar', 'ingénieur xr', 'créateur ar', 'spécialiste mixed reality'],
      en: ['ar developer', 'xr engineer', 'ar creator', 'mixed reality specialist'],
      es: ['desarrollador ar', 'ingeniero xr', 'creador ar'],
      ar: ['مطور واقع معزز', 'مهندس xr', 'منشئ واقع معزز'],
      zh: ['AR开发者', 'XR工程师', 'AR创作者'],
    },
  },
  {
    id: 71,
    name: { fr: 'Création de contenu (vidéo, audio, texte)', en: 'Content Creation (Video, Audio, Text)', es: 'Creación Contenido (Video, Audio, Texto)', ar: 'إنشاء المحتوى (فيديو، صوتي، نص)', zh: '内容创作（视频、音频、文本）' },
    synonyms: {
      fr: ['création contenu', 'contenu', 'vidéo', 'audio', 'texte', 'podcast', 'youtube'],
      en: ['content creation', 'content', 'video', 'audio', 'text', 'podcast', 'youtube'],
      es: ['creación contenido', 'contenido', 'video', 'audio', 'texto'],
      ar: ['إنشاء محتوى', 'محتوى', 'فيديو', 'صوتي'],
      zh: ['内容创作', '内容', '视频', '音频'],
    },
    relatedJobs: {
      fr: ['créateur contenu', 'vidéaste', 'podcasteur', 'rédacteur', 'monteur vidéo'],
      en: ['content creator', 'videographer', 'podcaster', 'writer', 'video editor'],
      es: ['creador contenido', 'videógrafo', 'podcaster', 'redactor', 'editor video'],
      ar: ['منشئ محتوى', 'مصور فيديو', 'مذيع بودكاست', 'محرر', 'محرر فيديو'],
      zh: ['内容创作者', '摄像师', '播客', '撰稿人', '视频编辑'],
    },
  },
  {
    id: 72,
    name: { fr: 'Influence & Réseaux sociaux', en: 'Influencer & Social Media', es: 'Influencer & Redes Sociales', ar: 'التأثير ووسائل التواصل الاجتماعي', zh: '影响者与社交媒体' },
    synonyms: {
      fr: ['influence', 'réseaux sociaux', 'social media', 'influenceur', 'instagram', 'tiktok'],
      en: ['influencer', 'social media', 'influencer', 'instagram', 'tiktok'],
      es: ['influencer', 'redes sociales', 'influencer', 'instagram'],
      ar: ['تأثير', 'وسائل تواصل', 'مؤثر', 'إنستغرام'],
      zh: ['影响者', '社交媒体', '网红', 'Instagram'],
    },
    relatedJobs: {
      fr: ['influenceur', 'community manager', 'social media manager', 'content creator', 'brand ambassador'],
      en: ['influencer', 'community manager', 'social media manager', 'content creator', 'brand ambassador'],
      es: ['influencer', 'community manager', 'gestor redes sociales', 'creador contenido'],
      ar: ['مؤثر', 'مدير مجتمع', 'مدير وسائل تواصل', 'منشئ محتوى'],
      zh: ['影响者', '社区经理', '社交媒体经理', '内容创作者'],
    },
  },
  {
    id: 73,
    name: { fr: 'Formation professionnelle & reconversion', en: 'Professional Training & Retraining', es: 'Formación Profesional & Reconversión', ar: 'التدريب المهني وإعادة التأهيل', zh: '职业培训与再培训' },
    synonyms: {
      fr: ['formation professionnelle', 'reconversion', 'formation', 'apprentissage', 'cours'],
      en: ['professional training', 'retraining', 'training', 'apprenticeship', 'courses'],
      es: ['formación profesional', 'reconversión', 'formación', 'aprendizaje'],
      ar: ['تدريب مهني', 'إعادة تأهيل', 'تدريب'],
      zh: ['职业培训', '再培训', '培训'],
    },
    relatedJobs: {
      fr: ['formateur', 'conseiller orientation', 'coach reconversion', 'responsable formation', 'animateur formation'],
      en: ['trainer', 'career advisor', 'retraining coach', 'training manager', 'training animator'],
      es: ['formador', 'asesor orientación', 'coach reconversión', 'responsable formación'],
      ar: ['مدرب', 'مستشار توجيه', 'مدرب إعادة تأهيل', 'مسؤول تدريب'],
      zh: ['培训师', '职业顾问', '再培训教练', '培训经理'],
    },
  },
  {
    id: 74,
    name: { fr: 'Services financiers alternatifs (fintech)', en: 'Alternative Financial Services (Fintech)', es: 'Servicios Financieros Alternativos (Fintech)', ar: 'الخدمات المالية البديلة (فينتك)', zh: '另类金融服务（金融科技）' },
    synonyms: {
      fr: ['fintech', 'services financiers', 'finance alternative', 'paiement', 'crypto finance'],
      en: ['fintech', 'financial services', 'alternative finance', 'payment', 'crypto finance'],
      es: ['fintech', 'servicios financieros', 'finanza alternativa'],
      ar: ['فينتك', 'خدمات مالية', 'تمويل بديل'],
      zh: ['金融科技', '金融服务', '另类金融'],
    },
    relatedJobs: {
      fr: ['développeur fintech', 'product manager fintech', 'analyste fintech', 'compliance fintech'],
      en: ['fintech developer', 'fintech product manager', 'fintech analyst', 'fintech compliance'],
      es: ['desarrollador fintech', 'product manager fintech', 'analista fintech'],
      ar: ['مطور فينتك', 'مدير منتج فينتك', 'محلل فينتك'],
      zh: ['金融科技开发者', '金融科技产品经理', '金融科技分析师'],
    },
  },
  {
    id: 75,
    name: { fr: 'Services funéraires & accompagnement de fin de vie', en: 'Funeral Services & End-of-Life Care', es: 'Servicios Funerarios & Cuidados Finales', ar: 'الخدمات الجنائزية ورعاية نهاية الحياة', zh: '殡葬服务与临终关怀' },
    synonyms: {
      fr: ['funéraires', 'pompes funèbres', 'fin de vie', 'accompagnement', 'soins palliatifs'],
      en: ['funeral', 'funeral services', 'end of life', 'support', 'palliative care'],
      es: ['funerarios', 'pompas fúnebres', 'fin vida', 'cuidados finales'],
      ar: ['جنائزية', 'خدمات جنائزية', 'نهاية حياة', 'رعاية'],
      zh: ['殡葬', '殡葬服务', '临终', '护理'],
    },
    relatedJobs: {
      fr: ['thanatopracteur', 'conseiller funéraire', 'accompagnant fin de vie', 'soignant palliatif', 'directeur pompes funèbres'],
      en: ['thanatopractor', 'funeral advisor', 'end-of-life companion', 'palliative caregiver', 'funeral director'],
      es: ['tanatopractor', 'asesor funerario', 'acompañante fin vida', 'cuidador paliativo'],
      ar: ['معالج جنائزي', 'مستشار جنائزي', 'مرافق نهاية حياة', 'مقدم رعاية'],
      zh: ['殡葬师', '殡葬顾问', '临终陪伴者', '姑息护理员'],
    },
  },
];

// Fonction pour normaliser les accents et caractères spéciaux
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9\s]/g, '') // Supprime les caractères spéciaux
    .trim();
};

// Fonction pour trouver les thématiques correspondantes à un terme de recherche
export const findMatchingThemes = (searchTerm: string, language: 'fr' | 'en' | 'es' | 'ar' | 'zh' = 'fr'): ThemeMapping[] => {
  const normalizedSearch = normalizeText(searchTerm);
  const matches: ThemeMapping[] = [];

  for (const theme of jobThemesMapping) {
    // Vérifier dans les noms
    const normalizedName = normalizeText(theme.name[language]);
    if (normalizedName.includes(normalizedSearch) || normalizedSearch.includes(normalizedName)) {
      matches.push(theme);
      continue;
    }

    // Vérifier dans les synonymes
    const hasMatchingSynonym = theme.synonyms[language].some(synonym => {
      const normalizedSynonym = normalizeText(synonym);
      return normalizedSynonym.includes(normalizedSearch) || normalizedSearch.includes(normalizedSynonym);
    });

    if (hasMatchingSynonym) {
      matches.push(theme);
      continue;
    }

    // Vérifier dans les métiers liés
    const hasMatchingJob = theme.relatedJobs[language].some(job => {
      const normalizedJob = normalizeText(job);
      return normalizedJob.includes(normalizedSearch) || normalizedSearch.includes(normalizedJob);
    });

    if (hasMatchingJob) {
      matches.push(theme);
    }
  }

  return matches;
};

// Fonction pour obtenir tous les termes de recherche possibles pour une thématique
export const getSearchTermsForTheme = (theme: ThemeMapping, language: 'fr' | 'en' | 'es' | 'ar' | 'zh' = 'fr'): string[] => {
  return [
    theme.name[language],
    ...theme.synonyms[language],
    ...theme.relatedJobs[language],
  ];
};
