// Real photos keyword varun yetat (loremflickr). Apale photos ghalayche tar url badla kinva assets/images vapra.
const img = (k, n) => `https://loremflickr.com/600/400/${k}?lock=${n}`;
export const UPDATES = [
  { id: 'u1', tag: 'Health', title: 'Free health camp', body: 'Sunday 10 AM - 2 PM, community hall', image: img('doctor,clinic', 1) },
  { id: 'u2', tag: 'Development', title: 'New road inauguration', body: 'Sunday 9 AM at Lane 5', image: img('road,asphalt', 2) },
  { id: 'u3', tag: 'Water', title: 'Water supply off tomorrow', body: '10 AM to 5 PM. Please store water.', image: img('water,tap', 3) },
];
export const SCHEMES = [
  { id: 's1', title: 'Mukhyamantri Majhi Ladki Bahin Yojana', image: img('indian,woman', 4) },
  { id: 's2', title: 'Pradhan Mantri Awas Yojana (Urban)', image: img('house,construction', 5) },
  { id: 's3', title: 'Ayushman Bharat (PM-JAY)', image: img('hospital', 6) },
  { id: 's4', title: 'Sanjay Gandhi Niradhar Anudan Yojana', image: img('elderly,india', 7) },
];
export const WORKS = [
  { id: 'w1', title: 'Concrete road - Lane 5', sub: '1.2 km concrete road', status: 'Completed', image: img('road,concrete', 8) },
  { id: 'w2', title: 'New water pipeline', sub: 'Laying a new water pipeline', status: 'In progress', image: img('pipeline,pipe', 9) },
  { id: 'w3', title: 'LED street lights', sub: '200 new LED street lights', status: 'In progress', image: img('streetlight', 10) },
  { id: 'w4', title: 'Garden beautification', sub: 'Beautification of the local garden', status: 'Approved', image: img('garden,park', 11) },
];
