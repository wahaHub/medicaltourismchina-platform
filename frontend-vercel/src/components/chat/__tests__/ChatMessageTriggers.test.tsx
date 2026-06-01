import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChatMessageBlocks } from '../ChatMessageBlocks';
import { ProcessModalTrigger } from '../blocks/ProcessModalTrigger';
import { QuestionnaireModalTrigger } from '../blocks/QuestionnaireModalTrigger';
import type { ProcessModalTriggerBlock, QuestionnaireModalTriggerBlock } from '../../../types/chatbot-blocks';
import { useLanguage } from '@/contexts/LanguageContext';

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

const processBlock: ProcessModalTriggerBlock = {
  id: 'block-1',
  type: 'PROCESS_MODAL_TRIGGER',
  modalKey: 'MEDICAL_TRAVEL_PROCESS',
  title: 'How the process works',
  description: 'See the overall medical travel journey.',
  ctaLabel: 'Open process guide',
};

const questionnaireBlock: QuestionnaireModalTriggerBlock = {
  id: 'block-2',
  type: 'QUESTIONNAIRE_MODAL_TRIGGER',
  templateId: '11111111-1111-4111-8111-111111111111',
  title: 'Complete your questionnaire',
  description: 'Help us understand your needs.',
  ctaLabel: 'Start questionnaire',
};

function renderProcessModalTrigger(block: ProcessModalTriggerBlock = processBlock) {
  return render(
    <MemoryRouter>
      <ProcessModalTrigger block={block} />
    </MemoryRouter>,
  );
}

