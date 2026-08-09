# 020 Protecting Your Medical Privacy When Sharing Records Internationally

## Hero

- **Title:** Protecting Your Medical Privacy When Sharing Records Internationally
- **Category:** China Healthcare Guides
- **Subcategory:** Privacy and Cross-Border Records
- **Subtitle:** Know every recipient, send only what the task requires, use a controlled channel and decide when each person’s access should end.
- **Reviewed by:** Medora Health Editorial Team; Chinese data-protection, privacy and information-security review required before publication
- **Updated date:** 2026/08/03
- **Hero image:** `hero-reviewed.png`
- **Image alt text:** A patient and clinician review secure cross-border transfer of medical records

## Key Takeaways

- Medical-health information is sensitive personal information under China’s Personal Information Protection Law (PIPL). Processing it requires a specific purpose, sufficient necessity and strict safeguards.[1]
- “Send my records abroad” may involve the source hospital, coordinator, translation company, platform, overseas hospital, insurer and family. Identify each recipient and role.
- Use the minimum necessary record set for the stated purpose. A driver needs mobility instructions, not pathology; a pricing desk may not need the full psychiatric history.
- Separate consent and cross-border transfer requirements depend on who is processing the information and why. Ask the institution to explain its legal basis and transfer mechanism; do not rely on a blanket checkbox.[1][2]
- Encrypt files, send the password separately, set link expiry and confirm deletion or return when the task ends. DICOM and document metadata can contain identity even when the filename looks anonymous.[3]

## Content

A record can cross several borders without the patient noticing. The hospital exports a PDF to a coordinator, the coordinator sends it to a translator, the translation is uploaded to a cloud drive, a link reaches an overseas doctor, and a relative forwards the link to a family group.

Each step may feel helpful. Together they create copies, new recipients and unclear retention. Privacy protection begins by drawing the route before sending the file.

## First, Map the People and Systems

Make a simple transfer map:

| Recipient or system | Purpose | Data needed | May forward to | Access ends |
|---|---|---|---|---|
| Chinese hospital | Clinical review | Decision-relevant medical record | Named clinical team | Per hospital retention rules |
| Translator | Translate selected reports | Selected source pages | Approved reviewer only | After delivery and quality check |
| Coordinator | Arrange review | Index and necessary files | Named hospital contact | At service end |
| Insurer | Coverage decision | Its documented evidence list | Claims processors | Per policy and law |
| Driver or hotel | Accessibility logistics | Name, time and mobility need | No clinical recipient | After service |

If a person cannot explain why they need a file, pause. “For convenience” is not a defined medical purpose.

## Know Who Is the Data Handler

A patient sending a copy they personally hold to a chosen clinician is not the same operational situation as a hospital exporting records through a vendor. Hospitals, agencies, platforms, translators and overseas recipients may each act as a personal-information processor, entrusted processor or independent recipient, depending on the arrangement.

Under PIPL, providing personal information to another processor generally requires telling the individual the recipient’s identity and contact, purpose, method and categories of information and obtaining separate consent, unless another lawful basis applies.[1] Sensitive information requires additional necessity and impact information, and cross-border provision has further requirements.[1]

The patient should not have to choose the organisation’s legal mechanism. Ask the organisation’s privacy contact to state:

- Who is responsible for the transfer
- The legal basis for processing and export
- The overseas recipient and country or region
- Purpose, data categories and retention period
- Whether subcontractors or cloud providers are involved
- How the patient can exercise rights with the overseas recipient
- Which cross-border mechanism or exemption it relies on

China’s 2024 cross-border data rules adjust when security assessment, standard contract or certification procedures are required and include exemptions for some contract-necessary or emergency transfers.[2] An exemption from a filing mechanism is not permission to ignore purpose limitation, security or the individual’s rights.

## Send the Minimum Necessary Record Set

Start from the decision and create a review copy. Preserve a complete source archive separately.

Examples:

- A surgeon assessing resectability may need imaging, pathology and relevant operative or medical history—not every unrelated outpatient note.
- A translator handling a discharge summary does not need the entire DICOM archive.
- An insurer should receive the items in its written evidence request, not unlimited portal access.
- A transport provider may need wheelchair and appointment details, not diagnosis.

Minimum necessary does not mean clinically incomplete. Ask the receiving clinician which documents support safe review, then remove only genuinely unrelated material.

Never redact or edit the only source copy. Make a derivative file labelled `REDACTED COPY`, record what was removed and keep page order. For clinical treatment, disclose the redaction so the receiving team can decide whether it affects interpretation.

## Consent Should Be Specific Enough to Understand

A useful notice answers:

- What information is being used?
- For which purpose?
- Who receives it?
- In which country or region?
- How will it be transferred and stored?
- How long will it remain available?
- Who can receive it onward?
- How can the patient withdraw consent where applicable, request access or correction, or complain?

