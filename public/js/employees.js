// public/js/employees.js

let internalToken = null;

export async function initEmployees(token) {
  internalToken = token;
  await loadEmployees();
  
  // Botón para crear empleado
  const addBtn = document.getElementById('employeeAddBtn');
  if (addBtn) {
    addBtn.addEventListener('click', createEmployee);
  }
  
  // Botón para guardar cambios en el modal de edición
  const saveEmpChangesBtn = document.getElementById('saveEmpChanges');
  if (saveEmpChangesBtn) {
    saveEmpChangesBtn.addEventListener('click', updateEmployee);
  }
  
  // Botón para cerrar el modal de edición
  const closeEditEmpBtn = document.getElementById('closeEditEmpModal');
  if (closeEditEmpBtn) {
    closeEditEmpBtn.addEventListener('click', () => {
      document.getElementById('editEmployeeModal').close();
    });
  }
}

async function loadEmployees() {
  try {
    const resp = await fetch('/api/employees', {
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
            ${emp.name} - ${emp.role}
            <button class="edit-emp-btn" data-id="${emp.id}">Editar</button>
            <button class="delete-emp-btn" data-id="${emp.id}">Eliminar</button>
          `;
          employeeList.appendChild(li);
        });
        
        // Asignar eventos a los botones de editar
        document.querySelectorAll('.edit-emp-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const emp = data.data.find(e => e.id == id);
            if (emp) {
              openEditEmployeeModal(emp);
            }
          });
        });
        
        // Asignar eventos a los botones de eliminar
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
  const name = document.getElementById('employeeName').value.trim();
  const role = document.getElementById('employeeRole').value; // Valor del <select>
  if (!name || !role) {
    alert("Falta ingresar el nombre o seleccionar el rol.");
    return;
  }
  
  try {
    const resp = await fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ name, role })
    });
    const data = await resp.json();
    if (data.success) {
      // Limpiar campos
      document.getElementById('employeeName').value = '';
      document.getElementById('employeeRole').value = '';
      await loadEmployees();
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
  }
}

function openEditEmployeeModal(employee) {
  // Rellenar el modal con los datos del empleado a editar
  document.getElementById('editEmpId').value = employee.id;
  document.getElementById('editEmpName').value = employee.name;
  document.getElementById('editEmpRole').value = employee.role;
  document.getElementById('editEmployeeModal').showModal();
}

async function updateEmployee() {
  const id = document.getElementById('editEmpId').value;
  const name = document.getElementById('editEmpName').value.trim();
  const role = document.getElementById('editEmpRole').value;
  if (!name || !role) {
    alert("Faltan datos en el formulario de edición.");
    return;
  }
  
  try {
    const resp = await fetch('/api/employees/' + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ name, role })
    });
    const data = await resp.json();
    if (data.success) {
      document.getElementById('editEmployeeModal').close();
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
    const resp = await fetch('/api/employees/' + id, {
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
