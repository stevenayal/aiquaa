# ¿Qué es All Pairs Testing?

**All Pairs Testing** (también conocido como **Pairwise Testing**) es una técnica de diseño de pruebas que reduce significativamente el número de casos de prueba manteniendo la cobertura de combinaciones de parámetros. Según el **National Institute of Standards and Technology (NIST)**, el 70% de los defectos de software se encuentran combinando solo **2 parámetros**.

## Definición

**All Pairs Testing** es una técnica que genera combinaciones de prueba donde **cada par de valores** de diferentes parámetros aparece al menos una vez. Esto reduce drásticamente el número de casos de prueba manteniendo alta cobertura de defectos.

## ¿Por Qué Funciona?

Los estudios muestran que:

- **70% de defectos** se activan combinando 2 parámetros
- **95% de defectos** se activan combinando 3 parámetros
- **99% de defectos** se activan combinando 4 parámetros

Por lo tanto, probar **todos los pares** es suficiente para encontrar la mayoría de defectos.

## Ejemplo Práctico

### Escenario: Testing de un Formulario de Registro

**Parámetros:**

- **Navegador:** Chrome, Firefox, Safari
- **Sistema Operativo:** Windows, macOS, Linux
- **Tipo de Usuario:** Admin, Regular, Guest

### Fuerza Bruta (Todas las combinaciones)

- 3 × 3 × 3 = **27 casos de prueba**

### All Pairs (Combinaciones de pares)

- **9 casos de prueba** (reducción del 67%)

| #   | Navegador | SO      | Tipo Usuario |
| --- | --------- | ------- | ------------ |
| 1   | Chrome    | Windows | Admin        |
| 2   | Chrome    | macOS   | Regular      |
| 3   | Chrome    | Linux   | Guest        |
| 4   | Firefox   | Windows | Regular      |
| 5   | Firefox   | macOS   | Guest        |
| 6   | Firefox   | Linux   | Admin        |
| 7   | Safari    | Windows | Guest        |
| 8   | Safari    | macOS   | Admin        |
| 9   | Safari    | Linux   | Regular      |

## Beneficios

| Beneficio                      | Impacto                          |
| ------------------------------ | -------------------------------- |
| **Reducción de casos**         | 50-90% menos casos de prueba     |
| **Alta cobertura**             | 70-99% de defectos detectados    |
| **Tiempo ahorrado**            | 60-80% menos tiempo de ejecución |
| **Recursos reducidos**         | Menos infraestructura necesaria  |
| **Mantenimiento simplificado** | Menos casos para mantener        |

## Algoritmo Pairwise

### Proceso General

1. **Ordenar parámetros** por número de valores (mayor primero)
2. **Generar primera fila** con el parámetro de más valores
3. **Agregar siguientes parámetros** uno por uno
4. **Maximizar distancia** entre filas adyacentes
5. **Validar cobertura** de todos los pares

### Complejidad Computacional

- **Fuerza bruta:** O(n^k) donde n = valores, k = parámetros
- **Pairwise:** O(n² × k) - significativamente más eficiente

## Herramientas Populares

### AIQUAA All Pairs Generator

- **Tipo:** Web-based
- **Ventajas:** Gratuito, fácil de usar, exporta CSV
- **Uso:** Generación rápida de combinaciones
- **Nivel:** Básico-Intermedio

### PICT (Microsoft)

- **Tipo:** CLI tool
- **Ventajas:** Potente, personalizable, gratuito
- **Uso:** Proyectos enterprise
- **Nivel:** Avanzado

### ALLPAIRS (James Bach)

- **Tipo:** Script Python
- **Ventajas:** Simple, rápido, open source
- **Uso:** Uso general
- **Nivel:** Intermedio

### Pairwiser

- **Tipo:** Commercial
- **Ventajas:** GUI, soporte profesional
- **Uso:** Enterprise
- **Nivel:** Intermedio-Avanzado

## Cuándo Usar All Pairs

### Casos Ideales

- **Testing de compatibilidad** - Navegadores, SO, dispositivos
- **Testing de configuración** - Parámetros del sistema
- **Testing de API** - Combinaciones de endpoints y datos
- **Testing de formularios** - Múltiples campos y validaciones
- **Testing de seguridad** - Combinaciones de roles y permisos

### Limitaciones

- **Dependencias complejas** - Cuando parámetros tienen relaciones
- **Defectos de 3+ parámetros** - Necesita combinaciones mayores
- **Tiempo de ejecución** - Si cada caso toma mucho tiempo

## Métricas de Cobertura

| Tipo Cobertura       | Descripción                  | Ejemplo                 |
| -------------------- | ---------------------------- | ----------------------- |
| **2-way (Pairwise)** | Todos los pares aparecen     | Mínimo recomendado      |
| **3-way**            | Todos los tripletes aparecen | Para sistemas críticos  |
| **t-way**            | Todos los t-tuplas aparecen  | Para alta confiabilidad |

## Ejemplo de Código (Python)

```python
def all_pairs(parameters):
    """
    Genera combinaciones pairwise de parámetros.

    Args:
        parameters: Dict con parámetros y sus valores

    Returns:
        Lista de diccionarios con combinaciones
    """
    # Implementación simplificada
    labels = list(parameters.keys())
    values = list(parameters.values())

    # Generar combinaciones pairwise
    combinations = []
    # ... algoritmo de generación

    return combinations

# Ejemplo de uso
params = {
    'browser': ['Chrome', 'Firefox', 'Safari'],
    'os': ['Windows', 'macOS', 'Linux'],
    'user_type': ['Admin', 'Regular', 'Guest']
}

result = all_pairs(params)
print(f"Combinaciones generadas: {len(result)}")
# Output: Combinaciones generadas: 9 (vs 27 fuerza bruta)
```

## Preparación con AIQUAA

AIQUAA ofrece un **Generador All Pairs** con:

- **Interfaz web** intuitiva
- **Editor visual** de parámetros
- **Importación JSON/YAML**
- **Ejemplos predefinidos**
- **Exportación CSV**
- **Algoritmo 2-way coverage**

**Enlace:** https://aiquaa.com/labs/allpairs

## Investigación y Referencias

- **NIST (2004):** "Pairwise Testing: Best Practices for Software Testing"
- **James Bach (1999):** "Allpairs: A Combinatorial Approach to Pairwise Testing"
- **Kuhn & Kacker (2010):** "Pairwise Combinatorial Testing for Software Development"

## Estadísticas de Uso

- **Adopción:** 45% de equipos de testing usan pairwise (fuente: State of Testing 2024)
- **Reducción promedio:** 72% de casos de prueba
- **Detección de defectos:** 70-85% de defectos de interacción
- **Tiempo ahorrado:** 65% en ciclos de testing

## Fuentes

- NIST Pairwise Testing Research
- AIQUAA All Pairs Generator: aiquaa.com/labs/allpairs
- State of Testing Report 2024
