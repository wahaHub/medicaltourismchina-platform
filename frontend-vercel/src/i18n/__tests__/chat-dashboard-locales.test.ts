import { describe, expect, it } from 'vitest';
import { en } from '../translations/en';
import { zh } from '../translations/zh';
import { es } from '../translations/es';
import { fr } from '../translations/fr';
import { de } from '../translations/de';
import { ru } from '../translations/ru';
import { ar } from '../translations/ar';
import { id } from '../translations/id';

const requiredKeys = [
  'chatWidget.openChat',
  'chatWidget.form.title',
  'chatWidget.form.destinationDone',
  'patientLogin.pageTitle',
  'patientLogin.magicLinkSubmit',
  'patientLogin.backToWebsite',
  'chatWidget.composer.send',
  'dashboard.shell.home',
  'dashboard.shell.messages',
  'dashboard.shell.signOut',
  'dashboard.home.welcomeBack',
  'dashboard.quotes.title',
  'dashboard.tickets.title',
  'dashboard.orders.title',
  'dashboard.journey.title',
] as const;

describe('chat and dashboard locale contracts', () => {
  it('keeps required controls present in every supported dictionary', () => {
    for (const dictionary of [en, zh, es, fr, de, ru, ar, id]) {
      for (const key of requiredKeys) {
        expect(dictionary[key], key).toBeTruthy();
      }
    }
  });

  it('does not silently reuse English for Arabic or Indonesian controls', () => {
    for (const key of requiredKeys) {
      expect(ar[key], `Arabic ${key}`).not.toBe(en[key]);
      expect(id[key], `Indonesian ${key}`).not.toBe(en[key]);
    }
    expect(ar['chatWidget.booking.title']).not.toBe(en['chatWidget.booking.title']);
    expect(id['chatWidget.booking.title']).not.toBe(en['chatWidget.booking.title']);
    expect(ar['chatWidget.booking.sendRequest']).not.toBe(en['chatWidget.booking.sendRequest']);
    expect(id['chatWidget.booking.sendRequest']).not.toBe(en['chatWidget.booking.sendRequest']);
  });
});
