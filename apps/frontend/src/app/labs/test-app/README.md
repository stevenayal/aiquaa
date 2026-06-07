# AIQUAA Test App

Laboratorio web aislado para practicar exploracion funcional, validaciones, evidencia y automatizacion sobre una aplicacion de comercio simple.

## Enfoque

- El acceso al laboratorio usa la autenticacion real de AIQUAA.
- La practica dentro del laboratorio usa datos locales y controlados.
- El laboratorio no debe modificar ni depender del login o registro productivo.

## Acceso

Ingresa primero con tu cuenta real de AIQUAA:

```text
/login?redirect=/labs/test-app/catalog
```

Una vez autenticado, `TestAppLayout` crea una sesion local del laboratorio basada en el email del usuario autenticado y mantiene los datos de practica separados del producto.

## Rutas principales

| Ruta                           | Descripcion                                       |
| ------------------------------ | ------------------------------------------------- |
| `/labs/test-app`               | Entrada al laboratorio                            |
| `/labs/test-app/catalog`       | Catalogo de productos                             |
| `/labs/test-app/product/[id]`  | Detalle de producto                               |
| `/labs/test-app/cart`          | Carrito                                           |
| `/labs/test-app/checkout`      | Checkout                                          |
| `/labs/test-app/history`       | Historial de ordenes                              |
| `/labs/test-app/profile`       | Perfil local del laboratorio                      |
| `/labs/test-app/support`       | Tickets de soporte                                |
| `/labs/test-app/evidence`      | Exportacion de evidencia                          |
| `/labs/test-app/report`        | Reporte tecnico                                   |
| `/labs/test-app/admin?key=...` | Panel de administracion del laboratorio           |
| `/labs/test-app/login`         | Ruta de compatibilidad, redirige al login real    |
| `/labs/test-app/register`      | Ruta de compatibilidad, redirige al registro real |

## Candidate ID y datos de practica

Puedes personalizar la sesion con un `candidate` para obtener datos y bugs deterministas:

```text
/labs/test-app?candidate=TU_ID_UNICO
```

- Cada `candidate` recibe un subconjunto determinista de bugs activos.
- Productos, ordenes y otros datos visibles se generan de forma consistente.
- El laboratorio mantiene evidencia y estado de practica sin tocar datos productivos.

## Panel admin

El panel admin sirve solo para resembrar datos y cambiar bugs activos del laboratorio:

```text
/labs/test-app/admin?key=TU_ADMIN_KEY
```

Funciones:

- reseed por `candidateId`
- reset de sesion local
- activacion o desactivacion de bugs del laboratorio

## Notas

- `Salir del laboratorio` limpia solo la sesion local del lab.
- El usuario sigue autenticado en AIQUAA hasta cerrar sesion en el producto real.
- Las rutas `/labs/auth/*` y `/labs/onboarding/*` son solo referencias de practica; no reemplazan el auth productivo.
