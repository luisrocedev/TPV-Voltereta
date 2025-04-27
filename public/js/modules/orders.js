// public/js/orders.js
import { socket } from './socket.js';
import { showSpinner, hideSpinner } from './feedback.js';

const API_BASE_URL = 'http://localhost:3000';
let internalToken = null;
let currentUser = null;
let refreshInterval = null;

/**
 * initOrders
 * - Se llama al cargar la sección "Pedidos" (orders.html)
 * - Configura listeners de sockets y eventos de la UI
 */
export function initOrders(token, loggedUser) {
  internalToken = token;
  currentUser = loggedUser;

  // Escuchar cuando se crea un pedido (desde front o back):
  socket.on('newOrder', (data) => {
    // Solo aplica a chef/mesero
    if (['chef', 'mesero'].includes(loggedUser.role)) {
      showToast(`¡Nuevo pedido #${data.orderId} en la mesa ${data.tableNumber}!`);
      // Si estoy en la sección orders, recargo la lista
      const ordersSection = document.getElementById('ordersSection');
      if (ordersSection) {
        loadOrders();
      }
      // Parpadeo en el menú de "Pedidos"
      highlightMenuItem('orders');
    }
  });

  // Escuchar cambio de estado
  socket.on('orderStatusChanged', (payload) => {
    if (['chef', 'mesero'].includes(loggedUser.role)) {
      // Muestra un "toast"
      showToast(`El pedido #${payload.orderId} cambió a "${payload.newStatus}" (por ${payload.changedBy})`);
      // Refrescamos si estamos en la sección
      const ordersSection = document.getElementById('ordersSection');
      if (ordersSection) {
        loadOrders();
      }
      // Parpadeo en el menú
      highlightMenuItem('orders');
    }
  });

  // Botones del modal
  const openModalBtn = document.getElementById('openOrderModalBtn');
  if (openModalBtn) {
    // Solo admin, gerente, mesero crean pedido
    if (['admin', 'gerente', 'mesero'].includes(currentUser.role)) {
      openModalBtn.style.display = 'inline-block';
      openModalBtn.addEventListener('click', openOrderModal);
    } else {
      openModalBtn.style.display = 'none';
    }
  }

  const closeModalBtn = document.getElementById('closeNewOrderModal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeOrderModal);
  }

  const addItemBtn = document.getElementById('addItemBtn');
  if (addItemBtn) {
    addItemBtn.addEventListener('click', addNewOrderItem);
  }

  const createOrderBtn = document.getElementById('createOrderConfirmBtn');
  if (createOrderBtn) {
    createOrderBtn.addEventListener('click', createOrder);
  }

  // Cargar pedidos inicialmente
  loadOrders();

  // Intervalo para actualizar el "tiempo transcurrido" cada 30s
  refreshInterval = setInterval(updateOrderTimes, 30_000);
}

/**
 * Limpieza (opcional): si tu app quita el partial y quieres
 *  dejar de escuchar eventos, llamas disposeOrders.
 */
export function disposeOrders() {
  if (refreshInterval) clearInterval(refreshInterval);
  // Quitamos listeners de socket
  socket.off('newOrder');
  socket.off('orderStatusChanged');
}

