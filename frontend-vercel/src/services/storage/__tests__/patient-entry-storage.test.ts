import { describe, expect, it } from 'vitest';
import * as patientEntryStorage from '../patient-entry-storage';

describe('patientEntryStorage public surface', () => {
  it('does not export the removed pre-bootstrap history/import helpers', () => {
    const removedKeys = [
      'ANONYMOUS_HISTORY_KEY',
      'getScopedHistoryKey',
      'getImportCompleteKey',
      'getActiveImportKeyKey',
      'createOpeningMessage',
      'ensureOpeningMessageSeeded',
      'readAnonymousHistory',
      'writeAnonymousHistory',
      'clearAnonymousHistory',
      'readScopedHistory',
      'writeScopedHistory',
      'clearScopedHistory',
      'migrateAnonymousHistoryToScoped',
      'getActiveImportKey',
      'getOrCreateActiveImportKey',
      'clearActiveImportKey',
      'isImportComplete',
      'markImportComplete',
      'clearHistoryAfterSuccessfulImport',
    ];

    for (const key of removedKeys) {
      expect(patientEntryStorage).not.toHaveProperty(key);
    }
  });
});
