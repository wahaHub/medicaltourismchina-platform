# 089 Artificial Intelligence in Medical Imaging: What Patients Should Know

## Hero

- **Title:** Artificial Intelligence in Medical Imaging: What Patients Should Know
- **Category:** Clinical Trials & Advanced Treatments
- **Subcategory:** Imaging, Software & Clinical Decisions
- **Subtitle:** Find out what the software actually does, who checks it and whether it changes your care.
- **Reviewed by:** Medora Health Editorial Team
- **Updated date:** 2026/08/04
- **Hero image:** `hero-reviewed.png`
- **Image alt text:** Conceptual illustration of a radiology clinician discussing a chest image and AI support with a patient; not a real scan or diagnostic output.

## Key Takeaways

- “AI used” is incomplete information. The software may improve image acquisition, reconstruct a scan, prioritise a worklist, mark a possible finding, measure anatomy or draft part of a report.
- The radiologist’s signed report remains the clinical document. Ask who reviewed the original images and how an AI–human disagreement was handled.
- A model’s accuracy belongs to a defined task, population, scanner, protocol, threshold and version. A high number on a brochure is not a universal diagnostic rate.
- False negatives can create false reassurance; false positives can lead to anxiety, extra imaging, biopsy or treatment. Human readers can also be influenced by incorrect AI suggestions [9].
- Keep the original DICOM study and final report. An overlay, risk score or generated summary must not replace the source images.

## Content

A patient may encounter artificial intelligence before, during or after a scan without seeing a robot or even an “AI” button. Software may help a technologist position the patient, shorten an MRI acquisition, reconstruct a lower-dose CT, flag a possible brain haemorrhage for earlier reading, outline a tumour, compare lesion size or suggest wording for a report. These are different tools with different failure modes.

China’s 2025 policy on “AI + health care” encourages imaging support for diagnosis, report generation, image-quality assessment and treatment planning while also calling for security, standards and regulated use [1]. The national catalogue of application scenarios likewise describes multiple imaging functions rather than a single autonomous diagnosis system [2]. Patients therefore need the product’s precise job—not the hospital’s general claim that it is an “AI hospital.”

### Six jobs that are often mixed together

| Job | What the software may do | What it does not establish by itself |
|---|---|---|
| Acquisition support | positioning, protocol choice, motion or quality feedback | whether the examination was clinically indicated |
| Reconstruction | denoising, acceleration, dose-related image reconstruction | that every subtle finding is preserved under all settings |
| Triage | move a suspected urgent study higher on a worklist | a final diagnosis or permission to delay emergency care |
| Detection/classification | mark a nodule, fracture, haemorrhage or other target | that an unmarked image is normal, or a mark is disease |
| Segmentation/measurement | outline an organ or lesion, calculate volume or change | whether the change is clinically meaningful or treatment response |
| Reporting support | populate measurements, compare priors, draft phrases | a verified, signed interpretation in clinical context |

One product may do only one row. A lung-nodule detector should not be assumed to assess pulmonary embolism, pneumonia, breast tissue, bones or every incidental finding visible on the same CT.

### Start with the exact clinical question

The imaging examination must still be appropriate. Ask:

- What symptom, diagnosis or treatment decision is this CT, MRI, X-ray, ultrasound, mammogram or PET examination meant to address?
- Is contrast needed? Is there radiation, sedation, pregnancy, kidney, allergy, metal-implant or motion risk?
- Is the AI intended for screening, symptomatic diagnosis, emergency triage, treatment planning or follow-up?
- Which body part, disease, age group and image type are within the product’s intended use?

An AI add-on cannot make an unnecessary scan necessary. It also cannot compensate for the wrong modality, incomplete coverage, poor positioning, severe motion, incorrect contrast phase or missing prior examinations.

### Verify the product, version and intended use

Ask the hospital for the product’s exact name, manufacturer, software version and role in your pathway. For a medical-device function used in China, confirm the current NMPA registration and intended use in the official device database [3]. Registration means the device was reviewed for its specified use; it does not prove superiority over every radiologist, hospital or competing product.

Also ask:

1. Is this version the registered version, a hospital-developed research tool or part of a clinical study?
2. Does it analyse the same scanner, protocol and image reconstruction used for this examination?
3. Is it allowed to operate alone, or is it labelled as decision support for a trained clinician?
4. Was the model or decision threshold changed after deployment?
5. What happens when the software is unavailable, rejects the study or produces an obviously implausible result?

