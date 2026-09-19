# 019 Cómo compartir archivos de TC, RM y otras imágenes con un hospital chino

## Hero

- **Title:** Cómo compartir archivos de TC, RM y otras imágenes con un hospital chino
- **Category:** Guías de atención sanitaria en China
- **Subcategory:** Diagnóstico por imagen y registros médicos
- **Subtitle:** Envíe el estudio diagnóstico completo, el informe y la pregunta clínica, no un puñado de capturas de pantalla que no permiten recorrer las imágenes, medir ni comparar.
- **Reviewed by:** Equipo editorial de Medora Health; se requiere revisión radiológica y de seguridad de la información antes de la publicación
- **Updated date:** 2026/08/03
- **Hero image:** `hero-reviewed.png`
- **Image alt text:** Un radiólogo chino comenta imágenes de cortes anatómicos con un paciente internacional

## Key Takeaways

- DICOM es el formato estándar para intercambiar imágenes médicas con los datos y la calidad necesarios para el uso clínico.[1] Pida al centro de diagnóstico por imagen el estudio DICOM completo.
- Envíe tanto las imágenes como el informe radiológico final. Las primeras permiten una nueva lectura; el segundo registra la interpretación original, la técnica y la comparación.
- Pruebe los archivos antes de cargarlos. Confirme que el paciente, la fecha del estudio, la parte del cuerpo, las series y el número de imágenes sean correctos; una descarga satisfactoria no demuestra que el estudio esté completo.
- Los archivos DICOM contienen datos integrados del paciente y del estudio. Cambiar el nombre de una carpeta no elimina la información identificativa.[2]
- Obtenga del hospital confirmación de recepción e importación y después pregunte si un radiólogo revisó realmente las imágenes. Una carga administrativa no es una opinión clínica.

## Content

Una fotografía de una placa de RM puede mostrar una anomalía reconocible. Aun así, impide que el radiólogo receptor recorra los cortes, cambie los ajustes de ventana, mida una lesión, compruebe las secuencias de adquisición o compare imágenes previas exactas.

Para una revisión real, prepare un paquete de transferencia con tres partes: los datos completos de las imágenes diagnósticas, el informe firmado o final y una breve pregunta clínica. La tarea no termina cuando el paciente pulsa «enviar». Termina cuando el hospital correcto importa el estudio completo y confirma quién lo interpretará.

## Pida al centro de diagnóstico por imagen la exportación adecuada

Utilice la expresión «estudio DICOM completo con todas las series diagnósticas». DICOM, imágenes y comunicaciones digitales en medicina, es el estándar internacional para imágenes médicas e información relacionada y se utiliza en TC, RM, radiografía, ecografía, medicina nuclear, radioterapia y otros sistemas.[1]

Solicite:

- Archivos DICOM originales de cada serie pertinente
- El índice `DICOMDIR` cuando la exportación lo proporcione
- Informe radiológico final y cualquier adenda
- Fecha del estudio, modalidad y región corporal
- Si se utilizó contraste y, si se registró, información sobre fases o secuencias
- Estudios previos pertinentes para comparación
- Exportación en disco, descarga segura o vía en la nube aprobada por el hospital

No pida solamente «las imágenes». De lo contrario, algunos servicios de exportación producirán imágenes clave en JPEG o una hoja de miniaturas en PDF.

## Conozca la diferencia entre cuatro formatos habituales

### Estudio DICOM

Este es el conjunto de datos diagnósticos. Contiene los píxeles de las imágenes y atributos que describen al paciente, la exploración, las series y la adquisición. Una TC o RM suele contener muchos archivos y series, no una sola imagen.[2]

### Visor DICOM

Un disco puede incluir software que muestra el estudio. El visor no es el estudio en sí. Si el programa no funciona en otro sistema operativo, los archivos DICOM sin procesar deben seguir presentes y poder importarse.

### Informe radiológico

El informe es la interpretación del radiólogo original. Debe indicar la exploración, los hallazgos y la conclusión, y puede describir la técnica, el contraste, las limitaciones y las comparaciones. El Colegio Americano de Radiología señala que la información clínica pertinente y una pregunta específica mejoran la utilidad de la interpretación, y que deben utilizarse estudios comparativos cuando sean apropiados y estén disponibles.[3]

### JPEG, PNG, PDF o fotografía con el teléfono

Son vistas previas cómodas. Suelen eliminar la navegación entre cortes, los metadatos, el rango dinámico y la capacidad de medición. Utilícelas solo para señalar un hallazgo, no como transferencia diagnóstica principal.

