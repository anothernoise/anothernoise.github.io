/**
 * mermaid-theme.js — shared Mermaid initialiser with dark/light theme support.
 * Imported as <script type="module" src="mermaid-theme.js"> from every article.
 *
 * • Reads the current data-theme attribute on <html> at render time
 * • Automatically re-renders all diagrams when the user toggles the theme
 * • Captures the original mermaid source before first render (used for re-render)
 */
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

// ── Theme variable sets ──────────────────────────────────────────────────────
const DARK_VARS = {
  primaryColor: '#1e3a5f',
  primaryTextColor: '#c9d4e0',
  primaryBorderColor: '#2d5a8e',
  lineColor: '#4a7aaa',
  secondaryColor: '#0d1f35',
  tertiaryColor: '#0a1628',
  background: '#090d1b',
  mainBkg: '#0d1f35',
  nodeBorder: '#2d5a8e',
  clusterBkg: '#0a1628',
  titleColor: '#d4a540',
  edgeLabelBackground: '#0d1f35',
  fontFamily: 'Inter, sans-serif',
  fontSize: '14px'
};

const LIGHT_VARS = {
  primaryColor: '#dbeafe',
  primaryTextColor: '#1e3a5f',
  primaryBorderColor: '#3b82f6',
  lineColor: '#2563eb',
  secondaryColor: '#eff6ff',
  tertiaryColor: '#f8faff',
  background: '#ffffff',
  mainBkg: '#eff6ff',
  nodeBorder: '#3b82f6',
  clusterBkg: '#dbeafe',
  titleColor: '#1d4ed8',
  edgeLabelBackground: '#f0f9ff',
  fontFamily: 'Inter, sans-serif',
  fontSize: '14px',
  edgeLabelBackground: '#eff6ff'
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function isDark() {
  return document.documentElement.getAttribute('data-theme') !== 'light';
}

// ── Main render function ─────────────────────────────────────────────────────
async function renderDiagrams() {
  // Restore original source in all already-processed diagrams
  document.querySelectorAll('pre.mermaid[data-processed]').forEach(pre => {
    const src = pre.dataset.mermaidSrc;
    if (src) {
      pre.textContent = src;           // clears SVG, restores original code
      pre.removeAttribute('data-processed');
    }
  });

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: isDark() ? 'dark' : 'base',
    themeVariables: isDark() ? DARK_VARS : LIGHT_VARS
  });

  try {
    await mermaid.run({ querySelector: 'pre.mermaid:not([data-processed])' });
  } catch (e) {
    // Silently absorb render errors (parse issues in individual diagrams)
  }
}

// ── Boot ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Capture source before first render (diagram-controls.js may also do this — no conflict)
  document.querySelectorAll('pre.mermaid').forEach(pre => {
    if (!pre.dataset.mermaidSrc) {
      pre.dataset.mermaidSrc = pre.textContent.trim();
    }
  });
  renderDiagrams();
});

// Re-render whenever the theme toggles
new MutationObserver(renderDiagrams)
  .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
