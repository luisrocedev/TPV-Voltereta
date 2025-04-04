// public/js/ui.js

export function initUI() {
  // Lógica para mostrar/ocultar secciones del Dashboard al hacer clic en el menú
  const links = document.querySelectorAll('nav ul li a[data-section]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      // Ocultar todas las secciones
      document.querySelectorAll('section').forEach(sec => {
        sec.classList.add('section-hidden');
      });
      // Mostrar la sección correspondiente
      const section = link.getAttribute('data-section'); // p.e. "chat"
      const targetId = section + 'Section';              // p.e. "chatSection"
      document.getElementById(targetId).classList.remove('section-hidden');

      // Feedback visual: destacar el link activo
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Lógica para el botón hamburger (menú móvil), si existiese
  const hamburger = document.querySelector('.hamburger');
  const navUl = document.querySelector('nav ul');
  if (hamburger && navUl) {
    hamburger.addEventListener('click', () => {
      navUl.classList.toggle('active');
    });
  }
}

export function applyRoleUI(role) {
  // 1) Oculta los <li> del menú si el rol no está en su data-roles
  const menuItems = document.querySelectorAll('nav ul li[data-roles]');
  menuItems.forEach(li => {
    const rolesAllowed = li.getAttribute('data-roles').split(',');
    // Limpiar espacios en blanco:
    const trimmedRoles = rolesAllowed.map(r => r.trim());
    if (!trimmedRoles.includes(role)) {
      li.style.display = 'none';
    } else {
      li.style.display = 'inline-block'; // o 'list-item'
    }
  });

  // 2) Actualizar la sección de perfil con datos
  const userData = JSON.parse(localStorage.getItem('loggedUser'));
  if (userData) {
    if (document.getElementById('profilePhoto')) {
      document.getElementById('profilePhoto').src = userData.photo || '';
    }
    if (document.getElementById('profileUsername')) {
      document.getElementById('profileUsername').textContent = userData.username;
    }
    if (document.getElementById('profileFullname')) {
      document.getElementById('profileFullname').textContent = userData.fullname;
    }
    if (document.getElementById('profileEmail')) {
      document.getElementById('profileEmail').textContent = userData.email;
    }
  }
}
