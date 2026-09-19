import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryRouter, useLocation } from "react-router-dom";
import GuideCard, { type GuideCardGuide } from "../guides/GuideCard";

afterEach(cleanup);

const guide: GuideCardGuide = {
  slug: "example-guide",
  title: { en: "Actual English title", zh: "中文标题", es: "Spanish title without a body", ar: "عنوان عربي" },
  subtitle: { en: "Actual English subtitle", zh: "中文副标题", es: "Spanish subtitle without a body", ar: "وصف عربي" },
  locales: ["en", "zh"], excerpt: "", subcategory: "", updatedDate: "2026/09/10", readTimeMinutes: 8,
};
const path = "/guides/example-category/example-guide";

function Location() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}

function renderCard(locale: string, overrides: Partial<GuideCardGuide> = {}) {
  const basename = locale === "en" ? "/" : `/${locale}`;
  return render(
    <MemoryRouter basename={basename} initialEntries={[`${locale === "en" ? "" : basename}/guides`]}>
      <GuideCard guide={{ ...guide, ...overrides }} categorySlug="example-category"
        categoryTitle="Categoría nativa" categoryImage={null} locale={locale}
        updatedLabel="Actualizado {{date}}" minReadLabel="{{minutes}} minutos" readGuideLabel="Leer guía" />
      <Location />
    </MemoryRouter>,
  );
}

describe("GuideCard actual content locale", () => {
  it.each(["es", "zh", "ar", "id"])("links %s fallback directly to English outside the router basename", (locale) => {
    renderCard(locale, { locales: ["en"] });
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe(path);
    expect(screen.getByRole("heading").textContent).toBe(guide.title.en);
    expect(screen.getByText(guide.subtitle.en)).toBeTruthy();
    expect(screen.getByText("English").getAttribute("lang")).toBe("en");
    expect(screen.queryByText(guide.title.es)).toBeNull();
    expect(screen.getByText("Categoría nativa")).toBeTruthy();
    expect(screen.getByText("Leer guía")).toBeTruthy();
    expect(screen.getByText("8 minutos")).toBeTruthy();

    // Observe whether React Router intercepted the click, then stop jsdom's
    // unsupported full navigation at window level after React's root handler.
    let routerPreventedNavigation: boolean | undefined;
    window.addEventListener("click", (event) => {
      routerPreventedNavigation = event.defaultPrevented;
      event.preventDefault();
    }, { once: true });
    fireEvent.click(link);
    expect(routerPreventedNavigation).toBe(false);
    expect(screen.getByTestId("location").textContent).toBe("/guides");
  });

  it.each(["en", "es"])("links %s to actual Chinese content when English is absent", (locale) => {
    renderCard(locale, { locales: ["zh"] });
    expect(screen.getByRole("link").getAttribute("href")).toBe(`/zh${path}`);
    expect(screen.getByRole("heading").textContent).toBe(guide.title.zh);
    expect(screen.getByText(guide.subtitle.zh)).toBeTruthy();
    expect(screen.getByText("中文").getAttribute("lang")).toBe("zh");
  });

  it.each(["en", "zh", "ar"])("keeps %s routing within its basename exactly once when available", (locale) => {
    renderCard(locale, { locales: ["en", "zh", "ar"] });
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe(`${locale === "en" ? "" : `/${locale}`}${path}`);
    expect(screen.getByRole("heading").textContent).toBe(guide.title[locale]);
    expect(screen.getByText(guide.subtitle[locale])).toBeTruthy();
    expect(screen.queryByText("English")).toBeNull();
    expect(screen.queryByText("中文")).toBeNull();
    fireEvent.click(link);
    expect(screen.getByTestId("location").textContent).toBe(path);
  });

  it("does not substitute an unrelated translated title when actual-language metadata is absent", () => {
    renderCard("es", { locales: ["en"], title: { es: guide.title.es }, subtitle: { es: guide.subtitle.es } });
    expect(screen.getByRole("heading").textContent).toBe(guide.slug);
    expect(screen.queryByText(guide.title.es)).toBeNull();
    expect(screen.queryByText(guide.subtitle.es)).toBeNull();
    expect(screen.getByRole("link").getAttribute("href")).toBe(path);
  });
});
