# Brief para Diseñador: Mascota SURU para AIQUAA

## 🎯 Resumen del Proyecto

Necesitamos un diseñador profesional para crear la mascota oficial de AIQUAA: **Suru**, un pez surubí estilizado que será el rostro de nuestra plataforma de QA en Paraguay.

## 📋 Lo que ya tenemos

✅ **Concepto completo definido** - Ver `SURU_DESIGN_SPEC.md`
✅ **Paleta de colores oficial** - Cyan, Blue, Emerald, Indigo
✅ **SVG conceptual básico** - `suru-welcome.svg` y `suru-logo.svg` (como referencia inicial)
✅ **Componentes React listos** - Para integrar los diseños finales
✅ **Traducciones** - Mensajes en español e inglés
✅ **Casos de uso definidos** - 15 poses específicas necesarias

## 🎨 Lo que necesitamos de ti

### Entrega 1: Concepto y Estilo (1 semana)

**Deliverables**:
- 3 variantes de diseño de Suru (diferentes estilos)
- Versión en color + versión monocromática
- Moodboard con referencias visuales
- Guía de estilo preliminar

**Formato**: PNG/PDF para revisión, 300dpi

---

### Entrega 2: Poses Principales (2 semanas)

Una vez aprobado el concepto, crear **15 poses de Suru en SVG**:

#### Poses Esenciales (Prioridad Alta)

1. **suru-welcome.svg**
   - Pose de bienvenida
   - Aleta levantada en saludo
   - Expresión amigable
   - Burbujas opcionales alrededor

2. **suru-logo.svg**
   - Versión simplificada para logo
   - Debe funcionar en 64×64px
   - Solo elementos esenciales
   - Sin texto

3. **suru-avatar.svg**
   - Vista frontal
   - Perfecto para círculo
   - Ojos grandes y expresivos
   - Sin aletas extendidas

4. **suru-teacher.svg**
   - Con lentes redondos pequeños
   - Postura "explicativa"
   - Pizarra pequeña al lado (opcional)
   - Expresión seria pero amable

5. **suru-explorer.svg**
   - Con lupa en una aleta
   - Un ojo ampliado por la lupa
   - Expresión concentrada/curiosa
   - Luz de linterna (opcional)

#### Poses Interactivas (Prioridad Media)

6. **suru-explaining.svg**
   - Señalando con una aleta
   - Burbuja de diálogo vacía preparada
   - Expresión amigable
   - Postura dinámica

7. **suru-checklist.svg**
   - Sosteniendo lista de tareas
   - Algunos checkmarks visibles
   - Expresión satisfecha
   - Puede tener lápiz/pluma

8. **suru-automator.svg**
   - Rodeado de engranajes tech
   - Teclado holográfico (opcional)
   - Expresión concentrada
   - Elementos futuristas

9. **suru-performance.svg**
   - Con cronómetro
   - Gráfico de barras pequeño
   - Expresión enfocada
   - Elementos de velocidad

#### Poses de Estado (Prioridad Media-Alta)

10. **suru-loading.svg**
    - Nadando en círculo (posición)
    - Burbujas formando círculo
    - Expresión neutral/contenta
    - Preparado para animación loop

11. **suru-success.svg**
    - Celebrando con aletas arriba
    - Ojos cerrados felices "^_^"
    - Confeti alrededor (opcional)
    - Brillo/estrellas

12. **suru-404.svg**
    - Perdido con mapa al revés
    - Expresión confundida
    - Signos de interrogación
    - Ligera inclinación

13. **suru-error.svg**
    - Con herramientas (martillo, llave)
    - Expresión concentrada
    - Tornillos/tuercas flotando
    - Gotas de sudor (opcional)

14. **suru-thinking.svg**
    - Nube de pensamiento arriba
    - Aleta en "mentón"
    - Ojos mirando hacia arriba
    - Signo de interrogación en nube

#### Pose Extra

15. **suru-chibi.svg**
    - Versión super deformada (SD)
    - Cabeza muy grande (60% del cuerpo)
    - Ojos enormes estilo manga
    - Para stickers y reacciones
    - Máximo nivel de cuteness

---

### Entrega 3: Optimización y Exportación (1 semana)

**Para cada pose, necesitamos**:

