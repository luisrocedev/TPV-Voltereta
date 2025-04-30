## Introducción

Hola, soy [tu nombre] y en este vídeo voy a presentar el proyecto TPV-Voltereta, un sistema de punto de venta para hostelería desarrollado con Node.js, JavaScript, HTML y CSS. A lo largo de la presentación, mostraré cómo se han abordado los resultados de aprendizaje de los diferentes módulos, enseñando ejemplos concretos en el código y la aplicación.

---

## 1. Programación

### a) Elementos Fundamentales

En [server.js](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) defino variables y constantes para configurar el servidor:

**const** **express** **=** **require**(**'express'**)**;**

**const** **app** **=** **express**(**)**;

**const** **PORT** **=** **process**.**env**.**PORT** **||** **3000**;

Aquí se importan módulos y se configura el puerto del servidor.

En [db.js](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) se definen los parámetros de conexión a la base de datos:

**const** **mysql** **=** **require**(**'mysql'**)**;**

**const** **db** **=** **mysql**.**createConnection**(**{**

\*\* **host**: **'localhost'**,\*\*

\*\* **user**: **'root'**,\*\*

\*\* **password**: **''**,\*\*

\*\* **database**: \*\*'voltereta'

**}**)**;**

Uso tipos de datos como strings y objetos para la configuración.

---

### b) Estructuras de Control

En [orders.js](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) uso bucles y condicionales:

**orders**.**forEach**(**order** **=>** **{**

\*\* **if**(**order**.**status** **===** **'pending'**)\*\* **{**

\*\* \*\*// Procesar pedido pendiente

\*\* \*\*}

**}**)**;**

Esto permite recorrer todos los pedidos y actuar según su estado.

---

### c) Control de Excepciones y Errores

En [errorHandler.js](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) gestiono los errores globalmente:

**module**.**exports** **=** **(**err**, **req**, **res**, **next**)** **=>** **{**

\*\* **console**.**error**(**err**.**stack**)\*\*;

\*\* **res**.**status**(**500**)**.**json**(**{\*\* **error**: **'Error interno del servidor'** **}**)**;**

**}**;

Así, cualquier error inesperado es capturado y devuelvo un mensaje controlado al usuario.

---

### d) Documentación del Código

En [employees.routes.js](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) documento las rutas:

**// Ruta para obtener todos los empleados**

**router**.**get**(**'/'**, **auth**, **async** **(**req**, **res**)** **=>** **{**

\*\* \*\*// ...código...

**}**)**;**

Esto facilita la comprensión y el mantenimiento del código.

---

### e) Paradigma de Programación

En el frontend, uso clases para representar entidades, por ejemplo en [employees.js](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html):

**export** **class** **Employee** **{**

\*\* **constructor**(**id**, **name**, **role**)\*\* **{**

\*\* **this**.**id** **=** **id**;\*\*

\*\* **this**.**name** **=** **name**;\*\*

\*\* **this**.**role** **=** **role**;\*\*

\*\* \*\*}

\*\* \*\*// Métodos de la clase...

**}**

Esto permite encapsular la lógica de los empleados.

---

### f) Clases y Objetos Principales

Creo objetos de la clase Employee:

**const** **empleado** **=** **new** **Employee**(**1**, **'Ana'**, **'Camarera'**)**;**

Así gestiono la información de cada empleado de forma estructurada.

---

### g) Conceptos Avanzados

Uso middlewares personalizados, por ejemplo en [auth.js](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html):

**module**.**exports** **=** **(**req**, **res**, **next**)** **=>** **{**

\*\* \*\*// Verifica el token de autenticación

\*\* **next**(**)**;\*\*

**}**;

Esto permite aplicar lógica de autenticación en todas las rutas protegidas.

---

### h) Gestión de Información

La información se almacena en MySQL, configurado en [db.js](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html), y también se gestionan archivos, como logs en [error.log](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) y subidas de imágenes en [uploads](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html).

---

### i) Estructuras de Datos

En [orders.js](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) uso arrays para manejar pedidos:

**let** **orders** **=** **[**]**;**

**orders**.**push**(**{** **id**: **1**, **mesa**: **5**, **productos**: **[**...**]** **}**)**;**

Esto facilita la manipulación de colecciones de datos.

---

### j) Técnicas Avanzadas

En [auth.js](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) uso expresiones regulares para validar emails:

**const** **emailRegex** **=** /**^**[**^**\s**@]+**@**[**^**\s**@]+**\.**[**^**\s**@]+**$**/\*\*;

**if**(**!**emailRegex**.**test**(**email**)**)\*\* \*\*{

\*\* \*\*// Mostrar error

**}**

También uso flujos de entrada/salida para logs y archivos subidos.

---

## 2. Sistemas Informáticos

### a) Hardware y Entornos

Desarrollo en Windows, pero el sistema es multiplataforma y puede ejecutarse en cualquier entorno con Node.js.

---

### b) Sistema Operativo

He elegido Windows para el desarrollo por comodidad, pero el despliegue puede hacerse en Linux o cualquier sistema compatible con Node.js.

---

### c) Configuración de Redes

En [server.js](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) configuro el servidor para escuchar peticiones HTTP:

**const** **server** **=** **app**.**listen**(**PORT**, **(**)\*\* **=>** \*\*{

\*\* **console**.**log**(**`Servidor escuchando en el puerto **${**PORT**}**`**)\*\*;

**}**)**;**

