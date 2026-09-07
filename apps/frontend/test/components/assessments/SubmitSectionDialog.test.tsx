import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubmitSectionDialog from '@/app/assessments/_shared/components/SubmitSectionDialog';

const baseProps = {
  open: true,
  unansweredCount: 0,
  totalQuestions: 5,
  isLastSection: false,
  isSubmitting: false,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
};

describe('SubmitSectionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no renderiza nada cuando está cerrado', () => {
    render(<SubmitSectionDialog {...baseProps} open={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('expone role dialog, aria-modal y está etiquetado', () => {
    render(<SubmitSectionDialog {...baseProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('¿Enviar este nivel?');
  });

  it('avisa que el envío es irreversible', () => {
    render(<SubmitSectionDialog {...baseProps} />);

    expect(
      screen.getByText(/no vas a poder volver a editarlo/i)
    ).toBeInTheDocument();
  });

  it('cuenta las preguntas sin responder en plural', () => {
    render(<SubmitSectionDialog {...baseProps} unansweredCount={3} />);

    expect(
      screen.getByText(/quedan 3 preguntas sin responder/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/se van a corregir como incorrectas/i)
    ).toBeInTheDocument();
  });

  it('usa el singular cuando queda una sola sin responder', () => {
    render(<SubmitSectionDialog {...baseProps} unansweredCount={1} />);

    expect(
      screen.getByText(/queda 1 pregunta sin responder/i)
    ).toBeInTheDocument();
  });

  it('confirma que están todas respondidas cuando no falta ninguna', () => {
    render(<SubmitSectionDialog {...baseProps} unansweredCount={0} />);

    expect(
      screen.getByText('Respondiste las 5 preguntas de este nivel.')
    ).toBeInTheDocument();
    expect(screen.queryByText(/sin responder/i)).not.toBeInTheDocument();
  });

  it('cambia el texto en la última sección', () => {
    render(<SubmitSectionDialog {...baseProps} isLastSection />);

    expect(screen.getByRole('dialog')).toHaveAccessibleName(
      '¿Finalizar el assessment?'
    );
    expect(
      screen.getByRole('button', { name: 'Finalizar assessment' })
    ).toBeInTheDocument();
  });

  // El foco arranca en la accion segura, no en la irreversible: un Enter
  // reflejo al abrirse el dialogo no debe enviar la seccion.
  it('pone el foco inicial en "Seguir revisando"', () => {
    render(<SubmitSectionDialog {...baseProps} />);

    expect(
      screen.getByRole('button', { name: 'Seguir revisando' })
    ).toHaveFocus();
  });

  it('cancela con Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<SubmitSectionDialog {...baseProps} onCancel={onCancel} />);

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('atrapa el foco dentro del diálogo', async () => {
    const user = userEvent.setup();
    render(<SubmitSectionDialog {...baseProps} />);

    const cancel = screen.getByRole('button', { name: 'Seguir revisando' });
    const confirm = screen.getByRole('button', { name: 'Enviar y continuar' });

    expect(cancel).toHaveFocus();
    await user.tab();
    expect(confirm).toHaveFocus();
    // al llegar al final vuelve al principio en vez de escaparse a la pagina
    await user.tab();
    expect(cancel).toHaveFocus();
  });

  it('envía solo cuando se confirma', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<SubmitSectionDialog {...baseProps} onConfirm={onConfirm} />);

    expect(onConfirm).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole('button', { name: 'Enviar y continuar' })
    );
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('deshabilita ambos botones mientras se envía', () => {
    render(<SubmitSectionDialog {...baseProps} isSubmitting />);

    expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Seguir revisando' })
    ).toBeDisabled();
  });
});
