const locales = ['en','zh','es','fr','de','ru','ar','id'];
const translated = values => Object.fromEntries(locales.map((locale, i) => [locale, values[i]]));
export const GUIDE_AREAS = [
  {id:'cancer', label:translated(['Cancer & blood cancers','癌症与血液肿瘤','Cáncer y cánceres de la sangre','Cancers et cancers du sang','Krebs und Blutkrebs','Рак и опухоли крови','السرطان وأورام الدم','Kanker dan kanker darah'])},
  {id:'blood', label:translated(['Blood disorders & transplant care','血液疾病与移植照护','Enfermedades de la sangre y trasplantes','Maladies du sang et soins de greffe','Bluterkrankungen und Transplantationsversorgung','Болезни крови и помощь при трансплантации','أمراض الدم والرعاية المرتبطة بالزرع','Kelainan darah dan perawatan transplantasi'])},
  {id:'neurology', label:translated(['Brain, nerves & rehabilitation','脑与神经疾病及康复','Cerebro, nervios y rehabilitación','Cerveau, nerfs et réadaptation','Gehirn, Nerven und Rehabilitation','Болезни мозга, нервной системы и реабилитация','أمراض الدماغ والأعصاب وإعادة التأهيل','Otak, saraf, dan rehabilitasi'])},
  {id:'general', label:translated(['Other conditions & general care','其他疾病与通用就医指南','Otras enfermedades y atención general','Autres maladies et soins généraux','Andere Erkrankungen und allgemeine Versorgung','Другие заболевания и общая медицинская помощь','أمراض أخرى والرعاية العامة','Kondisi lain dan panduan perawatan umum'])},
];
export const AREA_LABEL = translated(['Browse by health area','按疾病领域查找','Buscar por área de salud','Parcourir par domaine de santé','Nach Gesundheitsbereich suchen','Поиск по области здоровья','تصفح حسب المجال الصحي','Telusuri menurut bidang kesehatan']);
export const ALL_AREAS_LABEL = translated(['All health areas','全部疾病领域','Todas las áreas de salud','Tous les domaines de santé','Alle Gesundheitsbereiche','Все области здоровья','جميع المجالات الصحية','Semua bidang kesehatan']);
export const TYPE_LABEL = translated(['What would you like to know?','你想了解什么？','¿Qué le gustaría saber?','Que souhaitez-vous savoir ?','Was möchten Sie wissen?','Что вы хотите узнать?','ما الذي تود معرفته؟','Apa yang ingin Anda ketahui?']);
const cancer = new Set(['myelodysplastic-syndrome','diffuse-large-b-cell-lymphoma','follicular-lymphoma','mantle-cell-lymphoma','t-cell-lymphoma','hodgkin-lymphoma','multiple-myeloma']);
const blood = new Set(['aplastic-anemia','thalassemia','sickle-cell-disease','graft-versus-host-disease']);
const neurology = new Set(['alzheimer-disease','post-ischemic-stroke-rehabilitation','parkinson-disease','drug-resistant-epilepsy','multiple-sclerosis','amyotrophic-lateral-sclerosis']);
// Disease metadata takes precedence. Legacy titles are used only for explicit
// disease terms, never incidental mentions in body text or medical inference.
export function guideHealthArea(guide) {
  if(cancer.has(guide.conditionId)) return 'cancer';
  if(blood.has(guide.conditionId)) return 'blood';
  if(neurology.has(guide.conditionId)) return 'neurology';
  const title = guide.title?.en || guide.slug.replaceAll('-', ' ');
  if(/\b(cancer|oncology|tumou?r|lymphoma|myeloma|leukemia|leukaemia|car[- ]t)\b/i.test(title)) return 'cancer';
  if(/\b(anemia|anaemia|thalass[ae]mia|sickle.cell|graft.versus.host|blood disorder|bone marrow transplant|stem cell transplant)\b/i.test(title)) return 'blood';
  if(/\b(alzheimer|parkinson|epilepsy|stroke|multiple sclerosis|amyotrophic|neurolog|neurosurg)/i.test(title)) return 'neurology';
  return 'general';
}
