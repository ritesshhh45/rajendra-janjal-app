/**
 * Local, offline-safe imagery. Every image is bundled in /public/images, so nothing
 * depends on an external CDN and every card always shows a topic-matched picture.
 *
 *  - /images/services/*  → civic services & development works
 *  - /images/schemes/*   → government scheme illustrations
 */
type Visual = { image: string; alt: string };
type Rule = { match: RegExp; image: string; alt: string };

const svc = (n: string) => `/images/services/${n}.webp`;
const sch = (n: string) => `/images/schemes/${n}.webp`;

export const GENERAL_SERVICE = svc("general");
export const GENERAL_SCHEME = sch("general");

/** Order matters: the most specific rules come first (pipeline before water, etc.). */
export const serviceRules: Rule[] = [
  { match: /pipeline|\bpipe|पाइप|पाईप|जलवाहिनी/i, image: svc("pipeline"), alt: "Water pipeline" },
  { match: /street\s*-?light|streetlight|\bled\b|light|पथदिवे|दिवे|दिवा|लाईट|लाइट/i, image: svc("street-light"), alt: "Street lighting" },
  { match: /drain|sewer|gutter|नाला|नाली|गटार|ड्रेनेज/i, image: svc("drainage"), alt: "Drainage" },
  { match: /garbage|waste|trash|clean|कचरा|स्वच्छ/i, image: svc("garbage"), alt: "Cleanliness and garbage" },
  { match: /water|tap|पाणी|जल/i, image: svc("water"), alt: "Water supply" },
  { match: /road|pothole|concrete|asphalt|रस्ता|रस्ते|खड्डा|काँक्रीट/i, image: svc("road"), alt: "Road work" },
  { match: /electric|power|वीज|विद्युत/i, image: svc("electricity"), alt: "Electricity" },
  { match: /health|hospital|medical|आरोग्य|रुग्णालय|दवाखाना|वैद्यकीय/i, image: svc("health"), alt: "Health help" },
  { match: /educat|school|शिक्षण|शाळा/i, image: svc("education"), alt: "Education help" },
  { match: /garden|tree|park|beautif|उद्यान|बाग|वृक्ष|झाड|सुशोभीकरण/i, image: svc("garden"), alt: "Garden and trees" },
];

/** Returns the matching local image path, or null when nothing matches. */
export function matchServiceImage(...labels: Array<string | null | undefined>): string | null {
  const text = labels.filter(Boolean).join(" ");
  return serviceRules.find((r) => r.match.test(text))?.image ?? null;
}

export function getServiceVisual(...labels: Array<string | null | undefined>): Visual {
  const text = labels.filter(Boolean).join(" ");
  return serviceRules.find((r) => r.match.test(text)) ?? { image: GENERAL_SERVICE, alt: "Citizen service" };
}

export const schemeRules: Rule[] = [
  { match: /ladki|ladaki|bahin|bahini|महिला|लाडकी|बहीण|बहिण/i, image: sch("women"), alt: "Women's financial assistance" },
  { match: /awas|awaas|housing|gharkul|घरकुल|आवास|निवास/i, image: sch("housing"), alt: "Housing" },
  { match: /phule|jan\s*aarogya|जन\s*आरोग्य|महात्मा\s*फुले/i, image: sch("medical"), alt: "Free medical treatment" },
  { match: /ayushman|pm-?jay|health|आयुष्मान|आरोग्य/i, image: sch("health"), alt: "Health cover" },
  { match: /niradhar|pension|destitute|निराधार|पेन्शन|पेंशन|अनुदान/i, image: sch("pension"), alt: "Monthly pension" },
  { match: /ujjwala|lpg|gas|उज्ज्वला|उज्वला|गॅस/i, image: sch("lpg"), alt: "LPG gas connection" },
];

export function getSchemeVisual(title: string): Visual {
  return schemeRules.find((r) => r.match.test(title)) ?? { image: GENERAL_SCHEME, alt: "Government scheme" };
}

/** Development works on the home screen reuse the service photography. */
export function getWorkVisual(title: string): Visual {
  return getServiceVisual(title);
}
