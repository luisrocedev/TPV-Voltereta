// public/js/support.js
import { showSpinner, hideSpinner } from './feedback.js';

const API_BASE_URL = 'http://localhost:3000';
let internalToken = null;

export function initSupport(token, loggedUser) {
  internalToken = token;
  const supportSection = document.getElementById('supportSection');
  const supportTicketsContainer = document.getElementById('supportTicketsContainer');

  // Mostrar la sección de tickets solo para admin o gerente
  if (loggedUser.role === 'admin' || loggedUser.role === 'gerente') {
    if (supportTicketsContainer) {
      supportTicketsContainer.style.display = 'block';
      loadSupportTickets();
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
        showSpinner();
        const resp = await fetch(`${API_BASE_URL}/api/support/ticket`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + internalToken
          },
          body: JSON.stringify({ subject, description })
        });

        if (!resp.ok) {
          throw new Error(`Error HTTP: ${resp.status}`);
        }

        const data = await resp.json();
        hideSpinner();
        const supportMsg = document.getElementById('supportMsg');

        if (data.success) {
          if (supportMsg) supportMsg.textContent = 'Ticket enviado correctamente. ID: ' + data.ticket.id;
          supportForm.reset();
          if (loggedUser.role === 'admin' || loggedUser.role === 'gerente') {
            loadSupportTickets();
          }
        } else {
          if (supportMsg) supportMsg.textContent = 'Error: ' + data.message;
        }
      } catch (err) {
        hideSpinner();
        console.error('Error al enviar ticket:', err);
        const supportMsg = document.getElementById('supportMsg');
        if (supportMsg) supportMsg.textContent = 'Error de conexión al enviar el ticket';
      }
    });
  }
}

async function loadSupportTickets() {
  try {
    showSpinner();
    const resp = await fetch(`${API_BASE_URL}/api/support/tickets`, {
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
    hideSpinner();
    const ticketsList = document.getElementById('ticketsList');
    
    if (!ticketsList) return;

    if (data.success && Array.isArray(data.tickets)) {
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
          updateTicketStatus(ticketId, newStatus);
        });
      });
    } else {
      ticketsList.innerHTML = '<div class="error-card">No se pudieron cargar los tickets</div>';
    }
  } catch (err) {
    hideSpinner();
    console.error('Error al cargar tickets:', err);
    const ticketsList = document.getElementById('ticketsList');
    if (ticketsList) {
      ticketsList.innerHTML = '<div class="error-card">Error al cargar los tickets. Por favor, intente de nuevo.</div>';
    }
  }
}

async function updateTicketStatus(ticketId, newStatus) {
  try {
    showSpinner();
    const resp = await fetch(`${API_BASE_URL}/api/support/ticket/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ status: newStatus })
    });

    if (!resp.ok) {
      throw new Error(`Error HTTP: ${resp.status}`);
    }

    const data = await resp.json();
    hideSpinner();

    if (data.success) {
      alert(data.message);
      loadSupportTickets();
    } else {
      alert('Error: ' + data.message);
    }
  } catch (err) {
    hideSpinner();
    console.error('Error al actualizar ticket:', err);
    alert('Error de conexión al actualizar el ticket. Por favor, intente de nuevo.');
  }
}
