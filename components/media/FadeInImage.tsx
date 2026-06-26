"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export function FadeInImage({
  alt,
  className = "",
  onLoad,
  ...props
}: ImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      {...props}
      alt={alt}
      className={`${className} transition-opacity duration-500 ease-out ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
      onLoad={(event) => {
        setLoaded(true);
        window.dispatchEvent(new Event("futurelab:image-loaded"));
        onLoad?.(event);
      }}
    />
  );
}
