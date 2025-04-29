// File: public/js/feedback.js
/**
 * Muestra el spinner global.
 */
export function showSpinner() {
  const spinner = document.getElementById('globalSpinner');
  if (spinner) spinner.style.display = 'flex';
}

/**
 * Oculta el spinner global.
 */
export function hideSpinner() {
  const spinner = document.getElementById('globalSpinner');
  if (spinner) spinner.style.display = 'none';
}

/**
 * Muestra un mensaje de error en un elemento contenedor.
 * @param {HTMLElement} container - Elemento donde se mostrará el mensaje
 * @param {string} message - Texto del mensaje
 */
export function showErrorMessage(container, message) {
  if (!container) return;
  container.classList.add('error-card');
  container.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = '0.5rem';
  
  // Auto-ocultar después de 5 segundos
  setTimeout(() => {
    container.style.opacity = '0';
    setTimeout(() => container.remove(), 300);
  }, 5000);
}

/**
 * Muestra un mensaje de éxito en un contenedor.
 * @param {HTMLElement} container - Elemento donde se mostrará el mensaje
 * @param {string} message - Texto del mensaje
 */
export function showSuccessMessage(container, message) {
  if (!container) return;
  container.classList.add('success-card');
  container.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = '0.5rem';
  
  // Auto-ocultar después de 3 segundos
  setTimeout(() => {
    container.style.opacity = '0';
    setTimeout(() => container.remove(), 300);
  }, 3000);
}

/**
 * Muestra un mensaje de advertencia en un contenedor.
 * @param {HTMLElement} container - Elemento donde se mostrará el mensaje
 * @param {string} message - Texto del mensaje
 */
export function showWarningMessage(container, message) {
  if (!container) return;
  container.classList.add('warning-card');
  container.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.gap = '0.5rem';
  
  // Auto-ocultar después de 4 segundos
  setTimeout(() => {
    container.style.opacity = '0';
    setTimeout(() => container.remove(), 300);
  }, 4000);
}
