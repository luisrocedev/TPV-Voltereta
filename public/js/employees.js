// public/js/employees.js

let internalToken = null;

export async function initEmployees(token) {
  internalToken = token;
  await loadEmployees();
  const addBtn = document.getElementById('employeeAddBtn');
  if (addBtn) {
    addBtn.addEventListener('click', createEmployee);
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
          li.textContent = `${emp.name} - ${emp.role}`;
          employeeList.appendChild(li);
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
}

async function createEmployee() {
  const name = document.getElementById('employeeName').value.trim();
  const role = document.getElementById('employeeRole').value.trim();
  if (!name || !role) return;

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
      // Reseteamos campos
      document.getElementById('employeeName').value = '';
      document.getElementById('employeeRole').value = '';
      // Volvemos a cargar
      await loadEmployees();
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
  }
}
