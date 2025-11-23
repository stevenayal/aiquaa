# Suru - Especificación de Diseño de Mascota AIQUAA

## 🎯 Concepto General

**Nombre**: Suru
**Especie**: Surubí (Pseudoplatystoma corruscans) - pez icónico del río Paraguay
**Personalidad**: Mentor amigable, experto en QA, curioso, inteligente, con sentido del humor
**Estilo**: Moderno, minimalista, vectorial, tecnológico pero amigable

## 🎨 Identidad Visual

### Paleta de Colores Principal

```css
/* Colores principales de AIQUAA */
--suru-primary: #0EA5E9      /* Cyan 500 - Cuerpo principal */
--suru-secondary: #06B6D4     /* Cyan 600 - Detalles */
--suru-accent: #10B981        /* Emerald 500 - Aletas */
--suru-tech: #6366F1          /* Indigo 500 - Elementos tech */
--suru-highlight: #F0FDFA     /* Cyan 50 - Brillos */
--suru-shadow: #164E63        /* Cyan 900 - Sombras */
--suru-eye: #1E293B           /* Slate 800 - Ojos */
--suru-eye-highlight: #FFFFFF /* Blanco - Brillo de ojos */
```

### Variantes de Color

1. **Modo Claro** (default): Cyan y esmeralda vibrantes
2. **Modo Oscuro**: Colores más luminosos con brillos neón
3. **Modo Celebración**: Colores arcoíris suaves
4. **Modo Error**: Rojo/rosa suave con expresión confundida
5. **Modo Tech/Hacker**: Verde matrix + púrpura tech

## 📐 Anatomía de Suru

### Proporciones Básicas
- **Cabeza**: 40% del cuerpo total (grande para expresividad)
- **Cuerpo**: 50% (estilizado, no realista)
- **Cola**: 30% (bifurcada, elegante)
- **Aletas**: 4 aletas pectorales + 2 dorsales (estilizadas)
- **Bigotes**: 6 barbillas (3 a cada lado, características del surubí)

### Características Distintivas

#### Ojos
- Grandes y expresivos (estilo manga/chibi moderado)
- Forma almendrada cuando está neutral
- Círculos cuando está sorprendido
- Semicírculos cuando está feliz
- Brillo destacado en esquina superior derecha

#### Bigotes (Barbillas)
- 3 pares de bigotes característicos del surubí
- Estilizados como líneas curvas suaves
- Con efecto de circuito tech en las puntas (opcional)
- Animables: se mueven al nadar o expresar emociones

#### Aletas
- **Aletas pectorales**: Grandes, con patrón geométrico hexagonal
- **Aleta dorsal**: Triangular estilizada con efecto holográfico
- **Aleta caudal**: Bifurcada, elegante, con gradiente
- Todas las aletas tienen microcircuitos sutiles

#### Patrón del Cuerpo
- Base color cyan sólido
- Patrones geométricos sutiles (hexágonos, triángulos)
- Líneas de "circuito" que fluyen por el cuerpo
- Vientre más claro (white/cyan-50)
- Degradados suaves entre colores

## 🎭 Expresiones Faciales (8 principales)

### 1. **Neutral/Bienvenida** (Default)
- Ojos abiertos normales
- Sonrisa suave
- Bigotes en posición relajada
- Aletas en movimiento suave

### 2. **Feliz/Celebración**
- Ojos cerrados en forma de "^"
- Sonrisa amplia
- Bigotes hacia arriba
- Aletas extendidas
- Partículas brillantes alrededor

### 3. **Curioso/Explicando**
- Un ojo ligeramente más grande
- Boca en "o"
- Bigotes hacia adelante
- Una aleta señalando

### 4. **Profesor/Experto**
- Lentes redondos pequeños
- Expresión seria pero amable
- Pizarra o checklist al lado
- Postura erguida

### 5. **Confundido/Error**
- Ojos en espiral o con signos de interrogación
- Boca ondulada
- Bigotes caídos
- Inclinación de 15° a un lado

### 6. **Explorador**
- Lupa en una aleta
- Un ojo ampliado por la lupa
- Expresión concentrada
- Linterna o brillo de búsqueda

### 7. **Hacker/Tech**
- Ojos con reflejos de código
- Gafas de realidad virtual (opcional)
- Teclado holográfico frente a él
- Efectos matrix en fondo

### 8. **Nadando/Movimiento**
- Cuerpo ligeramente curvado
- Aletas en posición de impulso
- Estela de burbujas detrás
- Expresión alegre

## 🎬 Poses y Escenarios (15 variantes)

### Poses Estáticas

