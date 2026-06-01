import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePatientAuth } from '@/hooks/usePatientAuth';
import { getPreferredConversationId } from '@/hooks/usePatientConversations';
import type { PatientProfile as AuthPatientProfile } from '@/hooks/usePatientAuth';
import type {
  MatchedHospital,
  PatientConversationSummary,
  PatientEntryPhase,
  PatientProfileDraft,
} from '@/types/patient-entry';
import { patientMessagesApi } from '@/services/api/patient-messages';
import { patientEntryApi } from '@/services/api/patient-entry';
import { normalizePatientSessions } from '@/features/patient-sessions/session-model';
import type { OnlineConsultBookingCardBlock } from '@/types/chatbot-blocks';
import { isUnauthorizedApiError } from '@/services/api/crmApiClient';
import type { PatientSessionJourneySnapshot } from '@/services/api/crmApiClient';
import type { ChatbotV3TurnViewModel } from '@/services/chatbot-v3-normalizer';
import {
  clearBootstrapErrorMarker,
  writeBootstrapErrorMarker,
} from '@/services/storage/patient-entry-storage';

type ScopedPatientSession = {
  patientId: string;
  caseId: string;
};

type FormalConversationRef = Pick<PatientConversationSummary, 'id' | 'type'> & {
  category?: string;
};

type BackendRestoreState = {
  activeConversationId?: string | null;
  selectedHospitalId?: string | null;
  selectedHospitalIds?: string[];
  customHospitalRequest?: string | null;
};

export interface PatientEntryContextValue {
  isWidgetOpen: boolean;
  widgetDisplayMode: 'panel' | 'modal';
  phase: PatientEntryPhase;
  profileDraft: PatientProfileDraft;
  caseId: string | null;
  widgetChatTarget: AuthPatientProfile['widgetChatTarget'] | null;
  journeySnapshot: PatientSessionJourneySnapshot | null;
  processConfirmed: boolean;
  chatbotV3Journey: ChatbotV3TurnViewModel['journey'];
  chatbotV3Handoff: ChatbotV3TurnViewModel['handoff'];
  chatbotV3Cards: ChatbotV3TurnViewModel['cards'];
  matchedHospitals: MatchedHospital[];
  selectedHospitalIds: string[];
  customHospitalRequest: string;
  canAutoMatchHospitals: boolean;
  isPanelOpen: boolean;
  bootstrapError: string | null;
  activeConversationId: string | null;
  questionnaireTemplateId: string | null;
  isQuestionnaireModalOpen: boolean;
  questionnaireHistoryRefreshNonce: number;
  composerSelectedFiles: File[];
  openComposerAttachmentPicker: () => void;
  registerComposerAttachmentPicker: (opener: (() => void) | null) => void;
  setComposerSelectedFiles: (updater: File[] | ((current: File[]) => File[])) => void;
  removeComposerSelectedFile: (name: string) => void;
  openWidget: () => void;
  openWidgetModal: () => void;
  closeWidget: () => void;
  toggleWidget: () => void;
  setProfileDraft: (draft: PatientProfileDraft) => void;
  patchProfileDraft: (draft: Partial<PatientProfileDraft>) => void;
  setMatchedHospitals: (hospitals: MatchedHospital[]) => void;
  openPanel: () => void;
  closePanel: () => void;
  setActiveConversationId: (conversationId: string | null) => void;
  setBootstrapError: (message: string | null) => void;
  clearBootstrapError: () => void;
  returnToProfileForm: () => void;
  openQuestionnaireModal: (templateId: string) => void;
  closeQuestionnaireModal: () => void;
  requestQuestionnaireHistoryRefresh: () => void;
  applyChatbotV3TurnState: (input: Pick<ChatbotV3TurnViewModel, 'journey' | 'handoff' | 'cards' | 'uiIntent'> & {
    source?: 'fresh' | 'history';
  }) => void;
  clearChatbotV3TurnState: () => void;
  markProcessConfirmed: () => void;
  applyOnboardingResult: (input: {
    patientId: string;
    caseId: string;
    nextStep: 'select-hospitals' | 'messages-ready';
    widgetChatTarget?: AuthPatientProfile['widgetChatTarget'] | null;
    journeySnapshot?: PatientSessionJourneySnapshot | null;
    conversations?: FormalConversationRef[];
    backendRestoreState?: BackendRestoreState;
  }) => boolean;
  applyRestoreResult: (input: {
    patientId: string;
    caseId: string;
    nextStep: 'select-hospitals' | 'messages-ready';
    widgetChatTarget?: AuthPatientProfile['widgetChatTarget'] | null;
    journeySnapshot?: PatientSessionJourneySnapshot | null;
    conversations?: FormalConversationRef[];
    backendRestoreState?: BackendRestoreState;
  }) => boolean;
  resolveMessagesReadyState: (input: {
    patientId: string;
    caseId: string;
    widgetChatTarget?: AuthPatientProfile['widgetChatTarget'] | null;
    journeySnapshot?: PatientSessionJourneySnapshot | null;
    conversations: FormalConversationRef[];
    backendRestoreState?: BackendRestoreState;
  }) => boolean;
  resetEntryState: () => void;
  /** Post hospital selection to backend. Idempotent - backend handles re-submission. */
  submitHospitalSelection: (caseId: string, hospitalIds: string[], customHospitalRequest?: string) => Promise<void>;
  /** Post consult conversion request to backend. */
  requestConsultConversion: (block: OnlineConsultBookingCardBlock) => Promise<void>;
  /** Load the backend questionnaire template for the active case. */
  requestQuestionnaireTemplate: (templateId: string) => Promise<void>;
}

