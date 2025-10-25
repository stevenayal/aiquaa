# Migración de Artículos a DEV.to

Este directorio contiene **8 artículos** en formato markdown listo para publicar en DEV.to.

## 📊 Estado Actual

- **Total de artículos locales**: 8
- **Artículos publicados en DEV.to**: 3
- **Artículos pendientes de migrar**: 5-8 (revisar cuáles ya están publicados)

## 📝 Artículos Generados

1. `01-origen-de-aiquaa.md` - El Origen de AIQUAA: Saber, Calidad y Comunidad
2. `02-introduccion-testing-software-fundamentos-qa.md` - Introducción a Testing de Software
3. `03-automatizacion-testing-selenium-webdriver.md` - Automatización con Selenium
4. `04-testing-apis-postman-rest-assured.md` - Testing de APIs
5. `05-estrategia-qa-implementacion-herramientas.md` - Estrategia de implementación QA
6. `06-introduccion-automatizacion-testing-ia.md` - Automatización con IA
7. `07-qa-era-inteligencia-artificial.md` - QA en la era de IA
8. `08-herramientas-testing-automatizado.md` - Herramientas de testing

## 🚀 Método 1: Publicación Manual (Recomendado)

### Pasos para publicar cada artículo:

1. **Abrir DEV.to**
   - Ir a: https://dev.to/new

2. **Copiar el contenido**
   - Abrir uno de los archivos `.md` de este directorio
   - Copiar TODO el contenido (incluyendo el front matter `---`)

3. **Pegar en el editor**
   - Pegar el contenido en el editor de DEV.to
   - El front matter se procesará automáticamente

4. **Revisar y ajustar**
   - Verificar que el título, tags y descripción se cargaron correctamente
   - Revisar el preview del artículo
   - Ajustar formato si es necesario

5. **Configurar canonical URL**
   - En las opciones del artículo, el campo "Canonical URL" ya está configurado
   - Apunta a: `https://aiquaa.com/blog/{slug}`
   - Esto le dice a Google que tu sitio es la fuente principal

6. **Publicar o guardar como borrador**
   - Hacer clic en "Publish" para publicar inmediatamente
   - O "Save draft" para revisar más tarde

## 🔧 Método 2: Publicación Automática via API

### Requisitos:
1. Obtener tu API key de DEV.to:
   - Ir a: https://dev.to/settings/extensions
   - Copiar tu "DEV API Key"

### Pasos:

1. **Configurar API key**
   ```bash
   export DEVTO_API_KEY="tu-api-key-aqui"
   ```

2. **Ejecutar script de publicación**
   ```bash
   node scripts/migrate-articles-to-devto.js --publish
   ```

3. **Revisar borradores**
   - Los artículos se crearán como **borradores** (no publicados)
   - Revisar en: https://dev.to/dashboard
   - Publicar manualmente después de revisar

## ⚙️ Formato de Artículos

Cada archivo markdown tiene el siguiente formato:

```markdown
---
title: Título del Artículo
published: true
description: Descripción breve del artículo
tags: tag1, tag2, tag3, tag4
cover_image: URL de la imagen
canonical_url: https://aiquaa.com/blog/slug
---

Contenido del artículo en markdown...
```

### Notas importantes:

- **Tags**: Máximo 4 tags por artículo (limitación de DEV.to)
- **Canonical URL**: Ya configurado para apuntar a aiquaa.com
- **Cover Image**: URLs de Unsplash o rutas locales (revisar antes de publicar)
- **Published**: Cambiar a `false` si querés guardar como borrador

## 🔍 Verificar Artículos Existentes

Antes de publicar, verificá qué artículos ya están en DEV.to:

```bash
curl -s "https://dev.to/api/articles?username=stevenayal&per_page=100" | \
  node -e "const data=require('fs').readFileSync(0,'utf-8'); \
  const articles=JSON.parse(data); \
  articles.forEach(a => console.log('-', a.title))"
```

Actualmente tenés estos 3 artículos publicados:
- 🧩 Diseño Modular en QA: el camino hacia equipos escalables, mantenibles y sostenibles
- Estrategias y Factores a tener en cuenta antes de implementar IA en QA
- De User Story a Test Case en minutos: microservicio IA (FastAPI + Gemini + Langfuse) para QA

## 📋 Checklist de Publicación

Para cada artículo:

- [ ] Copiar contenido del archivo `.md`
- [ ] Pegar en https://dev.to/new
- [ ] Verificar que el front matter se procesó correctamente
- [ ] Revisar el preview del artículo
- [ ] Verificar que la imagen de portada se carga correctamente
- [ ] Confirmar que canonical URL apunta a aiquaa.com
- [ ] Revisar tags (máximo 4)
- [ ] Publicar o guardar como borrador
- [ ] Marcar en esta lista

## ✅ Artículos Migrados

Marcar aquí los artículos que ya fueron publicados:

- [ ] El Origen de AIQUAA
- [ ] Introducción a Testing de Software
- [ ] Automatización de Testing con Selenium
- [ ] Testing de APIs con Postman
- [ ] Estrategia de implementación de herramientas QA
- [ ] Introducción a la Automatización con IA
- [ ] QA en la Era de la IA
- [ ] Herramientas de Testing Automatizado

## 🔄 Sincronización Automática

Una vez que los artículos estén publicados en DEV.to:

1. **El blog de AIQUAA se actualizará automáticamente**
   - La página `/blog` obtiene artículos de DEV.to cada 30 minutos (ISR)
   - No necesitás hacer nada más

2. **Canonical URLs**
   - Los canonical URLs apuntan a aiquaa.com
   - Google indexará tu sitio como la fuente principal
   - DEV.to aparecerá como contenido sindicado

3. **Verificar en el sitio**
   ```bash
   # Esperar ~30 minutos después de publicar en DEV.to
   # Luego visitar:
   https://aiquaa.com/blog
   ```

## 📚 Recursos

- **DEV.to Editor**: https://dev.to/new
- **Dashboard**: https://dev.to/dashboard
- **API Docs**: https://developers.forem.com/api/v1
- **Markdown Guide**: https://dev.to/p/editor_guide

## 🐛 Problemas Comunes

### Las imágenes no se cargan
- Las URLs de Unsplash deberían funcionar
- Para imágenes locales (`/images/logo1.png`), subir a un CDN primero
- Alternativa: Usar la opción de subir imagen en el editor de DEV.to

### Los tags no se procesan
- Asegurar que hay máximo 4 tags
- Los tags deben estar separados por comas
- No usar caracteres especiales en los tags

### El canonical URL no aparece
- Verificar que está en el front matter
- Revisar en las opciones del artículo después de pegar
- Editar manualmente si es necesario

---

**Creado**: 2025-10-25
**Script**: `migrate-articles-to-devto.js`
**Fuente**: `data/articles.json` + `src/data/posts.json`
