// public/js/orders.js
import { socket } from './socket.js';
import { showSpinner, hideSpinner } from './feedback.js';

let internalToken = null;
let currentUser = null;

export function initOrders(token, loggedUser) {
  internalToken = token;
  currentUser = loggedUser;

  // Obtener el botón "Nuevo Pedido"
  const openModalBtn = document.getElementById('openOrderModalBtn');
  if (openModalBtn) {
    // Mesero puede crear pedido (y puede cancelar posteriormente)
    if (currentUser.role === 'mesero') {
      openModalBtn.style.display = 'inline-block';
      openModalBtn.addEventListener('click', openOrderModal);
    } else if (currentUser.role === 'chef') {
      // El chef no crea pedidos, solo procesa
      openModalBtn.style.display = 'none';
    } else {
      // Admin y Gerente pueden crear pedidos si lo requieren
      openModalBtn.style.display = 'inline-block';
      openModalBtn.addEventListener('click', openOrderModal);
    }
  }

  const closeModalBtn = document.getElementById('closeOrderModal');
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

  loadOrders();

  // Notificación en tiempo real para chefs:
  socket.on('newOrder', (data) => {
    // Si el usuario es chef, mostramos una notificación visual temporal
    if (currentUser.role === 'chef') {
      notifyChef();
    }
    loadOrders();
  });
}

function notifyChef() {
  // Creamos o actualizamos un banner de notificación
  let notif = document.getElementById('chefNotification');
  if (!notif) {
    notif = document.createElement('div');
    notif.id = 'chefNotification';
    notif.style.position = 'fixed';
    notif.style.top = '10px';
    notif.style.right = '10px';
    notif.style.backgroundColor = '#ffd629';
    notif.style.color = '#000';
    notif.style.padding = '10px';
    notif.style.borderRadius = '4px';
    notif.style.zIndex = '1000';
    notif.textContent = 'Nuevo pedido recibido';
    document.body.appendChild(notif);
  }
  // Ocultamos la notificación después de 3 segundos
  setTimeout(() => {
    if (notif) notif.remove();
  }, 3000);
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
      board.innerHTML = ''; // Limpiar contenedor

      data.data.forEach(order => {
        // Crear tarjeta del pedido
        const card = document.createElement('article');
        card.classList.add('order-card');
        // Añadimos una clase según el estado para feedback visual (personalizable en CSS)
        card.classList.add(`status-${order.status}`);

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

        // Contenedor de acciones según el rol y estado actual
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('order-card-actions');

        if (currentUser.role === 'mesero') {
          // El mesero puede cancelar el pedido si está en "pedido_realizado"
          if (order.status === 'pedido_realizado') {
            const btnCancelar = document.createElement('button');
            btnCancelar.textContent = 'Cancelar';
            btnCancelar.addEventListener('click', () => updateOrderStatus(order.id, 'cancelado'));
            actionsDiv.appendChild(btnCancelar);
          }
        } else if (currentUser.role === 'chef') {
          // El chef puede iniciar el pedido si está "pedido_realizado" y finalizarlo si está "en_proceso"
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
          // Admin y Gerente tienen todas las opciones: iniciar y, cuando esté en proceso, entregarlo.
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
          // Además, pueden cancelar si es necesario
          if (order.status === 'pedido_realizado') {
            const btnCancelar = document.createElement('button');
            btnCancelar.textContent = 'Cancelar';
            btnCancelar.addEventListener('click', () => updateOrderStatus(order.id, 'cancelado'));
            actionsDiv.appendChild(btnCancelar);
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
  const tableInput = document.getElementById('modalTable');
  const customerInput = document.getElementById('modalCustomer');
  const commentsInput = document.getElementById('modalComments');
  if (tableInput) tableInput.value = '';
  if (customerInput) customerInput.value = '';
  if (commentsInput) commentsInput.value = '';
  const itemsContainer = document.getElementById('orderItemsContainer');
  if (itemsContainer) itemsContainer.innerHTML = '';
  addNewOrderItem();
  const modal = document.getElementById('orderModal');
  if (modal) modal.showModal();
}

function closeOrderModal() {
  const modal = document.getElementById('orderModal');
  if (modal) modal.close();
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
    // Se asume que el backend asigna el estado inicial "pedido_realizado"
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
      loadOrders();
      // Emitir evento de nuevo pedido para notificar a otros (por ejemplo, al chef)
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
      loadOrders();
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
    case 'finalizado': return 'Finalizado';
    case 'entregado': return 'Entregado';
    case 'cancelado': return 'Cancelado';
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
