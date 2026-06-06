export function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = btn.getAttribute('data-tab');

      // Update button active state
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update content active state
      tabContents.forEach(content => {
        const contentId = content.getAttribute('id');
        if (contentId === `${targetTab}-code`) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });
}

// Auto-wire in browser context
if (typeof window !== 'undefined' && typeof global === 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initTabs();
  });
}