1. **Suru Welcome** - Pose de bienvenida con aleta levantada
2. **Suru Logo** - Versión simplificada para logo/favicon
3. **Suru Avatar** - Vista frontal, perfecto círculo, para avatares
4. **Suru Chibi** - Versión super deformada para stickers

### Poses Interactivas

5. **Suru Explicando QA** - Con pizarra mostrando "Planificar → Diseñar → Ejecutar → Reportar"
6. **Suru con Checklist** - Sosteniendo lista con checkmarks
7. **Suru ISTQB Teacher** - Con birrete académico y certificado
8. **Suru Automatizador** - Rodeado de engranajes y código
9. **Suru Explorador** - Con lupa examinando un bug (insecto)
10. **Suru Performance** - Con cronómetro y gráficos de rendimiento

### Poses de Estado

11. **Suru Loading** - Nadando en círculo con spinner
12. **Suru Success** - Celebrando con confeti
13. **Suru 404** - Perdido con mapa al revés
14. **Suru Error** - Con herramientas tratando de arreglar algo
15. **Suru Thinking** - Con nube de pensamiento y signo de interrogación

## 🎨 Elementos Tecnológicos

### Patrones Geométricos
- Hexágonos en aletas (honeycomb pattern)
- Triángulos en cola
- Circuitos minimalistas en cuerpo
- Grid points en intersecciones

### Efectos Holográficos
- Gradientes iridiscentes en bordes
- Brillo tipo cristal en aleta dorsal
- Partículas flotantes alrededor
- Resplandor suave en modo oscuro

### Elementos UI Integrados
- Burbujas de diálogo estilo tooltip
- Iconos QA flotantes (checkbox, bug, test tube)
- Badges/medallas que Suru puede mostrar
- Progress bars que Suru puede señalar

## 📦 Formatos de Entrega

### Archivos por Pose (15 poses × 4 formatos)

```
/public/images/suru/
  ├── static/
  │   ├── suru-welcome.svg
  │   ├── suru-welcome.png (1024×1024)
  │   ├── suru-logo.svg
  │   ├── suru-avatar.svg
  │   ├── suru-chibi.svg
  │   └── ... (todas las poses)
  │
  ├── animated/
  │   ├── suru-welcome.json (Lottie)
  │   ├── suru-loading.json
  │   ├── suru-swimming.json
  │   └── suru-thinking.json
  │
  ├── sprites/
  │   ├── suru-spritesheet.png
  │   └── suru-spritesheet.json
  │
  └── variations/
      ├── dark-mode/
      ├── light-mode/
      └── celebration/
```

### Tamaños Requeridos

- **Hero/Grande**: 1024×1024px (home, about)
- **Mediano**: 512×512px (cards, secciones)
- **Pequeño**: 256×256px (avatares, notificaciones)
- **Mini**: 64×64px (favicon, mini-avatar)
- **Stickers**: 512×512px (Discord, Telegram, WhatsApp)

## 🎬 Animaciones (Lottie)

### Animaciones Básicas

1. **Idle/Respiración** (loop infinito)
   - Cuerpo sube/baja suavemente
   - Aletas ondean
   - Bigotes se mueven ligeramente
   - Duración: 3s

2. **Parpadeo** (trigger aleatorio)
   - Ojos se cierran y abren
   - Duración: 0.3s

3. **Nadar** (loop)
   - Movimiento ondulante del cuerpo
   - Aletas impulsan
   - Burbujas detrás
   - Duración: 2s

4. **Aparecer** (entrada)
   - Fade in + escala
   - Burbujas aparecen
   - Duración: 0.8s

5. **Celebrar** (trigger)
   - Salto
   - Confeti
   - Brillo
   - Duración: 1.5s

6. **Loading** (loop)
   - Nadar en círculo
   - Spinner sutil
   - Duración: 2s

### Animaciones Interactivas

7. **Hover** - Aletas se extienden, ligero bounce
8. **Click** - Squeeze + bounce back
9. **Explicar** - Señala con aleta, burbuja aparece
10. **Error** - Shake horizontal + expresión confundida

## 🛠️ Herramientas Recomendadas

### Para Diseño
- **Figma** - Diseño vectorial colaborativo
- **Adobe Illustrator** - Vectores profesionales
- **Affinity Designer** - Alternativa a Illustrator

### Para Animación
- **LottieFiles Creator** - Animaciones web-ready
- **Adobe After Effects** + Bodymovin plugin
- **Rive** - Animaciones interactivas avanzadas

### Para Optimización
- **SVGOMG** - Optimizar SVGs
- **TinyPNG** - Comprimir PNGs
- **Squoosh** - Optimización de imágenes

## 🌍 Contexto Cultural Paraguayo

### Referencias del Surubí
- Pez emblemático del río Paraguay
- Colores naturales: gris plateado con manchas oscuras
- Interpretación moderna: cyan tech + verde esmeralda
- Mantener bigotes característicos (identidad cultural)

