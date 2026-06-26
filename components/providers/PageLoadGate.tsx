"use client";

import { useEffect, useState } from "react";

const CRITICAL_IMAGES = ["/images/optimized/office.webp", "/images/logo.svg"];
const MAX_WAIT_MS = 3200;

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new window.Image();
    let resolved = false;

    const done = () => {
      if (resolved) return;
      resolved = true;
      resolve();
    };

    image.decoding = "async";
    image.onload = done;
    image.onerror = done;
    image.src = src;

    if (image.complete) {
      done();
      return;
    }

    image.decode?.().then(done).catch(done);
  });
}

export function PageLoadGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    document.documentElement.classList.add("is-preloading");

    const timeout = window.setTimeout(() => {
      if (!mounted) return;
      setReady(true);
    }, MAX_WAIT_MS);

    Promise.all(CRITICAL_IMAGES.map(preloadImage)).then(() => {
      if (!mounted) return;

      window.clearTimeout(timeout);
      setReady(true);
    });

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
      document.documentElement.classList.remove("is-preloading");
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    document.documentElement.classList.remove("is-preloading");
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event("futurelab:critical-assets-ready"));
    });
  }, [ready]);

  return (
    <>
      <div
        className={`transition-opacity duration-500 ease-out ${
          ready ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {children}
      </div>

      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-500 ease-out ${
          ready ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        aria-hidden={ready}
        aria-busy={!ready}
      >
        <div className="h-1 w-[min(420px,70vw)] overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-[futurelab-loader_1.05s_ease-in-out_infinite] rounded-full bg-[linear-gradient(90deg,#4B0E5B_0%,#A91E83_29.9%,#FD9A34_65.67%,#F9EB44_100%)]" />
        </div>
      </div>
    </>
  );
}
