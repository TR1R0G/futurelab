"use client";

import Image from "next/image";

interface IconProps {
  className?: string;
}

export function WorkspaceIcon({ className }: IconProps) {
  return (
    <Image
      src="/images/block3/icon2.svg"
      alt=""
      width={83}
      height={83}
      className={className}
      aria-hidden="true"
    />
  );
}

export function TrainingIcon({ className }: IconProps) {
  return (
    <Image
      src="/images/block3/icon3.svg"
      alt=""
      width={83}
      height={84}
      className={className}
      aria-hidden="true"
    />
  );
}

export function ProductsIcon({ className }: IconProps) {
  return (
    <Image
      src="/images/block3/icon4.svg"
      alt=""
      width={83}
      height={83}
      className={className}
      aria-hidden="true"
    />
  );
}

export function StarIcon({ className }: IconProps) {
  return (
    <Image
      src="/images/block3/icon1.svg"
      alt=""
      width={83}
      height={83}
      className={className}
      aria-hidden="true"
    />
  );
}
