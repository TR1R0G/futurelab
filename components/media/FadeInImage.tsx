"use client";

import Image, { type ImageProps } from "next/image";

export function FadeInImage({
  alt,
  className = "",
  onLoad,
  ...props
}: ImageProps) {
  return (
    <Image
      {...props}
      alt={alt}
      className={className}
      onLoad={(event) => {
        window.dispatchEvent(new Event("futurelab:image-loaded"));
        onLoad?.(event);
      }}
    />
  );
}
