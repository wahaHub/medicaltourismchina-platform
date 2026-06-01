import { describe, expect, it } from 'vitest';

import { addFailedPhotoUrl, getValidHospitalPhotoUrls } from '../hospital-photo-state';

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
});
