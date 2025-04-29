// public/js/orders.js
import { socket } from './socket.js';
import { showSpinner, hideSpinner, showErrorMessage } from './feedback.js';

const API_BASE_URL = 'http://localhost:3000';
let internalToken = null;
let currentUser = null;
let menuItems = [];

export function initOrders(token, user) {
    internalToken = token;
    currentUser = user;
    init();
}

function init() {
    setupEventListeners();
    setupViewToggle();
    setupRealTimeUpdates();
    loadOrders();
    initializeSearchAndFilters();
}

function initializeSearchAndFilters() {
    const searchInput = document.getElementById('searchOrder');
    const statusFilter = document.getElementById('statusFilter');

    if (searchInput && statusFilter) {
        window.filterOrders = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const statusValue = statusFilter.value;
            
            document.querySelectorAll('.order-card').forEach(card => {
                const orderText = card.textContent.toLowerCase();
                const orderStatus = card.querySelector('.order-status').classList[2];
                
                const matchesSearch = orderText.includes(searchTerm);
                const matchesStatus = statusValue === 'all' || orderStatus === statusValue;
                
                card.style.display = matchesSearch && matchesStatus ? 'block' : 'none';
            });
        };
    }
}

function setupEventListeners() {
    document.getElementById('openOrderModalBtn')?.addEventListener('click', () => showOrderModal());
    document.getElementById('searchOrder')?.addEventListener('input', debounce(() => window.filterOrders(), 300));
    document.getElementById('statusFilter')?.addEventListener('change', () => window.filterOrders());
}

