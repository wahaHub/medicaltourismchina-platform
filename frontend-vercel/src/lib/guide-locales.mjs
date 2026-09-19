export const GUIDE_LOCALES = ['en', 'zh', 'es', 'fr', 'de', 'ru', 'ar', 'id'];
export const GUIDE_LABELS = {
  en: ['Key takeaways', 'Quick answer', 'Full guide', 'Related guides', 'On this page', 'This article is not yet available in your selected language. Showing the available version.', 'Condition', 'All conditions', 'Load more guides'],
  zh: ['阅读要点', '快速了解', '正文', '相关文章', '本文目录', '本文暂未提供所选语言的完整译文，当前展示已有语言版本。', '疾病主题', '全部疾病', '加载更多文章'],
  es: ['Puntos clave', 'Respuesta breve', 'Guía completa', 'Guías relacionadas', 'En esta página', 'Este artículo aún no está disponible en el idioma seleccionado. Se muestra una versión disponible.', 'Enfermedad', 'Todas las enfermedades', 'Cargar más guías'],
  fr: ['Points clés', 'Réponse rapide', 'Guide complet', 'Guides associés', 'Sur cette page', 'Cet article n’est pas encore disponible dans la langue sélectionnée. Une version disponible est affichée.', 'Maladie', 'Toutes les maladies', 'Afficher plus de guides'],
  de: ['Das Wichtigste', 'Kurze Antwort', 'Vollständiger Ratgeber', 'Weitere Ratgeber', 'Auf dieser Seite', 'Dieser Artikel ist noch nicht in der gewählten Sprache verfügbar. Eine verfügbare Version wird angezeigt.', 'Erkrankung', 'Alle Erkrankungen', 'Weitere Ratgeber laden'],
  ru: ['Главное', 'Краткий ответ', 'Полное руководство', 'Связанные материалы', 'На этой странице', 'Полный перевод этой статьи на выбранный язык пока недоступен. Показана доступная версия.', 'Заболевание', 'Все заболевания', 'Загрузить ещё'],
  ar: ['النقاط الرئيسية', 'إجابة مختصرة', 'الدليل الكامل', 'أدلة ذات صلة', 'في هذه الصفحة', 'هذه المقالة غير متاحة بعد باللغة المختارة. يتم عرض نسخة متاحة.', 'الحالة الصحية', 'جميع الحالات', 'تحميل المزيد من الأدلة'],
  id: ['Poin penting', 'Jawaban singkat', 'Panduan lengkap', 'Panduan terkait', 'Di halaman ini', 'Artikel ini belum tersedia dalam bahasa yang dipilih. Versi yang tersedia ditampilkan.', 'Kondisi', 'Semua kondisi', 'Muat panduan lainnya'],
};

export function guideContentLocale(requested, available = []) {
  return available.includes(requested) ? requested : available.includes('en') ? 'en' : available.includes('zh') ? 'zh' : available[0] || 'en';
}

export function guideFilename(slug, locale) {
  if (!GUIDE_LOCALES.includes(locale)) throw new Error(`Unsupported guide locale: ${locale}`);
  return `${slug}${locale === 'en' ? '' : `.${locale}`}.md`;
}

export function parseGuideFilename(filename) {
  const match = filename.match(/^(.+?)(?:\.(en|zh|es|fr|de|ru|ar|id))?\.md$/);
  if (!match || match[1].includes('.')) throw new Error(`Invalid guide filename: ${filename}`);
  return { slug: match[1], locale: match[2] || 'en' };
}

export function localizeGuideHeading(heading, locale = 'en') {
  const index = ['Key Takeaways', 'Quick Answer', 'Content', 'Related Guides'].indexOf(heading);
  return index < 0 ? heading : (GUIDE_LABELS[locale] || GUIDE_LABELS.en)[index];
}

export function guideHeadingId(heading) {
  let hash = 2166136261;
  for (const char of heading) hash = Math.imul(hash ^ char.codePointAt(0), 16777619);
  return `guide-section-${(hash >>> 0).toString(36)}`;
}
