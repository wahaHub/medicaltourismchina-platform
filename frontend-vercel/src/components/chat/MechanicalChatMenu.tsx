import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { CheckCircle2, ClipboardList, FileUp, Handshake, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProcessModalTrigger } from './blocks/ProcessModalTrigger';
import { QuestionnaireModalTrigger } from './blocks/QuestionnaireModalTrigger';
import { createChatWidgetTranslator, type ChatWidgetTranslate } from './chat-widget-i18n';

type MechanicalActionKey =
  | 'PROCESS_GUIDE'
  | 'MEDICAL_RECORDS'
  | 'ADVISOR_HANDOFF'
  | 'QUESTIONNAIRE';

type MechanicalTurnStatus = 'selected' | 'completed' | 'unconfirmed';

type MechanicalTurn = {
  id: string;
  actionKey: MechanicalActionKey;
  status: MechanicalTurnStatus;
  requiresProcessFirst: boolean;
  processConfirmed: boolean;
  repeat: boolean;
  questionnaireRefreshNonce?: number;
};

type MechanicalChatMenuProps = {
  caseId: string | null;
  processConfirmed?: boolean;
  questionnaireHistoryRefreshNonce?: number;
  medicalRecordsUploadCompletionNonce?: number;
  onConfirmProcessGuide?: () => Promise<void> | void;
  onOpenQuestionnaire?: (templateId: string) => Promise<void> | void;
  onOpenMedicalRecordsUpload?: () => void;
};

