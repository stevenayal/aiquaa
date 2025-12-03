# 🎯 Tablero de Experimentación Javelin (Javelin Experiment Board)

**Fecha de creación:** 3 de diciembre de 2024
**Proyecto:** AIQUAA - Módulo de Validación de Features
**Versión:** 1.0

---

## 📋 Idea a Validar

> **"Crear un módulo en AIQUAA que permita a testers medir interés real de herramientas y features antes de desarrollarlas."**

---

## 1. 🎯 Hipótesis Iniciales

### 1.1 Segmento de Cliente

**Hipótesis Principal:**
Testers de software en Paraguay (QA Engineers, QA Leads, Test Managers) que:
- Trabajan en empresas tech (startups, consultoras, corporativos)
- Necesitan tomar decisiones sobre herramientas y procesos de testing
- Tienen influencia en la adopción de nuevas prácticas o tecnologías
- Participan activamente en comunidades de QA

**Sub-segmentos identificados:**
1. **QA Leads en startups** (5-20 personas): Toman decisiones rápidas, presupuesto limitado
2. **Test Managers en corporativos** (50+ personas): Procesos formales, presupuesto mayor, necesitan justificación con datos
3. **QA Engineers independientes/freelancers**: Buscan herramientas que los diferencien, invierten en capacitación
4. **Estudiantes/juniors de QA**: Quieren saber qué aprender, qué herramientas tienen futuro

---

### 1.2 Problema desde la Perspectiva del Cliente

**Problema Core:**
*"Como tester, invierto tiempo y esfuerzo aprendiendo herramientas, frameworks o técnicas que luego descubro que no se usan en la industria local, o que no resuelven problemas reales de mi equipo."*

**Problemas relacionados:**

| Problema | Segmento | Intensidad (1-10) |
|----------|----------|-------------------|
| No sé qué herramientas de testing están usando otros testers en Paraguay | Todos | 7 |
| Necesito justificar ante mi jefe por qué adoptar una nueva herramienta | QA Leads, Test Managers | 9 |
| Pierdo tiempo evaluando herramientas que al final no adoptamos | QA Engineers | 8 |
| No sé si vale la pena certificarme en X framework o herramienta | QA Engineers, Juniors | 7 |
| Mi equipo no se pone de acuerdo sobre qué stack de testing usar | QA Leads | 6 |

---

### 1.3 Por Qué Este Problema Realmente Importa

**Impacto en el trabajo diario:**
- ⏱️ **Tiempo perdido:** 2-4 semanas evaluando herramientas que no se adoptan
- 💰 **Costo económico:** Licencias de prueba, cursos, certificaciones innecesarias
- 😤 **Frustración:** Aprender algo que luego no se usa genera desmotivación
- 🚫 **Decisiones equivocadas:** Adoptar herramientas por moda, no por necesidad real
- 📉 **Oportunidades perdidas:** No adoptar herramientas que sí resolverían problemas

**Frecuencia del problema:**
- Cada 3-6 meses (cuando evalúan nuevas herramientas)
- Al inicio de cada proyecto nuevo
- Antes de contratar personal (¿qué skills buscar?)

**Alternativas actuales (workarounds):**
1. Preguntar en LinkedIn/grupos de WhatsApp → Respuestas sesgadas, poco estructuradas
2. Hacer encuestas informales → Bajo engagement, datos poco confiables
3. Confiar en blogs/videos extranjeros → No refleja realidad local
4. Probar todo ellos mismos → Consume mucho tiempo

---

### 1.4 Señales Actuales que Indican que el Problema Existe

**Evidencia observada:**

