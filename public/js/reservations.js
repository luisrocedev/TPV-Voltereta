// public/js/reservations.js

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
    const resp = await fetch('/api/reservations', {
      headers: { 'Authorization': 'Bearer ' + internalToken }
    });
    const data = await resp.json();
    if (data.success) {
      const reservationList = document.getElementById('reservationList');
      if (!reservationList) return;
      reservationList.innerHTML = '';
      data.data.forEach(r => {
        const li = document.createElement('li');
        li.textContent = `[${r.id}] ${r.customerName} - ${r.date} ${r.time} (${r.guests} comensales)`;
        reservationList.appendChild(li);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

async function createReservation() {
  const customerName = document.getElementById('resCustomer').value.trim();
  const date = document.getElementById('resDate').value;
  const time = document.getElementById('resTime').value;
  const guests = parseInt(document.getElementById('resGuests').value) || 0;

  if (!customerName || !date || !time) return;

  try {
    const resp = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ customerName, date, time, guests })
    });
    const data = await resp.json();
    if (data.success) {
      // Limpiar campos
      document.getElementById('resCustomer').value = '';
      document.getElementById('resDate').value = '';
      document.getElementById('resTime').value = '';
      document.getElementById('resGuests').value = '';
      // Recargamos
      await loadReservations();
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
  }
}
