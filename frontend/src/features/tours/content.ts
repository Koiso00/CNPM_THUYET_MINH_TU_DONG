export type Place = {
  id: string;
  title: string;
  description: string;
  source: string;
  location: { type: "Point"; coordinates: [number, number] } | null;
  audio_id?: string | null;
  audio_by_language?: Partial<Record<"vi" | "en" | "ko", string>>;
  translations?: Partial<
    Record<"en" | "ko", LocalizedPlace>
  >;
};
export type LocalizedPlace = {
  title: string;
  description: string;
  source: string;
  source_text_sha256: string;
};
export type CampusDraft = { title: string; language: "vi"; places: Place[] };
export type PublishedCampus = CampusDraft & { release_id: string };
export type ManagedCampus = {
  revision: number;
  draft: CampusDraft;
  published_release_id: string | null;
};