| Señal | Fuente | Validación |
|-------|--------|------------|
| Posts frecuentes en LinkedIn PY preguntando "¿Qué herramienta recomiendan para X?" | LinkedIn | ✅ Observado semanalmente |
| Grupos de WhatsApp de QA con debates sobre herramientas | Comunidad AIQUAA | ✅ 3-5 threads por mes |
| Empresas pidiendo recomendaciones de stack de testing | Consultas directas | ⚠️ Anecdótico (2-3 casos) |
| Baja adopción de herramientas tras capacitaciones | Feedback de trainers | ⚠️ A validar con datos |
| Testers quejándose de aprender cosas "que no sirven" | Foros, comentarios | ✅ Recurrente |

**Datos cuantitativos preliminares:**
- 📊 **Posts en LinkedIn sobre herramientas de testing:** ~5-8 por semana en comunidad PY
- 👥 **Engagement en esos posts:** 10-30 comentarios, 50-100 reacciones
- 🔍 **Búsquedas en AIQUAA sobre herramientas específicas:** A validar con analytics
- 📚 **Asistencia a webinars sobre "nuevas herramientas":** Alta (50-80 personas)

---

## 2. 🔍 Contrastación de Hipótesis

### 2.1 Tabla de Validación de Hipótesis

| Hipótesis | ✅ Qué SÉ | ❌ Qué NO sé | 🤔 Qué ASUMO | 🧪 Qué debo VALIDAR |
|-----------|----------|-------------|-------------|-------------------|
| **Los testers pierden tiempo evaluando herramientas** | Posts en redes preguntando por recomendaciones | Cuánto tiempo exactamente pierden | Que es más de 1 semana | Pregunta directa: "¿Cuántas horas al mes dedicas a evaluar herramientas?" |
| **Necesitan justificar decisiones con datos** | Test Managers piden "benchmarks" en consultas | Qué tipo de datos necesitan (ROI, adopción, casos de uso) | Que datos cuantitativos son más importantes que cualitativos | Entrevista: "¿Qué información necesitas para convencer a tu jefe?" |
| **La opinión de otros testers locales es valiosa** | Alto engagement en posts sobre herramientas | Si confiarían en un sistema de votación/rating | Que prefieren opinión local vs internacional | Experimento: Landing con "Vota por tu herramienta favorita" y medir conversión |
| **Pagarían por acceso a estos datos** | Algunos pagan por cursos y certificaciones | Si pagarían por un módulo de validación | Que el precio aceptable es <$20/mes | Pregunta: "¿Cuánto pagarías por esto?" + Test de oferta falsa |
| **Este problema es más importante que otros** | Muchas consultas sobre herramientas | Si este es su TOP problema o uno más | Que es TOP 3 | Ranking forzado: "Ordena estos 5 problemas por importancia" |

---

### 2.2 Gaps de Información Críticos

**🔴 Información que NO tengo y NECESITO:**

1. **Voluntad de pago:**
   - ¿Pagarían por esta feature?
   - ¿Cuánto?
   - ¿Pago único, mensual, anual?
   - ¿Pagaría la empresa o el tester de su bolsillo?

2. **Frecuencia real del problema:**
   - ¿Cada cuánto evalúan herramientas?
   - ¿Es suficientemente frecuente como para pagar por una solución?

3. **Datos necesarios para tomar decisiones:**
   - ¿Qué tipo de información les ayudaría? (% de uso, casos de éxito, curva de aprendizaje, costo)
   - ¿Formato preferido? (gráficos, tablas, testimonios)

4. **Competencia:**
   - ¿Existen soluciones similares que ya usen?
   - ¿Por qué no les sirven?

---

## 3. ⚠️ Suposición Más Arriesgada (Riskiest Assumption)

### 🎲 Suposición Crítica

> **"Los testers están dispuestos a usar activamente un sistema de votación/feedback sobre herramientas, y confían en la validez de los datos agregados de la comunidad."**

### ❗ Por Qué es Crítica

Si esta suposición es **FALSA**, entonces:
- ❌ No habrá datos suficientes para generar valor
- ❌ La plataforma será una base de datos vacía o con poca actividad
- ❌ Los usuarios no verán valor porque no hay información útil
- ❌ Efecto red negativo: sin usuarios, no hay datos; sin datos, no hay usuarios

