export function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const theme = savedTheme || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
}

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Auto-wire in browser context
if (typeof window !== 'undefined' && typeof global === 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    const toggleBtn = document.querySelector('#theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleTheme);
    }
  });
}
