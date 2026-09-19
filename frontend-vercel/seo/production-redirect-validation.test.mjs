import { describe, it, expect } from 'vitest';
import { validateApprovedRemovalResponse } from './production-redirect-validation.mjs';
const approval = { url: 'https://www.medicaltourismchina.health/ar/visa', expectedStatus: 308, replacement: 'https://www.medicaltourismchina.health/ar/guides' };
describe('approved production redirects', () => {
  it.each(['/ar/guides', approval.replacement])('accepts the approved destination %s', location => {
    expect(validateApprovedRemovalResponse(approval,{ status:308,location }).errors).toEqual([]);
  });
  it('rejects a followed 200 response rather than treating it as the retired page', () => {
    expect(validateApprovedRemovalResponse(approval,{status:200,location:null}).errors).toHaveLength(2);
  });
  it('rejects a redirect to the wrong language', () => {
    expect(validateApprovedRemovalResponse(approval,{status:308,location:'/guides'}).errors).toHaveLength(1);
  });
  it('rejects the wrong redirect status', () => {
    expect(validateApprovedRemovalResponse(approval,{status:302,location:'/ar/guides'}).errors).toHaveLength(1);
  });
});
