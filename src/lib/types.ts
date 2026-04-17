export const CONTENT_TYPES = [
  "ugc",
  "staticAds",
  "existing",
  "production",
  "animation",
  "other",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export const TYPE_LABELS: Record<ContentType, string> = {
  ugc: "UGC",
  staticAds: "Static Ads",
  existing: "Existing",
  production: "Production",
  animation: "Animation",
  other: "Other",
};
