export function initDialog() {
  const dialog = document.querySelector('#contact-dialog');
  const openBtn = document.querySelector('#open-contact-btn');
  const closeBtn = document.querySelector('#close-contact-btn');
  const form = document.querySelector('.contact-form');

  if (dialog && openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      dialog.showModal();
    });
  }

  if (dialog && closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      dialog.close();
    });
  }

  if (form) {
    form.addEventListener('submit', () => {
      const nameInput = document.querySelector('#contact-name');
      const emailInput = document.querySelector('#contact-email');
      const messageInput = document.querySelector('#contact-message');

      const name = nameInput ? nameInput.value : '';
      const email = emailInput ? emailInput.value : '';
      const message = messageInput ? messageInput.value : '';

      const subject = encodeURIComponent(`Consulting Briefing Request - ${name}`);
      const body = encodeURIComponent(`Hello Dmitry,\n\nI would like to request a consulting briefing.\n\nName/Organization: ${name}\nEmail: ${email}\n\nRequirements:\n${message}\n\nBest regards,\n${name}`);

      if (typeof window !== 'undefined' && window.location) {
        window.location.href = `mailto:dmansh@gmail.com?subject=${subject}&body=${body}`;
      }
    });
  }
}

// Auto-wire in browser context
if (typeof window !== 'undefined' && typeof global === 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initDialog();
  });
}
