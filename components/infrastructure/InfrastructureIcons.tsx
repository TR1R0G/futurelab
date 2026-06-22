"use client";

import Image from "next/image";

interface IconProps {
  className?: string;
}

export function ZonesIcon({ className }: IconProps) {
  return (
    <Image
      src="/images/block4/icon1.svg"
      alt=""
      width={78}
      height={83}
      className={className}
      aria-hidden="true"
    />
  );
}

export function InteractionIcon({ className }: IconProps) {
  return (
    <Image
      src="/images/block4/icon2.svg"
      alt=""
      width={83}
      height={83}
      className={className}
      aria-hidden="true"
    />
  );
}

export function LabsIcon({ className }: IconProps) {
  return (
    <Image
      src="/images/block4/icon3.svg"
      alt=""
      width={83}
      height={83}
      className={className}
      aria-hidden="true"
    />
  );
}
