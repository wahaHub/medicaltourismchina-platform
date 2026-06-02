# Backend-Owned Chatbot State Machine Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the MedicalTourismChina patient widget from frontend-owned mechanical chat state to a CRM API-owned chat orchestrator that can switch between mechanical, AI, and human modes while writing all user, bot, and attachment events into message history.

**Architecture:** The CRM v2 API becomes the chat state authority. The platform frontend renders backend-provided `messages`, `availableActions`, and `composerPolicy`; it no longer owns business state via local reducer turns. File uploads use `clientMessageId`/`serverMessageId` reconciliation and must create both a conversation attachment message and a case document record.

**Tech Stack:** TypeScript, Hono, pnpm/turbo, Drizzle-backed CRM repositories, React/Vite/Vitest, Vercel proxy to `crmapi.medicaltourismchina.health`.

---

## Repositories

- Platform frontend repo: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform`
- CRM API repo: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2`

## Source Spec

- `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/docs/superpowers/specs/2026-06-02-backend-owned-chatbot-state-machine-design.md`

## Existing Code Map

### CRM API

- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2/apps/api/src/routes/patient-protected.routes.ts`
- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2/apps/api/src/composition-root.ts`
- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2/packages/application/src/dtos/patient-conversation.dto.ts`
- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2/packages/application/src/use-cases/patient-dashboard/get-patient-session-detail.use-case.ts`
- Create: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2/packages/application/src/use-cases/patient-chat/resolve-patient-chat-state.use-case.ts`
- Create: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2/packages/application/src/use-cases/patient-chat/handle-patient-chat-event.use-case.ts`
- Create: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2/packages/application/src/use-cases/patient-chat/patient-chat-actions.ts`
- Create: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2/packages/application/src/use-cases/patient-chat/patient-chat-i18n.ts`
- Create: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2/packages/application/src/use-cases/patient-chat/patient-chat-message-writer.ts`
- Create migration under `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2/packages/infrastructure/database/migrations/` for `ai_chat_sessions.automation_mode`, message `client_message_id`, upload `delivery_status`, and message `metadata`
- Modify CRM Drizzle schema files under `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2/packages/infrastructure/database/` for the new columns/indexes
- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2/packages/domain/src/entities/ai-chat-session.entity.ts`
- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2/packages/domain/src/entities/message.entity.ts`
- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2/packages/domain/src/ports/message-repository.port.ts`
- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2/packages/infrastructure/database/repositories/drizzle-message.repository.ts`
- Create or modify tests under `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2/packages/application/__tests__/patient-chat/`
- Create or modify route tests under `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2/apps/api/src/__tests__/patient-chat-events.routes.test.ts`

### Platform Frontend

- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/services/api/patient-messages.ts`
- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/components/chat/PatientEntryWindow.tsx`
- Modify: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/components/chat/PatientChatComposer.tsx`
- Modify or replace: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/components/chat/MechanicalChatMenu.tsx`
- Delete or demote: `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/components/chat/mechanical-chat-state-machine.ts`
- Modify tests under `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/components/chat/__tests__/`
- Modify tests under `/Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel/src/services/api/__tests__/`

## Chunk 1: CRM API Chat Orchestrator

### Task 1: Add backend chat state DTOs and derived actions

**Files:**
- Modify: `packages/application/src/dtos/patient-conversation.dto.ts`
- Create: `packages/application/src/use-cases/patient-chat/patient-chat-actions.ts`
- Create: `packages/application/src/use-cases/patient-chat/patient-chat-i18n.ts`
- Test: `packages/application/__tests__/patient-chat/resolve-patient-chat-state.use-case.test.ts`

- [ ] **Step 1: Write failing DTO/action tests**

Create tests that assert:

- care-team `AI_ACTIVE` maps to `botMode: 'mechanical'` only when the session is the patient widget session and backend mechanical flow is enabled.
- care-team `AI_ACTIVE` maps to `botMode: 'ai'` when backend automation mode is explicitly set to AI.
- `availableActions` is derived, not stored.
- `human` mode returns no mechanical automatic actions.
- locale changes action labels between `en` and `zh`.

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2
pnpm --filter @medical-crm/application test -- patient-chat
```

Expected: FAIL because the use case and DTO fields do not exist.

- [ ] **Step 2: Extend patient session DTOs**

Add fields to `PatientSessionSummaryDTO` and `PatientSessionDetailDTO`:

```ts
export type PatientBotMode = 'mechanical' | 'ai' | 'human';

export interface PatientChatActionDTO {
  id: 'VIEW_PROCESS' | 'UPLOAD_RECORDS' | 'CONTACT_ADVISOR' | 'OPEN_QUESTIONNAIRE';
  label: string;
  icon?: string;
  disabled?: boolean;
}

export interface PatientComposerPolicyDTO {
  textEnabled: boolean;
  attachmentsEnabled: boolean;
  sendEnabledWhen: 'text_or_attachment' | 'attachment_only' | 'disabled';
  placeholder: string;
}

export interface PatientChatUiCommandDTO {
  type: 'OPEN_FILE_PICKER' | 'OPEN_QUESTIONNAIRE_MODAL' | 'NONE';
  actionId?: PatientChatActionDTO['id'];
}

export interface PatientChatStateDTO {
  botMode: PatientBotMode;
  availableActions: PatientChatActionDTO[];
  composerPolicy: PatientComposerPolicyDTO;
}

export interface PatientChatEventResponseDTO extends PatientSessionDetailDTO {
  uiCommands?: PatientChatUiCommandDTO[];
}
```

