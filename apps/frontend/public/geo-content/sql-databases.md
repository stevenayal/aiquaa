# ¿Qué es SQL y las Bases de Datos Relacionales?

**SQL (Structured Query Language)** es el lenguaje estándar para gestionar y consultar **bases de datos relacionales**. Según **DB-Engines (2024)**, más del **70% de las bases de datos** utilizadas en el mundo son relacionales (MySQL, PostgreSQL, SQL Server, Oracle).

## Definición

**SQL** es un lenguaje declarativo que permite crear, modificar, consultar y administrar bases de datos relacionales. Las **bases de datos relacionales** organizan los datos en tablas con relaciones definidas mediante claves.

## Conceptos Fundamentales

### Modelo Relacional

| Concepto                | Descripción                               | Ejemplo                            |
| ----------------------- | ----------------------------------------- | ---------------------------------- |
| **Tabla (Relation)**    | Conjunto de filas con mismas columnas     | `clientes`, `pedidos`              |
| **Fila (Tuple)**        | Registro individual con sus valores       | Un cliente específico              |
| **Columna (Attribute)** | Propiedad común a todas las filas         | `nombre`, `email`                  |
| **Esquema**             | Estructura de la tabla (columnas y tipos) | `clientes(id INT, nombre VARCHAR)` |

### Claves en SQL

| Tipo de Clave     | Función                                             | Ejemplo                         |
| ----------------- | --------------------------------------------------- | ------------------------------- |
| **PRIMARY KEY**   | Identifica cada fila de forma única y no nula       | `id` en tabla `clientes`        |
| **FOREIGN KEY**   | Vincula una tabla con otra (integridad referencial) | `cliente_id` en tabla `pedidos` |
| **UNIQUE**        | Garantiza valores únicos (admite NULL)              | `email` en tabla `usuarios`     |
| **COMPOSITE KEY** | Clave primaria compuesta por varias columnas        | `(cliente_id, producto_id)`     |

### Tipos de Datos Comunes

| Tipo             | Uso                                 | Ejemplo                         |
| ---------------- | ----------------------------------- | ------------------------------- |
| **INT**          | Números enteros                     | `edad = 25`                     |
| **VARCHAR(n)**   | Texto variable (hasta n caracteres) | `nombre = 'Juan'`               |
| **DECIMAL(p,s)** | Números decimales con precisión     | `precio = 19.99`                |
| **DATE**         | Fechas                              | `fecha_registro = '2024-01-15'` |
| **BOOLEAN**      | Verdadero/Falso                     | `activo = true`                 |
| **TEXT**         | Texto largo                         | `descripcion = '...'`           |
| **NULL**         | Ausencia de valor                   | `descuento = NULL`              |

## Consultas SQL Básicas

### SELECT - Leer Datos

```sql
-- Seleccionar todas las columnas
SELECT * FROM clientes;

-- Seleccionar columnas específicas
SELECT nombre, email FROM clientes;

-- Filtrar con WHERE
SELECT * FROM clientes WHERE ciudad = 'Asunción';

-- Ordenar resultados
SELECT * FROM clientes ORDER BY nombre ASC;

-- Eliminar duplicados
SELECT DISTINCT ciudad FROM clientes;
```

### JOINs - Combinar Tablas

```sql
-- INNER JOIN: Solo coincidencias en ambas tablas
SELECT c.nombre, p.total
FROM clientes c
INNER JOIN pedidos p ON c.id = p.cliente_id;

-- LEFT JOIN: Todos los clientes, con o sin pedidos
SELECT c.nombre, p.total
FROM clientes c
LEFT JOIN pedidos p ON c.id = p.cliente_id;

-- RIGHT JOIN: Todos los pedidos, con o sin cliente
SELECT c.nombre, p.total
FROM clientes c
RIGHT JOIN pedidos p ON c.id = p.cliente_id;
```

### Funciones de Agregación

```sql
-- Contar filas
SELECT COUNT(*) FROM clientes;

-- Sumar valores
SELECT SUM(total) FROM pedidos;

-- Promedio
SELECT AVG(total) FROM pedidos;

-- Mínimo y máximo
SELECT MIN(total), MAX(total) FROM pedidos;

-- Agrupar por columna
SELECT ciudad, COUNT(*) AS total_clientes
FROM clientes
GROUP BY ciudad;
```

### INSERT, UPDATE, DELETE

```sql
-- Insertar datos
INSERT INTO clientes (nombre, email, ciudad)
VALUES ('Juan Pérez', 'juan@email.com', 'Asunción');

-- Actualizar datos
UPDATE clientes
SET email = 'nuevo@email.com'
WHERE id = 1;

-- Eliminar datos
DELETE FROM clientes WHERE id = 1;
```

## Restricciones (Constraints)

| Constraint      | Descripción                   | Ejemplo                                  |
| --------------- | ----------------------------- | ---------------------------------------- |
| **PRIMARY KEY** | Identificador único y no nulo | `id INT PRIMARY KEY`                     |
| **FOREIGN KEY** | Referencia a otra tabla       | `cliente_id INT REFERENCES clientes(id)` |
| **NOT NULL**    | Valor obligatorio             | `nombre VARCHAR(100) NOT NULL`           |
| **UNIQUE**      | Sin duplicados                | `email VARCHAR(100) UNIQUE`              |
| **CHECK**       | Condición de negocio          | `edad CHECK (edad >= 18)`                |
| **DEFAULT**     | Valor por defecto             | `estado DEFAULT 'activo'`                |

