/**
 * Segment Switcher — Data / AI filter for card grids.
 *
 * For each .segment-switcher found on the page:
 *  - Animates a sliding pill indicator between the two options
 *  - Sets aria-pressed on buttons for accessibility
 *  - Updates data-active-filter on the nearest .filterable-section
 *    so that CSS handles showing/hiding the relevant direction-blocks
 */
export function initSwitchers() {
  document.querySelectorAll('.segment-switcher').forEach(switcher => {
    const section = switcher.closest('.filterable-section');
    if (!section) return;

    const buttons = Array.from(switcher.querySelectorAll('.seg-btn'));
    const pill = switcher.querySelector('.seg-pill');

    /**
     * Move the pill indicator to sit under the given button.
     * Uses offsetLeft (relative to offsetParent = .segment-switcher since it
     * has position:relative) minus the 3 px padding-left of the switcher.
     */
    function movePill(activeBtn) {
      if (!pill || !activeBtn) return;
      pill.style.width = activeBtn.offsetWidth + 'px';
      pill.style.transform = `translateX(${activeBtn.offsetLeft - 3}px)`;
    }

    // Position pill on first paint (defer so layout is measured correctly)
    const initialActive = switcher.querySelector('.seg-btn.active') || buttons[0];
    requestAnimationFrame(() => movePill(initialActive));

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update button states
        buttons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        // Animate pill
        movePill(btn);

        // Drive CSS show/hide via data attribute on the section wrapper
        section.setAttribute('data-active-filter', btn.dataset.seg);
      });
    });
  });
}

// Auto-wire in browser context (not Node test environment)
if (typeof window !== 'undefined' && typeof global === 'undefined') {
  document.addEventListener('DOMContentLoaded', initSwitchers);
}
