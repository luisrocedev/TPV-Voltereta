// public/js/auth.js
let internalToken = null;
let currentUser   = null;

export function initAuth(token, user) {
  internalToken = token;
  currentUser   = user;

  // Vinculamos el botón de "Salir" a la función logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  // Formulario para registrar (solo admin)
  const adminRegisterForm = document.getElementById('adminRegisterForm');
  if (adminRegisterForm) {
    adminRegisterForm.addEventListener('submit', registerNewUser);
  }

  // Botón para cambiar password
  const savePassBtn = document.getElementById('savePassBtn');
  if (savePassBtn) {
    savePassBtn.addEventListener('click', updatePassword);
  }

  // Botón para cambiar foto
  const updateMyPhotoBtn = document.getElementById('updateMyPhotoBtn');
  if (updateMyPhotoBtn) {
    updateMyPhotoBtn.addEventListener('click', updateMyPhoto);
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('loggedUser');
  window.location.href = 'login.html';
}

// Actualizar contraseña
export async function updatePassword() {
  const oldPass = document.getElementById('oldPass').value.trim();
  const newPass = document.getElementById('newPass').value.trim();
  const passMsg = document.getElementById('passMsg');
  passMsg.textContent = '';

  if (!oldPass || !newPass) {
    passMsg.textContent = 'Faltan contraseñas';
    return;
  }
  try {
    const resp = await fetch('/api/auth/update-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass })
    });
    const data = await resp.json();
    if (data.success) {
      passMsg.textContent = 'Contraseña actualizada correctamente';
    } else {
      passMsg.textContent = 'Error: ' + data.message;
    }
  } catch (e) {
    passMsg.textContent = 'Error de conexión';
  }
}

// Actualizar foto de perfil
export async function updateMyPhoto() {
  const picMsg = document.getElementById('picMsg');
  const newProfilePic = document.getElementById('newProfilePic').value.trim();
  picMsg.textContent = '';

  if (!newProfilePic) {
    picMsg.textContent = 'Falta la URL de la foto';
    return;
  }
  try {
    const resp = await fetch('/api/auth/myprofile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ profile_pic: newProfilePic })
    });
    const data = await resp.json();
    if (data.success) {
      picMsg.textContent = 'Foto actualizada';
      // Actualizamos la foto en la variable local y en pantalla
      if (currentUser) currentUser.photo = newProfilePic;
      localStorage.setItem('loggedUser', JSON.stringify(currentUser));
      document.getElementById('profilePhoto').src = newProfilePic;
    } else {
      picMsg.textContent = 'Error: ' + data.message;
    }
  } catch (e) {
    picMsg.textContent = 'Error de conexión';
  }
}

// Registrar un nuevo usuario (solo admin)
async function registerNewUser(e) {
  e.preventDefault();

  // Recuperamos campos
  const regMsg = document.getElementById('regMsg');
  regMsg.textContent = '';

  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const role     = document.getElementById('regRole').value;
  const fullname = document.getElementById('regFullname').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const profile_pic = document.getElementById('regProfilePic').value.trim();

  if (!username || !password || !role) {
    regMsg.textContent = 'Faltan datos (usuario, pass o rol).';
    return;
  }

  try {
    const resp = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken // MUY IMPORTANTE
      },
      body: JSON.stringify({ username, password, role, fullname, email, profile_pic })
    });
    const data = await resp.json();
    if (data.success) {
      regMsg.textContent = 'Usuario creado con ID ' + data.userId;
      // Limpiar formulario
      document.getElementById('regUsername').value = '';
      document.getElementById('regPassword').value = '';
      document.getElementById('regRole').value     = '';
      document.getElementById('regFullname').value = '';
      document.getElementById('regEmail').value    = '';
      document.getElementById('regProfilePic').value = '';
    } else {
      regMsg.textContent = 'Error: ' + data.message;
    }
  } catch (err) {
    console.error(err);
    regMsg.textContent = 'Error de conexión o servidor.';
  }
}
