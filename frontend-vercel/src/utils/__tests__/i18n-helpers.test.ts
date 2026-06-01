import { describe, expect, it } from 'vitest';
import { getSurgeonBio } from '../i18n-helpers';

describe('getSurgeonBio', () => {
  it('reads flat translated surgeon bio fields before falling back to original chinese bio', () => {
    const surgeon = {
      bio: {
        intro: '中文介绍',
        expertise: '中文专长',
        philosophy: '中文理念',
        achievements: '中文成就',
      },
      translations: {
        en: {
          intro: 'English intro',
          expertise: 'English expertise',
          philosophy: 'English philosophy',
          achievements: 'English achievements',
        },
      },
    } as any;

    expect(getSurgeonBio(surgeon, 'en', 'intro')).toBe('English intro');
    expect(getSurgeonBio(surgeon, 'en', 'expertise')).toBe('English expertise');
    expect(getSurgeonBio(surgeon, 'en', 'philosophy')).toBe('English philosophy');
    expect(getSurgeonBio(surgeon, 'en', 'achievements')).toBe('English achievements');
  });
});
