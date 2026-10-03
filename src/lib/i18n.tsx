import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "mr" | "en";

// All app text lives here — edit freely.
const dict = {
  appName: { mr: "डिजिटल वॉर्ड", en: "Digital Ward" },
  welcome: { mr: "आपल्या वॉर्डमध्ये आपले स्वागत आहे", en: "Welcome to our ward" },
  welcomeSub: { mr: "नोंदणी करा आणि वॉर्डच्या ताज्या घडामोडी मिळवा", en: "Register to receive ward updates" },
  fullName: { mr: "पूर्ण नाव", en: "Full Name" },
  mobile: { mr: "मोबाईल नंबर", en: "Mobile Number" },
  address: { mr: "पत्ता", en: "Address" },
  dob: { mr: "जन्मतारीख", en: "Date of Birth" },
  register: { mr: "नोंदणी करा", en: "Register" },
  mobileInvalid: { mr: "वैध १० अंकी मोबाईल नंबर टाका", en: "Enter a valid 10-digit mobile number" },
  required: { mr: "हे आवश्यक आहे", en: "This is required" },
  namaskar: { mr: "नमस्कार", en: "Namaskar" },
  schemes: { mr: "शासकीय योजना", en: "Government Schemes" },
  gallery: { mr: "गॅलरी", en: "Gallery" },
  notifications: { mr: "सूचना", en: "Notifications" },
  about: { mr: "नेत्यांविषयी", en: "About Leader" },
  contact: { mr: "वॉर्ड कार्यालय संपर्क", en: "Contact Ward Office" },
  home: { mr: "मुख्यपृष्ठ", en: "Home" },
  profile: { mr: "प्रोफाइल", en: "Profile" },
  search: { mr: "योजना शोधा", en: "Search schemes" },
  eligibility: { mr: "पात्रता", en: "Eligibility" },
  howToApply: { mr: "अर्ज कसा करावा", en: "How to apply" },
  applyNow: { mr: "अर्ज करा / अधिक माहिती", en: "Apply / Know more" },
  empty: { mr: "अजून काही नाही", en: "Nothing here yet" },
  save: { mr: "जतन करा", en: "Save" },
  saved: { mr: "जतन केले", en: "Saved" },
  language: { mr: "भाषा", en: "Language" },
  privacy: { mr: "गोपनीयता धोरण", en: "Privacy Policy" },
  terms: { mr: "अटी व शर्ती", en: "Terms of Use" },
  deleteAccount: { mr: "माझे खाते हटवा", en: "Delete my account" },
  deleteConfirm: { mr: "तुमची सर्व माहिती कायमची हटवली जाईल. खात्री आहे?", en: "All your data will be permanently deleted. Are you sure?" },
  cancel: { mr: "रद्द करा", en: "Cancel" },
  confirm: { mr: "हटवा", en: "Delete" },
  back: { mr: "मागे", en: "Back" },
  updatesFrom: { mr: "आपल्या नेत्यांकडून थेट अपडेट्स", en: "Direct updates from your leader" },
  aboutText: {
    mr: "राजेंद्र जंजाळ हे छत्रपती संभाजीनगरचे उपमहापौर आणि शिवसेनेचे जिल्हाप्रमुख आहेत. नागरिकांच्या प्रश्नांसाठी ते सदैव उपलब्ध असतात.",
    en: "Rajendra Janjal is the Deputy Mayor of Chhatrapati Sambhajinagar and District Chief of Shiv Sena, always available for citizens' concerns.",
  },
  officeAddress: { mr: "वॉर्ड कार्यालय, छत्रपती संभाजीनगर", en: "Ward Office, Chhatrapati Sambhajinagar" },
  call: { mr: "कॉल करा", en: "Call" },
} as const;

export type Key = keyof typeof dict;

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: Key) => string }>({
  lang: "mr",
  setLang: () => {},
  t: (k) => dict[k].mr,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("mr");
  useEffect(() => {
    const s = localStorage.getItem("dw_lang");
    if (s === "en" || s === "mr") setLangState(s);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("dw_lang", l);
  };
  return <Ctx.Provider value={{ lang, setLang, t: (k) => dict[k][lang] }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
