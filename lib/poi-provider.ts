export interface POI {
  id:       string
  name:     string
  lat:      number
  lng:      number
  category: "grocery" | "hardware" | "wholesale" | "pharmacy" | "fuel" | "all"
  address?: string
}

// Dummy Kingston stores — replace with /api/pois in Phase 6
export const KINGSTON_STORES: POI[] = [
  { id: "1", name: "Sovereign Centre SuperValu",       lat: 17.9947, lng: -76.7809, category: "grocery"   },
  { id: "2", name: "Hi-Lo Food Stores (Liguanea)",     lat: 17.9877, lng: -76.7784, category: "grocery"   },
  { id: "3", name: "MegaMart (Portmore)",               lat: 17.9512, lng: -76.8914, category: "wholesale"  },
  { id: "4", name: "Palace Autos Hardware",             lat: 18.0125, lng: -76.7432, category: "hardware"   },
  { id: "5", name: "Fontana Pharmacy (Half Way Tree)",  lat: 18.0058, lng: -76.7969, category: "pharmacy"   },
  { id: "6", name: "Total Energies (Constant Spring)", lat: 18.0280, lng: -76.7934, category: "fuel"       },
]
