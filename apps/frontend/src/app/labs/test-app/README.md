# AIQUAA Test App - Evaluación de Exploratory & Bug Hunt

Aplicación web estática para evaluar habilidades de **Exploratory Testing** y **Bug Hunting** en candidatos a QA.

**Duración:** 30 minutos
**Puntuación:** 30 puntos
**Modalidad:** 100% frontend, sin backend real

---

## 🎯 Objetivo

Esta aplicación contiene bugs intencionales que el candidato debe encontrar y documentar. La aplicación simula una tienda online con catálogo, carrito, checkout y soporte.

---

## 🚀 Cómo Usar

### 1. **Acceder a la Aplicación**

```
https://your-domain.com/labs/test-app
```

O en desarrollo local:

```bash
pnpm dev
# Navega a: http://localhost:3001/labs/test-app
```

### 2. **Iniciar Sesión**

**Credenciales Demo:**

- Email: `tester@aiquaa.com`
- Contraseña: `Test1234!`

También puedes registrarte con un email nuevo.

### 3. **Explorar con Candidate ID**

Para obtener un set personalizado de bugs y datos:

```
http://localhost:3001/labs/test-app?candidate=TU_ID_UNICO
```

- Cada `candidate` recibe un set determinista de 6-8 bugs de una lista de 10
- Los productos y datos también se generan de forma determinista

### 4. **Panel de Admin (Opcional)**

Accede al panel oculto para ver/modificar bugs activos:

```
http://localhost:3001/labs/test-app/admin?key=aiquaa-test-admin-2024
```

**Funciones del Admin:**

- Ver y togglear bugs activos
- Reseed de datos con nuevo Candidate ID
- Reset de sesión (limpiar carrito, órdenes, etc.)

### 5. **Generar Informe Técnico**

Una vez finalizadas las pruebas, accede al generador de informes:

```
/labs/test-app/report
```

**Funcionalidades del generador:**

- Documentar bugs encontrados con formato estructurado
- Carga automática del audit log desde localStorage
- Cálculo automático de puntuación (30 puntos)
- Generación de PDF profesional con todos los detalles
- Exportación a JSON para revisión posterior

**Alternativa: Exportar Evidencias Manualmente**

```
/labs/test-app/evidence
```

- Descarga o copia el JSON con el audit log completo
- Usa este archivo junto con tu reporte de bugs manual

---

## 📋 Rutas Disponibles

| Ruta                             | Descripción                       |
| -------------------------------- | --------------------------------- |
| `/labs/test-app`                 | Home (redirige según login)       |
| `/labs/test-app/login`           | Iniciar sesión                    |
| `/labs/test-app/register`        | Registrar cuenta nueva            |
| `/labs/test-app/catalog`         | Catálogo de productos             |
| `/labs/test-app/product/[id]`    | Detalle de producto               |
| `/labs/test-app/cart`            | Carrito de compras                |
| `/labs/test-app/checkout`        | Checkout y pago                   |
| `/labs/test-app/history`         | Historial de pedidos              |
| `/labs/test-app/profile`         | Perfil del usuario                |
| `/labs/test-app/support`         | Crear tickets de soporte          |
| `/labs/test-app/report`          | Generador de informe técnico      |
| `/labs/test-app/evidence`        | Exportar audit log                |
| `/labs/test-app/admin?key=...`   | Panel de administración (oculto)  |

---

## 🐛 Lista de Bugs Potenciales

La aplicación contiene **10 bugs intencionales**, de los cuales **6-8 estarán activos** para cada candidato.

### Bugs Confirmados en el Sistema:

1. **Filtro Inconsistente (Catálogo)**

   - Al combinar búsqueda + categoría, el conteo de resultados no coincide con los items mostrados
   - Severidad: **Media**

2. **Ordenamiento Inestable (Catálogo)**

   - Al ordenar por precio, productos con el mismo precio saltan de posición al cambiar de página
   - Severidad: **Baja**

3. **Validación de Cantidad Rota (Carrito)**

   - Permite ingresar cantidad 0 o mayor al stock si se tipea rápido (onBlur valida tarde)
   - Severidad: **Alta**

4. **Total del Carrito Desfasado (Carrito)**

   - Al cambiar cantidades rápido, los impuestos no recalculan hasta recargar página
   - Severidad: **Alta**

5. **Checkout Error 500 Simulado (Checkout)**

   - Si el campo "Apartamento/Suite" tiene más de 50 caracteres, muestra error genérico 500 en vez de validación clara
   - Severidad: **Media**

6. **Bug de Zona Horaria (Historial)**

   - Guarda timezone "America/Asuncion" en perfil, pero el historial muestra fechas en UTC sin convertir
   - Severidad: **Baja**

7. **Problemas de Accesibilidad (Detalle de Producto)**

   - Botón "Agregar al carrito" sin `aria-label` cuando está disabled
   - Label de cantidad sin `htmlFor` apuntando al input
   - Severidad: **Media**

8. **XSS Reflejado Leve (Catálogo)**

   - La búsqueda escapa `<script>` pero permite `"><test>` que rompe el placeholder (sin ejecutar JS)
   - Severidad: **Media**