Avoid a single permission that combines clinical review, marketing, research, testimonials and indefinite data retention. These are different purposes.

Consent is not always the only lawful basis. PIPL also recognises processing necessary to enter into or perform a contract involving the individual and emergency processing necessary to protect life, health or property.[1] The organisation should document the basis it actually uses rather than collect a signature by habit and then use the data more broadly.

## Choose a Transfer Channel With Controls

Prefer the receiving hospital’s portal or an institution-approved encrypted transfer service. If files must be sent as an encrypted archive:

- Use strong encryption, not merely a renamed ZIP extension
- Send the password through another channel
- Limit the link to named recipients where possible
- Require sign-in and multi-factor authentication
- Set the shortest practical expiry
- Disable public indexing and anonymous resharing
- Keep an upload and download log
- Confirm checksum or file count for large transfers
- Delete temporary local and cloud copies after verified receipt, subject to required retention

Ordinary email and chat may be convenient, but forwarding, backups and account compromise are difficult to control. If the hospital approves such a channel, ask how identity, access and retention are managed.

Do not use a shared family account for the patient portal. A one-time verification code, payment PIN or main password gives broader access than a single report link.

## Hidden Identity Inside Files

Removing a name from the visible page or filename is not necessarily de-identification.

PDFs and office files can contain author names, revision history, comments and embedded attachments. Photographs may carry location and device metadata. DICOM objects embed patient and study attributes, and text may be burned into image pixels.[3]

When the purpose requires de-identification—such as research, teaching or an external blind review—use a qualified workflow matched to the receiving institution’s rules. Then test whether the dataset can still be linked consistently across files without exposing direct identifiers.

For direct care, aggressive de-identification may create a patient-matching hazard. The hospital may need name, date of birth and patient number to prevent records being attached to the wrong person. Follow its controlled identity-matching process.

## Give Translators and Coordinators Narrow Access

The service agreement should specify:

- Named legal entity and personnel with access
- Exact files and purpose
- Whether local download is permitted
- Use of machine translation or AI services and where data are processed
- Prohibition or conditions for subcontracting
- Confidentiality and security requirements
- Retention, return and deletion date
- Incident-notification route
- Ban on using the patient story, image or data for marketing or model training without separate permission

PIPL requires entrusted processors to act within the agreed purpose and method and to return or delete information when the arrangement ends; onward entrustment needs authorisation from the original processor.[1]

Ask for a translation sample using dummy data before sending especially sensitive records. Do not upload identifiable records into a free online translation or summarisation tool merely because it is fast.

## Family Access Is Still Data Sharing

Patients often want a spouse or adult child to help. Define what that person may do:

- View appointments only
- Receive invoices
- Access clinical reports
- Speak with clinicians
- Authorise further disclosure
- Make decisions if legally appropriate

Use the hospital’s proxy or family-access feature where available. Do not assume kinship permits unlimited disclosure. If the patient later withdraws family access, update the hospital, coordinator, shared folders and messaging groups—not just one password.

Children’s records require particular care. PIPL treats information about children under 14 as sensitive and requires consent from a parent or guardian when processing it under the consent route.[1]

## Genetics, Reproductive Health and Mental Health Need Extra Thought

Some records reveal information about relatives as well as the patient. Germline genetic results may imply familial risk. Reproductive, infectious-disease, sexual-health and mental-health records can create additional social harm if misused.

Before sharing, ask whether the entire report is necessary, whether family-member names can be minimised and whether a specialist summary will support the decision. Do not remove clinically material information from the treating team, but do not send it automatically to hotels, travel agencies or general administrators.

## Keep an Audit Trail the Patient Can Read

Maintain a transfer log with:

- Date and time
- Sender and recipient
- Purpose
- File names and version
- Channel and link expiry
- Permission or legal basis recorded by the organisation
- Receipt confirmation
- Forwarding or subcontractor disclosure
- Deletion or return confirmation

This is not bureaucracy for its own sake. If the wrong version was sent or a link leaked, the log shows where to contain the problem.

## Exercise Rights Without Damaging the Medical Record

PIPL provides individuals rights to know and decide about processing and, subject to legal conditions, to access or copy, correct and request deletion of personal information.[1]

Ask the privacy contact how to:

- Obtain a copy of the data held
- Correct an identity or contact error
- Restrict or end optional sharing
- Remove a former coordinator’s access
- Request deletion when the legal conditions are met
- Challenge an inaccurate automated match
- Complain to the institution or regulator

Deletion rights do not mean a hospital must erase records that law requires it to retain. A patient may instead be able to stop an optional disclosure while the source medical record remains preserved.

## If a Link or File Goes to the Wrong Person

Act immediately:

1. Revoke the link or account session.
2. Contact the unintended recipient and request deletion without further opening or forwarding.
3. Notify the sending organisation’s privacy or security contact.
4. Identify exactly which files, identifiers and time period were exposed.
5. Reset compromised passwords and end active sessions.
6. Preserve the audit log and incident reference.
7. Ask what risk assessment, notification and remediation will follow.

