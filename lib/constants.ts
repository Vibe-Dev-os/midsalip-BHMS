// Complete list of Midsalip, Zamboanga del Sur barangays with coordinates
export const MIDSALIP_BARANGAYS = [
  "Bacahan",
  "Balonai",
  "Bibilop",
  "Buloron",
  "Cabaloran",
  "Canipay Norte",
  "Canipay Sur",
  "Cumarom",
  "Dakayakan",
  "Duelic",
  "Dumalinao",
  "Ecuan",
  "Golictop",
  "Guinabot",
  "Guitalos",
  "Guma",
  "Kahayagan",
  "Licuro-an",
  "Lumpunid",
  "Matalang",
  "New Katipunan",
  "New Unidos",
  "Palili",
  "Pawan",
  "Pili",
  "Pisompongan",
  "Piwan",
  "Poblacion A",
  "Poblacion B",
  "Sigapod",
  "Timbaboy",
  "Tulbong",
  "Tuluan",
] as const;

export type MidsalipBarangay = (typeof MIDSALIP_BARANGAYS)[number];

// Midsalip municipality center coordinates (approximate center of all barangays)
export const MIDSALIP_CENTER = { lat: 8.0400, lng: 123.2800 };

// Barangay coordinates for map centering (official coordinates)
export const BARANGAY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Bacahan": { lat: 8.0310, lng: 123.3497 },
  "Balonai": { lat: 8.0534, lng: 123.1630 },
  "Bibilop": { lat: 8.0494, lng: 123.2372 },
  "Buloron": { lat: 8.0090, lng: 123.3544 },
  "Cabaloran": { lat: 8.0592, lng: 123.2787 },
  "Canipay Norte": { lat: 8.0514, lng: 123.2997 },
  "Canipay Sur": { lat: 8.0403, lng: 123.2958 },
  "Cumarom": { lat: 8.0428, lng: 123.2081 },
  "Dakayakan": { lat: 8.0312, lng: 123.2330 },
  "Duelic": { lat: 8.0190, lng: 123.2353 },
  "Dumalinao": { lat: 8.0188, lng: 123.3666 },
  "Ecuan": { lat: 8.0682, lng: 123.2201 },
  "Golictop": { lat: 8.0366, lng: 123.2427 },
  "Guinabot": { lat: 8.0416, lng: 123.2592 },
  "Guitalos": { lat: 8.0345, lng: 123.3323 },
  "Guma": { lat: 8.0487, lng: 123.2774 },
  "Kahayagan": { lat: 8.0184, lng: 123.3080 },
  "Licuro-an": { lat: 8.0532, lng: 123.3294 },
  "Lumpunid": { lat: 7.9934, lng: 123.3479 },
  "Matalang": { lat: 8.0268, lng: 123.2764 },
  "New Katipunan": { lat: 8.0823, lng: 123.2535 },
  "New Unidos": { lat: 8.0445, lng: 123.2786 },
  "Palili": { lat: 8.0722, lng: 123.3164 },
  "Pawan": { lat: 8.0664, lng: 123.2769 },
  "Pili": { lat: 8.0756, lng: 123.1769 },
  "Pisompongan": { lat: 8.0519, lng: 123.2651 },
  "Piwan": { lat: 8.0193, lng: 123.1842 },
  "Poblacion A": { lat: 8.0296, lng: 123.3171 },
  "Poblacion B": { lat: 8.0329, lng: 123.3148 },
  "Sigapod": { lat: 8.0019, lng: 123.3051 },
  "Timbaboy": { lat: 8.0379, lng: 123.3056 },
  "Tulbong": { lat: 8.0592, lng: 123.2384 },
  "Tuluan": { lat: 8.0366, lng: 123.2801 },
};

// Helper function to get barangay list with "All Barangays" option for filters
export const BARANGAYS_WITH_ALL = ["All Barangays", ...MIDSALIP_BARANGAYS] as const;

// Barangay data with coordinates for map markers
export const BARANGAY_MARKERS = Object.entries(BARANGAY_COORDINATES).map(([name, coords]) => ({
  name,
  lat: coords.lat,
  lng: coords.lng,
}));
