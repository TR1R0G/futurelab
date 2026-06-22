"use client";

interface CTACardProps {
  text: string;
  buttonText: string;
}

export function CTACard({ text, buttonText }: CTACardProps) {
  return (
    <div className="infrastructure-cta mx-5 mt-24 flex flex-col items-center rounded-[28px] bg-[#F2F2F5] px-6 py-8 text-center md:mx-8 md:mt-32 md:rounded-[32px] md:px-10 md:py-10 lg:mx-auto lg:max-w-[890px]">
      <p className="text-lg font-bold text-[#202024] md:text-xl lg:text-[23px]">
        {text}
      </p>
      <button
        type="button"
        className="mt-8 w-full max-w-[340px] rounded-lg bg-[#0B5CFF] px-6 py-3 text-base font-semibold text-white transition-transform hover:scale-[1.01] hover:bg-[#0050f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B5CFF] active:scale-[0.99]"
      >
        {buttonText}
      </button>
    </div>
  );
}