export const PatientEntryContext = createContext<PatientEntryContextValue | undefined>(undefined);

function createEmptyProfileDraft(): PatientProfileDraft {
  return {
    name: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    country: '',
    whatsapp: '',
    messenger: '',
    department: '',
    departmentCode: '',
    disease: '',
    destination: '',
    treatmentTime: '',
  };
}

function getPreferredFormalConversationId(
  conversations: FormalConversationRef[],
  activeConversationId: string | null,
): string | null {
  return getPreferredConversationId(
    conversations.map((conversation) => ({
      ...conversation,
      displayTitle: '',
      assistantMode: 'AI_ACTIVE',
      caseId: null,
      title: null,
      hospitalId: null,
      lastMessageAt: null,
      lastMessagePreview: null,
      lastSenderId: null,
      createdAt: '',
      updatedAt: '',
    })),
    activeConversationId,
  );
}

function hasAuthoritativeBackendConversationState(patient: AuthPatientProfile): boolean {
  return typeof patient.formalConversationState?.activeConversationId === 'string'
    && patient.formalConversationState.activeConversationId.length > 0;
}

function normalizeSelectedHospitalIds(input: BackendRestoreState | undefined): string[] {
  if (!input) {
    return [];
  }

  if (input.selectedHospitalIds !== undefined) {
    return Array.from(new Set(input.selectedHospitalIds));
  }

  if (input.selectedHospitalId) {
    return [input.selectedHospitalId];
  }

  return [];
}

function getBackendRestoreState(patient: AuthPatientProfile): BackendRestoreState {
  return {
    activeConversationId: patient.formalConversationState?.activeConversationId ?? null,
    selectedHospitalId: patient.selectedHospitalId ?? null,
    selectedHospitalIds: patient.selectedHospitalIds,
    customHospitalRequest: patient.customHospitalRequest ?? null,
  };
}

function getRestoreSignature(patient: AuthPatientProfile): string {
  return JSON.stringify({
    patientId: patient.id,
    caseId: patient.caseId,
    nextStep: patient.nextStep,
    widgetChatTarget: patient.widgetChatTarget ?? null,
    formalConversationState: patient.formalConversationState ?? null,
    chatbotOrchestrationState: patient.chatbotOrchestrationState ?? null,
    journeySnapshot: patient.journeySnapshot ?? null,
    selectedHospitalId: patient.selectedHospitalId ?? null,
    selectedHospitalIds: patient.selectedHospitalIds ?? null,
    customHospitalRequest: patient.customHospitalRequest ?? null,
  });
}

function shouldRestoreMessagesFromJourney(journeySnapshot: PatientSessionJourneySnapshot | null | undefined): boolean {
  if (!journeySnapshot) {
    return false;
  }

  return journeySnapshot.currentStage !== 'EXPLAIN_PROCESS';
}

