import { afterEach, describe, expect, it, vi } from "vitest";
import middleware from "../../middleware";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("hospital slug middleware", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("redirects old hospital slugs to canonical slugs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      jsonResponse({ type: "redirect", toSlug: "chongqing-hygeia-hospital", status: 301 }),
    ));

    const response = await middleware(new Request("https://www.medicaltourismchina.health/hospitals/hospital-mm4eqlha"));

    expect(response?.status).toBe(301);
    expect(response?.headers.get("location")).toBe("https://www.medicaltourismchina.health/hospitals/chongqing-hygeia-hospital");
  });

  it("preserves query strings when redirecting", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      jsonResponse({ type: "redirect", toSlug: "chongqing-hygeia-hospital", status: 301 }),
    ));

    const response = await middleware(new Request("https://www.medicaltourismchina.health/hospitals/hospital-mm4eqlha?locale=en"));

    expect(response?.status).toBe(301);
    expect(response?.headers.get("location")).toBe("https://www.medicaltourismchina.health/hospitals/chongqing-hygeia-hospital?locale=en");
  });

  it("redirects old package paths to the canonical hospital slug", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      jsonResponse({ type: "redirect", toSlug: "chongqing-hygeia-hospital", status: 301 }),
    ));

    const response = await middleware(new Request("https://www.medicaltourismchina.health/hospitals/hospital-mm4eqlha/packages/pkg-a?locale=en"));

    expect(response?.status).toBe(301);
    expect(response?.headers.get("location")).toBe("https://www.medicaltourismchina.health/hospitals/chongqing-hygeia-hospital/packages/pkg-a?locale=en");
  });

  it("passes canonical slugs through", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      jsonResponse({ type: "canonical", slug: "chongqing-hygeia-hospital" }),
    ));

    const response = await middleware(new Request("https://www.medicaltourismchina.health/hospitals/chongqing-hygeia-hospital"));

    expect(response).toBeUndefined();
  });

  it("passes the hospital list route through", async () => {
    vi.stubGlobal("fetch", vi.fn());

    const response = await middleware(new Request("https://www.medicaltourismchina.health/hospitals"));

    expect(response).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("passes supported Arabic public routes through", async () => {
    vi.stubGlobal("fetch", vi.fn());

    const response = await middleware(
      new Request("https://www.medicaltourismchina.health/ar/hospitals"),
    );

    expect(response).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("redirects unsupported Arabic dynamic routes to English", async () => {
    vi.stubGlobal("fetch", vi.fn());

    const response = await middleware(
      new Request(
        "https://www.medicaltourismchina.health/ar/procedures/heart-valve-replacement-repair?ref=search",
      ),
    );

    expect(response?.status).toBe(308);
    expect(response?.headers.get("location")).toBe(
      "https://www.medicaltourismchina.health/procedures/heart-valve-replacement-repair?ref=search",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("passes through when the resolver returns a non-OK response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ error: "unavailable" }, 503)));

    const response = await middleware(new Request("https://www.medicaltourismchina.health/hospitals/hospital-mm4eqlha"));

    expect(response).toBeUndefined();
  });

  it("passes through when the resolver request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const response = await middleware(new Request("https://www.medicaltourismchina.health/hospitals/hospital-mm4eqlha"));

    expect(response).toBeUndefined();
  });
});
