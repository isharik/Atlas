/** Turn a display name into a stable URL slug (shared by list cards and detail routes). */
export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
