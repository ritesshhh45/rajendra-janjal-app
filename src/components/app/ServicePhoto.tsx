import { VisualImg } from "@/components/app/VisualImg";
import { getServiceVisual } from "@/lib/visuals";

export function getServiceImage(...labels: Array<string | null | undefined>) {
  return getServiceVisual(...labels).image;
}

export function ServicePhoto({
  name,
  secondaryName,
  className = "",
}: {
  name?: string | null;
  secondaryName?: string | null;
  className?: string;
}) {
  const v = getServiceVisual(name, secondaryName);
  return <VisualImg src={v.image} alt={name ?? secondaryName ?? v.alt} className={className} />;
}
