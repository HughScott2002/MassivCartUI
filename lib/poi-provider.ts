export interface POI {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: "grocery" | "pharmacy" | "wholesale" | "hardware" | "fuel";
  address?: string;
  rating?: number;
}

export type POICategory = POI["category"];
