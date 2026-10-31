/**
 * Topic-matched photographic imagery. Unsplash's image CDN performs responsive
 * resizing, modern format negotiation (auto=format) and quality compression.
 * Keep the rendered dimensions small so mobile screens do not fetch originals.
 */
const photo = (id: string, width = 640) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=65`;

export const serviceVisuals: Array<{ match: RegExp; image: string; alt: string }> = [
  { match: /water|पाणी|जल/i, image: photo("photo-1548839140-29a749e1cf4d", 720), alt: "Clean water supply" },
  { match: /road|रस्ता|रस्ते/i, image: photo("photo-1541888946425-d81bb19240f5", 720), alt: "Road construction work" },
  { match: /drain|clean|स्वच्छ|नाला|गटार/i, image: photo("photo-1517581177682-a085bb7ffb15", 720), alt: "Drainage and sanitation" },
  { match: /electric|वीज|विद्युत/i, image: photo("photo-1473341304170-971adc8b2c87", 720), alt: "Electricity infrastructure" },
  { match: /light|दिवा|लाईट/i, image: photo("photo-1507473885765-e6ed057f782c", 720), alt: "Street lighting" },
  { match: /health|hospital|आरोग्य|दवाखाना/i, image: photo("photo-1586773860418-d37222d8fce3", 720), alt: "Healthcare facility" },
];

export function getServiceVisual(name: string) {
  return serviceVisuals.find((item) => item.match.test(name)) ?? serviceVisuals[0];
}

export const schemeVisuals: Array<{ match: RegExp; image: string; alt: string }> = [
  { match: /ladki|bahin|महिला|लाडकी|बहीण/i, image: photo("photo-1531123897727-8f129e1688ce", 760), alt: "Women beneficiaries" },
  { match: /awas|housing|घरकुल|आवास/i, image: photo("photo-1600585154340-be6161a56a0c", 760), alt: "Residential housing" },
  { match: /ayushman|health|आरोग्य|जन आरोग्य/i, image: photo("photo-1576091160399-112ba8d25d1d", 760), alt: "Healthcare services" },
  { match: /niradhar|pension|निराधार|पेन्शन/i, image: photo("photo-1544005313-94ddf0286df2", 760), alt: "Citizen support beneficiary" },
  { match: /phule|jan aarogya|महात्मा फुले/i, image: photo("photo-1559757175-0eb30cd8c063", 760), alt: "Medical care" },
  { match: /ujjwala|lpg|उज्ज्वला|गॅस/i, image: photo("photo-1585704032915-c3400ca199e7", 760), alt: "Clean cooking gas" },
];

export function getSchemeVisual(title: string) {
  return schemeVisuals.find((item) => item.match.test(title)) ?? {
    image: photo("photo-1497366754035-f200968a6e72", 760), alt: "Government citizen services",
  };
}

export const workVisuals: Array<{ match: RegExp; image: string; alt: string }> = [
  { match: /road|रस्ता|concrete/i, image: photo("photo-1541888946425-d81bb19240f5", 760), alt: "Road development" },
  { match: /water|pipeline|पाणी|जलवाहिनी/i, image: photo("photo-1548839140-29a749e1cf4d", 760), alt: "Water pipeline infrastructure" },
  { match: /light|led|वीज|दिवे/i, image: photo("photo-1507473885765-e6ed057f782c", 760), alt: "Street light installation" },
  { match: /garden|tree|beautification|उद्यान|सुशोभीकरण/i, image: photo("photo-1441974231531-c6227db76b6e", 760), alt: "Green public spaces" },
  { match: /drain|sewer|नाला|गटार/i, image: photo("photo-1517581177682-a085bb7ffb15", 760), alt: "Drainage infrastructure" },
];

export function getWorkVisual(title: string) {
  return workVisuals.find((item) => item.match.test(title)) ?? {
    image: photo("photo-1541888946425-d81bb19240f5", 760), alt: "Public development work",
  };
}