function createTurnId(actionKey: MechanicalActionKey): string {
  return `mechanical:${actionKey}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}

function requiresProcess(actionKey: MechanicalActionKey): boolean {
  return actionKey === 'MEDICAL_RECORDS'
    || actionKey === 'ADVISOR_HANDOFF'
    || actionKey === 'QUESTIONNAIRE';
}

function getPreMessage(actionKey: MechanicalActionKey, input: {
  processConfirmed: boolean;
  repeat: boolean;
  translate: ChatWidgetTranslate;
}): string {
  if (!input.processConfirmed && requiresProcess(actionKey)) {
    switch (actionKey) {
      case 'MEDICAL_RECORDS':
        return input.translate('chatWidget.mechanical.requiresProcess.medicalRecords');
      case 'ADVISOR_HANDOFF':
        return input.translate('chatWidget.mechanical.requiresProcess.advisor');
      case 'QUESTIONNAIRE':
        return input.translate('chatWidget.mechanical.requiresProcess.questionnaire');
      default:
        break;
    }
  }

  switch (actionKey) {
    case 'PROCESS_GUIDE':
      return input.translate('chatWidget.mechanical.pre.process');
    case 'MEDICAL_RECORDS':
      return input.translate('chatWidget.mechanical.pre.medicalRecords');
    case 'ADVISOR_HANDOFF':
      return input.translate('chatWidget.mechanical.pre.advisor');
    case 'QUESTIONNAIRE':
      return input.repeat
        ? input.translate('chatWidget.mechanical.pre.questionnaireRepeat')
        : input.translate('chatWidget.mechanical.pre.questionnaire');
    default:
      return '';
  }
}

function getPostMessage(actionKey: MechanicalActionKey, repeat: boolean, translate: ChatWidgetTranslate): string {
  switch (actionKey) {
    case 'PROCESS_GUIDE':
      return translate('chatWidget.mechanical.post.process');
    case 'MEDICAL_RECORDS':
      return translate('chatWidget.mechanical.post.medicalRecords');
    case 'ADVISOR_HANDOFF':
      return translate('chatWidget.mechanical.post.advisor');
    case 'QUESTIONNAIRE':
      return repeat
        ? translate('chatWidget.mechanical.post.questionnaireRepeat')
        : translate('chatWidget.mechanical.post.questionnaire');
    default:
      return '';
  }
}

function AssistantBubble({ children }: { children: ReactNode }) {
  return (
    <div className="mr-auto max-w-[88%] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
      {children}
    </div>
  );
}

function CompletedBadge({ translate }: { translate: ChatWidgetTranslate }) {
  return (
    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5" />
      {translate('chatWidget.mechanical.completed')}
    </div>
  );
}

function UploadActionCard({ translate, onOpenUpload }: { translate: ChatWidgetTranslate; onOpenUpload?: () => void }) {
  const handleUploadClick = () => {
    onOpenUpload?.();
  };

  return (
    <div className="mr-auto max-w-[92%] rounded-[24px] border border-sky-100 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50">
          <FileUp className="h-4 w-4 text-sky-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold leading-5 text-slate-900">
            {translate('chatWidget.mechanical.upload.title')}
          </div>
          <p className="mt-1 text-[12px] leading-5 text-slate-500">
            {translate('chatWidget.mechanical.upload.description')}
          </p>
          <Button type="button" onClick={handleUploadClick} className="mt-3 h-9 rounded-xl bg-sky-600 px-4 text-white hover:bg-sky-700">
            {translate('chatWidget.mechanical.upload.cta')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function HandoffActionCard({ translate, onComplete }: { translate: ChatWidgetTranslate; onComplete: () => void }) {
  return (
    <div className="mr-auto max-w-[92%] rounded-[24px] border border-amber-100 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50">
          <Handshake className="h-4 w-4 text-amber-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold leading-5 text-slate-900">{translate('chatWidget.mechanical.advisor.title')}</div>
          <p className="mt-1 text-[12px] leading-5 text-slate-500">
            {translate('chatWidget.mechanical.advisor.description')}
          </p>
          <Button type="button" onClick={onComplete} className="mt-3 h-9 rounded-xl bg-amber-600 px-4 text-white hover:bg-amber-700">
            {translate('chatWidget.mechanical.advisor.cta')}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MechanicalChatMenu({
  caseId,
  processConfirmed = false,
  questionnaireHistoryRefreshNonce = 0,
  medicalRecordsUploadCompletionNonce = 0,
  onConfirmProcessGuide,
  onOpenQuestionnaire,
  onOpenMedicalRecordsUpload,
}: MechanicalChatMenuProps) {
  const { currentLanguage } = useLanguage();
  const translate = useMemo(
    () => createChatWidgetTranslator(currentLanguage.code),
    [currentLanguage.code],
  );
  const [optimisticProcessConfirmed, setOptimisticProcessConfirmed] = useState(false);
  const [questionnaireBefore, setQuestionnaireBefore] = useState(false);
  const [advisorCompleted, setAdvisorCompleted] = useState(false);
  const [turns, setTurns] = useState<MechanicalTurn[]>([]);
  const effectiveProcessConfirmed = processConfirmed || optimisticProcessConfirmed;
  const activeTurn = turns.find((turn) => turn.status === 'selected') ?? null;
  const completeActionRef = useRef<(turn: MechanicalTurn) => void>(() => {});
  const lastMedicalRecordsUploadCompletionNonceRef = useRef(medicalRecordsUploadCompletionNonce);

  const actions = useMemo(() => {
    const next: Array<{ key: MechanicalActionKey; label: string; icon: ComponentType<{ className?: string }> }> = [];

    if (!effectiveProcessConfirmed) {
      next.push({ key: 'PROCESS_GUIDE', label: translate('chatWidget.mechanical.action.process'), icon: Route });
    }

    next.push({ key: 'MEDICAL_RECORDS', label: translate('chatWidget.mechanical.action.medicalRecords'), icon: FileUp });

    if (!advisorCompleted) {
      next.push({ key: 'ADVISOR_HANDOFF', label: translate('chatWidget.mechanical.action.advisor'), icon: Handshake });
    }

    next.push({
      key: 'QUESTIONNAIRE',
      label: questionnaireBefore
        ? translate('chatWidget.mechanical.action.questionnaireRepeat')
        : translate('chatWidget.mechanical.action.questionnaire'),
      icon: ClipboardList,
    });

    return next;
  }, [advisorCompleted, effectiveProcessConfirmed, questionnaireBefore, translate]);

  const selectAction = (actionKey: MechanicalActionKey) => {
    setTurns((current) => [
      ...current,
      {
        id: createTurnId(actionKey),
        actionKey,
        status: 'selected',
        requiresProcessFirst: requiresProcess(actionKey) && !effectiveProcessConfirmed,
        processConfirmed: effectiveProcessConfirmed,
        repeat: actionKey === 'QUESTIONNAIRE'
            ? questionnaireBefore
            : false,
      },
    ]);
  };

  const completeTurn = (turnId: string) => {
    setTurns((current) => current.map((turn) => (
      turn.id === turnId ? { ...turn, status: 'completed', processConfirmed: true } : turn
    )));
  };

  const continueAfterProcess = async (turn: MechanicalTurn) => {
    await onConfirmProcessGuide?.();
    setOptimisticProcessConfirmed(true);

    if (turn.actionKey === 'PROCESS_GUIDE') {
      completeTurn(turn.id);
      return;
    }

    setTurns((current) => current.map((item) => (
      item.id === turn.id
        ? { ...item, requiresProcessFirst: false, processConfirmed: true }
        : item
    )));
  };

  const completeAction = (turn: MechanicalTurn) => {
    if (turn.actionKey === 'ADVISOR_HANDOFF') {
      setAdvisorCompleted(true);
    }

    if (turn.actionKey === 'QUESTIONNAIRE') {
      setQuestionnaireBefore(true);
    }

    completeTurn(turn.id);
  };
  completeActionRef.current = completeAction;

  useEffect(() => {
    const selectedQuestionnaireTurn = turns.find((turn) =>
      turn.status === 'selected'
      && turn.actionKey === 'QUESTIONNAIRE'
      && turn.questionnaireRefreshNonce !== undefined
      && questionnaireHistoryRefreshNonce > turn.questionnaireRefreshNonce
    );

    if (!selectedQuestionnaireTurn) {
      return;
    }

    completeActionRef.current(selectedQuestionnaireTurn);
  }, [questionnaireHistoryRefreshNonce, turns]);

  useEffect(() => {
    if (medicalRecordsUploadCompletionNonce <= lastMedicalRecordsUploadCompletionNonceRef.current) {
      return;
    }

    lastMedicalRecordsUploadCompletionNonceRef.current = medicalRecordsUploadCompletionNonce;
    const selectedUploadTurn = turns.find((turn) =>
      turn.status === 'selected'
      && turn.actionKey === 'MEDICAL_RECORDS'
      && !turn.requiresProcessFirst
    );

    if (!selectedUploadTurn) {
      return;
    }

    completeActionRef.current(selectedUploadTurn);
  }, [medicalRecordsUploadCompletionNonce, turns]);

  const renderTurnAction = (turn: MechanicalTurn) => {
    if (turn.requiresProcessFirst) {
      return (
        <ProcessModalTrigger
          block={{
            id: `${turn.id}:process`,
            type: 'PROCESS_MODAL_TRIGGER',
            modalKey: 'MEDICAL_TRAVEL_PROCESS',
            title: translate('chatWidget.mechanical.process.title'),
            description: translate('chatWidget.mechanical.process.gatedDescription'),
            ctaLabel: translate('chatWidget.mechanical.process.gatedCta'),
          }}
          onConfirm={() => continueAfterProcess(turn)}
          onDismissUnconfirmed={() => {
            setTurns((current) => current.map((item) => (
              item.id === turn.id ? { ...item, status: 'unconfirmed' } : item
            )));
          }}
        />
      );
    }

    if (turn.actionKey === 'PROCESS_GUIDE') {
      return (
        <ProcessModalTrigger
          block={{
            id: `${turn.id}:process`,
            type: 'PROCESS_MODAL_TRIGGER',
            modalKey: 'MEDICAL_TRAVEL_PROCESS',
            title: translate('chatWidget.mechanical.process.title'),
            description: translate('chatWidget.mechanical.process.description'),
            ctaLabel: translate('chatWidget.mechanical.process.cta'),
          }}
          onConfirm={() => continueAfterProcess(turn)}
          onDismissUnconfirmed={() => {
            setTurns((current) => current.map((item) => (
              item.id === turn.id ? { ...item, status: 'unconfirmed' } : item
            )));
          }}
        />
      );
    }

    if (turn.actionKey === 'MEDICAL_RECORDS') {
      return <UploadActionCard translate={translate} onOpenUpload={onOpenMedicalRecordsUpload} />;
    }

    if (turn.actionKey === 'ADVISOR_HANDOFF') {
      return <HandoffActionCard translate={translate} onComplete={() => completeAction(turn)} />;
    }

    return (
      <QuestionnaireModalTrigger
        block={{
          id: `${turn.id}:questionnaire`,
          type: 'QUESTIONNAIRE_MODAL_TRIGGER',
          templateId: caseId ? 'DEFAULT' : '',
          title: turn.repeat
            ? translate('chatWidget.mechanical.questionnaire.titleRepeat')
            : translate('chatWidget.mechanical.questionnaire.title'),
          description: translate('chatWidget.mechanical.questionnaire.description'),
          ctaLabel: turn.repeat
            ? translate('chatWidget.mechanical.questionnaire.ctaRepeat')
            : translate('chatWidget.mechanical.questionnaire.cta'),
        }}
        onOpen={(templateId) => {
          void onOpenQuestionnaire?.(templateId);
          setTurns((current) => current.map((item) => (
            item.id === turn.id
              ? { ...item, questionnaireRefreshNonce: questionnaireHistoryRefreshNonce }
              : item
          )));
        }}
      />
    );
  };

  return (
    <div className="space-y-4" data-testid="mechanical-chat-menu">
      <AssistantBubble>{translate('chatWidget.mechanical.intro')}</AssistantBubble>

      {turns.map((turn) => (
        <div key={turn.id} className="space-y-3">
          <AssistantBubble>
            {getPreMessage(turn.actionKey, {
              processConfirmed: turn.processConfirmed,
              repeat: turn.repeat,
              translate,
            })}
          </AssistantBubble>
          {renderTurnAction(turn)}
          {turn.status === 'completed' ? (
            <AssistantBubble>
              {getPostMessage(turn.actionKey, turn.repeat, translate)}
              <CompletedBadge translate={translate} />
            </AssistantBubble>
          ) : null}
          {turn.status === 'unconfirmed' ? (
            <AssistantBubble>
              {translate('chatWidget.mechanical.unconfirmed')}
            </AssistantBubble>
          ) : null}
        </div>
      ))}

      {!activeTurn ? (
        <div className="sticky bottom-0 z-10 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_12px_30px_rgba(15,23,42,0.10)] backdrop-blur" data-testid="mechanical-action-bar">
          <div className="grid grid-cols-2 gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.key}
                  type="button"
                  variant="outline"
                  onClick={() => selectAction(action.key)}
                  className="h-auto justify-start gap-2 rounded-xl border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