**Impacto:** Invalida todo el modelo de negocio.

---

### 🧪 Cómo Comprobarla (Rápido y Barato)

**Experimento 1: Landing Page con Pre-Registro + Incentivo**

1. Crear landing page simple:
   - Título: "Ayuda a la comunidad QA de Paraguay: ¿Qué herramientas realmente usas?"
   - Formulario: "Vota por tus 3 herramientas de testing favoritas"
   - Incentivo: "Recibe el reporte con los resultados agregados"

2. Difundir en:
   - Grupos de WhatsApp de QA
   - LinkedIn
   - Email a base de datos de AIQUAA

3. Medir:
   - % de clics que completan el formulario
   - Tiempo promedio de respuesta
   - % que deja email para recibir reporte

**Costo:** $0-50 (landing + email marketing)
**Tiempo:** 3-5 días
**Meta:** >30% de conversión (de visita a formulario completado)

---

**Experimento 2: Google Form + Reporte Manual**

1. Crear Google Form con 10 preguntas sobre herramientas que usan
2. Enviar a 50 testers de la base de AIQUAA
3. Prometer enviarles un PDF con los resultados agregados
4. Medir:
   - % de respuesta
   - Calidad de respuestas (¿responden en serio o al azar?)
   - % que abre el PDF cuando se envía

**Costo:** $0
**Tiempo:** 2-3 días
**Meta:** >40% de respuesta, >60% abre el PDF

---

### 📊 Señales Positivas vs Negativas

| Señal | ✅ Positiva (seguir) | ❌ Negativa (pivotar) |
|-------|---------------------|---------------------|
| **Tasa de respuesta** | >40% completa la encuesta | <20% completa |
| **Calidad de respuestas** | Respuestas detalladas, coherentes | Respuestas vagas, al azar, duplicadas |
| **Interés en resultados** | >60% abre el reporte, preguntan cuándo sale | <30% abre, nadie pregunta |
| **Engagement post-reporte** | Comentarios, shares, "¿cuándo la próxima?" | Silencio total |
| **Voluntad de pagar** | >50% dice "pagaría $X por esto" | <20% o "debería ser gratis" |

---

## 4. 🌫️ Suposición Más Incierta (Most Uncertain Assumption)

### ❓ Hipótesis con MENOS Información

> **"Los testers tienen el presupuesto y la autoridad para pagar por un módulo premium de AIQUAA (o pueden convencer a su empresa de pagarlo)."**

### 📉 Por Qué es Incierta

**Información que falta:**
- No sabemos el presupuesto promedio de capacitación/herramientas de un tester en Paraguay
- No sabemos si las empresas pagan por este tipo de herramientas o es gasto personal
- No sabemos el precio que consideran "razonable"
- No sabemos si prefieren pago mensual, anual o único

**Riesgo:**
- Aunque validen el problema y el valor, si no pueden/quieren pagar, no es un negocio viable
- Podría ser una feature "nice-to-have" pero no un producto standalone

---

### 🎯 Qué Datos Necesito

1. **Presupuesto disponible:**
   - ¿Cuánto gastas al año en herramientas/capacitación de testing?
   - ¿Quién paga? (empresa vs personal)

2. **Disposición a pagar:**
   - ¿Pagarías por este módulo? Sí/No
   - ¿Cuánto? (rangos: <$10, $10-20, $20-50, >$50/mes)

3. **Modelo de pricing preferido:**
   - ¿Preferís pago mensual, anual, o único?
   - ¿Preferís freemium (básico gratis, premium pago)?

4. **Alternativas:**
   - ¿Qué usas hoy para resolver este problema?
   - ¿Cuánto pagas por esas alternativas?

---

### 🧪 Experimento Mínimo para Validar

**Experimento: "Oferta Falsa" (Fake Door Test)**

