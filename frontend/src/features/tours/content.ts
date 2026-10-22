export type Place = {
  id: string;
  title: string;
  description: string;
  source: string;
  location: { type: "Point"; coordinates: [number, number] } | null;
  audio_id?: string | null;
};
export type CampusDraft = { title: string; language: "vi"; places: Place[] };
export type PublishedCampus = CampusDraft & { release_id: string };
export type ManagedCampus = {
  revision: number;
  draft: CampusDraft;
  published_release_id: string | null;
};