async function loadOrders() {
  try {
    showSpinner();
    const resp = await fetch(`${API_BASE_URL}/api/orders`, {
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

    if (data.success) {
      const board = document.getElementById('ordersBoard');
      if (!board) return;
      board.innerHTML = '';

      data.data.forEach(order => {
        const card = document.createElement('article');
        card.classList.add('order-card');
        // status-<estado> para colorear en CSS
        card.classList.add(`status-${order.status}`);

        // Calcular total
        const totalAmount = (order.items || []).reduce(
          (sum, it) => sum + (it.quantity * (it.price || 0)),
          0
        );

        // ID único para actualizar el tiempo en vivo
        const elapsedTimeId = `elapsed-${order.id}`;

        card.innerHTML = `
          <div class="order-card-header">
            <p class="order-status">${mapStatusText(order.status)}</p>
            <p class="order-id">#${order.id}</p>
          </div>
          <div class="order-card-body">
            <p class="order-customer">${order.customer || 'Sin cliente'}</p>
          </div>
          <div class="order-card-footer">
            <p class="order-total">€${totalAmount.toFixed(2)}</p>
            <p class="order-time" id="${elapsedTimeId}" data-createdat="${order.createdAt}">
              ${calcElapsedTime(order.createdAt)}
            </p>
          </div>
        `;

        // Acciones según rol y estado
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('order-card-actions');

        if (currentUser.role === 'mesero') {
          if (order.status === 'pedido_realizado') {
            const btnCancelar = document.createElement('button');
            btnCancelar.textContent = 'Cancelar';
            btnCancelar.addEventListener('click', () => updateOrderStatus(order.id, 'cancelado'));
            actionsDiv.appendChild(btnCancelar);
          }
        } else if (currentUser.role === 'chef') {
          if (order.status === 'pedido_realizado') {
            const btnIniciar = document.createElement('button');
            btnIniciar.textContent = 'Iniciar';
            btnIniciar.addEventListener('click', () => updateOrderStatus(order.id, 'en_proceso'));
            actionsDiv.appendChild(btnIniciar);
          }
          if (order.status === 'en_proceso') {
            const btnFinalizar = document.createElement('button');
            btnFinalizar.textContent = 'Finalizar';
            btnFinalizar.addEventListener('click', () => updateOrderStatus(order.id, 'finalizado'));
            actionsDiv.appendChild(btnFinalizar);
          }
        } else if (['admin', 'gerente'].includes(currentUser.role)) {
          if (order.status === 'pedido_realizado') {
            const btnIniciar = document.createElement('button');
            btnIniciar.textContent = 'Iniciar';
            btnIniciar.addEventListener('click', () => updateOrderStatus(order.id, 'en_proceso'));
            actionsDiv.appendChild(btnIniciar);

            const btnCancelar = document.createElement('button');
            btnCancelar.textContent = 'Cancelar';
            btnCancelar.addEventListener('click', () => updateOrderStatus(order.id, 'cancelado'));
            actionsDiv.appendChild(btnCancelar);
          }
          if (order.status === 'en_proceso') {
            const btnEntregar = document.createElement('button');
            btnEntregar.textContent = 'Entregar';
            btnEntregar.addEventListener('click', () => updateOrderStatus(order.id, 'entregado'));
            actionsDiv.appendChild(btnEntregar);
          }
        }

        card.appendChild(actionsDiv);
        board.appendChild(card);
      });

      // Actualizar tiempos (por si tardó en cargar)
      updateOrderTimes();
    } else {
      console.error('Error en la respuesta:', data.message);
    }
  } catch (err) {
    hideSpinner();
    console.error('Error al cargar pedidos:', err);
    const board = document.getElementById('ordersBoard');
    if (board) {
      board.innerHTML = '<div class="error-card">Error al cargar los pedidos. Por favor, intente de nuevo.</div>';
    }
  }
}

/**
 * Recalcula el tiempo transcurrido en cada pedido
 * según el createdAt guardado en el elemento
 */
function updateOrderTimes() {
  const timeEls = document.querySelectorAll('.order-time');
  timeEls.forEach(el => {
    const createdAt = el.getAttribute('data-createdat');
    el.textContent = calcElapsedTime(createdAt);
  });
}

function openOrderModal() {
  const modal = document.getElementById('newOrderModal');
  if (!modal) return;

  // Reiniciar campos
  const tableInput = document.getElementById('modalTable');
  const customerInput = document.getElementById('modalCustomer');
  const commentsInput = document.getElementById('modalComments');
  if (tableInput) tableInput.value = '';
  if (customerInput) customerInput.value = '';
  if (commentsInput) commentsInput.value = '';

  const itemsContainer = document.getElementById('orderItemsContainer');
  if (itemsContainer) itemsContainer.innerHTML = '';

  addNewOrderItem(); // Agregamos un primer item por defecto
  modal.showModal();
}

function closeOrderModal() {
  const modal = document.getElementById('newOrderModal');
  if (modal) modal.close();
}

async function addNewOrderItem() {
  const tpl = document.getElementById('orderItemTemplate');
  if (!tpl) return;

  const row = tpl.content.cloneNode(true);
  const select = row.querySelector('.orderItemSelect');
  const removeBtn = row.querySelector('.removeItemBtn');

  // Cargar menú
  try {
    const resp = await fetch(`${API_BASE_URL}/api/menu`, {
      headers: { 'Authorization': 'Bearer ' + internalToken }
    });
    const data = await resp.json();
    if (data.success) {
      data.data.forEach(m => {
        const option = document.createElement('option');
        option.value = m.id;
        option.textContent = `${m.name} (€${m.price})`;
        select.appendChild(option);
      });
    }
  } catch (err) {
    console.error(err);
  }

  removeBtn.addEventListener('click', () => {
    const rowEl = row.querySelector('.orderItemRow');
    if (rowEl) rowEl.remove();
  });

  const container = document.getElementById('orderItemsContainer');
  if (container) container.appendChild(row);
}

async function createOrder() {
  if (currentUser.role === 'chef') {
    alert('El chef no está autorizado para crear pedidos.');
    return;
  }

  const tableNumber = parseInt(document.getElementById('modalTable').value) || 0;
  const customer = document.getElementById('modalCustomer').value.trim();
  const comments = document.getElementById('modalComments').value.trim();

  // Items
  const container = document.getElementById('orderItemsContainer');
  const rows = container.querySelectorAll('.orderItemRow');
  const items = [];
  rows.forEach(r => {
    const sel = r.querySelector('.orderItemSelect');
    const qty = r.querySelector('.orderItemQty');
    items.push({
      menuItemId: parseInt(sel.value),
      quantity: parseInt(qty.value) || 1
    });
  });

  try {
    showSpinner();
    const resp = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ tableNumber, customer, comments, items })
    });

    if (!resp.ok) {
      throw new Error(`Error HTTP: ${resp.status}`);
    }

    const data = await resp.json();
    hideSpinner();

    if (data.success) {
      closeOrderModal();
      socket.emit('newOrder', {
        orderId: data.orderId,
        tableNumber,
        items
      });
      loadOrders();
    } else {
      alert(data.message || 'Error al crear el pedido');
    }
  } catch (err) {
    hideSpinner();
    console.error('Error al crear pedido:', err);
    alert('Error al crear el pedido. Por favor, intente de nuevo.');
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    showSpinner();
    const resp = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ status })
    });

    if (!resp.ok) {
      throw new Error(`Error HTTP: ${resp.status}`);
    }

    const data = await resp.json();
    hideSpinner();

    if (!data.success) {
      alert(data.message || 'Error al actualizar el estado del pedido');
    }
  } catch (err) {
    hideSpinner();
    console.error('Error al actualizar estado:', err);
    alert('Error al actualizar el estado del pedido. Por favor, intente de nuevo.');
  }
}