### Elementos Opcionales Paraguay
- Patrón ñandutí sutil en aletas (opcional, no obligatorio)
- Colores de bandera paraguaya en modo celebración
- Referencia al río Paraguay en animación de nadar

## 📱 Casos de Uso en AIQUAA

### 1. Onboarding
```
Usuario nuevo entra → Suru Welcome aparece con burbuja:
"¡Hola! Soy Suru, tu guía en AIQUAA. ¿Listo para mejorar tu QA?"
```

### 2. Navegación
```
Suru mini nada entre secciones
Señala herramientas importantes
Aparece en tooltips con tips
```

### 3. Gamificación
```
Badges con Suru:
- 🔍 Suru Explorador (10 tests exploratorios)
- 🤖 Suru Automator (primera automatización)
- 📚 Suru ISTQB (completar simulador)
```

### 4. Feedback
```
Test passed → Suru feliz celebra
Test failed → Suru confundido señala errores
Loading → Suru nadando con spinner
```

### 5. 404 / Errores
```
Página no encontrada → Suru perdido con mapa
Error 500 → Suru con herramientas arreglando
```

## 🎨 Guía de Estilo para Diseñadores

### DO ✅
- Mantén las líneas suaves y curvas
- Usa degradados sutiles
- Asegura que funcione en blanco y negro
- Mantén legibilidad en tamaños pequeños
- Haz que los ojos sean expresivos
- Usa patrones geométricos simples
- Asegura compatibilidad con dark mode

### DON'T ❌
- No hagas un surubí realista/fotográfico
- No uses más de 4 colores principales
- No agregues demasiados detalles pequeños
- No hagas expresiones agresivas o negativas
- No uses sombras duras
- No pierdas la identidad del surubí

## 📏 Especificaciones Técnicas SVG

### Viewbox Estándar
```svg
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
```

### Capas Recomendadas
1. **Background** (opcional)
2. **Shadow** (sombra sutil)
3. **Body** (cuerpo principal)
4. **Pattern** (patrones geométricos)
5. **Fins** (aletas)
6. **Whiskers** (bigotes)
7. **Face** (ojos, boca)
8. **Tech Elements** (circuitos, brillos)
9. **Accessories** (lentes, lupa, etc.)
10. **Effects** (partículas, burbujas)

### Naming Convention
```
suru-[pose]-[variant]-[size].[format]

Ejemplos:
suru-welcome-light-1024.png
suru-professor-dark-512.svg
suru-chibi-celebration-256.png
```

## 🚀 Roadmap de Implementación

### Fase 1: Conceptual (Semana 1)
- [ ] Sketch inicial de Suru
- [ ] 3 variantes de estilo
- [ ] Selección de paleta final
- [ ] Aprobación del concepto

### Fase 2: Poses Estáticas (Semana 2)
- [ ] 5 poses principales en SVG
- [ ] Versión logo y avatar
- [ ] Variantes de color (light/dark)
- [ ] Exportar en todos los tamaños

### Fase 3: Animaciones Básicas (Semana 3)
- [ ] Idle/respiración
- [ ] Nadar
- [ ] Loading
- [ ] Aparecer/desaparecer
- [ ] Convertir a Lottie JSON

### Fase 4: Poses Adicionales (Semana 4)
- [ ] 10 poses restantes
- [ ] Stickers para redes sociales
- [ ] Accesorios (lentes, lupa, etc.)

### Fase 5: Integración Web (Semana 5)
- [ ] Componentes React
- [ ] Sistema de animaciones
- [ ] Integrar en páginas principales
- [ ] Testing en diferentes navegadores

## 📊 Métricas de Éxito

- ✅ Suru es reconocible en tamaño 32×32px
- ✅ Funciona perfectamente en dark y light mode
- ✅ Animaciones son fluidas (60fps)
- ✅ Archivos SVG < 50KB cada uno
- ✅ Archivos Lottie < 100KB cada uno
- ✅ Carga en < 1 segundo
- ✅ Compatible con todos los navegadores modernos

## 💡 Inspiración Visual

### Referencias de Estilo
- **Duolingo Owl** → Simplicidad y personalidad
- **GitHub Octocat** → Versatilidad de poses
- **Mailchimp Freddie** → Amigabilidad
- **Slack Icons** → Modernidad tech
- **Firefox Mascot** → Estética vibrante

### Referencias de Animación
- Lottie animations showcase
- Rive interactive animations
- CSS-only fish swimming animations
- Particle.js effects

---

**Versión**: 1.0
**Última actualización**: 2025-11-22
**Autor**: AIQUAA Team
**Estado**: Especificación completa - Lista para diseño
