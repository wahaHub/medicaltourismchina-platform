# 019 How to Share CT, MRI and Other Imaging Files With a Chinese Hospital

## Hero

- **Title:** How to Share CT, MRI and Other Imaging Files With a Chinese Hospital
- **Category:** China Healthcare Guides
- **Subcategory:** Imaging and Medical Records
- **Subtitle:** Send the complete diagnostic study, the report and the clinical question—not a handful of screenshots that cannot be scrolled, measured or compared.
- **Reviewed by:** Medora Health Editorial Team; radiology and information-security review required before publication
- **Updated date:** 2026/08/03
- **Hero image:** `hero-reviewed.png`
- **Image alt text:** A Chinese radiologist discusses cross-sectional imaging with an international patient

## Key Takeaways

- DICOM is the standard format for exchanging medical images with the data and quality needed for clinical use.[1] Ask the imaging facility for the complete DICOM study.
- Send both the images and the final radiology report. One allows re-reading; the other records the original interpretation, technique and comparison.
- Test the files before upload. Confirm the correct patient, study date, body part, series and image count; a successful download is not proof that the study is complete.
- DICOM files contain embedded patient and study data. Renaming a folder does not remove identifying information.[2]
- Obtain receipt and import confirmation from the hospital, then ask whether a radiologist actually reviewed the images. Administrative upload is not a clinical opinion.

## Content

A photograph of an MRI film may show a recognisable abnormality. It still prevents the receiving radiologist from scrolling through slices, changing window settings, measuring a lesion, checking acquisition sequences or comparing exact prior images.

For a genuine review, prepare a transfer package with three parts: the complete diagnostic image data, the signed or final report and a short clinical question. The task is not finished when the patient clicks “send.” It is finished when the correct hospital imports the complete study and confirms who will interpret it.

## Ask the Imaging Centre for the Right Export

Use the phrase “complete DICOM study with all diagnostic series.” DICOM—Digital Imaging and Communications in Medicine—is the international standard for medical images and related information and is used across CT, MRI, radiography, ultrasound, nuclear medicine, radiotherapy and other systems.[1]

Request:

- Original DICOM files for every relevant series
- The `DICOMDIR` index when the export provides one
- Final radiology report and any addendum
- Study date, modality and body region
- Whether contrast was used and, if recorded, phase or sequence information
- Relevant prior studies for comparison
- Export on disc, secure download or hospital-approved cloud route

Do not ask only for “the images.” Some export desks will otherwise produce JPEG key images or a PDF contact sheet.

## Know the Difference Between Four Common Formats

### DICOM study

This is the diagnostic dataset. It carries image pixels plus attributes describing the patient, examination, series and acquisition. A CT or MRI usually contains many files and series, not one picture.[2]

### DICOM viewer

A disc may include software that displays the study. The viewer is not the study itself. If the program fails to run on another operating system, the raw DICOM files should still be present and importable.

### Radiology report

The report is the original radiologist’s interpretation. It should state the examination, findings and conclusion and may describe technique, contrast, limitations and comparisons. The American College of Radiology notes that relevant clinical information and a specific question improve the usefulness of the interpretation, and that comparison studies should be used when appropriate and available.[3]

### JPEG, PNG, PDF or phone photograph

These are convenient previews. They usually remove slice navigation, metadata, dynamic range and measurement capability. Use them only to point to a finding—not as the primary diagnostic transfer.

## Choose the Studies Around a Clinical Question

Write a one- or two-sentence question, for example:

- Is the pancreatic lesion technically resectable?
- Has the lung disease progressed compared with the scan before second-line treatment?
- Which spinal level explains the current neurological deficit?
- Is the postoperative collection changing, and does it require urgent assessment?

Then include the relevant imaging timeline. The newest scan alone may be insufficient. Response assessment often depends on a pretreatment baseline; surgery planning may require a particular contrast phase; a suspected complication may require the immediate postoperative study.

Ask the receiving clinician or radiologist which studies are needed. Sending every scan since childhood can hide the important comparison as effectively as sending too little.

## Inspect the Export Before Leaving the Facility

Open the disc or download on a computer that did not create it. A DICOM media set usually includes individual image files and may include `DICOMDIR`; the DICOM Standard’s patient guidance explains that a viewer normally loads the entire study rather than one file at a time.[4]