## Tipos de Relaciones

### 1. Uno a Uno (1:1)

```
usuarios (1) ──── (1) perfiles
```

Cada usuario tiene un perfil, cada perfil pertenece a un usuario.

### 2. Uno a Muchos (1:N)

```
clientes (1) ──── (N) pedidos
```

Un cliente puede tener muchos pedidos, cada pedido pertenece a un cliente.

### 3. Muchos a Muchos (N:M)

```
productos (N) ──── (N) pedidos
```

Un producto puede estar en muchos pedidos, un pedido puede tener muchos productos. Requiere tabla intermedia.

## Normalización

### Primera Forma Normal (1NF)

- Cada columna contiene un valor atómico (no listas)
- No hay grupos de columnas repetidos

### Segunda Forma Normal (2NF)

- cumple 1NF
- Cada columna no clave depende de toda la clave primaria

### Tercera Forma Normal (3NF)

- cumple 2NF
- No hay dependencias transitivas (columna depende de otra columna no clave)

## Índices en SQL

### ¿Qué son los Índices?

Estructuras que aceleran las consultas al permitir búsquedas rápidas.

### Tipos de Índices

| Tipo          | Uso                | Ejemplo                      |
| ------------- | ------------------ | ---------------------------- |
| **B-Tree**    | Búsquedas de rango | `WHERE precio > 100`         |
| **Hash**      | Búsquedas exactas  | `WHERE id = 123`             |
| **Full-text** | Búsqueda de texto  | `WHERE nombre LIKE '%juan%'` |
| **Composite** | Múltiples columnas | `INDEX (ciudad, edad)`       |

### Cuándo Crear Índices

- Columnas en `WHERE` frecuente
- Columnas en `JOIN`
- Columnas en `ORDER BY`
- Columnas con alta cardinalidad

## SQL para QA

### Casos de Uso Comunes

1. **Validar datos insertados**

```sql
SELECT COUNT(*) FROM usuarios WHERE email = 'test@test.com';
```

2. **Detectar duplicados**

```sql
SELECT email, COUNT(*)
FROM usuarios
GROUP BY email
HAVING COUNT(*) > 1;
```

3. **Verificar integridad referencial**

```sql
SELECT p.* FROM pedidos p
LEFT JOIN clientes c ON p.cliente_id = c.id
WHERE c.id IS NULL;
```

4. **Validar constraints**

```sql
-- Intentar insertar duplicado
INSERT INTO usuarios (email) VALUES ('existente@email.com');
-- Debería fallar por constraint UNIQUE
```

5. **Auditar cambios**

```sql
SELECT * FROM auditoria
WHERE tabla = 'usuarios'
ORDER BY fecha DESC;
```

## Herramientas de SQL

### SGBD Populares

| SGBD           | Tipo        | Uso Principal        |
| -------------- | ----------- | -------------------- |
| **MySQL**      | Open Source | Web applications     |
| **PostgreSQL** | Open Source | Enterprise, GIS      |
| **SQL Server** | Commercial  | Enterprise Microsoft |
| **Oracle**     | Commercial  | Enterprise legacy    |
| **SQLite**     | Embedded    | Mobile, embedded     |

### Herramientas de UI

| Herramienta           | Tipo        | Ventajas              |
| --------------------- | ----------- | --------------------- |
| **DBeaver**           | Open Source | Multi-SGBD, gratuito  |
| **pgAdmin**           | Open Source | PostgreSQL específico |
| **MySQL Workbench**   | Free        | MySQL oficial         |
| **Azure Data Studio** | Free        | SQL Server            |
| **DataGrip**          | Commercial  | Multi-SGBD, potente   |

## Preparación con AIQUAA

AIQUAA ofrece dos evaluaciones de bases de datos:

### Database Fundamentals (Teórico)

- **100 puntos** posibles
- **3 niveles:** Modelo relacional, SELECT, JOINs
- **Tipos:** Selección múltiple, verdadero/falso, respuestas cortas
- **Duración:** 30 minutos
- **Puntaje de aprobación:** 60/100

**Enlace:** https://aiquaa.com/assessments/database-fundamentals

### Database Practice (Práctico)

- **Challenge práctico** con mini e-commerce
- **Predecir resultados** de consultas
- **Detectar bugs** en SQL
- **Escribir consultas** correctas

**Enlace:** https://aiquaa.com/assessments/database-practice

## Estadísticas del Mercado

- **Demanda de QA Database:** +28% 2024 vs 2023 (LinkedIn Jobs)
- **Salario promedio QA Database:** $70,000-100,000 USD
- **SGBD más demandado:** PostgreSQL (35%), MySQL (30%)
- **Habilidad más solicitada:** SQL queries (90% de ofertas QA)

## Errores Comunes en SQL

1. **Olvidar WHERE en UPDATE/DELETE** - Afecta todas las filas
2. **Usar = NULL** en vez de `IS NULL` - No funciona
3. **No usar LIMIT** en pruebas - Puede devolver millones de filas
4. **Ignorar NULL en COUNT** - COUNT(columna) ignora NULL
5. **No crear índices** - Consultas lentas
6. **No normalizar** - Datos redundantes

## Fuentes

- DB-Engines Ranking 2024
- SQL Tutorial - W3Schools
- PostgreSQL Documentation
- AIQUAA Labs: aiquaa.com/assessments/database-fundamentals
