// public/js/menu.js
let internalToken = null;
let editingMenuId = null;
let editingCatId = null;
const API_BASE_URL = 'http://localhost:3000';

export async function initMenu(token) {
  internalToken = token;

  await loadMenu();
  await loadMenuCategories();

  // Event listeners para filtros
  const categoryFilter = document.getElementById('categoryFilter');
  const searchMenu = document.getElementById('searchMenu');
  
  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterMenuItems);
  }
  
  if (searchMenu) {
    searchMenu.addEventListener('input', filterMenuItems);
  }

  const menuAddBtn = document.getElementById('menuAddBtn');
  if (menuAddBtn) {
    menuAddBtn.addEventListener('click', () => {
      // Mostrar modal para agregar nuevo plato
      document.getElementById('editMenuModal').showModal();
      document.getElementById('editMenuId').value = '';
      document.getElementById('editMenuName').value = '';
      document.getElementById('editMenuPrice').value = '';
      document.getElementById('editMenuCategory').value = '';
    });
  }

  const catAddBtn = document.getElementById('catAddBtn');
  if (catAddBtn) {
    catAddBtn.addEventListener('click', createCategory);
  }

  const closeEditMenuModal = document.getElementById('closeEditMenuModal');
  if (closeEditMenuModal) {
    closeEditMenuModal.addEventListener('click', () => {
      document.getElementById('editMenuModal').close();
    });
  }

  const saveMenuChangesBtn = document.getElementById('saveMenuChangesBtn');
  if (saveMenuChangesBtn) {
    saveMenuChangesBtn.addEventListener('click', saveMenuChanges);
  }

  const closeEditCategoryModal = document.getElementById('closeEditCategoryModal');
  if (closeEditCategoryModal) {
    closeEditCategoryModal.addEventListener('click', () => {
      document.getElementById('editCategoryModal').close();
    });
  }

  const saveCatChangesBtn = document.getElementById('saveCatChangesBtn');
  if (saveCatChangesBtn) {
    saveCatChangesBtn.addEventListener('click', saveCatChanges);
  }
}

async function loadMenu() {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/menu/`, {
      headers: { 'Authorization': 'Bearer ' + internalToken }
    });
    const data = await resp.json();
    if (data.success) {
      const menuGrid = document.getElementById('menuList');
      if (menuGrid) {
        menuGrid.innerHTML = '';
        data.data.forEach(item => {
          const card = document.createElement('div');
          card.className = 'menu-item-card';
          card.innerHTML = `
            <div class="menu-item-header">
              <div class="menu-item-info">
                <div class="menu-item-name">${item.name}</div>
                ${item.categoryName ? `<span class="menu-item-category">${item.categoryName}</span>` : ''}
              </div>
              <div class="menu-item-price">€${item.price.toFixed(2)}</div>
            </div>
            <div class="menu-item-actions">
              <button class="secondary-button menu-edit-btn" data-id="${item.id}">
                <i class="fas fa-edit"></i> Editar
              </button>
              <button class="secondary-button menu-del-btn" data-id="${item.id}">
                <i class="fas fa-trash"></i> Eliminar
              </button>
            </div>
          `;
          menuGrid.appendChild(card);
        });

        document.querySelectorAll('.menu-edit-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            openEditMenuModal(btn.getAttribute('data-id'));
          });
        });

        document.querySelectorAll('.menu-del-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            if (confirm('¿Está seguro de eliminar este plato?')) {
              deleteMenuItem(btn.getAttribute('data-id'));
            }
          });
        });
      }
    }
  } catch (err) {
    console.error('Error loadMenu:', err);
  }
}

export async function loadMenuCategories() {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/menu/menu-categories`, {
      headers: { 'Authorization': 'Bearer ' + internalToken }
    });
    const data = await resp.json();
    if (data.success) {
      // Actualizar select de categorías
      const selectCat = document.getElementById('editMenuCategory');
      const filterCat = document.getElementById('categoryFilter');
      const list = document.getElementById('menuCategoriesList');
      
      if (selectCat) {
        selectCat.innerHTML = '<option value="">Sin categoría</option>';
      }
      if (filterCat) {
        filterCat.innerHTML = '<option value="all">Todas las categorías</option>';
      }
      if (list) {
        list.innerHTML = '';
      }

      data.data.forEach(cat => {
        // Agregar al select del modal
        if (selectCat) {
          const opt = document.createElement('option');
          opt.value = cat.id;
          opt.textContent = cat.name;
          selectCat.appendChild(opt);
        }

        // Agregar al filtro
        if (filterCat) {
          const opt = document.createElement('option');
          opt.value = cat.id;
          opt.textContent = cat.name;
          filterCat.appendChild(opt);
        }

        // Agregar a la lista de categorías
        if (list) {
          const div = document.createElement('div');
          div.className = 'category-item';
          div.innerHTML = `
            <div class="category-info">
              <div class="category-name">${cat.name}</div>
              ${cat.description ? `<div class="category-desc">${cat.description}</div>` : ''}
            </div>
            <div class="category-actions">
              <button class="secondary-button cat-edit-btn" data-id="${cat.id}">
                <i class="fas fa-edit"></i>
              </button>
              <button class="secondary-button cat-del-btn" data-id="${cat.id}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          `;
          list.appendChild(div);
        }
      });

      // Event listeners para botones de categorías
      document.querySelectorAll('.cat-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditCategoryModal(btn.getAttribute('data-id')));
      });
      document.querySelectorAll('.cat-del-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (confirm('¿Está seguro de eliminar esta categoría?')) {
            deleteCategory(btn.getAttribute('data-id'));
          }
        });
      });
    }
  } catch (err) {
    console.error('Error loadMenuCategories:', err);
  }
}

