export function focusTrap(node: HTMLElement) {
  const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const selector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function keepFocus(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    const items = [...node.querySelectorAll<HTMLElement>(selector)].filter((item) => !item.hidden);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  node.addEventListener('keydown', keepFocus);
  queueMicrotask(() => node.querySelector<HTMLElement>(selector)?.focus());
  return {
    destroy() {
      node.removeEventListener('keydown', keepFocus);
      previousFocus?.focus();
    },
  };
}
