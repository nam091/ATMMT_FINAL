"use client";

// Hàm kiểm tra xem một custom element đã được định nghĩa chưa
export function safeDefineCustomElement(name: string, constructor: CustomElementConstructor) {
  // Kiểm tra xem custom element đã được định nghĩa chưa
  if (!customElements.get(name)) {
    customElements.define(name, constructor);
    return true;
  }
  return false;
}

// Ghi đè phương thức define của customElements để tránh lỗi khi định nghĩa lại
export function applyWebComponentsFix() {
  if (typeof window !== 'undefined' && window.customElements) {
    const originalDefine = window.customElements.define;
    
    // Ghi đè phương thức define
    window.customElements.define = function(name, constructor, options) {
      if (customElements.get(name)) {
        console.warn(`Custom element with name '${name}' has already been defined. Skipping definition.`);
        return;
      }
      return originalDefine.call(this, name, constructor, options);
    };
  }
} 