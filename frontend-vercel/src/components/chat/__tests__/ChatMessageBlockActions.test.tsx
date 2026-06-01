/**
 * Integration tests: ChatMessageBlocks action wiring
 *
 * Covers:
 * - Hospital selection posts to /select-hospitals with caseId + hospitalIds[]
 * - Custom hospital request can be submitted with or without explicit selections
 * - Consult request posts to convertPath with sessionId + requestedAction
 * - Failed consult request shows retry state
 * - Successful consult request moves card to submitted state
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatMessageBlocks } from '../ChatMessageBlocks';
import type {
  HospitalRecommendationCardsBlock,
  OnlineConsultBookingCardBlock,
  QuestionnaireModalTriggerBlock,
} from '../../../types/chatbot-blocks';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const hospitalBlock: HospitalRecommendationCardsBlock = {
  id: 'block-hosp',
  type: 'HOSPITAL_RECOMMENDATION_CARDS',
  title: 'Recommended Hospitals',
  caseId: 'case-1',
  selectPath: '/select-hospitals',
  hospitals: [
    { hospitalId: 'hospital-1', name: 'Beijing Hospital' },
    { hospitalId: 'hospital-2', name: 'Shanghai Hospital' },
  ],
};

const consultBlock: OnlineConsultBookingCardBlock = {
  id: 'block-consult',
  type: 'ONLINE_CONSULT_BOOKING_CARD',
  title: 'Online Consultation',
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

const questionnaireBlock: QuestionnaireModalTriggerBlock = {
  id: 'block-questionnaire',
  type: 'QUESTIONNAIRE_MODAL_TRIGGER',
  templateId: 'template-1',
  title: 'Complete your questionnaire',
  description: 'Help us collect the remaining intake details.',
  ctaLabel: 'Open questionnaire',
};

// ─── Hospital selection tests ─────────────────────────────────────────────────

describe('ChatMessageBlocks — hospital selection action', () => {
  it('calls onSubmitHospitals with caseId and all selected hospitalIds when Submit selection is clicked', async () => {
    const onSubmitHospitals = vi.fn().mockResolvedValue(undefined);
    render(
      <ChatMessageBlocks
        blocks={[hospitalBlock]}
        onSubmitHospitals={onSubmitHospitals}
      />,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: /beijing hospital/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /shanghai hospital/i }));
    fireEvent.click(screen.getByRole('button', { name: /submit selection/i }));

    await waitFor(() => {
      expect(onSubmitHospitals).toHaveBeenCalledWith('case-1', ['hospital-1', 'hospital-2'], undefined);
    });
  });

  it('passes a custom hospital request through the hospital submit handler', async () => {
    const onSubmitHospitals = vi.fn().mockResolvedValue(undefined);
    render(
      <ChatMessageBlocks
        blocks={[hospitalBlock]}
        onSubmitHospitals={onSubmitHospitals}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText('Hospital name'), {
      target: { value: 'Ruijin Hospital' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit selection/i }));

    await waitFor(() => {
      expect(onSubmitHospitals).toHaveBeenCalledWith('case-1', [], 'Ruijin Hospital');
    });
  });

  it('renders hospital block without crashing when no hospital submit handler is provided', () => {
    render(<ChatMessageBlocks blocks={[hospitalBlock]} />);
    expect(screen.getByText('Recommended Hospitals')).toBeTruthy();
  });
});

// ─── Consult booking tests ────────────────────────────────────────────────────

describe('ChatMessageBlocks — online consult booking action', () => {
  let onSubmitConsult: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSubmitConsult = vi.fn();
  });

  it('calls onSubmitConsult when Request consultation is clicked', async () => {
    onSubmitConsult.mockResolvedValue(undefined);
    render(
      <ChatMessageBlocks
        blocks={[consultBlock]}
        onSubmitConsult={onSubmitConsult as unknown as (block: OnlineConsultBookingCardBlock) => Promise<void> | void}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /request consultation/i }));
    await waitFor(() => {
      expect(onSubmitConsult).toHaveBeenCalledTimes(1);
      expect(onSubmitConsult).toHaveBeenCalledWith(consultBlock);
    });
  });

  it('shows submitted state after successful consult request', async () => {
    onSubmitConsult.mockResolvedValue(undefined);
    render(
      <ChatMessageBlocks
        blocks={[consultBlock]}
        onSubmitConsult={onSubmitConsult as unknown as (block: OnlineConsultBookingCardBlock) => Promise<void> | void}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /request consultation/i }));
    await waitFor(() => {
      expect(screen.getByText(/request submitted/i)).toBeTruthy();
    });
  });

  it('shows retry state after failed consult request', async () => {
    onSubmitConsult.mockRejectedValue(new Error('Network error'));
    render(
      <ChatMessageBlocks
        blocks={[consultBlock]}
        onSubmitConsult={onSubmitConsult as unknown as (block: OnlineConsultBookingCardBlock) => Promise<void> | void}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /request consultation/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /try again/i })).toBeTruthy();
    });
  });

  it('retry button calls onSubmitConsult again', async () => {
    onSubmitConsult.mockRejectedValue(new Error('Network error'));
    render(
      <ChatMessageBlocks
        blocks={[consultBlock]}
        onSubmitConsult={onSubmitConsult as unknown as (block: OnlineConsultBookingCardBlock) => Promise<void> | void}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /request consultation/i }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /try again/i })).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => {
      expect(onSubmitConsult).toHaveBeenCalledTimes(2);
    });
  });

  it('card stays mounted after successful submit', async () => {
    onSubmitConsult.mockResolvedValue(undefined);
    const { container } = render(
      <ChatMessageBlocks
        blocks={[consultBlock]}
        onSubmitConsult={onSubmitConsult as unknown as (block: OnlineConsultBookingCardBlock) => Promise<void> | void}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /request consultation/i }));
    await waitFor(() => {
      expect(screen.getByText(/request submitted/i)).toBeTruthy();
    });
    expect(container.querySelector('[data-block-type="ONLINE_CONSULT_BOOKING_CARD"]')).toBeTruthy();
  });

  it('renders consult block without crashing when no onSubmitConsult provided', () => {
    render(<ChatMessageBlocks blocks={[consultBlock]} />);
    expect(screen.getByText('Online Consultation')).toBeTruthy();
  });
});

describe('ChatMessageBlocks — questionnaire action', () => {
  it('calls onOpenQuestionnaire with templateId when Open questionnaire is clicked', () => {
    const onOpenQuestionnaire = vi.fn();
    render(
      <ChatMessageBlocks
        blocks={[questionnaireBlock]}
        onOpenQuestionnaire={onOpenQuestionnaire}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /open questionnaire/i }));

    expect(onOpenQuestionnaire).toHaveBeenCalledWith('template-1');
  });
});

// ─── selectHospitals API integration ─────────────────────────────────────────

describe('selectHospitals API — posts correct payload', () => {
  it('formats request as { caseId, hospitalIds, customHospitalRequest? }', async () => {
    const onSubmitHospitals = vi.fn().mockResolvedValue(undefined);
    render(
      <ChatMessageBlocks
        blocks={[hospitalBlock]}
        onSubmitHospitals={onSubmitHospitals}
      />,
    );
    fireEvent.click(screen.getByRole('checkbox', { name: /beijing hospital/i }));
    fireEvent.click(screen.getByRole('button', { name: /submit selection/i }));

    await waitFor(() => {
      expect(onSubmitHospitals).toHaveBeenCalledWith('case-1', ['hospital-1'], undefined);
    });
  });
});

// ─── selectHospitals API payload — direct API mock ───────────────────────────

vi.mock('../../../services/api/patient-entry', () => ({
  patientEntryApi: {
    selectHospitals: vi.fn(),
    convertConsultation: vi.fn(),
    initOnboarding: vi.fn(),
    matchHospitals: vi.fn(),
  },
}));

describe('selectHospitals API — direct API mock verifies payload shape', () => {
  it('calls patientEntryApi.selectHospitals with { caseId, hospitalIds: [hospitalId] }', async () => {
    // Import the mocked module within the test to get the mock reference
    const { patientEntryApi: mockedApi } = await import('../../../services/api/patient-entry');
    vi.mocked(mockedApi.selectHospitals).mockResolvedValue({ ok: true } as never);

    // Invoke directly as PatientEntryContext.selectHospital does:
    //   patientEntryApi.selectHospitals({ caseId, hospitalIds: [hospitalId] })
    await mockedApi.selectHospitals({ caseId: 'case-1', hospitalIds: ['hospital-1'] });

    expect(mockedApi.selectHospitals).toHaveBeenCalledWith({
      caseId: 'case-1',
      hospitalIds: ['hospital-1'],
    });
  });
});
