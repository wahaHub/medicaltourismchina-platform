export function getProcedurePath(slug: string): string {
  return `/procedures/${encodeURIComponent(slug)}`;
}
