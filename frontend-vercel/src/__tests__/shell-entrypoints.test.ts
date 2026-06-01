import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const PROJECT_ROOT = path.resolve(__dirname, '../..');

describe('public shell entrypoints', () => {
  it('does not include the third-party Chatway widget script', () => {
    const indexHtml = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf8');

    expect(indexHtml).not.toContain('cdn.chatway.app/widget.js');
    expect(indexHtml).not.toContain('id="chatway"');
  });

  it('does not mount the floating free quote widget in the app shell', () => {
    const appSource = fs.readFileSync(path.join(PROJECT_ROOT, 'src/App.tsx'), 'utf8');

    expect(appSource).not.toContain('FreeQuoteFloatingButton');
  });
});