## Elija los estudios en torno a una pregunta clínica

Escriba una pregunta de una o dos frases, por ejemplo:

- ¿Es técnicamente resecable la lesión pancreática?
- ¿Ha progresado la enfermedad pulmonar en comparación con la exploración anterior al tratamiento de segunda línea?
- ¿Qué nivel vertebral explica el déficit neurológico actual?
- ¿Está cambiando la colección posoperatoria y requiere una evaluación urgente?

Después incluya la cronología pertinente de las imágenes. La exploración más reciente por sí sola puede ser insuficiente. La evaluación de la respuesta suele depender de un estudio basal previo al tratamiento; la planificación quirúrgica puede requerir una fase de contraste específica; una posible complicación puede requerir el estudio posoperatorio inmediato.

Pregunte al profesional o radiólogo receptor qué estudios se necesitan. Enviar todas las exploraciones desde la infancia puede ocultar la comparación importante con tanta eficacia como enviar demasiado poco.

## Inspeccione la exportación antes de salir del centro

Abra el disco o la descarga en un ordenador que no los haya creado. Un conjunto de medios DICOM suele incluir archivos de imágenes individuales y puede incluir `DICOMDIR`; la orientación para pacientes del estándar DICOM explica que un visor normalmente carga el estudio completo, en lugar de un archivo cada vez.[4]

Compruebe:

- Nombre del paciente y otro identificador
- Fecha y hora del estudio
- Modalidad y región corporal
- Número y nombres de las series
- Número aproximado de imágenes
- Presencia de fases con y sin contraste cuando se esperen
- Si están presentes los cortes finos, las reconstrucciones o las secuencias funcionales solicitados por quien realizará la revisión
- Si el informe corresponde exactamente a este estudio

Recorra desde la primera hasta la última imagen en varias de las series principales. Una carpeta puede abrirse normalmente y, aun así, faltarle la mitad del estudio.

Si varios estudios comparten un disco, elabore un inventario en lugar de mover archivos internos. Ejemplo:

| Carpeta | Estudio | Fecha | Informe | Notas |
|---|---|---|---|---|
| `01` | TC de tórax/abdomen con contraste | 2026-01-04 | Sí | Basal |
| `02` | TC de tórax/abdomen con contraste | 2026-03-18 | Sí | Después de 2 ciclos |

## No cambie el nombre ni edite los archivos DICOM internos

Los sistemas DICOM identifican los estudios y las series mediante atributos integrados e identificadores únicos, no mediante nombres de archivo fáciles de leer. Mantenga intacta la estructura de exportación. Cambie solo el nombre de la carpeta externa o del archivo comprimido, por ejemplo:

`2026-03-18_CT-chest-abdomen_DICOM`

No abra las imágenes en software fotográfico y vuelva a guardarlas. No recorte, anote ni cambie los datos de los píxeles. Si un profesional necesita una flecha o una nota, cree una captura de referencia separada y conserve el estudio intacto.

Si el hospital solicita un archivo ZIP, comprima una vez la carpeta de nivel superior del estudio. Evite varios archivos ZIP anidados a menos que sus instrucciones los requieran.

## Cargue los archivos a través de la vía confirmada del hospital

Pida:

- Portal exacto o enlace de transferencia segura
- Formatos aceptados y tamaño máximo de archivo
- Si los archivos deben estar en ZIP, sin comprimir o ser compatibles con DICOMweb
- Número de paciente o caso que debe introducir
- Si el informe se carga por separado
- Caducidad del enlace y fecha límite de carga
- Contacto de soporte técnico

Las normas chinas sobre historias clínicas electrónicas permiten a las instituciones médicas, cuando tengan capacidad, proporcionar material de imágenes o vídeo electrónicamente y exigen que las copias electrónicas puedan leerse de forma independiente.[5] Eso no significa que todos los hospitales utilicen el mismo portal o puedan importar todos los paquetes de visores extranjeros.

Cargue los archivos desde una conexión estable. Mantenga abierto el navegador hasta que la plataforma indique que ha terminado y después guarde el justificante o una captura de pantalla. Que una barra de progreso llegue al 100% puede confirmar únicamente la transferencia a un servidor, no la importación satisfactoria al sistema de radiología.

## Proteja la identidad del paciente sin dañar el estudio

