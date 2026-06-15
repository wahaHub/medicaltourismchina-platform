const COUNTRY_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country-code",
  "x-geo-country",
];

function getHeaderValue(headers: unknown, name: string): string {
  if (!headers || typeof headers !== "object") return "";

  const maybeHeaders = headers as {
    get?: (headerName: string) => string | null | undefined;
    [key: string]: unknown;
  };

  if (typeof maybeHeaders.get === "function") {
    return maybeHeaders.get(name) || "";
  }

  const directValue = maybeHeaders[name];
  if (Array.isArray(directValue)) return directValue[0] || "";
  if (typeof directValue === "string") return directValue;

  return "";
}

function resolveCountryCode(headers: unknown): string {
  for (const header of COUNTRY_HEADERS) {
    const country = getHeaderValue(headers, header).trim().toUpperCase();
    if (country && country !== "XX") return country;
  }

  return "";
}

export default function handler(request: { headers?: unknown }, response: {
  setHeader: (name: string, value: string) => void;
  status: (statusCode: number) => { json: (body: unknown) => void };
}) {
  const country = resolveCountryCode(request.headers);

  response.setHeader("Cache-Control", "private, no-store");
  response.status(200).json({
    country,
    isBangladesh: country === "BD",
  });
}
