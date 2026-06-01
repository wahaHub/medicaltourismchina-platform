import PatientMedicalFormModal from './PatientMedicalFormModal';

interface PatientQuestionnaireModalProps {
  caseId: string;
  templateId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientQuestionnaireModal({
  caseId,
  templateId,
  isOpen,
  onClose,
}: PatientQuestionnaireModalProps) {
  return (
    <PatientMedicalFormModal
      caseId={caseId}
      templateId={templateId}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}

export default PatientQuestionnaireModal;