Add optional `chatState?: PatientChatStateDTO` to session summary/detail DTOs.

- [ ] **Step 3: Implement action derivation**

Create `patient-chat-actions.ts` with a pure function:

```ts
export function resolvePatientChatState(input: {
  sessionId: string;
  sessionType: 'CARE_TEAM' | 'HOSPITAL';
  isWidgetSession: boolean;
  mechanicalFlowEnabled: boolean;
  assistantMode: 'AI_ACTIVE' | 'HUMAN_TAKEOVER' | null;
  automationMode: 'mechanical' | 'ai' | null;
  locale: 'en' | 'zh';
  processGuideConfirmed: boolean;
  questionnaireSubmitted: boolean;
  advisorRequested: boolean;
  medicalRecordsUploaded: boolean;
}): PatientChatStateDTO {
  // CARE_TEAM + AI_ACTIVE maps to mechanical for this migration.
  // HUMAN_TAKEOVER maps to human.
  // Hospital sessions map to human.
}
```

Rules:

- `CARE_TEAM + AI_ACTIVE + isWidgetSession + mechanicalFlowEnabled + automationMode = 'mechanical'` returns `botMode = 'mechanical'`.
- `CARE_TEAM + AI_ACTIVE + automationMode = 'ai'` returns `botMode = 'ai'`.
- If `automationMode` is absent for the current MedicalTourismChina widget flow, default to `mechanical` only for widget care-team sessions with `mechanicalFlowEnabled = true`.
- `CARE_TEAM + HUMAN_TAKEOVER` returns `botMode = 'human'`.
- non-widget care-team sessions default to `ai` or `human` according to existing CRM product rules; they must not silently enter the mechanical menu.
- hospital sessions return `botMode = 'human'`.
- mechanical idle actions are derived from flags.
- `availableActions` is never persisted.

Persist `automationMode` as a backend fact, not as frontend state. For the current CRM v2 codebase, implement this as a concrete `ai_chat_sessions.automation_mode` column instead of trying to tuck the value into `statusSnapshot`: the current `AiChatStatusSnapshot` type has no `chatBotMode` or `automationMode` field, and repository `patchStatus` is typed around known snapshot fields.

Required backend persistence work:

- add migration column `ai_chat_sessions.automation_mode text not null default 'mechanical'`;
- constrain values to `mechanical`, `ai`, `human` if the current migration style supports check constraints;
- update Drizzle schema mapping;
- update `AiChatSession` entity props/type;
- update `IAiChatSessionRepository` and Drizzle repository methods needed to read and update automation mode;
- update tests so `BOT_MODE_CHANGED` persists through a fresh repository read.

- [ ] **Step 4: Add i18n copy registry**

Create `patient-chat-i18n.ts` with a small typed copy map for:

- action labels
- upload prompt
- upload success/failure
- process guide confirmed/dismissed
- advisor handoff
- questionnaire opened/submitted
- composer placeholder

Do not import frontend i18n. Backend owns the authoritative messages it writes.

- [ ] **Step 5: Run focused tests**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2
pnpm --filter @medical-crm/application test -- patient-chat
```

Expected: PASS.

### Task 2: Return backend chat state from session detail/list APIs

**Files:**
- Modify: `packages/application/src/use-cases/patient-dashboard/get-patient-session-detail.use-case.ts`
- Modify: `packages/application/src/use-cases/patient-dashboard/get-patient-conversations.use-case.ts`
- Modify: `apps/api/src/routes/patient-protected.routes.ts`
- Test: `packages/application/__tests__/get-patient-session-detail.use-case.test.ts`
- Test: `packages/application/__tests__/patient-protected-use-cases.test.ts` if existing coverage fits

- [ ] **Step 1: Write failing tests**

Assert `GET /api/patient/sessions/:sessionId/messages?locale=en` returns:

```json
{
  "chatState": {
    "botMode": "mechanical",
    "availableActions": [{ "id": "VIEW_PROCESS" }],
    "composerPolicy": {
      "textEnabled": false,
      "attachmentsEnabled": true,
      "sendEnabledWhen": "attachment_only"
    }
  }
}
```

Also assert `HUMAN_TAKEOVER` returns `botMode = "human"` and no mechanical actions.

- [ ] **Step 2: Thread locale through patient session detail**

Update input:

```ts
export interface GetPatientSessionDetailInput {
  patientId: string;
  sessionId: string;
  site: PatientSite;
  limit?: number;
  locale?: 'en' | 'zh';
}
```

Parse locale in `patient-protected.routes.ts` from query, defaulting to site/patient preference if available, otherwise `en`.

- [ ] **Step 3: Attach chatState in care-team detail**

In `getCareTeamSessionDetail`, derive flags from `aiSession.statusSnapshot` where possible:

- `processGuideConfirmed`: `statusSnapshot.processExplained === true`
- `medicalRecordsUploaded`: support document count or formal attachment messages > 0
- `questionnaireSubmitted`: case/QC response status if available later; default false for this task
- `advisorRequested`: metadata or assistant mode human; default `assistantMode === 'HUMAN_TAKEOVER'`

Use conservative defaults. Do not block this task on perfect questionnaire detection.

- [ ] **Step 4: Attach chatState in conversation list**

For `GetPatientConversationsUseCase`, include `chatState` summary for care-team rows only. Hospital rows should return human policy or omit actions.

- [ ] **Step 5: Run focused API/application tests**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2
pnpm --filter @medical-crm/application test -- get-patient-session-detail patient
pnpm --filter @medical-crm/api test -- patient-protected
```

