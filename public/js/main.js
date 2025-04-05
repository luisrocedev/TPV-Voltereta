// public/js/main.js
// Tareas globales

const token = localStorage.getItem('token');
const userData = localStorage.getItem('loggedUser');

if (!token || !userData) {
  window.location.href = 'login.html';
} else {
  const loggedUser = JSON.parse(userData);

  // Establecer el nombre del usuario en la top-bar (este elemento se encuentra en dashboard.html)
  const topBarUserName = document.getElementById('topBarUserName');
  if (topBarUserName) {
    topBarUserName.textContent = loggedUser.fullname || loggedUser.username;
  }

  // Inicializar autenticación (global)
  import('./auth.js').then(module => module.initAuth(token, loggedUser));

  // Configurar cualquier otra tarea global (por ejemplo, configuración de socket o menú hamburguesa global)
  // NOTA: La carga de partials se realiza en el script de dashboard.html
}