Los objetos DICOM pueden contener el nombre del paciente, su identificación, fechas y otra información dentro de los archivos; cambiar un nombre de archivo no los desidentifica.[2] Algunas imágenes también contienen texto incrustado en los píxeles.

Para la atención clínica directa, el hospital receptor generalmente necesita suficiente información de identidad para vincular el estudio al paciente de forma segura. Utilice su vía designada y su proceso de autorización.

Para investigación, docencia o un servicio de segunda lectura ciega, pregunte a la institución qué perfil de desidentificación requiere y quién lo aplica. No elimine etiquetas a la ligera: una desidentificación deficiente puede dejar información personal o eliminar atributos necesarios para vincular series y comparar estudios.

La Ley de Protección de Información Personal de China trata la información médico-sanitaria como sensible y exige una finalidad específica, necesidad y medidas de protección.[6] Envíe solo a destinatarios identificados, utilice caducidad de acceso cuando esté disponible y no publique enlaces de imágenes en chats públicos o grupos amplios.

## Acompañe cada estudio de su informe y traducción

Nombre los informes de modo que no se desvinculen de las imágenes:

- `2026-03-18_CT-chest-abdomen_report_ORIGINAL.pdf`
- `2026-03-18_CT-chest-abdomen_report_EN-translation.pdf`

Conserve el informe original aunque exista una traducción al inglés o al chino. Identifique al traductor y la fecha. La traducción no sustituye una nueva interpretación radiológica.

Si el informe original se modificó, envíe el informe final y todas las adendas. Indique qué versión considera vigente el hospital original.

## Confirme la importación, la integridad y la revisión clínica

Después de la carga, pida al equipo receptor que confirme:

1. Paciente y caso correctos
2. Fecha del estudio, parte del cuerpo y modalidad
3. Número de estudios recibidos
4. Si se importaron todas las series esperadas
5. Si están vinculados los estudios previos de comparación
6. Nombre o función del radiólogo que interpreta
7. Fecha prevista del informe o la consulta
8. Cómo se comunicarán los hallazgos urgentes

«Archivos recibidos» por parte de un coordinador es solo el primer paso. El parámetro de comunicación del ACR destaca que la información de imágenes solo es útil cuando se transmite oportunamente a los responsables de las decisiones terapéuticas.[3]

Pregunte si el resultado es una revisión multidisciplinar informal, un informe formal de segunda lectura o simplemente la disponibilidad de imágenes para el cirujano tratante. Estos productos no son intercambiables.

## Fallos habituales de transferencia y sus soluciones

### Solo se exportaron capturas de pantalla

Vuelva al centro de diagnóstico por imagen y solicite el estudio DICOM completo.

### El visor se abre, pero el hospital no importa nada

Localice las carpetas DICOM sin procesar o solicite una nueva exportación basada en estándares. No envíe únicamente el ejecutable del visor.

### El ZIP es demasiado grande

Pida al hospital una vía de mayor capacidad, divida por estudio completo en lugar de por un número arbitrario de archivos o envíe medios físicos cifrados. Nunca descarte series sin orientación radiológica.

### El nombre o pasaporte no coincide

No edite usted mismo los metadatos DICOM. Proporcione los identificadores antiguos y actuales y pida al hospital que documente la correspondencia durante la importación.

### El enlace seguro caduca

Conserve el archivo local intacto y solicite un enlace nuevo. No traslade la única copia a un portal temporal.

### El estudio está incompleto

Envíe el inventario y la descripción de las series que faltan al centro de origen. Una segunda carga debe etiquetarse como sustitución o complemento para que quien revise no interprete sin saberlo un estudio parcial.

## Lista final de comprobación de la transferencia

- Se indican la pregunta clínica y las comparaciones solicitadas
- Se ha obtenido el estudio DICOM completo
- Se incluyen el informe final y las adendas
- Se conserva el informe en el idioma original; la traducción está identificada
- Se han verificado el paciente, la fecha, la modalidad y la región corporal correctos
- Se han comprobado las series y los números de imágenes esperados
- Se ha dejado intacta la estructura interna de carpetas
- El archivo externo tiene un nombre claro y se abre correctamente
- Se han confirmado la vía del hospital, el límite de tamaño y el número de caso
- Se han revisado la privacidad y los permisos de acceso
- Se ha guardado el justificante de carga
- El hospital ha confirmado la importación y la integridad
- Se han registrado el revisor clínico identificado y la fecha de respuesta

