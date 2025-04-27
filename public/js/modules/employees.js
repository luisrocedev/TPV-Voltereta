// public/js/employees.js
let internalToken = null;
const API_BASE = 'http://localhost:3000'; // Añadir base URL

export async function initEmployees(token) {
  internalToken = token;
  await loadEmployees();

  const addBtn = document.getElementById('employeeAddBtn');
  if (addBtn) {
    addBtn.addEventListener('click', createEmployee);
  }

  const saveEmpChangesBtn = document.getElementById('saveEmpChanges');
  if (saveEmpChangesBtn) {
    saveEmpChangesBtn.addEventListener('click', updateEmployee);
  }

  const closeEditEmpBtn = document.getElementById('closeEditEmpModal');
  if (closeEditEmpBtn) {
    closeEditEmpBtn.addEventListener('click', () => {
      const modal = document.getElementById('editEmployeeModal');
      if (modal) modal.close();
    });
  }
}

async function loadEmployees() {
  try {
    const resp = await fetch(`${API_BASE}/api/employees`, {
      headers: { 'Authorization': 'Bearer ' + internalToken }
    });
    const data = await resp.json();
    if (data.success) {
      const employeeList = document.getElementById('employeeList');
      if (employeeList) {
        employeeList.innerHTML = '';
        data.data.forEach(emp => {
          const li = document.createElement('li');
          li.innerHTML = `
            ${emp.username} - ${emp.role} - ${emp.fullname || ''} (${emp.email || ''})
            <button class="edit-emp-btn" data-id="${emp.id}">Editar</button>
            <button class="delete-emp-btn" data-id="${emp.id}">Eliminar</button>
          `;
          employeeList.appendChild(li);
        });

        document.querySelectorAll('.edit-emp-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const emp = data.data.find(e => e.id == id);
            if (emp) {
              openEditEmployeeModal(emp);
            }
          });
        });

        document.querySelectorAll('.delete-emp-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (confirm("¿Estás seguro de eliminar este empleado?")) {
              await deleteEmployee(id);
            }
          });
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function createEmployee() {
  const usernameElem = document.getElementById('employeeUsername');
  const passwordElem = document.getElementById('employeePassword');
  const roleElem = document.getElementById('employeeRole');
  const fullnameElem = document.getElementById('employeeFullname');
  const emailElem = document.getElementById('employeeEmail');
  const profilePicElem = document.getElementById('employeeProfilePic');

  if (!usernameElem || !passwordElem || !roleElem) {
    console.error('Elementos obligatorios no encontrados.');
    return;
  }

  const username = usernameElem.value.trim();
  const password = passwordElem.value.trim();
  const role = roleElem.value;
  const fullname = fullnameElem ? fullnameElem.value.trim() : '';
  const email = emailElem ? emailElem.value.trim() : '';
  const profilePic = profilePicElem ? profilePicElem.value.trim() : '';

  if (!username || !password || !role) {
    alert("Faltan datos obligatorios: usuario, contraseña o rol.");
    return;
  }

  try {
    const resp = await fetch(`${API_BASE}/api/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ username, password, role, fullname, email, profile_pic: profilePic })
    });
    const data = await resp.json();
    if (data.success) {
      usernameElem.value = '';
      passwordElem.value = '';
      roleElem.value = '';
      if (fullnameElem) fullnameElem.value = '';
      if (emailElem) emailElem.value = '';
      if (profilePicElem) profilePicElem.value = '';
      await loadEmployees();
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
  }
}

function openEditEmployeeModal(employee) {
  const editEmpId = document.getElementById('editEmpId');
  const editEmpUsername = document.getElementById('editEmpUsername');
  const editEmpRole = document.getElementById('editEmpRole');
  const editEmpFullname = document.getElementById('editEmpFullname');
  const editEmpEmail = document.getElementById('editEmpEmail');
  const editEmpProfilePic = document.getElementById('editEmpProfilePic');
  if (editEmpId && editEmpUsername && editEmpRole) {
    editEmpId.value = employee.id;
    editEmpUsername.value = employee.username;
    editEmpRole.value = employee.role;
    if (editEmpFullname) editEmpFullname.value = employee.fullname || '';
    if (editEmpEmail) editEmpEmail.value = employee.email || '';
    if (editEmpProfilePic) editEmpProfilePic.value = employee.profile_pic || '';
    const modal = document.getElementById('editEmployeeModal');
    if (modal) modal.showModal();
  }
}

async function updateEmployee() {
  const id = document.getElementById('editEmpId').value;
  const username = document.getElementById('editEmpUsername').value.trim();
  const role = document.getElementById('editEmpRole').value;
  const fullname = document.getElementById('editEmpFullname').value.trim();
  const email = document.getElementById('editEmpEmail').value.trim();
  const profilePic = document.getElementById('editEmpProfilePic').value.trim();

  if (!username || !role) {
    alert("Faltan datos obligatorios en el formulario de edición.");
    return;
  }

  try {
    const resp = await fetch(`${API_BASE}/api/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ username, role, fullname, email, profile_pic: profilePic })
    });
    const data = await resp.json();
    if (data.success) {
      const modal = document.getElementById('editEmployeeModal');
      if (modal) modal.close();
      await loadEmployees();
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
  }
}

async function deleteEmployee(id) {
  try {
    const resp = await fetch(`${API_BASE}/api/employees/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + internalToken
      }
    });
    const data = await resp.json();
    if (data.success) {
      await loadEmployees();
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
  }
}
