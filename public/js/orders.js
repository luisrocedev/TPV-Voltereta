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
        const div = document.createElement('div');
        div.className = `order-card ${order.status}`;

        div.innerHTML = `
          <h3>Pedido #${order.id}</h3>
          <p><strong>Mesa:</strong> ${order.tableNumber || '-'}</p>
          <p><strong>Cliente:</strong> ${order.customer || '-'}</p>
          <p><strong>Estado:</strong> ${order.status}</p>
          <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          <div class="order-items"><strong>Items:</strong><br/> ${order.items.map(i => `${i.menuName} x${i.quantity}`).join('<br/>')}</div>
          <div class="order-actions"></div>
        `;

        const actions = div.querySelector('.order-actions');

        if (currentUser && ['chef', 'admin', 'gerente'].includes(currentUser.role)) {
          if (order.status === 'pending') {
            const btn = document.createElement('button');
            btn.textContent = 'Marcar En Proceso';
            btn.classList.add('to-process');
            btn.onclick = () => updateOrderStatus(order.id, 'in_process');
            actions.appendChild(btn);
          }
          if (order.status === 'in_process') {
            const btn = document.createElement('button');
            btn.textContent = 'Marcar Listo';
            btn.classList.add('to-done');
            btn.onclick = () => updateOrderStatus(order.id, 'done');
            actions.appendChild(btn);
          }
        }
        if (currentUser && ['mesero', 'admin', 'gerente'].includes(currentUser.role) && order.status === 'done') {
          const btn = document.createElement('button');
          btn.textContent = 'Marcar Entregado';
          btn.classList.add('to-delivered');
          btn.onclick = () => updateOrderStatus(order.id, 'delivered');
          actions.appendChild(btn);
        }

        ordersList.appendChild(div);
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
  addNewOrderItem();
  document.getElementById('orderModal').style.display = 'block';
}

export function closeOrderModal() {
  document.getElementById('orderModal').style.display = 'none';
}

export async function addNewOrderItem() {
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
