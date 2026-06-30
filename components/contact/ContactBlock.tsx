import Image from "next/image";

interface ContactBlockProps {
  title: string;
  cardTitle: string;
  cardText: string;
  emailTitle: string;
  telegramTitle: string;
}

export function ContactBlock({
  title,
  cardTitle,
  cardText,
  emailTitle,
  telegramTitle,
}: ContactBlockProps) {
  return (
    <section className="contact-section relative overflow-hidden bg-white px-5 py-24 text-black md:px-8 md:py-28 lg:h-[738px] lg:px-0 lg:py-0">
      <ContactGlow />

      <div className="contact-content relative z-10 mx-auto max-w-[1438px]">
        <h2 className="font-heading text-[42px] font-bold leading-[1.08] tracking-[-0.03em] text-black md:text-[50px] lg:absolute lg:left-0 lg:top-[206px] lg:w-[698px] lg:text-[55px] lg:leading-[62px]">
          {title}
        </h2>

        <div className="contact-card mt-12 grid gap-10 rounded-[30px] bg-white px-7 py-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] md:mt-14 md:grid-cols-2 md:rounded-[35px] md:px-12 md:py-12 lg:absolute lg:left-0 lg:top-[308px] lg:mt-0 lg:h-[230px] lg:w-[1436px] lg:grid-cols-none lg:gap-0 lg:px-0 lg:py-0">
          <div className="lg:absolute lg:left-[123px] lg:top-10 lg:w-[412px]">
            <h3 className="text-[26px] font-semibold leading-none text-black md:text-[30px]">
              {cardTitle}
            </h3>
            <p className="mt-8 max-w-[412px] text-[21px] font-medium leading-[1.7] text-[#4C4C4C] md:text-[23px] lg:mt-[38px]">
              {cardText.split("\n").map((line, index) => (
                <span key={line}>
                  {line}
                  {index < cardText.split("\n").length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
          </div>

          <ContactItem
            className="contact-item-mail lg:absolute lg:left-[738px] lg:top-[34px] lg:w-[306px]"
            icon="mail"
            title={emailTitle}
            value="contact@future-lab.uz"
          />

          <ContactItem
            className="contact-item-telegram lg:absolute lg:left-[1107px] lg:top-[34px] lg:w-[240px]"
            icon="telegram"
            title={telegramTitle}
            value="@nazzar_group"
          />
        </div>
      </div>
    </section>
  );
}

function ContactGlow() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[378px] z-0 hidden h-[943.61px] w-[1825.34px] -translate-x-1/2 blur-[200px] lg:block"
      style={{ marginLeft: "-1.33px" }}
      aria-hidden="true"
    >
      <span className="absolute left-[929px] top-[96px] h-[837px] w-[444px] rounded-full bg-[#3FA1FC] rotate-[68.02deg]" />
      <span className="absolute left-[46px] top-[96px] h-[837px] w-[444px] rounded-full bg-[#FCCC01] [transform:matrix(-0.37,0.93,0.93,0.37,0,0)]" />
      <span className="absolute left-[535px] top-0 h-[837px] w-[444px] rounded-full bg-[#DA7FCE] [transform:matrix(-0.84,0.55,0.55,0.84,0,0)]" />
    </div>
  );
}

function ContactItem({
  className,
  icon,
  title,
  value,
}: {
  className?: string;
  icon: "mail" | "telegram";
  title: string;
  value: string;
}) {
  return (
    <div className={`contact-item ${className ?? ""}`}>
      {icon === "mail" ? (
        <div className="flex h-[55px] w-[55px] items-center justify-center rounded-[13px] bg-[#0051FF]">
          <MailIcon />
        </div>
      ) : (
        <Image
          src="/images/telegram.svg"
          alt=""
          width={55}
          height={55}
          className="h-[55px] w-[55px]"
          aria-hidden="true"
        />
      )}
      <p className="mt-[26px] text-[21px] font-medium leading-[26px] text-[#4C4C4C] md:text-[22px]">
        {title}
      </p>
      <p className="mt-[13px] text-[21px] font-medium leading-[26px] text-[#4C4C4C] md:text-[22px]">
        {value}
      </p>
    </div>
  );
}

function MailIcon() {
  return (
    <svg
      width="29"
      height="22"
      viewBox="0 0 29 22"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3.2 0.6H25.8C27.3 0.6 28.5 1.8 28.5 3.3V18.7C28.5 20.2 27.3 21.4 25.8 21.4H3.2C1.7 21.4 0.5 20.2 0.5 18.7V3.3C0.5 1.8 1.7 0.6 3.2 0.6Z"
        fill="white"
      />
      <path
        d="M3.8 4.1L13.2 12.2C14 12.9 15.1 12.9 15.9 12.2L25.3 4.1"
        fill="#0051FF"
      />
    </svg>
  );
}
