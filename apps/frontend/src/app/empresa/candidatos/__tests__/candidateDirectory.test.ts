import { describe, expect, it } from 'vitest';
import {
  buildFavoriteMap,
  buildTalentDirectory,
  filterTalentCandidates,
} from '../candidateDirectory';

const results = [
  {
    id: 'r1',
    user_id: 'candidate-1',
    participant_name: 'Ana QA',
    participant_email: 'ana@example.com',
    exam_type: 'istqb',
    percentage: 82,
    passed: true,
    created_at: '2026-06-20T10:00:00Z',
  },
  {
    id: 'r2',
    user_id: 'candidate-1',
    participant_name: 'Ana QA',
    participant_email: 'ana@example.com',
    exam_type: 'performance',
    percentage: 91,
    passed: true,
    created_at: '2026-06-21T10:00:00Z',
  },
  {
    id: 'r3',
    user_id: 'candidate-2',
    participant_name: 'Bruno QA',
    participant_email: 'bruno@example.com',
    exam_type: 'git',
    percentage: 99,
    passed: true,
    created_at: '2026-06-22T10:00:00Z',
  },
];

describe('candidate talent directory', () => {
  it('only includes candidates who opted into empresa visibility', () => {
    const directory = buildTalentDirectory(
      results,
      [
        {
          id: 'candidate-1',
          display_name: 'Ana Testing',
          email: 'ana@example.com',
          role: 'QA Automation',
          country: 'PY',
          disponibilidad: 'activo',
          qa_skills: ['Selenium', 'API Testing'],
          open_to_work: true,
          talent_visible_to_empresas: true,
        },
        {
          id: 'candidate-2',
          display_name: 'Bruno Testing',
          email: 'bruno@example.com',
          open_to_work: true,
          talent_visible_to_empresas: false,
        },
      ],
      []
    );

    expect(directory).toHaveLength(1);
    expect(directory[0]).toMatchObject({
      userId: 'candidate-1',
      name: 'Ana Testing',
      bestScore: 91,
      bestExamType: 'performance',
      passedAssessments: 2,
      totalAssessments: 2,
      disponibilidad: 'activo',
      qaSkills: ['Selenium', 'API Testing'],
    });
    expect('email' in directory[0]).toBe(false);
  });

  it('attaches favorite state by candidate id', () => {
    const favorites = [
      {
        id: 'fav-1',
        candidate_id: 'candidate-1',
        notes: 'Buen perfil API',
        created_at: '2026-06-23T10:00:00Z',
      },
    ];
    const map = buildFavoriteMap(favorites);
    const directory = buildTalentDirectory(
      results.slice(0, 1),
      [
        {
          id: 'candidate-1',
          display_name: 'Ana Testing',
          email: 'ana@example.com',
          talent_visible_to_empresas: true,
        },
      ],
      favorites
    );

    expect(map.get('candidate-1')?.id).toBe('fav-1');
    expect(directory[0].favoriteId).toBe('fav-1');
    expect(directory[0].favoriteNotes).toBe('Buen perfil API');
  });

  it('filters by availability, country, ISTQB level and skills', () => {
    const directory = buildTalentDirectory(
      results,
      [
        {
          id: 'candidate-1',
          display_name: 'Ana Testing',
          country: 'PY',
          istqb_level: 'ctfl',
          disponibilidad: 'activo',
          qa_skills: ['Selenium', 'Postman'],
          talent_visible_to_empresas: true,
        },
        {
          id: 'candidate-2',
          display_name: 'Bruno Testing',
          country: 'UY',
          istqb_level: 'expert',
          disponibilidad: 'pasivo',
          qa_skills: ['JMeter'],
          talent_visible_to_empresas: true,
        },
      ],
      []
    );

    const filtered = filterTalentCandidates(directory, {
      availability: 'activo',
      country: 'PY',
      istqbLevel: 'ctfl',
      skills: ['Postman'],
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].userId).toBe('candidate-1');
  });
});
