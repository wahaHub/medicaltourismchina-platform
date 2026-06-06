import { useMemo, useState, type ComponentType, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { CalendarClock, ClipboardList, FileUp, Handshake, Loader2, Route, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { patientMessagesApi, type PatientChatActionKey, type PatientChatState } from '@/services/api/patient-messages';
import { ProcessModalTrigger } from './blocks/ProcessModalTrigger';
import { QuestionnaireModalTrigger } from './blocks/QuestionnaireModalTrigger';
import { createChatWidgetTranslator } from './chat-widget-i18n';

type MechanicalChatMenuProps = {
  caseId: string | null;
  sessionId: string | null;
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
  BOOK_ONLINE_CONSULT: CalendarClock,
};

function getTodayInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getBrowserTimeZone(): string {
  if (typeof Intl === 'undefined') {
    return 'UTC';
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

function getTimeZoneOptions(currentTimeZone: string): string[] {
  const fallback = [
    'UTC',
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Asia/Tokyo',
    'Asia/Singapore',
    'Europe/London',
    'Europe/Paris',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
  ];

  const supportedValuesOf = (Intl as typeof Intl & {
    supportedValuesOf?: (key: 'timeZone') => string[];
  }).supportedValuesOf;
  const values = typeof supportedValuesOf === 'function'
    ? supportedValuesOf('timeZone')
    : fallback;
  return Array.from(new Set([currentTimeZone, ...values])).sort((left, right) => left.localeCompare(right));
}

function AssistantBubble({ children }: { children: ReactNode }) {
  return (
    <div className="mr-auto max-w-[88%] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm">
      {children}
    </div>
  );
}

export default function MechanicalChatMenu({
  caseId,
  sessionId,
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
  const [bookingDate, setBookingDate] = useState(getTodayInputValue);
  const [bookingTime, setBookingTime] = useState('09:00');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<{ userTime: string; beijingTime: string } | null>(null);
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const isZh = currentLanguage.code === 'zh';
  const detectedTimeZone = useMemo(() => getBrowserTimeZone(), []);
  const [userTimeZone, setUserTimeZone] = useState(detectedTimeZone);
  const timeZoneOptions = useMemo(() => getTimeZoneOptions(detectedTimeZone), [detectedTimeZone]);

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

  const submitBooking = async () => {
    setBookingError(null);
    setBookingResult(null);

    if (!sessionId) {
      setBookingError(isZh ? '当前会话不可用，请稍后再试。' : 'This chat session is not available. Please try again.');
      return;
    }

    const selectedDate = new Date(`${bookingDate}T${bookingTime}:00`);
    if (Number.isNaN(selectedDate.getTime())) {
      setBookingError(isZh ? '请选择有效的日期和时间。' : 'Please choose a valid date and time.');
      return;
    }

    setIsBookingSubmitting(true);
    try {
      const result = await patientMessagesApi.requestOnlineConsultBooking({
        sessionId,
        startsAt: selectedDate.toISOString(),
        timeZone: userTimeZone,
        locale: isZh ? 'zh' : 'en',
      });
      setBookingResult({
        userTime: result.userTime,
        beijingTime: result.beijingTime,
      });
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : (isZh ? '预约提交失败，请稍后再试。' : 'Booking failed. Please try again.'));
    } finally {
      setIsBookingSubmitting(false);
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

      <Dialog.Root open={activeCard === 'BOOK_ONLINE_CONSULT'} onOpenChange={(open) => {
        if (!open) {
          setActiveCard(null);
        }
      }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[10020] bg-slate-950/35" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[10021] w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="text-base font-semibold text-slate-900">
                  {isZh ? '预约在线问诊' : 'Book online consult'}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm leading-6 text-slate-600">
                  {isZh ? '请选择问诊时间，并确认时区。' : 'Choose a consultation time and confirm the time zone.'}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <Button type="button" size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>{isZh ? '日期' : 'Date'}</span>
                <Input
                  type="date"
                  min={getTodayInputValue()}
                  value={bookingDate}
                  onChange={(event) => setBookingDate(event.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>{isZh ? '时间' : 'Time'}</span>
                <Input
                  type="time"
                  value={bookingTime}
                  onChange={(event) => setBookingTime(event.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700 sm:col-span-2">
                <span>{isZh ? '时区' : 'Time zone'}</span>
                <select
                  value={userTimeZone}
                  onChange={(event) => setUserTimeZone(event.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                >
                  {timeZoneOptions.map((timeZone) => (
                    <option key={timeZone} value={timeZone}>
                      {timeZone}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {bookingError ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {bookingError}
              </div>
            ) : null}

            {bookingResult ? (
              <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-sm leading-6 text-teal-800">
                <div>{isZh ? '预约请求已发送。' : 'Your consultation request has been sent.'}</div>
                <div>{isZh ? '您的时间：' : 'Your time: '}{bookingResult.userTime}</div>
              </div>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline">
                  {isZh ? '关闭' : 'Close'}
                </Button>
              </Dialog.Close>
              <Button
                type="button"
                onClick={() => void submitBooking()}
                disabled={isBookingSubmitting || Boolean(bookingResult)}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                {isBookingSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {bookingResult ? (isZh ? '已提交' : 'Request sent') : (isZh ? '提交预约' : 'Send request')}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