```
📁 suru-[nombre]/
  ├── svg/
  │   ├── suru-[nombre].svg           # Optimizado, < 50KB
  │   └── suru-[nombre]-layers.svg    # Con capas editables
  ├── png/
  │   ├── suru-[nombre]-1024.png      # Hero size
  │   ├── suru-[nombre]-512.png       # Large
  │   ├── suru-[nombre]-256.png       # Medium
  │   ├── suru-[nombre]-128.png       # Small
  │   └── suru-[nombre]-64.png        # Mini
  ├── dark-mode/
  │   └── suru-[nombre]-dark.svg      # Variante modo oscuro
  └── source/
      └── suru-[nombre].ai/.fig/.sketch  # Archivo fuente
```

**Especificaciones técnicas**:
- **Viewbox SVG**: `0 0 200 200` para todas las poses
- **Capas nombradas**: Body, Fins, Face, Accessories, Effects
- **Sin textos**: Todo debe ser vectores/paths
- **Optimizado**: Pasar por SVGOMG
- **PNG transparente**: 32-bit RGBA

---

## 🎨 Guía de Estilo

### Paleta de Colores Obligatoria

```
Cuerpo principal:    #0EA5E9 → #06B6D4 (gradiente cyan)
Aletas:              #10B981 (emerald)
Elementos tech:      #6366F1 (indigo)
Brillos/highlights:  #F0FDFA (cyan muy claro)
Sombras:             #164E63 (cyan oscuro)
Ojos:                #1E293B (slate oscuro)
Brillo en ojos:      #FFFFFF (blanco)
```

### Modo Oscuro
- Colores más luminosos/saturados
- Brillos más intensos
- Outline sutil para legibilidad

### Características Anatómicas (Surubí)

✅ **MANTENER**:
- 6 bigotes (barbillas) - 3 pares
- Cuerpo alargado pero estilizado
- Aletas características del surubí
- Cola bifurcada

❌ **EVITAR**:
- Realismo fotográfico
- Texturas complejas
- Demasiados detalles pequeños
- Sombras duras

### Estilo Visual

- **Líneas**: Suaves, curvas, grosor consistente (2-3px)
- **Formas**: Redondeadas, orgánicas pero con geometría
- **Ojos**: Grandes, expresivos, estilo toon moderno
- **Gradientes**: Sutiles, 2-3 colores máximo por elemento
- **Patrones**: Geométricos simples (hexágonos, triángulos)
- **Tech elements**: Circuitos minimalistas, discretos

### Referencias de Estilo

**DO ✅ - Inspirarse en**:
- Duolingo Owl (simplicidad)
- GitHub Octocat (versatilidad)
- Mailchimp Freddie (amigabilidad)
- Firefox mascot (modernidad)

**DON'T ❌ - Evitar**:
- Clip-art genérico
- Hiperrealismo
- Estilo demasiado infantil
- Estilo corporativo aburrido

---

## 📐 Consideraciones Técnicas

### Legibilidad en Diferentes Tamaños

Cada pose debe funcionar perfectamente en:
- ✅ **64×64px** (favicon, mini-avatar) - Debe ser reconocible
- ✅ **256×256px** (cards, secciones) - Detalles visibles
- ✅ **512×512px** (hero) - Todos los detalles

**Tip**: Diseña en tamaño grande, pero SIEMPRE verifica en 64×64px

### SVG Best Practices

```svg
<!-- ✅ CORRECTO -->
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bodyGrad">...</linearGradient>
  </defs>
  <path d="..." fill="url(#bodyGrad)" />
</svg>

<!-- ❌ INCORRECTO -->
<svg width="200px" height="200px">  <!-- No uses px -->
  <text>Hola</text>  <!-- No uses texto -->
  <image href="..." />  <!-- No embebas imágenes -->
</svg>
```

### Capas Recomendadas (de atrás hacia adelante)

1. **Shadow** - Sombra sutil (opcional)
2. **Body** - Cuerpo principal con gradiente
3. **Pattern** - Patrones geométricos/circuitos
4. **Fins** - Aletas con texturas hexagonales
5. **Whiskers** - Bigotes con puntas tech
6. **Face** - Ojos y boca
7. **Accessories** - Lentes, lupa, herramientas, etc.
8. **Effects** - Brillos, burbujas, partículas

---

## 🎬 Animaciones (Opcional - Entrega 4)

Si tienes experiencia con animación, podemos crear 5 animaciones Lottie:

1. **Idle/Breathing** - Loop de respiración suave
2. **Swimming** - Nadar de lado a lado
3. **Loading** - Nadar en círculo
4. **Celebration** - Salto con confeti
5. **Appear** - Entrada con burbujas