1. **En la landing del experimento anterior**, agregar al final:
   - "🎁 Acceso anticipado por $15/mes (50% OFF)"
   - Botón: "Quiero acceso anticipado"
   - Al hacer clic → "Gracias por tu interés. Te contactaremos en 48hs para confirmar."

2. **Medir:**
   - % de clics en el botón de pago
   - Comentarios/objeciones cuando contactemos (¿precio?, ¿por qué no gratis?)

3. **Follow-up manual:**
   - Llamar/email a los que hicieron clic
   - Preguntar: "¿Seguís interesado? ¿A qué precio sí pagarías?"
   - Explicar que aún no está listo, pero queremos validar interés

**Meta de éxito:**
- >10% de los que completaron la encuesta hacen clic en "Quiero pagar"
- Al menos 5 personas confirman interés real tras el follow-up

---

## 5. ✅ Criterios de Éxito (Validation Criteria)

### 5.1 Criterios Cuantitativos

| Métrica | Mínimo Aceptable | Objetivo Ideal | Cómo Medir |
|---------|------------------|----------------|------------|
| **% de testers que reconocen el problema** | 60% | 80%+ | Pregunta: "¿Alguna vez perdiste tiempo evaluando una herramienta que al final no adoptaste?" |
| **Intensidad del problema (1-10)** | 7/10 | 9/10 | "En una escala de 1 a 10, ¿qué tan frustrante es este problema?" |
| **Frecuencia del problema** | 1 vez cada 6 meses | 1 vez al mes | "¿Cada cuánto evalúas nuevas herramientas de testing?" |
| **Disposición a usar la solución** | 50% usaría | 70%+ usaría | "Si existiera esto, ¿lo usarías?" (Sí/No) |
| **Intención de pago** | 30% pagaría | 50%+ pagaría | "¿Pagarías $15/mes por esto?" (Sí/No) |
| **Engagement en experimento** | 40% completa encuesta | 60%+ completa | Google Analytics / Form responses |
| **Referral/virality** | 20% comparte con colegas | 40%+ comparte | "¿Recomendarías esto a un colega?" (NPS) |

---

### 5.2 Señales Cualitativas de Validación

**✅ Señales FUERTES de que vale la pena:**

1. **"Shut up and take my money!"**
   - Preguntan cuándo estará listo
   - Ofrecen pagar por adelantado
   - Piden ser beta testers

2. **"Esto me salvó la vida"**
   - Cuentan historias específicas de cómo les hubiera ayudado
   - Dan ejemplos concretos de decisiones que tomaron mal

3. **"¿Puedo ayudar?"**
   - Ofrecen colaborar en el diseño
   - Quieren hacer entrevistas de descubrimiento
   - Conectan con otros potenciales usuarios

4. **Acción inmediata**
   - Completan encuestas largas (>5 min)
   - Dejan datos reales (email, teléfono)
   - Abren emails de seguimiento

---

**❌ Señales DÉBILES (red flags):**

1. **"Está bueno, pero..."**
   - Dicen que sí, pero ponen objeciones vagas
   - "Lo usaría si fuera gratis"
   - "Me parece interesante" (tibio, no entusiasmado)

2. **"Ya hago algo similar"**
   - Tienen workarounds que funcionan "bien"
   - No ven urgencia en cambiar

3. **"No tengo tiempo"**
   - No completan la encuesta
   - No responden follow-ups
   - No abren emails

4. **Precio como objeción principal**
   - Primeras preguntas son sobre costo
   - "¿Por qué no es gratis?"
   - Negocian descuentos antes de ver valor

---

## 6. 🧪 Experimentos Propuestos

### Experimento #1: Landing Page + Encuesta de Validación

**📌 Objetivo:**
Validar si el problema existe y si hay interés en la solución.

**🔧 Tipo:**
Landing page + Google Form + Oferta falsa (fake door)

---

**📋 Pasos Detallados:**

