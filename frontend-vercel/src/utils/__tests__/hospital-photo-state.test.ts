import { describe, expect, it } from 'vitest';

import {
  addFailedPhotoUrl,
  getHospitalProgressiveBaseUrl,
  getValidHospitalPhotoUrls,
} from '../hospital-photo-state';

describe('hospital photo state helpers', () => {
  it('filters failed photo urls out of the display list', () => {
    const allUrls = [
      'https://cdn.example.com/1.png',
      'https://cdn.example.com/2.png',
      'https://cdn.example.com/3.png',
      'https://cdn.example.com/4.png',
      'https://cdn.example.com/5.png',
    ];

    const failedUrls = addFailedPhotoUrl(new Set<string>(), 'https://cdn.example.com/5.png');

    expect(getValidHospitalPhotoUrls(allUrls, failedUrls)).toEqual([
      'https://cdn.example.com/1.png',
      'https://cdn.example.com/2.png',
      'https://cdn.example.com/3.png',
      'https://cdn.example.com/4.png',
    ]);
  });

  it('keeps failed photo tracking idempotent when the same url fails twice', () => {
    const once = addFailedPhotoUrl(new Set<string>(), 'https://cdn.example.com/5.png');
    const twice = addFailedPhotoUrl(once, 'https://cdn.example.com/5.png');

    expect(Array.from(twice)).toEqual(['https://cdn.example.com/5.png']);
  });

  it('derives a progressive base from R2 hospital photo urls', () => {
    expect(
      getHospitalProgressiveBaseUrl(
        'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/public/hospital-123_1.png',
      ),
    ).toBe(
      'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/public/hospital-123_1',
    );
  });

  it('does not derive a progressive base when the url is already a resolution asset', () => {
    expect(
      getHospitalProgressiveBaseUrl(
        'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/hospitals/header_img_x2.png',
      ),
    ).toBeNull();
  });

  it('ignores non-hospital media urls for hospital progressive loading', () => {
    expect(
      getHospitalProgressiveBaseUrl(
        'https://pub-364cedbcf5a84cd38214f731bce112c0.r2.dev/low/treatment/proton-carbon-ion-therapy_x2.png',
      ),
    ).toBeNull();
  });
});
