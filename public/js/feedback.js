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
   * Muestra un mensaje de error en un elemento contenedor (ej. <p>).
   * @param {HTMLElement} container - Elemento donde se mostrará el mensaje (e.g. <p>)
   * @param {string} message - Texto del mensaje
   */
  export function showErrorMessage(container, message) {
    if (!container) return;
    container.textContent = message;
    // Podrías añadir clases de estilo si deseas
    // container.classList.add('error-message');
  }
  
  /**
   * Muestra un mensaje de éxito en un contenedor.
   */
  export function showSuccessMessage(container, message) {
    if (!container) return;
    container.textContent = message;
    // container.classList.add('success-message');
  }
  