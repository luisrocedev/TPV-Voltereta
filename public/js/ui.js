// public/js/ui.js

export function initUI() {
  // Configurar el menú hamburguesa (global en dashboard.html)
  const hamburger = document.querySelector('.hamburger');
  const navUl = document.querySelector('nav ul');
  if (hamburger && navUl) {
    hamburger.addEventListener('click', () => {
      navUl.classList.toggle('active');
    });
  }
}

export function applyRoleUI(role) {
  // Ocultar elementos del menú que no correspondan al rol
  const menuItems = document.querySelectorAll('nav ul li[data-roles]');
  menuItems.forEach(li => {
    const rolesAllowed = li.getAttribute('data-roles').split(',').map(r => r.trim());
    li.style.display = rolesAllowed.includes(role) ? 'inline-block' : 'none';
  });

  // Actualizar la sección de perfil si está en dashboard.html
  const userData = JSON.parse(localStorage.getItem('loggedUser'));
  if (userData) {
    const profilePhoto = document.getElementById('profilePhoto');
    if (profilePhoto) profilePhoto.src = userData.photo || '';
    const profileUsername = document.getElementById('profileUsername');
    if (profileUsername) profileUsername.textContent = userData.username;
    const profileFullname = document.getElementById('profileFullname');
    if (profileFullname) profileFullname.textContent = userData.fullname;
    const profileEmail = document.getElementById('profileEmail');
    if (profileEmail) profileEmail.textContent = userData.email;
  }
}
