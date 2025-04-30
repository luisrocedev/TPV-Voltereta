# Aprendizaje sobre el Proyecto

## 1. Elementos fundamentales del código

En nuestro proyecto usamos variables (para guardar datos que cambian), constantes (para valores fijos), operadores (como +, -, \*, / para cálculos), y tipos de datos como números, cadenas de texto (strings), booleanos (true/false) y objetos. Ejemplo:

```js
const PI = 3.14;
let nombre = "Juan";
let edad = 20;
let activo = true;
let usuario = { id: 1, nombre: "Ana" };
```

## 2. Estructuras de control

Utilizamos:

- **Selección**: if, else if, else para tomar decisiones.
- **Repetición**: for, while para repetir acciones.
- **Saltos**: break, continue para controlar bucles.

Ejemplo:

```js
if (edad > 18) {
  console.log("Mayor de edad");
} else {
  console.log("Menor de edad");
}
```

## 3. Control de excepciones y gestión de errores

Sí, usamos try-catch para capturar errores y middlewares para gestionarlos en el servidor:

```js
try {
  // Código que puede fallar
} catch (error) {
  console.error(error);
}
```

En Express, usamos un middleware `errorHandler.js` para centralizar la gestión de errores.

## 4. Documentación del código

Comentamos el código con // y usamos docstrings en funciones importantes. Además, tenemos archivos markdown como este para documentar.

## 5. Paradigma aplicado

Principalmente usamos **programación estructurada** y **orientada a objetos** (OOP) en el backend, porque facilita la organización y reutilización del código.

## 6. Clases y objetos principales

Aunque JavaScript no obliga a usar clases, tenemos objetos como `usuario`, `empleado`, `pedido`, etc. En el backend, podríamos tener clases como `Empleado` o `Pedido` para representar entidades.

## 7. Conceptos avanzados (herencia, polimorfismo, interfaces)

No usamos herencia ni polimorfismo de forma explícita, pero sí interfaces implícitas (objetos con la misma estructura) y reutilización de funciones.

## 8. Gestión de información y archivos

Guardamos información en una base de datos MySQL y también en archivos (logs, imágenes de perfil). La interacción con el usuario es mediante una interfaz web (HTML, CSS, JS).

## 9. Estructuras de datos utilizadas

Usamos arrays (listas) y objetos. Ejemplo:

```js
let empleados = [
  { id: 1, nombre: "Ana" },
  { id: 2, nombre: "Luis" },
];
```

## 10. Técnicas avanzadas

Utilizamos expresiones regulares para validar datos (como emails) y flujos de entrada/salida para leer y escribir archivos (por ejemplo, logs).

---

# Sistemas Informáticos

## 1. Características del hardware

Desarrollamos en ordenadores personales (PC o Mac) con procesadores Intel/AMD, 8GB+ RAM. En producción, el servidor puede ser un VPS o máquina dedicada.

## 2. Sistema operativo

Usamos macOS y Windows para desarrollo, y Linux (Ubuntu) para producción, por su estabilidad y soporte en servidores.

## 3. Configuración de redes

El servidor usa red local en desarrollo y red pública en producción. Usamos HTTP/HTTPS y configuramos firewalls y autenticación para seguridad.

## 4. Copias de seguridad

Realizamos copias de la base de datos y archivos importantes periódicamente, usando scripts automáticos o herramientas del hosting.

## 5. Integridad y seguridad de datos

Usamos contraseñas cifradas, validación de entradas y backups. Limitamos accesos según roles de usuario.

## 6. Usuarios, permisos y accesos

En el sistema operativo, configuramos usuarios y permisos para que solo el administrador pueda modificar archivos críticos.

## 7. Documentación técnica

Documentamos la configuración en archivos markdown y README, explicando pasos de instalación y despliegue.

---

# Entornos de Desarrollo

## 1. Entorno de desarrollo (IDE)

Usamos Visual Studio Code, configurado con extensiones para JavaScript, Node.js y MySQL.

## 2. Automatización de tareas

Utilizamos scripts en `package.json` para iniciar el servidor, ejecutar tests y otras tareas.

## 3. Control de versiones

Usamos Git y GitHub para gestionar versiones y ramas. Creamos ramas para nuevas funcionalidades y las fusionamos tras revisión.

## 4. Refactorización

Revisamos y mejoramos el código periódicamente, eliminando duplicidades y mejorando nombres de variables y funciones.

## 5. Documentación técnica

Usamos archivos markdown (`README.md`, `aprendizaje.md`) y comentarios en el código.

## 6. Diagramas

Podemos crear diagramas de clases o de flujo usando herramientas como draw.io o plantUML.

---

# Bases de Datos

## 1. Sistema gestor

Usamos MySQL por su robustez y facilidad de integración con Node.js.

## 2. Modelo entidad-relación

Diseñamos tablas para usuarios, empleados, pedidos, etc., y sus relaciones (por ejemplo, un pedido pertenece a un usuario).

## 3. Vistas, procedimientos, disparadores

Podemos usar vistas para consultas complejas y procedimientos para automatizar tareas, aunque en este proyecto su uso es limitado.

## 4. Protección y recuperación de datos

Implementamos backups y validaciones para evitar pérdidas o corrupciones.

---

# Lenguajes de Marcas y Gestión de Información

## 1. Estructura de HTML

Usamos etiquetas semánticas (`<header>`, `<main>`, `<footer>`) y seguimos buenas prácticas para accesibilidad y SEO.

## 2. Tecnologías frontend

Utilizamos HTML, CSS y JavaScript porque son estándar para aplicaciones web.

## 3. Interacción con el DOM

Sí, usamos JavaScript para modificar el DOM dinámicamente (por ejemplo, mostrar/ocultar menús o actualizar datos en tiempo real).

## 4. Validación de HTML y CSS

Validamos los archivos usando validadores online y extensiones del IDE.

## 5. Conversión de datos (XML, JSON)

Usamos JSON para intercambiar datos entre frontend y backend, por su facilidad de uso en JavaScript.

## 6. Integración con sistemas de gestión

Nuestra aplicación es una aplicación de gestión empresarial (restaurante), gestionando empleados, pedidos, reservas, etc.

---

# Proyecto Intermodular

## 1. Objetivo del software

Facilitar la gestión de un restaurante: empleados, pedidos, reservas, menús, etc.

## 2. Necesidad o problema que soluciona

Evita la gestión manual, reduce errores y mejora la eficiencia del restaurante.

## 3. Stack de tecnologías

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Base de datos:** MySQL
- **Control de versiones:** Git, GitHub

Elegimos este stack por su popularidad, soporte y facilidad de aprendizaje.

## 4. Desarrollo por versiones

- **Versión 1:** Login y gestión básica de empleados.
- **Versión 2:** Gestión de pedidos y reservas.
- **Versión 3:** Reportes y estadísticas.
