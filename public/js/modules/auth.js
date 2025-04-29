// public/js/auth.js
const API_BASE_URL = 'http://localhost:3000';
let internalToken = null;
let currentUser = null;

/**
 * Inicializa la autenticación con el token y el usuario logueado.
 */
export function initAuth(token, user) {
  // Guardamos token y user en variables internas
  internalToken = token;
  currentUser = user;

  // Actualizamos la foto de perfil si existe
  const profilePhoto = document.getElementById('profilePhoto');
  if (profilePhoto && currentUser.photo) {
    profilePhoto.src = `${API_BASE_URL}${currentUser.photo}`;
  }

  // Actualizamos la foto en la barra superior si existe
  const topBarUserPic = document.getElementById('topBarUserPic');
  if (topBarUserPic && currentUser.photo) {
    topBarUserPic.src = `${API_BASE_URL}${currentUser.photo}`;
  }

  // Actualizar datos de usuario en el perfil si existen
  const profileUsername = document.getElementById('profileUsername');
  if (profileUsername) profileUsername.textContent = currentUser.username || '';
  const profileFullname = document.getElementById('profileFullname');
  if (profileFullname) profileFullname.textContent = currentUser.fullname || '';
  const profileEmail = document.getElementById('profileEmail');
  if (profileEmail) profileEmail.textContent = currentUser.email || '';

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
    const resp = await fetch(`${API_BASE_URL}/api/auth/update-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass })
    });

    if (!resp.ok) {
      throw new Error(`Error HTTP: ${resp.status}`);
    }

    const data = await resp.json();
    if (data.success) {
      if (passMsg) {
        passMsg.textContent = 'Contraseña actualizada correctamente';
        passMsg.style.color = 'green';
      }
      // Limpiar campos
      const oldPassInput = document.getElementById('oldPass');
      const newPassInput = document.getElementById('newPass');
      if (oldPassInput) oldPassInput.value = '';
      if (newPassInput) newPassInput.value = '';
    } else {
      if (passMsg) {
        passMsg.textContent = 'Error: ' + data.message;
        passMsg.style.color = 'red';
      }
    }
  } catch (err) {
    console.error('Error al actualizar contraseña:', err);
    if (passMsg) {
      passMsg.textContent = 'Error de conexión al actualizar la contraseña';
      passMsg.style.color = 'red';
    }
  }
}

/**
 * Sube una nueva foto de perfil al servidor.
 */
export async function updateMyPhoto() {
  const picMsg = document.getElementById('picMsg');
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
    const resp = await fetch(`${API_BASE_URL}/api/auth/upload-photo`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + internalToken },
      body: formData
    });

    if (!resp.ok) {
      throw new Error(`Error HTTP: ${resp.status}`);
    }

    const data = await resp.json();
    if (data.success) {
      // Actualizamos la foto del usuario en localStorage
      currentUser.photo = data.photoUrl;
      localStorage.setItem('loggedUser', JSON.stringify(currentUser));

      // Actualizamos la foto del perfil en el DOM si está presente
      const profilePhoto = document.getElementById('profilePhoto');
      if (profilePhoto) {
        profilePhoto.src = `${API_BASE_URL}${data.photoUrl}`;
      }

      // Actualizamos también la foto en la barra superior si existe
      const topBarUserPic = document.getElementById('topBarUserPic');
      if (topBarUserPic) {
        topBarUserPic.src = `${API_BASE_URL}${data.photoUrl}`;
      }

      if (picMsg) {
        picMsg.textContent = 'Foto actualizada correctamente';
        picMsg.style.color = 'green';
      }

      // Limpiar el input de archivo
      fileInput.value = '';
    } else {
      if (picMsg) {
        picMsg.textContent = 'Error: ' + data.message;
        picMsg.style.color = 'red';
      }
    }
  } catch (err) {
    console.error('Error al subir foto:', err);
    if (picMsg) {
      picMsg.textContent = 'Error de conexión al subir la foto';
      picMsg.style.color = 'red';
    }
  }
}

/**
 * Registra un nuevo usuario (solo si el rol del usuario actual lo permite).
 */
async function registerNewUser(e) {
  e.preventDefault();

  const regMsg = document.getElementById('regMsg');
  if (regMsg) regMsg.textContent = '';

  const username = document.getElementById('regUsername')?.value.trim();
  const password = document.getElementById('regPassword')?.value.trim();
  const role = document.getElementById('regRole')?.value;
  const fullname = document.getElementById('regFullname')?.value.trim();
  const email = document.getElementById('regEmail')?.value.trim();
  const profile_pic = document.getElementById('regProfilePic')?.value.trim();

  // Validamos campos necesarios
  if (!username || !password || !role) {
    if (regMsg) regMsg.textContent = 'Faltan datos (usuario, pass o rol).';
    return;
  }

  try {
    const resp = await fetch(`${API_BASE_URL}/api/auth/register`, {
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

    if (!resp.ok) {
      throw new Error(`Error HTTP: ${resp.status}`);
    }

    const data = await resp.json();
    if (data.success) {
      if (regMsg) {
        regMsg.textContent = 'Usuario creado con ID ' + data.userId;
        regMsg.style.color = 'green';
      }

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
      if (regMsg) {
        regMsg.textContent = 'Error: ' + data.message;
        regMsg.style.color = 'red';
      }
    }
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    if (regMsg) {
      regMsg.textContent = 'Error de conexión al registrar usuario';
      regMsg.style.color = 'red';
    }
  }
}
