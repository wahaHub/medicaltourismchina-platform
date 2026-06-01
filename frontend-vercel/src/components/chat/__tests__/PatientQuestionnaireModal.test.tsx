import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PatientQuestionnaireModal } from '../PatientQuestionnaireModal';
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

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: vi.fn(),
}));

vi.mock('@/hooks/usePatientAuth', () => ({
  usePatientAuth: vi.fn(),
}));

vi.mock('@/hooks/usePatientEntry', () => ({
  usePatientEntry: vi.fn(),
}));

describe('PatientQuestionnaireModal', () => {
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

  it('loads the requested questionnaire template by templateId and submits responses inline', async () => {
    const onClose = vi.fn();
    vi.mocked(patientEntryApi.fetchMedicalFormTemplateById).mockResolvedValue({
      id: 'template-1',
      templateName: 'Cancer Intake Template',
      category: 'cancer',
      procedureTypes: [],
      questions: {
        steps: [
          {
            id: 'step-1',
            title: 'Symptoms',
            questions: [
              {
                id: 'q-1',
                label: 'What is your main concern?',
                type: 'text',
                required: true,
              },
              {
                id: 'q-2',
                label: 'Preferred timing',
                type: 'select',
                required: false,
                options: ['Soon', 'Flexible'],
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
      <PatientQuestionnaireModal
        caseId="case-1"
        templateId="template-1"
        isOpen
        onClose={onClose}
      />,
    );

    await waitFor(() => {
      expect(patientEntryApi.fetchMedicalFormTemplateById).toHaveBeenCalledWith('template-1', 'case-1');
    });
    expect(patientEntryApi.fetchMedicalFormTemplate).not.toHaveBeenCalled();
    expect(screen.getByText('Cancer Medical Intake Form')).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/what is your main concern/i), {
      target: { value: 'Eye pain' },
    });
    fireEvent.change(screen.getByLabelText(/preferred timing/i), {
      target: { value: 'Flexible' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit questionnaire/i }));

    await waitFor(() => {
      expect(patientEntryApi.submitMedicalFormResponse).toHaveBeenCalledWith({
        caseId: 'case-1',
        templateId: 'template-1',
        responses: {
          'q-1': 'Eye pain',
          'q-2': 'Flexible',
        },
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
