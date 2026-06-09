/**
 * diagram-controls.js — adds zoom, fullscreen and Archgram buttons to every
 * .diagram-wrap block after Mermaid has rendered its SVG.
 */
(function () {
  // ─── Inject styles ────────────────────────────────────────────────────────
  const css = `
.diagram-wrap { position: relative; overflow: visible !important; }

.diagram-controls {
  position: absolute;
  top: 0.55rem;
  right: 0.55rem;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.18s;
  z-index: 20;
}
.diagram-wrap:hover .diagram-controls,
.diagram-wrap:focus-within .diagram-controls { opacity: 1; }

.diag-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(9, 13, 27, 0.85);
  border: 1px solid #2d5a8e;
  border-radius: 5px;
  color: #7a92b4;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  backdrop-filter: blur(4px);
  padding: 0;
  line-height: 1;
}
.diag-btn:hover { background: #b8860b; border-color: #b8860b; color: #fff; }
.diag-btn:focus-visible { outline: 2px solid #b8860b; outline-offset: 2px; }

/* fullscreen backdrop */
.diagram-wrap:fullscreen,
.diagram-wrap:-webkit-full-screen {
  background: #090d1b;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.diagram-wrap:fullscreen .diagram-controls,
.diagram-wrap:-webkit-full-screen .diagram-controls { opacity: 1; }

/* SVG zoom target */
.diagram-wrap svg { transform-origin: center center; transition: transform 0.2s ease; }

/* toast */
.diag-toast {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%) translateY(0.5rem);
  background: rgba(13,31,53,0.95);
  border: 1px solid #2d5a8e;
  color: #c9d4e0;
  padding: 0.5rem 1.1rem;
  border-radius: 6px;
  font-size: 0.83rem;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  z-index: 9999;
}
.diag-toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
`;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ─── Toast helper ─────────────────────────────────────────────────────────
  let toastEl = null;
  function showToast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'diag-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  // ─── SVG icons ────────────────────────────────────────────────────────────
  const icons = {
    zoomIn: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="6.5" cy="6.5" r="4.5"/><line x1="10.5" y1="10.5" x2="14.5" y2="14.5"/><line x1="6.5" y1="4" x2="6.5" y2="9"/><line x1="4" y1="6.5" x2="9" y2="6.5"/></svg>`,
    zoomOut: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="6.5" cy="6.5" r="4.5"/><line x1="10.5" y1="10.5" x2="14.5" y2="14.5"/><line x1="4" y1="6.5" x2="9" y2="6.5"/></svg>`,
    fullscreen: `<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,5 1,1 5,1"/><polyline points="11,1 15,1 15,5"/><polyline points="15,11 15,15 11,15"/><polyline points="5,15 1,15 1,11"/></svg>`,
    exitFs: `<svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="5,1 1,1 1,5"/><polyline points="11,1 15,1 15,5"/><polyline points="15,11 15,15 11,15"/><polyline points="5,15 1,15 1,11"/><line x1="1" y1="1" x2="5" y2="5"/><line x1="15" y1="1" x2="11" y2="5"/><line x1="15" y1="15" x2="11" y2="11"/><line x1="1" y1="15" x2="5" y2="11"/></svg>`,
    archgram: `<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1L1 13h14L8 1zm0 3l4.5 8h-9L8 4z"/></svg>`
  };

  // ─── Zoom state per wrap ──────────────────────────────────────────────────
  const zoomMap = new WeakMap();

  function addControls(wrap) {
    if (wrap.querySelector('.diagram-controls')) return;

    const pre = wrap.querySelector('pre.mermaid');
    const mermaidSrc = pre ? (pre.dataset.mermaidSrc || pre.textContent.trim()) : '';

    const ctrl = document.createElement('div');
    ctrl.className = 'diagram-controls';
    ctrl.setAttribute('role', 'toolbar');
    ctrl.setAttribute('aria-label', 'Diagram controls');

    function makeBtn(html, title, action) {
      const b = document.createElement('button');
      b.className = 'diag-btn';
      b.title = title;
      b.setAttribute('aria-label', title);
      b.innerHTML = html;
      b.addEventListener('click', action);
      return b;
    }

    // ── Zoom in ──
    ctrl.appendChild(makeBtn(icons.zoomIn, 'Zoom in', () => {
      const svg = wrap.querySelector('svg');
      if (!svg) return;
      const z = Math.min((zoomMap.get(wrap) || 1) + 0.2, 3);
      zoomMap.set(wrap, z);
      svg.style.transform = `scale(${z})`;
    }));

    // ── Zoom out ──
    ctrl.appendChild(makeBtn(icons.zoomOut, 'Zoom out', () => {
      const svg = wrap.querySelector('svg');
      if (!svg) return;
      const z = Math.max((zoomMap.get(wrap) || 1) - 0.2, 0.4);
      zoomMap.set(wrap, z);
      svg.style.transform = `scale(${z})`;
    }));

    // ── Fullscreen ──
    const fsBtn = makeBtn(icons.fullscreen, 'Fullscreen', () => {
      if (!document.fullscreenElement) {
        wrap.requestFullscreen && wrap.requestFullscreen();
      } else {
        document.exitFullscreen && document.exitFullscreen();
      }
    });
    document.addEventListener('fullscreenchange', () => {
      fsBtn.innerHTML = document.fullscreenElement === wrap ? icons.exitFs : icons.fullscreen;
      fsBtn.title = document.fullscreenElement === wrap ? 'Exit fullscreen' : 'Fullscreen';
    });
    ctrl.appendChild(fsBtn);

    // ── Open in Archgram ──
    ctrl.appendChild(makeBtn(icons.archgram, 'Open in Archgram.io', () => {
      if (mermaidSrc) {
        navigator.clipboard.writeText(mermaidSrc).catch(() => {});
      }
      window.open('https://archgram.io/editor', '_blank', 'noopener');
      showToast('Diagram code copied — paste it in Archgram editor');
    }));

    wrap.appendChild(ctrl);
  }

  // ─── Observe each wrap for SVG insertion ─────────────────────────────────
  function watchWrap(wrap) {
    // Already has SVG?
    if (wrap.querySelector('svg')) { addControls(wrap); return; }
    const obs = new MutationObserver(() => {
      if (wrap.querySelector('svg')) {
        obs.disconnect();
        addControls(wrap);
      }
    });
    obs.observe(wrap, { childList: true, subtree: true });
  }

  // ─── Entrypoint ───────────────────────────────────────────────────────────
  function init() {
    // Capture mermaid source text before Mermaid overwrites it
    document.querySelectorAll('pre.mermaid').forEach(pre => {
      if (!pre.dataset.mermaidSrc) pre.dataset.mermaidSrc = pre.textContent.trim();
    });
    document.querySelectorAll('.diagram-wrap').forEach(watchWrap);
    // Fallback after 3 s for any stragglers
    setTimeout(() => {
      document.querySelectorAll('.diagram-wrap').forEach(addControls);
    }, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
