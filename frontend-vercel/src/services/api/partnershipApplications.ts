export type PartnershipApplicationType = "hospitals" | "referral-partners" | "travel-services";

export type PartnershipApplicationPayload = {
  applicationType: PartnershipApplicationType;
  organizationName: string;
  website?: string;
  contactName: string;
  jobTitle?: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  wechat?: string;
  country?: string;
  city?: string;
  notes?: string;
  details: Record<string, string>;
};

type PartnershipApplicationResponse = {
  ok: boolean;
  data?: {
    id: string;
    status: string;
  };
  error?: string;
};

export async function submitPartnershipApplication(payload: PartnershipApplicationPayload) {
  const apiUrl = import.meta.env.VITE_ACTION_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || "https://api.medicaltourismchina.health";
  const response = await fetch(`${apiUrl}/partnership-applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = (await response.json()) as PartnershipApplicationResponse;
  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Failed to submit partnership application");
  }

  return result;
}
