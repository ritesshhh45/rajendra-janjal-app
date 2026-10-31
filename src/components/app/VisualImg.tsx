import { useState, type ImgHTMLAttributes } from "react";

/** <img> that swaps to a bundled fallback if the file ever fails to load. */
export function VisualImg({
  src, fallback = "/images/services/general.webp", alt = "", ...rest
}: ImgHTMLAttributes<HTMLImageElement> & { src: string; fallback?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <img
      {...rest}
      src={failed ? fallback : src}
      alt={alt}
      loading={rest.loading ?? "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
