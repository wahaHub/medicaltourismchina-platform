import type { PatientEntryPhase } from '@/types/patient-entry';

export type PatientDashboardViewState = 'restoring' | 'dashboard' | 'bootstrap-error';

export function resolvePatientDashboardViewState(input: {
  hasDashboardToken: boolean;
  phase: PatientEntryPhase;
  patientNextStep?: 'select-hospitals' | 'messages-ready' | 'post-selection';
}): PatientDashboardViewState {
  if (input.phase === 'bootstrap-error') {
    return 'bootstrap-error';
  }

  if (!input.hasDashboardToken) {
    return 'dashboard';
  }

  if (input.phase !== 'collect-profile') {
    return 'dashboard';
  }

  if (
    input.patientNextStep === 'select-hospitals'
    || input.patientNextStep === 'messages-ready'
    || input.patientNextStep === 'post-selection'
  ) {
    return 'restoring';
  }

  return 'dashboard';
}