Además, uso sockets en [socket.js](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) para comunicación en tiempo real.

---

### d) Copias de Seguridad

Realizo copias de seguridad exportando la base de datos a [voltereta_db_prueba.sql](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html).
Los logs de actividad se almacenan en [combined.log](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) y [error.log](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html).

---

### e) Seguridad e Integridad de Datos

En [auth.js](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) protejo las rutas comprobando la autenticación:

**if** **(**!**token**)\*\* \*\*{

\*\* **return** **res**.**status**(**401**)**.**json**(**{\*\* **error**: **'No autorizado'** **}**)**;**

**}**

---

### f) Gestión de Usuarios y Permisos

En [employees.routes.js](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) solo los usuarios autenticados pueden añadir empleados:

**router**.**post**(**'/add'**, **auth**, **async** **(**req**, **res**)** **=>** **{**

\*\* \*\*// Añadir empleado

**}**)**;**

---

### g) Documentación Técnica

Toda la documentación técnica está en [README.md](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) y en [SoporteYMantenimiento.md](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html), donde explico la instalación, configuración y uso del sistema.

---

## 3. Entornos de Desarrollo

### a) IDE y Configuración

Utilizo Visual Studio Code con extensiones para Node.js y JavaScript.

---

### b) Automatización de Tareas

En [package.json](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) defino scripts para automatizar tareas:

**"scripts"**: **{**

\*\* **"start"**: **"node server.js"**,\*\*

\*\* **"dev"**: \*\*"nodemon server.js"

**}**

Esto facilita el arranque y el desarrollo del servidor.

---

### c) Control de Versiones

Uso Git y GitHub para gestionar el código y las ramas del proyecto.

---

### d) Refactorización

Refactorizo el código separando la lógica en módulos y middlewares, por ejemplo, la autenticación y la gestión de errores.

---

### e) Documentación Técnica

Toda la documentación técnica está en el archivo [README.md](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html).

---

### f) Diagramas

Incluyo diagramas de flujo y arquitectura en la carpeta [docs](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) para explicar la estructura del sistema.

---

## 4. Bases de Datos

### a) Sistema Gestor

Uso MySQL como sistema gestor de bases de datos, configurado en [db.js](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html).

---

### b) Modelo Entidad-Relación

En [voltereta_db_prueba.sql](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) defino las tablas y relaciones de la base de datos, reflejando la relación entre empleados, pedidos, productos, reservas, etc.

---

### c) Funcionalidades Avanzadas

Puedo añadir triggers o procedimientos almacenados en la base de datos para automatizar tareas, aunque la lógica principal reside en el backend.

---

### d) Protección y Recuperación de Datos

Realizo backups periódicos de la base de datos y guardo logs en la carpeta [logs](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html).

---

## 5. Lenguajes de Marcas y Gestión de Información

### a) Estructura HTML y Buenas Prácticas

En [dashboard.html](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) uso etiquetas semánticas:

**<**main**>**

** <**section\*\* **id**=**"orders"**></**section**>\*\*

** <**section\*\* **id**=**"employees"**></**section**>\*\*

**</**main**>**

Esto mejora la accesibilidad y la estructura del contenido.

---

### b) Tecnologías Frontend

Utilizo CSS para el diseño (en [css](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)) y JavaScript para la lógica de la interfaz (en [js](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)).

---

### c) Interacción con el DOM

En [main.js](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) manipulo el DOM para actualizar la interfaz:

**document**.**getElementById**(**'btnOrder'**)**.**addEventListener**(**'click'**, **(**)** **=>** **{**

\*\* \*\*// Actualizar interfaz

**}**)**;**

---

### d) Validación

Valido los formularios tanto en el frontend como en el backend para asegurar la integridad de los datos.

---

### e) Conversión de Datos

En [orders.js](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) envío y recibo datos en formato JSON:

**fetch**(**'/api/orders'**, **{**

\*\* **method**: **'POST'**,\*\*

\*\* **body**: **JSON**.**stringify**(**order**)\*\*,

\*\* **headers**: **{** **'Content-Type'**: **'application/json'** \*\*}

**}**)**;**

---

### f) Integración con Sistemas de Gestión Empresarial

TPV-Voltereta es una aplicación de gestión empresarial para hostelería, centralizando pedidos, reservas y empleados.

---

## 6. Proyecto Intermodular

### a) Objetivo del Software

El objetivo es digitalizar y optimizar la gestión de un negocio de hostelería, permitiendo controlar pedidos, reservas, empleados y facturación desde una única plataforma.

---

### b) Stack Tecnológico

Uso Node.js, JavaScript, HTML, CSS y MySQL por su robustez y facilidad de integración.

---

### c) Desarrollo por Versiones

Empecé con una versión mínima funcional y fui añadiendo módulos como reservas, reportes y soporte.
Puedo mostrar el historial de commits en GitHub para ilustrar este proceso.

---

## 7. Evaluación y Entrega

Entrego vídeos demostrando el funcionamiento, el código fuente en GitHub y la documentación en [README.md](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) y [SoporteYMantenimiento.md](vscode-file://vscode-app/c:/Users/Luis/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html).

---

## Despedida

Esto ha sido un recorrido completo por el proyecto TPV-Voltereta, mostrando cómo se han abordado todos los resultados de aprendizaje requeridos.
Gracias por vuestra atención.