Expected: PASS.

### Task 3: Add `/sessions/:sessionId/chat/events`

**Files:**
- Create: `packages/application/src/use-cases/patient-chat/handle-patient-chat-event.use-case.ts`
- Create: `packages/application/src/use-cases/patient-chat/patient-chat-message-writer.ts`
- Modify: `apps/api/src/routes/patient-protected.routes.ts`
- Modify: `apps/api/src/routes/conversations.routes.ts` or the existing admin conversation-mode route for admin/system bot-mode changes
- Modify: `apps/api/src/composition-root.ts`
- Modify: `packages/shared/validation/src/patient.schema.ts`
- Test: `packages/application/__tests__/patient-chat/handle-patient-chat-event.use-case.test.ts`
- Test: `apps/api/src/__tests__/patient-chat-events.routes.test.ts`

- [ ] **Step 1: Write failing use-case tests**

Cover:

- `ACTION_SELECTED + VIEW_PROCESS` writes a patient action message and mechanical rich-card/system message.
- `PROCESS_GUIDE_CONFIRMED` patches `aiChatSession.statusSnapshot.processExplained = true` and writes completion message.
- `CONTACT_ADVISOR` writes handoff request and switches admin patient conversation to `HUMAN_TAKEOVER` or returns `botMode = human`.
- admin/system `BOT_MODE_CHANGED` can switch `automationMode` between `mechanical` and `ai`, writes a history notice, and returns fresh `chatState`.
- `botMode = ai` routes text events through the existing CRM AI chatbot service/use case, then writes both the user message and AI reply into the same patient-visible history.
- `botMode = human` does not generate automatic replies.
- duplicate `clientMessageId` does not create duplicate messages.
- patient-authenticated routes reject admin/system-only events such as `BOT_MODE_CHANGED` and `ADMIN_TAKEOVER_STARTED`.

- [ ] **Step 2: Add validation schema**

Add to `packages/shared/validation/src/patient.schema.ts`:

```ts
export const patientChatEventSchema = z.object({
  eventType: z.enum([
    'ACTION_SELECTED',
    'PROCESS_GUIDE_CONFIRMED',
    'PROCESS_GUIDE_DISMISSED',
    'ADVISOR_HANDOFF_REQUESTED',
    'QUESTIONNAIRE_OPENED',
    'QUESTIONNAIRE_SUBMITTED',
    'ATTACHMENT_UPLOAD_STARTED',
    'ATTACHMENT_UPLOAD_COMPLETED',
    'ATTACHMENT_UPLOAD_FAILED',
    'TEXT_MESSAGE_SUBMITTED',
    'BOT_MODE_CHANGED',
    'ADMIN_TAKEOVER_STARTED',
  ]),
  actionKey: z.enum(['VIEW_PROCESS', 'UPLOAD_RECORDS', 'CONTACT_ADVISOR', 'OPEN_QUESTIONNAIRE']).optional(),
  clientMessageId: z.string().min(1).max(120).optional(),
  serverMessageId: z.string().min(1).max(120).optional(),
  locale: z.enum(['en', 'zh']).default('en'),
  payload: z.record(z.unknown()).optional(),
});
```

- [ ] **Step 3: Add persistent message reconciliation metadata**

Before implementing the writer, verify whether the current CRM `Message` persistence layer can store all required facts:

- `clientMessageId`
- `serverMessageId`/message id mapping
- `source` such as `mechanical_bot`, `ai_bot`, `patient`, `care_team`
- `contentType` such as `text`, `action`, `attachment`, `rich_card`
- upload delivery status: `uploading`, `sent`, `failed`
- structured metadata for rich cards, action keys, document ids, and storage keys

The current branch's domain `Message` entity only exposes content/type/attachments and does not expose a first-class metadata or delivery-status field. If the underlying DB schema has no unused JSON/status columns, add a narrow migration and repository mapping instead of encoding these facts only inside human-readable `content`.

Preferred migration shape:

```sql
ALTER TABLE messages ADD COLUMN client_message_id text;
ALTER TABLE messages ADD COLUMN delivery_status text;
ALTER TABLE messages ADD COLUMN metadata jsonb;
CREATE UNIQUE INDEX messages_conversation_client_message_id_idx
  ON messages(conversation_id, client_message_id)
  WHERE client_message_id IS NOT NULL;
```

If the project uses different column names or non-Postgres schema helpers, implement the equivalent through the existing migration style. The unique index is required for idempotent upload init and double-click protection. Tests must prove repeated `clientMessageId` returns the same message instead of creating a duplicate.

Required repository/API changes:

- extend `Message` entity props with `clientMessageId?: string | null`, `deliveryStatus?: 'pending' | 'uploading' | 'sent' | 'failed' | null`, and `metadata?: Record<string, unknown>`;
- extend `IMessageRepository` with:

```ts
findByConversationClientMessageId(conversationId: string, clientMessageId: string, tx?: Transaction): Promise<Message | null>;
createPendingAttachmentMessage(input: {
  conversationId: string;
  patientId: string;
  clientMessageId: string;
  content: string;
  attachments: Attachment[];
  metadata: Record<string, unknown>;
}, tx?: Transaction): Promise<Message>;
updateDeliveryStatus(messageId: string, status: 'uploading' | 'sent' | 'failed', metadataPatch?: Record<string, unknown>, tx?: Transaction): Promise<Message>;
updateMetadata(messageId: string, metadataPatch: Record<string, unknown>, tx?: Transaction): Promise<Message>;
```

