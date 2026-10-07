export function slugify(name: string): string {
  return name.replace(/\s+/g, '-').toLowerCase();
}