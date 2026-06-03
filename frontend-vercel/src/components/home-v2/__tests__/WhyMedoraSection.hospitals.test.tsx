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
        image: expect.stringContaining('hospital_photos/public/f100fb70-3f9a-49c3-b85f-4efa3d73d696/hero.png'),
      }),
      expect.objectContaining({
        name: 'Chengdu Aidi Eye Hospital',
        image: expect.stringContaining('hospital_photos/public/d4b86613-9459-487b-8b2a-e4b531548436/hero.jpg'),
      }),
      expect.objectContaining({
        name: 'Chongqing Hygeia Hospital',
        image: expect.stringContaining('hospital_photos/public/4f22747e-91d0-47d7-8ae3-f3e818ef962e/hero.jpg'),
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