- implement those methods in `DrizzleMessageRepository`;
- make `createPendingAttachmentMessage` idempotent by calling `findByConversationClientMessageId` first inside the same transaction when possible;
- expose new fields through message DTO mappers so the frontend can reconcile optimistic blocks.

- [ ] **Step 4: Implement message writer**

Create helper functions that save formal conversation messages with metadata in a way the patient detail API can read back reliably. Human-readable `content` can contain fallback copy, but it must not be the only place where `clientMessageId`, upload status, action id, source, or document id are stored. If Step 3 added message metadata/status columns, the writer must populate them and the mapper must expose them through `PatientSessionMessageDTO`.

Required writer functions:

```ts
writePatientActionMessage(input)
writeMechanicalMessage(input)
writeAttachmentStatusMessage(input)
```

Messages should use:

- `senderRoleOverride: 'SYSTEM'` for mechanical assistant/system messages where appropriate.
- `senderRole: 'PATIENT'` and `senderId = patientId` for user actions.
- `moderationStatus: 'ALLOWED'`.
- metadata fields from Step 3 whenever present.

- [ ] **Step 5: Implement event use case**

`HandlePatientChatEventUseCase.execute` should:

1. Resolve formal admin patient conversation from `sessionId`.
2. Load current chat state.
3. Reject mechanical automatic events for hospital sessions.
4. Handle event based on current `botMode`.
5. For `botMode = mechanical`, use deterministic mechanical handlers.
6. For `botMode = ai`, call a reusable AI service/use case directly. Do not call the existing Hono route from inside the use case.
7. For `botMode = human`, write patient/user events only and generate no automatic reply.
8. Write required history messages.
9. Return fresh session detail with `chatState` and any one-shot `uiCommands`.

- [ ] **Step 6: Add patient Hono route**

Add:

```ts
app.post('/sessions/:sessionId/chat/events', async (c) => {
  const body = patientChatEventSchema.parse(await c.req.json());
  if (body.eventType === 'BOT_MODE_CHANGED' || body.eventType === 'ADMIN_TAKEOVER_STARTED') {
    throw new ForbiddenError('This chat event can only be performed by CRM staff');
  }
  const session = c.get('patientSession');
  const site = c.get('patientSite');
  const result = await getServices().handlePatientChatEvent.execute({
    patientId: session.userId,
    sessionId: c.req.param('sessionId'),
    site,
    ...body,
  });
  return c.json(result);
});
```

Broadcast new messages to `conv:${sessionId}` after successful event handling.

- [ ] **Step 7: Add admin/system mode-switch entrypoint**

Add an admin-authenticated route or extend the existing conversation assistant-mode route so staff/system jobs can switch automation mode without going through the patient endpoint.

Required behavior:

- switching `mechanical -> ai` stores backend `automationMode = 'ai'`;
- switching `ai -> mechanical` stores backend `automationMode = 'mechanical'`;
- switching to human handoff uses the existing `assistantMode = 'HUMAN_TAKEOVER'` authority and writes a `BOT_MODE_CHANGED` or takeover notice into history;
- every switch writes a message-history entry with `source = 'system'` and old/new mode metadata;
- patient route tests prove the same event is forbidden from patient auth.

If the existing CRM admin UI is not updated in this implementation, expose the backend route and document how to call it; do not fake mode switching in the frontend widget.

- [ ] **Step 8: Wire composition root**

Instantiate:

```ts
handlePatientChatEvent: new HandlePatientChatEventUseCase(...)
```

Use existing repos/use cases:

- `conversationRepo`
- `messageRepo`
- `aiChatSessionRepo`
- `sendMessage` if appropriate
- existing chatbot/conversation orchestrator service for AI mode, if available
- `uploadDocument` for attachment completion later
- `getPatientSessionDetail`
- `txRunner`

