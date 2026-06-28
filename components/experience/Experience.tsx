import { FadeInImage } from "@/components/media/FadeInImage";

interface ExperienceProps {
  title: string;
  intro: string[];
  stats: {
    value: string;
    label: string;
  }[];
  outro: string[];
  buttonText: string;
}

const mosaicRows = [
  { offset: true, images: ["/images/block6/optimized/image1.webp", "/images/block6/optimized/image2.webp"] },
  {
    offset: false,
    images: ["/images/block6/optimized/image3.webp", "/images/optimized/office.webp", "/images/block6/optimized/image1.webp"],
  },
  { offset: true, images: ["/images/block6/optimized/image2.webp", "/images/block6/optimized/image3.webp"] },
  {
    offset: false,
    images: ["/images/optimized/office.webp", "/images/block6/optimized/image1.webp", "/images/block6/optimized/image2.webp"],
  },
  { offset: true, images: ["/images/block6/optimized/image3.webp", "/images/block6/optimized/image3.webp"] },
  {
    offset: false,
    images: ["/images/block6/optimized/image1.webp", "/images/block6/optimized/image2.webp", "/images/optimized/office.webp"],
  },
  { offset: true, images: ["/images/block6/optimized/image2.webp", "/images/block6/optimized/image1.webp"] },
];

export function Experience({
  title,
  intro,
  stats,
  outro,
  buttonText,
}: ExperienceProps) {
  return (
    <section className="experience-section relative overflow-hidden bg-black px-5 py-24 md:px-8 md:py-28 lg:h-[1384px] lg:px-0 lg:py-0">
      <MosaicBackground />

      <div className="relative z-10 mx-auto max-w-[1438px]">
        <h2 className="font-heading max-w-[944px] text-[42px] font-bold leading-[1.08] tracking-[-0.03em] text-white md:text-[50px] lg:absolute lg:left-0 lg:top-[150px] lg:text-[55px] lg:leading-[62px]">
          {title}
        </h2>

        <div className="mt-16 max-w-[941px] space-y-8 text-[18px] font-medium leading-[1.7] text-[#C4C4C4] md:text-[21px] lg:absolute lg:left-0 lg:top-[343px] lg:mt-0 lg:text-[23px]">
          {intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3 lg:absolute lg:left-0 lg:top-[589px] lg:mt-0 lg:flex lg:gap-10">
          {stats.map((stat) => (
            <StatCard key={stat.value} value={stat.value} label={stat.label} />
          ))}
        </div>

        <div className="mt-16 max-w-[944px] space-y-8 text-[18px] font-medium leading-[1.7] text-[#C4C4C4] md:text-[21px] lg:absolute lg:left-0 lg:top-[929px] lg:mt-0 lg:text-[23px]">
          {outro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <button
          type="button"
          className="mt-16 flex h-[55px] w-full max-w-[452px] items-center justify-center rounded-[13px] bg-[#0051FF] px-6 text-[22px] font-medium leading-[26px] text-white transition-transform hover:scale-[1.01] hover:bg-[#0050f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0051FF] active:scale-[0.99] lg:absolute lg:left-1/2 lg:top-[1179px] lg:mt-0 lg:-translate-x-1/2"
        >
          {buttonText}
        </button>
      </div>
    </section>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <article className="relative h-[281px] w-full overflow-hidden rounded-[35px] bg-[linear-gradient(46.02deg,#4B0E5B_-1.84%,#A91E83_28.61%,#FD9A34_65.03%,#F9EB44_100%)] md:w-auto lg:w-[452px]">
      <div className="absolute left-[7px] top-[7px] h-[267px] w-[calc(100%-14px)] rounded-[28px] bg-white lg:w-[438px]">
        <h3 className="absolute left-8 top-[23px] w-[calc(100%-64px)] text-[25px] font-semibold leading-[1.7] text-black lg:left-[33px] lg:w-[372px]">
          {value}
        </h3>
        <p className="absolute left-8 top-[86px] w-[calc(100%-64px)] whitespace-pre-line text-[21px] font-medium leading-[1.7] text-[#4C4C4C] lg:left-[33px] lg:top-[86px] lg:w-[372px] lg:text-[23px]">
          {label}
        </p>
      </div>
    </article>
  );
}

function MosaicBackground() {
  return (
    <div
      className="pointer-events-none absolute left-[calc(50%+324px)] top-[67px] z-0 hidden h-[1250px] w-[844px] opacity-45 lg:block"
      aria-hidden="true"
    >
      <div className="absolute inset-0 z-20 bg-black/35" />
      <div className="absolute inset-y-0 left-0 z-30 w-[260px] bg-gradient-to-r from-black via-black/85 to-transparent" />
      <div className="absolute inset-y-0 right-0 z-30 w-[120px] bg-gradient-to-l from-black via-black/35 to-transparent" />
      <div className="absolute inset-x-0 top-0 z-30 h-[120px] bg-gradient-to-b from-black to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-30 h-[160px] bg-gradient-to-t from-black to-transparent" />

      <div className="flex flex-col gap-[18px]">
        {mosaicRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`flex gap-5 ${row.offset ? "ml-[125px]" : ""}`}
          >
            {row.images.map((src, imageIndex) => (
              <div
                key={`${rowIndex}-${imageIndex}-${src}`}
                className="relative h-[163px] w-[268px] shrink-0 overflow-hidden rounded-[15px]"
              >
                <FadeInImage
                  src={src}
                  alt=""
                  fill
                  sizes="268px"
                  className="object-cover"
                  aria-hidden="true"
                  unoptimized
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
