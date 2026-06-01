import { useContext, type ReactNode } from 'react';
import { PatientEntryContext, type PatientEntryContextValue } from '@/contexts/PatientEntryContext';
import { HospitalRecommendationCards } from './blocks/HospitalRecommendationCards';
import { OnlineConsultBookingCard } from './blocks/OnlineConsultBookingCard';
import { ProcessModalTrigger } from './blocks/ProcessModalTrigger';
import { QuestionnaireModalTrigger } from './blocks/QuestionnaireModalTrigger';
import type {
  ChatbotMessageBlock,
  HospitalRecommendationCardsBlock,
  HospitalRecommendationItem,
  OnlineConsultBookingCardBlock,
  ProcessModalTriggerBlock,
  QuestionnaireModalTriggerBlock,
} from '../../types/chatbot-blocks';
import type {
  PatientChatbotHistoryJourneySnapshot,
  PatientChatbotHistoryResourceDescriptor,
  PatientChatbotHistoryResourceType,
} from '@/services/api/patient-chatbot';

const suppressedInlineResourceTypes = new Set<PatientChatbotHistoryResourceType>([
  'HUMAN_HANDOFF',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function getStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const strings = value.filter((item): item is string => typeof item === 'string' && item.length > 0);
  return strings.length > 0 ? strings : undefined;
}

function getPayloadRecord(resource: PatientChatbotHistoryResourceDescriptor): Record<string, unknown> {
  return isRecord(resource.payload) ? resource.payload : {};
}

function getPayloadString(resource: PatientChatbotHistoryResourceDescriptor, key: string): string | undefined {
  return getString(getPayloadRecord(resource)[key]);
}

function getRecordString(record: Record<string, unknown>, key: string): string | undefined {
  return getString(record[key]);
}

function getRecordStringArray(record: Record<string, unknown>, key: string): string[] | undefined {
  return getStringArray(record[key]);
}

function buildProcessGuideBlock(resource: PatientChatbotHistoryResourceDescriptor): ProcessModalTriggerBlock | null {
  const title = getPayloadString(resource, 'title');

  if (!title) {
    return null;
  }

  const description = getPayloadString(resource, 'description');
  const ctaLabel = getPayloadString(resource, 'ctaLabel');

  return {
    id: resource.resourceId,
    type: 'PROCESS_MODAL_TRIGGER',
    modalKey: 'MEDICAL_TRAVEL_PROCESS',
    title,
    ...(description ? { description } : {}),
    ...(ctaLabel ? { ctaLabel } : {}),
  };
}

function buildQuestionnaireBlock(resource: PatientChatbotHistoryResourceDescriptor): QuestionnaireModalTriggerBlock | null {
  const title = getPayloadString(resource, 'title');
  const templateId = getPayloadString(resource, 'templateId');

  if (!title || !templateId) {
    return null;
  }

  const description = getPayloadString(resource, 'description');
  const ctaLabel = getPayloadString(resource, 'ctaLabel');

  return {
    id: resource.resourceId,
    type: 'QUESTIONNAIRE_MODAL_TRIGGER',
    templateId,
    title,
    ...(description ? { description } : {}),
    ...(ctaLabel ? { ctaLabel } : {}),
  };
}

function buildHospitalRecommendationBlock(
  resource: PatientChatbotHistoryResourceDescriptor,
  _caseIdFallback?: string | null,
): HospitalRecommendationCardsBlock | null {
  const title = getPayloadString(resource, 'title');
  const caseId = getPayloadString(resource, 'caseId');
  const selectPath = getPayloadString(resource, 'selectPath');
  const rawHospitals = getPayloadRecord(resource).hospitals;

  if (!title || !caseId || !selectPath || !Array.isArray(rawHospitals)) {
    return null;
  }

  const hospitals = rawHospitals
    .filter(isRecord)
    .map((hospital): HospitalRecommendationItem | null => {
      const hospitalId = getRecordString(hospital, 'hospitalId');

      if (!hospitalId) {
        return null;
      }

      const name = getRecordString(hospital, 'name');
      const reason = getRecordString(hospital, 'reason');
      const summary = getRecordString(hospital, 'summary');
      const ctaUrl = getRecordString(hospital, 'ctaUrl');
      const thumbnailUrl = getRecordString(hospital, 'thumbnailUrl');
      const thumbnailFallbackUrls = getRecordStringArray(hospital, 'thumbnailFallbackUrls');
      const slug = getRecordString(hospital, 'slug');
      const city = getRecordString(hospital, 'city');
      const matchType = getRecordString(hospital, 'matchType');
      const reasonCodes = getRecordStringArray(hospital, 'reasonCodes');

      return {
        hospitalId,
        ...(name ? { name } : {}),
        ...(reason ? { reason } : {}),
        ...(summary ? { summary } : {}),
        ...(ctaUrl ? { ctaUrl } : {}),
        ...(thumbnailUrl ? { thumbnailUrl } : {}),
        ...(thumbnailFallbackUrls ? { thumbnailFallbackUrls } : {}),
        ...(slug ? { slug } : {}),
        ...(city ? { city } : {}),
        ...(matchType ? { matchType } : {}),
        ...(reasonCodes ? { reasonCodes } : {}),
      };
    })
    .filter((hospital): hospital is HospitalRecommendationItem => hospital !== null);

  if (hospitals.length === 0) {
    return null;
  }

  const description = getPayloadString(resource, 'description');

  return {
    id: resource.resourceId,
    type: 'HOSPITAL_RECOMMENDATION_CARDS',
    title,
    caseId,
    selectPath: selectPath as '/select-hospitals',
    hospitals,
    ...(description ? { description } : {}),
  };
}

function buildOnlineConsultBlock(resource: PatientChatbotHistoryResourceDescriptor): OnlineConsultBookingCardBlock | null {
  const title = getPayloadString(resource, 'title');
  const convertPath = getPayloadString(resource, 'convertPath');
  const requestedAction = getPayloadString(resource, 'requestedAction');
  const conversionDraft = getPayloadRecord(resource).conversionDraft;

  if (!title || !convertPath || requestedAction !== 'INVITE_ONLINE_CONSULT' || !isRecord(conversionDraft)) {
    return null;
  }

  const sessionId = getRecordString(conversionDraft, 'sessionId');
  const name = getRecordString(conversionDraft, 'name');
  const email = getRecordString(conversionDraft, 'email');
  const country = getRecordString(conversionDraft, 'country');
  const conditionSummary = getRecordString(conversionDraft, 'conditionSummary');
  const budget = getRecordString(conversionDraft, 'budget');

  if (!sessionId || !name || !email || !country || !conditionSummary || !budget) {
    return null;
  }

  const consultationStatus = getPayloadString(resource, 'consultationStatus');
  const description = getPayloadString(resource, 'description');

  return {
    id: resource.resourceId,
    type: 'ONLINE_CONSULT_BOOKING_CARD',
    title,
    convertPath,
    requestedAction: 'INVITE_ONLINE_CONSULT',
    ...(resource.status === 'submitted' || resource.status === 'failed'
      ? { requestState: resource.status }
      : {}),
    conversionDraft: {
      sessionId,
      name,
      email,
      country,
      conditionSummary,
      budget,
    },
    ...(consultationStatus ? { consultationStatus } : {}),
    ...(description ? { description } : {}),
  };
}

export function buildLegacyBlockFromHistoryResource(
  resource: PatientChatbotHistoryResourceDescriptor,
  caseIdFallback?: string | null,
): ChatbotMessageBlock | null {
  switch (resource.resourceType) {
    case 'PROCESS_GUIDE':
      return buildProcessGuideBlock(resource);
    case 'QUESTIONNAIRE':
      return buildQuestionnaireBlock(resource);
    case 'HOSPITAL_RECOMMENDATION':
      return buildHospitalRecommendationBlock(resource, caseIdFallback);
    case 'ONLINE_CONSULT_BOOKING':
      return buildOnlineConsultBlock(resource);
    default:
      return null;
  }
}

function LegacyResourceShell({ resource }: { resource: PatientChatbotHistoryResourceDescriptor }) {
  const title = getPayloadString(resource, 'title') ?? resource.resourceType;

  return (
    <div
      data-history-resource-id={resource.resourceId}
      data-history-resource-status={resource.status}
      data-history-resource-type={resource.resourceType}
    >
      {title}
    </div>
  );
}

function UnknownResourceShell({ resource }: { resource: PatientChatbotHistoryResourceDescriptor }) {
  const title = getPayloadString(resource, 'title') ?? 'Unsupported resource';

  return (
    <div
      data-history-resource-id={resource.resourceId}
      data-history-resource-status={resource.status}
      data-history-resource-type="UNKNOWN"
    >
      {title}
    </div>
  );
}

function renderLegacyResource(
  resource: PatientChatbotHistoryResourceDescriptor,
  ctx: PatientEntryContextValue | undefined,
): ReactNode {
  if (suppressedInlineResourceTypes.has(resource.resourceType)) {
    return null;
  }

  switch (resource.resourceType) {
    case 'PROCESS_GUIDE': {
      const block = buildProcessGuideBlock(resource);
      return block ? (
        <ProcessModalTrigger
          block={block}
          historyResourceId={resource.resourceId}
          historyResourceStatus={resource.status}
        />
      ) : <LegacyResourceShell resource={resource} />;
    }
    case 'QUESTIONNAIRE': {
      const block = buildQuestionnaireBlock(resource);
      return block
        ? (
          <QuestionnaireModalTrigger
            block={block}
            onOpen={ctx?.requestQuestionnaireTemplate}
            historyResourceId={resource.resourceId}
            historyResourceStatus={resource.status}
          />
        )
        : <LegacyResourceShell resource={resource} />;
    }
    case 'HOSPITAL_RECOMMENDATION': {
      const block = buildHospitalRecommendationBlock(resource, ctx?.caseId);

      if (!block) {
        return <LegacyResourceShell resource={resource} />;
      }

      const onSubmitSelection = ctx?.submitHospitalSelection
        ? (hospitalIds: string[], customHospitalRequest?: string) =>
            ctx.submitHospitalSelection(block.caseId, hospitalIds, customHospitalRequest)
        : undefined;

      return (
        <HospitalRecommendationCards
          block={block}
          onSubmitSelection={onSubmitSelection}
          historyResourceId={resource.resourceId}
          historyResourceStatus={resource.status}
        />
      );
    }
    case 'ONLINE_CONSULT_BOOKING': {
      const block = buildOnlineConsultBlock(resource);
      return block ? (
        <OnlineConsultBookingCard
          block={block}
          onSubmit={ctx?.requestConsultConversion}
          historyResourceId={resource.resourceId}
          historyResourceStatus={resource.status}
        />
      ) : <LegacyResourceShell resource={resource} />;
    }
    case 'MEDICAL_DOC_UPLOAD':
    case 'PACKAGE_RECOMMENDATION':
      return <LegacyResourceShell resource={resource} />;
    default:
      return <UnknownResourceShell resource={resource} />;
  }
}

interface PatientChatLegacyResourcesProps {
  resources: PatientChatbotHistoryResourceDescriptor[];
  journeySnapshot?: PatientChatbotHistoryJourneySnapshot;
}

export function PatientChatLegacyResources({
  resources,
  journeySnapshot,
}: PatientChatLegacyResourcesProps) {
  const ctx = useContext(PatientEntryContext);
  const visibleResources = resources.filter((resource) => !suppressedInlineResourceTypes.has(resource.resourceType));

  if (visibleResources.length === 0) {
    return null;
  }

  return (
    <div
      className="mb-2 flex flex-col gap-2"
      data-history-stage={journeySnapshot?.currentStage}
      data-history-phase={journeySnapshot?.currentPhase}
    >
      {visibleResources.map((resource) => (
        <div key={resource.resourceId}>
          {renderLegacyResource(resource, ctx)}
        </div>
      ))}
    </div>
  );
}