function setupViewToggle() {
    const cardViewBtn = document.getElementById('cardViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const ordersGrid = document.querySelector('.orders-container');
    const ordersTable = document.getElementById('ordersTableView');

    if (cardViewBtn && listViewBtn && ordersGrid && ordersTable) {
        cardViewBtn.addEventListener('click', () => {
            cardViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            ordersGrid.style.display = 'grid';
            ordersTable.style.display = 'none';
        });

        listViewBtn.addEventListener('click', () => {
            listViewBtn.classList.add('active');
            cardViewBtn.classList.remove('active');
            ordersGrid.style.display = 'none';
            ordersTable.style.display = 'block';
        });
    }
}

function setupRealTimeUpdates() {
    socket.on('orderUpdate', (order) => {
        updateOrderInUI(order);
        updateStatistics();
    });

    socket.on('newOrder', (order) => {
        addOrderToUI(order);
        updateStatistics();
        showNotification('Nuevo pedido recibido', `Mesa ${order.table_number}`);
    });
}

async function loadOrders() {
    try {
        showSpinner();
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            headers: {
                'Authorization': `Bearer ${internalToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        hideSpinner();
        
        if (data.success && Array.isArray(data.data)) {
            clearOrderLists();
            data.data.forEach(order => addOrderToUI(order));
            updateStatistics();
            
            // Animación de entrada
            const cards = document.querySelectorAll('.order-card');
            cards.forEach((card, index) => {
                card.style.animation = `fadeInUp 0.3s ease forwards ${index * 0.1}s`;
            });
        }
    } catch (error) {
        hideSpinner();
        console.error('Error al cargar pedidos:', error);
        const errorContainer = document.createElement('div');
        errorContainer.className = 'error-card';
        document.querySelector('.orders-container')?.appendChild(errorContainer);
        showErrorMessage(errorContainer, 'Error al cargar los pedidos');
    }
}

function clearOrderLists() {
    ['pending', 'processing', 'completed', 'delivered'].forEach(status => {
        const container = document.getElementById(`${status}Orders`);
        if (container) container.innerHTML = '';
    });
}

async function showOrderModal() {
    const modal = document.getElementById('newOrderModal');
    const form = document.getElementById('newOrderForm');
    const addItemBtn = document.getElementById('addItemBtn');
    const cancelBtn = document.getElementById('cancelOrderBtn');
    const container = document.getElementById('orderItemsContainer');

    if (!modal || !form || !addItemBtn || !cancelBtn || !container) return;

    // Cargar items del menú si no están cargados
    if (menuItems.length === 0) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/menu`, {
                headers: {
                    'Authorization': `Bearer ${internalToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Error al cargar menú');
            const data = await response.json();
            if (data.success) {
                menuItems = data.data;
            }
        } catch (error) {
            console.error('Error al cargar menú:', error);
            return;
        }
    }

    // Limpiar el formulario
    form.reset();
    container.innerHTML = '';
    
    // Agregar primer item por defecto
    addOrderItem();

    // Event listeners
    addItemBtn.addEventListener('click', addOrderItem);
    
    cancelBtn.addEventListener('click', () => {
        modal.close();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createNewOrder();
    });

    // Mostrar modal
    modal.showModal();
}

function addOrderItem() {
    const container = document.getElementById('orderItemsContainer');
    const template = document.getElementById('orderItemTemplate');
    if (!container || !template) return;

    const clone = template.content.cloneNode(true);
    const select = clone.querySelector('.menu-item-select');
    
    // Llenar select con items del menú
    menuItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        // Convertir price a número antes de usar toFixed
        const price = parseFloat(item.price) || 0;
        option.textContent = `${item.name} - ${price.toFixed(2)}€`;
        select.appendChild(option);
    });

    // Configurar botón de eliminar
    const removeBtn = clone.querySelector('.remove-item-btn');
    removeBtn.addEventListener('click', (e) => {
        const row = e.target.closest('.order-item-row');
        if (document.querySelectorAll('.order-item-row').length > 1) {
            row.remove();
        }
    });

    container.appendChild(clone);
}

async function createNewOrder() {
    const form = document.getElementById('newOrderForm');
    const tableNumber = document.getElementById('tableNumber').value;
    const customerName = document.getElementById('customerName').value;
    const comments = document.getElementById('orderComments').value;
    
    // Recolectar items
    const items = Array.from(document.querySelectorAll('.order-item-row')).map(row => ({
        menuItemId: parseInt(row.querySelector('.menu-item-select').value),
        quantity: parseInt(row.querySelector('.quantity-input').value)
    }));

    try {
        showSpinner();
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${internalToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tableNumber: parseInt(tableNumber),
                customer: customerName,
                comments,
                items
            })
        });

        if (!response.ok) throw new Error('Error al crear pedido');
        
        const data = await response.json();
        hideSpinner();
        
        if (data.success) {
            const modal = document.getElementById('newOrderModal');
            modal.close();
            
            // Usar los datos devueltos por el servidor para agregar el pedido a la UI
            if (data.data) {
                addOrderToUI(data.data);
                updateStatistics();
            } else {
                // Si por alguna razón no tenemos los datos, recargar todos los pedidos
                loadOrders();
            }
            
            showNotification('Nuevo pedido', `Pedido creado para mesa ${tableNumber}`);
        } else {
            throw new Error(data.message || 'Error al crear el pedido');
        }
    } catch (error) {
        hideSpinner();
        console.error('Error:', error);
        showErrorMessage(
            document.createElement('div'),
            error.message || 'Error al crear el pedido. Por favor, intente nuevamente.'
        );
    }
}

function addOrderToUI(order) {
    const template = document.getElementById('orderCardTemplate');
    if (!template) return;

    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.order-card');

    // Configurar datos básicos
    card.dataset.id = order.id;
    card.querySelector('.order-id').textContent = `#${order.id}`;
    card.querySelector('.order-table span').textContent = `Mesa ${order.table_number}`;
    card.querySelector('.order-customer span').textContent = order.customer_name || 'Sin nombre';
    
    // Configurar estado con iconos y colores
    const statusEl = card.querySelector('.order-status');
    statusEl.textContent = getStatusText(order.status);
    statusEl.className = `order-status modern-status ${order.status}`;
    
    // Mostrar items
    const itemsPreview = card.querySelector('.order-items-preview');
    if (itemsPreview) itemsPreview.innerHTML = ''; // Limpiar items existentes
    
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'order-item';
            // Usar el nombre correcto según venga de la creación (menu_name) o de la actualización (name)
            const itemName = item.menu_name || item.name || 'Ítem sin nombre';
            const quantity = parseInt(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            itemEl.innerHTML = `
                <span class="item-quantity">${quantity}x</span>
                <span class="item-name">${itemName}</span>
                <span class="item-price">${(price * quantity).toFixed(2)}€</span>
            `;
            itemsPreview.appendChild(itemEl);
        });
    }

    // Configurar tiempo y total
    card.querySelector('.order-time span').textContent = formatOrderTime(order.created_at);
    
    // Calcular el total si no viene en la respuesta
    const total = order.total || order.items?.reduce((sum, item) => 
        sum + ((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0)), 0) || 0;
    
    card.querySelector('.order-total span').textContent = `${total.toFixed(2)}€`;

    // Agregar botones de acción según el estado
    const actionsContainer = card.querySelector('.order-actions');
    addActionButtons(actionsContainer, order);

    // Agregar al contenedor correspondiente con animación
    const container = document.getElementById(`${getStatusContainer(order.status)}Orders`);
    if (container) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        container.appendChild(card);

        // Trigger animation
        requestAnimationFrame(() => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });

        updateColumnCount(getStatusContainer(order.status));
    }
}

function updateOrderInUI(order) {
    if (!order?.id || !order?.status) return;

    const existingCard = document.querySelector(`.order-card[data-id="${order.id}"]`);
    if (!existingCard) return;

    const newContainer = document.getElementById(`${getStatusContainer(order.status)}Orders`);
    if (!newContainer) return;
    
    // Animación de transición
    existingCard.style.transform = 'scale(0.95)';
    existingCard.style.opacity = '0.5';
    
    setTimeout(() => {
        newContainer.appendChild(existingCard);
        existingCard.style.transform = 'scale(1)';
        existingCard.style.opacity = '1';
        
        // Actualizar estado y botones
        const statusEl = existingCard.querySelector('.order-status');
        if (statusEl) {
            statusEl.textContent = getStatusText(order.status);
            statusEl.className = `order-status modern-status ${order.status}`;
        }
        
        // Actualizar otros campos si están disponibles
        if (order.table_number) {
            existingCard.querySelector('.order-table span').textContent = `Mesa ${order.table_number}`;
        }
        if (order.customer_name) {
            existingCard.querySelector('.order-customer span').textContent = order.customer_name;
        }
        
        const actionsContainer = existingCard.querySelector('.order-actions');
        if (actionsContainer) {
            actionsContainer.innerHTML = '';
            addActionButtons(actionsContainer, order);
        }
        
        updateAllColumnCounts();
    }, 300);
}

function addActionButtons(container, order) {
    const buttons = getActionButtonsConfig(order.status);
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = `action-button ${btn.class}`;
        button.innerHTML = `<i class="${btn.icon}"></i> ${btn.text}`;
        button.addEventListener('click', () => updateOrderStatus(order.id, btn.nextStatus));
        container.appendChild(button);
    });
}

