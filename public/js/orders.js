// public/js/orders.js
import { socket } from './socket.js';
import { showSpinner, hideSpinner } from './feedback.js';

let internalToken = null;
let currentUser = null;

export function initOrders(token, loggedUser) {
  internalToken = token;
  currentUser = loggedUser;

  loadOrders();

  const openModalBtn = document.getElementById('openOrderModalBtn');
  const closeModalBtn = document.getElementById('closeOrderModal');
  const addItemBtn = document.getElementById('addItemBtn');
  const createOrderBtn = document.getElementById('createOrderConfirmBtn');

  if (openModalBtn) openModalBtn.addEventListener('click', openOrderModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeOrderModal);
  if (addItemBtn) addItemBtn.addEventListener('click', addNewOrderItem);
  if (createOrderBtn) createOrderBtn.addEventListener('click', createOrder);

  // Escuchar evento newOrder via socket
  socket.on('newOrder', (data) => {
    loadOrders();
  });
}

export async function loadOrders() {
  try {
    showSpinner();
    const resp = await fetch('/api/orders', {
      headers: { 'Authorization': 'Bearer ' + internalToken }
    });
    const data = await resp.json();
    hideSpinner();

    if (data.success) {
      const board = document.getElementById('ordersBoard');
      if (!board) return;
      board.innerHTML = ''; // limpiamos el contenedor

      data.data.forEach(order => {
        // Creamos la tarjeta
        const card = document.createElement('article');
        card.classList.add('order-card');

        // Añadimos la clase de estado:
        // "pending", "in_process", "done", "delivered", etc.
        if (order.status) {
          card.classList.add(`status-${order.status}`);
        }

        // Ejemplo: calculamos un total sumando items (si no tienes un total en BD)
        const totalAmount = (order.items || []).reduce((sum, it) => sum + (it.quantity * (it.price || 0)), 0);

        // Estructura interior
        card.innerHTML = `
          <div class="order-card-header">
            <p class="order-status">${mapStatusText(order.status)}</p>
            <p class="order-id">#${order.id} ${order.deliveryType || ''}</p>
          </div>
          <div class="order-card-body">
            <p class="order-customer">${order.customer || 'Sin cliente'}</p>
            <p class="order-phone">${order.phone || ''}</p>
          </div>
          <div class="order-card-footer">
            <p class="order-total">€${totalAmount.toFixed(2)}</p>
            <p class="order-time">${calcElapsedTime(order.createdAt)}</p>
          </div>
        `;

        // Opcional: botones de acción para cambiar estado
        // (Agregar un div con .order-card-actions, etc.)
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('order-card-actions');
        // Ejemplo: chef puede marcar 'done' si está 'in_process'
        if (['chef', 'admin', 'gerente'].includes(currentUser.role) && order.status === 'in_process') {
          const doneBtn = document.createElement('button');
          doneBtn.textContent = 'Listo';
          doneBtn.addEventListener('click', () => updateOrderStatus(order.id, 'done'));
          actionsDiv.appendChild(doneBtn);
        }
        // Mesero puede marcar 'delivered' si está 'done'
        if (['mesero', 'admin', 'gerente'].includes(currentUser.role) && order.status === 'done') {
          const delBtn = document.createElement('button');
          delBtn.textContent = 'Entregado';
          delBtn.addEventListener('click', () => updateOrderStatus(order.id, 'delivered'));
          actionsDiv.appendChild(delBtn);
        }
        card.appendChild(actionsDiv);

        board.appendChild(card);
      });
    }
  } catch (err) {
    hideSpinner();
    console.error(err);
  }
}

function openOrderModal() {
  document.getElementById('modalTable').value = '';
  document.getElementById('modalCustomer').value = '';
  document.getElementById('modalComments').value = '';
  document.getElementById('orderItemsContainer').innerHTML = '';
  addNewOrderItem();
  document.getElementById('orderModal').showModal();
}

function closeOrderModal() {
  document.getElementById('orderModal').close();
}

async function addNewOrderItem() {
  const tpl = document.getElementById('orderItemTemplate');
  if (!tpl) return;
  const row = tpl.content.cloneNode(true);
  const select = row.querySelector('.orderItemSelect');
  const removeBtn = row.querySelector('.removeItemBtn');

  try {
    const resp = await fetch('/api/menu', {
      headers: { 'Authorization': 'Bearer ' + internalToken }
    });
    const data = await resp.json();
    if (data.success) {
      data.data.forEach(m => {
        const option = document.createElement('option');
        option.value = m.id;
        option.textContent = `${m.name} ($${m.price})`;
        select.appendChild(option);
      });
    }
  } catch (err) {
    console.error(err);
  }

  removeBtn.addEventListener('click', () => {
    row.querySelector('.orderItemRow').remove();
  });

  document.getElementById('orderItemsContainer').appendChild(row);
}

async function createOrder() {
  const tableNumber = parseInt(document.getElementById('modalTable').value) || 0;
  const customer = document.getElementById('modalCustomer').value.trim();
  const comments = document.getElementById('modalComments').value.trim();

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
    const resp = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ tableNumber, customer, comments, items })
    });
    const data = await resp.json();
    hideSpinner();

    if (data.success) {
      closeOrderModal();
      await loadOrders();
      socket.emit('newOrder', { orderId: data.orderId, tableNumber, items });
    } else {
      alert(data.message);
    }
  } catch (err) {
    hideSpinner();
    console.error(err);
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    showSpinner();
    const resp = await fetch('/api/orders/' + orderId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ status })
    });
    const data = await resp.json();
    hideSpinner();

    if (data.success) {
      await loadOrders();
    } else {
      alert(data.message);
    }
  } catch (err) {
    hideSpinner();
    console.error(err);
  }
}

// Helpers para formatear
function mapStatusText(status) {
  switch (status) {
    case 'pending': return 'Pendiente';
    case 'in_process': return 'En Proceso';
    case 'done': return 'Listo';
    case 'delivered': return 'Entregado';
    default: return status || 'Desconocido';
  }
}

function calcElapsedTime(createdAt) {
  if (!createdAt) return '';
  const start = new Date(createdAt);
  const now = new Date();
  const diffMs = now - start;
  const diffMin = Math.floor(diffMs / 60000);
  const diffSec = Math.floor((diffMs % 60000) / 1000);

  // Ej: "00:13"
  return `🕒 ${String(diffMin).padStart(2, '0')}:${String(diffSec).padStart(2, '0')}`;
}
