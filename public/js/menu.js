// public/js/menu.js
let internalToken = null;
let editingMenuId = null;
let editingCatId = null;

export async function initMenu(token) {
  internalToken = token;

  await loadMenu();
  await loadMenuCategories();

  const menuAddBtn = document.getElementById('menuAddBtn');
  if (menuAddBtn) {
    menuAddBtn.addEventListener('click', createMenuItem);
  }

  const catAddBtn = document.getElementById('catAddBtn');
  if (catAddBtn) {
    catAddBtn.addEventListener('click', createCategory);
  }

  const closeEditMenuModal = document.getElementById('closeEditMenuModal');
  if (closeEditMenuModal) {
    closeEditMenuModal.addEventListener('click', () => {
      const modal = document.getElementById('editMenuModal');
      if (modal) modal.style.display = 'none';
    });
  }
  const saveMenuChangesBtn = document.getElementById('saveMenuChangesBtn');
  if (saveMenuChangesBtn) {
    saveMenuChangesBtn.addEventListener('click', saveMenuChanges);
  }

  const closeEditCategoryModal = document.getElementById('closeEditCategoryModal');
  if (closeEditCategoryModal) {
    closeEditCategoryModal.addEventListener('click', () => {
      const modal = document.getElementById('editCategoryModal');
      if (modal) modal.style.display = 'none';
    });
  }
  const saveCatChangesBtn = document.getElementById('saveCatChangesBtn');
  if (saveCatChangesBtn) {
    saveCatChangesBtn.addEventListener('click', saveCatChanges);
  }
}

async function loadMenu() {
  try {
    const resp = await fetch('/api/menu/', {
      headers: { 'Authorization': 'Bearer ' + internalToken }
    });
    const data = await resp.json();
    if (data.success) {
      const menuList = document.getElementById('menuList');
      if (menuList) {
        menuList.innerHTML = '';
        data.data.forEach(item => {
          const li = document.createElement('li');
          const catName = item.categoryName ? ` [${item.categoryName}]` : '';
          li.innerHTML = `
            <b>${item.name}</b> - $${item.price} ${catName}
            <button class="menu-edit-btn" data-id="${item.id}">Editar</button>
            <button class="menu-del-btn" data-id="${item.id}">Eliminar</button>
          `;
          menuList.appendChild(li);
        });

        document.querySelectorAll('.menu-edit-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            openEditMenuModal(btn.getAttribute('data-id'));
          });
        });
        document.querySelectorAll('.menu-del-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            deleteMenuItem(btn.getAttribute('data-id'));
          });
        });
      }
    }
  } catch (err) {
    console.error('Error loadMenu:', err);
  }
}

async function createMenuItem() {
  const name = document.getElementById('menuName').value.trim();
  const price = parseFloat(document.getElementById('menuPrice').value) || 0;
  const category_id = document.getElementById('menuCategory').value || null;
  if (!name) return;

  try {
    const resp = await fetch('/api/menu/', {
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
  fetch('/api/menu/', { headers: { 'Authorization': 'Bearer ' + internalToken } })
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
  const resp = await fetch('/api/menu/menu-categories/', { headers: { 'Authorization': 'Bearer ' + internalToken } });
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
    const resp = await fetch('/api/menu/' + id, {
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
    const resp = await fetch('/api/menu/' + id, {
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

export async function loadMenuCategories() {
  try {
    const resp = await fetch('/api/menu/menu-categories', {
      headers: { 'Authorization': 'Bearer ' + internalToken }
    });
    const data = await resp.json();
    if (data.success) {
      const selectCat = document.getElementById('menuCategory');
      const list = document.getElementById('menuCategoriesList');
      if (selectCat) {
        selectCat.innerHTML = '<option value="">Sin categoría</option>';
      }
      if (list) {
        list.innerHTML = '';
      }
      data.data.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        if (selectCat) selectCat.appendChild(opt);

        if (list) {
          const li = document.createElement('li');
          li.innerHTML = `
            <b>${cat.name}</b> - ${cat.description || ''}
            <button class="cat-edit-btn" data-id="${cat.id}">Editar</button>
            <button class="cat-del-btn" data-id="${cat.id}">Eliminar</button>
          `;
          list.appendChild(li);
        }
      });

      document.querySelectorAll('.cat-edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditCategoryModal(btn.getAttribute('data-id')));
      });
      document.querySelectorAll('.cat-del-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteCategory(btn.getAttribute('data-id')));
      });
    }
  } catch (err) {
    console.error('Error loadMenuCategories:', err);
  }
}

async function createCategory() {
  const name = document.getElementById('catName').value.trim();
  const description = document.getElementById('catDesc').value.trim();
  if (!name) return;

  try {
    const resp = await fetch('/api/menu/menu-categories', {
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
  fetch('/api/menu/menu-categories', { headers: { 'Authorization': 'Bearer ' + internalToken } })
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
    const resp = await fetch('/api/menu/menu-categories/' + id, {
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
    const resp = await fetch('/api/menu/menu-categories/' + id, {
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
