// public/js/orders.js
import { socket } from './socket.js';

let internalToken = null;
let currentUser   = null;

export function initOrders(token, loggedUser) {
  internalToken = token;
  currentUser   = loggedUser;

  loadOrders();

  const openModalBtn = document.getElementById('openOrderModalBtn');
  const closeModalBtn = document.getElementById('closeOrderModal');
  const addItemBtn    = document.getElementById('addItemBtn');
  const createOrderBtn= document.getElementById('createOrderConfirmBtn');

  if (openModalBtn)  openModalBtn.addEventListener('click', openOrderModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeOrderModal);
  if (addItemBtn)    addItemBtn.addEventListener('click', addNewOrderItem);
  if (createOrderBtn)createOrderBtn.addEventListener('click', createOrder);
}

export async function loadOrders() {
  try {
    const resp = await fetch('/api/orders', {
      headers: { 'Authorization': 'Bearer ' + internalToken }
    });
    const data = await resp.json();
    if (data.success) {
      const ordersList = document.getElementById('ordersList');
      if (!ordersList) return;

      ordersList.innerHTML = '';
      data.data.forEach(order => {
        const li = document.createElement('li');
        li.innerHTML = `
          <b>Pedido #${order.id}</b> |
          Mesa: ${order.tableNumber || '-'} |
          Cliente: ${order.customer || '-'} |
          Estado: ${order.status} |
          ${new Date(order.createdAt).toLocaleString()}<br/>
          <u>Items:</u> ${order.items.map(i => `${i.menuName} x${i.quantity}`).join(', ')}
        `;
        // Botones para cambiar estado
        if (currentUser && (currentUser.role === 'chef' || currentUser.role === 'admin' || currentUser.role === 'gerente')) {
          if (order.status === 'pending') {
            const btn = document.createElement('button');
            btn.textContent = 'En Proceso';
            btn.addEventListener('click', () => updateOrderStatus(order.id, 'in_process'));
            li.appendChild(btn);
          }
          if (order.status === 'in_process') {
            const btn = document.createElement('button');
            btn.textContent = 'Listo';
            btn.addEventListener('click', () => updateOrderStatus(order.id, 'done'));
            li.appendChild(btn);
          }
        }
        if (currentUser && (currentUser.role === 'mesero' || currentUser.role === 'admin' || currentUser.role === 'gerente')
            && order.status === 'done') {
          const deliverBtn = document.createElement('button');
          deliverBtn.textContent = 'Entregado';
          deliverBtn.addEventListener('click', () => updateOrderStatus(order.id, 'delivered'));
          li.appendChild(deliverBtn);
        }
        ordersList.appendChild(li);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

export function openOrderModal() {
  document.getElementById('modalTable').value = '';
  document.getElementById('modalCustomer').value = '';
  document.getElementById('modalComments').value = '';
  document.getElementById('orderItemsContainer').innerHTML = '';
  addNewOrderItem(); // para tener al menos un campo
  document.getElementById('orderModal').style.display = 'block';
}

export function closeOrderModal() {
  document.getElementById('orderModal').style.display = 'none';
}

/**
 * Añade un nuevo row de "item" en el modal de crear pedido
 */
export async function addNewOrderItem() {
  const tpl = document.getElementById('orderItemTemplate');
  if (!tpl) return;

  const row = tpl.content.cloneNode(true);
  const select = row.querySelector('.orderItemSelect');
  const removeBtn = row.querySelector('.removeItemBtn');

  // Cargamos el menú para rellenar el select
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

/**
 * Crear un pedido (POST /api/orders)
 */
export async function createOrder() {
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
    const resp = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ tableNumber, customer, comments, items })
    });
    const data = await resp.json();
    if (data.success) {
      closeOrderModal();
      await loadOrders();
      // Emitimos evento socket
      socket.emit('newOrder', { orderId: data.orderId, tableNumber, items });
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const resp = await fetch('/api/orders/' + orderId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ status })
    });
    const data = await resp.json();
    if (data.success) {
      await loadOrders();
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
  }
}
