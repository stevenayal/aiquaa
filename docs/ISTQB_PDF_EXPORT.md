# Exportación PDF - Simulador ISTQB

## Descripción

Sistema de exportación de informes detallados en formato PDF para el simulador ISTQB CTFL v4.0. Genera un documento profesional con todos los detalles del examen completado.

## Características

- 📄 **PDF Profesional**: Documento multipágina con diseño limpio y organizado
- 🎨 **Diseño Atractivo**: Header con gradiente, colores de marca AIQUAA
- 📊 **Contenido Completo**:
  - Estado de aprobación visual (APROBADO/NO APROBADO)
  - Información del participante
  - Resumen de resultados con métricas
  - Desglose por Learning Objectives con colores
  - Detalle completo de todas las preguntas
  - Explicaciones para respuestas incorrectas
- ✅ **Indicadores Visuales**: Iconos ✓/✗ para respuestas correctas e incorrectas
- 🎯 **Learning Objectives con Colores**:
  - Verde: ≥70%
  - Amarillo: 50-69%
  - Rojo: <50%
- 📱 **Responsive**: Paginación automática
- 🔢 **Numeración de Páginas**: Pie de página en todas las páginas

## Tecnologías

- **jsPDF** v3.0.3 - Librería para generar PDFs
- **jspdf-autotable** v5.0.2 - Plugin para tablas en PDF
- **TypeScript** - Type-safe

## Estructura del PDF Generado

### Página 1: Header y Resumen

#### Header (Gradiente Amber)
```
🎯 AIQUAA
Simulador ISTQB CTFL v4.0
Informe de Resultados del Examen
```

#### Estado del Examen
- Box con color de fondo (verde/rojo)
- Ícono grande (✓/✗)
- Texto: APROBADO / NO APROBADO
- Puntaje: X/40 (XX%)

#### Información del Participante
Tabla con:
- Nombre
- Fecha y hora
- Tiempo empleado
- Modo (EXAMEN/ENTRENAMIENTO)

#### Resumen de Resultados
Tabla con:
- Puntaje Total
- Respuestas Correctas
- Respuestas Incorrectas
- Porcentaje de Acierto

#### Desglose por Learning Objectives
Tabla con columnas:
- Learning Objective (ej: FL-1.1.1)
- Resultado (X/Y)
- Porcentaje (con color según rendimiento)

### Páginas 2+: Detalle de Preguntas

Para cada pregunta:
- Número de pregunta + ícono de estado
- Learning Objective y K-Level (badges)
- Texto completo de la pregunta
- Tu respuesta (con ✓ si correcta, ✗ si incorrecta)
- Respuesta correcta (solo si fue incorrecta)
- Explicaciones de cada opción (solo si fue incorrecta)
  - Cada explicación con color:
    - Verde: Opción correcta
    - Gris: Opción incorrecta

### Footer (Todas las Páginas)
- Copyright © 2024 AIQUAA
- Número de página (Página X de Y)

## Uso

### Desde el Simulador

1. Completa un examen en el simulador ISTQB
2. En la pantalla de resultados, haz clic en el botón **📄 Exportar PDF**
3. El PDF se descargará automáticamente con el nombre:
   ```
   ISTQB-[Nombre-Participante]-[Fecha].pdf
   ```

### Programáticamente

```typescript
import { generateExamPDF } from '@/app/labs/istqb/utils/pdfExport';
import type { ExamResult } from '@/app/labs/istqb/types';

// Generar PDF
const result: ExamResult = {
  participantName: 'Juan Pérez',
  score: 32,
  totalQuestions: 40,
  correctAnswers: 32,
  incorrectAnswers: 8,
  percentage: 80.0,
  passed: true,
  timeSpent: 3600,
  answers: [...],
  learningObjectiveAnalysis: [...]
};

const mode: 'exam' | 'training' = 'exam';

// Genera y descarga el PDF
generateExamPDF(result, mode);
```

## Estructura de Archivos

```
apps/frontend/src/app/labs/istqb/
├── utils/
│   ├── pdfExport.ts              # Generación de PDF
│   └── index.ts                  # Exportaciones (CSV, etc.)
├── components/
│   └── ResultsScreen.tsx         # Componente con botón de PDF
└── types.ts                      # Tipos TypeScript
```

## Ejemplo de Código

### Función Principal: `generateExamPDF`

```typescript
export function generateExamPDF(result: ExamResult, mode: 'exam' | 'training'): void {
  const doc = new jsPDF();

  // Header con gradiente
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('AIQUAA', pageWidth / 2, 18, { align: 'center' });

  // Estado del examen
  const statusBgColor = result.passed ? [222, 247, 236] : [254, 226, 226];
  const statusIcon = result.passed ? '✓' : '✗';

  // Tablas con autoTable
  autoTable(doc, {
    startY: yPosition,
    head: [['Learning Objective', 'Resultado', 'Porcentaje']],
    body: loData,
    theme: 'striped',
    ...
  });

  // Guardar
  doc.save(`ISTQB-${result.participantName}-${date}.pdf`);
}
```

