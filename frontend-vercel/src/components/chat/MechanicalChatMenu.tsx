import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { CheckCircle2, ClipboardList, FileUp, Handshake, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProcessModalTrigger } from './blocks/ProcessModalTrigger';
import { QuestionnaireModalTrigger } from './blocks/QuestionnaireModalTrigger';

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
  onConfirmProcessGuide?: () => Promise<void> | void;
  onOpenQuestionnaire?: (templateId: string) => Promise<void> | void;
};

const INTRO_COPY = '您好，我是 Medora 医疗旅程助手。我们已经收到您的基本信息。接下来您可以先了解赴华就医流程、上传已有医疗资料、填写病情表，或请顾问接手联系您。您提交的内容会进入 Medora CRM，由人工团队跟进查看。';

const PROCESS_POST_COPY = '您已确认赴华就医流程和服务规则。您可以继续上传医疗资料、填写病情表，或联系顾问。';

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
}): string {
  if (!input.processConfirmed && requiresProcess(actionKey)) {
    switch (actionKey) {
      case 'MEDICAL_RECORDS':
        return '请您先同意赴华就医流程和服务规则，然后我们才能继续引导您上传医疗资料。';
      case 'ADVISOR_HANDOFF':
        return '请您先同意赴华就医流程和服务规则，然后我们才能继续为您转接专业医疗团队。';
      case 'QUESTIONNAIRE':
        return '请您先同意赴华就医流程和服务规则，然后我们才能继续引导您填写病情表。';
      default:
        break;
    }
  }

  switch (actionKey) {
    case 'PROCESS_GUIDE':
      return '好的，我为您打开赴华就医流程说明。';
    case 'MEDICAL_RECORDS':
      return '您可以先查看需要准备哪些医疗资料。正式文件上传和收集方式会由 Medora 顾问在人工跟进时告知。';
    case 'ADVISOR_HANDOFF':
      return '我们会根据您已提交的基本信息安排人工团队跟进。请注意查收邮箱，Medora 顾问会继续联系您。';
    case 'QUESTIONNAIRE':
      return input.repeat
        ? '您可以修改已填写的病情表。保存后，Medora 医疗团队会以最新内容为准继续评估。'
        : '好的，请填写病情表，顾问和医生会根据这些信息评估您的情况。';
    default:
      return '';
  }
}