9. **Prioridad de Ticket Mal Asignada (Soporte)**

   - Seleccionar prioridad "Alta" puede guardarse como "Media" si se envía de inmediato
   - Severidad: **Baja**

10. **Estado Perdido al Volver (Checkout → Carrito)**
    - Al volver del checkout con el botón del navegador, el carrito pierde 1 item
    - Severidad: **Alta**

> **Nota:** No todos los bugs estarán activos en tu sesión. La lista completa se incluye para referencia, pero cada candidato enfrentará un subset determinista.

---

## 📝 Formato de Reporte de Bugs

Para cada bug encontrado, documenta:

1. **Resumen:** Título breve y descriptivo
2. **Pasos para Reproducir:** Lista numerada y clara
3. **Resultado Esperado:** Qué debería pasar
4. **Resultado Real:** Qué pasa actualmente
5. **Severidad:** Critical / High / Medium / Low
6. **Evidencia:** Screenshots, video, o referencia al audit log

### Ejemplo:

```markdown
## Bug #1: Total del carrito no recalcula impuestos

**Pasos para Reproducir:**

1. Agregar producto al carrito
2. Ir al carrito
3. Cambiar cantidad rápidamente (ej: incrementar 3 veces seguidas)
4. Observar el total

**Resultado Esperado:**
Los impuestos (10%) se recalculan inmediatamente al cambiar la cantidad.

**Resultado Real:**
Los impuestos quedan con el valor anterior. Solo se actualizan al recargar la página.

**Severidad:** Alta

**Evidencia:** Ver audit log eventos `UPDATE_CART_QTY` en evidencias.json
```

---

## 🧪 Criterios de Evaluación

### Exploratory & Bug Hunt (30 min) — 30 puntos

- **Bugs encontrados:** Hasta 8 bugs válidos (15 pts)
  - 1-2 bugs: 5 pts
  - 3-4 bugs: 10 pts
  - 5-6 bugs: 13 pts
  - 7-8 bugs: 15 pts
- **Calidad del reporte:** (10 pts)
  - Pasos claros y reproducibles: 5 pts
  - Severidad correcta y justificada: 3 pts
  - Evidencias (screenshots/audit log): 2 pts
- **Cobertura de funcionalidades:** (5 pts)
  - Exploró todas las secciones principales: 3 pts
  - Probó flujos edge case y negativos: 2 pts

**Total:** 30 puntos

---

## 🛠 Tecnologías Utilizadas

- **Next.js 13+** con App Router
- **TypeScript** para type safety
- **TailwindCSS** para estilos
- **LocalStorage/SessionStorage** para persistencia
- **PRNG determinista** para generación de datos por candidato
- **Audit Log** automático en localStorage

---

## 📦 Estructura del Proyecto

```
apps/frontend/src/app/labs/test-app/
├── page.tsx                    # Home (redirect)
├── login/page.tsx             # Login
├── register/page.tsx          # Registro
├── catalog/page.tsx           # Catálogo (con bugs de filtro y sort)
├── product/[id]/page.tsx      # Detalle (con bug de a11y)
├── cart/page.tsx              # Carrito (con bugs de validación y total)
├── checkout/page.tsx          # Checkout (con bug de error 500)
├── profile/page.tsx           # Perfil
├── support/page.tsx           # Soporte (con bug de prioridad)
├── history/page.tsx           # Historial (con bug de timezone)
├── evidence/page.tsx          # Evidencias (audit log)
├── admin/page.tsx             # Panel admin (oculto)
├── components/
│   ├── TestAppLayout.tsx      # Layout común
│   └── Toast.tsx              # Notificaciones
├── lib/
│   ├── types.ts               # Tipos TypeScript
│   ├── prng.ts                # Generador pseudo-aleatorio
│   ├── bugsManifest.ts        # Definición de bugs
│   ├── seedData.ts            # Generación de datos
│   ├── mockApi.ts             # API simulada
│   ├── storage.ts             # LocalStorage helpers
│   └── auditLog.ts            # Registro de acciones
└── README.md                  # Este archivo
```

---

## ⚙️ Variables de Entorno

Configura la clave del panel admin (server-only, se verifica en
`/api/labs/test-app/admin/verify` y nunca se incluye en el bundle del cliente):

```env
# .env.local
ADMIN_KEY=aiquaa-test-admin-2024
```

---

## 🚀 Deployment

### Vercel (Recomendado)

```bash
# Build para producción
pnpm build:vercel

# Preview local
pnpm preview
```

La app se exporta como sitio estático (`output: 'export'` en Next.js config).

### Otras plataformas

Cualquier hosting de sitios estáticos funciona: Netlify, Cloudflare Pages, GitHub Pages, etc.

---

## 📞 Soporte

Para dudas sobre la evaluación o problemas técnicos:

- **Email:** soporte@aiquaa.com
- **GitHub Issues:** https://github.com/stevenayal/aiquaa/issues

---

## 📄 Licencia

Este proyecto es solo para evaluación interna de AIQUAA. No usar con datos reales ni en producción.

---

**¡Buena suerte en tu evaluación!** 🚀
