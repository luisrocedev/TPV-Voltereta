let internalToken = null;

export function initReports(token) {
  internalToken = token;
  document.getElementById('reportBtn').addEventListener('click', loadReports);
  document.getElementById('factureBtn').addEventListener('click', () => {
    document.getElementById('factureMsg').textContent = 'Factura generada (demo)...';
  });
}

async function loadReports() {
  try {
    const resp = await fetch('/api/reports', {
      headers: { 'Authorization': 'Bearer ' + internalToken }
    });
    const data = await resp.json();
    if (data.success) {
      document.getElementById('reportData').textContent =
        `Reservas totales: ${data.totalReservations} | Ingresos facturados: $${data.totalRevenue}`;
    }
  } catch (err) {
    console.error(err);
  }
}