**Aviso médico:** La transferencia de archivos no establece un diagnóstico. La adecuación de las imágenes, la comparación y las implicaciones terapéuticas deben evaluarlas profesionales cualificados con el caso completo. Los síntomas urgentes requieren evaluación médica local y no deben esperar una carga remota.

## Hospitales relacionados

Antes de enviar, verifique que el hospital de destino puede importar estudios DICOM externos, acepta la modalidad del estudio y ofrece la subespecialidad radiológica necesaria.

## Tratamientos relacionados

La planificación quirúrgica, la radioterapia, los procedimientos intervencionistas, la evaluación de respuesta del cáncer y la revisión neurológica u ortopédica suelen necesitar secuencias, fases o comparaciones previas específicas.

## Related Guides

- [Cómo organizar los registros médicos antes de buscar atención en China](/es/guides/china-healthcare-guides/how-to-organize-medical-records-before-seeking-care-in-china)
- [Revisión de registros de anatomía patológica y laboratorio antes del tratamiento en China](/es/guides/china-healthcare-guides/pathology-and-laboratory-record-review-before-treatment-in-china)
- [Cómo prepararse para una consulta a distancia con un médico en China](/es/guides/china-healthcare-guides/how-to-prepare-for-a-remote-consultation-with-a-doctor-in-china)
- [Proteger su privacidad médica al compartir registros internacionalmente](/es/guides/china-healthcare-guides/protecting-your-medical-privacy-when-sharing-records-internationally)

## Preguntas frecuentes

### ¿Puedo enviar por correo electrónico unas capturas de TC para una segunda opinión?

Pueden ayudar a explicar la pregunta, pero una revisión diagnóstica suele requerir el estudio DICOM completo y el informe pertinente.[1]

### ¿Qué es `DICOMDIR`?

Es un índice que suele incluirse en los medios DICOM para ayudar al software a identificar los estudios y archivos. Consérvelo con la estructura original de carpetas.[4]

### ¿Debo eliminar mi nombre de los archivos DICOM?

Para atención directa, siga las instrucciones del hospital sobre correspondencia de identidad. Para uso desidentificado, pida a un servicio cualificado que aplique el perfil requerido; cambiar nombres de carpetas no basta.[2]

### ¿Necesito enviar exploraciones antiguas?

Envíe las comparaciones que solicite el profesional receptor. Los estudios basales y los inmediatamente anteriores suelen ser importantes, pero la pertinencia depende de la pregunta clínica.[3]

### ¿Cómo sé que el hospital realmente revisó las imágenes?

Pregunte por el radiólogo o equipo revisor, la forma del resultado y la fecha prevista. Un justificante de carga confirma la transferencia, no la interpretación.

## SEO Metadata

- **Slug:** `how-to-share-ct-mri-and-other-imaging-files-with-a-chinese-hospital`
- **Meta title:** Compartir archivos de TC y RM con un hospital chino
- **Meta description:** Exporte estudios DICOM completos, verifique las series, proteja los datos del paciente y confirme la importación satisfactoria y la revisión radiológica en China.
- **Primary keyword:** enviar DICOM a un hospital chino
- **Pillar keyword:** atención sanitaria en China para pacientes internacionales
- **Vertical keyword:** compartir archivos TC RM China
- **Search intent:** informativa / preparación técnica
- **Secondary keywords:** cargar DICOM hospital China; segunda opinión TC China; transferencia de archivos RM China

## Fuentes

1. [Comité del Estándar DICOM: Acerca de DICOM](https://www.dicomstandard.org/about)
2. [Comité del Estándar DICOM: Conceptos clave de DICOM y datos integrados del paciente](https://www.dicomstandard.org/concepts)
3. [Colegio Americano de Radiología: Parámetro de práctica para la comunicación de hallazgos de diagnóstico por imagen](https://www.acr.org/-/media/ACR/Files/Practice-Parameters/communicationdiag.pdf)
4. [Comité del Estándar DICOM: Visualización de imágenes médicas desde un CD](https://www.dicomstandard.org/using/cds)
5. [Comisión Nacional de Salud: Especificación de gestión de aplicaciones de historias clínicas electrónicas](https://www.nhc.gov.cn/wjw/c100175/201702/90f3de8ae03d488cbddf509dc958f75b.shtml)
6. [Asamblea Popular Nacional: Ley de Protección de Información Personal de la República Popular China](https://www.npc.gov.cn/WZWSREL25wYy9jMi9jMzA4MzQvMjAyMTA4L3QyMDIxMDgyMF8zMTMwODguaHRtbD9yZWY9aW1i)
