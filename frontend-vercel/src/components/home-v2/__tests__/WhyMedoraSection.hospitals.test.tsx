import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { getSelectedHomepageHospitals } from '../WhyMedoraSection';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => key,
    currentLanguage: { code: 'en' },
  }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/components/ProgressiveImage', () => ({
  default: ({ alt = '' }: { alt?: string }) => <img alt={alt} />,
}));

vi.mock('@/i18n/doctorNames', () => ({
  getDoctorProfile: (id: string) => ({
    name: `Doctor ${id}`,
    title: 'Chief Physician',
  }),
}));

import WhyMedoraSection from '../WhyMedoraSection';

describe('WhyMedoraSection homepage hospitals', () => {
  it('starts with the first private hospitals from the hospitals listing', () => {
    const hospitals = getSelectedHomepageHospitals('en');

    expect(hospitals.slice(0, 3)).toEqual([
      expect.objectContaining({
        name: 'Guangzhou Concord Cancer Center',
        image: expect.stringContaining('/low/root_assets/surgery_placeholder_x2.png'),
      }),
      expect.objectContaining({
        name: 'Chengdu Aidi Eye Hospital',
        image: expect.stringContaining('/low/root_assets/surgery_placeholder_x2.png'),
      }),
      expect.objectContaining({
        name: 'Chongqing Hygeia Hospital',
        image: expect.stringContaining('/low/root_assets/surgery_placeholder_x2.png'),
      }),
    ]);
  });

  it('keeps the hospital cards in the original image-and-name style', () => {
    render(<WhyMedoraSection />);

    expect(screen.queryByText(/private oncology hospital with international-style cancer care/i)).toBeNull();
    expect(screen.queryByText(/tertiary eye specialty hospital focused on vision correction and cataract care/i)).toBeNull();
    expect(screen.queryByText(/large private tertiary hospital with oncology-led multidisciplinary treatment/i)).toBeNull();
  });
});
