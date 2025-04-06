// public/js/auth.js

let internalToken = null;
let currentUser   = null;

/**
 * Inicializa la autenticación con el token y el usuario logueado.
 * Además, configura los eventListeners de logout, registro y actualización de datos.
 */
export function initAuth(token, user) {
  // Guardamos token y user en variables internas
  internalToken = token;
  currentUser   = user;

  // Botón de logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Formulario de registro de usuarios (solo visible si el rol corresponde)
  const adminRegisterForm = document.getElementById('adminRegisterForm');
  if (adminRegisterForm) {
    adminRegisterForm.addEventListener('submit', registerNewUser);
  }

  // Botón para actualizar contraseña
  const savePassBtn = document.getElementById('savePassBtn');
  if (savePassBtn) {
    savePassBtn.addEventListener('click', updatePassword);
  }

  // Botón para actualizar la foto de perfil
  const updateMyPhotoBtn = document.getElementById('updateMyPhotoBtn');
  if (updateMyPhotoBtn) {
    updateMyPhotoBtn.addEventListener('click', updateMyPhoto);
  }
}

/**
 * Cierra la sesión del usuario eliminando los datos de LocalStorage.
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('loggedUser');
  window.location.href = 'login.html';
}

/**
 * Actualiza la contraseña del usuario autenticado.
 */
export async function updatePassword() {
  const oldPass = document.getElementById('oldPass')?.value.trim();
  const newPass = document.getElementById('newPass')?.value.trim();
  const passMsg = document.getElementById('passMsg');
  
  // Limpiamos mensaje anterior
  if (passMsg) passMsg.textContent = '';

  // Validamos campos
  if (!oldPass || !newPass) {
    if (passMsg) passMsg.textContent = 'Faltan contraseñas';
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
      if (passMsg) passMsg.textContent = 'Contraseña actualizada correctamente';
    } else {
      if (passMsg) passMsg.textContent = 'Error: ' + data.message;
    }
  } catch (e) {
    if (passMsg) passMsg.textContent = 'Error de conexión';
  }
}

/**
 * Sube una nueva foto de perfil al servidor.
 */
export async function updateMyPhoto() {
  const picMsg   = document.getElementById('picMsg');
  const fileInput = document.getElementById('photoFile');
  
  // Limpiamos mensaje anterior
  if (picMsg) picMsg.textContent = '';

  // 1) Comprobamos que el input de archivo exista
  if (!fileInput) {
    if (picMsg) picMsg.textContent = 'Error: no se encontró el campo de archivo en el DOM.';
    return;
  }

  // 2) Validamos que el usuario haya seleccionado un archivo
  if (!fileInput.files || fileInput.files.length === 0) {
    if (picMsg) picMsg.textContent = 'Selecciona una imagen JPG o PNG antes de subir.';
    return;
  }

  const file = fileInput.files[0];

  // 3) Preparamos el FormData con el archivo
  const formData = new FormData();
  formData.append('photo', file);

  try {
    // Petición al endpoint de subida de foto
    const resp = await fetch('/api/auth/upload-photo', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + internalToken },
      body: formData
    });
    const data = await resp.json();

    if (data.success) {
      // Actualizamos la foto del usuario en localStorage
      currentUser.photo = data.photoUrl;
      localStorage.setItem('loggedUser', JSON.stringify(currentUser));

      // Actualizamos la foto del perfil en el DOM si está presente
      const profilePhoto = document.getElementById('profilePhoto');
      if (profilePhoto) {
        profilePhoto.src = data.photoUrl;
      }

      if (picMsg) picMsg.textContent = 'Foto actualizada correctamente';
    } else {
      if (picMsg) picMsg.textContent = 'Error: ' + data.message;
    }
  } catch (err) {
    console.error(err);
    if (picMsg) picMsg.textContent = 'Error de conexión al subir la foto';
  }
}

/**
 * Registra un nuevo usuario (solo si el rol del usuario actual lo permite).
 */
async function registerNewUser(e) {
  e.preventDefault();

  const regMsg = document.getElementById('regMsg');
  if (regMsg) regMsg.textContent = '';

  const username    = document.getElementById('regUsername')?.value.trim();
  const password    = document.getElementById('regPassword')?.value.trim();
  const role        = document.getElementById('regRole')?.value;
  const fullname    = document.getElementById('regFullname')?.value.trim();
  const email       = document.getElementById('regEmail')?.value.trim();
  const profile_pic = document.getElementById('regProfilePic')?.value.trim();

  // Validamos campos necesarios
  if (!username || !password || !role) {
    if (regMsg) regMsg.textContent = 'Faltan datos (usuario, pass o rol).';
    return;
  }

  try {
    const resp = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({
        username,
        password,
        role,
        fullname,
        email,
        profile_pic
      })
    });

    const data = await resp.json();
    if (data.success) {
      if (regMsg) regMsg.textContent = 'Usuario creado con ID ' + data.userId;

      // Limpiamos el formulario
      const fieldsToClear = [
        'regUsername', 'regPassword', 'regRole',
        'regFullname', 'regEmail', 'regProfilePic'
      ];
      fieldsToClear.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
      });
    } else {
      if (regMsg) regMsg.textContent = 'Error: ' + data.message;
    }
  } catch (err) {
    console.error(err);
    if (regMsg) regMsg.textContent = 'Error de conexión o servidor.';
  }
}