Check:

- Patient name and another identifier
- Study date and time
- Modality and body region
- Number and names of series
- Approximate image count
- Presence of contrast and non-contrast phases when expected
- Whether thin slices, reconstructions or functional sequences requested by the reviewer are present
- Whether the report matches this exact study

Scroll from the first to last image in several major series. A folder can open normally while missing half the study.

If several studies share one disc, make a manifest rather than moving internal files. Example:

| Folder | Study | Date | Report | Notes |
|---|---|---|---|---|
| `01` | CT chest/abdomen with contrast | 2026-01-04 | Yes | Baseline |
| `02` | CT chest/abdomen with contrast | 2026-03-18 | Yes | After 2 cycles |

## Do Not Rename or Edit the Internal DICOM Files

DICOM systems identify studies and series through embedded attributes and unique identifiers, not friendly filenames. Keep the export structure intact. Rename only the outer folder or archive, for example:

`2026-03-18_CT-chest-abdomen_DICOM`

Do not open images in photo software and save them again. Do not crop, annotate or change pixel data. If a clinician needs an arrow or note, create a separate reference screenshot while preserving the untouched study.

If the hospital requests a ZIP archive, compress the top-level study folder once. Avoid several nested ZIP files unless its instructions require them.

## Upload Through the Hospital’s Confirmed Route

Ask for:

- Exact portal or secure transfer link
- Accepted formats and maximum file size
- Whether archives must be ZIP, uncompressed or DICOMweb-compatible
- Patient or case number to enter
- Whether the report uploads separately
- Link expiry and upload deadline
- Technical support contact

China’s electronic medical-record rules allow medical institutions, where capability exists, to provide imaging or video material electronically and require electronic copies to be independently readable.[5] That does not mean every hospital uses the same portal or can import every foreign viewer package.

Upload from a stable connection. Keep the browser open until the platform shows completion, then save the receipt or screenshot. A progress bar reaching 100% may only confirm transfer to a server, not successful import into the radiology system.

## Protect Patient Identity Without Breaking the Study

DICOM objects can contain patient name, ID, dates and other information inside the files; changing a filename does not de-identify them.[2] Some images also contain text burned into the pixels.

For direct clinical care, the receiving hospital generally needs enough identity to match the study safely to the patient. Use its designated route and authorisation process.

For research, teaching or a blind second-read service, ask the institution which de-identification profile it requires and who performs it. Do not delete tags casually: poor de-identification can leave personal information behind or remove attributes needed to link series and compare studies.

China’s Personal Information Protection Law treats medical-health information as sensitive and requires a specific purpose, necessity and protective measures.[6] Send only to identified recipients, use access expiry where available and do not post imaging links in public or broad group chats.

## Pair Every Study With Its Report and Translation

Name reports so they cannot drift away from the images:

- `2026-03-18_CT-chest-abdomen_report_ORIGINAL.pdf`
- `2026-03-18_CT-chest-abdomen_report_EN-translation.pdf`

Keep the original report even when an English or Chinese translation exists. Label the translator and date. The translation does not replace a new radiology interpretation.

If the original report was amended, send the final report and all addenda. State which version the original hospital treats as current.

## Confirm Import, Completeness and Clinical Review

After upload, ask the receiving team to confirm:

1. Correct patient and case
2. Study date, body part and modality
3. Number of studies received
4. Whether all expected series imported
5. Whether prior comparison studies are linked
6. Name or role of the interpreting radiologist
7. Expected report or consultation date
8. How urgent findings will be communicated

“Files received” from a coordinator is only step one. The ACR communication parameter emphasises that imaging information is useful only when conveyed to those responsible for treatment decisions in a timely way.[3]

Ask whether the output is an informal multidisciplinary review, a formal second-read report or merely image availability for the treating surgeon. These products are not interchangeable.

## Common Transfer Failures and Repairs

### Only screenshots were exported

Return to the imaging facility and request the complete DICOM study.

### The viewer opens but the hospital imports nothing

Locate the raw DICOM folders or request a fresh standards-based export. Do not send only the viewer executable.

### The ZIP is too large

Ask the hospital for a higher-capacity route, divide by complete study rather than arbitrary file count, or send encrypted physical media. Never discard series without radiology guidance.

### Name or passport does not match

