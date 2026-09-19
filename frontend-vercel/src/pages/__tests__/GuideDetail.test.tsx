import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import GuideDetail from "../GuideDetail";
import { setPageSeo } from "@/utils/seo";

const language = vi.hoisted(() => ({ code: "en" }));
vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({ currentLanguage: language, t: (key: string) => key }),
}));
vi.mock("@/components/Header", () => ({ default: () => null }));
vi.mock("@/components/Footer", () => ({ default: () => null }));
vi.mock("@/components/TopBanner", () => ({ default: () => null }));
vi.mock("@/utils/seo", () => ({ setPageSeo: vi.fn(), SITE_ORIGIN: "https://www.medicaltourismchina.health" }));
vi.mock("@/seo/static-page", () => ({ getStaticPageMetadata: () => ({ locale: { heading: "Guides" } }) }));
vi.mock("@/data/guides-manifest.json", () => ({ default: { categories: [{
  slug: "demo", title: { en: "Guides", es: "Guías" }, image: null,
  guides: ["first", "second"].map(slug => ({
    slug, title: { en: slug, es: slug }, subtitle: { en: "Manifest subtitle", es: "Subtítulo" },
    excerpt: "Manifest excerpt", subcategory: "", locales: ["en", "es"],
    updatedDate: "2026/09/09", readTimeMinutes: 1,
  })),
}] } }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve: (value: T) => resolve(value) };
}

function response(name: string) {
  return { ok: true, text: async () => `## Hero

- **Title:** ${name}
- **Reviewed by:** Editorial team for ${name}

## Content

${name} article body.

## SEO Metadata

- **Meta title:** Authored ${name} SEO
- **Meta description:** Authored description for ${name} with the complete source qualification.
` } as Response;
}

function Navigation() {
  const navigate = useNavigate();
  return <button onClick={() => navigate("/guides/demo/second")}>Next article</button>;
}

function mount() {
  render(<MemoryRouter initialEntries={["/guides/demo/first"]}>
    <Navigation />
    <Routes><Route path="/guides/:categorySlug/:guideSlug" element={<GuideDetail />} /></Routes>
  </MemoryRouter>);
}

beforeEach(() => { language.code = "en"; vi.clearAllMocks(); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("GuideDetail source metadata", () => {
  it.each(["en", "es"])("uses the %s article's authored metadata and preserves prerendered tags while loading", async locale => {
    language.code = locale;
    const pending = deferred<Response>();
    const fetcher = vi.fn((_url: RequestInfo | URL, _options?: RequestInit) => pending.promise);
    vi.stubGlobal("fetch", fetcher);
    mount();
    expect(setPageSeo).not.toHaveBeenCalled();
    expect(fetcher.mock.calls[0][0]).toBe(`/guides/demo/first${locale === "en" ? "" : ".es"}.md`);
    await act(async () => pending.resolve(response("First")));
    await screen.findByText("First article body.");
    expect(setPageSeo).toHaveBeenLastCalledWith(expect.objectContaining({
      title: "Authored First SEO",
      description: "Authored description for First with the complete source qualification.",
      path: "/guides/demo/first",
    }));
    expect(screen.getByText("Editorial team for First")).toBeTruthy();
    expect(document.querySelector("article")?.getAttribute("lang")).toBe(locale);
    const schema = vi.mocked(setPageSeo).mock.lastCall?.[0].structuredData as { "@graph": Record<string, unknown>[] };
    expect(schema["@graph"][0]).not.toHaveProperty("reviewedBy");
  });

  it("does not reuse the previous article's body or metadata during navigation", async () => {
    const second = deferred<Response>();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(response("First")).mockReturnValueOnce(second.promise));
    mount();
    await screen.findByText("First article body.");
    vi.mocked(setPageSeo).mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Next article" }));
    expect(screen.queryByText("First article body.")).toBeNull();
    expect(setPageSeo).not.toHaveBeenCalled();
    await act(async () => second.resolve(response("Second")));
    await screen.findByText("Second article body.");
    expect(setPageSeo).toHaveBeenLastCalledWith(expect.objectContaining({ title: "Authored Second SEO", path: "/guides/demo/second" }));
  });

  it("ignores an old request that resolves after navigating to another article", async () => {
    const first = deferred<Response>();
    const second = deferred<Response>();
    const fetcher = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    vi.stubGlobal("fetch", fetcher);
    mount();
    fireEvent.click(screen.getByRole("button", { name: "Next article" }));
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    await act(async () => second.resolve(response("Second")));
    await screen.findByText("Second article body.");
    await act(async () => first.resolve(response("First")));
    expect(screen.queryByText("First article body.")).toBeNull();
    expect(screen.getByText("Second article body.")).toBeTruthy();
    expect(setPageSeo).toHaveBeenLastCalledWith(expect.objectContaining({ title: "Authored Second SEO", path: "/guides/demo/second" }));
  });
});
