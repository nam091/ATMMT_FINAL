"use client";

// Hàm tải script động
export function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Kiểm tra xem script đã tồn tại chưa
    if (document.getElementById(id)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    
    script.onload = () => resolve();
    script.onerror = (error) => reject(error);
    
    document.head.appendChild(script);
  });
}

// Hàm tải các script cần thiết
export async function preloadScripts(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // Không cần tải webcomponents-ce.js vì nó đã được tải tự động
    // và chúng ta đã xử lý xung đột bằng applyWebComponentsFix
  } catch (error) {
    console.error('Error preloading scripts:', error);
  }
} 