const JOURNEY_STAGE_ORDER = {
  COLLECT_MINIMAL_MEDICAL_FACTS: 0,
  RECOMMENDATION: 1,
  EXPLAIN_PROCESS: 2,
  COLLECT_MEDICAL_INPUTS: 3,
  ONLINE_CONSULT: 4,
  HUMAN_HANDOFF: 5,
} satisfies Record<NonNullable<ChatbotV3TurnViewModel['journey']>['stage'], number>;

const JOURNEY_PHASE_ORDER = {
  pre: 0,
  active: 1,
  post: 2,
} satisfies Record<NonNullable<ChatbotV3TurnViewModel['journey']>['phase'], number>;

function compareChatbotJourneys(
  nextJourney: ChatbotV3TurnViewModel['journey'],
  currentJourney: ChatbotV3TurnViewModel['journey'],
): number | null {
  if (!nextJourney || !currentJourney) {
    return null;
  }

  const nextStageOrder = JOURNEY_STAGE_ORDER[nextJourney.stage];
  const currentStageOrder = JOURNEY_STAGE_ORDER[currentJourney.stage];

  if (nextStageOrder !== currentStageOrder) {
    return nextStageOrder - currentStageOrder;
  }

  return JOURNEY_PHASE_ORDER[nextJourney.phase] - JOURNEY_PHASE_ORDER[currentJourney.phase];
}

function shouldPersistChatbotV3TurnState(
  input: Pick<ChatbotV3TurnViewModel, 'journey' | 'handoff' | 'cards' | 'uiIntent'> & {
    source?: 'fresh' | 'history';
  },
  currentJourney: ChatbotV3TurnViewModel['journey'],
  fallbackJourney: PatientSessionJourneySnapshot | null,
): boolean {
  if (
    input.source === 'history'
    && currentJourney?.stage === 'RECOMMENDATION'
    && input.journey?.stage === 'EXPLAIN_PROCESS'
  ) {
    return false;
  }

  if (
    currentJourney?.stage === 'EXPLAIN_PROCESS'
    && input.journey?.stage === 'RECOMMENDATION'
  ) {
    return true;
  }

  if (
    input.uiIntent === 'FAQ_DETOUR'
    && currentJourney?.stage === 'EXPLAIN_PROCESS'
    && input.journey?.stage === 'RECOMMENDATION'
  ) {
    return true;
  }

  const journeyDelta = compareChatbotJourneys(input.journey ?? null, currentJourney);

  if (journeyDelta !== null) {
    if (journeyDelta < 0) {
      return false;
    }

    if (journeyDelta > 0) {
      return true;
    }
  }

  if (input.uiIntent !== 'FAQ_DETOUR') {
    return true;
  }

  if (input.cards.length > 0 || input.handoff?.required) {
    return true;
  }

  const currentStage = currentJourney?.stage ?? fallbackJourney?.currentStage ?? null;
  const currentPhase = currentJourney?.phase ?? fallbackJourney?.currentPhase ?? null;

  return input.journey?.stage !== currentStage
    || input.journey?.phase !== currentPhase;
}