- [ ] **Step 9: Run tests**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2
pnpm --filter @medical-crm/application test -- patient-chat
pnpm --filter @medical-crm/api test -- patient-chat-events patient-protected
```

Expected: PASS.

### Task 4: Reconcile attachment upload with message history and case documents

**Files:**
- Modify: `apps/api/src/routes/patient-protected.routes.ts`
- Modify: `packages/application/src/use-cases/patient-chat/handle-patient-chat-event.use-case.ts`
- Modify: `packages/application/src/use-cases/patient-chat/patient-chat-message-writer.ts`
- Possibly modify: `packages/application/src/use-cases/documents/upload-document.use-case.ts` only if patient actor support is missing
- Test: `packages/application/__tests__/patient-chat/handle-patient-chat-event.use-case.test.ts`
- Test: `apps/api/src/__tests__/patient-chat-events.routes.test.ts`

- [ ] **Step 1: Write failing upload tests**

Cover:

- upload init with `clientMessageId` creates or finds pending attachment message and returns `serverMessageId`.
- repeated upload init with same `clientMessageId` returns same `serverMessageId`.
- `ATTACHMENT_UPLOAD_COMPLETED` marks same message as sent and creates a case document record.
- the completed message metadata stores `documentId`, `storageKey`, and `clientMessageId` so message history and case documents can be correlated.
- completed event fails if case document creation fails.
- `ATTACHMENT_UPLOAD_FAILED` marks same message failed and writes retry message.

- [ ] **Step 2: Extend upload init schema**

Add optional `clientMessageId` and `locale`:

```ts
const messageUploadInitSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
  clientMessageId: z.string().min(1).max(120).optional(),
  locale: z.enum(['en', 'zh']).optional(),
});
```

- [ ] **Step 3: Change mechanical upload init behavior**

For care-team `AI_ACTIVE` sessions:

- old `mode=mechanical` remains temporarily allowed.
- if `clientMessageId` exists, create/find pending message before returning.
- response includes:

```json
{
  "upload": { "uploadUrl": "...", "storageKey": "...", "expiresIn": 900 },
  "asset": { "fileName": "...", "mimeType": "...", "fileSize": 123, "storageKey": "..." },
  "message": {
    "clientMessageId": "client-...",
    "serverMessageId": "msg-...",
    "status": "uploading"
  }
}
```

- [ ] **Step 4: Complete event creates case document**

On `ATTACHMENT_UPLOAD_COMPLETED`, call `UploadDocumentUseCase.execute` with:

```ts
await uploadDocument.execute({
  caseId,
  fileName,
  fileSize,
  mimeType,
  documentType: 'OTHER',
  sensitivity: 'PHI_HIGH',
  language: locale,
  storageKey,
}, {
  role: 'PATIENT',
  userId: patientId,
})
```

The current CRM enums do not have a dedicated `MESSAGE_ATTACHMENT` document type or `MEDICAL` sensitivity. Use the current valid defaults above for patient-uploaded medical records:

- `documentType: 'OTHER'`
- `sensitivity: 'PHI_HIGH'`

Do not add enum values for this migration unless product explicitly asks for finer document typing.

After `UploadDocumentUseCase.execute` returns `{ documentId }`, update the same attachment message identified by `serverMessageId`/`clientMessageId`:

- `deliveryStatus = 'sent'`
- `attachments = [asset]`
- `metadata.documentId = documentId`
- `metadata.storageKey = storageKey`
- `metadata.source = 'patient'`
- `metadata.contentType = 'attachment'`

If message update and document creation cannot be done atomically with the current repositories, wrap them in the existing transaction runner or explicitly document and test the compensating behavior. Do not leave a path where the file appears in case documents but the chat message remains permanently `uploading`.

- [ ] **Step 5: Do not show completion on file picker cancel**

No backend event should be sent for file picker cancel. The route should not create a message unless upload init is called.

- [ ] **Step 6: Run focused tests**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2
pnpm --filter @medical-crm/application test -- patient-chat
pnpm --filter @medical-crm/api test -- patient-chat-events patient-protected
```

Expected: PASS.

### Task 5: Backend compatibility cleanup guardrails

**Files:**
- Modify: `apps/api/src/routes/patient-protected.routes.ts`
- Test: `apps/api/src/__tests__/patient-protected.routes.test.ts`

- [ ] **Step 1: Write tests for old paths**

Assert:

- `POST /sessions/:id/messages?mode=mechanical` still rejects free text while `AI_ACTIVE`.
- `POST /sessions/:id/messages?mode=mechanical` still allows attachment-only during compatibility period.
- `POST /sessions/:id/process-confirmation` internally behaves the same as `PROCESS_GUIDE_CONFIRMED`.

- [ ] **Step 2: Mark old paths as compatibility shims**

Add comments and route-level structure that make deletion easy after frontend migration. Do not add new frontend dependencies on these paths.

- [ ] **Step 3: Run backend verification**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2
pnpm --filter @medical-crm/api test -- patient-protected patient-chat-events
pnpm --filter @medical-crm/application test -- patient-chat get-patient-session-detail
pnpm typecheck
```

Expected: PASS.

## Chunk 2: Platform Frontend Renderer Cleanup

### Task 6: Add frontend API client for chat events and new chat state DTOs

**Files:**
- Modify: `frontend-vercel/src/services/api/patient-messages.ts`
- Test: `frontend-vercel/src/services/api/__tests__/patient-messages.test.ts`

- [ ] **Step 1: Write failing API tests**

Assert:

- `sendChatEvent` posts to `/sessions/:sessionId/chat/events`.
- `initSessionAttachmentUpload` sends `clientMessageId` and no longer requires `mechanicalMode`.
- old `confirmProcessGuide` calls are replaced or become wrappers over `sendChatEvent`.

- [ ] **Step 2: Add DTO types**

Add:

```ts
export type PatientBotMode = 'mechanical' | 'ai' | 'human';
export type PatientChatActionId = 'VIEW_PROCESS' | 'UPLOAD_RECORDS' | 'CONTACT_ADVISOR' | 'OPEN_QUESTIONNAIRE';
export type PatientChatState = {
  botMode: PatientBotMode;
  availableActions: Array<{ id: PatientChatActionId; label: string; icon?: string; disabled?: boolean }>;
  composerPolicy: {
    textEnabled: boolean;
    attachmentsEnabled: boolean;
    sendEnabledWhen: 'text_or_attachment' | 'attachment_only' | 'disabled';
    placeholder: string;
  };
};
export type PatientChatUiCommand = {
  type: 'OPEN_FILE_PICKER' | 'OPEN_QUESTIONNAIRE_MODAL' | 'NONE';
  actionId?: PatientChatActionId;
};
export type PatientChatEventResponse = PatientSessionDetail & {
  uiCommands?: PatientChatUiCommand[];
};
```

Add `chatState?: PatientChatState` to session detail/list response types.

- [ ] **Step 3: Add `sendChatEvent`**

```ts
export async function sendChatEvent(input: {
  sessionId: string;
  eventType: string;
  actionKey?: string;
  clientMessageId?: string;
  serverMessageId?: string;
  locale?: string;
  payload?: Record<string, unknown>;
}): Promise<PatientChatEventResponse> {
  return crmApiRequest(`/sessions/${input.sessionId}/chat/events`, {
    method: 'POST',
    body: JSON.stringify({
      eventType: input.eventType,
      actionKey: input.actionKey,
      clientMessageId: input.clientMessageId,
      serverMessageId: input.serverMessageId,
      locale: input.locale,
      payload: input.payload ?? {},
    }),
  });
}
```

- [ ] **Step 4: Run frontend API tests**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
pnpm exec vitest run src/services/api/__tests__/patient-messages.test.ts
```