Do not edit DICOM metadata yourself. Provide the old and current identifiers and ask the hospital to document the match during import.

### The secure link expires

Keep the untouched local archive and request a new link. Do not move the only copy into a temporary portal.

### The study is incomplete

Send the manifest and missing-series description back to the source facility. A second upload should be labelled as replacement or supplement so the reviewer does not unknowingly read a partial study.

## A Final Transfer Checklist

- Clinical question and requested comparisons are stated
- Complete DICOM study obtained
- Final report and addenda included
- Original-language report preserved; translation labelled
- Correct patient, date, modality and body region verified
- Expected series and image counts checked
- Internal folder structure left intact
- Outer archive named clearly and opens successfully
- Hospital route, size limit and case number confirmed
- Privacy and access permissions reviewed
- Upload receipt saved
- Hospital confirmed import and completeness
- Named clinical reviewer and response date recorded

**Medical disclaimer:** File transfer does not establish a diagnosis. Image adequacy, comparison and treatment implications must be assessed by qualified clinicians with the full case. Urgent symptoms require local medical evaluation and should not wait for a remote upload.

## Related Hospitals

Before sending, verify that the target hospital can import outside DICOM studies, accepts the study modality and offers the needed radiology subspecialty.

## Related Treatments

Surgical planning, radiation therapy, interventional procedures, cancer response assessment and neurological or orthopaedic review often need specific sequences, phases or prior comparisons.

## Related Guides

- How to Organise Medical Records Before Seeking Care in China
- Pathology and Laboratory Record Review Before Treatment in China
- How to Prepare for a Remote Consultation With a Doctor in China
- Protecting Your Medical Privacy When Sharing Records Internationally

## FAQ

### Can I email a few CT screenshots for a second opinion?

They may help explain the question, but a diagnostic review usually requires the complete DICOM study and relevant report.[1]

### What is `DICOMDIR`?

It is an index commonly included on DICOM media to help software identify the studies and files. Keep it with the original folder structure.[4]

### Should I remove my name from the DICOM files?

For direct care, follow the hospital’s identity-matching instructions. For de-identified use, ask a qualified service to apply the required profile; renaming folders is not enough.[2]

### Do I need to send old scans?

Send the comparisons the receiving clinician requests. Baseline and immediately prior studies are often important, but relevance depends on the clinical question.[3]

### How do I know the hospital really reviewed the images?

Ask for the radiologist or reviewing team, the form of output and the expected date. An upload receipt confirms transfer, not interpretation.

## SEO Metadata

- **Slug:** `how-to-share-ct-mri-and-other-imaging-files-with-a-chinese-hospital`
- **Meta title:** Share CT and MRI Files With a Chinese Hospital
- **Meta description:** Export complete DICOM studies, verify series, protect patient data and confirm successful import and radiology review in China.
- **Primary keyword:** send DICOM to Chinese hospital
- **Pillar keyword:** healthcare in China for international patients
- **Vertical keyword:** share CT MRI files China
- **Search intent:** informational / technical preparation
- **Secondary keywords:** DICOM upload China hospital; CT second opinion China; MRI file transfer China

## Sources

1. [DICOM Standard Committee: About DICOM](https://www.dicomstandard.org/about)
2. [DICOM Standard Committee: DICOM Key Concepts and Embedded Patient Data](https://www.dicomstandard.org/concepts)
3. [American College of Radiology: Practice Parameter for Communication of Diagnostic Imaging Findings](https://www.acr.org/-/media/ACR/Files/Practice-Parameters/communicationdiag.pdf)
4. [DICOM Standard Committee: Displaying Medical Images From a CD](https://www.dicomstandard.org/using/cds)
5. [National Health Commission: Electronic Medical Record Application Management Specification](https://www.nhc.gov.cn/wjw/c100175/201702/90f3de8ae03d488cbddf509dc958f75b.shtml)
6. [National People’s Congress: Personal Information Protection Law of the People’s Republic of China](https://www.npc.gov.cn/WZWSREL25wYy9jMi9jMzA4MzQvMjAyMTA4L3QyMDIxMDgyMF8zMTMwODguaHRtbD9yZWY9aW1i)

## Hero Image Review

The original illustration is retained because it clearly depicts a clinician reviewing cross-sectional imaging with a patient and shows both a display and image series. It contains no readable identity information or unsupported diagnostic claim.

