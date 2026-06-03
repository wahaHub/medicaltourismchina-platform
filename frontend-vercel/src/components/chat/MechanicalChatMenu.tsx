import { useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { ClipboardList, FileUp, Handshake, Loader2, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import type { PatientChatActionKey, PatientChatState } from '@/services/api/patient-messages';
import { ProcessModalTrigger } from './blocks/ProcessModalTrigger';
import { QuestionnaireModalTrigger } from './blocks/QuestionnaireModalTrigger';
import { createChatWidgetTranslator } from './chat-widget-i18n';

type MechanicalChatMenuProps = {
  caseId: string | null;
  chatState: PatientChatState;
  processConfirmed?: boolean;
  onActionSelected?: (actionKey: PatientChatActionKey) => Promise<void> | void;
  onProcessConfirmed?: () => Promise<void> | void;
  onProcessDismissed?: () => Promise<void> | void;
  onOpenQuestionnaire?: (templateId: string) => Promise<void> | void;
  onOpenMedicalRecordsUpload?: () => void;
};

const ACTION_ICONS: Record<PatientChatActionKey, ComponentType<{ className?: string }>> = {
  VIEW_PROCESS: Route,
  UPLOAD_RECORDS: FileUp,
  CONTACT_ADVISOR: Handshake,
  OPEN_QUESTIONNAIRE: ClipboardList,
};

function AssistantBubble({ children }: { children: ReactNode }) {
  return (
    <div className="mr-auto max-w-[88%] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
      {children}
    </div>
  );
}

export default function MechanicalChatMenu({
  caseId,
  chatState,
  processConfirmed = false,
  onActionSelected,
  onProcessConfirmed,
  onProcessDismissed,
  onOpenQuestionnaire,
  onOpenMedicalRecordsUpload,
}: MechanicalChatMenuProps) {
  const { currentLanguage } = useLanguage();
  const translate = useMemo(
    () => createChatWidgetTranslator(currentLanguage.code),
    [currentLanguage.code],
  );
  const [pendingAction, setPendingAction] = useState<PatientChatActionKey | null>(null);
  const [activeCard, setActiveCard] = useState<PatientChatActionKey | null>(null);

  const runAction = async (actionKey: PatientChatActionKey) => {
    if (pendingAction) {
      return;
    }

    setPendingAction(actionKey);
    try {
      await onActionSelected?.(actionKey);

      if (actionKey === 'UPLOAD_RECORDS') {
        onOpenMedicalRecordsUpload?.();
        setActiveCard(null);
        return;
      }

      if (actionKey === 'OPEN_QUESTIONNAIRE') {
        await onOpenQuestionnaire?.(caseId ? 'DEFAULT' : '');
        setActiveCard(null);
        return;
      }

      setActiveCard(actionKey);
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="space-y-4" data-testid="mechanical-chat-menu">
      {chatState.availableActions.length > 0 ? (
        <div className="sticky bottom-0 z-10 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_12px_30px_rgba(15,23,42,0.10)] backdrop-blur" data-testid="mechanical-action-bar">
          <div className="grid grid-cols-2 gap-2">
            {chatState.availableActions.map((action) => {
              const Icon = ACTION_ICONS[action.id] ?? Route;
              const isPending = pendingAction === action.id;
              return (
                <Button
                  key={action.id}
                  type="button"
                  variant="outline"
                  onClick={() => void runAction(action.id)}
                  disabled={Boolean(pendingAction)}
                  className="h-auto justify-start gap-2 rounded-xl border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                >
                  {isPending ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <Icon className="h-4 w-4 shrink-0" />}
                  <span className="truncate">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}

      {activeCard === 'VIEW_PROCESS' ? (
        <ProcessModalTrigger
          block={{
            id: 'backend-mechanical-process',
            type: 'PROCESS_MODAL_TRIGGER',
            modalKey: 'MEDICAL_TRAVEL_PROCESS',
            title: translate('chatWidget.mechanical.process.title'),
            description: translate('chatWidget.mechanical.process.description'),
            ctaLabel: translate('chatWidget.mechanical.process.cta'),
          }}
          confirmed={processConfirmed}
          onConfirm={onProcessConfirmed}
          onDismissUnconfirmed={onProcessDismissed}
        />
      ) : null}

      {activeCard === 'CONTACT_ADVISOR' ? (
        <AssistantBubble>{translate('chatWidget.mechanical.post.advisor')}</AssistantBubble>
      ) : null}

      {activeCard === 'OPEN_QUESTIONNAIRE' ? (
        <QuestionnaireModalTrigger
          block={{
            id: 'backend-mechanical-questionnaire',
            type: 'QUESTIONNAIRE_MODAL_TRIGGER',
            templateId: caseId ? 'DEFAULT' : '',
            title: translate('chatWidget.mechanical.questionnaire.title'),
            description: translate('chatWidget.mechanical.questionnaire.description'),
            ctaLabel: translate('chatWidget.mechanical.questionnaire.cta'),
          }}
          onOpen={(templateId) => {
            void onOpenQuestionnaire?.(templateId);
          }}
        />
      ) : null}
    </div>
  );
}
