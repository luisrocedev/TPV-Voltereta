// public/js/main.js

let token = null;
let loggedUser = null;

window.addEventListener('DOMContentLoaded', async () => {
  token = localStorage.getItem('token');
  const userData = localStorage.getItem('loggedUser');

  // Si no hay token o usuario en localStorage, redirigimos a login
  if (!token || !userData) {
    window.location.href = 'login.html';
  } else {
    loggedUser = JSON.parse(userData);

    // Cargar e inicializar UI (navegación y ajustes de rol)
    const { initUI, applyRoleUI } = await import('./ui.js');
    initUI();
    applyRoleUI(loggedUser.role);

    // Inicializar autenticación (Auth) de forma temprana
    const { initAuth } = await import('./auth.js');
    initAuth(token, loggedUser);

    // Establecer lazy loading para los módulos de cada sección
    const sectionLinks = document.querySelectorAll('nav ul li a[data-section]');
    sectionLinks.forEach(link => {
      link.addEventListener('click', async () => {
        const section = link.getAttribute('data-section');
        // Cargar el módulo solo cuando se hace clic en la sección
        if (section === 'chat') {
          const { initChat } = await import('./chat.js');
          initChat();
        } else if (section === 'menu') {
          const { initMenu } = await import('./menu.js');
          initMenu(token);
        } else if (section === 'employees') {
          const { initEmployees } = await import('./employees.js');
          initEmployees(token);
        } else if (section === 'reservations') {
          const { initReservations } = await import('./reservations.js');
          initReservations(token);
        } else if (section === 'orders') {
          const { initOrders } = await import('./orders.js');
          initOrders(token, loggedUser);
        } else if (section === 'reports') {
          const { initReports } = await import('./reports.js');
          initReports(token);
        } else if (section === 'support') {
          const { initSupport } = await import('./support.js');
          initSupport(token, loggedUser);
        }
      });
    });
  }
});