The FDA’s continually updated AI-enabled device list illustrates how narrow device descriptions can be: many products are tied to a specialty, product code and defined submission rather than authorised as general medical intelligence [4]. FDA-led transparency principles also call for information that supports the user’s understanding of intended use, performance, limitations, workflow and updates [5]. The same questions are useful when evaluating a Chinese product, even though the governing registration is Chinese.

### Translate accuracy claims into a clinical pathway

Sensitivity asks how often a tool finds the target among people who truly have it. Specificity asks how often it stays negative among people who do not. Positive and negative predictive values additionally depend on how common the target is in the population being tested. A tool can have impressive sensitivity yet produce many false alerts when disease prevalence is low.

Before trusting a percentage, identify:

- the exact target and reference standard;
- screening patients or symptomatic patients;
- internal test data or external hospitals;
- number of patients, not only number of images;
- scanners, vendors, protocols and countries represented;
- age, sex and relevant subgroup performance;
- operating threshold and confidence intervals;
- stand-alone model performance or clinician-plus-model performance;
- retrospective dataset, live workflow study or randomised trial;
- patient outcome, diagnostic accuracy, reading time or workload endpoint.

DECIDE-AI was developed because promising retrospective performance does not by itself demonstrate benefit in live care. Its framework emphasises the clinical workflow, human factors, user variability, version changes, safety and generalisability [7].

### One strong trial does not validate “imaging AI” as a whole

The Swedish MASAI randomised trial is a useful example of evidence that is both encouraging and narrow. In a 2026 analysis of more than 105,000 screening participants, an AI-supported mammography pathway had a non-inferior interval-cancer rate, higher sensitivity and the same specificity as standard double reading, while reducing reading workload [8].

That result applies to the tested mammography workflow and population. It does not validate a chest X-ray detector, a Chinese CT population, a diagnostic breast clinic or a new software version. It also shows why the outcome matters: cancer found during screening, cancers appearing between screens, sensitivity, specificity and workload answer different questions.

### AI and the radiologist can fail together

AI is sometimes presented as an independent second pair of eyes. In practice, the display order and confidence of a prompt can influence the human reader. A multi-reader chest-radiograph study found that incorrect AI results increased radiologists’ false-positive and false-negative errors [9]. This is one form of automation bias.

Hospitals should define whether the radiologist reads before seeing the AI result, after it or both; whether a discordant case receives a second read; and whether urgent alerts are verified before clinical action. The final report should not silently convert a probability score into a definite diagnosis.

Patients can ask a simple question: “Did the radiologist personally review the complete original study, including areas outside the AI target?” A competent answer should be yes, or should clearly explain a different regulated workflow.

### False positives and false negatives have different consequences

A false positive may trigger repeat imaging, contrast exposure, short-interval surveillance, specialist referral, biopsy, procedure risk, cost and weeks of worry. A false negative may delay diagnosis or create reassurance that suppresses further investigation despite symptoms.

The acceptable balance depends on the task. Emergency triage may favour sensitivity so a suspected haemorrhage reaches the top of the list, accepting more false alerts. Screening programmes must consider recall and overdiagnosis. Tumour segmentation for radiotherapy requires geometric and quality checks. Low-dose reconstruction must preserve clinically important detail, not merely create a smoother-looking image.

Ask what action follows each AI category and who can override it. A risk score without an agreed clinical response is not a care plan.

### Generalisability can break quietly

Performance can shift when the patient population, disease prevalence, scanner, contrast timing, acquisition protocol, image compression or hospital workflow differs from the development setting. Paediatric anatomy, postoperative changes, implants, uncommon diseases and multiple simultaneous abnormalities may be under-represented in training data.

Version updates matter too. Save the product and version used if its result materially affected the case. A hospital should monitor missed findings, false alerts, rejected studies, turnaround time, subgroup performance and changes after upgrades. WHO’s governance principles call for human autonomy, safety, transparency, accountability, inclusion and continuing assessment during actual use [6].

### Know what belongs in the radiology record

The source study is the complete DICOM examination, not a screenshot, JPEG, heatmap or AI-marked series. Preserve:

- original DICOM images and series list;
- the signed radiologist report and any addendum;
- relevant prior studies used for comparison;
- contrast, dose or acquisition information where relevant;
- key measurements and response criteria used;
- AI product/version and output if it materially influenced interpretation;
- the clinician’s decision based on the imaging.

An AI heatmap may show where a model focused, but it is not proof of disease and may not explain the causal basis of the result. If the overlay is exported, label it clearly as a derived image so another hospital does not mistake it for the source acquisition.

### Questions about privacy and secondary data use

Diagnostic use, software quality monitoring, product improvement and research are not automatically the same purpose. Ask whether images leave the hospital, whether they are de-identified, who receives them, how long they are retained, whether they train a future model and whether refusal changes clinical access. Cross-border transfer deserves separate attention for international patients.

