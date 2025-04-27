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
}

async function loadReservations() {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/reservations`, {
      headers: { 
        'Authorization': 'Bearer ' + internalToken,
        'Accept': 'application/json'
      }
    });

    if (!resp.ok) {
      throw new Error(`Error HTTP: ${resp.status}`);
    }

    const contentType = resp.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('La respuesta no es JSON válido');
    }

    const data = await resp.json();
    
    if (data.success) {
      const reservationList = document.getElementById('reservationList');
      if (!reservationList) return;
      
      reservationList.innerHTML = '';
      if (Array.isArray(data.data)) {
        data.data.forEach(r => {
          const li = document.createElement('li');
          li.textContent = `[${r.id}] ${r.customerName} - ${r.date} ${r.time} (${r.guests} comensales)`;
          reservationList.appendChild(li);
        });
      }
    } else {
      console.error('Error en la respuesta:', data.message);
    }
  } catch (err) {
    console.error('Error al cargar reservaciones:', err);
    const reservationList = document.getElementById('reservationList');
    if (reservationList) {
      reservationList.innerHTML = '<li class="error">Error al cargar las reservaciones. Por favor, intente de nuevo.</li>';
    }
  }
}

async function createReservation() {
  const customerName = document.getElementById('resCustomer').value.trim();
  const date = document.getElementById('resDate').value;
  const time = document.getElementById('resTime').value;
  const guests = parseInt(document.getElementById('resGuests').value) || 0;

  if (!customerName || !date || !time) return;

  try {
    const resp = await fetch(`${API_BASE_URL}/api/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ customerName, date, time, guests })
    });
    const data = await resp.json();
    if (data.success) {
      document.getElementById('resCustomer').value = '';
      document.getElementById('resDate').value = '';
      document.getElementById('resTime').value = '';
      document.getElementById('resGuests').value = '';
      await loadReservations();
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
  }
}