describe('ProcessModalTrigger', () => {
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
    renderProcessModalTrigger();
    expect(screen.getByText('How the process works')).toBeTruthy();
  });

  it('renders description', () => {
    renderProcessModalTrigger();
    expect(screen.getByText('See the overall medical travel journey.')).toBeTruthy();
  });

  it('renders ctaLabel on button', () => {
    renderProcessModalTrigger();
    expect(screen.getByRole('button', { name: 'Open process guide' })).toBeTruthy();
  });

  it('clicking the CTA button does not crash', () => {
    renderProcessModalTrigger();
    const btn = screen.getByRole('button', { name: 'Open process guide' });
    expect(() => fireEvent.click(btn)).not.toThrow();
  });

  it('renders default CTA label when ctaLabel is omitted', () => {
    const block: ProcessModalTriggerBlock = { ...processBlock, ctaLabel: undefined };
    renderProcessModalTrigger(block);
    // Should render some button
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('is re-renderable multiple times (re-openable from history)', () => {
    const { unmount } = renderProcessModalTrigger();
    unmount();
    renderProcessModalTrigger();
    expect(screen.getByText('How the process works')).toBeTruthy();
  });

  it('renders the confirm-steps care journey modal content', () => {
    renderProcessModalTrigger();
    fireEvent.click(screen.getByRole('button', { name: 'Open process guide' }));

    expect(screen.getByRole('heading', { name: 'Please confirm your care journey' })).toBeTruthy();
    expect(screen.getByText(/Below are the 6 steps we'll guide you through/)).toBeTruthy();
    expect(screen.getByAltText('Medora Health — Premium Care, Right Fare')).toBeTruthy();
    expect(screen.getByText('Book Your Medical Consultation')).toBeTruthy();
    expect(screen.getByText('$99 – $699')).toBeTruthy();
    expect(screen.getByText('Free / $400 flat')).toBeTruthy();
    expect(screen.getByText('Hospital fees direct')).toBeTruthy();
    expect(screen.getByText(/Hospital fees paid directly — no markups from us/)).toBeTruthy();
    expect(screen.getByText('I have read and understood the 6 steps of my care journey with Medora Health.')).toBeTruthy();
  });

  it('requires agreement before confirming the care journey', () => {
    renderProcessModalTrigger();
    fireEvent.click(screen.getByRole('button', { name: 'Open process guide' }));

    const confirmButton = screen.getByRole('button', { name: 'Confirm & Continue' });
    expect(confirmButton.hasAttribute('disabled')).toBe(true);

    fireEvent.click(screen.getByRole('checkbox'));
    expect(confirmButton.hasAttribute('disabled')).toBe(false);

    fireEvent.click(confirmButton);
    expect(screen.getByRole('button', { name: /Confirmed/ }).hasAttribute('disabled')).toBe(true);
  });

  it('forwards process confirmation through chat message blocks', async () => {
    const onConfirmProcessGuide = vi.fn().mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <ChatMessageBlocks blocks={[processBlock]} onConfirmProcessGuide={onConfirmProcessGuide} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open process guide' }));
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm & Continue' }));

    await waitFor(() => {
      expect(onConfirmProcessGuide).toHaveBeenCalledTimes(1);
    });
  });

  it('closes the process modal from the top close button and Escape key', () => {
    renderProcessModalTrigger();
    fireEvent.click(screen.getByRole('button', { name: 'Open process guide' }));

    fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[0]);
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Open process guide' }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders localized defaults in Chinese when CTA copy is omitted', () => {
    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳',
        apiCode: 'zh',
      },
      t: ((key: string, vars?: Record<string, number>) => {
        if (key === 'journeySteps.step.label') {
          return `第${vars?.n ?? ''}步`;
        }
        const translations: Record<string, string> = {
          'processConfirm.logoAlt': 'Medora Health — 高端医疗，合理价格',
          'processConfirm.title': '请确认您的就医旅程',
          'processConfirm.description': '以下是我们将陪您完成的 6 个步骤。',
          'processConfirm.step1.title': '预约医疗咨询',
          'processConfirm.step1.price': '$99 – $699',
          'processConfirm.step1.desc': '会前病历审阅。',
          'processConfirm.step2.title': '安排行程与签证',
          'processConfirm.step2.price': '免费 / 统一 $400',
          'processConfirm.step2.desc': '合作医院支持。',
          'processConfirm.step3.title': '全程落地支持',
          'processConfirm.step3.price': '已包含',
          'processConfirm.step3.desc': '选择服务套餐。',
          'processConfirm.step4.title': '治疗与康复',
          'processConfirm.step4.price': '医院费用直付',
          'processConfirm.step4.desc': '医院费用直接支付。',
          'processConfirm.step5.title': '探索中国',
          'processConfirm.step5.price': '可选',
          'processConfirm.step5.desc': '对接旅行服务。',
          'processConfirm.step6.title': '治疗后随访',
          'processConfirm.step6.price': '免费',
          'processConfirm.step6.desc': '持续联系。',
          'processConfirm.agreement': '我已阅读并理解 Medora Health 就医旅程的 6 个步骤。',
          'processConfirm.cancel': '取消',
          'processConfirm.confirm': '确认并继续',
          'processConfirm.confirmed': '已确认',
        };
        return translations[key] ?? key;
      }) as never,
    } as never);

    renderProcessModalTrigger({ ...processBlock, ctaLabel: undefined });
    fireEvent.click(screen.getByRole('button', { name: '打开流程指南' }));

    expect(screen.getByRole('heading', { name: '请确认您的就医旅程' })).toBeTruthy();
    expect(screen.getByText('预约医疗咨询')).toBeTruthy();
    expect(screen.getByText('治疗后随访')).toBeTruthy();
    expect(screen.getByRole('button', { name: '确认并继续' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getAllByRole('button', { name: '关闭' }).length).toBeGreaterThan(0);
  });
});

describe('QuestionnaireModalTrigger', () => {
  it('renders title', () => {
    render(<QuestionnaireModalTrigger block={questionnaireBlock} />);
    expect(screen.getByText('Complete your questionnaire')).toBeTruthy();
  });

  it('renders description', () => {
    render(<QuestionnaireModalTrigger block={questionnaireBlock} />);
    expect(screen.getByText('Help us understand your needs.')).toBeTruthy();
  });

  it('renders ctaLabel on button', () => {
    render(<QuestionnaireModalTrigger block={questionnaireBlock} />);
    expect(screen.getByRole('button', { name: 'Start questionnaire' })).toBeTruthy();
  });

  it('clicking the CTA button does not crash', () => {
    render(<QuestionnaireModalTrigger block={questionnaireBlock} />);
    const btn = screen.getByRole('button', { name: 'Start questionnaire' });
    expect(() => fireEvent.click(btn)).not.toThrow();
  });

  it('onOpen callback is called when CTA is clicked', () => {
    const onOpen = vi.fn();
    render(<QuestionnaireModalTrigger block={questionnaireBlock} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start questionnaire' }));
    expect(onOpen).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111');
  });

  it('renders localized default CTA in Chinese', () => {
    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳',
        apiCode: 'zh',
      },
    } as never);

    render(<QuestionnaireModalTrigger block={{ ...questionnaireBlock, ctaLabel: undefined }} />);
    expect(screen.getByRole('button', { name: '开始填写问卷' })).toBeTruthy();
  });
});