1. **Crear Landing Page** (1 día)
   - Herramienta: Notion + Super.so (gratis) o Carrd ($19/año)
   - Contenido:
     - Headline: "¿Cansado de perder tiempo probando herramientas de testing que nadie más usa?"
     - Subheader: "Descubre qué herramientas usan realmente los testers en Paraguay antes de invertir tiempo y dinero."
     - Bullet points de beneficios
     - Call-to-action: "Ayuda a crear el primer mapa de herramientas QA de Paraguay"
     - Formulario embebido (Google Form)

2. **Crear Encuesta** (2 horas)
   - Preguntas (máximo 10):
     1. ¿Cuál es tu rol? (QA Engineer, QA Lead, Test Manager, Otro)
     2. ¿Cuántos años de experiencia tienes?
     3. ¿Cada cuánto evalúas nuevas herramientas de testing? (mensual, trimestral, semestral, anual)
     4. ¿Alguna vez invertiste tiempo aprendiendo una herramienta que luego no usaste? (Sí/No)
     5. Si Sí: ¿Cuánto tiempo perdiste? (<1 semana, 1-2 semanas, 1 mes, >1 mes)
     6. ¿Qué tan frustrante fue? (escala 1-10)
     7. Antes de adoptar una herramienta, ¿te gustaría saber cuántos testers en Paraguay la usan? (Sí/No)
     8. ¿Pagarías $15/mes por acceder a datos sobre qué herramientas usa la comunidad QA de Paraguay? (Sí/No/Depende)
     9. Si "Depende": ¿A qué precio sí? (campo abierto)
     10. Deja tu email si querés recibir el reporte con los resultados (opcional)

3. **Agregar "Fake Door" al final** (30 min)
   - Después de enviar la encuesta:
     - "¡Gracias! Como agradecimiento, te ofrecemos acceso anticipado con 50% de descuento: $15/mes (precio normal $30/mes)"
     - Botón: "Quiero acceso anticipado"
     - Al hacer clic → "¡Excelente! Te contactaremos en 48hs para confirmar tu lugar."

4. **Difundir** (1 semana)
   - LinkedIn: 3 posts (lunes, miércoles, viernes)
   - Grupos de WhatsApp de QA: 1 mensaje
   - Email a base de AIQUAA: 1 envío (si hay >100 contactos)
   - Stories de Instagram (si AIQUAA tiene)

5. **Follow-up con interesados en pagar** (1 semana)
   - Contactar a quienes hicieron clic en "Quiero pagar"
   - Preguntas:
     - ¿Qué te motivó a querer pagar?
     - ¿Qué información específica te ayudaría a tomar decisiones?
     - ¿$15/mes te parece razonable? ¿Por qué?
     - ¿Pagarías tú o tu empresa?

---

**📊 Señales de Éxito:**

| Métrica | 🟢 Éxito | 🟡 Revisar | 🔴 Pivotar |
|---------|----------|-----------|-----------|
| Tasa de respuesta | >50% | 30-50% | <30% |
| Reconocimiento del problema | >70% | 50-70% | <50% |
| Intensidad del problema (1-10) | >8 | 6-8 | <6 |
| Interés en solución | >60% | 40-60% | <40% |
| Clics en "Quiero pagar" | >15% | 8-15% | <8% |
| Confirmación de pago tras follow-up | >50% de los que hicieron clic | 30-50% | <30% |

---

**⚠️ Riesgos:**

1. **Bajo engagement:** Solución → Agregar incentivo (sorteo, reporte premium)
2. **Respuestas sesgadas:** Solución → Hacer entrevistas 1-1 para validar
3. **Fake door genera frustración:** Solución → Ser muy transparente ("Estamos validando la idea, no hay producto aún")
4. **No hay suficiente tráfico:** Solución → Invertir $50 en ads de LinkedIn/Facebook

---

### Experimento #2: Entrevistas de Descubrimiento (Discovery Interviews)

