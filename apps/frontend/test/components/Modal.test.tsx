import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Modal } from '@/components/ui/Modal';

beforeAll(() => {
  const proto = HTMLDialogElement.prototype as any;
  proto.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  proto.close = function (this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

function Harness({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      {open && (
        <Modal
          labelledBy="t"
          onClose={() => {
            onClose?.();
            setOpen(false);
          }}
        >
          <h2 id="t">Invitar candidato</h2>
          <button aria-label="Cerrar" onClick={() => setOpen(false)}>
            ✕
          </button>
        </Modal>
      )}
    </>
  );
}

describe('Modal', () => {
  it('abre con showModal() y queda nombrado por su título', () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Abrir'));
    const dialog = document.querySelector('dialog')!;
    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveAccessibleName('Invitar candidato');
    expect(dialog).not.toHaveAttribute('role');
    expect(dialog).not.toHaveAttribute('aria-modal');
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('llama onClose cuando el navegador cierra el diálogo (Esc)', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    fireEvent.click(screen.getByText('Abrir'));
    act(() => document.querySelector('dialog')!.close());
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.querySelector('dialog')).toBeNull();
  });

  it('cierra el diálogo antes de desmontarse sin volver a llamar onClose', () => {
    const onClose = vi.fn();
    const closeSpy = vi.spyOn(HTMLDialogElement.prototype, 'close');
    render(<Harness onClose={onClose} />);
    fireEvent.click(screen.getByText('Abrir'));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(closeSpy).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(document.querySelector('dialog')).toBeNull();
    closeSpy.mockRestore();
  });
});
