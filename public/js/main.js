// public/js/main.js

let token = null;
let loggedUser = null;

window.addEventListener('DOMContentLoaded', async () => {
  token = localStorage.getItem('token');
  const userData = localStorage.getItem('loggedUser');

  if (!token || !userData) {
    window.location.href = 'login.html';
  } else {
    loggedUser = JSON.parse(userData);

    const { initUI, applyRoleUI } = await import('./ui.js');
    initUI();
    applyRoleUI(loggedUser.role);

    const { initAuth } = await import('./auth.js');
    initAuth(token, loggedUser);

    // Ponemos el nombre en la top-bar, si existe
    const topBarUserName = document.getElementById('topBarUserName');
    if (topBarUserName) {
      topBarUserName.textContent = loggedUser.fullname || loggedUser.username;
    }

    // Lazy loading de secciones
    const sectionLinks = document.querySelectorAll('nav ul li a[data-section]');
    sectionLinks.forEach(link => {
      link.addEventListener('click', async () => {
        const section = link.getAttribute('data-section');
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

    // Menú hamburguesa en móviles
    const hamburgerBtn = document.querySelector('.hamburger');
    const navElement = document.querySelector('nav');
    if (hamburgerBtn && navElement) {
      hamburgerBtn.addEventListener('click', () => {
        navElement.classList.toggle('active');
      });
    }
  }
});