**📌 Objetivo:**
Entender en profundidad el problema, el contexto y las alternativas actuales.

**🔧 Tipo:**
Entrevistas cualitativas 1-1 (presencial o videollamada)

---

**📋 Pasos:**

1. **Reclutar 10-15 testers** (3 días)
   - Perfil: Mix de juniors, mids, seniors, leads
   - Incentivo: $10 de saldo en AIQUAA o café gratis
   - Contactar vía LinkedIn, WhatsApp, email

2. **Guía de entrevista** (30-45 min cada una)
   - Introducción (5 min): Explicar objetivo, no estás vendiendo nada
   - Contexto (10 min): Rol, experiencia, proyectos actuales
   - Exploración del problema (15 min):
     - Cuéntame sobre la última vez que evaluaste una herramienta de testing.
     - ¿Cómo decidiste qué evaluar?
     - ¿Qué información buscaste? ¿Dónde?
     - ¿Cuánto tiempo te tomó?
     - ¿La adoptaste finalmente? ¿Por qué sí/no?
     - ¿Qué hubiera hecho más fácil esa decisión?
   - Soluciones actuales (10 min):
     - ¿Qué haces hoy cuando necesitas decidir sobre una herramienta?
     - ¿Qué funciona bien? ¿Qué no?
   - Cierre (5 min): ¿Algo más que quieras agregar?

3. **Analizar patrones** (2 días)
   - Transcribir notas clave
   - Buscar frases repetidas ("pain points" comunes)
   - Agrupar por temas

---

**📊 Señales de Éxito:**

- ✅ >70% mencionan espontáneamente el problema de "perder tiempo"
- ✅ >50% dicen que confiarían en opiniones de la comunidad local
- ✅ Identificar 3-5 "jobs-to-be-done" claros

---

### Experimento #3: MVP Mínimo (Notion + Google Sheets)

**📌 Objetivo:**
Probar si usan activamente un sistema de votación sin desarrollar nada.

**🔧 Tipo:**
Prototipo no-code (Notion público)

---

**📋 Pasos:**

1. **Crear página de Notion pública** (3 horas)
   - Tabla con columnas: Herramienta | Categoría | Votos | Casos de uso
   - Pre-cargar 20-30 herramientas populares (Selenium, Cypress, Postman, JMeter, k6, etc.)
   - Instrucciones: "Agrega un comentario con tu herramienta favorita"

2. **Difundir** (1 semana)
   - LinkedIn: "Ayuda a crear el mapa de herramientas QA de Paraguay 🇵🇾"
   - Link directo a Notion
   - Call-to-action: "Vota por tus favoritas"

3. **Medir engagement** (1 semana)
   - Visitas al Notion (analytics de Notion)
   - Comentarios dejados
   - Shares del link

---

**📊 Señales de Éxito:**

| Métrica | 🟢 Éxito | 🔴 Fracaso |
|---------|----------|-----------|
| Visitas | >200 | <50 |
| Comentarios | >30 | <10 |
| Shares | >15 | <5 |

---

## 7. 📝 Registro de Aprendizaje

### 7.1 Resultados de Experimentos

**Experimento 1: Landing Page + Encuesta**

| Métrica | Resultado | Fecha | Observaciones |
|---------|-----------|-------|---------------|
| Visitas a landing | - | - | - |
| Tasa de conversión (visita → encuesta) | - | - | - |
| Respuestas totales | - | - | - |
| % que reconoce el problema | - | - | - |
| Intensidad del problema (promedio 1-10) | - | - | - |
| % que haría clic en "Quiero pagar" | - | - | - |
| % que confirma pago tras follow-up | - | - | - |

**Insights clave:**
- (Anotar descubrimientos inesperados)
- (Anotar objeciones recurrentes)
- (Anotar quotes memorables)

---

**Experimento 2: Entrevistas de Descubrimiento**

