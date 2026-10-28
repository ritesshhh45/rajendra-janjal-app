import { createContext, useContext, useState } from 'react';
const D = {
  en: { hi: 'Welcome to our ward', reg: 'Register to receive ward updates', name: 'Full name', mob: 'Mobile number', addr: 'Address', email: 'Email', dob: 'Date of birth (DD/MM/YYYY)', go: 'Register & continue', consent: 'I agree to the Privacy Policy', updates: "Today's Updates", schemes: 'Government Schemes', works: 'Development Works', home: 'Home', profile: 'Profile', logout: 'Log out', del: 'Delete my account', call: 'Call', office: 'Office', all: 'See all' },
  mr: { hi: 'आपल्या प्रभागात स्वागत', reg: 'प्रभागाचे अपडेट्स मिळवण्यासाठी नोंदणी करा', name: 'पूर्ण नाव', mob: 'मोबाईल नंबर', addr: 'पत्ता', email: 'ईमेल', dob: 'जन्मतारीख (DD/MM/YYYY)', go: 'नोंदणी करा आणि पुढे जा', consent: 'मी गोपनीयता धोरणास सहमत आहे', updates: 'आजचे अपडेट्स', schemes: 'सरकारी योजना', works: 'विकास कामे', home: 'मुख्यपृष्ठ', profile: 'प्रोफाइल', logout: 'लॉग आउट', del: 'माझे खाते हटवा', call: 'कॉल', office: 'कार्यालय', all: 'सर्व' },
};
const L = createContext();
export const LangProvider = ({ children }) => { const [lang, setLang] = useState('mr'); return <L.Provider value={{ lang, setLang, t: (k) => D[lang][k] }}>{children}</L.Provider>; };
export const useT = () => useContext(L);
