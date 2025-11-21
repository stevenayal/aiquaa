# Generador de Informe Técnico - Bug Hunting

Herramienta para generar informes técnicos profesionales en PDF de las pruebas de Bug Hunting realizadas en AIQUAA Test App.

## 🎯 Objetivo

Facilitar la creación de informes técnicos estandarizados y profesionales que documenten los bugs encontrados durante las pruebas de Exploratory Testing & Bug Hunt, con cálculo automático de puntuación.

## ✨ Características

### 1. Formulario Estructurado de Bugs

Para cada bug encontrado, documenta:

- **Título**: Descripción breve y clara del bug
- **Severidad**: Critical / High / Medium / Low
- **Categoría**: Clasificación (Carrito, Checkout, UI, etc.)
- **Pasos para Reproducir**: Lista numerada de pasos
- **Resultado Esperado**: Comportamiento correcto
- **Resultado Real**: Comportamiento observado
- **Evidencia**: Screenshots, logs, referencias al audit log
- **Capturas de Pantalla**: Imágenes adjuntas (JPG, PNG, GIF, WebP - máx 5MB)

### 2. Cálculo Automático de Puntuación

El sistema calcula automáticamente la puntuación basándose en:

**Bugs Encontrados (15 pts max)**
- 1-2 bugs: 5 pts
- 3-4 bugs: 10 pts
- 5-6 bugs: 13 pts
- 7-8 bugs: 15 pts

**Calidad del Reporte (10 pts max)**
- Pasos claros y reproducibles: 5 pts
- Severidad correcta y justificada: 3 pts
- Evidencias incluidas: 2 pts

**Cobertura de Funcionalidades (5 pts max)**
- Exploró todas las secciones: 3 pts
- Probó edge cases: 2 pts

**Total: 30 puntos**

### 3. Generación de PDF Profesional

El PDF incluye:

- Logo y branding de AIQUAA
- Información del candidato (nombre, email, GitHub, Candidate ID)
- Resumen de la sesión de prueba (duración, secciones exploradas)
- Desglose de puntuación por categoría
- Lista completa de bugs con todos los detalles
- Badge de resultado (Aprobado si ≥ 21 puntos / 70%)
- Footer con fecha de generación

### 4. Carga Automática del Audit Log

El sistema carga automáticamente el audit log desde localStorage:
- Detecta secciones exploradas
- Cuenta eventos registrados
- Analiza la cobertura de la prueba

### 5. Carga de Capturas de Pantalla

Cada bug puede incluir múltiples capturas de pantalla como evidencia visual:
- Formatos soportados: JPG, PNG, GIF, WebP
- Tamaño máximo: 5MB por imagen
- Vista previa en tiempo real durante la edición
- Imágenes embebidas en el PDF generado
- Incluidas en formato base64 en la exportación JSON

### 6. Exportación a JSON

Además del PDF, puedes exportar el informe completo en formato JSON para:
- Revisión programática
- Integración con otros sistemas
- Backup de datos
- Incluye todas las imágenes en formato base64

## 🚀 Cómo Usar

### Paso 1: Realizar la Prueba de Bug Hunting

1. Accede a `/labs/test-app`
2. Inicia sesión con un Candidate ID
3. Explora la aplicación y busca bugs durante 30 minutos
4. El sistema registrará automáticamente todas tus acciones en el audit log

### Paso 2: Acceder al Generador

1. Navega a `/labs/test-app/report`
2. O desde AIQUAA Labs → Testing & Evaluación → Generador de Informe Técnico

### Paso 3: Completar Información del Candidato

Rellena los campos requeridos:
- **Nombre Completo** *
- **Email** *
- **Candidate ID** * (debe coincidir con el usado en la prueba)
- GitHub Profile (opcional)
- LinkedIn Profile (opcional)

### Paso 4: Documentar Bugs

Para cada bug encontrado:

1. Haz clic en "➕ Agregar Bug"
2. Completa el formulario:
   - Título descriptivo
   - Severidad apropiada
   - Categoría (opcional)
   - Pasos para reproducir (al menos 3)
   - Resultado esperado
   - Resultado real
   - Evidencia (opcional pero recomendado)
   - Capturas de pantalla (opcional - sube imágenes como evidencia visual)
3. Haz clic en "💾 Agregar Bug"

**Funciones adicionales:**
- ✏️ **Editar**: Modificar un bug ya agregado
- 🗑️ **Eliminar**: Quitar un bug de la lista
- **Agregar paso**: Agregar más pasos de reproducción
- **Quitar paso**: Eliminar un paso específico
- **📷 Subir capturas**: Adjunta imágenes haciendo clic en "Capturas de Pantalla"
- **Vista previa**: Las imágenes se muestran con preview y tamaño
- **Eliminar imagen**: Haz clic en ✕ sobre cada imagen para eliminarla

### Paso 5: Verificar Puntuación

La puntuación se calcula en tiempo real y se muestra en la parte superior:
- Bugs Encontrados: X/15 pts
- Calidad del Reporte: X/10 pts
- Cobertura: X/5 pts
- **Total: X/30 pts (X%)**

