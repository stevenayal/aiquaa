import { describe, expect, it } from 'vitest';
import { stripBase64FromBugs } from '../metadata';
import type { BugReport } from '../types';

describe('test-app report metadata', () => {
  it('removes base64 image payloads before persisting exam metadata', () => {
    const bugs: BugReport[] = [
      {
        id: 'bug-1',
        title: 'Checkout error',
        description: 'Fails on submit',
        stepsToReproduce: ['Open checkout'],
        expectedResult: 'Order is created',
        actualResult: 'Error',
        severity: 'High',
        category: 'Checkout',
        evidence: '',
        foundAt: new Date('2026-07-10T00:00:00Z'),
        images: [
          {
            id: 'img-1',
            fileName: 'evidence.png',
            base64Data: 'data:image/png;base64,abc123',
            mimeType: 'image/png',
            size: 123,
            uploadedAt: new Date('2026-07-10T00:00:00Z'),
          },
        ],
      },
    ];

    const [bug] = stripBase64FromBugs(bugs);

    expect(bug.images[0]).toMatchObject({
      id: 'img-1',
      fileName: 'evidence.png',
      mimeType: 'image/png',
      size: 123,
    });
    expect(bug.images[0]).not.toHaveProperty('base64Data');
  });
});
