type Translate = (key: string) => string | undefined;

export function getPatientLoginContent(t: Translate) {
  return {
    description: t('patientLogin.magicLinkDescription')
      ?? '',
    cardTitle: t('patientLogin.magicLinkCardTitle')
      ?? '',
    cardDescription: t('patientLogin.magicLinkCardDescription')
      ?? '',
    submitLabel: t('patientLogin.magicLinkSubmit')
      ?? '',
    submittingLabel: t('patientLogin.magicLinkSubmitting')
      ?? '',
  };
}