### Paso 6: Generar Informe

Opciones de exportación:

1. **📄 Generar PDF**: Descarga un PDF profesional con todos los detalles
2. **💾 Exportar JSON**: Descarga un archivo JSON con el informe completo

## 📊 Ejemplo de Uso

```typescript
// Información del candidato
{
  fullName: "Juan Pérez",
  email: "juan@example.com",
  githubProfile: "https://github.com/juanperez",
  candidateId: "candidate-123"
}

// Bug documentado
{
  title: "Total del carrito no recalcula impuestos",
  severity: "High",
  category: "Carrito",
  stepsToReproduce: [
    "Agregar un producto al carrito",
    "Ir a /labs/test-app/cart",
    "Incrementar la cantidad 3 veces seguidas rápidamente",
    "Observar el total con impuestos"
  ],
  expectedResult: "Los impuestos (10%) deben recalcularse inmediatamente al cambiar la cantidad",
  actualResult: "Los impuestos quedan con el valor anterior. Solo se actualizan al recargar la página",
  evidence: "Ver eventos UPDATE_CART_QTY en el audit log"
}

// Resultado del cálculo
{
  bugsFoundPoints: 15,      // 7 bugs encontrados
  reportQualityPoints: 9,   // Buena calidad
  coveragePoints: 5,        // Cobertura completa
  totalPoints: 29,
  maxPoints: 30,
  percentage: 96.7
}
```

## 🎨 Diseño del PDF

El PDF generado incluye:

### Página 1: Resumen
- Logo de AIQUAA (centrado en el encabezado)
- Título "AIQUAA | Informe Técnico"
- Subtítulo "Evaluación: Exploratory Testing & Bug Hunt"
- Badge de puntuación total
- Información del candidato
- Datos de la sesión de prueba
- Desglose de puntuación

### Páginas Siguientes: Bugs
Para cada bug:
- Número y título
- Badge de severidad (con color)
- Categoría
- Pasos para reproducir (numerados)
- Resultado esperado
- Resultado real
- Evidencia (si existe)
- Capturas de pantalla embebidas (si existen)

### Última Página: Footer
- Copyright de AIQUAA
- Fecha y hora de generación

## 🔧 Tecnologías Utilizadas

- **Next.js 13+** con App Router
- **TypeScript** para type safety
- **TailwindCSS** para estilos responsivos
- **jsPDF** para generación de PDF
- **LocalStorage** para cargar audit log
- **React Hooks** para gestión de estado

## 📁 Estructura de Archivos

```
apps/frontend/src/app/labs/test-app/report/
├── page.tsx           # Componente principal del generador
├── types.ts           # Interfaces TypeScript
├── utils.ts           # Funciones de cálculo y PDF
└── README.md          # Este archivo
```

## 💡 Tips para Mejores Resultados

### Documentación de Bugs

1. **Título Descriptivo**: "Total del carrito incorrecto" mejor que "Bug en carrito"
2. **Pasos Claros**: Sé específico y reproducible
3. **Severidad Apropiada**:
   - **Critical**: Sistema completamente roto, pérdida de datos
   - **High**: Funcionalidad principal no funciona
   - **Medium**: Funcionalidad secundaria afectada
   - **Low**: Problema cosmético o menor
4. **Evidencia Sólida**: Referencias al audit log, screenshots, etc.

### Maximizar Puntuación

1. **Encuentra 7-8 bugs válidos** para máxima puntuación
2. **Documenta con al menos 3 pasos** por cada bug
3. **Incluye evidencia** en cada reporte
4. **Explora todas las secciones** de la aplicación
5. **Prueba edge cases**: inputs extremos, límites, etc.

### Cobertura Completa

Asegúrate de explorar:
- ✅ Catálogo de productos
- ✅ Detalle de producto
- ✅ Carrito de compras
- ✅ Proceso de checkout
- ✅ Perfil de usuario
- ✅ Sistema de soporte
- ✅ Historial de pedidos

## ⚠️ Limitaciones

- El audit log solo está disponible si se usó el Test App en la misma sesión del navegador
- La puntuación es una estimación automática y puede requerir revisión manual
- Imágenes muy grandes (>5MB) no serán aceptadas por el validador
- Máximo recomendado: 10 bugs por informe con 2-3 imágenes cada uno para mantener claridad
- El PDF puede ser grande si hay muchas imágenes de alta resolución

## 📞 Soporte

Si tienes problemas o sugerencias:

- **Email:** soporte@aiquaa.com
- **GitHub Issues:** https://github.com/stevenayal/aiquaa/issues

## 🎓 Recursos Relacionados

- [AIQUAA Test App README](../README.md)
- [Formato de Reporte de Bugs](../README.md#-formato-de-reporte-de-bugs)
- [Lista de Bugs Potenciales](../README.md#-lista-de-bugs-potenciales)
- [Criterios de Evaluación](../README.md#-criterios-de-evaluación)

---

**¡Documenta bien tus hallazgos y genera informes profesionales!** 📋✨
