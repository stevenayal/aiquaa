# 🧪 Labs - Herramientas para Testers

Esta sección contiene herramientas útiles para testers y automatizadores, diseñadas para mejorar la eficiencia en los procesos de testing.

## 🛠️ Herramientas Disponibles

### 1. 🔍 Validador de JSON (`/labs/json-validator`)

**Descripción:** Valida la estructura de casos de prueba en formato JSON.

**Características:**
- ✅ Valida claves requeridas: `casoPrueba`, `descripcion`, `pasos`, `resultadoEsperado`
- ✅ Verificación de tipos de datos
- ✅ Validación de contenido no vacío
- ✅ Mensajes de error detallados
- ✅ Advertencias para mejoras
- ✅ JSON de ejemplo incluido
- ✅ Copia al portapapeles

**Estructura JSON Esperada:**
```json
{
  "casoPrueba": "CP001 - Login Exitoso",
  "descripcion": "Verificar que un usuario puede iniciar sesión con credenciales válidas",
  "pasos": [
    "Navegar a la página de login",
    "Ingresar email válido",
    "Ingresar contraseña válida",
    "Hacer clic en 'Iniciar Sesión'"
  ],
  "resultadoEsperado": "El usuario debe ser redirigido al dashboard principal"
}
```

### 2. 🎲 Generador de Datos (`/labs/data-generator`)

**Descripción:** Genera datos de prueba aleatorios para testing.

**Tipos de Datos Disponibles:**
- 👤 **Nombre:** Nombres y apellidos aleatorios
- 📧 **Email:** Direcciones de email válidas
- 📱 **Teléfono:** Números con código de país (+593)
- 📅 **Fecha:** Fechas aleatorias entre 1990-2020
- 🆔 **Cédula:** Números de identificación
- 💰 **Monto:** Valores monetarios aleatorios

**Características:**
- ✅ Selección múltiple de tipos de datos
- ✅ Generación en tiempo real
- ✅ Exportación a JSON
- ✅ Copia al portapapeles
- ✅ Interfaz intuitiva

### 3. ✅ Checklist de Pruebas (`/labs/checklist`)

**Descripción:** Checklist interactiva para procesos de testing.

**Categorías Incluidas:**
- **Funcionalidad:** Validación de campos, botones, navegación
- **UI/UX:** Responsive, alineación, colores, imágenes
- **Rendimiento:** Tiempos de carga, errores de consola
- **Seguridad:** Encriptación, sesiones, vulnerabilidades
- **Compatibilidad:** Navegadores, dispositivos, JavaScript
- **Datos:** Guardado, validaciones, reportes

**Características:**
- ✅ 22 ítems organizados por categorías
- ✅ Progreso visual por categoría y general
- ✅ Persistencia en localStorage
- ✅ Copia de ítems completados
- ✅ Exportación a JSON
- ✅ Filtro para mostrar/ocultar completados
- ✅ Reset de checklist

## 🚀 Uso

1. **Navega a `/labs`** para ver todas las herramientas disponibles
2. **Selecciona una herramienta** haciendo clic en su tarjeta
3. **Sigue las instrucciones** específicas de cada herramienta
4. **Exporta o copia** los resultados según necesites

## 🎨 Diseño

- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Responsive:** Diseño adaptativo para móviles y desktop
- **UX:** Interfaz moderna y intuitiva

## 📱 Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Dispositivos móviles
- ✅ Tablets
- ✅ Desktop

## 🔧 Tecnologías

- React 18
- TypeScript
- Tailwind CSS
- React Router DOM
- React Helmet Async

## 📝 Notas de Desarrollo

- Los componentes están organizados en `src/components/Labs/`
- Cada herramienta es un componente independiente
- Se utiliza localStorage para persistencia en la checklist
- Las validaciones son robustas y proporcionan feedback claro
- El código está comentado para facilitar el mantenimiento

## 🚀 Próximas Funcionalidades

- [ ] Integración con faker.js para datos más realistas
- [ ] Validación en tiempo real para JSON
- [ ] Más tipos de datos en el generador
- [ ] Checklist personalizable
- [ ] Exportación a Excel/CSV
- [ ] Historial de validaciones
- [ ] Temas oscuro/claro 