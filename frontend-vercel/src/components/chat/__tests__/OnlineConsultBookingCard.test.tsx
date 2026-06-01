import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OnlineConsultBookingCard } from '../blocks/OnlineConsultBookingCard';
import type { OnlineConsultBookingCardBlock } from '../../../types/chatbot-blocks';
import { useLanguage } from '@/contexts/LanguageContext';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

const block: OnlineConsultBookingCardBlock = {
  id: 'block-consult',
  type: 'ONLINE_CONSULT_BOOKING_CARD',
  title: 'Online Consultation',
  description: 'Request a consultation with our medical team.',
  requestedAction: 'INVITE_ONLINE_CONSULT',
  convertPath: '/consult/convert',
  conversionDraft: {
    sessionId: 'session-1',
    name: 'Alice',
    email: 'alice@example.com',
    country: 'China',
    conditionSummary: 'Eye pain and blurred vision',
    budget: 'Flexible',
  },
};

describe('OnlineConsultBookingCard', () => {
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

  it('renders title', () => {
    render(<OnlineConsultBookingCard block={block} />);
    expect(screen.getByText('Online Consultation')).toBeTruthy();
  });

  it('renders description', () => {
    render(<OnlineConsultBookingCard block={block} />);
    expect(screen.getByText('Request a consultation with our medical team.')).toBeTruthy();
  });

  it('surfaces the consultation draft details before submission', () => {
    render(<OnlineConsultBookingCard block={block} />);

    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('alice@example.com')).toBeTruthy();
    expect(screen.getByText('China')).toBeTruthy();
    expect(screen.getByText('Eye pain and blurred vision')).toBeTruthy();
    expect(screen.getByText('Flexible')).toBeTruthy();
  });

  it('renders idle state with submit button', () => {
    render(<OnlineConsultBookingCard block={block} />);
    expect(screen.getByRole('button', { name: /request consultation/i })).toBeTruthy();
  });

  it('after onSubmit resolves, shows submitted state', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<OnlineConsultBookingCard block={block} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /request consultation/i }));
    await waitFor(() => {
      expect(screen.getByText(/request submitted/i)).toBeTruthy();
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(block);
  });

  it('requires the full conversion draft contract for rendering and submission', () => {
    expect(block.requestedAction).toBe('INVITE_ONLINE_CONSULT');
    expect(block.conversionDraft).toEqual(expect.objectContaining({
      sessionId: 'session-1',
      name: 'Alice',
      email: 'alice@example.com',
      country: 'China',
      conditionSummary: 'Eye pain and blurred vision',
      budget: 'Flexible',
    }));
  });

  it('after onSubmit resolves, submit button is no longer shown', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<OnlineConsultBookingCard block={block} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /request consultation/i }));
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /request consultation/i })).toBeNull();
    });
  });

  it('if onSubmit rejects, shows failed state with retry button', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<OnlineConsultBookingCard block={block} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /request consultation/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /try again/i })).toBeTruthy();
    });
  });

  it('clicking retry calls onSubmit again', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'));
    render(<OnlineConsultBookingCard block={block} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /request consultation/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /try again/i })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(2);
    });
  });

  it('stays mounted after successful submit (does not unmount)', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<OnlineConsultBookingCard block={block} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole('button', { name: /request consultation/i }));
    await waitFor(() => {
      expect(screen.getByText(/request submitted/i)).toBeTruthy();
    });
    expect(container.firstChild).toBeTruthy();
  });

  it('works without onSubmit prop (no crash in idle)', () => {
    render(<OnlineConsultBookingCard block={block} />);
    expect(() => fireEvent.click(screen.getByRole('button', { name: /request consultation/i }))).not.toThrow();
  });

  it('localizes the draft shell in Chinese', () => {
    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳',
        apiCode: 'zh',
      },
    } as never);

    render(<OnlineConsultBookingCard block={block} />);

    expect(screen.getByText('咨询草稿')).toBeTruthy();
    expect(screen.getByText('姓名')).toBeTruthy();
    expect(screen.getByText('邮箱')).toBeTruthy();
    expect(screen.getByText('国家/地区')).toBeTruthy();
    expect(screen.getByText('病情')).toBeTruthy();
    expect(screen.getByText('预算')).toBeTruthy();
    expect(screen.getByRole('button', { name: '申请咨询' })).toBeTruthy();
  });
});