### Handler en Componente

```typescript
const handleExportPDF = () => {
  generateExamPDF(result, mode);
};

// JSX
<button onClick={handleExportPDF}>
  📄 Exportar PDF
</button>
```

## Personalización

### Colores

Para cambiar los colores del PDF, modifica los valores RGB en `pdfExport.ts`:

```typescript
// Header
doc.setFillColor(245, 158, 11); // Amber

// Estado aprobado
const successBg = [222, 247, 236];  // Verde claro
const successText = [22, 163, 74];  // Verde oscuro

// Estado reprobado
const errorBg = [254, 226, 226];    // Rojo claro
const errorText = [220, 38, 38];    // Rojo oscuro
```

### Fuentes

jsPDF incluye las siguientes fuentes por defecto:
- `helvetica` (normal, bold, italic, bolditalic)
- `times`
- `courier`

Ejemplo:
```typescript
doc.setFont('helvetica', 'bold');
doc.setFontSize(14);
```

### Logo

Para agregar un logo en el header:

```typescript
// Convertir imagen a base64
const logoBase64 = 'data:image/png;base64,...';

// Agregar imagen
doc.addImage(logoBase64, 'PNG', x, y, width, height);
```

## Troubleshooting

### PDF no se descarga

1. **Verifica permisos del navegador**: Algunos navegadores bloquean descargas automáticas
2. **Revisa la consola**: Busca errores de JavaScript
3. **Prueba en incógnito**: Deshabilita extensiones que puedan interferir

### Contenido cortado

Si el contenido se corta entre páginas:

```typescript
// Verificar altura antes de agregar contenido
if (yPosition > pageHeight - 60) {
  doc.addPage();
  yPosition = 20;
}
```

### Caracteres especiales

Para caracteres especiales (tildes, ñ, etc.), asegúrate de usar UTF-8:

```typescript
doc.setFont('helvetica'); // Soporta caracteres latinos
```

### Tablas muy anchas

Si una tabla es muy ancha:

```typescript
autoTable(doc, {
  ...
  columnStyles: {
    0: { cellWidth: 80 },  // Ancho fijo
    1: { cellWidth: 35 },
  },
  margin: { left: 10, right: 10 },
});
```

## Performance

### Tamaño del PDF

- PDF básico (sin imágenes): ~50-150 KB
- Con 40 preguntas detalladas: ~100-200 KB
- Tiempo de generación: <1 segundo

### Optimización

Para PDFs grandes con muchas preguntas:

1. **Lazy Loading**: Genera el PDF solo cuando se hace clic
2. **Compresión**: jsPDF comprime automáticamente
3. **Imágenes**: Usa PNG/JPG comprimidos si agregas imágenes

## Accesibilidad

El PDF generado incluye:

- ✅ Texto seleccionable (no es imagen)
- ✅ Estructura jerárquica con títulos
- ✅ Alto contraste de colores
- ✅ Tamaños de fuente legibles (≥9pt)
- ❌ No incluye etiquetas PDF/UA (requiere plugin adicional)

## Ejemplos de Uso

### 1. Exportar desde Resultados

```typescript
// En ResultsScreen.tsx
import { generateExamPDF } from '../utils/pdfExport';

const handleExportPDF = () => {
  generateExamPDF(result, mode);
};
```

### 2. Generar PDF de Múltiples Exámenes

```typescript
const results: ExamResult[] = [...]; // Varios resultados

results.forEach((result, index) => {
  setTimeout(() => {
    generateExamPDF(result, 'exam');
  }, index * 1000); // 1 segundo entre cada uno
});
```

### 3. Preview antes de Descargar

```typescript
import { jsPDF } from 'jspdf';

// Generar PDF en memoria
const doc = new jsPDF();
// ... agregar contenido ...

// Abrir en nueva ventana
const pdfBlob = doc.output('blob');
const pdfUrl = URL.createObjectURL(pdfBlob);
window.open(pdfUrl);
```

## Roadmap

Mejoras futuras:

- [ ] Agregar logo de AIQUAA en el header
- [ ] Opción de incluir/excluir explicaciones
- [ ] Gráficos de barras para Learning Objectives
- [ ] Modo "resumen" (solo primera página)
- [ ] Marca de agua para exámenes de práctica
- [ ] Firma digital
- [ ] Metadata del PDF (autor, título, keywords)
- [ ] Soporte para múltiples idiomas

## Referencias

- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [jsPDF AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- [PDF Accessibility](https://www.adobe.com/accessibility/pdf/pdf-accessibility-overview.html)

## Soporte

Para problemas o sugerencias:
- Revisa la consola del navegador para errores
- Verifica que las dependencias estén instaladas: `pnpm list jspdf`
- Consulta la documentación de jsPDF
- Abre un issue en el repositorio

## License

© 2024 AIQUAA. Todos los derechos reservados.
