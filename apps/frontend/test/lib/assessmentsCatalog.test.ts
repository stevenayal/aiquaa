import { describe, it, expect } from 'vitest';
import {
  assessmentCategories,
  allAssessments,
  featuredAssessments,
  assessmentCount,
} from '@/lib/assessmentsCatalog';
import { ASSESSMENT_REGISTRY } from '@/app/assessments/_shared/registry';

describe('catálogo de assessments', () => {
  it('no deja ninguna evaluación fuera del catálogo', () => {
    // P0-3 fue exactamente esto: cicd, kubernetes-helm y observability tenían
    // páginas, registry, seed y scoring completos pero no figuraban en ningún
    // catálogo, así que solo se llegaba tipeando la URL. Este test hace que
    // volver a olvidarse de una rompa la suite en vez de pasar inadvertido.
    const enCatalogo = new Set(allAssessments.map((e) => e.definition.slug));
    const enRegistry = Object.keys(ASSESSMENT_REGISTRY);

    const faltantes = enRegistry.filter((slug) => !enCatalogo.has(slug));
    expect(faltantes).toEqual([]);
  });

  it('no repite una evaluación en dos categorías', () => {
    const slugs = allAssessments.map((e) => e.definition.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('expone el conteo real', () => {
    expect(assessmentCount).toBe(allAssessments.length);
    expect(assessmentCount).toBeGreaterThan(0);
  });

  it('tiene destacados, pero pocos', () => {
    // Ley de Hick: una franja de "destacados" que destaca todo no destaca nada.
    expect(featuredAssessments.length).toBeGreaterThan(0);
    expect(featuredAssessments.length).toBeLessThanOrEqual(4);
  });

  it('ninguna categoría queda vacía', () => {
    for (const category of assessmentCategories) {
      expect(category.assessments.length).toBeGreaterThan(0);
    }
  });

  it('cada categoría tiene id único, nombre y descripción', () => {
    const ids = assessmentCategories.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const category of assessmentCategories) {
      expect(category.name.trim()).not.toBe('');
      expect(category.description.trim()).not.toBe('');
    }
  });

  it('cada evaluación trae los datos que la tarjeta muestra', () => {
    for (const { definition, icon } of allAssessments) {
      expect(definition.slug).toBeTruthy();
      expect(definition.title).toBeTruthy();
      expect(definition.description).toBeTruthy();
      expect(definition.level).toBeTruthy();
      expect(definition.duration_minutes).toBeGreaterThan(0);
      expect(definition.total_score).toBeGreaterThan(0);
      expect(icon).toBeTruthy();
    }
  });
});
