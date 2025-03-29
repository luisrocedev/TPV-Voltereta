# Soporte y Mantenimiento

## Documentación

Esta documentación ofrece una visión general de las funcionalidades de soporte y mantenimiento integradas en el sistema TPV.  
Se busca facilitar el uso y la administración del sistema, asegurando que tanto los usuarios como el equipo técnico dispongan de la información necesaria para resolver problemas y mantener el sistema actualizado.

## Soporte Técnico

Los usuarios pueden reportar incidencias o solicitar ayuda mediante la API de soporte.

- **Endpoint para crear un ticket:** `POST /api/support/ticket`  
  **Parámetros:**
  - `subject`: Asunto del ticket.
  - `description`: Descripción detallada del problema.

El equipo de soporte (administrador o gerente) podrá revisar y gestionar los tickets mediante:

- **Endpoint para consultar tickets:** `GET /api/support/tickets` (restringido a usuarios con rol `admin` o `gerente`).

## Actualizaciones Regulares

El sistema cuenta con un plan de actualizaciones periódicas que incluye:

- **Mejoras de seguridad:** Se implementarán parches y actualizaciones para garantizar la integridad del sistema.
- **Nuevas funcionalidades:** Se evaluarán y agregarán nuevas características en función de las necesidades de los usuarios.
- **Correcciones de errores:** Se atenderán incidencias reportadas para mejorar la estabilidad y el rendimiento.

El equipo de desarrollo realizará revisiones regulares y desplegará las actualizaciones conforme a un cronograma interno y en base a feedback recibido.