Do not delete evidence of the incident before the responsible security team records it. If financial identity, passport or account information was involved, monitor for misuse and follow official identity- or payment-protection advice.

## A Privacy Check Before Every Send

- Recipient identity verified through an independent channel
- Clinical or administrative purpose stated
- Minimum necessary files selected
- Original archive preserved
- Sensitive pages and embedded metadata understood
- Patient notice and consent or other basis documented by the responsible organisation
- Cross-border mechanism or exemption confirmed where applicable
- Secure channel and access expiry set
- Password sent separately
- Forwarding and subcontractors disclosed
- Receipt confirmed
- Deletion or return date recorded

**Legal and medical disclaimer:** This guide provides general privacy and security information, not legal advice. Cross-border data obligations depend on the organisations, data, purpose, volume, location and current rules. Hospitals and service providers should obtain qualified Chinese and destination-country advice; patients should not delay emergency care for administrative formalities.

## Related Hospitals

Ask each hospital for its privacy contact, approved upload channels, overseas-recipient notice, retention policy and procedure for proxy access, correction and incident reporting.

## Related Treatments

Genomic testing, fertility care, mental-health care, infectious-disease treatment and rare-disease review can involve especially sensitive or family-linked information that merits a narrow disclosure plan.

## Related Guides

- How to Organise Medical Records Before Seeking Care in China
- How to Share CT, MRI and Other Imaging Files With a Chinese Hospital
- What a Medical Care Coordinator Can and Cannot Do
- How to Request English-Language Medical Records in China

## FAQ

### Is it illegal for a patient to email their own records abroad?

This article does not make that blanket claim. The legal obligations differ between an individual sending their own copy and an institution or platform exporting data. The privacy risk remains, so use the receiving hospital’s secure route and obtain case-specific advice when needed.

### Does signing one consent form allow every service provider to use my record?

No such assumption is safe. Recipients, purposes, data categories and onward transfers should be disclosed specifically, and PIPL requires separate consent for certain sharing and sensitive-information activities unless another lawful basis applies.[1]

### Is a password-protected ZIP enough?

It is one control, not a complete system. Also verify the recipient, use strong encryption, send the password separately, limit access, set expiry and confirm deletion.

### Can I remove my name from DICOM files myself?

Renaming files is ineffective because DICOM contains embedded attributes.[3] For direct care, preserve safe identity matching; for de-identified use, use a qualified process requested by the institution.

### Can I ask a hospital to delete my medical record?

Individuals have deletion rights under specified legal conditions, but hospitals may have legal retention duties. Ask the hospital to distinguish retention of the source record from optional sharing or third-party copies.[1][4]

## SEO Metadata

- **Slug:** `protecting-your-medical-privacy-when-sharing-records-internationally`
- **Meta title:** Protect Medical Privacy in Cross-Border Record Sharing
- **Meta description:** Map every recipient, minimise records, use secure transfer and manage consent, access, metadata and deletion when sharing health data internationally.
- **Primary keyword:** cross-border medical record privacy China
- **Pillar keyword:** healthcare in China for international patients
- **Vertical keyword:** securely share medical records internationally
- **Search intent:** informational / privacy risk management
- **Secondary keywords:** China health data transfer; PIPL medical records; secure hospital record upload

## Sources

1. [National People’s Congress: Personal Information Protection Law of the People’s Republic of China](https://www.npc.gov.cn/WZWSREL25wYy9jMi9jMzA4MzQvMjAyMTA4L3QyMDIxMDgyMF8zMTMwODguaHRtbD9yZWY9aW1i)
2. [Cyberspace Administration of China: Provisions on Facilitating and Regulating Cross-Border Data Flows](https://www.cac.gov.cn/2024-03/22/c_1712776612187994.htm)
3. [DICOM Standard Committee: DICOM Key Concepts and Embedded Patient Data](https://www.dicomstandard.org/concepts)
4. [National Health Commission: Provisions on the Management of Medical Records in Medical Institutions (2013 Edition)](https://www.nhc.gov.cn/yzygj/c100068/201312/c9955f0471c04450a9f9ab74648fbdd4.shtml)
5. [Cyberspace Administration of China: Measures on the Standard Contract for Cross-Border Transfer of Personal Information](https://www.cac.gov.cn/2023-02/24/c_1678884830036813.htm)
6. [National Health Commission: Functional Specification for Electronic Medical Record Systems](https://www.nhc.gov.cn/wjw/gfxwj/201101/a769b5f4b9ca4415a72fa9888bce0bc1.shtml)

## Hero Image Review

The original illustration is retained because the global route, medical file, hospital and central lock directly communicate controlled cross-border health-data transfer. The image contains no readable patient information and does not imply that encryption alone satisfies every legal obligation.