function filterMenuItems() {
  const categoryFilter = document.getElementById('categoryFilter');
  const searchInput = document.getElementById('searchMenu');
  const menuItems = document.querySelectorAll('.menu-item-card');
  
  const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

  menuItems.forEach(item => {
    const category = item.querySelector('.menu-item-category');
    const name = item.querySelector('.menu-item-name').textContent.toLowerCase();
    
    const matchesCategory = selectedCategory === 'all' || 
      (category && category.textContent === categoryFilter.options[categoryFilter.selectedIndex].text);
    const matchesSearch = name.includes(searchTerm);

    item.style.display = matchesCategory && matchesSearch ? 'block' : 'none';
  });
}

async function createMenuItem() {
  const name = document.getElementById('menuName').value.trim();
  const price = parseFloat(document.getElementById('menuPrice').value) || 0;
  const category_id = document.getElementById('menuCategory').value || null;
  if (!name) return;

  try {
    const resp = await fetch(`${API_BASE_URL}/api/menu/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ name, price, category_id })
    });
    const data = await resp.json();
    if (data.success) {
      document.getElementById('menuName').value = '';
      document.getElementById('menuPrice').value = '';
      await loadMenu();
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error(err);
  }
}

function openEditMenuModal(id) {
  editingMenuId = id;
  fetch(`${API_BASE_URL}/api/menu/`, { headers: { 'Authorization': 'Bearer ' + internalToken } })
    .then(r => r.json())
    .then(d => {
      if (d.success) {
        const item = d.data.find(x => x.id == id);
        if (!item) return alert('Plato no encontrado en la lista local');
        document.getElementById('editMenuId').value = item.id;
        document.getElementById('editMenuName').value = item.name;
        document.getElementById('editMenuPrice').value = item.price;
        loadMenuCategoriesForEdit(item.category_id);
        const modal = document.getElementById('editMenuModal');
        if (modal) modal.style.display = 'block';
      }
    });
}

async function loadMenuCategoriesForEdit(selectedCatId) {
  const resp = await fetch(`${API_BASE_URL}/api/menu/menu-categories/`, { headers: { 'Authorization': 'Bearer ' + internalToken } });
  const data = await resp.json();
  if (!data.success) return;
  const sel = document.getElementById('editMenuCategory');
  if (sel) {
    sel.innerHTML = '<option value="">Sin categoría</option>';
    data.data.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      if (cat.id == selectedCatId) opt.selected = true;
      sel.appendChild(opt);
    });
  }
}

async function saveMenuChanges() {
  const id = document.getElementById('editMenuId').value;
  const name = document.getElementById('editMenuName').value.trim();
  const price = parseFloat(document.getElementById('editMenuPrice').value) || 0;
  const category_id = document.getElementById('editMenuCategory').value || null;

  if (!id || !name) return alert('Faltan datos');
  try {
    const resp = await fetch(`${API_BASE_URL}/api/menu/` + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ name, price, category_id })
    });
    const data = await resp.json();
    if (data.success) {
      const modal = document.getElementById('editMenuModal');
      if (modal) modal.style.display = 'none';
      await loadMenu();
    } else {
      alert('Error editando plato: ' + data.message);
    }
  } catch (e) {
    console.error(e);
  }
}

async function deleteMenuItem(id) {
  if (!confirm('¿Seguro que deseas eliminar este plato?')) return;
  try {
    const resp = await fetch(`${API_BASE_URL}/api/menu/` + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + internalToken }
    });
    const data = await resp.json();
    if (data.success) {
      await loadMenu();
    } else {
      alert('Error al eliminar: ' + data.message);
    }
  } catch (e) {
    console.error(e);
  }
}

async function createCategory() {
  const name = document.getElementById('catName').value.trim();
  const description = document.getElementById('catDesc').value.trim();
  if (!name) return;

  try {
    const resp = await fetch(`${API_BASE_URL}/api/menu/menu-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ name, description })
    });
    const data = await resp.json();
    if (data.success) {
      document.getElementById('catName').value = '';
      document.getElementById('catDesc').value = '';
      await loadMenuCategories();
    } else {
      alert('Error al crear categoría');
    }
  } catch (err) {
    console.error(err);
  }
}

