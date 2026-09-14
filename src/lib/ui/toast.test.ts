import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { dismissToast, showToast, toasts } from './toast';

describe('toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    toasts.set([]);
  });

  it('adiciona e remove uma notificação', () => {
    const id = showToast('Tarefa criada.', 'success');
    expect(get(toasts)).toEqual([expect.objectContaining({ id, message: 'Tarefa criada.', kind: 'success' })]);

    dismissToast(id);
    expect(get(toasts)).toEqual([]);
  });
});
