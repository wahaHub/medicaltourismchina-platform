import { describe, expect, it } from 'vitest';
import { resolvePatientDashboardViewState } from './patient-dashboard-entry.helpers';

describe('resolvePatientDashboardViewState', () => {
  it('shows the dashboard immediately when there is no dashboard token', () => {
    expect(resolvePatientDashboardViewState({
      hasDashboardToken: false,
      phase: 'collect-profile',
      patientNextStep: 'select-hospitals',
    })).toBe('dashboard');
  });

  it('shows a restoring view while token-based dashboard login is still syncing entry state', () => {
    expect(resolvePatientDashboardViewState({
      hasDashboardToken: true,
      phase: 'collect-profile',
      patientNextStep: 'messages-ready',
    })).toBe('restoring');
  });

  it('shows bootstrap-error when entry restore failed', () => {
    expect(resolvePatientDashboardViewState({
      hasDashboardToken: true,
      phase: 'bootstrap-error',
      patientNextStep: 'select-hospitals',
    })).toBe('bootstrap-error');
  });
});
