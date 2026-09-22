import { describe, it, expect } from 'vitest';
import {
  PY_TESTING_FEST_2026,
  isEventPromoVisible,
} from '@/lib/events/py-testing-fest-2026';

const at = (iso: string) => new Date(iso).getTime();

describe('isEventPromoVisible', () => {
  it('muestra el promo antes del evento', () => {
    expect(isEventPromoVisible(at('2026-09-01T12:00:00-03:00'))).toBe(true);
  });

  it('muestra el promo el mismo día del evento', () => {
    expect(isEventPromoVisible(at('2026-09-26T18:00:00-03:00'))).toBe(true);
  });

  it('oculta el promo una vez pasado el evento', () => {
    expect(isEventPromoVisible(at('2026-09-28T09:00:00-03:00'))).toBe(false);
  });
});

describe('PY_TESTING_FEST_2026', () => {
  it('apunta al formulario de inscripción', () => {
    expect(PY_TESTING_FEST_2026.registrationUrl).toBe(
      'https://forms.gle/sEHRrBRMZX8x86V98'
    );
  });

  it('tiene las seis charlas numeradas del 1 al 6', () => {
    expect(PY_TESTING_FEST_2026.speakers).toHaveLength(6);
    expect(PY_TESTING_FEST_2026.speakers.map((s) => s.order)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
  });

  it('usa imágenes locales del evento con alt descriptivo', () => {
    for (const speaker of PY_TESTING_FEST_2026.speakers) {
      expect(
        speaker.image.startsWith('/images/eventos/py-testing-fest-2026/')
      ).toBe(true);
      expect(speaker.imageAlt.length).toBeGreaterThan(0);
    }
  });

  it('oculta el promo después de la fecha del evento', () => {
    expect(
      new Date(PY_TESTING_FEST_2026.hidePromoAfter).getTime()
    ).toBeGreaterThan(new Date(PY_TESTING_FEST_2026.startsAt).getTime());
  });
});
