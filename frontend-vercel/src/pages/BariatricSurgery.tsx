import { useEffect } from "react";
import { AlertTriangle, ChevronLeft, CircleCheck, DollarSign, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import TopBanner from "@/components/TopBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/img/body-liposuction-copy.png";

const fixedChromePadding =
  "pt-[calc(44px+3.5rem)] sm:pt-[calc(44px+4rem)] xl:pt-[calc(44px+4.5rem)]";

const COPY = {
  zh: {
    back: "返回首页",
    title: "减重代谢手术",
    heroDesc: "通过代谢手术重塑消化系统，帮助长期减重并改善代谢性疾病。",
    typesTitle: "手术类型",
    criteriaTitle: "适应证标准（中国）",
    priceTitle: "费用参考",
    postTitle: "术后管理",
    riskTitle: "风险与并发症",
    ctaTitle: "准备好开始了吗？",
    ctaBtn: "立即预约咨询 →",
    tags: ["最常见", "糖尿病首选", "可逆方案", "减重效果最强"],
    surgeries: [
      ["袖状胃切除术", ["切除约 75%-80% 胃体积", "降低饥饿素分泌，食欲下降", "手术时间约 1.5-2.5 小时", "超重减轻约 55%-70%"]],
      ["Roux-en-Y 胃旁路", ["形成小胃囊并重建肠道路径", "对 2 型糖尿病改善显著", "适合合并代谢病的中重度肥胖", "手术复杂度高，不可逆"]],
      ["可调节胃束带", ["上胃部植入可调束带", "可逆性强，创伤相对小", "长期减重效果较弱，现临床使用较少"]],
      ["胆胰分流术（BPD/DS）", ["减重幅度最大", "对重度肥胖效果显著", "营养吸收障碍风险更高，需严格随访"]],
    ],
    criteria: [
      ["BMI ≥ 37.5", "单纯肥胖，无严重并发症"],
      ["BMI ≥ 32.5", "合并糖尿病、高血压或代谢综合征"],
      ["BMI 27.5–32.5", "可在专科评估后考虑手术"],
    ],
    prices: [
      ["袖状胃切除术", "¥30,000-80,000"],
      ["胃旁路手术", "¥50,000-100,000"],
    ],
    priceNote: "部分城市和医保政策下可申请部分报销",
    postList: [
      "终身补充维生素与矿物质（尤其 B12、铁、钙）",
      "饮食阶段管理：流食→半流食→软食→正常饮食",
      "需长期随访，生活方式管理是关键",
      "术后 1-2 年是体重管理黄金期",
    ],
    riskShortLabel: "短期风险",
    riskShortText: "出血、感染、血栓、吻合口漏",
    riskLongLabel: "长期风险",
    riskLongText: "营养缺乏、反弹风险、罕见胃食管反流",
  },
  en: {
    back: "Back to Home",
    title: "Bariatric Surgery",
    heroDesc: "Metabolic surgery that modifies the digestive system for long-term weight loss and improvement of metabolic conditions.",
    typesTitle: "Surgery Types",
    criteriaTitle: "Eligibility Criteria (China Standard)",
    priceTitle: "Price Guide",
    postTitle: "Post-Op Guidelines",
    riskTitle: "Risks & Complications",
    ctaTitle: "Ready to Start?",
    ctaBtn: "Book Your Consultation →",
    tags: ["Most Common", "Best for Diabetes", "Reversible", "Strongest Effect"],
    surgeries: [
      ["Sleeve Gastrectomy", ["Removes ~75-80% of the stomach", "Lowers ghrelin (hunger hormone)", "Procedure time about 1.5-2.5 hours", "Excess weight loss: 55-70%"]],
      ["Roux-en-Y Gastric Bypass", ["Creates small pouch + reroute", "Strong effect on diabetes control", "Works well for obesity with metabolic conditions", "Higher complexity, irreversible"]],
      ["Adjustable Gastric Band", ["Upper-stomach silicone ring", "Fully reversible", "Less common today due to slower long-term outcomes"]],
      ["Biliopancreatic Diversion (BPD/DS)", ["Most powerful surgery", "Very high excess-weight loss", "Higher malabsorption risk; strict follow-up required"]],
    ],
    criteria: [
      ["BMI ≥ 37.5", "Obesity without severe comorbidities"],
      ["BMI ≥ 32.5", "With diabetes, hypertension, or metabolic syndrome"],
      ["BMI 27.5-32.5", "May be considered if obesity is severe and under specialist evaluation"],
    ],
    prices: [
      ["Sleeve Gastrectomy", "¥30,000-80,000"],
      ["Gastric Bypass", "¥50,000-100,000"],
    ],
    priceNote: "Partial insurance coverage may be available depending on city and policy.",
    postList: [
      "Lifelong vitamin & mineral supplementation",
      "Diet progression: liquids -> soft -> normal diet",
      "Long-term follow-up and lifestyle change required",
      "First 1-2 years are key for sustained weight loss",
    ],
    riskShortLabel: "Short-term",
    riskShortText: "Bleeding, infection, blood clots, anastomotic leak",
    riskLongLabel: "Long-term",
    riskLongText: "Nutritional deficiency, rebound risk, gastric reflux (rare)",
  },
  es: {
    back: "Volver al inicio",
    title: "Cirugía bariátrica",
    heroDesc: "Cirugía metabólica que modifica el sistema digestivo para bajar de peso a largo plazo.",
    typesTitle: "Tipos de cirugía",
    criteriaTitle: "Criterios de elegibilidad (estándar de China)",
    priceTitle: "Guía de precios",
    postTitle: "Guía postoperatoria",
    riskTitle: "Riesgos y complicaciones",
    ctaTitle: "¿Listo para empezar?",
    ctaBtn: "Reserva tu consulta →",
    tags: ["Más común", "Mejor para diabetes", "Reversible", "Efecto más fuerte"],
    surgeries: [
      ["Gastrectomía en manga", ["Retira ~75-80% del estómago", "Reduce la hormona del hambre", "Duración de cirugía aprox. 1.5-2.5 h", "Pérdida de exceso de peso: 55-70%"]],
      ["Bypass gástrico Roux-en-Y", ["Crea un pequeño reservorio y redirección intestinal", "Muy eficaz para diabetes tipo 2", "Adecuado en obesidad con trastornos metabólicos", "Mayor complejidad, irreversible"]],
      ["Banda gástrica ajustable", ["Anillo ajustable en estómago proximal", "Totalmente reversible", "Menos usada por menor eficacia a largo plazo"]],
      ["Derivación biliopancreática (BPD/DS)", ["Procedimiento más potente", "Muy alta pérdida de peso", "Mayor riesgo de malabsorción, requiere control estricto"]],
    ],
    criteria: [
      ["BMI ≥ 37.5", "Obesidad sin comorbilidades graves"],
      ["BMI ≥ 32.5", "Con diabetes, hipertensión o síndrome metabólico"],
      ["BMI 27.5-32.5", "Puede considerarse bajo evaluación especializada"],
    ],
    prices: [
      ["Gastrectomía en manga", "¥30,000-80,000"],
      ["Bypass gástrico", "¥50,000-100,000"],
    ],
    priceNote: "Puede existir cobertura parcial según ciudad y política.",
    postList: [
      "Suplementación de vitaminas y minerales de por vida",
      "Progresión dietética: líquidos -> blando -> dieta normal",
      "Seguimiento prolongado y cambio de estilo de vida",
      "Los primeros 1-2 años son críticos para mantener resultados",
    ],
    riskShortLabel: "Corto plazo",
    riskShortText: "Sangrado, infección, trombosis, fuga anastomótica",
    riskLongLabel: "Largo plazo",
    riskLongText: "Deficiencias nutricionales, rebote de peso, reflujo (raro)",
  },
  fr: {
    back: "Retour à l'accueil",
    title: "Chirurgie bariatrique",
    heroDesc: "Chirurgie métabolique pour une perte de poids durable et l'amélioration des maladies métaboliques.",
    typesTitle: "Types de chirurgie",
    criteriaTitle: "Critères d'éligibilité (norme Chine)",
    priceTitle: "Guide des prix",
    postTitle: "Recommandations post-op",
    riskTitle: "Risques et complications",
    ctaTitle: "Prêt à commencer ?",
    ctaBtn: "Réserver une consultation →",
    tags: ["Le plus courant", "Meilleur pour le diabète", "Réversible", "Effet maximal"],
    surgeries: [
      ["Sleeve gastrectomie", ["Retire ~75-80% de l'estomac", "Diminue l'hormone de la faim", "Durée opératoire ~1.5-2.5 h", "Perte d'excès de poids: 55-70%"]],
      ["Bypass gastrique Roux-en-Y", ["Petit réservoir gastrique + dérivation intestinale", "Excellent effet sur le diabète de type 2", "Indiqué en obésité avec comorbidités métaboliques", "Plus complexe, irréversible"]],
      ["Anneau gastrique ajustable", ["Anneau sur la partie supérieure de l'estomac", "Totalement réversible", "Moins utilisé aujourd'hui"]],
      ["Dérivation biliopancréatique (BPD/DS)", ["Technique la plus puissante", "Très forte perte de poids", "Risque de malabsorption plus élevé, suivi strict nécessaire"]],
    ],
    criteria: [
      ["BMI ≥ 37.5", "Obésité sans comorbidités sévères"],
      ["BMI ≥ 32.5", "Avec diabète, HTA ou syndrome métabolique"],
      ["BMI 27.5-32.5", "Possible après évaluation spécialisée"],
    ],
    prices: [
      ["Sleeve gastrectomie", "¥30,000-80,000"],
      ["Bypass gastrique", "¥50,000-100,000"],
    ],
    priceNote: "Une prise en charge partielle peut être possible selon la ville et la police.",
    postList: [
      "Supplémentation à vie en vitamines et minéraux",
      "Progression alimentaire: liquides -> mixé -> normal",
      "Suivi à long terme et changement de mode de vie indispensables",
      "Les 1-2 premières années sont cruciales",
    ],
    riskShortLabel: "Court terme",
    riskShortText: "Saignement, infection, thrombose, fuite anastomotique",
    riskLongLabel: "Long terme",
    riskLongText: "Carences nutritionnelles, reprise pondérale, reflux (rare)",
  },
  de: {
    back: "Zur Startseite",
    title: "Bariatrische Chirurgie",
    heroDesc: "Metabolische OP zur langfristigen Gewichtsreduktion und Verbesserung metabolischer Erkrankungen.",
    typesTitle: "Operationsarten",
    criteriaTitle: "Eignungskriterien (China-Standard)",
    priceTitle: "Preisleitfaden",
    postTitle: "Post-OP-Richtlinien",
    riskTitle: "Risiken & Komplikationen",
    ctaTitle: "Bereit zu starten?",
    ctaBtn: "Beratung buchen →",
    tags: ["Am häufigsten", "Beste Wahl bei Diabetes", "Reversibel", "Stärkster Effekt"],
    surgeries: [
      ["Schlauchmagen", ["Entfernt ~75-80% des Magens", "Senkt Hungerhormone", "OP-Dauer ca. 1.5-2.5 Std.", "Übergewichtsverlust: 55-70%"]],
      ["Roux-en-Y-Magenbypass", ["Kleiner Magenpouch + Darmumleitung", "Sehr wirksam bei Typ-2-Diabetes", "Geeignet bei Adipositas mit Stoffwechselerkrankungen", "Komplexer, irreversibel"]],
      ["Verstellbares Magenband", ["Silikonband am oberen Magen", "Vollständig reversibel", "Heute seltener wegen schwächerer Langzeitwirkung"]],
      ["Biliopankreatische Diversion (BPD/DS)", ["Stärkstes Verfahren", "Sehr hoher Gewichtsverlust", "Höheres Risiko für Malabsorption, strenge Nachsorge nötig"]],
    ],
    criteria: [
      ["BMI ≥ 37.5", "Adipositas ohne schwere Begleiterkrankungen"],
      ["BMI ≥ 32.5", "Mit Diabetes, Hypertonie oder metabolischem Syndrom"],
      ["BMI 27.5-32.5", "Kann nach Spezialistenbewertung erwogen werden"],
    ],
    prices: [
      ["Schlauchmagen", "¥30,000-80,000"],
      ["Magenbypass", "¥50,000-100,000"],
    ],
    priceNote: "Teilweise Kostenerstattung je nach Stadt und Versicherung möglich.",
    postList: [
      "Lebenslange Vitamin- und Mineralstoffsupplementierung",
      "Ernährungsaufbau: flüssig -> weich -> normale Kost",
      "Langfristige Nachsorge und Lebensstiländerung erforderlich",
      "Die ersten 1-2 Jahre sind entscheidend",
    ],
    riskShortLabel: "Kurzfristig",
    riskShortText: "Blutung, Infektion, Thrombose, Anastomosenleck",
    riskLongLabel: "Langfristig",
    riskLongText: "Nährstoffmangel, Wiederzunahme, Reflux (selten)",
  },
} as const;

export default function BariatricSurgery() {
  const { currentLanguage } = useLanguage();
  const locale = (["zh", "en", "es", "fr", "de"].includes(currentLanguage.code) ? currentLanguage.code : "en") as keyof typeof COPY;
  const c = COPY[locale];

  useEffect(() => {
    document.title = `${c.title} | Medora Health`;
  }, [c.title]);

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />

      <main className={fixedChromePadding}>
        <section className="relative h-[250px] sm:h-[320px] md:h-[370px] overflow-hidden">
          <img src={heroImage} alt={c.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[#1DA78A]/65" />
          <div className="absolute inset-x-0 bottom-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-white">
            <Link to="/" className="inline-flex items-center gap-1 text-xs text-white/90 hover:text-white">
              <ChevronLeft className="h-3.5 w-3.5" />
              {c.back}
            </Link>
            <h1 className="mt-2 text-4xl font-bold">{c.title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-white/90">{c.heroDesc}</p>
          </div>
        </section>

        <section className="bg-white py-10 sm:py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#1F2937]">{c.typesTitle}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {c.surgeries.map((item, i) => (
                <article key={item[0]} className="rounded-lg border border-[#E5ECEF] bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1DA78A] text-[10px] font-bold text-white">
                        {i + 1}
                      </span>
                      <h3 className="text-sm font-bold text-[#1F2937]">{item[0]}</h3>
                    </div>
                    <span className="rounded-full bg-[#EAF6F3] px-2 py-0.5 text-[10px] font-semibold text-[#1DA78A]">{c.tags[i]}</span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs text-gray-600">
                    {item[1].map((line) => (
                      <li key={line}>✓ {line}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#EEF3F5] py-10 sm:py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-[#1F2937]">
              <Sparkles className="h-5 w-5 text-[#1DA78A]" />
              {c.criteriaTitle}
            </h2>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {c.criteria.map((row) => (
                <article key={row[0]} className="rounded-lg border border-[#E5ECEF] bg-white p-5 text-center">
                  <h3 className="text-2xl font-bold text-[#1DA78A]">{row[0]}</h3>
                  <p className="mt-2 text-xs text-gray-500">{row[1]}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-10 sm:py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-[#1F2937]">
              <DollarSign className="h-5 w-5 text-[#1DA78A]" />
              {c.priceTitle}
            </h2>
            <div className="mt-6 grid max-w-xl gap-3 md:grid-cols-2">
              {c.prices.map((p) => (
                <article key={p[0]} className="rounded-lg border border-[#E5ECEF] bg-white p-4 text-center">
                  <p className="text-xs text-gray-500">{p[0]}</p>
                  <p className="mt-2 text-xl font-bold text-[#1DA78A]">{p[1]}</p>
                </article>
              ))}
            </div>
            <p className="mt-4 text-xs text-gray-500">{c.priceNote}</p>
          </div>
        </section>

        <section className="bg-[#EEF3F5] py-10 sm:py-12">
          <div className="mx-auto grid max-w-6xl gap-5 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <h3 className="flex items-center gap-2 text-2xl font-bold text-[#1F2937]">
                <CircleCheck className="h-5 w-5 text-[#1DA78A]" />
                {c.postTitle}
              </h3>
              <div className="mt-4 space-y-2.5">
                {c.postList.map((line) => (
                  <div key={line} className="rounded-md border border-[#E5ECEF] bg-white px-4 py-2.5 text-sm text-gray-700">
                    ✓ {line}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-2xl font-bold text-[#1F2937]">
                <AlertTriangle className="h-5 w-5 text-[#D14B4B]" />
                {c.riskTitle}
              </h3>
              <div className="mt-4 space-y-3">
                <article className="rounded-md border border-[#F0D8D8] bg-white px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#D14B4B]">{c.riskShortLabel}</p>
                  <p className="mt-1 text-sm text-gray-700">{c.riskShortText}</p>
                </article>
                <article className="rounded-md border border-[#F0D8D8] bg-white px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#D14B4B]">{c.riskLongLabel}</p>
                  <p className="mt-1 text-sm text-gray-700">{c.riskLongText}</p>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-bold text-[#1F2937]">{c.ctaTitle}</h2>
            <Link
              to="/free-quote"
              className="mt-5 inline-flex items-center rounded-md bg-[#1DA78A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#158970]"
            >
              {c.ctaBtn}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