Do not upload DICOM files to a public consumer AI site. Headers and burned-in image text can contain names, dates, identifiers and institution details. A hospital-approved secure channel and documented recipient are safer than a personal messaging account.

### If the AI result and clinical picture disagree

New weakness, severe headache, a palpable mass, persistent bleeding, worsening breathlessness or another concerning symptom should not be dismissed because an AI score is low. Ask for radiologist review, comparison with prior imaging, an addendum or second opinion when the discrepancy could change management. Sometimes the answer is another modality, targeted ultrasound, repeat imaging with a corrected protocol, pathology or clinical follow-up—not simply rerunning the same model.

For urgent symptoms, seek immediate local care. An automated “low risk” result is not an emergency clearance.

**Medical disclaimer:** This guide explains how to question imaging AI; it does not interpret a scan. Only qualified clinicians with access to the complete images, history and examination can decide what a finding means and what happens next.

## FAQ

### Does an AI score appear in every radiology report?

No. Some tools work invisibly on acquisition or reconstruction; others provide an alert or measurement only to staff. Ask whether the output affected the signed report or clinical decision.

### If AI marks no abnormality, is the scan normal?

No. A product usually targets only defined findings and can miss them. The radiologist must review the entire examination and the result must be interpreted with symptoms and prior studies.

### Is an NMPA-registered AI product proven better than a radiologist?

Not necessarily. Registration covers a specified intended use and evidence package. Superiority depends on the comparator, task, population, workflow, version and outcome studied.

### Can AI reduce the radiation dose of CT?

AI-based reconstruction may support lower-dose protocols in defined settings, but dose selection and diagnostic image quality remain clinical and technical responsibilities. Ask about the actual protocol, not a generic percentage claim.

### What should I take to another hospital for a second opinion?

Bring the original DICOM study, final report and addenda, relevant prior images and clinical history. Include an AI overlay or score only as clearly labelled supplementary material.

## SEO Metadata

- **Slug:** `artificial-intelligence-in-medical-imaging-what-patients-should-know`
- **Meta title:** AI in Medical Imaging: A Patient Guide
- **Meta description:** Understand what imaging AI does, how to verify its product and evidence, false results, radiologist oversight, data privacy and records for a second opinion.
- **Primary keyword:** AI in medical imaging
- **Secondary keywords:** radiology artificial intelligence; AI imaging accuracy; imaging AI false positive; NMPA medical imaging software; AI radiology report
- **Search intent:** technology explanation / imaging decision support

## Sources

1. [National Health Commission of China — Implementation Opinion on Promoting and Regulating “AI + Health Care”](https://www.nhc.gov.cn/guihuaxxs/c100133/202511/d1a42ae835c743b9b3e83ac0253c3e9f.shtml)
2. [National Health Commission of China — Reference Guide to AI Application Scenarios in the Health Sector](https://www.nhc.gov.cn/guihuaxxs/c100133/202411/3dee425b8dc34f739d63483c4e5c334c/files/1733227133524_47343.pdf)
3. [National Medical Products Administration — Medical Device Database](https://www.nmpa.gov.cn/datasearch/home-index.html#category=ylqx)
4. [US Food and Drug Administration — Artificial Intelligence-Enabled Medical Devices](https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-enabled-medical-devices)
5. [FDA, Health Canada and MHRA — Transparency for Machine Learning-Enabled Medical Devices](https://www.fda.gov/medical-devices/software-medical-device-samd/transparency-machine-learning-enabled-medical-devices-guiding-principles)
6. [World Health Organization — Ethics and Governance of Artificial Intelligence for Health](https://www.who.int/publications/i/item/9789240037403)
7. [Nature Medicine — DECIDE-AI Reporting Guideline for Live Clinical Evaluation](https://www.nature.com/articles/s41591-022-01772-9)
8. [The Lancet — MASAI Randomized Trial of AI-Supported Mammography Screening](https://pubmed.ncbi.nlm.nih.gov/41620232/)
9. [European Radiology — Effect of Incorrect AI Results on Chest-Radiograph Readers](https://pubmed.ncbi.nlm.nih.gov/37266657/)

## Image Review

- **Decision:** Approved after editorial review; copied as `hero-reviewed.png`.
- **Editorial note:** The image specifically shows a clinician, patient, radiograph and an AI-style analysis symbol, so it supports the topic better than a generic consultation scene. It remains a conceptual illustration: the chest image and brain icon are not a coherent real product output and must not be presented as a diagnosis, heatmap or validated interface.
