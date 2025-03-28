// public/js/main.js
import { initAuth } from './auth.js';
import { initChat } from './chat.js';
import { initMenu } from './menu.js';
import { initEmployees } from './employees.js';
import { initReservations } from './reservations.js';
import { initOrders } from './orders.js';
import { initReports } from './reports.js';
import { initUI, applyRoleUI } from './ui.js';

let token = null;
let loggedUser = null;

window.addEventListener('DOMContentLoaded', () => {
  token = localStorage.getItem('token');
  const userData = localStorage.getItem('loggedUser');

  if (!token || !userData) {
    window.location.href = 'login.html';
  } else {
    loggedUser = JSON.parse(userData);

    // 1) Inicializa la parte visual (navegación)
    initUI();

    // 2) Ajuste de la UI según el rol
    applyRoleUI(loggedUser.role);

    // 3) Manejo de Auth, logout, forms de registrar, etc.
    initAuth(token, loggedUser);

    // 4) Chat en tiempo real
    initChat();

    // 5) Módulos
    initMenu(token);
    initEmployees(token);
    initReservations(token);
    initOrders(token, loggedUser);
    initReports(token);
  }
});
