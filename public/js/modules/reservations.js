// public/js/reservations.js
const API_BASE_URL = 'http://localhost:3000';
let internalToken = null;

export async function initReservations(token) {
  internalToken = token;
  await loadReservations();
  const resAddBtn = document.getElementById('resAddBtn');
  if (resAddBtn) {
    resAddBtn.addEventListener('click', createReservation);
  }
  // Delegar acciones de editar/eliminar
  document.getElementById('reservationList').addEventListener('click', handleReservationAction);
  // Modal cerrar
  const closeEditBtn = document.getElementById('closeEditResModal');
  if (closeEditBtn) closeEditBtn.onclick = () => document.getElementById('editReservationModal').close();
  // Guardar cambios (evento submit del formulario de edición)
  const editForm = document.getElementById('editReservationForm');
  if (editForm) {
    editForm.onsubmit = function(e) {
      e.preventDefault();
      saveReservationChanges();
    };
  }
}

async function loadReservations() {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/reservations`, {
      headers: { 
        'Authorization': 'Bearer ' + internalToken,
        'Accept': 'application/json'
      }
    });
    if (!resp.ok) throw new Error(`Error HTTP: ${resp.status}`);
    const data = await resp.json();
    const reservationList = document.getElementById('reservationList');
    if (!reservationList) return;
    reservationList.innerHTML = '';
    if (data.success && Array.isArray(data.data)) {
      data.data.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${r.customerName || ''}</td>
          <td>${r.date || ''}</td>
          <td>${r.time || ''}</td>
          <td>${r.guests || ''}</td>
          <td>${r.phone || ''}</td>
          <td>${r.notes || ''}</td>
          <td>
            <button class="edit-res-btn" data-id="${r.id}"><i class="fa fa-edit"></i></button>
            <button class="delete-res-btn" data-id="${r.id}"><i class="fa fa-trash"></i></button>
          </td>
        `;
        reservationList.appendChild(tr);
      });
    } else {
      reservationList.innerHTML = '<tr><td colspan="7">No hay reservas registradas.</td></tr>';
    }
  } catch (err) {
    const reservationList = document.getElementById('reservationList');
    if (reservationList) {
      reservationList.innerHTML = '<tr><td colspan="7" class="error">Error al cargar las reservas.</td></tr>';
    }
  }
}

async function createReservation() {
  const customerName = document.getElementById('resCustomer').value.trim();
  const date = document.getElementById('resDate').value;
  const time = document.getElementById('resTime').value;
  const guests = parseInt(document.getElementById('resGuests').value) || 0;
  const phone = document.getElementById('resPhone').value.trim();
  const notes = document.getElementById('resNotes').value.trim();
  if (!customerName || !date || !time) return;
  try {
    const resp = await fetch(`${API_BASE_URL}/api/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ customerName, date, time, guests, phone, notes })
    });
    const data = await resp.json();
    if (data.success) {
      document.getElementById('resCustomer').value = '';
      document.getElementById('resDate').value = '';
      document.getElementById('resTime').value = '';
      document.getElementById('resGuests').value = '';
      document.getElementById('resPhone').value = '';
      document.getElementById('resNotes').value = '';
      await loadReservations();
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert('Error al crear la reserva.');
  }
}

function handleReservationAction(e) {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  if (btn.classList.contains('edit-res-btn')) {
    openEditReservationModal(id);
  } else if (btn.classList.contains('delete-res-btn')) {
    if (confirm('¿Seguro que desea eliminar esta reserva?')) {
      deleteReservation(id);
    }
  }
}

async function openEditReservationModal(id) {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/reservations`, {
      headers: { 'Authorization': 'Bearer ' + internalToken }
    });
    const data = await resp.json();
    const reserva = data.data.find(r => r.id == id);
    if (!reserva) return;
    document.getElementById('editResId').value = reserva.id;
    document.getElementById('editResCustomer').value = reserva.customerName || '';
    document.getElementById('editResDate').value = reserva.date || '';
    document.getElementById('editResTime').value = reserva.time || '';
    document.getElementById('editResGuests').value = reserva.guests || '';
    document.getElementById('editResPhone').value = reserva.phone || '';
    document.getElementById('editResNotes').value = reserva.notes || '';
    const modal = document.getElementById('editReservationModal');
    if (modal) {
      if (typeof modal.showModal === 'function') {
        modal.showModal();
      } else {
        modal.style.display = 'block'; // fallback para navegadores antiguos
      }
    }
  } catch (err) {
    alert('Error al cargar la reserva.');
  }
}

async function saveReservationChanges() {
  const id = document.getElementById('editResId').value;
  const customerName = document.getElementById('editResCustomer').value.trim();
  const date = document.getElementById('editResDate').value;
  const time = document.getElementById('editResTime').value;
  const guests = parseInt(document.getElementById('editResGuests').value) || 0;
  const phone = document.getElementById('editResPhone').value.trim();
  const notes = document.getElementById('editResNotes').value.trim();
  if (!customerName || !date || !time) return;
  try {
    const resp = await fetch(`${API_BASE_URL}/api/reservations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ customerName, date, time, guests, phone, notes })
    });
    const data = await resp.json();
    if (data.success) {
      document.getElementById('editReservationModal').close();
      await loadReservations();
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert('Error al guardar los cambios.');
  }
}

async function deleteReservation(id) {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/reservations/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + internalToken }
    });
    const data = await resp.json();
    if (data.success) {
      await loadReservations();
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert('Error al eliminar la reserva.');
  }
}
