import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HospitalRecommendationCards } from '../blocks/HospitalRecommendationCards';
import type { HospitalRecommendationCardsBlock } from '../../../types/chatbot-blocks';
import { useLanguage } from '@/contexts/LanguageContext';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

const block: HospitalRecommendationCardsBlock = {
  id: 'block-rec',
  type: 'HOSPITAL_RECOMMENDATION_CARDS',
  title: 'Recommended Hospitals',
  description: 'Based on your current information...',
  caseId: 'case-123',
  selectPath: '/select-hospitals',
  hospitals: [
    {
      hospitalId: 'h1',
      name: 'Beijing Union Medical Center',
      city: 'Beijing',
      reason: 'Top rated orthopedic department',
      summary: 'International patient desk and fast diagnostics.',
      thumbnailUrl: 'https://example.com/h1-primary.jpg',
      thumbnailFallbackUrls: ['https://example.com/h1-fallback.jpg'],
      slug: 'beijing-union-medical-center',
    },
    {
      hospitalId: 'h2',
      name: 'Shanghai Zhongshan Hospital',
      city: 'Shanghai',
      reason: 'Excellent cardiac care',
      summary: 'Strong follow-up coordination for overseas patients.',
    },
  ],
};

describe('HospitalRecommendationCards', () => {
  beforeEach(() => {
    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
        apiCode: 'en',
      },
    } as never);
  });

  it('renders the block title', () => {
    render(<HospitalRecommendationCards block={block} />);
    expect(screen.getByText('Recommended Hospitals')).toBeTruthy();
  });

  it('renders the block description', () => {
    render(<HospitalRecommendationCards block={block} />);
    expect(screen.getByText('Based on your current information...')).toBeTruthy();
  });

  it('renders hospital names', () => {
    render(<HospitalRecommendationCards block={block} />);
    expect(screen.getByText('Beijing Union Medical Center')).toBeTruthy();
    expect(screen.getByText('Shanghai Zhongshan Hospital')).toBeTruthy();
  });

  it('renders hospital cities', () => {
    render(<HospitalRecommendationCards block={block} />);
    // city text appears as a span; use getAllByText to handle multiple matches
    expect(screen.getAllByText(/Beijing/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Shanghai/).length).toBeGreaterThan(0);
  });

  it('renders hospital summaries', () => {
    render(<HospitalRecommendationCards block={block} />);
    expect(screen.getByText('International patient desk and fast diagnostics.')).toBeTruthy();
    expect(screen.getByText('Strong follow-up coordination for overseas patients.')).toBeTruthy();
  });

  it('shows a friendly placeholder when a hospital thumbnail is missing', () => {
    const blockWithoutThumbnail: HospitalRecommendationCardsBlock = {
      ...block,
      hospitals: [
        {
          hospitalId: 'h1',
          name: 'Beijing Union Medical Center',
          city: 'Beijing',
          reason: 'Top rated orthopedic department',
        },
      ],
    };

    render(<HospitalRecommendationCards block={blockWithoutThumbnail} />);

    expect(screen.getByText('Hospital')).toBeTruthy();
  });

  it('allows selecting multiple hospitals and submits them together', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<HospitalRecommendationCards block={block} onSubmitSelection={onSubmit} />);

    fireEvent.click(screen.getByRole('checkbox', { name: /beijing union medical center/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /shanghai zhongshan hospital/i }));
    fireEvent.click(screen.getByRole('button', { name: /submit selection/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(['h1', 'h2'], undefined);
    });
  });

  it('supports a custom hospital request and submits it alongside selections', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<HospitalRecommendationCards block={block} onSubmitSelection={onSubmit} />);

    fireEvent.change(screen.getByPlaceholderText('Hospital name'), {
      target: { value: 'Ruijin Hospital' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit selection/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith([], 'Ruijin Hospital');
    });
  });

  it('renders gracefully when hospitals array is empty', () => {
    const emptyBlock: HospitalRecommendationCardsBlock = { ...block, hospitals: [] };
    render(<HospitalRecommendationCards block={emptyBlock} />);
    expect(screen.getByText('Recommended Hospitals')).toBeTruthy();
  });

  it('does not crash when no submit handler is provided', () => {
    render(<HospitalRecommendationCards block={block} />);
    expect(() => fireEvent.click(screen.getByRole('checkbox', { name: /beijing union medical center/i }))).not.toThrow();
  });

  it('tries fallback thumbnail urls before showing the placeholder', async () => {
    const blockWithCta: HospitalRecommendationCardsBlock = {
      ...block,
      hospitals: [
        {
          ...block.hospitals[0]!,
          thumbnailUrl: 'https://example.com/missing.jpg',
          thumbnailFallbackUrls: ['https://example.com/works.jpg'],
        },
        ...block.hospitals.slice(1),
      ],
    };

    render(<HospitalRecommendationCards block={blockWithCta} />);
    const image = screen.getByAltText('Beijing Union Medical Center') as HTMLImageElement;
    fireEvent.error(image);

    await waitFor(() => {
      expect((screen.getByAltText('Beijing Union Medical Center') as HTMLImageElement).getAttribute('src')).toBe('https://example.com/works.jpg');
    });
  });

  it('localizes helper copy in Chinese', () => {
    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳',
        apiCode: 'zh',
      },
    } as never);

    render(<HospitalRecommendationCards block={block} />);

    expect(screen.getByText('没看到您想要的医院？请输入医院名称，我们会把它加入您的申请。')).toBeTruthy();
    expect(screen.getByPlaceholderText('医院名称')).toBeTruthy();
    expect(screen.getByRole('button', { name: '提交选择' })).toBeTruthy();
  });
});