function getActionButtonsConfig(status) {
    // Si no hay rol definido o el pedido está en estado final, no mostrar botones
    if (!currentUser?.role || status === 'entregado' || status === 'cancelado') return [];

    const configs = {
        'pedido_realizado': [
            ...(currentUser.role === 'chef' || currentUser.role === 'admin' || currentUser.role === 'gerente' 
                ? [{ text: 'Procesar', class: 'process-btn', icon: 'fas fa-fire', nextStatus: 'en_proceso' }] 
                : []),
            ...(currentUser.role === 'mesero' || currentUser.role === 'admin' || currentUser.role === 'gerente'
                ? [{ text: 'Cancelar', class: 'cancel-btn', icon: 'fas fa-times', nextStatus: 'cancelado' }]
                : [])
        ],
        'en_proceso': [
            ...(currentUser.role === 'chef'
                ? [{ text: 'Finalizar', class: 'complete-btn', icon: 'fas fa-check', nextStatus: 'finalizado' }]
                : []),
            ...(currentUser.role === 'admin' || currentUser.role === 'gerente'
                ? [{ text: 'Entregar', class: 'deliver-btn', icon: 'fas fa-hand-holding', nextStatus: 'entregado' }]
                : [])
        ],
        'finalizado': [
            ...(currentUser.role === 'admin' || currentUser.role === 'gerente'
                ? [{ text: 'Entregar', class: 'deliver-btn', icon: 'fas fa-hand-holding', nextStatus: 'entregado' }]
                : [])
        ]
    };
    return configs[status] || [];
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${internalToken}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ status: newStatus })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error al actualizar el estado');
        }

        if (data.success) {
            // Actualizar UI con los datos del pedido actualizado
            if (data.data) {
                updateOrderInUI(data.data);
                showNotification('Estado actualizado', `Pedido #${orderId} ${getStatusText(newStatus)}`);
            } else {
                // Si no tenemos datos actualizados, recargar todos los pedidos
                await loadOrders();
            }
        } else {
            throw new Error(data.message || 'Error al actualizar el estado');
        }
    } catch (error) {
        console.error('Error:', error);
        showErrorMessage(
            document.querySelector('.orders-container'),
            error.message || 'Error al actualizar el estado del pedido'
        );
    }
}

function updateStatistics() {
    const orderCount = document.querySelectorAll('.order-card').length;
    document.getElementById('orderCount').textContent = `${orderCount} pedidos activos`;
    updateAverageTime();
    updateAllColumnCounts();
}

function updateAverageTime() {
    const times = Array.from(document.querySelectorAll('.order-time span'))
        .map(el => parseOrderTime(el.textContent));
    
    if (times.length > 0) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        document.getElementById('averageTime').textContent = 
            `Tiempo promedio: ${formatMinutes(avg)}`;
    }
}

function updateAllColumnCounts() {
    ['pending', 'processing', 'completed', 'delivered'].forEach(status => {
        updateColumnCount(status);
    });
}

function updateColumnCount(status) {
    const container = document.getElementById(`${status}Orders`);
    const count = container.querySelectorAll('.order-card').length;
    document.getElementById(`${status}Count`).textContent = count;
}

// Utilidades
function getStatusContainer(status) {
    const containers = {
        'pedido_realizado': 'pending',
        'en_proceso': 'processing',
        'finalizado': 'completed',
        'entregado': 'delivered'
    };
    return containers[status];
}

function getStatusText(status) {
    const texts = {
        'pedido_realizado': 'Pendiente',
        'en_proceso': 'En Proceso',
        'finalizado': 'Finalizado',
        'entregado': 'Entregado'
    };
    return texts[status];
}

function formatOrderTime(timestamp) {
    const orderDate = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - orderDate) / 60000);
    return formatMinutes(diffMinutes);
}

function formatMinutes(minutes) {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

function parseOrderTime(timeStr) {
    const matches = timeStr.match(/(\d+)h\s*(\d+)m|(\d+)m/);
    if (!matches) return 0;
    if (matches[1] && matches[2]) return parseInt(matches[1]) * 60 + parseInt(matches[2]);
    return parseInt(matches[3] || 0);
}

function showNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message });
    }
}

// Utilidad para debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
