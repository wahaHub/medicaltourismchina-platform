const PUBLIC_MEDIA_BASE_URL = (
  import.meta.env.VITE_PUBLIC_MEDIA_BASE_URL
  || 'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev'
).replace(/\/+$/, '');

export const BRAND_LOGO_URL = `${PUBLIC_MEDIA_BASE_URL}/low/Medora%20Health-logo/logo-1_x1.png`;
export const BRAND_LOGO_COMPACT_URL = `${PUBLIC_MEDIA_BASE_URL}/low/Medora%20Health-logo/logo_x1.png`;