function openEditCategoryModal(id) {
  editingCatId = id;
  fetch(`${API_BASE_URL}/api/menu/menu-categories`, { headers: { 'Authorization': 'Bearer ' + internalToken } })
    .then(r => r.json())
    .then(d => {
      if (!d.success) return;
      const cat = d.data.find(x => x.id == id);
      if (!cat) return alert('Categoría no encontrada');
      document.getElementById('editCatId').value = cat.id;
      document.getElementById('editCatName').value = cat.name;
      document.getElementById('editCatDesc').value = cat.description || '';
      const modal = document.getElementById('editCategoryModal');
      if (modal) modal.style.display = 'block';
    });
}

async function saveCatChanges() {
  const id = document.getElementById('editCatId').value;
  const name = document.getElementById('editCatName').value.trim();
  const description = document.getElementById('editCatDesc').value.trim();

  if (!id || !name) return alert('Faltan datos');
  try {
    const resp = await fetch(`${API_BASE_URL}/api/menu/menu-categories/` + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + internalToken
      },
      body: JSON.stringify({ name, description })
    });
    const data = await resp.json();
    if (data.success) {
      const modal = document.getElementById('editCategoryModal');
      if (modal) modal.style.display = 'none';
      await loadMenuCategories();
    } else {
      alert('Error al editar categoría: ' + data.message);
    }
  } catch (e) {
    console.error(e);
  }
}

async function deleteCategory(id) {
  if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return;
  try {
    const resp = await fetch(`${API_BASE_URL}/api/menu/menu-categories/` + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + internalToken }
    });
    const data = await resp.json();
    if (data.success) {
      await loadMenuCategories();
    } else {
      alert('Error al eliminar categoría: ' + data.message);
    }
  } catch (e) {
    console.error(e);
  }
}
