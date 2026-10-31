import { useState } from "react";

const SERVICE_IMAGES: Array<{ keys: string[]; src: string }> = [
  { keys: ["water", "पाणी", "पाणीपुरवठा", "jal"], src: "/images/services/water.webp" },
  { keys: ["road", "रस्ता", "खड्डा", "रस्ते"], src: "/images/services/road.webp" },
  { keys: ["pipeline", "pipe", "पाइप", "पाईप", "जलवाहिनी"], src: "/images/services/pipeline.webp" },
  { keys: ["drain", "sewer", "gutter", "गटार", "ड्रेनेज", "नाली"], src: "/images/services/drainage.webp" },
  { keys: ["street light", "streetlight", "led", "पथदिवे", "दिवे"], src: "/images/services/street-light.webp" },
  { keys: ["electric", "power", "वीज", "विद्युत"], src: "/images/services/electricity.webp" },
  { keys: ["garbage", "waste", "clean", "कचरा", "स्वच्छता"], src: "/images/services/garbage.webp" },
  { keys: ["health", "hospital", "medical", "आरोग्य", "रुग्णालय"], src: "/images/services/health.webp" },
  { keys: ["education", "school", "शिक्षण", "शाळा"], src: "/images/services/education.webp" },
  { keys: ["garden", "tree", "park", "उद्यान", "बाग", "झाड"], src: "/images/services/garden.webp" },
];

export function getServiceImage(...labels: Array<string | null | undefined>) {
  const value = labels.filter(Boolean).join(" ").toLocaleLowerCase();
  return SERVICE_IMAGES.find(({ keys }) => keys.some((key) => value.includes(key)))?.src
    ?? "/images/services/general.webp";
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
  const src = getServiceImage(name, secondaryName);
  const [failed, setFailed] = useState(false);
  return (
    <img
      src={failed ? "/images/services/general.webp" : src}
      alt={name ?? secondaryName ?? "Citizen service"}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