export function PatientEntryProvider({ children }: { children: ReactNode }) {
  const { patient, isLoading: isPatientAuthLoading, refreshPatientSession, expirePatientSession } = usePatientAuth();
  const [scopedSession, setScopedSession] = useState<ScopedPatientSession | null>(null);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [widgetDisplayMode, setWidgetDisplayMode] = useState<'panel' | 'modal'>('panel');
  const [phase, setPhase] = useState<PatientEntryPhase>('collect-profile');
  const [profileDraft, setProfileDraftState] = useState<PatientProfileDraft>(() => createEmptyProfileDraft());
  const [caseId, setCaseId] = useState<string | null>(null);
  const [matchedHospitals, setMatchedHospitalsState] = useState<MatchedHospital[]>([]);
  const [selectedHospitalIds, setSelectedHospitalIdsState] = useState<string[]>([]);
  const [customHospitalRequest, setCustomHospitalRequestState] = useState('');
  const [widgetChatTarget, setWidgetChatTargetState] = useState<AuthPatientProfile['widgetChatTarget'] | null>(null);
  const [journeySnapshot, setJourneySnapshotState] = useState<PatientSessionJourneySnapshot | null>(null);
  const [processConfirmed, setProcessConfirmedState] = useState(false);
  const [chatbotV3Journey, setChatbotV3JourneyState] = useState<ChatbotV3TurnViewModel['journey']>(null);
  const [chatbotV3Handoff, setChatbotV3HandoffState] = useState<ChatbotV3TurnViewModel['handoff']>(null);
  const [chatbotV3Cards, setChatbotV3CardsState] = useState<ChatbotV3TurnViewModel['cards']>([]);
  const [canAutoMatchHospitals, setCanAutoMatchHospitals] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [bootstrapError, setBootstrapErrorState] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(null);
  const [questionnaireTemplateId, setQuestionnaireTemplateId] = useState<string | null>(null);
  const [isQuestionnaireModalOpen, setIsQuestionnaireModalOpen] = useState(false);
  const [questionnaireHistoryRefreshNonce, setQuestionnaireHistoryRefreshNonce] = useState(0);
  const [composerSelectedFiles, setComposerSelectedFilesState] = useState<File[]>([]);
  const lastAppliedRestoreKeyRef = useRef<string | null>(null);
  const composerAttachmentPickerOpenerRef = useRef<(() => void) | null>(null);

  const clearBootstrapError = useCallback(() => {
    if (scopedSession) {
      clearBootstrapErrorMarker(scopedSession.patientId, scopedSession.caseId);
    }
    lastAppliedRestoreKeyRef.current = null;
    setPhase('collect-profile');
    setBootstrapErrorState(null);
    setCanAutoMatchHospitals(false);
    setWidgetChatTargetState(null);
    setJourneySnapshotState(null);
    setProcessConfirmedState(false);
    setChatbotV3JourneyState(null);
    setChatbotV3HandoffState(null);
    setChatbotV3CardsState([]);
    setActiveConversationIdState(null);
    setQuestionnaireTemplateId(null);
    setIsQuestionnaireModalOpen(false);
  }, [scopedSession]);

  const moveToBootstrapError = useCallback((patientId: string, nextCaseId: string, reason: string) => {
    writeBootstrapErrorMarker(patientId, nextCaseId, reason);
    setPhase('bootstrap-error');
    setBootstrapErrorState(reason);
  }, []);

  const bindScopedSession = useCallback((patientId: string, nextCaseId: string) => {
    setScopedSession({ patientId, caseId: nextCaseId });
    setCaseId(nextCaseId);
  }, []);

  const resolveMessagesReadyState = useCallback((input: {
    patientId: string;
    caseId: string;
    widgetChatTarget?: AuthPatientProfile['widgetChatTarget'] | null;
    journeySnapshot?: PatientSessionJourneySnapshot | null;
    conversations: FormalConversationRef[];
    backendRestoreState?: BackendRestoreState;
  }) => {
    const backendSelectedHospitalIds = normalizeSelectedHospitalIds(input.backendRestoreState);
    const backendActiveConversationId = typeof input.backendRestoreState?.activeConversationId === 'string'
      && input.backendRestoreState.activeConversationId.length > 0
      ? input.backendRestoreState.activeConversationId
      : null;
    const activeConversationId = backendActiveConversationId
      ?? getPreferredFormalConversationId(input.conversations, null);

    if (!activeConversationId) {
      moveToBootstrapError(input.patientId, input.caseId, 'Patient conversation not found');
      return false;
    }

    clearBootstrapErrorMarker(input.patientId, input.caseId);
    setPhase('messages-ready');
    setActiveConversationIdState(activeConversationId);
    setCaseId(input.caseId);
    setJourneySnapshotState(input.journeySnapshot ?? null);
    setProcessConfirmedState(patient?.chatbotOrchestrationState?.processExplained === true);
    setChatbotV3JourneyState(null);
    setChatbotV3HandoffState(null);
    setChatbotV3CardsState([]);
    setMatchedHospitalsState([]);
    setSelectedHospitalIdsState(backendSelectedHospitalIds);
    setCustomHospitalRequestState(input.backendRestoreState?.customHospitalRequest ?? patient?.customHospitalRequest ?? '');
    setWidgetChatTargetState(input.widgetChatTarget ?? null);
    setCanAutoMatchHospitals(false);
    setBootstrapErrorState(null);
    return true;
  }, [moveToBootstrapError, patient]);

  const applyOnboardingResult = useCallback((input: {
    patientId: string;
    caseId: string;
    nextStep: 'select-hospitals' | 'messages-ready';
    widgetChatTarget?: AuthPatientProfile['widgetChatTarget'] | null;
    journeySnapshot?: PatientSessionJourneySnapshot | null;
    conversations?: FormalConversationRef[];
    backendRestoreState?: BackendRestoreState;
  }) => {
    bindScopedSession(input.patientId, input.caseId);
    clearBootstrapErrorMarker(input.patientId, input.caseId);
    setWidgetChatTargetState(input.widgetChatTarget ?? null);
    setJourneySnapshotState(input.journeySnapshot ?? null);
    setProcessConfirmedState(patient?.chatbotOrchestrationState?.processExplained === true);
    setChatbotV3JourneyState(null);
    setChatbotV3HandoffState(null);
    setChatbotV3CardsState([]);

    const backendSelectedHospitalIds = normalizeSelectedHospitalIds(input.backendRestoreState);
    const backendActiveConversationId = typeof input.backendRestoreState?.activeConversationId === 'string'
      && input.backendRestoreState.activeConversationId.length > 0
      ? input.backendRestoreState.activeConversationId
      : null;

    if (input.nextStep === 'select-hospitals') {
      setMatchedHospitalsState([]);
      setSelectedHospitalIdsState(backendSelectedHospitalIds);
      setCustomHospitalRequestState(input.backendRestoreState?.customHospitalRequest ?? patient?.customHospitalRequest ?? '');
      setCanAutoMatchHospitals(true);
      setPhase(shouldRestoreMessagesFromJourney(input.journeySnapshot) ? 'messages-ready' : 'select-hospitals');
      setActiveConversationIdState(
        backendActiveConversationId ?? getPreferredFormalConversationId(input.conversations ?? [], null),
      );
      setBootstrapErrorState(null);
      return shouldRestoreMessagesFromJourney(input.journeySnapshot)
        ? resolveMessagesReadyState({
            patientId: input.patientId,
            caseId: input.caseId,
            widgetChatTarget: input.widgetChatTarget,
            journeySnapshot: input.journeySnapshot,
            conversations: input.conversations ?? [],
            backendRestoreState: input.backendRestoreState,
          })
        : true;
    }

    return resolveMessagesReadyState({
      patientId: input.patientId,
      caseId: input.caseId,
      widgetChatTarget: input.widgetChatTarget,
      journeySnapshot: input.journeySnapshot,
      conversations: input.conversations ?? [],
      backendRestoreState: input.backendRestoreState,
    });
  }, [bindScopedSession, patient, resolveMessagesReadyState]);

  const applyRestoreResult = useCallback((input: {
    patientId: string;
    caseId: string;
    nextStep: 'select-hospitals' | 'messages-ready';
    widgetChatTarget?: AuthPatientProfile['widgetChatTarget'] | null;
    journeySnapshot?: PatientSessionJourneySnapshot | null;
    conversations?: FormalConversationRef[];
    backendRestoreState?: BackendRestoreState;
  }) => {
    setScopedSession({ patientId: input.patientId, caseId: input.caseId });
    setCaseId(input.caseId);
    setWidgetChatTargetState(input.widgetChatTarget ?? null);
    setJourneySnapshotState(input.journeySnapshot ?? null);
    setProcessConfirmedState(patient?.chatbotOrchestrationState?.processExplained === true);
    setChatbotV3JourneyState(null);
    setChatbotV3HandoffState(null);
    setChatbotV3CardsState([]);
    clearBootstrapErrorMarker(input.patientId, input.caseId);

    const backendSelectedHospitalIds = normalizeSelectedHospitalIds(input.backendRestoreState);
    const hasBackendActiveConversationId = typeof input.backendRestoreState?.activeConversationId === 'string'
      && input.backendRestoreState.activeConversationId.length > 0;
    const backendActiveConversationId = input.backendRestoreState?.activeConversationId ?? null;

    if (input.nextStep === 'select-hospitals' && !shouldRestoreMessagesFromJourney(input.journeySnapshot)) {
      setMatchedHospitalsState([]);
      setSelectedHospitalIdsState(backendSelectedHospitalIds);
      setCustomHospitalRequestState(input.backendRestoreState?.customHospitalRequest ?? patient?.customHospitalRequest ?? '');
      setCanAutoMatchHospitals(false);
      setPhase('select-hospitals');
      setActiveConversationIdState(
        hasBackendActiveConversationId
          ? backendActiveConversationId
          : getPreferredFormalConversationId(input.conversations ?? [], null),
      );
      setBootstrapErrorState(null);
      return true;
    }

    if (hasBackendActiveConversationId) {
      setPhase('messages-ready');
      setActiveConversationIdState(backendActiveConversationId);
      setSelectedHospitalIdsState(backendSelectedHospitalIds);
      setCustomHospitalRequestState(input.backendRestoreState?.customHospitalRequest ?? patient?.customHospitalRequest ?? '');
      setCanAutoMatchHospitals(false);
      setBootstrapErrorState(null);
      return true;
    }

    return resolveMessagesReadyState({
      patientId: input.patientId,
      caseId: input.caseId,
      widgetChatTarget: input.widgetChatTarget,
      journeySnapshot: input.journeySnapshot,
      conversations: input.conversations ?? [],
      backendRestoreState: input.backendRestoreState,
    });
  }, [patient, resolveMessagesReadyState]);

  useEffect(() => {
    if (!patient?.id || !patient.caseId || !patient.nextStep || isPatientAuthLoading) {
      if (!patient) {
        lastAppliedRestoreKeyRef.current = null;
        setPhase('collect-profile');
        setCaseId(null);
        setScopedSession(null);
        setMatchedHospitalsState([]);
        setSelectedHospitalIdsState([]);
        setCustomHospitalRequestState('');
        setWidgetChatTargetState(null);
        setJourneySnapshotState(null);
        setProcessConfirmedState(false);
        setChatbotV3JourneyState(null);
        setChatbotV3HandoffState(null);
        setChatbotV3CardsState([]);
        setCanAutoMatchHospitals(false);
        setBootstrapErrorState(null);
        setActiveConversationIdState(null);
      }
      return;
    }

    const restoreKey = getRestoreSignature(patient);

    if (
      scopedSession?.patientId === patient.id
      && scopedSession.caseId === patient.caseId
      && lastAppliedRestoreKeyRef.current === restoreKey
      && (
        phase === 'messages-ready'
        || (phase === 'select-hospitals' && patient.nextStep === 'select-hospitals')
      )
    ) {
      return;
    }

    if (lastAppliedRestoreKeyRef.current === restoreKey) {
      return;
    }

    let cancelled = false;

    const syncPatientEntryState = async () => {
      let conversations: FormalConversationRef[] | undefined;
      const backendRestoreState = getBackendRestoreState(patient);
      const canSkipConversationDiscovery = hasAuthoritativeBackendConversationState(patient);

      if (!canSkipConversationDiscovery && (patient.nextStep === 'messages-ready' || patient.nextStep === 'select-hospitals')) {
        try {
          const response = await patientMessagesApi.listSessions({ caseId: patient.caseId });
          if (cancelled) {
            return;
          }
          conversations = normalizePatientSessions(response).map((session) => ({
            id: session.id,
            category: session.sessionKind === 'care-team' ? 'ADMIN_PATIENT' : 'HOSPITAL_PATIENT',
            type: session.sessionKind === 'care-team' ? 'patient-admin' as const : 'patient-hospital' as const,
          }));
        } catch (error) {
          if (cancelled) {
            return;
          }

          moveToBootstrapError(
            patient.id,
            patient.caseId,
            error instanceof Error ? error.message : 'Failed to restore patient conversations',
          );
          lastAppliedRestoreKeyRef.current = restoreKey;
          return;
        }
      }

      const restored = applyRestoreResult({
        patientId: patient.id,
        caseId: patient.caseId,
        nextStep: patient.nextStep,
        widgetChatTarget: patient.widgetChatTarget ?? null,
        journeySnapshot: patient.journeySnapshot ?? null,
        conversations,
        backendRestoreState,
      });

      if (!cancelled) {
        lastAppliedRestoreKeyRef.current = restoreKey;
      }
    };

    void syncPatientEntryState();

    return () => {
      cancelled = true;
    };
  }, [
    applyRestoreResult,
    isPatientAuthLoading,
    moveToBootstrapError,
    patient,
    phase,
    scopedSession,
  ]);

  const value = useMemo<PatientEntryContextValue>(() => ({
    isWidgetOpen,
    widgetDisplayMode,
    phase,
    profileDraft,
    caseId,
    widgetChatTarget,
    journeySnapshot,
    processConfirmed,
    chatbotV3Journey,
    chatbotV3Handoff,
    chatbotV3Cards,
    matchedHospitals,
    selectedHospitalIds,
    customHospitalRequest,
    canAutoMatchHospitals,
    isPanelOpen,
    bootstrapError,
    activeConversationId,
    composerSelectedFiles,
    openComposerAttachmentPicker: () => {
      composerAttachmentPickerOpenerRef.current?.();
    },
    registerComposerAttachmentPicker: (opener) => {
      composerAttachmentPickerOpenerRef.current = opener;
    },
    setComposerSelectedFiles: (updater) => {
      setComposerSelectedFilesState((current) =>
        typeof updater === 'function' ? updater(current) : updater,
      );
    },
    removeComposerSelectedFile: (name) => {
      setComposerSelectedFilesState((current) => current.filter((file) => file.name !== name));
    },
    openWidget: () => {
      setWidgetDisplayMode('panel');
      setIsWidgetOpen(true);
    },
    openWidgetModal: () => {
      setWidgetDisplayMode('modal');
      setIsWidgetOpen(true);
    },
    closeWidget: () => {
      setWidgetDisplayMode('panel');
      setIsWidgetOpen(false);
    },
    toggleWidget: () => {
      setIsWidgetOpen((current) => !current);
    },
    setProfileDraft: (draft) => setProfileDraftState(draft),
    patchProfileDraft: (draft) => {
      setProfileDraftState((current) => ({
        ...current,
        ...draft,
      }));
    },
    setMatchedHospitals: (hospitals) => {
      setMatchedHospitalsState(hospitals);
      setSelectedHospitalIdsState((current) =>
        current.filter((hospitalId) => hospitals.some((hospital) => hospital.id === hospitalId)),
      );
    },
    openPanel: () => {
      setIsWidgetOpen(false);
      setIsPanelOpen(true);
    },
    closePanel: () => setIsPanelOpen(false),
    setActiveConversationId: (conversationId) => setActiveConversationIdState(conversationId),
    questionnaireTemplateId,
    isQuestionnaireModalOpen,
    questionnaireHistoryRefreshNonce,
    openQuestionnaireModal: (templateId: string) => {
      setQuestionnaireTemplateId(templateId || 'DEFAULT');
      setIsQuestionnaireModalOpen(true);
    },
    closeQuestionnaireModal: () => {
      setIsQuestionnaireModalOpen(false);
      setQuestionnaireTemplateId(null);
    },
    requestQuestionnaireHistoryRefresh: () => {
      setQuestionnaireHistoryRefreshNonce((current) => current + 1);
    },
    applyChatbotV3TurnState: (input) => {
      if (!shouldPersistChatbotV3TurnState(input, chatbotV3Journey, journeySnapshot)) {
        return;
      }

      setChatbotV3JourneyState(input.journey ?? null);
      setChatbotV3HandoffState(input.handoff ?? null);
      setChatbotV3CardsState(input.cards);
    },
    clearChatbotV3TurnState: () => {
      setChatbotV3JourneyState(null);
      setChatbotV3HandoffState(null);
      setChatbotV3CardsState([]);
    },
    markProcessConfirmed: () => {
      setProcessConfirmedState(true);
    },
    setBootstrapError: (message) => {
      if (scopedSession && message) {
        writeBootstrapErrorMarker(scopedSession.patientId, scopedSession.caseId, message);
      }
      setBootstrapErrorState(message);
    },
    clearBootstrapError,
    returnToProfileForm: () => {
      setPhase('collect-profile');
      setMatchedHospitalsState([]);
      setSelectedHospitalIdsState([]);
      setCustomHospitalRequestState('');
      setWidgetChatTargetState(null);
      setJourneySnapshotState(null);
      setProcessConfirmedState(false);
      setChatbotV3JourneyState(null);
      setChatbotV3HandoffState(null);
      setChatbotV3CardsState([]);
      setCanAutoMatchHospitals(false);
      setIsPanelOpen(false);
      setWidgetDisplayMode('panel');
      setIsWidgetOpen(true);
      setBootstrapErrorState(null);
      setActiveConversationIdState(null);
      setQuestionnaireTemplateId(null);
      setIsQuestionnaireModalOpen(false);
    },
    applyOnboardingResult,
    applyRestoreResult,
    resolveMessagesReadyState,
    resetEntryState: () => {
      setIsWidgetOpen(false);
      setWidgetDisplayMode('panel');
      setPhase('collect-profile');
      setMatchedHospitalsState([]);
      setSelectedHospitalIdsState([]);
      setCustomHospitalRequestState('');
      setWidgetChatTargetState(null);
      setJourneySnapshotState(null);
      setProcessConfirmedState(false);
      setChatbotV3JourneyState(null);
      setChatbotV3HandoffState(null);
      setChatbotV3CardsState([]);
      setCanAutoMatchHospitals(false);
      setIsPanelOpen(false);
      setBootstrapErrorState(null);
      setActiveConversationIdState(null);
      setCaseId(null);
      setScopedSession(null);
      setProfileDraftState(createEmptyProfileDraft());
      setQuestionnaireTemplateId(null);
      setIsQuestionnaireModalOpen(false);
    },
    submitHospitalSelection: async (effectiveCaseId: string, hospitalIds: string[], nextCustomHospitalRequest?: string) => {
      try {
        await patientEntryApi.selectHospitals({
          caseId: effectiveCaseId,
          hospitalIds,
          customHospitalRequest: nextCustomHospitalRequest?.trim() ? nextCustomHospitalRequest.trim() : undefined,
        });
        await refreshPatientSession();
      } catch (error) {
        if (isUnauthorizedApiError(error)) {
          await expirePatientSession();
        }
        throw error;
      }
    },
    requestConsultConversion: async (block: OnlineConsultBookingCardBlock) => {
      try {
        await patientEntryApi.convertConsultation({
          convertPath: block.convertPath,
          requestedAction: block.requestedAction,
          conversionDraft: block.conversionDraft,
        });
        await refreshPatientSession();
      } catch (error) {
        if (isUnauthorizedApiError(error)) {
          await expirePatientSession();
        }
        throw error;
      }
    },
    requestQuestionnaireTemplate: async (_templateId: string) => {
      const effectiveCaseId = caseId ?? patient?.caseId ?? null;

      if (!effectiveCaseId) {
        throw new Error('Cannot open questionnaire: no active case ID');
      }

      setQuestionnaireTemplateId(_templateId || 'DEFAULT');
      setIsQuestionnaireModalOpen(true);
    },
  }), [
    expirePatientSession,
    applyOnboardingResult,
    applyRestoreResult,
    bootstrapError,
    caseId,
    clearBootstrapError,
    isPanelOpen,
    isWidgetOpen,
    widgetDisplayMode,
    matchedHospitals,
    patient,
    phase,
    profileDraft,
    customHospitalRequest,
    canAutoMatchHospitals,
    resolveMessagesReadyState,
    refreshPatientSession,
    scopedSession,
    selectedHospitalIds,
    questionnaireTemplateId,
    isQuestionnaireModalOpen,
    questionnaireHistoryRefreshNonce,
    composerSelectedFiles,
    journeySnapshot,
    processConfirmed,
    chatbotV3Journey,
    chatbotV3Handoff,
    chatbotV3Cards,
    widgetChatTarget,
  ]);

  return (
    <PatientEntryContext.Provider value={value}>
      {children}
    </PatientEntryContext.Provider>
  );
}
