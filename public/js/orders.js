// public/js/orders.js
import { socket } from './socket.js';
import { showSpinner, hideSpinner } from './feedback.js';

let internalToken = null;
let currentUser = null;

export function initOrders(token, loggedUser) {
  internalToken = token;
  currentUser = loggedUser;

  // 1. Declara la variable fuera del condicional
  const openModalBtn = document.getElementById('openOrderModalBtn'); // ✅
  // 2. Ahora sí puedes usarla en condicionales
  if (openModalBtn) {
    if (currentUser.role === 'chef') {
      openModalBtn.style.display = 'none';
    } else {
      openModalBtn.style.display = 'inline-block';
      openModalBtn.addEventListener('click', openOrderModal);
    }
  }

  const closeModalBtn = document.getElementById('closeOrderModal');
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeOrderModal);

  const addItemBtn = document.getElementById('addItemBtn');
  if (addItemBtn) addItemBtn.addEventListener('click', addNewOrderItem);

  const createOrderBtn = document.getElementById('createOrderConfirmBtn');
  if (createOrderBtn) createOrderBtn.addEventListener('click', createOrder);

  loadOrders();

  // Escuchar evento 'newOrder' vía socket para recargar los pedidos
  socket.on('newOrder', () => {
    loadOrders();
  });
}

async function loadOrders() {
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
      board.innerHTML = ''; // Limpiar el contenedor

      data.data.forEach(order => {
        // Crear tarjeta del pedido
        const card = document.createElement('article');
        card.classList.add('order-card');

        if (order.status) {
          card.classList.add(`status-${order.status}`);
        }

        // Calcular total
        const totalAmount = (order.items || []).reduce(
          (sum, it) => sum + (it.quantity * (it.price || 0)),
          0
        );

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
            <p class="order-time">${calcElapsedTime(order.createdAt)}</p>
          </div>
        `;

        // Botones para actualizar el estado (solo para chef, admin o gerente)
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('order-card-actions');

        if (['chef', 'admin', 'gerente'].includes(currentUser.role)) {
          if (order.status === 'pedido_realizado') {
            const btnIniciar = document.createElement('button');
            btnIniciar.textContent = 'Iniciar';
            btnIniciar.addEventListener('click', () => updateOrderStatus(order.id, 'en_proceso'));
            actionsDiv.appendChild(btnIniciar);
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
    }
  } catch (err) {
    hideSpinner();
    console.error(err);
  }
}

function openOrderModal() {
  // Reiniciar campos del modal
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
  if (currentUser.role === 'chef') {
    alert("El chef no está autorizado para crear pedidos.");
    return;
  }

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

function mapStatusText(status) {
  switch (status) {
    case 'pedido_realizado': return 'Pedido Realizado';
    case 'en_proceso': return 'En Proceso';
    case 'entregado': return 'Entregado';
    case 'pendiente': return 'Pendiente';
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
  return `🕒 ${String(diffMin).padStart(2, '0')}:${String(diffSec).padStart(2, '0')}`;
}

export { updateOrderStatus };