| Fecha | Participante | Rol | Insights Clave |
|-------|--------------|-----|----------------|
| - | - | - | - |

**Patrones identificados:**
- (Pain points recurrentes)
- (Soluciones actuales)
- (Jobs-to-be-done)

---

**Experimento 3: MVP Notion**

| Métrica | Resultado | Fecha |
|---------|-----------|-------|
| Visitas | - | - |
| Comentarios/votos | - | - |
| Shares | - | - |

---

### 7.2 Decisiones Tomadas

| Fecha | Decisión | Fundamento | Responsable |
|-------|----------|------------|-------------|
| - | - | - | - |

**Ejemplo de decisiones posibles:**
- ✅ Seguir adelante → Construir MVP real
- 🔄 Pivotar → Cambiar segmento de cliente
- 🔄 Pivotar → Cambiar modelo de negocio (de pago a freemium)
- ❌ Cancelar → El problema no es suficientemente grande/frecuente

---

### 7.3 Próximos Pasos

**Si los experimentos validan la hipótesis:**

1. **Diseñar MVP técnico** (2 semanas)
   - Sistema de votación
   - Dashboard con gráficos
   - Integración con AIQUAA

2. **Beta cerrado con 20 early adopters** (1 mes)
   - Reclutar a los que mostraron más interés
   - Iterar según feedback

3. **Lanzamiento público** (1 mes después)
   - Campaña de marketing
   - Pricing definido
   - Métricas de activación/retención

---

**Si los experimentos NO validan:**

1. **Analizar por qué falló**
   - ¿Problema no existe?
   - ¿Segmento equivocado?
   - ¿Solución no es la correcta?

2. **Considerar pivots:**
   - Enfocarse en un sub-segmento específico (ej: solo QA Leads)
   - Cambiar el valor: en vez de "validar herramientas", "conectar con expertos que las usan"
   - Hacer la feature gratis pero cobrar por otros servicios (ej: consultoría, capacitaciones)

3. **Documentar aprendizajes**
   - ¿Qué hipótesis era falsa?
   - ¿Qué aprendimos sobre el segmento?
   - ¿Qué otros problemas descubrimos?

---

## 📊 Resumen Ejecutivo

### Timeline Propuesto

| Semana | Actividad | Output Esperado |
|--------|-----------|-----------------|
| Semana 1 | Experimento 1: Landing + Encuesta | 50-100 respuestas |
| Semana 2 | Experimento 2: Entrevistas (10-15) | Insights cualitativos |
| Semana 3 | Experimento 3: MVP Notion | Validar engagement |
| Semana 4 | Análisis de resultados + Decisión | Go/No-Go |

### Inversión Total

| Recurso | Costo |
|---------|-------|
| Tiempo (diseño + ejecución) | ~40 horas |
| Herramientas (Carrd, incentivos) | $50-100 |
| Ads (opcional) | $50 |
| **TOTAL** | **$100-150 + 40 horas** |

### Criterio de Decisión Final

**✅ Seguir adelante si:**
- >60% reconoce el problema como importante (7+/10)
- >40% usaría la solución activamente
- >20% tiene intención clara de pago
- Patrones claros en entrevistas sobre el problema

**❌ Pivotar/cancelar si:**
- <40% reconoce el problema
- Baja intención de uso (<30%)
- Precio es objeción principal sin reconocer valor
- No hay engagement en MVP de prueba

---

## 📚 Referencias y Recursos

- **Metodología Javelin:** [Javelin Experiment Board](https://www.javelin.com/experiment-board.html)
- **Jobs-to-be-Done:** [JTBD Framework](https://jtbd.info/)
- **Entrevistas de descubrimiento:** "The Mom Test" - Rob Fitzpatrick
- **Experimentos Lean:** "The Lean Startup" - Eric Ries

---

**Última actualización:** 3 de diciembre de 2024
**Próxima revisión:** (Fecha después de experimentos)
