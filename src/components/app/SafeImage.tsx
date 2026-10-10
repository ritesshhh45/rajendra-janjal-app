import { useEffect, useState, type ImgHTMLAttributes } from "react";

/**
 * Shows the bundled `fallback` immediately; swaps to the remote `src` only after it has
 * fully loaded in the background. Falls back again on error. Never shows an empty box.
 */
export function SafeImage({
  src, fallback, priority, width, height, className, alt = "", ...rest
}: ImgHTMLAttributes<HTMLImageElement> & { src?: string | null; fallback?: string; priority?: boolean; width?: number; height?: number }) {
  const remote = src && src !== fallback ? src : null;
  const [shown, setShown] = useState<string | undefined>(fallback ?? remote ?? undefined);
  const [loaded, setLoaded] = useState(!!fallback);

  useEffect(() => {
    if (!remote) { setShown(fallback); return; }
    if (!fallback) { setShown(remote); return; }
    const img = new Image();
    img.decoding = "async";
    img.onload = () => setShown(remote);
    img.onerror = () => setShown(fallback);
    img.src = remote;
    return () => { img.onload = img.onerror = null; };
  }, [remote, fallback]);

  return (
    <img
      {...rest}
      src={shown}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : {})}
      onLoad={() => setLoaded(true)}
      onError={() => { if (fallback && shown !== fallback) setShown(fallback); }}
      className={`${className ?? ""} transition-[filter,opacity] duration-300 ${loaded ? "" : "bg-muted blur-sm"}`}
    />
  );
}
