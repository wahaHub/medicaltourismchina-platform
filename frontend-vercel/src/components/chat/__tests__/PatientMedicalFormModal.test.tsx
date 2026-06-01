import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PatientMedicalFormModal from '../PatientMedicalFormModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { usePatientEntry } from '@/hooks/usePatientEntry';
import { patientEntryApi } from '@/services/api/patient-entry';

vi.mock('@/services/api/patient-entry', () => ({
  patientEntryApi: {
    fetchMedicalFormTemplate: vi.fn(),
    fetchMedicalFormTemplateById: vi.fn(),
    getQuestionnaireResponse: vi.fn(),
    submitMedicalFormResponse: vi.fn(),
  },
}));

vi.mock('@/hooks/usePatientAuth', () => ({
  usePatientAuth: vi.fn(),
}));

vi.mock('@/hooks/usePatientEntry', () => ({
  usePatientEntry: vi.fn(),
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

describe('PatientMedicalFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLanguage).mockReturnValue({
      currentLanguage: {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
        apiCode: 'en',
      },
      setLanguage: vi.fn(),
      getApiLocale: () => 'en',
      t: ((key: string) => {
        if (key.includes('uploadFile')) {
          return 'Upload file';
        }
        if (key.includes('maxFilesExceeded')) {
          return 'Too many files';
        }
        if (key.includes('fileTooLarge')) {
          return 'File too large';
        }
        if (key.includes('invalidType')) {
          return 'Invalid file type';
        }
        return key;
      }) as never,
      isLanguageLoading: false,
      detectionMethod: 'default',
    } as never);
    vi.mocked(usePatientAuth).mockReturnValue({
      patient: {
        id: 'patient-1',
      },
    } as never);
    vi.mocked(usePatientEntry).mockReturnValue({
      requestQuestionnaireHistoryRefresh: vi.fn(),
    } as never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the requested questionnaire template by id and submits structured responses inline', async () => {
    const onClose = vi.fn();

    vi.mocked(patientEntryApi.fetchMedicalFormTemplateById).mockResolvedValue({
      id: 'template-cancer',
      templateName: 'Cancer Intake Template',
      category: 'CANCER',
      procedureTypes: [],
      questions: {
        steps: [
          {
            id: 'step-1',
            title: 'Primary details',
            questions: [
              {
                id: 'q1',
                label: 'Main concern',
                type: 'text',
                required: true,
              },
              {
                id: 'q2',
                prompt: 'Symptoms you notice',
                type: 'MULTI_CHOICE_WITH_TEXT',
                required: true,
                options: [
                  { labelEn: 'Pain' },
                  { labelZh: '麻木' },
                ],
              },
            ],
          },
        ],
      },
      translations: {},
      isActive: true,
      createdAt: '2026-04-07T00:00:00.000Z',
      updatedAt: '2026-04-07T00:00:00.000Z',
    } as never);

    vi.mocked(patientEntryApi.submitMedicalFormResponse).mockResolvedValue({ ok: true } as never);

    render(
      <PatientMedicalFormModal
        caseId="case-1"
        templateId="template-cancer"
        isOpen
        onClose={onClose}
      />,
    );

    await waitFor(() => {
      expect(patientEntryApi.fetchMedicalFormTemplateById).toHaveBeenCalledWith('template-cancer', 'case-1');
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/main concern/i)).toBeTruthy();
      expect(screen.getByRole('checkbox', { name: /pain/i })).toBeTruthy();
      expect(screen.getByRole('checkbox', { name: /麻木/i })).toBeTruthy();
    });

    fireEvent.change(screen.getByLabelText(/main concern/i), {
      target: { value: 'Eye pain' },
    });

    fireEvent.click(screen.getByRole('checkbox', { name: /pain/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /麻木/i }));
    fireEvent.change(screen.getByLabelText(/additional details/i), {
      target: { value: 'Numbness comes and goes.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /submit questionnaire/i }));

    await waitFor(() => {
      expect(patientEntryApi.submitMedicalFormResponse).toHaveBeenCalledWith({
        caseId: 'case-1',
        templateId: 'template-cancer',
        responses: {
          q1: 'Eye pain',
          q2: {
            selectedOptions: ['Pain', '麻木'],
            additionalText: 'Numbness comes and goes.',
          },
        },
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('renders file upload controls for file-capable questions when no response has been submitted yet', async () => {
    vi.mocked(patientEntryApi.fetchMedicalFormTemplateById).mockResolvedValue({
      id: 'template-lung',
      templateName: 'Lung Intake Template',
      category: 'LUNG',
      procedureTypes: [],
      questions: {
        steps: [
          {
            id: 'step-1',
            title: 'Examinations',
            questions: [
              {
                id: 'q1',
                label: 'Describe your MRI findings',
                type: 'TEXT_WITH_FILE',
                required: true,
              },
              {
                id: 'q2',
                label: 'Which imaging do you have?',
                type: 'MULTI_CHOICE_WITH_FILE',
                required: true,
                options: [
                  { label: 'MRI', value: 'MRI' },
                  { label: 'CT', value: 'CT' },
                ],
              },
            ],
          },
        ],
      },
      translations: {},
      isActive: true,
      createdAt: '2026-04-07T00:00:00.000Z',
      updatedAt: '2026-04-07T00:00:00.000Z',
    } as never);
    vi.mocked(patientEntryApi.getQuestionnaireResponse).mockResolvedValue({ response: null } as never);

    render(
      <PatientMedicalFormModal
        caseId="case-1"
        templateId="template-lung"
        isOpen
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(patientEntryApi.fetchMedicalFormTemplateById).toHaveBeenCalledWith('template-lung', 'case-1');
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/describe your mri findings/i)).toBeTruthy();
      expect(screen.getAllByRole('button', { name: /upload file/i }).length).toBeGreaterThanOrEqual(2);
    });
  });

  it('loads a submitted questionnaire response and renders it read-only', async () => {
    vi.mocked(patientEntryApi.fetchMedicalFormTemplateById).mockResolvedValue({
      id: 'template-cancer',
      templateName: 'Cancer Intake Template',
      category: 'CANCER',
      procedureTypes: [],
      questions: {
        steps: [
          {
            id: 'step-1',
            title: 'Primary details',
            questions: [
              {
                id: 'q1',
                label: 'Main concern',
                type: 'TEXT_WITH_FILE',
                required: true,
              },
              {
                id: 'q2',
                label: 'Symptoms you notice',
                type: 'MULTI_CHOICE_WITH_FILE',
                required: true,
                options: [
                  { label: 'Pain', value: 'Pain' },
                  { label: '麻木', value: 'Numbness' },
                ],
              },
            ],
          },
        ],
      },
      translations: {},
      isActive: true,
      createdAt: '2026-04-07T00:00:00.000Z',
      updatedAt: '2026-04-07T00:00:00.000Z',
    } as never);
    vi.mocked(patientEntryApi.getQuestionnaireResponse).mockResolvedValue({
      response: {
        id: 'response-1',
        caseId: 'case-1',
        templateId: 'template-cancer',
        userId: 'patient-1',
        responses: {
          q1: {
            text: 'MRI report attached',
            files: [
              {
                id: 'file-1',
                name: 'mri-report.png',
                size: 1024,
                type: 'image/png',
                category: 'exam',
                uploadedAt: '2026-04-07T00:00:00.000Z',
                url: 'https://signed.example.com/mri-report.png',
              },
            ],
          },
          q2: {
            selectedOptions: ['Pain'],
            files: [],
          },
        },
        extractedData: null,
        riskFlags: [],
        completionStatus: 'COMPLETED',
        translations: {},
        submittedAt: '2026-04-07T00:00:00.000Z',
        createdAt: '2026-04-07T00:00:00.000Z',
        updatedAt: '2026-04-07T00:00:00.000Z',
      },
    } as never);

    render(
      <PatientMedicalFormModal
        caseId="case-1"
        templateId="template-cancer"
        isOpen
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Cancer Medical Intake Form')).toBeTruthy();
    });

    expect(screen.getByText('Cancer Medical Intake Form')).toBeTruthy();
    expect(screen.getByText('MRI report attached')).toBeTruthy();
    expect(screen.getByText('mri-report.png')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /submit questionnaire/i })).toBeNull();
  });

  it('uses the submitted response template as authoritative when it differs from the requested template', async () => {
    vi.mocked(patientEntryApi.fetchMedicalFormTemplateById).mockResolvedValue({
      id: 'template-other',
      templateName: 'Legacy Intake Template',
      category: 'LEGACY',
      procedureTypes: [],
      questions: {
        steps: [
          {
            id: 'step-1',
            questions: [
              {
                id: 'q1',
                label: 'Legacy question',
                type: 'text',
                required: true,
              },
            ],
          },
        ],
      },
      translations: {},
      isActive: true,
      createdAt: '2026-04-07T00:00:00.000Z',
      updatedAt: '2026-04-07T00:00:00.000Z',
    } as never);
    vi.mocked(patientEntryApi.getQuestionnaireResponse).mockResolvedValue({
      response: {
        id: 'response-1',
        caseId: 'case-1',
        templateId: 'template-other',
        responses: { q1: 'Old answer' },
        completionStatus: 'COMPLETED',
        submittedAt: '2026-04-07T00:00:00.000Z',
        createdAt: '2026-04-07T00:00:00.000Z',
        updatedAt: '2026-04-07T00:00:00.000Z',
      },
    } as never);

    render(
      <PatientMedicalFormModal
        caseId="case-1"
        templateId="template-cancer"
        isOpen
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(patientEntryApi.fetchMedicalFormTemplateById).toHaveBeenCalledWith('template-other', 'case-1');
    });

    expect(screen.getByText('Legacy Medical Intake Form')).toBeTruthy();
    expect(screen.getByText('Old answer')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /submit questionnaire/i })).toBeNull();
  });

  it('disables persistent file upload when patient session has not finished loading', async () => {
    vi.mocked(usePatientAuth).mockReturnValue({
      patient: null,
    } as never);
    vi.mocked(patientEntryApi.fetchMedicalFormTemplateById).mockResolvedValue({
      id: 'template-lung',
      templateName: 'Lung Intake Template',
      category: 'LUNG',
      procedureTypes: [],
      questions: {
        steps: [
          {
            id: 'step-1',
            questions: [
              {
                id: 'q1',
                label: 'Describe your MRI findings',
                type: 'TEXT_WITH_FILE',
                required: true,
              },
            ],
          },
        ],
      },
      translations: {},
      isActive: true,
      createdAt: '2026-04-07T00:00:00.000Z',
      updatedAt: '2026-04-07T00:00:00.000Z',
    } as never);
    vi.mocked(patientEntryApi.getQuestionnaireResponse).mockResolvedValue({ response: null } as never);

    render(
      <PatientMedicalFormModal
        caseId="case-1"
        templateId="template-lung"
        isOpen
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/describe your mri findings/i)).toBeTruthy();
    });

    expect(screen.getByRole('button', { name: /upload file/i }).hasAttribute('disabled')).toBe(true);
  });

  it('renders the modal above the chat widget with a stronger z-index', async () => {
    vi.mocked(patientEntryApi.fetchMedicalFormTemplate).mockResolvedValue({
      id: 'template-default',
      templateName: 'Cancer intake template',
      category: 'cancer',
      procedureTypes: [],
      questions: {
        steps: [
          {
            id: 'step-1',
            questions: [
              {
                id: 'q1',
                label: 'Main concern',
                type: 'text',
                required: true,
              },
            ],
          },
        ],
      },
      translations: {},
      isActive: true,
      createdAt: '2026-04-07T00:00:00.000Z',
      updatedAt: '2026-04-07T00:00:00.000Z',
    } as never);

    render(
      <PatientMedicalFormModal
        caseId="case-1"
        isOpen
        onClose={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Cancer Medical Intake Form')).toBeTruthy();
    });

    const modal = screen.getByTestId('patient-medical-form-modal');
    expect(modal.className).toContain('z-[10050]');
  });

  it('refreshes the widget history after questionnaire submission', async () => {
    const requestQuestionnaireHistoryRefresh = vi.fn();
    vi.mocked(usePatientEntry).mockReturnValue({
      requestQuestionnaireHistoryRefresh,
    } as never);
    vi.mocked(patientEntryApi.fetchMedicalFormTemplateById).mockResolvedValue({
      id: 'template-cancer',
      templateName: 'Cancer Intake Template',
      category: 'CANCER',
      procedureTypes: [],
      questions: {
        steps: [
          {
            id: 'step-1',
            questions: [
              {
                id: 'q1',
                label: 'Main concern',
                type: 'text',
                required: true,
              },
            ],
          },
        ],
      },
      translations: {},
      isActive: true,
      createdAt: '2026-04-07T00:00:00.000Z',
      updatedAt: '2026-04-07T00:00:00.000Z',
    } as never);
    vi.mocked(patientEntryApi.getQuestionnaireResponse).mockResolvedValue({ response: null } as never);
    vi.mocked(patientEntryApi.submitMedicalFormResponse).mockResolvedValue({ ok: true } as never);
    const onClose = vi.fn();

    render(
      <PatientMedicalFormModal
        caseId="case-1"
        templateId="template-cancer"
        isOpen
        onClose={onClose}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/main concern/i)).toBeTruthy();
    });
    fireEvent.change(screen.getByLabelText(/main concern/i), {
      target: { value: 'Eye pain' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit questionnaire/i }));

    await waitFor(() => {
      expect(patientEntryApi.submitMedicalFormResponse).toHaveBeenCalledTimes(1);
      expect(requestQuestionnaireHistoryRefresh).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
