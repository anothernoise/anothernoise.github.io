import test from 'node:test';
import assert from 'node:assert';

// Minimal DOM mock setup
const createMockElement = (tagName = 'div') => {
  const attributes = new Map();
  const listeners = {};
  const classList = {
    classes: new Set(),
    add(c) { this.classes.add(c); },
    remove(c) { this.classes.delete(c); },
    contains(c) { return this.classes.has(c); },
    toggle(c) {
      if (this.classes.has(c)) {
        this.classes.delete(c);
        return false;
      }
      this.classes.add(c);
      return true;
    }
  };
  
  return {
    tagName: tagName.toUpperCase(),
    classList,
    attributes,
    setAttribute(name, val) { this.attributes.set(name, val); },
    getAttribute(name) { return this.attributes.get(name); },
    listeners,
    addEventListener(event, fn) {
      this.listeners[event] = this.listeners[event] || [];
      this.listeners[event].push(fn);
    },
    dispatchEvent(eventName) {
      if (this.listeners[eventName]) {
        this.listeners[eventName].forEach(fn => fn({ preventDefault: () => {} }));
      }
    },
    // Dialog properties
    open: false,
    showModal() { this.open = true; },
    close() { this.open = false; }
  };
};

const mockLocalStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); }
};

// Initialize environment
global.window = { localStorage: mockLocalStorage };
global.localStorage = mockLocalStorage;

const docElements = {
  documentElement: createMockElement('html'),
  body: createMockElement('body')
};

global.document = {
  documentElement: docElements.documentElement,
  body: docElements.body,
  registry: {},
  querySelector(selector) {
    return this.registry[selector] || null;
  },
  querySelectorAll(selector) {
    return this.registry[selector] || [];
  }
};

// Now import target files (they are currently empty or non-existent, causing test failure)
import { initTheme, toggleTheme } from './theme.js';
import { initTabs } from './tabs.js';
import { initDialog } from './dialog.js';

test('Theme Toggle Suite', async (t) => {
  await t.test('initTheme should read from localStorage and set data-theme', () => {
    localStorage.store = {};
    docElements.documentElement.attributes.clear();
    
    initTheme();
    // Default theme should be dark if storage is empty
    assert.strictEqual(docElements.documentElement.getAttribute('data-theme'), 'dark');
    
    // Set dark theme in storage
    localStorage.setItem('theme', 'dark');
    initTheme();
    assert.strictEqual(docElements.documentElement.getAttribute('data-theme'), 'dark');
  });

  await t.test('toggleTheme should swap data-theme and persist to localStorage', () => {
    localStorage.setItem('theme', 'light');
    initTheme();
    
    toggleTheme();
    assert.strictEqual(docElements.documentElement.getAttribute('data-theme'), 'dark');
    assert.strictEqual(localStorage.getItem('theme'), 'dark');
    
    toggleTheme();
    assert.strictEqual(docElements.documentElement.getAttribute('data-theme'), 'light');
    assert.strictEqual(localStorage.getItem('theme'), 'light');
  });
});

test('Tabs Control Suite', async (t) => {
  await t.test('initTabs should wire up buttons and update active classes', () => {
    const tab1Btn = createMockElement('button');
    const tab2Btn = createMockElement('button');
    const tab1Content = createMockElement('pre');
    const tab2Content = createMockElement('pre');
    
    tab1Btn.getAttribute = (name) => name === 'data-tab' ? 'scala' : null;
    tab2Btn.getAttribute = (name) => name === 'data-tab' ? 'python' : null;
    tab1Content.getAttribute = (name) => name === 'id' ? 'scala-code' : null;
    tab2Content.getAttribute = (name) => name === 'id' ? 'python-code' : null;
    
    // Register query elements
    document.registry['.tab-btn'] = [tab1Btn, tab2Btn];
    document.registry['.tab-content'] = [tab1Content, tab2Content];
    
    initTabs();
    
    // Trigger click on second tab
    tab2Btn.dispatchEvent('click');
    
    // Tab 2 button should have active class, Tab 1 should not
    assert.ok(tab2Btn.classList.contains('active'));
    assert.ok(!tab1Btn.classList.contains('active'));
    
    // Tab 2 content should have active class, Tab 1 should not
    assert.ok(tab2Content.classList.contains('active'));
    assert.ok(!tab1Content.classList.contains('active'));
  });
});

test('Dialog Modal Suite', async (t) => {
  await t.test('initDialog should open and close dialog correctly', () => {
    const dialog = createMockElement('dialog');
    const openBtn = createMockElement('button');
    const closeBtn = createMockElement('button');
    
    document.registry['#contact-dialog'] = dialog;
    document.registry['#open-contact-btn'] = openBtn;
    document.registry['#close-contact-btn'] = closeBtn;
    
    initDialog();
    
    // Dialog should start closed
    assert.strictEqual(dialog.open, false);
    
    // Click open button
    openBtn.dispatchEvent('click');
    assert.strictEqual(dialog.open, true);
    
    // Click close button
    closeBtn.dispatchEvent('click');
    assert.strictEqual(dialog.open, false);
  });
});
