import bloombergLogo from "@/img/bloomberg-logo.svg";
import cnnLogo from "@/img/cnn-logo.svg";
import zaobaoLogo from "@/img/lianhe-zaobao-logo.png";

const featuredLogos = [
  {
    name: "CNN",
    src: cnnLogo,
    className: "h-9 sm:h-10",
  },
  {
    name: "Lianhe Zaobao",
    src: zaobaoLogo,
    className: "h-10 sm:h-11",
  },
  {
    name: "Bloomberg",
    src: bloombergLogo,
    className: "h-10 sm:h-11",
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
                Medora Health in the media
              </h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-500">
                Selected media coverage and press mentions.
              </p>
            </div>

            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {featuredLogos.map((logo) => (
                <li key={logo.name}>
                  <div className="flex h-24 items-center justify-center rounded-[8px] border border-slate-100 bg-white px-5 shadow-sm transition-transform duration-300 hover:-translate-y-0.5">
                    <img
                      src={logo.src}
                      alt={logo.name}
                      className={`max-w-[170px] object-contain ${logo.className}`}
                      loading="lazy"
                    />
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
