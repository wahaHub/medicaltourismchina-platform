type BrowserStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function getStorage(): BrowserStorage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

function removeItem(key: string): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(key);
}

function getBootstrapErrorKey(patientId: string, caseId: string): string {
  return `patient-entry:patient:${patientId}:case:${caseId}:bootstrap-error`;
}

export function writeBootstrapErrorMarker(patientId: string, caseId: string, reason: string): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(getBootstrapErrorKey(patientId, caseId), reason);
}

export function clearBootstrapErrorMarker(patientId: string, caseId: string): void {
  removeItem(getBootstrapErrorKey(patientId, caseId));
}