**Herramientas**: After Effects + Bodymovin, o Rive

**Exportar**: JSON Lottie < 100KB

---

## 💰 Presupuesto Estimado (Guía)

| Entrega | Trabajo | Tiempo | Precio Ref. USD |
|---------|---------|--------|-----------------|
| Entrega 1 | 3 conceptos + moodboard | 1 sem | $200-400 |
| Entrega 2 | 15 poses SVG | 2 sem | $800-1500 |
| Entrega 3 | Optimización + export | 1 sem | $200-400 |
| **TOTAL** | **Paquete completo** | **4 sem** | **$1200-2300** |
| Opcional | 5 animaciones Lottie | +1 sem | +$500-800 |

---

## 📤 Entrega Final

### Estructura de Carpetas

```
SURU_FINAL_DELIVERY/
├── 01_concept/
│   ├── variants/
│   │   ├── concept-A.png
│   │   ├── concept-B.png
│   │   └── concept-C.png
│   ├── moodboard.pdf
│   └── style-guide-draft.pdf
│
├── 02_poses/
│   ├── svg-optimized/
│   │   ├── suru-welcome.svg
│   │   ├── suru-logo.svg
│   │   └── ... (15 poses)
│   ├── svg-layers/
│   │   └── ... (versiones con capas editables)
│   ├── png/
│   │   ├── 1024/
│   │   ├── 512/
│   │   ├── 256/
│   │   ├── 128/
│   │   └── 64/
│   └── dark-mode/
│       └── ... (variantes oscuras)
│
├── 03_sources/
│   ├── figma-link.txt (o .ai, .sketch)
│   └── fonts/ (si usas fuentes custom - pero evítalas)
│
├── 04_brand-assets/
│   ├── color-palette.pdf
│   ├── usage-examples.pdf
│   └── dos-donts.pdf
│
└── 05_animations/ (opcional)
    ├── lottie-json/
    └── source-aep/
```

### Formato de Nombrado

```
suru-[pose]-[size].[ext]

Ejemplos:
suru-welcome.svg          # SVG optimizado
suru-welcome-1024.png     # PNG grande
suru-logo-dark.svg        # Variante modo oscuro
suru-explorer-layers.svg  # Con capas editables
```

---

## 🤝 Proceso de Revisión

1. **Kickoff call** - 1 hora para aclarar dudas
2. **Entrega 1** - Feedback en 48h, hasta 2 rondas de revisión
3. **Entrega 2** - Revisión en lotes (5 poses → feedback → 5 poses → ...)
4. **Entrega 3** - Verificación técnica final

---

## 📞 Contacto

- **Email**: [tu-email]
- **Discord/Slack**: [canal del proyecto]
- **Reuniones**: Zoom/Meet semanales

---

## ❓ FAQs para el Diseñador

**P: ¿Puedo usar texturas/gradientes complejos?**
R: Prefiere gradientes simples (2-3 colores). Evita texturas raster.

**P: ¿Puedo agregar elementos extra además de los especificados?**
R: Sí, siempre que mantengan el estilo y no comprometan la legibilidad en tamaños pequeños.

**P: ¿Qué pasa si necesito más tiempo?**
R: Comunícalo con anticipación. Preferimos calidad sobre velocidad.

**P: ¿Puedo usar el diseño en mi portfolio?**
R: ¡Absolutamente! AIQUAA es open-source. Crédito completo para ti.

**P: ¿Necesito conocer React/Next.js?**
R: No. Solo entregar los assets según especificación. Nosotros hacemos la integración.

**P: ¿Qué herramienta recomiendas?**
R: Figma (colaborativo), Adobe Illustrator (profesional), o Affinity Designer (accesible).

---

## 🎯 Objetivo Final

Crear una mascota memorable, versátil y técnicamente impecable que:
- ✅ Represente a AIQUAA y Paraguay
- ✅ Funcione en todos los contextos (web, móvil, print, stickers)
- ✅ Sea escalable sin pérdida de calidad
- ✅ Conecte emocionalmente con la comunidad QA
- ✅ Se sienta moderna, amigable y profesional

---

**Fecha límite ideal**: 4 semanas desde inicio
**Presupuesto**: Negociable según experiencia
**Propiedad**: AIQUAA mantiene todos los derechos, diseñador retiene crédito y portfolio

¿Listo para crear a Suru? ¡Nademos juntos en este proyecto! 🐟💙
