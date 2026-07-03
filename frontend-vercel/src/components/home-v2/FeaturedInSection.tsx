const featuredLogos = [
  {
    name: "CNN",
    label: "CNN",
    className: "font-black tracking-[-0.08em] text-[#CC0000]",
  },
  {
    name: "Lianhe Zaobao",
    label: "联合早报",
    sublabel: "Lianhe Zaobao",
    className: "font-semibold tracking-[0.04em] text-[#C7192E]",
  },
  {
    name: "Bloomberg",
    label: "Bloomberg",
    className: "font-bold tracking-[-0.03em] text-[#121212]",
  },
];

export default function FeaturedInSection() {
  return (
    <section className="relative bg-white py-8 sm:py-10 lg:py-12" aria-labelledby="featured-in-heading">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[8px] border border-slate-100 bg-[#F7FAF9] px-4 py-6 shadow-sm sm:px-6 lg:px-8">
          <div className="grid items-center gap-6 lg:grid-cols-[0.72fr_1.28fr]">
            <div className="text-center lg:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0F638E]">
                As featured in
              </p>
              <h2 id="featured-in-heading" className="mt-2 text-xl font-bold leading-tight text-[#003B5C] sm:text-2xl">
                International media have interviewed Medora Health
              </h2>
            </div>

            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {featuredLogos.map((logo) => (
                <li key={logo.name}>
                  <div className="flex h-24 items-center justify-center rounded-[8px] border border-slate-100 bg-white px-5 shadow-sm transition-transform duration-300 hover:-translate-y-0.5">
                    <div className="text-center" aria-label={logo.name}>
                      <span className={`block text-3xl leading-none sm:text-[2rem] ${logo.className}`}>
                        {logo.label}
                      </span>
                      {logo.sublabel && (
                        <span className="mt-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                          {logo.sublabel}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
