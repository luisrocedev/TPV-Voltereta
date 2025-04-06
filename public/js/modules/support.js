// public/js/support.js
export function initSupport(token, loggedUser) {
  const supportSection = document.getElementById('supportSection');
  const supportTicketsContainer = document.getElementById('supportTicketsContainer');

  // Mostrar la sección de tickets solo para admin o gerente
  if (loggedUser.role === 'admin' || loggedUser.role === 'gerente') {
    if (supportTicketsContainer) {
      supportTicketsContainer.style.display = 'block';
      loadSupportTickets(token);
    }
  }

  const supportForm = document.getElementById('supportForm');
  if (supportForm) {
    supportForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const subject = document.getElementById('ticketSubject').value.trim();
      const description = document.getElementById('ticketDescription').value.trim();

      if (!subject || !description) return;

      try {
        const resp = await fetch('/api/support/ticket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ subject, description })
        });

        const data = await resp.json();
        const supportMsg = document.getElementById('supportMsg');
        if (data.success) {
          if (supportMsg) supportMsg.textContent = 'Ticket enviado correctamente. ID: ' + data.ticket.id;
          supportForm.reset();
          if (loggedUser.role === 'admin' || loggedUser.role === 'gerente') {
            loadSupportTickets(token);
          }
        } else {
          if (supportMsg) supportMsg.textContent = 'Error: ' + data.message;
        }
      } catch (err) {
        console.error(err);
        const supportMsg = document.getElementById('supportMsg');
        if (supportMsg) supportMsg.textContent = 'Error de conexión';
      }
    });
  }
}

async function loadSupportTickets(token) {
  try {
    const resp = await fetch('/api/support/tickets', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await resp.json();
    const ticketsList = document.getElementById('ticketsList');
    if (data.success) {
      ticketsList.innerHTML = data.tickets.map(ticket => {
        let dropdownHtml = '';
        if (ticket.status !== 'cerrado') {
          dropdownHtml = `
            <select class="ticket-status" data-ticket-id="${ticket.id}">
              <option value="abierto" ${ticket.status === 'abierto' ? 'selected' : ''}>Abierto</option>
              <option value="en_proceso" ${ticket.status === 'en_proceso' ? 'selected' : ''}>En Proceso</option>
              <option value="cerrado" ${ticket.status === 'cerrado' ? 'selected' : ''}>Cerrado</option>
            </select>
          `;
        } else {
          dropdownHtml = `<span>${ticket.status}</span>`;
        }
        return `
          <div class="ticket">
            <strong>ID:</strong> ${ticket.id} | <strong>Asunto:</strong> ${ticket.subject} <br>
            <strong>Estado:</strong> ${ticket.status} | <strong>Fecha:</strong> ${new Date(ticket.created_at).toLocaleString()} <br>
            <p>${ticket.description}</p>
            ${dropdownHtml}
          </div>
        `;
      }).join('');

      document.querySelectorAll('.ticket-status').forEach(dropdown => {
        dropdown.addEventListener('change', (e) => {
          const newStatus = e.target.value;
          const ticketId = e.target.getAttribute('data-ticket-id');
          updateTicketStatus(ticketId, newStatus, token);
        });
      });
    } else {
      ticketsList.textContent = 'No se pudieron cargar los tickets';
    }
  } catch (err) {
    console.error(err);
  }
}

window.updateTicketStatus = async function(ticketId, newStatus, token) {
  try {
    const resp = await fetch(`/api/support/ticket/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await resp.json();
    if (data.success) {
      alert(data.message);
      loadSupportTickets(token);
    } else {
      alert('Error: ' + data.message);
    }
  } catch (err) {
    console.error(err);
    alert('Error de conexión al actualizar el ticket');
  }
};
