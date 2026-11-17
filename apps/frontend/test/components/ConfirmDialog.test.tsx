import { act, render, screen, fireEvent } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { ConfirmProvider, useConfirm } from '@/components/ui/ConfirmDialog';

// jsdom no implementa showModal()/close() ni el envío de <form method="dialog">.
// Emulamos lo mínimo: abrir, y que un submit cierre con el value del botón.
beforeAll(() => {
  const proto = HTMLDialogElement.prototype as any;
  proto.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.close = function (this: HTMLDialogElement, value?: string) {
    if (!this.hasAttribute('open')) return;
    if (value !== undefined) this.returnValue = value;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
  document.addEventListener('submit', (e) => {
    const form = e.target as HTMLFormElement;
    if (form.getAttribute('method') !== 'dialog') return;
    e.preventDefault();
    const submitter = (e as SubmitEvent).submitter as HTMLButtonElement | null;
    (form.closest('dialog') as HTMLDialogElement).close(submitter?.value ?? '');
  });
});

function Harness({ onResult }: { onResult: (v: boolean) => void }) {
  const confirm = useConfirm();
  return (
    <button
      onClick={async () =>
        onResult(
          await confirm({
            title: '¿Eliminar esta pregunta?',
            description: 'No se puede deshacer.',
            confirmLabel: 'Eliminar',
          })
        )
      }
    >
      Abrir
    </button>
  );
}

function setup() {
  const onResult = vi.fn();
  render(
    <ConfirmProvider>
      <Harness onResult={onResult} />
    </ConfirmProvider>
  );
  fireEvent.click(screen.getByText('Abrir'));
  return { onResult, dialog: document.querySelector('dialog')! };
}

describe('ConfirmDialog', () => {
  it('abre un <dialog> modal con nombre y descripción accesibles', async () => {
    const { dialog } = setup();
    await act(async () => {});
    expect(dialog).toHaveAttribute('open');
    expect(dialog).not.toHaveAttribute('role');
    expect(dialog).not.toHaveAttribute('aria-modal');
    expect(dialog).toHaveAccessibleName('¿Eliminar esta pregunta?');
    expect(dialog).toHaveAccessibleDescription('No se puede deshacer.');
    expect(dialog).toHaveAttribute('closedby', 'any');
  });

  it('pone el foco inicial en la acción segura', async () => {
    setup();
    await act(async () => {});
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
  });

  it('resuelve true al confirmar', async () => {
    const { onResult, dialog } = setup();
    await act(async () => {});
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    });
    expect(onResult).toHaveBeenCalledWith(true);
    expect(dialog).not.toHaveAttribute('open');
    expect(dialog.returnValue).toBe('');
  });

  it('resuelve false al cancelar', async () => {
    const { onResult } = setup();
    await act(async () => {});
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    });
    expect(onResult).toHaveBeenCalledWith(false);
  });

  it('resuelve false al cerrar con Esc / clic fuera (sin returnValue)', async () => {
    const { onResult, dialog } = setup();
    await act(async () => {});
    await act(async () => {
      dialog.close();
    });
    expect(onResult).toHaveBeenCalledWith(false);
  });

  it('sin provider cae en window.confirm', async () => {
    const spy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onResult = vi.fn();
    render(<Harness onResult={onResult} />);
    await act(async () => {
      fireEvent.click(screen.getByText('Abrir'));
    });
    expect(spy).toHaveBeenCalledWith(
      '¿Eliminar esta pregunta?\n\nNo se puede deshacer.'
    );
    expect(onResult).toHaveBeenCalledWith(true);
    spy.mockRestore();
  });
});