Expected: PASS.

### Task 7: Replace frontend mechanical reducer with backend action renderer

**Files:**
- Modify or replace: `frontend-vercel/src/components/chat/MechanicalChatMenu.tsx`
- Delete or demote: `frontend-vercel/src/components/chat/mechanical-chat-state-machine.ts`
- Modify: `frontend-vercel/src/components/chat/__tests__/PatientEntryWindow.mechanical-chat.test.tsx`
- Remove/replace: `frontend-vercel/src/components/chat/__tests__/mechanical-chat-state-machine.test.ts`

- [ ] **Step 1: Write failing renderer tests**

Assert:

- menu renders `detail.chatState.availableActions`.
- clicking `VIEW_PROCESS` calls `patientMessagesApi.sendChatEvent({ eventType: 'ACTION_SELECTED', actionKey: 'VIEW_PROCESS' })`.
- clicking upload action opens the file picker only when backend command/action says upload is available.
- menu does not keep local `turns`.

- [ ] **Step 2: Replace reducer-owned menu with renderer**

`MechanicalChatMenu` should accept:

```ts
type Props = {
  actions: PatientChatState['availableActions'];
  isBusy?: boolean;
  onActionSelected: (actionId: PatientChatActionId) => void;
};
```

It must not import `mechanical-chat-state-machine.ts`.

- [ ] **Step 3: Delete reducer tests**

Remove `mechanical-chat-state-machine.test.ts` once no code imports the reducer. If the file is kept as a UI helper, rename it to reflect that it is not a state machine and update tests accordingly.

- [ ] **Step 4: Run focused component tests**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
pnpm exec vitest run src/components/chat/__tests__/PatientEntryWindow.mechanical-chat.test.tsx
```

Expected: PASS.

### Task 8: Make `PatientEntryWindow` trust backend chat state

**Files:**
- Modify: `frontend-vercel/src/components/chat/PatientEntryWindow.tsx`
- Test: `frontend-vercel/src/components/chat/__tests__/PatientEntryWindow.mechanical-chat.test.tsx`
- Test: `frontend-vercel/src/components/chat/__tests__/PatientEntryWindow.rich-blocks.test.tsx`

- [ ] **Step 1: Write failing tests for frontend cleanup**

Assert:

- `AI_ACTIVE` alone no longer enables mechanical chat without `detail.chatState.botMode = 'mechanical'`.
- `detail.mechanicalChat.enabled` is ignored or treated only as legacy fallback behind a clearly named compatibility path.
- action bar derives from `detail.chatState.availableActions`.
- `confirmProcessGuide` is not called directly; process confirmation uses `sendChatEvent`.

- [ ] **Step 2: Remove local mechanical enablement**

Replace:

```ts
hasMechanicalChatFlag
shouldUseMechanicalFallback
isMechanicalChatEnabled = ... (hasMechanicalChatFlag || shouldUseMechanicalFallback)
```

with:

```ts
const chatState = detail?.chatState ?? null;
const isMechanicalChatEnabled = canShowFormalMessages
  && activeSession?.sessionKind === 'care-team'
  && detail?.sessionId === activeSessionId
  && chatState?.botMode === 'mechanical';
```

- [ ] **Step 3: Replace process confirmation handler**

Use:

```ts
await patientMessagesApi.sendChatEvent({
  sessionId: activeSessionId,
  eventType: 'PROCESS_GUIDE_CONFIRMED',
  locale: language,
});
await refreshActiveSession();
```

- [ ] **Step 4: Replace action handling**

`handleMechanicalActionSelected(actionId)` should:

- call `sendChatEvent(ACTION_SELECTED)`;
- if the returned `uiCommands` contains `OPEN_FILE_PICKER`, open composer file picker;
- if no `uiCommands` are returned, do not infer hidden business state from local turns; only map the visible backend action id `UPLOAD_RECORDS` to opening the file picker as a UI affordance after the backend accepts the action;
- refresh active session from returned detail or query invalidation.

- [ ] **Step 5: Remove completion/failure nonces**

Remove:

- `medicalRecordsUploadCompletionNonce`
- `medicalRecordsUploadFailureNonce`
- `handleMechanicalUploadFailed` as a menu state driver

Upload status should come from optimistic message mutation plus backend history refresh.

- [ ] **Step 6: Run focused tests**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
pnpm exec vitest run src/components/chat/__tests__/PatientEntryWindow.mechanical-chat.test.tsx src/components/chat/__tests__/PatientEntryWindow.rich-blocks.test.tsx
```

Expected: PASS.

