# ¿Qué es Performance Testing?

**Performance Testing** es una disciplina de testing que evalúa el comportamiento y capacidad de un sistema bajo diferentes condiciones de carga. Según el **PtU Certified Performance Tester with JMeter (CPTJM)**, es una de las habilidades más demandadas en 2025.

## Definición

**Performance Testing** es el proceso de medir el rendimiento de un sistema bajo carga específica. Evalúa velocidad, capacidad de respuesta, estabilidad y uso de recursos.

## Tipos de Performance Testing

| Tipo                    | Objetivo                                   | Cuándo Usar                       |
| ----------------------- | ------------------------------------------ | --------------------------------- |
| **Load Testing**        | Validar comportamiento bajo carga esperada | Antes de cada release             |
| **Stress Testing**      | Encontrar punto de quiebre                 | Para entender límites del sistema |
| **Spike Testing**       | Evaluar cambios súbitos de carga           | Simular eventos virales           |
| **Endurance Testing**   | Verificar estabilidad prolongada           | Para detectar memory leaks        |
| **Scalability Testing** | Medir capacidad de crecimiento             | Para planificar crecimiento       |
| **Volume Testing**      | Evaluar manejo de grandes volúmenes        | Para bases de datos grandes       |

## Métricas Clave

### Métricas de Rendimiento

| Métrica           | Descripción                   | Meta Típica       |
| ----------------- | ----------------------------- | ----------------- |
| **Response Time** | Tiempo de respuesta promedio  | < 2 segundos      |
| **Throughput**    | Peticiones por segundo        | Varía por sistema |
| **Latency**       | Tiempo de espera del servidor | < 100ms           |
| **Apdex Score**   | Índice de satisfacción (0-1)  | > 0.7             |

### Métricas de Error

| Métrica          | Descripción                | Meta Típica |
| ---------------- | -------------------------- | ----------- |
| **Error Rate**   | Porcentaje de errores      | < 1%        |
| **Failure Rate** | Tasa de fallos             | < 0.1%      |
| **Availability** | Disponibilidad del sistema | > 99.9%     |

### Métricas de Recursos

| Métrica          | Descripción          | Meta Típica     |
| ---------------- | -------------------- | --------------- |
| **CPU Usage**    | Uso de procesador    | < 70%           |
| **Memory Usage** | Uso de memoria RAM   | < 80%           |
| **Disk I/O**     | Operaciones de disco | < 80% capacidad |
| **Network I/O**  | Tráfico de red       | < 70% capacidad |

## Percentiles Importantes

| Percentil | Significado                               | Ejemplo |
| --------- | ----------------------------------------- | ------- |
| **p50**   | Mediana - 50% de requests son más rápidas | 500ms   |
| **p90**   | 90% de requests son más rápidas           | 1.5s    |
| **p95**   | 95% de requests son más rápidas           | 2.5s    |
| **p99**   | 99% de requests son más rápidas           | 5s      |

## Herramientas Populares

### JMeter (Apache)

- **Lenguaje:** Java
- **Ventajas:** Gratuito, gran comunidad, plugins
- **Uso:** Load testing, API testing
- **Nivel:** Intermedio-Avanzado

### Gatling

- **Lenguaje:** Scala
- **Ventajas:** Alto rendimiento, reportes detallados
- **Uso:** Load testing intensivo
- **Nivel:** Avanzado

### k6 (Grafana)

- **Lenguaje:** JavaScript
- **Ventajas:** Moderno, fácil de usar, CI/CD friendly
- **Uso:** Load testing, performance testing
- **Nivel:** Intermedio

### Locust

- **Lenguaje:** Python
- **Ventajas:** Flexible, distribuido, Python-friendly
- **Uso:** Load testing personalizado
- **Nivel:** Intermedio

## Proceso de Performance Testing

### 1. Planificación

- Definir objetivos y KPIs
- Identificar escenarios de prueba
- Seleccionar herramientas
- Establecer métricas de éxito

### 2. Diseño

- Crear scripts de prueba
- Configurar datos de prueba
- Definir perfil de carga
- Establecer baseline

### 3. Ejecución

- Ejecutar pruebas de carga
- Monitorear métricas
- Recopilar datos
- Documentar resultados

### 4. Análisis

- Analizar resultados
- Identificar bottlenecks
- Comparar con baseline
- Generar recomendaciones

### 5. Optimización

- Implementar mejoras
- Re-ejecutar pruebas
- Validar mejoras
- Documentar cambios

## Mejores Prácticas

1. **Establecer baseline** - Medir rendimiento antes de cambios
2. **Testear en entorno similar a producción** - Evitar resultados sesgados
3. **Usar datos realistas** - Simular escenarios reales
4. **Monitorear en tiempo real** - Detectar problemas durante la prueba
5. **Automatizar pruebas** - Integrar en CI/CD
6. **Documentar resultados** - Mantener historial de rendimiento
7. **Comparar versiones** - Medir impacto de cambios

## Errores Comunes

1. **No establecer baseline** - Imposible medir mejoras
2. **Usar datos de prueba irreales** - Resultados no representativos
3. **No monitorear recursos** - Bottlenecks no detectados
4. **Solo probar happy path** - Olvidar escenarios extremos
5. **No automatizar** - Dificulta pruebas repetitivas

## Preparación con AIQUAA

AIQUAA ofrece un **Examen de Performance Testing** con:

- **27 preguntas** sobre fundamentos y herramientas
- **3 secciones:** Fundamentos, Métricas, Herramientas
- **Modo examen** (simula el real)
- **Modo entrenamiento** (feedback inmediato)
- **Material de estudio** oficial (PtU CPTJM)

**Enlace:** https://aiquaa.com/labs/performance

## Certificaciones Relacionadas

| Certificación                 | Organización | Nivel                          |
| ----------------------------- | ------------ | ------------------------------ |
| **CPTJM**                     | PtU          | Performance Testing con JMeter |
| **ISTQB Performance Testing** | ISTQB        | Specialist                     |
| **LoadRunner Certified**      | Micro Focus  | Professional                   |

## Estadísticas del Mercado

- **Demanda de performance testers:** +35% 2024 vs 2023 (fuente: LinkedIn Jobs)
- **Salario promedio:** $85,000-120,000 USD (fuente: Glassdoor 2024)
- **Herramienta más demandada:** JMeter (40% de ofertas)
- **Industrias con más demanda:** Fintech, E-commerce, SaaS

## Fuentes

- PtU CPTJM Syllabus v1.1
- Performance Testing Body of Knowledge
- State of Performance Engineering 2024
- AIQUAA Labs: aiquaa.com/labs/performance