function getPostMessage(actionKey: MechanicalActionKey, repeat: boolean): string {
  switch (actionKey) {
    case 'PROCESS_GUIDE':
      return PROCESS_POST_COPY;
    case 'MEDICAL_RECORDS':
      return '请先准备好检查报告、影像、化验单或病历摘要。Medora 顾问跟进时会告知您正式上传和收集方式。';
    case 'ADVISOR_HANDOFF':
      return '我们会根据您已提交的基本信息安排人工团队跟进。请注意查收邮箱，Medora 顾问会继续联系您。';
    case 'QUESTIONNAIRE':
      return repeat
        ? '您的病情表已更新。Medora 医疗团队会以最新内容继续评估。'
        : '我们已收到您的病情表。Medora 医疗团队会结合您的资料继续评估。';
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

function CompletedBadge() {
  return (
    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5" />
      已完成
    </div>
  );
}

function UploadActionCard({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="mr-auto max-w-[92%] rounded-[24px] border border-sky-100 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50">
          <FileUp className="h-4 w-4 text-sky-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold leading-5 text-slate-900">
            准备医疗资料
          </div>
          <p className="mt-1 text-[12px] leading-5 text-slate-500">
            当前机械菜单不会在本页面直接收集文件。请先准备检查报告、影像、化验单或病历摘要，顾问跟进时会提供正式上传方式。
          </p>
          <Button type="button" onClick={onComplete} className="mt-3 h-9 rounded-xl bg-sky-600 px-4 text-white hover:bg-sky-700">
            我知道了
          </Button>
        </div>
      </div>
    </div>
  );
}

function HandoffActionCard({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="mr-auto max-w-[92%] rounded-[24px] border border-amber-100 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50">
          <Handshake className="h-4 w-4 text-amber-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold leading-5 text-slate-900">联系顾问</div>
          <p className="mt-1 text-[12px] leading-5 text-slate-500">
            我们会根据您已提交的基本信息安排人工团队跟进。当前页面不会再发送 AI 自由聊天回复。
          </p>
          <Button type="button" onClick={onComplete} className="mt-3 h-9 rounded-xl bg-amber-600 px-4 text-white hover:bg-amber-700">
            确认需要顾问联系
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
  onConfirmProcessGuide,
  onOpenQuestionnaire,
}: MechanicalChatMenuProps) {
  const [optimisticProcessConfirmed, setOptimisticProcessConfirmed] = useState(false);
  const [questionnaireBefore, setQuestionnaireBefore] = useState(false);
  const [advisorCompleted, setAdvisorCompleted] = useState(false);
  const [turns, setTurns] = useState<MechanicalTurn[]>([]);
  const effectiveProcessConfirmed = processConfirmed || optimisticProcessConfirmed;
  const activeTurn = turns.find((turn) => turn.status === 'selected') ?? null;
  const completeActionRef = useRef<(turn: MechanicalTurn) => void>(() => {});

  const actions = useMemo(() => {
    const next: Array<{ key: MechanicalActionKey; label: string; icon: ComponentType<{ className?: string }> }> = [];

    if (!effectiveProcessConfirmed) {
      next.push({ key: 'PROCESS_GUIDE', label: '了解就医流程', icon: Route });
    }

    next.push({ key: 'MEDICAL_RECORDS', label: '上传医疗资料', icon: FileUp });

    if (!advisorCompleted) {
      next.push({ key: 'ADVISOR_HANDOFF', label: '联系顾问', icon: Handshake });
    }

    next.push({ key: 'QUESTIONNAIRE', label: questionnaireBefore ? '修改病情表' : '填写病情表', icon: ClipboardList });

    return next;
  }, [advisorCompleted, effectiveProcessConfirmed, questionnaireBefore]);

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

  const renderTurnAction = (turn: MechanicalTurn) => {
    if (turn.requiresProcessFirst) {
      return (
        <ProcessModalTrigger
          block={{
            id: `${turn.id}:process`,
            type: 'PROCESS_MODAL_TRIGGER',
            modalKey: 'MEDICAL_TRAVEL_PROCESS',
            title: '赴华就医流程和服务规则',
            description: '请先确认流程和服务规则，确认后会继续当前操作。',
            ctaLabel: '打开并确认流程',
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
            title: '赴华就医流程和服务规则',
            description: '请阅读并确认赴华就医流程和服务规则。',
            ctaLabel: '打开流程说明',
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
      return <UploadActionCard onComplete={() => completeAction(turn)} />;
    }

    if (turn.actionKey === 'ADVISOR_HANDOFF') {
      return <HandoffActionCard onComplete={() => completeAction(turn)} />;
    }

    return (
      <QuestionnaireModalTrigger
        block={{
          id: `${turn.id}:questionnaire`,
          type: 'QUESTIONNAIRE_MODAL_TRIGGER',
          templateId: caseId ? 'DEFAULT' : '',
          title: turn.repeat ? '修改病情表' : '填写病情表',
          description: '提交后，Medora 医疗团队会结合您的资料继续评估。',
          ctaLabel: turn.repeat ? '修改病情表' : '填写病情表',
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
      <AssistantBubble>{INTRO_COPY}</AssistantBubble>

      {turns.map((turn) => (
        <div key={turn.id} className="space-y-3">
          <AssistantBubble>
            {getPreMessage(turn.actionKey, {
              processConfirmed: turn.processConfirmed,
              repeat: turn.repeat,
            })}
          </AssistantBubble>
          {renderTurnAction(turn)}
          {turn.status === 'completed' ? (
            <AssistantBubble>
              {getPostMessage(turn.actionKey, turn.repeat)}
              <CompletedBadge />
            </AssistantBubble>
          ) : null}
          {turn.status === 'unconfirmed' ? (
            <AssistantBubble>
              您还没有确认赴华就医流程和服务规则。您可以稍后再次打开确认；确认后才能继续上传医疗资料、填写病情表或联系顾问。
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