### Task 9: Update composer upload flow for client/server message reconciliation

**Files:**
- Modify: `frontend-vercel/src/components/chat/PatientChatComposer.tsx`
- Modify: `frontend-vercel/src/services/api/patient-messages.ts`
- Test: `frontend-vercel/src/components/chat/__tests__/PatientChatComposer.attachments.test.tsx`

- [ ] **Step 1: Write failing upload tests**

Assert:

- selecting no file and closing picker does not emit a message or action event.
- selected file + send immediately inserts optimistic attachment block with `clientMessageId` and uploading status.
- upload init sends `clientMessageId`.
- upload completion sends `ATTACHMENT_UPLOAD_COMPLETED` with `clientMessageId`, `serverMessageId`, and asset data.
- upload failure sends `ATTACHMENT_UPLOAD_FAILED`, marks block failed, and restores actions after refresh.

- [ ] **Step 2: Replace `mechanicalMode` prop with `composerPolicy`**

Change props from:

```ts
mechanicalMode?: boolean;
```

to:

```ts
composerPolicy?: PatientChatState['composerPolicy'] | null;
botMode?: PatientBotMode | null;
```

`textEnabled`, `attachmentsEnabled`, and send rules must derive from `composerPolicy`.

- [ ] **Step 3: Generate client message ids**

Use a deterministic helper:

```ts
function createClientMessageId(): string {
  return `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
```

In tests, mock time/random where needed.

- [ ] **Step 4: Update upload init and completion**

Call:

```ts
const clientMessageId = createClientMessageId();
const uploadIntent = await patientMessagesApi.initSessionAttachmentUpload({
  sessionId,
  fileName,
  fileSize,
  mimeType,
  clientMessageId,
  locale: language,
});
```

After storage upload success:

```ts
await patientMessagesApi.sendChatEvent({
  sessionId,
  eventType: 'ATTACHMENT_UPLOAD_COMPLETED',
  clientMessageId,
  serverMessageId: uploadIntent.message?.serverMessageId,
  locale: language,
  payload: { attachments: [uploadIntent.asset] },
});
```

On failure:

```ts
await patientMessagesApi.sendChatEvent({
  sessionId,
  eventType: 'ATTACHMENT_UPLOAD_FAILED',
  clientMessageId,
  serverMessageId: uploadIntent.message?.serverMessageId,
  locale: language,
  payload: { errorCode: 'UPLOAD_FAILED', fileNames: selectedFiles.map((file) => file.name) },
});
```

- [ ] **Step 5: Keep proxy fallback**

Keep the existing `/api/patient/uploads/proxy` fallback for browser PUT failures. The fallback must still lead to the same completed/failed event.

- [ ] **Step 6: Run composer tests**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
pnpm exec vitest run src/components/chat/__tests__/PatientChatComposer.attachments.test.tsx
```

Expected: PASS.

### Task 10: Render backend-authored mechanical messages and actions

**Files:**
- Modify: `frontend-vercel/src/components/chat/PatientChatMessageList.tsx`
- Modify: `frontend-vercel/src/components/chat/ChatMessageBlocks.tsx`
- Modify: `frontend-vercel/src/components/chat/chat-widget-i18n.ts`
- Test: `frontend-vercel/src/components/chat/__tests__/PatientChatMessageList.rich-blocks.test.tsx`
- Test: `frontend-vercel/src/components/chat/__tests__/ChatMessageBlockActions.test.tsx`

- [ ] **Step 1: Write failing rendering tests**

Assert:

- backend mechanical message with `senderRole = SYSTEM` and rich card metadata renders as assistant/system bubble.
- attachment message status `uploading`, `sent`, `failed` renders correct icon/text.
- action buttons come from backend actions, not local reducer copy.

- [ ] **Step 2: Normalize backend messages**

If `PatientSessionMessage.metadata` carries `source = mechanical_bot`, map it to a visible assistant-style bubble. If backend only returns `messageType = SYSTEM`, ensure it is not hidden.

- [ ] **Step 3: Remove stale AI labels**

Ensure no text says `Care-team AI is still active for this session` in the widget UI. API errors should map to user-facing upload retry copy.

- [ ] **Step 4: Run rendering tests**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
pnpm exec vitest run src/components/chat/__tests__/PatientChatMessageList.rich-blocks.test.tsx src/components/chat/__tests__/ChatMessageBlockActions.test.tsx
```

Expected: PASS.

### Task 11: Remove old frontend mechanical state machine branches

**Files:**
- Delete or demote: `frontend-vercel/src/components/chat/mechanical-chat-state-machine.ts`
- Modify: `frontend-vercel/src/components/chat/MechanicalChatMenu.tsx`
- Modify: `frontend-vercel/src/components/chat/PatientEntryWindow.tsx`
- Modify: `frontend-vercel/src/components/chat/PatientChatComposer.tsx`
- Modify tests that referenced local reducer behavior

- [ ] **Step 1: Search for forbidden old patterns**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform
rg -n "mechanicalChatReducer|createInitialMechanicalChatState|medicalRecordsUploadCompletionNonce|medicalRecordsUploadFailureNonce|shouldUseMechanicalFallback|mechanicalMode|confirmProcessGuide" frontend-vercel/src
```

Expected before cleanup: matches exist.

- [ ] **Step 2: Delete or replace old imports**

Remove all business-level references. Acceptable remaining references:

