// Utility to generate a slug from a string (e.g., story title)
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036F]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Trim hyphens from start/end
    .replace(/-{2,}/g, '-'); // Collapse multiple hyphens
} 