// public/js/modules/utils.js

/**
 * Muestra el elemento HTML especificado.
 * @param {HTMLElement} el - Elemento a mostrar.
 */
export function showElement(el) {
    if (el) el.style.display = 'block';
  }
  
  /**
   * Oculta el elemento HTML especificado.
   * @param {HTMLElement} el - Elemento a ocultar.
   */
  export function hideElement(el) {
    if (el) el.style.display = 'none';
  }
  
  /**
   * Crea un nuevo elemento HTML con el texto dado.
   * @param {string} tag - La etiqueta HTML a crear.
   * @param {string} text - El contenido de texto.
   * @returns {HTMLElement} El elemento creado.
   */
  export function createElement(tag, text) {
    const el = document.createElement(tag);
    el.textContent = text;
    return el;
  }
  