- `confirmProcessGuide` only as a temporary API wrapper calling `sendChatEvent`, if kept for compatibility.
- `mechanicalMode` only in tests documenting old API compatibility, not in runtime UI.

- [ ] **Step 3: Run forbidden-pattern search again**

Run:

```bash
rg -n "mechanicalChatReducer|createInitialMechanicalChatState|medicalRecordsUploadCompletionNonce|medicalRecordsUploadFailureNonce|shouldUseMechanicalFallback|detail\\.mechanicalChat|hasMechanicalChatFlag|mechanicalMode|confirmProcessGuide" frontend-vercel/src
```

Expected: no runtime matches.

Allowed exceptions must be explicit and reviewed:

- `confirmProcessGuide` may remain only inside `frontend-vercel/src/services/api/patient-messages.ts` as a compatibility wrapper that calls `sendChatEvent`, or inside tests proving the wrapper is legacy-only.
- `mechanicalMode` may remain only inside tests for old API compatibility during the migration window. It must not appear in runtime component props, runtime branch conditions, or runtime API calls.
- `detail.mechanicalChat`, `hasMechanicalChatFlag`, and `shouldUseMechanicalFallback` must have zero matches.

- [ ] **Step 4: Run frontend suite slice**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
pnpm exec vitest run src/services/api/__tests__/patient-messages.test.ts src/components/chat/__tests__/PatientEntryWindow.mechanical-chat.test.tsx src/components/chat/__tests__/PatientChatComposer.attachments.test.tsx
npm run build
```

Expected: PASS.

## Chunk 3: End-to-End Verification and Deployment

### Task 12: Local integration smoke

**Files:**
- Modify or create: `scripts/README.md`
- Possibly modify: `scripts/deploy_platform.py`

- [ ] **Step 1: Document backend-owned chatbot deployment order**

Add a section to platform `scripts/README.md`:

1. deploy CRM API first;
2. verify `/api/patient/sessions/:id/messages` returns `chatState`;
3. deploy frontend;
4. run browser smoke.

- [ ] **Step 2: Run backend test set**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2
pnpm --filter @medical-crm/application test -- patient-chat get-patient-session-detail
pnpm --filter @medical-crm/api test -- patient-chat-events patient-protected
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 3: Run frontend test set**

Run:

```bash
cd /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform/frontend-vercel
pnpm exec vitest run src/services/api/__tests__/patient-messages.test.ts src/components/chat/__tests__/PatientEntryWindow.mechanical-chat.test.tsx src/components/chat/__tests__/PatientChatComposer.attachments.test.tsx src/components/chat/__tests__/PatientEntryWindow.rich-blocks.test.tsx
npm run build
```

Expected: PASS.

### Task 13: Browser QA

**Files:** no planned source edits unless QA finds a bug.

- [ ] **Step 1: Start local services**

Run CRM API and frontend locally using existing repo commands. If production CRM is used for frontend preview, set envs explicitly and avoid writing test data into production unless the user approves.

- [ ] **Step 2: Test patient widget states**

Use Browser plugin against local or deployed frontend:

- complete profile flow;
- verify backend returns mechanical mode;
- click each action;
- cancel upload picker and confirm no completed message appears;
- upload a small test file and confirm uploading -> sent;
- simulate upload failure and confirm failed state + retry copy;
- refresh and confirm history persists.

- [ ] **Step 3: Test CRM visibility**

In CRM/admin UI or API:

- uploaded file appears in message history;
- same file appears in case documents;
- ids/storage key can be correlated.

### Task 14: Review Until Clean and Commit

**Files:** all changed files in both repos.

- [ ] **Step 1: Freeze review scope**

Capture:

```bash
git -C /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2 status --short --branch
git -C /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform status --short --branch
git -C /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2 diff --stat
git -C /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform diff --stat
```

- [ ] **Step 2: Use `$review-until-clean`**

Dispatch reviewer with:

- original user requirement;
- design spec path;
- this plan path;
- both repo paths;
- exact files changed;
- verification commands and outputs.

Route findings through a separate receiver, fix only verified findings, and loop until reviewer says no meaningful findings remain.

- [ ] **Step 3: Self-audit**

Personally check:

- frontend has no business-level mechanical reducer;
- backend owns mode/actions/policy;
- no duplicate message risk in upload;
- human mode stops automatic replies;
- upload creates message and case document;
- all tests/builds listed above passed.

- [ ] **Step 4: Commit with detailed history**

Use `$detailed-commit-messages`.

Because this crosses two repos, commit separately:

```bash
git -C /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2 add <changed backend files>
git -C /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medical-crm-v2 commit

git -C /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform add <changed frontend/docs files>
git -C /Users/haowang/Desktop/medora-health-beauty/archive/external-projects/medicaltourismchina-platform commit
```

## Final Acceptance Criteria

- CRM API response includes `chatState.botMode`, derived `availableActions`, and `composerPolicy`.
- Frontend uses backend `chatState` only; it does not infer mechanical mode from `AI_ACTIVE`.
- Frontend old reducer/local turns/fallback completion nonce logic is gone.
- Mechanical actions write message history.
- AI/human/mechanical modes share the same session/message rendering path.
- Upload init/completed/failed use `clientMessageId` and `serverMessageId`.
- Upload success creates both a chat attachment message and a case document record.
- Upload cancel creates no message and no “completed” copy.
- Upload failure shows a failed message block and retry copy.
- All new and changed mechanical copy supports Chinese and English.
- Focused backend tests, focused frontend tests, frontend build, and browser QA pass.