// Simple toast
function showToast(message) {
  const toast = document.createElement('div');
  toast.classList.add('toast-notif');
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Parpadeo en el menú "Pedidos"
function highlightMenuItem(section) {
  // Buscamos en nav ul li a[data-partial] = partials/orders.html
  const links = document.querySelectorAll('nav ul li a[data-partial]');
  links.forEach(link => {
    const partial = link.getAttribute('data-partial');
    if (partial && partial.includes('orders.html')) {
      link.classList.add('blink');
      setTimeout(() => {
        link.classList.remove('blink');
      }, 4000);
    }
  });
}

// Mapeo de estado para mostrar en español
function mapStatusText(status) {
  switch (status) {
    case 'pedido_realizado': return 'Pedido Realizado';
    case 'en_proceso': return 'En Proceso';
    case 'finalizado': return 'Finalizado';
    case 'entregado': return 'Entregado';
    case 'cancelado': return 'Cancelado';
    default: return status || 'Desconocido';
  }
}

// Cálculo del tiempo transcurrido
function calcElapsedTime(createdAt) {
  if (!createdAt) return '';
  const start = new Date(createdAt);
  const now = new Date();
  const diffMs = now - start; // milisegundos
  const diffMin = Math.floor(diffMs / 60000);
  const diffSec = Math.floor((diffMs % 60000) / 1000);
  return `🕒 ${String(diffMin).padStart(2, '0')}:${String(diffSec).padStart(2, '0')}`;
}
