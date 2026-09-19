// Approved retired URLs must still return the agreed status and destination.
// Following redirects before validation would incorrectly inspect the target
// page as if it still belonged to the retired URL.
export function validateApprovedRemovalResponse(approval, { status, location }) {
  const errors = [];
  if (status !== approval.expectedStatus) {
    errors.push(`${approval.url} must return approved status ${approval.expectedStatus}; found ${status}`);
  }
  if (approval.replacement) {
    let destination;
    try { destination = location ? new URL(location, approval.url).href : null; }
    catch { destination = null; }
    if (destination !== approval.replacement) {
      errors.push(`${approval.url} must redirect to ${approval.replacement}; found ${destination ?? 'no valid Location header'}`);
    }
  }
  return { errors };
}
