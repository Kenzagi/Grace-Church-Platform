/**
 * Shared server-side pagination — ONE home for page-param parsing and metadata.
 * Routes call parsePageParams() on their searchParams and pageMeta() when responding;
 * clients read `meta` from the envelope (see usePagedFetch).
 */
export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}

const MAX_PAGE_SIZE = 100;

/** Parse `page`/`pageSize` from a URLSearchParams; malformed or out-of-range values fall back to defaults. */
export function parsePageParams(
  sp: URLSearchParams,
  defaultPageSize = 20
): { page: number; pageSize: number; skip: number; take: number } {
  const rawPage = parseInt(sp.get("page") || "", 10);
  const rawSize = parseInt(sp.get("pageSize") || "", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize =
    Number.isFinite(rawSize) && rawSize > 0 ? Math.min(rawSize, MAX_PAGE_SIZE) : defaultPageSize;
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

/** Build the envelope `meta` block from a count + the parsed params. */
export function pageMeta(total: number, page: number, pageSize: number): PageMeta {
  return { page, pageSize, total, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}
